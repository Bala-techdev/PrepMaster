package com.prepMaster.codingPlatfom.service;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.prepMaster.codingPlatfom.entity.ResumeScan.AtsResult;

@Service
public class AtsMatchingEngine {

	private static final Set<String> CATALOG = Set.of(
			"Java", "JavaScript", "TypeScript", "Python", "C++", "C#", "Go", "Kotlin", "SQL",
			"Spring Boot", "Spring Security", "React", "Angular", "Node.js", "Express", "Django", "Next.js",
			"MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle", "SQL Server", "DynamoDB",
			"Docker", "Kubernetes", "AWS", "Azure", "GCP", "REST", "GraphQL", "Git", "Microservices",
			"System Design", "JUnit", "Maven", "Agile");

	public AtsResult analyze(String resumeText, String jobDescription, String targetRole) {
		String resume = resumeText.toLowerCase(Locale.ROOT);
		String job = jobDescription.toLowerCase(Locale.ROOT);
		Set<String> requirements = CATALOG.stream().filter(skill -> job.contains(skill.toLowerCase(Locale.ROOT)))
				.collect(Collectors.toCollection(LinkedHashSet::new));
		if (requirements.isEmpty()) {
			requirements.addAll(Arrays.stream(jobDescription.split("[^A-Za-z0-9+#.]+"))
					.filter(word -> word.length() >= 4).limit(20).map(this::titleCase)
					.collect(Collectors.toCollection(LinkedHashSet::new)));
		}
		Set<String> matched = requirements.stream().filter(skill -> resume.contains(skill.toLowerCase(Locale.ROOT)))
				.collect(Collectors.toCollection(LinkedHashSet::new));
		Set<String> missing = requirements.stream().filter(skill -> !resume.contains(skill.toLowerCase(Locale.ROOT)))
				.collect(Collectors.toCollection(LinkedHashSet::new));
		Set<String> partial = missing.stream().filter(skill -> Arrays.stream(skill.toLowerCase(Locale.ROOT).split("[ .+#-]+"))
				.anyMatch(part -> part.length() > 3 && resume.contains(part))).collect(Collectors.toCollection(LinkedHashSet::new));
		missing.removeAll(partial);
		int coverage = requirements.isEmpty() ? 0 : Math.round(matched.size() * 100f / requirements.size());
		int ats = Math.min(100, Math.max(0, Math.round(coverage * 0.75f + Math.min(resume.length() / 1200f, 1f) * 25)));
		int readiness = Math.max(0, Math.min(100, ats - Math.min(missing.size() * 3, 25) + Math.min(partial.size() * 2, 10)));
		String strengths = matched.isEmpty() ? "No direct technical matches were detected yet" : "Strong alignment with " + String.join(", ", matched);
		String recommendations = missing.stream().limit(8).map(skill -> recommendation(skill)).collect(Collectors.joining(" | "));
		return new AtsResult(join(requirements), ats, readiness, coverage, join(matched), join(missing), join(partial),
				strengths, recommendations);
	}

	private String recommendation(String skill) {
		return switch (skill.toLowerCase(Locale.ROOT)) {
			case "spring security" -> "Learn Spring Security fundamentals and implement JWT authentication.";
			case "redis" -> "Build a Redis caching or login-rate-limiting module.";
			case "docker" -> "Containerize a backend service and document the deployment flow.";
			default -> "Add a measurable project or work example demonstrating " + skill + ".";
		};
	}

	private String join(Set<String> values) {
		return String.join("|", values);
	}

	private String titleCase(String value) {
		return Character.toUpperCase(value.charAt(0)) + value.substring(1).toLowerCase(Locale.ROOT);
	}
}
