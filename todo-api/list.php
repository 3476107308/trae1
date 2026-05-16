<?php
header('Content-Type: application/json; charset=utf-8');

$host = 'localhost';
$dbname = 'todo_app';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $date = $_GET['date'] ?? '';
    $startDate = $_GET['startDate'] ?? '';
    $endDate = $_GET['endDate'] ?? '';
    
    if ($startDate && $endDate) {
        $stmt = $pdo->prepare("SELECT * FROM todos WHERE date BETWEEN :startDate AND :endDate ORDER BY date ASC, FIELD(priority, 'P1', 'P2', 'P3'), created_at DESC");
        $stmt->execute(['startDate' => $startDate, 'endDate' => $endDate]);
        $todos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } elseif ($date) {
        $stmt = $pdo->prepare("SELECT * FROM todos WHERE date = :date ORDER BY FIELD(priority, 'P1', 'P2', 'P3'), created_at DESC");
        $stmt->execute(['date' => $date]);
        $todos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $stmt = $pdo->query("SELECT * FROM todos ORDER BY date DESC, FIELD(priority, 'P1', 'P2', 'P3'), created_at DESC");
        $todos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode(['success' => true, 'data' => $todos, 'message' => '']);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'data' => [], 'message' => '数据库连接失败: ' . $e->getMessage()]);
}
?>