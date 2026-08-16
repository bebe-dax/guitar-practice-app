package com.guitarpractice.api.progression;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProgressionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private record AuthCookies(Cookie accessToken, Cookie xsrfToken) {
    }

    private AuthCookies registerUser(String email) throws Exception {
        // register はCSRF対象外のため、先にCSRF対象のGETでXSRF-TOKEN Cookieを先取りする
        MvcResult csrfResult = mockMvc.perform(get("/api/auth/me")).andReturn();
        Cookie xsrfToken = csrfResult.getResponse().getCookie("XSRF-TOKEN");
        assertThat(xsrfToken).isNotNull();

        String body = objectMapper.writeValueAsString(Map.of("email", email, "password", "password123"));
        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        Cookie accessToken = registerResult.getResponse().getCookie("access_token");
        assertThat(accessToken).isNotNull();

        return new AuthCookies(accessToken, xsrfToken);
    }

    private String progressionBody(String title) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "title", title,
                "key", "C",
                "scale", "major",
                "chords", List.of("Am7", "Dm7", "G7"),
                "memo", "テストメモ"));
    }

    private String createProgression(AuthCookies auth, String title) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/progressions")
                        .cookie(auth.accessToken(), auth.xsrfToken())
                        .header("X-XSRF-TOKEN", auth.xsrfToken().getValue())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(progressionBody(title)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
    }

    @Test
    void create_success_returns201WithBody() throws Exception {
        AuthCookies auth = registerUser("progression-create@example.com");

        mockMvc.perform(post("/api/progressions")
                        .cookie(auth.accessToken(), auth.xsrfToken())
                        .header("X-XSRF-TOKEN", auth.xsrfToken().getValue())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(progressionBody("王道進行")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("王道進行"))
                .andExpect(jsonPath("$.key").value("C"))
                .andExpect(jsonPath("$.chords[0]").value("Am7"))
                .andExpect(jsonPath("$.userId").doesNotExist());
    }

    @Test
    void create_withoutCsrfHeader_returns403() throws Exception {
        AuthCookies auth = registerUser("progression-no-csrf@example.com");

        mockMvc.perform(post("/api/progressions")
                        .cookie(auth.accessToken(), auth.xsrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(progressionBody("タイトル")))
                .andExpect(status().isForbidden());
    }

    @Test
    void create_withoutAuth_returns401() throws Exception {
        // CSRFは満たした上で access_token だけが無い状態に絞り、未認証による401を検証する
        MvcResult csrfResult = mockMvc.perform(get("/api/auth/me")).andReturn();
        Cookie xsrfToken = csrfResult.getResponse().getCookie("XSRF-TOKEN");
        assertThat(xsrfToken).isNotNull();

        mockMvc.perform(post("/api/progressions")
                        .cookie(xsrfToken)
                        .header("X-XSRF-TOKEN", xsrfToken.getValue())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(progressionBody("タイトル")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void create_invalidInput_returns400() throws Exception {
        AuthCookies auth = registerUser("progression-invalid@example.com");
        String invalidBody = objectMapper.writeValueAsString(
                Map.of("title", "", "key", "C", "scale", "major", "chords", List.of(), "memo", ""));

        mockMvc.perform(post("/api/progressions")
                        .cookie(auth.accessToken(), auth.xsrfToken())
                        .header("X-XSRF-TOKEN", auth.xsrfToken().getValue())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void list_returnsOnlyOwnProgressions() throws Exception {
        AuthCookies owner = registerUser("progression-list-owner@example.com");
        AuthCookies other = registerUser("progression-list-other@example.com");

        createProgression(owner, "1件目");
        createProgression(owner, "2件目");
        createProgression(other, "他人の進行");

        mockMvc.perform(get("/api/progressions").cookie(owner.accessToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[*].title", containsInAnyOrder("1件目", "2件目")));
    }

    @Test
    void get_ownProgression_returns200() throws Exception {
        AuthCookies auth = registerUser("progression-get-own@example.com");
        String id = createProgression(auth, "取得テスト");

        mockMvc.perform(get("/api/progressions/" + id).cookie(auth.accessToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("取得テスト"));
    }

    @Test
    void get_otherUsersProgression_returns404() throws Exception {
        AuthCookies owner = registerUser("progression-get-owner@example.com");
        AuthCookies other = registerUser("progression-get-other@example.com");
        String id = createProgression(owner, "他人には見せない");

        mockMvc.perform(get("/api/progressions/" + id).cookie(other.accessToken()))
                .andExpect(status().isNotFound());
    }

    @Test
    void get_nonExistentId_returns404() throws Exception {
        AuthCookies auth = registerUser("progression-get-notfound@example.com");

        mockMvc.perform(get("/api/progressions/" + UUID.randomUUID()).cookie(auth.accessToken()))
                .andExpect(status().isNotFound());
    }

    @Test
    void update_ownProgression_returns200AndUpdatesFields() throws Exception {
        AuthCookies auth = registerUser("progression-update@example.com");
        String id = createProgression(auth, "更新前");

        mockMvc.perform(put("/api/progressions/" + id)
                        .cookie(auth.accessToken(), auth.xsrfToken())
                        .header("X-XSRF-TOKEN", auth.xsrfToken().getValue())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(progressionBody("更新後")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("更新後"));
    }

    @Test
    void update_otherUsersProgression_returns404() throws Exception {
        AuthCookies owner = registerUser("progression-update-owner@example.com");
        AuthCookies other = registerUser("progression-update-other@example.com");
        String id = createProgression(owner, "更新前");

        mockMvc.perform(put("/api/progressions/" + id)
                        .cookie(other.accessToken(), other.xsrfToken())
                        .header("X-XSRF-TOKEN", other.xsrfToken().getValue())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(progressionBody("乗っ取り")))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_ownProgression_returns204() throws Exception {
        AuthCookies auth = registerUser("progression-delete@example.com");
        String id = createProgression(auth, "削除対象");

        mockMvc.perform(delete("/api/progressions/" + id)
                        .cookie(auth.accessToken(), auth.xsrfToken())
                        .header("X-XSRF-TOKEN", auth.xsrfToken().getValue()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/progressions/" + id).cookie(auth.accessToken()))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_otherUsersProgression_returns404() throws Exception {
        AuthCookies owner = registerUser("progression-delete-owner@example.com");
        AuthCookies other = registerUser("progression-delete-other@example.com");
        String id = createProgression(owner, "他人の削除テスト");

        mockMvc.perform(delete("/api/progressions/" + id)
                        .cookie(other.accessToken(), other.xsrfToken())
                        .header("X-XSRF-TOKEN", other.xsrfToken().getValue()))
                .andExpect(status().isNotFound());
    }
}
