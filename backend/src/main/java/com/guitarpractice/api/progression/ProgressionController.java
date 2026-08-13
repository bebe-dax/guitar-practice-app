package com.guitarpractice.api.progression;

import com.guitarpractice.api.progression.dto.ProgressionRequest;
import com.guitarpractice.api.progression.dto.ProgressionResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progressions")
public class ProgressionController {

    private final ProgressionService progressionService;

    public ProgressionController(ProgressionService progressionService) {
        this.progressionService = progressionService;
    }

    @GetMapping
    public List<ProgressionResponse> list(@AuthenticationPrincipal UUID userId) {
        return progressionService.list(userId).stream().map(ProgressionResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProgressionResponse create(
            @AuthenticationPrincipal UUID userId, @Valid @RequestBody ProgressionRequest request) {
        return ProgressionResponse.from(progressionService.create(userId, request));
    }

    @GetMapping("/{id}")
    public ProgressionResponse get(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        return ProgressionResponse.from(progressionService.get(userId, id));
    }

    @PutMapping("/{id}")
    public ProgressionResponse update(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody ProgressionRequest request) {
        return ProgressionResponse.from(progressionService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        progressionService.delete(userId, id);
    }
}
