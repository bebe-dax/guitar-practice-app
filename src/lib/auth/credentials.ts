// ブラウザのパスワードマネージャーに保存を促す（Credential Management API対応ブラウザのみ）。
// fetch()ベースのSPAログイン/登録はネイティブのフォーム送信を伴わないため、
// これを呼ばないとブラウザの「パスワードを保存」ヒューリスティックが働かないことがある。
// 非対応ブラウザ（Safari/Firefox等）では何もしない。
export async function offerToSavePassword(email: string, password: string): Promise<void> {
  if (!('PasswordCredential' in window)) return

  try {
    const PasswordCredentialCtor = (
      window as unknown as {
        PasswordCredential: new (data: { id: string; password: string; name?: string }) => Credential
      }
    ).PasswordCredential
    const credential = new PasswordCredentialCtor({ id: email, password, name: email })
    await navigator.credentials.store(credential)
  } catch {
    // ユーザーが保存を拒否した場合等は無視してよい
  }
}
