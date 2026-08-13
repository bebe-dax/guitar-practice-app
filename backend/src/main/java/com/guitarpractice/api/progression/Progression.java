package com.guitarpractice.api.progression;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "progressions")
public class Progression {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(name = "key_note", nullable = false, length = 10)
    private String key;

    @Column(nullable = false, length = 50)
    private String scale;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private List<String> chords;

    @Column(length = 500)
    private String memo;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Progression() {
        // JPA
    }

    private Progression(
            UUID id,
            UUID userId,
            String title,
            String key,
            String scale,
            List<String> chords,
            String memo,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.key = key;
        this.scale = scale;
        this.chords = chords;
        this.memo = memo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Progression create(
            UUID userId, String title, String key, String scale, List<String> chords, String memo) {
        Instant now = Instant.now();
        return new Progression(UUID.randomUUID(), userId, title, key, scale, chords, memo, now, now);
    }

    public void update(String title, String key, String scale, List<String> chords, String memo) {
        this.title = title;
        this.key = key;
        this.scale = scale;
        this.chords = chords;
        this.memo = memo;
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getTitle() {
        return title;
    }

    public String getKey() {
        return key;
    }

    public String getScale() {
        return scale;
    }

    public List<String> getChords() {
        return chords;
    }

    public String getMemo() {
        return memo;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
