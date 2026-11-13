package com.prepMaster.codingPlatfom.service;

import java.io.IOException;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.prepMaster.codingPlatfom.entity.Resume.ResumeExtraction;
import com.prepMaster.codingPlatfom.exception.BusinessRuleException;

@Service
public class ResumeTextExtractionService {

	private static final Pattern EMAIL = Pattern.compile("[\\w.+-]+@[\\w.-]+\\.[A-Za-z]{2,}");
	private static final Pattern PHONE = Pattern.compile("(?<!\\d)(?:\\+?\\d[\\d ()-]{7,}\\d)(?!\\d)");
	private static final String[] LANGUAGES = {"Java", "JavaScript", "TypeScript", "Python", "C++", "C#", "Go", "Kotlin", "SQL"};
	private static final String[] FRAMEWORKS = {"Spring Boot", "Spring Security", "React", "Angular", "Node.js", "Express", "Django", "Next.js"};
	private static final String[] DATABASES = {"MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle", "SQL Server", "DynamoDB"};

	public ExtractedResume extract(MultipartFile file) {
		validate(file);
		try (var document = Loader.loadPDF(file.getBytes())) {
			String text = new PDFTextStripper().getText(document).trim();
			if (text.isBlank()) {
				throw new BusinessRuleException("The PDF does not contain extractable text");
			}
			return new ExtractedResume(text, extractFields(text));
		} catch (IOException exception) {
			throw new BusinessRuleException("The PDF could not be read");
		}
	}

	private void validate(MultipartFile file) {
		if (file == null || file.isEmpty()) throw new BusinessRuleException("A PDF resume is required");
		if (file.getSize() > 10 * 1024 * 1024) throw new BusinessRuleException("Resume PDF must be 10 MB or smaller");
		String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
		String contentType = file.getContentType();
		if (!name.endsWith(".pdf") || (contentType != null && !contentType.isBlank()
				&& !"application/pdf".equalsIgnoreCase(contentType))) {
			throw new BusinessRuleException("Only PDF resumes are supported");
		}
		try {
			byte[] header = file.getBytes();
			if (header.length < 5 || header[0] != '%' || header[1] != 'P' || header[2] != 'D'
					|| header[3] != 'F' || header[4] != '-') {
				throw new BusinessRuleException("The uploaded file is not a valid PDF");
			}
		} catch (IOException exception) {
			throw new BusinessRuleException("The uploaded file could not be read");
		}
	}

	private ResumeExtraction extractFields(String text) {
		String normalized = text.replaceAll("\\s+", " ");
		Matcher emailMatcher = EMAIL.matcher(normalized);
		Matcher phoneMatcher = PHONE.matcher(normalized);
		return new ResumeExtraction(
				firstLine(text),
				emailMatcher.find() ? emailMatcher.group() : null,
				phoneMatcher.find() ? phoneMatcher.group().trim() : null,
				section(text, "education"),
				findTerms(normalized, LANGUAGES),
				findTerms(normalized, LANGUAGES),
				findTerms(normalized, FRAMEWORKS),
				findTerms(normalized, DATABASES),
				section(text, "projects"),
				section(text, "experience|employment|work history"),
				section(text, "certifications|certificates"));
	}

	private String firstLine(String text) {
		return text.lines().map(String::trim).filter(line -> !line.isBlank()).findFirst().orElse(null);
	}

	private String section(String text, String headingPattern) {
		String[] lines = text.split("\\R");
		StringBuilder section = new StringBuilder();
		boolean active = false;
		for (String line : lines) {
			String clean = line.trim();
			if (clean.matches("(?i)^(" + headingPattern + ")\\s*:?.*$")) {
				active = true;
				continue;
			}
			if (active && clean.matches("(?i)^(education|skills|technical skills|programming languages|frameworks|databases|projects|experience|employment|work history|certifications|certificates)\\s*:?.*$")) {
				break;
			}
			if (active && !clean.isBlank()) section.append(clean).append(" ");
		}
		return section.toString().trim();
	}

	private String findTerms(String text, String[] terms) {
		return java.util.Arrays.stream(terms).filter(term -> text.toLowerCase(Locale.ROOT).contains(term.toLowerCase(Locale.ROOT)))
				.distinct().reduce((left, right) -> left + ", " + right).orElse("");
	}

	public record ExtractedResume(String text, ResumeExtraction extraction) {
	}
}
