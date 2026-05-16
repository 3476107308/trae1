<?php
header('Content-Type: application/json; charset=utf-8');

$host = 'localhost';
$dbname = 'todo_app';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $data = json_decode(file_get_contents('php://input'), true);
    $todo_id = $data['todo_id'] ?? '';
    $title = $data['title'] ?? '';
    
    if (!$todo_id || !$title) {
        echo json_encode(['success' => false, 'data' => [], 'message' => '缺少参数']);
        exit;
    }
    
    $stmt = $pdo->prepare("INSERT INTO subtasks (todo_id, title, completed) VALUES (:todo_id, :title, 0)");
    $stmt->execute(['todo_id' => $todo_id, 'title' => $title]);
    
    $id = $pdo->lastInsertId();
    
    echo json_encode(['success' => true, 'data' => ['id' => $id], 'message' => '添加成功']);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'data' => [], 'message' => '数据库连接失败: ' . $e->getMessage()]);
}
?>
