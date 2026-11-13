package com.prepMaster.codingPlatfom.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.prepMaster.codingPlatfom.dto.request.ResumeScanRequest;
import com.prepMaster.codingPlatfom.dto.response.ResumeHistoryResponse;
import com.prepMaster.codingPlatfom.dto.response.ResumeScanResponse;
import com.prepMaster.codingPlatfom.entity.Resume;
import com.prepMaster.codingPlatfom.entity.ResumeScan;
import com.prepMaster.codingPlatfom.entity.User;
import com.prepMaster.codingPlatfom.entity.enums.SubscriptionTier;
import com.prepMaster.codingPlatfom.exception.BusinessRuleException;
import com.prepMaster.codingPlatfom.exception.DuplicateResourceException;
import com.prepMaster.codingPlatfom.exception.ResourceNotFoundException;
import com.prepMaster.codingPlatfom.exception.SubscriptionLimitExceededException;
import com.prepMaster.codingPlatfom.repository.ResumeRepository;
import com.prepMaster.codingPlatfom.repository.ResumeScanRepository;
import com.prepMaster.codingPlatfom.service.ResumeTextExtractionService.ExtractedResume;

@Service
@Transactional
public class ResumeScannerService {

	private final ResumeRepository resumes;
	private final ResumeScanRepository scans;
	private final UserService users;
	private final ResumeTextExtractionService extractor;
	private final AtsMatchingEngine matchingEngine;
	private final Path storageDirectory;
	private final int freeLimit;
	private final int premiumLimit;

	public ResumeScannerService(ResumeRepository resumes, ResumeScanRepository scans, UserService users,
			ResumeTextExtractionService extractor, AtsMatchingEngine matchingEngine,
			@Value("${app.ats.storage-dir:data/resumes}") String storageDirectory,
			@Value("${app.ats.free-scans-per-month:2}") int freeLimit,
			@Value("${app.ats.premium-scans-per-month:100}") int premiumLimit) {
		this.resumes = resumes;
		this.scans = scans;
		this.users = users;
		this.extractor = extractor;
		this.matchingEngine = matchingEngine;
		this.storageDirectory = Paths.get(storageDirectory).toAbsolutePath().normalize();
		this.freeLimit = freeLimit;
		this.premiumLimit = premiumLimit;
	}

	public ResumeScanResponse scan(Long userId, MultipartFile file, ResumeScanRequest request) {
		if (request == null || request.jobDescription() == null || request.jobDescription().isBlank()) {
			throw new BusinessRuleException("Job description is required");
		}
		User user = users.require(userId);
		ExtractedResume extracted = extractor.extract(file);
		String hash = sha256(file);
		Resume resume = resumes.findByUserIdAndSha256Hash(userId, hash).orElseGet(() -> storeResume(user, file, hash, extracted));
		var duplicate = scans.findTopByUserIdAndResumeIdAndJobDescriptionOrderByCreatedAtDesc(userId, resume.getId(), request.jobDescription().trim());
		if (duplicate.isPresent()) return toResponse(duplicate.get());
		enforceLimit(user);
		return scans.findTopByUserIdAndResumeIdAndJobDescriptionOrderByCreatedAtDesc(userId, resume.getId(), request.jobDescription().trim())
				.map(this::toResponse)
				.orElseGet(() -> {
					ResumeScan.AtsResult result = matchingEngine.analyze(extracted.text(), request.jobDescription(), request.targetRole());
					return toResponse(scans.save(new ResumeScan(user, resume, clean(request.targetCompany()),
							clean(request.targetRole()), request.jobDescription().trim(), result)));
				});
	}

	@Transactional(readOnly = true)
	public List<ResumeHistoryResponse> history(Long userId) {
		return scans.findTop50ByUserIdOrderByCreatedAtDesc(userId).stream()
				.map(scan -> new ResumeHistoryResponse(scan.getId(), scan.getResume().getOriginalName(),
						scan.getTargetCompany(), scan.getTargetRole(), scan.getAtsScore(),
						scan.getReadinessScore(), scan.getStatus(), scan.getCreatedAt()))
				.toList();
	}

