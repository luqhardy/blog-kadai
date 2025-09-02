<?php

header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {

    $stmt = $pdo->query('SELECT id, name FROM tags ORDER BY id DESC');
    $tags = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($tags);
    exit;
}

if ($method === 'POST') {
    $action = $_POST['action'] ?? '';
    if ($action === 'add') {
        $name = $_POST['name'] ?? '';
        if (!$name) {
            echo json_encode(['success' => false, 'error' => 'タグ名は必須です']);
            exit;
        }
        $stmt = $pdo->prepare('INSERT INTO tags (name) VALUES (?)');
        $stmt->execute([$name]);
        echo json_encode(['success' => true]);
        exit;
    }
    if ($action === 'edit') {
        $id = $_POST['id'] ?? '';
        $name = $_POST['name'] ?? '';
        if (!$id || !$name) {
            echo json_encode(['success' => false, 'error' => 'ID・タグ名は必須です']);
            exit;
        }
        $stmt = $pdo->prepare('UPDATE tags SET name = ? WHERE id = ?');
        $stmt->execute([$name, $id]);
        echo json_encode(['success' => true]);
        exit;
    }
    if ($action === 'delete') {
        $id = $_POST['id'] ?? '';
        if (!$id) {
            echo json_encode(['success' => false, 'error' => 'IDは必須です']);
            exit;
        }
        $stmt = $pdo->prepare('DELETE FROM tags WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        exit;
    }
    echo json_encode(['success' => false, 'error' => '不明なアクションです']);
    exit;
}

echo json_encode(['success' => false, 'error' => '不正なリクエストです']);
