package com.prepMaster.codingPlatfom.controller;

import java.time.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.prepMaster.codingPlatfom.dto.response.ProgressResponses.*;
import com.prepMaster.codingPlatfom.service.GamificationService;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {
	private final GamificationService service;
	public ProgressController(GamificationService service) { this.service = service; }
	@GetMapping public Progress progress(Authentication auth) { return service.progress(id(auth)); }
	@GetMapping("/activity") public java.util.List<Activity> activity(Authentication auth,
			@RequestParam LocalDate from, @RequestParam LocalDate to) { return service.activity(id(auth), from, to); }
	@GetMapping("/weekly") public Summary weekly(Authentication auth) { LocalDate to = LocalDate.now(); return service.summary(id(auth), to.minusDays(6), to, "WEEK"); }
	@GetMapping("/monthly") public Summary monthly(Authentication auth) { LocalDate to = LocalDate.now(); return service.summary(id(auth), to.withDayOfMonth(1), to, "MONTH"); }
	@GetMapping("/categories") public java.util.List<CategoryProgress> categories(Authentication auth) { return service.categoryProgress(id(auth)); }
	private long id(Authentication auth) { return Long.parseLong(auth.getName()); }
}
