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
    $title = $data['title'] ?? '';
    $description = $data['description'] ?? '';
    $date = $data['date'] ?? '';
    $category = $data['category'] ?? '';
    $priority = $data['priority'] ?? 'P2';
    
    if (!$id || !$title) {
        echo json_encode(['success' => false, 'data' => [], 'message' => '缺少必要参数']);
        exit;
    }
    
    $stmt = $pdo->prepare("UPDATE todos SET title = :title, description = :description, date = :date, category = :category, priority = :priority WHERE id = :id");
    $stmt->execute([
        'id' => $id,
        'title' => $title,
        'description' => $description,
        'date' => $date,
        'category' => $category,
        'priority' => $priority
    ]);
    
    echo json_encode(['success' => true, 'data' => [], 'message' => '更新成功']);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'data' => [], 'message' => '数据库连接失败: ' . $e->getMessage()]);
}
?>
