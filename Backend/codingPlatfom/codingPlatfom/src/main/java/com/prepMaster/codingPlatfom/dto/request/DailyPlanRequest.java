package com.prepMaster.codingPlatfom.dto.request;

import java.util.Set;
import jakarta.validation.constraints.Min;

public record DailyPlanRequest(@Min(1) int taskCount, Set<Long> categoryIds) {}
