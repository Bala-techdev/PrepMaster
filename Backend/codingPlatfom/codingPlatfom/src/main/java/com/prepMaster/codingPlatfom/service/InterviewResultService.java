package com.prepMaster.codingPlatfom.service;

import java.time.Duration;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.ResultSummary;
import com.prepMaster.codingPlatfom.entity.InterviewAnswer;
import com.prepMaster.codingPlatfom.entity.InterviewQuestion;
import com.prepMaster.codingPlatfom.entity.InterviewResult;
import com.prepMaster.codingPlatfom.entity.InterviewSession;
import com.prepMaster.codingPlatfom.repository.InterviewAnswerRepository;
import com.prepMaster.codingPlatfom.repository.InterviewQuestionRepository;
import com.prepMaster.codingPlatfom.repository.InterviewResultRepository;

/**
 * Calculates the result metrics from server-observed data only. No value in the
 * result is accepted from the client.
 */
@Service
@Transactional
public class InterviewResultService {

	private final InterviewResultRepository results;
	private final InterviewQuestionRepository questions;
	private final InterviewAnswerRepository answers;

	public InterviewResultService(InterviewResultRepository results, InterviewQuestionRepository questions,
			InterviewAnswerRepository answers) {
		this.results = results;
		this.questions = questions;
		this.answers = answers;
	}

	public InterviewResult generate(InterviewSession session) {
		return results.findBySessionId(session.getId()).orElseGet(() -> calculate(session));
	}

	private InterviewResult calculate(InterviewSession session) {
		List<InterviewQuestion> assigned = questions.findBySessionIdOrderByPositionAsc(session.getId());
		int assignedCount = assigned.size();
		List<InterviewAnswer> savedAnswers = answers.findBySessionId(session.getId());
		int answeredCount = (int) savedAnswers.stream().filter(InterviewAnswer::isAnswered).count();
		double completion = assignedCount == 0 ? 0.0 : round(answeredCount * 100.0 / assignedCount);
		long estimated = assigned.stream().mapToLong(this::estimatedSeconds).sum();
		long measured = session.getTotalTimeSeconds() == null ? 0 : session.getTotalTimeSeconds();
		String feedback = feedback(completion, answeredCount, assignedCount);
		return results.save(new InterviewResult(session, assignedCount, answeredCount, completion, completion,
				measured, estimated, session.getFocusLossCount(), feedback));
	}

	private long estimatedSeconds(InterviewQuestion question) {
		return switch (question.getDifficulty()) {
			case EASY -> Duration.ofMinutes(8).toSeconds();
			case MEDIUM -> Duration.ofMinutes(12).toSeconds();
			case HARD -> Duration.ofMinutes(18).toSeconds();
		};
	}

	private static double round(double value) {
		return Math.round(value * 100.0) / 100.0;
	}

	private static String feedback(double completion, int answered, int assigned) {
		if (assigned == 0) {
			return "No questions were assigned to this session.";
		}
		if (completion >= 80) {
			return "Strong coverage: you answered " + answered + " of " + assigned
					+ " questions. Review your notes while the details are fresh.";
		}
		if (completion >= 50) {
			return "Solid progress: you answered " + answered + " of " + assigned
					+ " questions. Try the remaining topics in your next session.";
		}
		return "You answered " + answered + " of " + assigned
				+ " questions. Use the question list to plan a focused follow-up session.";
	}

	public ResultSummary summary(InterviewSession session) {
		InterviewResult result = generate(session);
		return new ResultSummary(result.getId(), session.getStatus().name(), session.getCategory().name(),
				session.getCategory().getDisplayName(), session.getDifficulty().name(),
				result.getQuestionsAssigned(), result.getQuestionsAnswered(), result.getCompletionPercentage(),
				result.getScore(), result.getMeasuredTimeSeconds(), result.getEstimatedTimeSeconds(),
				result.getFocusLossCount(), result.getOverallFeedback());
	}
}
