<?php
define('DB_HOST', 'localhost:8889');
define('DB_USER', 'root');
define('DB_PASS', 'root');
define('DB_NAME', 'blog_test_db');

try {
    $dbh = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'データベース接続失敗: ' . $e->getMessage()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $content = $data['content'] ?? '';

    if (!empty($content)) {
        try {
            $stmt = $dbh->prepare("INSERT INTO posts (content) VALUES (:content)");
            $stmt->bindParam(':content', $content, PDO::PARAM_STR);
            $stmt->execute();
            echo json_encode(['status' => 'success']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'SQLエラー: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => '投稿内容がありません']);
    }

} elseif ($method === 'GET') {
    $stmt = $dbh->query("SELECT id, content, created_at FROM posts ORDER BY created_at DESC");
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($posts as &$post) {
        $post['created_at'] = (new DateTime($post['created_at']))->format('Y/m/d H:i');
    }
    header('Content-Type: application/json');
    echo json_encode($posts);
}
?>