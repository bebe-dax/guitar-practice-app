package com.guitarpractice.api.auth;

public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException() {
        super("このメールアドレスは既に登録されています");
    }
}
