/**
 * サイト全体で使う設定。
 *
 * SITE_URL は OGP/canonical/sitemap/robots の基準URL。
 * 主ドメインは裸ドメイン `chihogiin.jp`（www は 308 で裸へリダイレクト）。
 */
export const SITE_URL = "https://chihogiin.jp";

/**
 * 訂正依頼・問い合わせ用メールアドレス。
 * 国会議員マップ・地方議員マップで共通の運営事務局アドレス。
 * 個人IDの露出を避けるため、運営者個人 Gmail は使わない（2026-05-31 変更）。
 */
export const CORRECTION_EMAIL = "info@kokkaimap.jp";

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
