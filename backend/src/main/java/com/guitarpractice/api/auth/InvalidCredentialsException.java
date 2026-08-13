package com.guitarpractice.api.auth;

public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("メールアドレスまたはパスワードが正しくありません");
    }
}
