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
    $id = $data['id'] ?? 0;
    
    if (!$id) {
        echo json_encode(['success' => false, 'data' => [], 'message' => '缺少ID参数']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT completed FROM todos WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $todo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$todo) {
        echo json_encode(['success' => false, 'data' => [], 'message' => '事项不存在']);
        exit;
    }
    
    $newStatus = $todo['completed'] == 1 ? 0 : 1;
    
    $stmt = $pdo->prepare("UPDATE todos SET completed = :completed WHERE id = :id");
    $stmt->execute(['completed' => $newStatus, 'id' => $id]);
    
    echo json_encode(['success' => true, 'data' => ['completed' => $newStatus], 'message' => '状态更新成功']);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'data' => [], 'message' => '数据库连接失败: ' . $e->getMessage()]);
}
?>