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
    $title = $data['title'] ?? '';
    $date = $data['date'] ?? '';
    $priority = $data['priority'] ?? 'P2';
    
    if (!$title || !$date) {
        echo json_encode(['success' => false, 'data' => [], 'message' => '缺少必要参数']);
        exit;
    }
    
    $stmt = $pdo->prepare("INSERT INTO todos (title, completed, date, priority) VALUES (:title, 0, :date, :priority)");
    $stmt->execute(['title' => $title, 'date' => $date, 'priority' => $priority]);
    
    $id = $pdo->lastInsertId();
    
    echo json_encode(['success' => true, 'data' => ['id' => $id], 'message' => '添加成功']);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'data' => [], 'message' => '数据库连接失败: ' . $e->getMessage()]);
}
?>