# dx

WWS の DX関連サービス提案ページ（GitHub Pages）。

公開URL: https://wwskamata.github.io/dx/

## パスワード保護について

`assets/password-gate.js` は、クライアントサイドの簡易パスワードゲートです。
ページを開くとパスワード入力画面が表示され、正しいパスワードを入力するまで
本文が閲覧できません。

**注意：これは本格的なアクセス制御ではありません。** ページのソースコードは
誰でも閲覧できるため、真に機密性の高い情報は載せないでください。あくまで
「検索や偶然のアクセスからページを見えにくくする」ための簡易的な仕組みです。

### ディレクトリごとに異なるパスワードを設定する方法

1. 新しいディレクトリを作る（例：`clients/hirakin/index.html`）
2. パスワードのSHA-256ハッシュを作る（ブラウザのコンソールで実行可）
   ```js
   crypto.subtle.digest("SHA-256", new TextEncoder().encode("設定したいパスワード"))
     .then(buf => console.log(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("")));
   ```
3. そのHTMLの `<head>` 内、`password-gate.js` を読み込む前に以下を追加する
   ```html
   <script>
     window.PW_GATE_CONFIG = {
       hash: "上で生成したハッシュ",
       label: "このページ" // ゲート画面に表示する名称（任意）
     };
   </script>
   <script src="/dx/assets/password-gate.js"></script>
   ```
4. ディレクトリごとに異なるハッシュ（＝異なるパスワード）を設定すれば、
   それぞれ独立したパスワードで保護される。`password-gate.js` 自体は
   共通で使い回せる。

### 現在のパスワード

- ルート（`/`）: `dx`
