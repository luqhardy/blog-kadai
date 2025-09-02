<?php
// add_post.php
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $content = $_POST['content'] ?? '';
    if (!$title || !$content) {
        echo json_encode(['success' => false, 'error' => 'タイトルと本文は必須です']);
        exit;
    }
    try {
        $pdo = getDb();
        $stmt = $pdo->prepare('INSERT INTO posts (title, content) VALUES (?, ?)');
        $stmt->execute([$title, $content]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'POSTで送信してください']);
}
