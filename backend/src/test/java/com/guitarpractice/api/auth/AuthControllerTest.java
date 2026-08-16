package com.guitarpractice.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String requestBody(String email, String password) throws Exception {
        return objectMapper.writeValueAsString(Map.of("email", email, "password", password));
    }

    @Test
    void register_success_returns201WithCookieAndBody() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody("register-success@example.com", "password123")))
                .andExpect(status().isCreated())
                .andExpect(cookie().exists("access_token"))
                .andExpect(jsonPath("$.email").value("register-success@example.com"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void register_duplicateEmail_returns409() throws Exception {
        String body = requestBody("duplicate@example.com", "password123");

        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void register_invalidInput_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody("not-an-email", "short")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_correctCredentials_returns200WithCookie() throws Exception {
        String body = requestBody("login-success@example.com", "password123");
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("access_token"));
    }

    @Test
    void login_wrongPassword_returns401() throws Exception {
        String email = "login-wrong@example.com";
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody(email, "password123")))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody(email, "wrongpassword")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_withValidCookie_returnsUser() throws Exception {
        String email = "me-success@example.com";
        String body = requestBody(email, "password123");
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        Cookie accessToken = result.getResponse().getCookie("access_token");

        mockMvc.perform(get("/api/auth/me").cookie(accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void me_withoutCookie_returns401() throws Exception {
        mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void logout_withValidCookieAndCsrfToken_returns204AndClearsCookie() throws Exception {
        String email = "logout-success@example.com";
        String body = requestBody(email, "password123");

        // CSRF対象外の register を叩く前に、CSRF対象の GET でXSRF-TOKEN Cookieを先取りする
        MvcResult csrfResult = mockMvc.perform(get("/api/auth/me")).andReturn();
        Cookie xsrfToken = csrfResult.getResponse().getCookie("XSRF-TOKEN");
        assertThat(xsrfToken).isNotNull();

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        Cookie accessToken = registerResult.getResponse().getCookie("access_token");

        mockMvc.perform(post("/api/auth/logout")
                        .cookie(accessToken, xsrfToken)
                        .header("X-XSRF-TOKEN", xsrfToken.getValue()))
                .andExpect(status().isNoContent())
                .andExpect(cookie().maxAge("access_token", 0));
    }

    @Test
    void logout_withoutCsrfHeader_returns403() throws Exception {
        String email = "logout-no-csrf@example.com";
        String body = requestBody(email, "password123");
        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        Cookie accessToken = registerResult.getResponse().getCookie("access_token");

        // XSRF-TOKEN Cookie自体が存在しない場合はMissingCsrfTokenExceptionとなり403（Forbidden）。
        // トークンはあるが値が不一致の場合の401とは異なるケース。
        mockMvc.perform(post("/api/auth/logout").cookie(accessToken)).andExpect(status().isForbidden());
    }
}
