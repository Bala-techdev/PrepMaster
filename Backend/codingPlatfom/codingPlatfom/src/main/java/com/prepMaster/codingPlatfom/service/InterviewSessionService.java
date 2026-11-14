package com.prepMaster.codingPlatfom.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.request.SaveInterviewAnswerRequest;
import com.prepMaster.codingPlatfom.dto.request.StartInterviewSessionRequest;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.Answer;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.HistoryItem;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.Performance;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.Question;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.Result;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.Session;
import com.prepMaster.codingPlatfom.entity.DSAQuestion;
import com.prepMaster.codingPlatfom.entity.InterviewAnswer;
import com.prepMaster.codingPlatfom.entity.InterviewFocusEvent;
import com.prepMaster.codingPlatfom.entity.InterviewQuestion;
import com.prepMaster.codingPlatfom.entity.InterviewResult;
import com.prepMaster.codingPlatfom.entity.InterviewSession;
import com.prepMaster.codingPlatfom.entity.MockInterviewTemplate;
import com.prepMaster.codingPlatfom.entity.User;
import com.prepMaster.codingPlatfom.entity.enums.InterviewCategory;
import com.prepMaster.codingPlatfom.entity.enums.InterviewStatus;
import com.prepMaster.codingPlatfom.entity.enums.QuestionDifficulty;
import com.prepMaster.codingPlatfom.exception.BusinessRuleException;
import com.prepMaster.codingPlatfom.exception.ResourceNotFoundException;
import com.prepMaster.codingPlatfom.repository.DSAQuestionRepository;
import com.prepMaster.codingPlatfom.repository.InterviewAnswerRepository;
import com.prepMaster.codingPlatfom.repository.InterviewFocusEventRepository;
import com.prepMaster.codingPlatfom.repository.InterviewQuestionRepository;
import com.prepMaster.codingPlatfom.repository.InterviewResultRepository;
import com.prepMaster.codingPlatfom.repository.InterviewSessionRepository;
import com.prepMaster.codingPlatfom.util.TextNormalizer;

@Service
@Transactional
public class InterviewSessionService {

	public static final int QUESTION_COUNT = 5;
	private static final Set<String> FOCUS_EVENT_TYPES = Set.of("BLUR", "VISIBILITY_HIDDEN", "FOCUS_LOST");

	private final InterviewSessionRepository sessions;
	private final InterviewQuestionRepository questions;
	private final InterviewAnswerRepository answers;
	private final InterviewFocusEventRepository focusEvents;
	private final InterviewResultRepository results;
	private final DSAQuestionRepository dsaQuestions;
	private final MockInterviewService mockInterviews;
	private final InterviewResultService resultService;
	private final AchievementService achievements;
	private final NotificationService notifications;
	private final UserService users;

	public InterviewSessionService(InterviewSessionRepository sessions, InterviewQuestionRepository questions,
			InterviewAnswerRepository answers, InterviewFocusEventRepository focusEvents,
			InterviewResultRepository results, DSAQuestionRepository dsaQuestions,
			MockInterviewService mockInterviews, InterviewResultService resultService, AchievementService achievements,
			NotificationService notifications, UserService users) {
		this.sessions = sessions;
		this.questions = questions;
		this.answers = answers;
		this.focusEvents = focusEvents;
		this.results = results;
		this.dsaQuestions = dsaQuestions;
		this.mockInterviews = mockInterviews;
		this.resultService = resultService;
		this.achievements = achievements;
		this.notifications = notifications;
		this.users = users;
	}

	public Session start(Long userId, StartInterviewSessionRequest request) {
		MockInterviewTemplate template = mockInterviews.requireOwned(request.templateId(), userId);
		User user = users.require(userId);
		Instant now = Instant.now();

		for (InterviewSession existing : sessions.findByUserIdAndStatus(userId, InterviewStatus.IN_PROGRESS)) {
			if (existing.isExpiredAt(now)) {
				finalizeExpired(existing, now);
			} else {
				throw new BusinessRuleException(
						"You already have an interview in progress. Finish or cancel it before starting another.");
			}
		}

		Instant expiresAt = now.plus(template.getDurationMinutes(), ChronoUnit.MINUTES);
		InterviewSession session = sessions.save(new InterviewSession(user, template, QUESTION_COUNT, now, expiresAt,
				Boolean.TRUE.equals(request.focusMonitoringConsent())));
		assignQuestions(session, template);
		return toSession(session, now);
	}

