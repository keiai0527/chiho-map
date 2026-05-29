/**
 * サイト全体で使う設定。
 *
 * SITE_URL は OGP/canonical/sitemap/robots の基準URL。
 *
 * 現状: chihogiin.jp / chihomap.jp の DNS伝播 + SSL発行 が完了するまで、
 * メイン扱いは Vercel 既定ドメイン `chiho-map.vercel.app` とする。
 *
 * DNS伝播確認とSSL発行を確認したら、下記を "https://chihogiin.jp" に切り替える。
 * 切替後は X 告知URLも chihogiin.jp に統一する。
 */
export const SITE_URL = "https://chiho-map.vercel.app";

/** DNS反映後の最終形（参考: 切替時にこの値を SITE_URL に入れる） */
export const FUTURE_PRIMARY_URL = "https://chihogiin.jp";

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
