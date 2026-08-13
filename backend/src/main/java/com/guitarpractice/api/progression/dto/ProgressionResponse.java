package com.guitarpractice.api.progression.dto;

import com.guitarpractice.api.progression.Progression;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProgressionResponse(
        UUID id,
        String title,
        String key,
        String scale,
        List<String> chords,
        String memo,
        Instant createdAt,
        Instant updatedAt) {

    public static ProgressionResponse from(Progression progression) {
        return new ProgressionResponse(
                progression.getId(),
                progression.getTitle(),
                progression.getKey(),
                progression.getScale(),
                progression.getChords(),
                progression.getMemo(),
                progression.getCreatedAt(),
                progression.getUpdatedAt());
    }
}
