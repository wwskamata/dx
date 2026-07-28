/**
 * password-gate.js
 * 汎用の簡易パスワードゲート（クライアントサイド）。
 *
 * 使い方：各HTMLの<head>内、このスクリプトを読み込む前に以下を設定する。
 *   <script>
 *     window.PW_GATE_CONFIG = {
 *       hash: "<パスワードのSHA-256ハッシュ(16進数)>",
 *       label: "このページ" // 任意：ゲート画面に表示する名称
 *     };
 *   </script>
 *   <script src="/dx/assets/password-gate.js"></script>
 *
 * ディレクトリごとに異なるパスワードを設定したい場合は、
 * それぞれのディレクトリのHTMLで hash に異なる値を指定するだけでよい。
 * （このスクリプト自体は共通で使い回せる）
 *
 * 注意：これはクライアントサイドの簡易的な閲覧制限であり、
 * 本格的なアクセス制御（サーバー認証）ではない。ページのソースは
 * 誰でも閲覧可能なため、機密情報の防御としては使わないこと。
 * あくまで「検索や偶然のアクセスからページを見えにくくする」ための仕組み。
 */
(function () {
  var config = window.PW_GATE_CONFIG || {};
  var hash = config.hash;
  var label = config.label || "このページ";
  var storageKey = "pwgate_unlocked::" + location.pathname;

  if (!hash) {
    console.error("[password-gate] PW_GATE_CONFIG.hash が設定されていません。");
    return;
  }

  if (sessionStorage.getItem(storageKey) === "1") {
    return; // このタブでは既に解除済み
  }

  async function sha256Hex(text) {
    var enc = new TextEncoder().encode(text);
    var buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.prototype.map
      .call(new Uint8Array(buf), function (b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  }

  function buildGate() {
    var overlay = document.createElement("div");
    overlay.id = "pw-gate-overlay";
    overlay.style.cssText =
      "position:fixed;inset:0;background:#1E3A5F;display:flex;" +
      "align-items:center;justify-content:center;z-index:99999;" +
      "font-family:'Noto Sans JP','Meiryo',sans-serif;";
    overlay.innerHTML =
      '<div style="background:#fff;padding:40px 36px;border-radius:14px;max-width:360px;width:90%;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,0.25);">' +
      '<h2 style="margin:0 0 8px;color:#1E3A5F;font-size:1.2rem;">' + label + 'はパスワードで保護されています</h2>' +
      '<p style="color:#666;font-size:0.85rem;margin:0 0 20px;">閲覧にはパスワードの入力が必要です</p>' +
      '<input id="pw-gate-input" type="password" autocomplete="off" placeholder="パスワード" ' +
      'style="width:100%;padding:12px;font-size:1rem;border:1px solid #ccc;border-radius:8px;margin-bottom:14px;box-sizing:border-box;" />' +
      '<button id="pw-gate-submit" style="width:100%;background:#E87722;color:#fff;border:none;padding:12px;border-radius:8px;font-weight:bold;font-size:1rem;cursor:pointer;">開く</button>' +
      '<p id="pw-gate-error" style="color:#C00000;font-size:0.82rem;margin:14px 0 0;display:none;">パスワードが違います</p>' +
      "</div>";
    document.documentElement.appendChild(overlay);

    var input = overlay.querySelector("#pw-gate-input");
    var btn = overlay.querySelector("#pw-gate-submit");
    var err = overlay.querySelector("#pw-gate-error");
    var origOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    function attempt() {
      var val = input.value;
      sha256Hex(val).then(function (h) {
        if (h === hash) {
          sessionStorage.setItem(storageKey, "1");
          overlay.remove();
          document.documentElement.style.overflow = origOverflow;
        } else {
          err.style.display = "block";
          input.value = "";
          input.focus();
        }
      });
    }

    btn.addEventListener("click", attempt);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") attempt();
    });
    setTimeout(function () {
      input.focus();
    }, 50);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildGate);
  } else {
    buildGate();
  }
})();
