package com.guitarpractice.api.progression;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressionRepository extends JpaRepository<Progression, UUID> {

    List<Progression> findByUserIdOrderByUpdatedAtDesc(UUID userId);

    Optional<Progression> findByIdAndUserId(UUID id, UUID userId);
}