	@Transactional
	public Session active(Long userId) {
		Instant now = Instant.now();
		for (InterviewSession session : sessions.findByUserIdAndStatus(userId, InterviewStatus.IN_PROGRESS)) {
			if (session.isExpiredAt(now)) {
				finalizeExpired(session, now);
			} else {
				return toSession(session, now);
			}
		}
		return null;
	}

	public Session get(Long userId, Long sessionId) {
		InterviewSession session = requireOwned(sessionId, userId);
		Instant now = Instant.now();
		finalizeExpired(session, now);
		return toSession(session, now);
	}

	public Question saveAnswer(Long userId, Long sessionId, Long questionId, SaveInterviewAnswerRequest request) {
		InterviewSession session = requireOwnedForUpdate(sessionId, userId);
		Instant now = Instant.now();
		if (session.isExpiredAt(now)) {
			finalizeExpired(session, now);
			throw new BusinessRuleException("This interview has expired and can no longer accept answers.");
		}
		if (!session.isOpen()) {
			throw new BusinessRuleException("This interview is no longer accepting answers.");
		}

		InterviewQuestion question = questions.findByIdAndSessionId(questionId, sessionId)
				.orElseThrow(() -> new ResourceNotFoundException("Interview question not found: " + questionId));
		InterviewAnswer answer = answers.findByQuestionId(questionId)
				.orElseGet(() -> new InterviewAnswer(session, question));

		String answerText = TextNormalizer.trimToNull(request.answerText());
		String codeText = TextNormalizer.trimToNull(request.codeText());
		boolean answered = Boolean.TRUE.equals(request.answered()) || answerText != null || codeText != null;
		answer.record(answerText, codeText, TextNormalizer.trimToNull(request.language()), answered);
		InterviewAnswer saved = answers.save(answer);
		return toQuestion(question, saved);
	}

	public Session updateFocusConsent(Long userId, Long sessionId, boolean consented) {
		InterviewSession session = requireOwnedForUpdate(sessionId, userId);
		if (!session.isOpen()) {
			throw new BusinessRuleException("Focus monitoring cannot be changed after the interview ends.");
		}
		session.changeFocusConsent(consented);
		return toSession(session, Instant.now());
	}

	public void recordFocusEvent(Long userId, Long sessionId, String eventType) {
		InterviewSession session = requireOwnedForUpdate(sessionId, userId);
		if (!session.isOpen() || !session.isFocusMonitoringConsented()) {
			return;
		}
		String normalized = eventType == null ? "" : eventType.trim().toUpperCase();
		if (!FOCUS_EVENT_TYPES.contains(normalized)) {
			throw new BusinessRuleException("Unsupported focus event type.");
		}
		focusEvents.save(new InterviewFocusEvent(session, normalized, Instant.now()));
		session.recordFocusLoss();
	}

	public Result complete(Long userId, Long sessionId) {
		InterviewSession session = requireOwnedForUpdate(sessionId, userId);
		if (session.getStatus() == InterviewStatus.CANCELLED) {
			throw new BusinessRuleException("A cancelled interview cannot be completed.");
		}
		if (session.getStatus() == InterviewStatus.COMPLETED || session.getStatus() == InterviewStatus.EXPIRED) {
			InterviewResult existing = results.findBySessionId(sessionId)
					.orElseGet(() -> resultService.generate(session));
			afterFinished(session, existing);
			return toResult(session);
		}

		Instant now = Instant.now();
		if (!now.isBefore(session.getExpiresAt())) {
			session.expire(session.getExpiresAt());
		} else {
			session.complete(now);
		}
		InterviewResult result = results.findBySessionId(sessionId).orElseGet(() -> resultService.generate(session));
		afterFinished(session, result);
		return toResult(session);
	}

	public Session cancel(Long userId, Long sessionId) {
		InterviewSession session = requireOwnedForUpdate(sessionId, userId);
		if (session.getStatus() == InterviewStatus.CANCELLED) {
			return toSession(session, Instant.now());
		}
		if (session.getStatus() != InterviewStatus.IN_PROGRESS) {
			throw new BusinessRuleException("Only an in-progress interview can be cancelled.");
		}
		session.cancel(Instant.now());
		return toSession(session, Instant.now());
	}

	public Result result(Long userId, Long sessionId) {
		InterviewSession session = requireOwned(sessionId, userId);
		Instant now = Instant.now();
		finalizeExpired(session, now);
		if (session.getStatus() == InterviewStatus.CANCELLED) {
			throw new BusinessRuleException("A cancelled interview has no result.");
		}
		if (session.getStatus() == InterviewStatus.IN_PROGRESS) {
			throw new BusinessRuleException("This interview is still in progress.");
		}
		results.findBySessionId(sessionId).orElseGet(() -> resultService.generate(session));
		return toResult(session);
	}

