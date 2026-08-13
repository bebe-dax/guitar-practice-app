package com.guitarpractice.api.auth.dto;

import com.guitarpractice.api.user.User;
import java.util.UUID;

public record UserResponse(UUID id, String email) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail());
    }
}
