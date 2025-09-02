<?php
// posts.php
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

try {
    $pdo = getDb();
    $tagId = isset($_GET['tag_id']) ? $_GET['tag_id'] : '';
    if ($tagId) {
        // タグIDで絞り込み（posts_tagsテーブルで紐付け）
        $sql = 'SELECT p.id, p.title, p.content, p.created_at FROM posts p
                INNER JOIN posts_tags pt ON p.id = pt.post_id
                WHERE pt.tag_id = ?
                ORDER BY p.created_at DESC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$tagId]);
    } else {
        $stmt = $pdo->query('SELECT id, title, content, created_at FROM posts ORDER BY created_at DESC');
    }
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($posts);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
