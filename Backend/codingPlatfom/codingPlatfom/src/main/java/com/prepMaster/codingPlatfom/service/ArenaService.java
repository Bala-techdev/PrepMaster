package com.prepMaster.codingPlatfom.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.request.CodeExecutionRequest;
import com.prepMaster.codingPlatfom.dto.response.ArenaResponses.ArenaOverview;
import com.prepMaster.codingPlatfom.dto.response.ArenaResponses.Execution;
import com.prepMaster.codingPlatfom.dto.response.ArenaResponses.Recommendation;
import com.prepMaster.codingPlatfom.dto.response.ArenaResponses.Submission;
import com.prepMaster.codingPlatfom.entity.CodeSubmission;
import com.prepMaster.codingPlatfom.entity.DSAQuestion;
import com.prepMaster.codingPlatfom.entity.User;
import com.prepMaster.codingPlatfom.entity.UserActivity;
import com.prepMaster.codingPlatfom.entity.UserProgress;
import com.prepMaster.codingPlatfom.entity.enums.Difficulty;
import com.prepMaster.codingPlatfom.exception.BusinessRuleException;
import com.prepMaster.codingPlatfom.exception.ResourceNotFoundException;
import com.prepMaster.codingPlatfom.repository.CodeSubmissionRepository;
import com.prepMaster.codingPlatfom.repository.DSAQuestionRepository;
import com.prepMaster.codingPlatfom.repository.ResumeScanRepository;
import com.prepMaster.codingPlatfom.repository.UserActivityRepository;
import com.prepMaster.codingPlatfom.repository.UserProgressRepository;

@Service
@Transactional
public class ArenaService {

	private final DSAQuestionRepository questions;
	private final CodeSubmissionRepository submissions;
	private final ResumeScanRepository scans;
	private final UserActivityRepository activity;
	private final UserProgressRepository progress;
	private final UserService users;
	private final UserStreakService streaks;
	private final AchievementService achievements;
	private final LeaderboardCacheService leaderboardCache;
	private final String dockerCommand;
	private final long timeoutMs;

	public ArenaService(DSAQuestionRepository questions, CodeSubmissionRepository submissions,
			ResumeScanRepository scans, UserActivityRepository activity, UserProgressRepository progress,
			UserService users, UserStreakService streaks, AchievementService achievements,
			LeaderboardCacheService leaderboardCache,
			@Value("${app.arena.docker-command:docker}") String dockerCommand,
			@Value("${app.arena.timeout-ms:5000}") long timeoutMs) {
		this.questions = questions;
		this.submissions = submissions;
		this.scans = scans;
		this.activity = activity;
		this.progress = progress;
		this.users = users;
		this.streaks = streaks;
		this.achievements = achievements;
		this.leaderboardCache = leaderboardCache;
		this.dockerCommand = dockerCommand;
		this.timeoutMs = timeoutMs;
	}

	@Transactional(readOnly = true)
	public Execution run(Long userId, Long questionId, CodeExecutionRequest request) {
		question(questionId);
		RunResult result = execute(request.language(), request.sourceCode(), request.input());
		return new Execution(result.status(), result.stdout(), result.stderr(), result.executionTimeMs(),
				"COMPLETED".equals(result.status()));
	}

