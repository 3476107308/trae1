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
    $id = $data['id'] ?? '';
    
    if (!$id) {
        echo json_encode(['success' => false, 'data' => [], 'message' => '缺少 id 参数']);
        exit;
    }
    
    $stmt = $pdo->prepare("DELETE FROM subtasks WHERE id = :id");
    $stmt->execute(['id' => $id]);
    
    echo json_encode(['success' => true, 'data' => [], 'message' => '删除成功']);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'data' => [], 'message' => '数据库连接失败: ' . $e->getMessage()]);
}
?>
