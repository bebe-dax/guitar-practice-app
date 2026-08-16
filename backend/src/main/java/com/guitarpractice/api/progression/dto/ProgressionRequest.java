package com.guitarpractice.api.progression.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ProgressionRequest(
        @NotBlank @Size(min = 1, max = 100) String title,
        @NotBlank String key,
        @NotBlank String scale,
        @NotEmpty List<@NotBlank String> chords,
        @Size(max = 500) String memo) {
}
