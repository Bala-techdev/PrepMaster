package com.prepMaster.codingPlatfom.controller;

import java.util.List;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;

import com.prepMaster.codingPlatfom.dto.request.ResumeScanRequest;
import com.prepMaster.codingPlatfom.dto.response.ResumeHistoryResponse;
import com.prepMaster.codingPlatfom.dto.response.ResumeScanResponse;
import com.prepMaster.codingPlatfom.service.ResumeScannerService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/resumes")
public class ResumeScannerController {

	private final ResumeScannerService scanner;

	public ResumeScannerController(ResumeScannerService scanner) {
		this.scanner = scanner;
	}

	@PostMapping(value = "/scans", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResumeScanResponse scan(Authentication authentication, @RequestPart("resume") MultipartFile resume,
			@Valid @RequestPart("request") ResumeScanRequest request) {
		return scanner.scan(userId(authentication), resume, request);
	}

	@GetMapping("/scans")
	public List<ResumeHistoryResponse> history(Authentication authentication) {
		return scanner.history(userId(authentication));
	}

	@GetMapping("/scans/{scanId}")
	public ResumeScanResponse get(Authentication authentication, @PathVariable Long scanId) {
		return scanner.get(userId(authentication), scanId);
	}

	@GetMapping("/{resumeId}/file")
	public ResponseEntity<ByteArrayResource> file(Authentication authentication, @PathVariable Long resumeId) {
		ResumeScannerService.StoredResumeFile file = scanner.file(userId(authentication), resumeId);
		return ResponseEntity.ok()
				.contentType(MediaType.APPLICATION_PDF)
				.header(HttpHeaders.CONTENT_DISPOSITION,
						ContentDisposition.inline().filename(file.fileName()).build().toString())
				.body(new ByteArrayResource(file.content()));
	}

	private Long userId(Authentication authentication) {
		return Long.valueOf(authentication.getName());
	}
}
