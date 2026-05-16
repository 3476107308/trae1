<?php
header('Content-Type: application/json; charset=utf-8');

$host = 'localhost';
$dbname = 'todo_app';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $month = $_GET['month'] ?? '';
    
    if (!$month) {
        echo json_encode(['success' => false, 'data' => [], 'message' => '缺少月份参数']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT date, COUNT(*) as total, SUM(completed) as completed FROM todos WHERE date LIKE :month GROUP BY date");
    $stmt->execute(['month' => $month . '%']);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $results, 'message' => '']);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'data' => [], 'message' => '数据库连接失败: ' . $e->getMessage()]);
}
?>