	public Page<HistoryItem> history(Long userId, int page, int size) {
		int safePage = Math.max(0, page);
		int safeSize = Math.min(50, Math.max(1, size));
		Page<InterviewSession> sessionsPage = sessions.findByUserIdOrderByStartedAtDesc(userId,
				PageRequest.of(safePage, safeSize));
		Instant now = Instant.now();
		List<HistoryItem> content = sessionsPage.getContent().stream().map(session -> {
			finalizeExpired(session, now);
			int answered = (int) answers.countBySessionIdAndAnsweredTrue(session.getId());
			Double score = results.findBySessionId(session.getId()).map(InterviewResult::getScore).orElse(null);
			return new HistoryItem(session.getId(), session.getCategory().name(),
					session.getCategory().getDisplayName(), session.getDifficulty().name(),
					session.getDurationMinutes(), session.getStatus().name(), session.getStartedAt(),
					session.getCompletedAt(), session.getQuestionCount(), answered, score);
		}).toList();
		return new org.springframework.data.domain.PageImpl<>(content, sessionsPage.getPageable(),
				sessionsPage.getTotalElements());
	}

	public Performance performance(Long userId) {
		List<InterviewSession> all = sessions.findByUserIdOrderByStartedAtDesc(userId);
		Instant now = Instant.now();
		all.forEach(session -> finalizeExpired(session, now));

		long completed = all.stream().filter(s -> s.getStatus() == InterviewStatus.COMPLETED).count();
		long expired = all.stream().filter(s -> s.getStatus() == InterviewStatus.EXPIRED).count();
		long cancelled = all.stream().filter(s -> s.getStatus() == InterviewStatus.CANCELLED).count();
		long inProgress = all.stream().filter(s -> s.getStatus() == InterviewStatus.IN_PROGRESS).count();
		List<InterviewResult> resultRows = all.stream()
				.filter(s -> s.getStatus() == InterviewStatus.COMPLETED || s.getStatus() == InterviewStatus.EXPIRED)
				.map(resultService::generate)
				.toList();
		double averageCompletion = resultRows.stream().mapToDouble(InterviewResult::getCompletionPercentage)
				.average().orElse(0);
		double averageMeasured = resultRows.stream().mapToLong(InterviewResult::getMeasuredTimeSeconds)
				.average().orElse(0);
		long focusLoss = all.stream().mapToLong(InterviewSession::getFocusLossCount).sum();
		Instant last = all.isEmpty() ? null : all.get(0).getStartedAt();
		return new Performance(all.size(), completed, cancelled, expired, inProgress, round(averageCompletion),
				round(averageMeasured), focusLoss, last);
	}

	private void assignQuestions(InterviewSession session, MockInterviewTemplate template) {
		List<DSAQuestion> pool = dsaQuestions.findAllActiveForInterview();
		if (pool.isEmpty()) {
			throw new BusinessRuleException("No practice questions are available for a mock interview yet.");
		}
		String preferredSlug = switch (template.getCategory()) {
			case DATA_STRUCTURES_AND_ALGORITHMS -> "data-structures-algorithms";
			case JAVA_AND_OOP -> "java-oop";
			case SYSTEM_DESIGN -> "system-design-foundations";
			case DATABASE_AND_SQL, TECHNICAL_FUNDAMENTALS -> null;
		};

		List<DSAQuestion> preferred = preferredSlug == null ? pool
				: pool.stream().filter(q -> preferredSlug.equals(q.getTopic().getCategory().getSlug())).toList();
		LinkedHashSet<DSAQuestion> selected = new LinkedHashSet<>();
		preferred.stream().filter(q -> q.getDifficulty().name().equals(template.getDifficulty().name()))
				.forEach(selected::add);
		preferred.forEach(selected::add);
		pool.forEach(selected::add);

		List<InterviewQuestion> assigned = new ArrayList<>();
		int position = 1;
		for (DSAQuestion question : selected) {
			if (assigned.size() >= QUESTION_COUNT) {
				break;
			}
			assigned.add(new InterviewQuestion(session, question.getId(), position++, question.getTitle(),
					question.getDescription(), QuestionDifficulty.valueOf(question.getDifficulty().name()),
					question.getTopic().getName(), question.getConstraints(), question.getExamples(),
					question.getExpectedTimeComplexity(), question.getExpectedSpaceComplexity()));
		}
		questions.saveAll(assigned);
	}

	private void finalizeExpired(InterviewSession session, Instant now) {
		if (!session.isExpiredAt(now)) {
			return;
		}
		session.expire(session.getExpiresAt());
		InterviewResult result = results.findBySessionId(session.getId())
				.orElseGet(() -> resultService.generate(session));
		afterFinished(session, result);
	}

