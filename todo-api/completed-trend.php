<?php
header('Content-Type: application/json; charset=utf-8');

$host = 'localhost';
$dbname = 'todo_app';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $days = $_GET['days'] ?? 7;
    
    $result = [];
    for ($i = $days - 1; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i day"));
        $result[$date] = 0;
    }
    
    $startDate = date('Y-m-d', strtotime("-" . ($days - 1) . " day"));
    $endDate = date('Y-m-d');
    
    $stmt = $pdo->prepare("SELECT date, SUM(completed) as completedCount FROM todos WHERE date BETWEEN :startDate AND :endDate GROUP BY date");
    $stmt->execute(['startDate' => $startDate, 'endDate' => $endDate]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($rows as $row) {
        if (isset($result[$row['date']])) {
            $result[$row['date']] = (int)$row['completedCount'];
        }
    }
    
    $formattedResult = [];
    foreach ($result as $date => $count) {
        $formattedResult[] = ['date' => $date, 'completedCount' => $count];
    }
    
    echo json_encode(['success' => true, 'data' => $formattedResult, 'message' => '']);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'data' => [], 'message' => '数据库连接失败: ' . $e->getMessage()]);
}
?>