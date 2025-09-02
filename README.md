
# blog-kadai

## 概要
PHPとMySQL（MAMP環境）で動作するシンプルなブログ管理アプリです。
ブログ投稿・編集・削除、タグ管理、タグ検索が可能です。

## 主な機能
- ブログ一覧表示（新規投稿・編集・削除ボタン付き）
- 新規投稿画面
- 投稿編集画面
- タグ管理（追加・編集・削除）
- タグ検索（一覧画面でタグで絞り込み）

## 必要環境
- MAMP（Mac用ローカル開発環境）
- PHP 7.4以上
- MySQL（MAMP付属）

## セットアップ手順
1. MAMPをインストールし、MySQLサーバーを起動します。
2. MySQLで `blog_kadai` というデータベースを作成します。
3. 以下のSQLでテーブルを作成してください：
	 ```sql
	 CREATE TABLE posts (
		 id INT AUTO_INCREMENT PRIMARY KEY,
		 title VARCHAR(255) NOT NULL,
		 content TEXT NOT NULL,
		 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	 );

	 CREATE TABLE tags (
		 id INT AUTO_INCREMENT PRIMARY KEY,
		 name VARCHAR(100) NOT NULL
	 );

	 CREATE TABLE posts_tags (
		 post_id INT NOT NULL,
		 tag_id INT NOT NULL,s
		 PRIMARY KEY (post_id, tag_id),
		 FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
		 FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
	 );
	 ```
4. `db.php`のDB名・ユーザー名・パスワード・ポート番号（MAMPは通常8889）を環境に合わせて修正します。
5. プロジェクトをMAMPの`htdocs`フォルダに配置し、ブラウザで`index.html`を開いて動作確認します。

## 使い方
1. ブラウザで`index.html`を開くと、ブログ一覧画面が表示されます。
2. 「新規投稿」ボタンで投稿作成、各投稿の「編集」「削除」ボタンで操作可能です。
3. タグ管理画面でタグの追加・編集・削除ができます。
4. タグ検索で特定タグの投稿のみ表示できます。

## ファイル構成
- index.html : メイン画面
- script.js : クライアントサイドJS
- db.php : データベース接続
- posts.php : ブログ一覧取得・タグ検索
- add_post.php : 新規投稿
- edit_post.php : 投稿編集
- delete_post.php : 投稿削除
- tags.php : タグ管理API

## ライセンス
MIT