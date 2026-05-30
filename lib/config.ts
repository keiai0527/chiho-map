/**
 * サイト全体で使う設定。
 *
 * SITE_URL は OGP/canonical/sitemap/robots の基準URL。
 * 主ドメインは裸ドメイン `chihogiin.jp`（www は 308 で裸へリダイレクト）。
 */
export const SITE_URL = "https://chihogiin.jp";

/**
 * 訂正依頼用メールアドレス。
 * Gmail の plus エイリアスで、運営者の keiai0527@gmail.com に届く。
 */
export const CORRECTION_EMAIL = "keiai0527+chiho-map@gmail.com";

/**
 * 訂正依頼用 Google フォームURL。
 * 空文字なら「準備中」表示、URL があれば「フォームを開く」リンクを表示。
 * フォーム編集: https://docs.google.com/forms/d/1lG4Hfb4x3rIxbGTFGdnY64xZ_CfyFyp8EgOz7DjnWDg/edit
 */
export const CORRECTION_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScw15fCK-2oAenwFoMVA9uPm4em89sAKbFiHgruPfT5OiPJrQ/viewform";

/** X（Twitter）公式アカウント */
export const TWITTER_HANDLE = "kokkai_map";
export const TWITTER_URL = `https://x.com/${TWITTER_HANDLE}`;
