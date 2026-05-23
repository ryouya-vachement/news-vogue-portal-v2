# Vogue News Portal — Opinion Media Portal

ひとつの出来事を、複数の新聞社・通信社がどう報じたかを並列に読み比べるための、Vogue風モノクロデザインのシングルページ・ニュースサイト。

> *Many Voices, One Page.*

## 特徴

- **Vogue風モノクロデザイン** — Playfair Display / Cormorant Garamond によるエディトリアルなタイポグラフィ、`#0a0a0a` × `#f6f4ef` の二色構成
- **同一事象の多視点併記** — ひとつのトップストーリーに対し、朝日・読売・毎日・日経・産経・共同・時事・NHK・ロイター・APの10社の論調を「賛意 / 中立 / 批判 / 国際」のバッジで分類して並列表示
- **読み比べ機能** — `COMPARE` セクションのタブで、AI規制 / 円安 / 半導体 / 気候変動の4テーマを3社並列ビューに切替
- **出典の必須表示** — すべての記事カードに媒体名を併記（Value Proposition Canvasの設計要件）
- **レスポンシブ** — 980px / 720px の2段ブレイクポイント、モバイル用ハンバーガーメニュー
- **スクロールアニメーション** — IntersectionObserverによる段階的フェードアップ、ヒーロー文字の微パララックス、固定背景パララックスバンド、株価ティッカー、COMPAREタブの自動切替

## 設計の元になった要件

このサイトは「意見まとめポータル / OPINION MEDIA PORTAL」のValue Proposition Canvasに基づいて設計されています。主な要件：

- UIをファッション雑誌風にして、ニュースに興味がない人でもとっつきやすく
- 1ページで完結
- 同じ事象を複数社で比較できる
- 出典（媒体名・会社名）を必ず表示
- フィルターバブル防止のため、対局の意見も提示
- 堅苦しくないユニバーサルに読める文章

## 技術スタック

- HTML / CSS / Vanilla JavaScript（フレームワーク不使用）
- Google Fonts: Playfair Display, Cormorant Garamond, Inter
- IntersectionObserver API（スクロールアニメーション）

## ファイル構成

```
opinion-portal/
├── index.html    # マークアップ（10社の論調、4タブ比較、タイムライン他）
├── styles.css    # Vogue風モノクロのスタイル、レスポンシブ
├── script.js     # スクロールリビール、メニュー、タブ切替、パララックス
├── .gitignore
└── README.md
```

## 開く方法

`index.html` をブラウザで直接開けば動作します。

```sh
# Windows
start index.html
# macOS
open index.html
```

---

© 2026 OPINION MEDIA PORTAL — A monochrome daily of many voices.
