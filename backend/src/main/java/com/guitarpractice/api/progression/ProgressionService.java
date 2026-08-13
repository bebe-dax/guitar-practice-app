package com.guitarpractice.api.progression;

import com.guitarpractice.api.progression.dto.ProgressionRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProgressionService {

    private final ProgressionRepository progressionRepository;

    public ProgressionService(ProgressionRepository progressionRepository) {
        this.progressionRepository = progressionRepository;
    }

    public List<Progression> list(UUID userId) {
        return progressionRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    @Transactional
    public Progression create(UUID userId, ProgressionRequest request) {
        Progression progression = Progression.create(
                userId, request.title(), request.key(), request.scale(), request.chords(), request.memo());
        return progressionRepository.save(progression);
    }

    public Progression get(UUID userId, UUID id) {
        return findOwned(userId, id);
    }

    @Transactional
    public Progression update(UUID userId, UUID id, ProgressionRequest request) {
        Progression progression = findOwned(userId, id);
        progression.update(request.title(), request.key(), request.scale(), request.chords(), request.memo());
        return progression;
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        Progression progression = findOwned(userId, id);
        progressionRepository.delete(progression);
    }

    // 所有権チェックを兼ねた検索。他人の進行、または存在しないIDは
    // 一律 404 として扱う（存在秘匿のため 403 にはしない、spec §4.2）
    private Progression findOwned(UUID userId, UUID id) {
        return progressionRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