	public Submission submit(Long userId, Long questionId, CodeExecutionRequest request) {
		User user = users.require(userId);
		DSAQuestion question = question(questionId);
		List<TestCase> testCases = testCases(question);
		if (testCases.isEmpty()) {
			throw new BusinessRuleException("This problem has no configured test cases");
		}

		long started = System.nanoTime();
		StringBuilder stdout = new StringBuilder();
		StringBuilder stderr = new StringBuilder();
		boolean passed = true;
		String status = "ACCEPTED";
		for (TestCase testCase : testCases) {
			RunResult result = execute(request.language(), request.sourceCode(), testCase.input());
			if (!result.stdout().isBlank()) {
				stdout.append(result.stdout()).append('\n');
			}
			if (!result.stderr().isBlank()) {
				stderr.append(result.stderr()).append('\n');
			}
			if (!"COMPLETED".equals(result.status())
					|| !normalize(result.stdout()).equals(normalize(testCase.expectedOutput()))) {
				passed = false;
				status = result.status().equals("COMPLETED") ? "WRONG_ANSWER" : result.status();
				break;
			}
		}

		int xp = passed && !submissions.existsByUserIdAndQuestionIdAndPassedTrue(userId, questionId)
				? awardXp(user, question) : 0;
		CodeSubmission saved = submissions.save(new CodeSubmission(user, question, normalizeLanguage(request.language()),
				request.sourceCode(), status, stdout.toString(), stderr.toString(),
				TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started), passed, xp));
		return submission(saved);
	}

	@Transactional(readOnly = true)
	public List<Submission> submissions(Long userId) {
		users.require(userId);
		return submissions.findTop20ByUserIdOrderByCreatedAtDesc(userId).stream().map(this::submission).toList();
	}

	@Transactional(readOnly = true)
	public ArenaOverview overview(Long userId) {
		User user = users.require(userId);
		UserProgress userProgress = progress.findByUserId(userId).orElse(null);
		long solved = submissions.countDistinctPassedQuestions(userId);
		List<Recommendation> recommendations = recommendations(userId);
		int level = userProgress == null ? 1 : userProgress.getCurrentLevel();
		int streak = user.getStreak() == null ? 0 : user.getStreak().getCurrentStreak();
		return new ArenaOverview(userProgress == null ? 0 : userProgress.getTotalXp(), level, levelName(level),
				streak, solved, recommendations);
	}

	private List<Recommendation> recommendations(Long userId) {
		String missing = scans.findTop50ByUserIdOrderByCreatedAtDesc(userId).stream()
				.findFirst().map(scan -> scan.getMissingSkills()).orElse("");
		List<DSAQuestion> catalog = questions.findAllActiveForInterview();
		return catalog.stream()
				.filter(question -> missing.isBlank() || containsGap(question, missing))
				.sorted(Comparator.comparing(DSAQuestion::getDifficulty).thenComparing(DSAQuestion::getId))
				.limit(6)
				.map(question -> new Recommendation(question.getId(), question.getTitle(),
						question.getTopic().getName(), question.getDifficulty().name(),
						missing.isBlank() ? "Build consistency with the core catalog" : "Targets an identified resume skill gap"))
				.toList();
	}

	private boolean containsGap(DSAQuestion question, String missing) {
		String haystack = (question.getTitle() + " " + question.getDescription() + " "
				+ question.getTopic().getName()).toLowerCase(Locale.ROOT);
		return Stream.of(missing.split("\\|")).map(String::trim).filter(value -> !value.isBlank())
				.anyMatch(value -> haystack.contains(value.toLowerCase(Locale.ROOT)));
	}

	private int awardXp(User user, DSAQuestion question) {
		int xp = switch (question.getDifficulty()) {
		case EASY -> 10;
		case MEDIUM -> 25;
		case HARD -> 50;
		};
		long newXp = progress.findByUserId(user.getId()).orElseGet(() -> progress.save(new UserProgress(user))).getTotalXp()
				+ xp;
		UserProgress row = progress.findByUserId(user.getId()).orElseThrow();
		row.award(xp, GamificationService.levelFor(newXp));
		ZoneId zone = ZoneId.of(user.getSettings().getTimezone());
		LocalDate date = LocalDate.now(zone);
		UserActivity userActivity = activity.findByUserIdAndActivityDate(user.getId(), date)
				.orElseGet(() -> activity.save(new UserActivity(user, date)));
		userActivity.record(xp);
		streaks.recordActivity(user.getId(), date);
		leaderboardCache.recordXp(user.getId(), row.getTotalXp(), date);
		achievements.evaluateAndAward(user.getId());
		return xp;
	}

	private DSAQuestion question(Long questionId) {
		return questions.findByIdAndActiveTrue(questionId)
				.orElseThrow(() -> new ResourceNotFoundException("Question not found: " + questionId));
	}

	private List<TestCase> testCases(DSAQuestion question) {
		if (question.getTestCases() == null || question.getTestCases().isBlank()) {
			return List.of();
		}
		List<TestCase> result = new ArrayList<>();
		for (String rawCase : question.getTestCases().split("\\n---\\n")) {
			int separator = rawCase.indexOf("\n===\n");
			if (separator < 0) {
				throw new BusinessRuleException("Problem test cases must use input\\n===\\nexpected format");
			}
			result.add(new TestCase(rawCase.substring(0, separator), rawCase.substring(separator + 5)));
		}
		return result;
	}

	private RunResult execute(String language, String sourceCode, String input) {
		String normalizedLanguage = normalizeLanguage(language);
		Path directory = null;
		try {
			directory = Files.createTempDirectory("prepmaster-arena-");
			String fileName = normalizedLanguage.equals("JAVA") ? "Main.java"
					: normalizedLanguage.equals("CPP") ? "main.cpp"
							: normalizedLanguage.equals("PYTHON") ? "main.py" : "main.js";
			Files.writeString(directory.resolve(fileName), sourceCode, StandardCharsets.UTF_8);
			Files.writeString(directory.resolve("input.txt"), input == null ? "" : input, StandardCharsets.UTF_8);
			List<String> command = dockerArguments(normalizedLanguage, directory);
			long started = System.nanoTime();
			Process process = new ProcessBuilder(command).start();
			StreamCapture stdout = capture(process.getInputStream());
			StreamCapture stderr = capture(process.getErrorStream());
			if (!process.waitFor(timeoutMs, TimeUnit.MILLISECONDS)) {
				process.destroyForcibly();
				return new RunResult("TIME_LIMIT_EXCEEDED", stdout.value(), stderr.value(), timeoutMs);
			}
			stdout.awaitOutput();
			stderr.awaitOutput();
			String status = process.exitValue() == 0 ? "COMPLETED" : "RUNTIME_ERROR";
			return new RunResult(status, stdout.value(), stderr.value(),
					TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started));
		} catch (IOException exception) {
			throw new BusinessRuleException("Docker runner is unavailable: " + exception.getMessage());
		} catch (InterruptedException exception) {
			Thread.currentThread().interrupt();
			throw new BusinessRuleException("Code execution was interrupted");
		} finally {
			deleteDirectory(directory);
		}
	}

	private List<String> dockerArguments(String language, Path directory) {
		String image;
		String command;
		switch (language) {
		case "JAVA" -> {
			image = "eclipse-temurin:21-jdk";
			command = "javac Main.java && java Main < input.txt";
		}
		case "PYTHON" -> {
			image = "python:3.12-alpine";
			command = "python main.py < input.txt";
		}
		case "CPP" -> {
			image = "gcc:14";
			command = "g++ -std=c++20 -O2 -o main main.cpp && ./main < input.txt";
		}
		case "JAVASCRIPT" -> {
			image = "node:22-alpine";
			command = "node main.js < input.txt";
		}
		default -> throw new BusinessRuleException("Unsupported language: " + language);
		}
		return new ArrayList<>(List.of(dockerCommand, "run", "--rm", "--network", "none", "--cpus", "1",
				"--memory", "256m", "--pids-limit", "64", "--read-only", "--tmpfs",
				"/tmp:rw,noexec,nosuid,size=64m", "-v", directory.toAbsolutePath() + ":/workspace:rw", "-w",
				"/workspace", image, "sh", "-c", command));
	}

	private String normalizeLanguage(String language) {
		String value = language == null ? "" : language.trim().toUpperCase(Locale.ROOT);
		return switch (value) {
		case "JAVA", "PYTHON", "CPP", "C++", "JAVASCRIPT", "JS" -> value.equals("C++") ? "CPP"
				: value.equals("JS") ? "JAVASCRIPT" : value;
		default -> throw new BusinessRuleException("Unsupported language: " + value);
		};
	}

	private String normalize(String value) {
		return value == null ? "" : value.replace("\r\n", "\n").trim();
	}

	private Submission submission(CodeSubmission row) {
		return new Submission(row.getId(), row.getQuestion().getId(), row.getLanguage(), row.getStatus(),
				row.getStdout(), row.getStderr(), row.getExecutionTimeMs(), row.isPassed(), row.getXpAwarded(),
				row.getCreatedAt().toString());
	}

	private String levelName(int level) {
		return level < 5 ? "BEGINNER" : level < 10 ? "INTERMEDIATE" : level < 20 ? "ADVANCED" : "EXPERT";
	}

	private StreamCapture capture(java.io.InputStream stream) {
		StreamCapture capture = new StreamCapture(stream);
		capture.start();
		return capture;
	}

	private void deleteDirectory(Path directory) {
		if (directory == null) {
			return;
		}
		try (Stream<Path> paths = Files.walk(directory)) {
			paths.sorted(Comparator.reverseOrder()).forEach(path -> {
				try {
					Files.deleteIfExists(path);
				} catch (IOException exception) {
					// Temporary cleanup must not hide the execution result.
				}
			});
		} catch (IOException exception) {
			// Temporary cleanup must not hide the execution result.
		}
	}

	private record RunResult(String status, String stdout, String stderr, long executionTimeMs) {
	}

	private record TestCase(String input, String expectedOutput) {
	}

	private static final class StreamCapture extends Thread {
		private final java.io.InputStream stream;
		private final ByteArrayOutputStream output = new ByteArrayOutputStream();

		private StreamCapture(java.io.InputStream stream) {
			this.stream = stream;
		}

		@Override
		public void run() {
			try {
				stream.transferTo(output);
			} catch (IOException ignored) {
				// Process termination can close the stream while it is being read.
			}
		}

		private String value() {
			return output.toString(StandardCharsets.UTF_8);
		}

		private void awaitOutput() throws InterruptedException {
			join(1000);
		}
	}
}