	private void afterFinished(InterviewSession session, InterviewResult result) {
		notifications.create(session.getUser().getId(),
				com.prepMaster.codingPlatfom.entity.enums.NotificationType.MOCK_INTERVIEW_RESULT,
				"Mock interview result ready",
				"You answered " + result.getQuestionsAnswered() + " of " + result.getQuestionsAssigned()
						+ " questions (" + Math.round(result.getCompletionPercentage()) + "% completion).",
				"/mock-interview/results/" + session.getId(), "MOCK_RESULT:" + session.getId());
		achievements.evaluateAndAward(session.getUser().getId());
	}

	private InterviewSession requireOwned(Long sessionId, Long userId) {
		InterviewSession session = sessions.findById(sessionId)
				.orElseThrow(() -> new ResourceNotFoundException("Interview session not found: " + sessionId));
		if (!session.getUser().getId().equals(userId)) {
			throw new ResourceNotFoundException("Interview session not found: " + sessionId);
		}
		return session;
	}

	private InterviewSession requireOwnedForUpdate(Long sessionId, Long userId) {
		InterviewSession session = sessions.findByIdForUpdate(sessionId)
				.orElseThrow(() -> new ResourceNotFoundException("Interview session not found: " + sessionId));
		if (!session.getUser().getId().equals(userId)) {
			throw new ResourceNotFoundException("Interview session not found: " + sessionId);
		}
		return session;
	}

	private Session toSession(InterviewSession session, Instant now) {
		List<InterviewQuestion> rows = questions.findBySessionIdOrderByPositionAsc(session.getId());
		Map<Long, InterviewAnswer> answerByQuestion = new HashMap<>();
		for (InterviewAnswer answer : answers.findBySessionId(session.getId())) {
			answerByQuestion.put(answer.getQuestion().getId(), answer);
		}
		List<Question> views = rows.stream().map(question -> toQuestion(question, answerByQuestion.get(question.getId())))
				.toList();
		long remaining = session.getStatus() == InterviewStatus.IN_PROGRESS
				? Math.max(0, session.getExpiresAt().getEpochSecond() - now.getEpochSecond())
				: 0;
		return new Session(session.getId(), session.getTemplate().getId(), session.getTemplate().getTitle(),
				session.getCategory().name(), session.getCategory().getDisplayName(), session.getDifficulty().name(),
				session.getDurationMinutes(), session.getQuestionCount(), session.getStatus().name(),
				session.getStartedAt(), session.getExpiresAt(), session.getCompletedAt(), now, remaining,
				session.isFocusMonitoringConsented(), session.getFocusLossCount(), views);
	}

	private Result toResult(InterviewSession session) {
		InterviewResult result = results.findBySessionId(session.getId())
				.orElseGet(() -> resultService.generate(session));
		List<InterviewQuestion> rows = questions.findBySessionIdOrderByPositionAsc(session.getId());
		Map<Long, InterviewAnswer> answerByQuestion = new HashMap<>();
		for (InterviewAnswer answer : answers.findBySessionId(session.getId())) {
			answerByQuestion.put(answer.getQuestion().getId(), answer);
		}
		List<Question> views = rows.stream().map(question -> toQuestion(question, answerByQuestion.get(question.getId())))
				.toList();
		return new Result(result.getId(), session.getId(), session.getStatus().name(), session.getCategory().name(),
				session.getCategory().getDisplayName(), session.getDifficulty().name(), session.getStartedAt(),
				session.getCompletedAt(), result.getQuestionsAssigned(), result.getQuestionsAnswered(),
				result.getCompletionPercentage(), result.getScore(), result.getMeasuredTimeSeconds(),
				result.getEstimatedTimeSeconds(), result.getFocusLossCount(), result.getOverallFeedback(), views);
	}

	private Question toQuestion(InterviewQuestion question, InterviewAnswer answer) {
		Answer answerView = answer == null ? null
				: new Answer(answer.getAnswerText(), answer.getCodeText(), answer.getLanguage(), answer.isAnswered(),
						answer.getUpdatedAt());
		return new Question(question.getId(), question.getPosition(), question.getTitle(), question.getPrompt(),
				question.getDifficulty().name(), question.getTopic(), question.getConstraintsText(),
				question.getExamplesText(), question.getExpectedTimeComplexity(),
				question.getExpectedSpaceComplexity(), answerView);
	}

	private static double round(double value) {
		return Math.round(value * 100.0) / 100.0;
	}
}
