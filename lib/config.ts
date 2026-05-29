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
