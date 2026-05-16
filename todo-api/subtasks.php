<?php
header('Content-Type: application/json; charset=utf-8');

$host = 'localhost';
$dbname = 'todo_app';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $todo_id = $_GET['todo_id'] ?? '';
    
    if (!$todo_id) {
        echo json_encode(['success' => false, 'data' => [], 'message' => '缺少 todo_id 参数']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM subtasks WHERE todo_id = :todo_id ORDER BY created_at ASC");
    $stmt->execute(['todo_id' => $todo_id]);
    $subtasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $subtasks, 'message' => '']);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'data' => [], 'message' => '数据库连接失败: ' . $e->getMessage()]);
}
?>
