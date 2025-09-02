<?php
// edit_post.php
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $title = $_POST['title'] ?? '';
    $content = $_POST['content'] ?? '';
    if (!$id || !$title || !$content) {
        echo json_encode(['success' => false, 'error' => 'ID・タイトル・本文は必須です']);
        exit;
    }
    try {
        $pdo = getDb();
        $stmt = $pdo->prepare('UPDATE posts SET title = ?, content = ? WHERE id = ?');
        $stmt->execute([$title, $content, $id]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'POSTで送信してください']);
}
