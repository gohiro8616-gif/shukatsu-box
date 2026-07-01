@AGENTS.md

## 開発状況メモ（セッション引き継ぎ用）

ShukatsuBox = Next.js + Supabase + Gmail API + Claude AIを使った就活管理アプリ。ユーザーは開発初心者なので、専門用語を避けて手順を1つずつ説明すること。

**完了済み:**
- Supabaseプロジェクト作成、DBテーブル作成（`supabase/migrations/001_initial_schema.sql`）
- Google Cloud ConsoleでOAuthクライアント作成、テストユーザー登録
- SupabaseにGoogleログインプロバイダ設定
- ユーザーのローカル環境で`.env.local`に本物の値を設定済み（Supabase URL/key、Google Client ID/Secret、Anthropic APIキー）
- ローカルでのGoogleログイン成功、Gmailメール取得成功を確認済み

**未解決の課題:**
- `/api/analyze`（AI分析機能）で `invalid x-api-key` エラーが発生していた。新しいAnthropic APIキーを`.env.local`に設定し直したが、まだ動作確認できていない。次回はまず「メール取得 & AI分析」ボタンを押して、AI分析が正常に動くか確認すること。

**開発環境:**
- ユーザーはWindows PCでパワーシェルを使い、`npm run dev`でローカル起動して動作確認している
- ターミナル版Claude Code（superpowersプラグイン導入済み）とbrowser版Claude Codeの両方を使っているが、この2つはセッションが分離しており、GitHubへのpush/pullでのみ変更が伝わる