	@Transactional(readOnly = true)
	public ResumeScanResponse get(Long userId, Long scanId) {
		return scans.findByIdAndUserId(scanId, userId).map(this::toResponse)
				.orElseThrow(() -> new ResourceNotFoundException("Resume scan not found: " + scanId));
	}

	@Transactional(readOnly = true)
	public StoredResumeFile file(Long userId, Long resumeId) {
		Resume resume = resumes.findById(resumeId)
				.filter(item -> item.getUser().getId().equals(userId))
				.orElseThrow(() -> new ResourceNotFoundException("Resume not found: " + resumeId));
		Path path = storageDirectory.resolve(resume.getStorageKey()).normalize();
		if (!path.startsWith(storageDirectory) || !Files.isRegularFile(path)) {
			throw new ResourceNotFoundException("Resume file not found: " + resumeId);
		}
		try {
			return new StoredResumeFile(resume.getOriginalName(), resume.getContentType(), Files.readAllBytes(path));
		} catch (IOException exception) {
			throw new BusinessRuleException("Resume file could not be read");
		}
	}

	private Resume storeResume(User user, MultipartFile file, String hash, ExtractedResume extracted) {
		try {
			Files.createDirectories(storageDirectory);
			String key = user.getId() + "-" + java.util.UUID.randomUUID() + ".pdf";
			Path destination = storageDirectory.resolve(key).normalize();
			if (!destination.startsWith(storageDirectory)) throw new BusinessRuleException("Invalid resume storage key");
			Files.write(destination, file.getBytes());
			return resumes.save(new Resume(user, safeName(file.getOriginalFilename()), key,
					"application/pdf", file.getSize(), hash, extracted.extraction(), extracted.text()));
		} catch (IOException exception) {
			throw new BusinessRuleException("Resume could not be stored securely");
		}
	}

	private void enforceLimit(User user) {
		LocalDateTime start = LocalDate.now(ZoneOffset.UTC).withDayOfMonth(1).atStartOfDay();
		int limit = user.getSubscriptionTier() == SubscriptionTier.PREMIUM ? premiumLimit : freeLimit;
		if (scans.countByUserIdAndCreatedAtGreaterThanEqual(user.getId(), start) >= limit) {
			throw new SubscriptionLimitExceededException("Your " + user.getSubscriptionTier().name().toLowerCase(Locale.ROOT)
					+ " plan allows " + limit + " resume scans per month");
		}
	}

	private ResumeScanResponse toResponse(ResumeScan scan) {
		Resume resume = scan.getResume();
		return new ResumeScanResponse(scan.getId(), resume.getId(), resume.getOriginalName(),
				scan.getTargetCompany(), scan.getTargetRole(), scan.getAtsScore(), scan.getReadinessScore(),
				scan.getTechnicalCoverage(), split(scan.getMatchedSkills()), split(scan.getMissingSkills()),
				split(scan.getPartialSkills()), split(scan.getStrengths()), split(scan.getRecommendations()),
				resume.getExtractedName(), resume.getExtractedEmail(), resume.getExtractedPhone(), scan.getCreatedAt());
	}

	private List<String> split(String value) {
		return value == null || value.isBlank() ? List.of() : Arrays.stream(value.split("\\|")).filter(item -> !item.isBlank()).toList();
	}

	private String safeName(String value) {
		String name = value == null ? "resume.pdf" : Paths.get(value).getFileName().toString();
		return name.toLowerCase(Locale.ROOT).endsWith(".pdf") ? name : name + ".pdf";
	}

	private String clean(String value) {
		return value == null ? null : value.trim();
	}

	private String sha256(MultipartFile file) {
		try {
			return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(file.getBytes()));
		} catch (Exception exception) {
			throw new IllegalStateException("Unable to hash resume", exception);
		}
	}

	public record StoredResumeFile(String fileName, String contentType, byte[] content) {
	}
}
