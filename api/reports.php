<?php
require_once '../config/database.php';
require_once '../helpers/functions.php';

header('Content-Type: application/json');

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // جلب التقارير الخاصة بمهمة معينة
        try {
            $taskId = isset($_GET['task_id']) ? (int)$_GET['task_id'] : 0;
            $stmt = $pdo->prepare("SELECT * FROM reports WHERE task_id = ? ORDER BY created_at DESC");
            $stmt->execute([$taskId]);
            $reports = $stmt->fetchAll();
            echo json_encode(['success' => true, 'reports' => $reports]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في جلب التقارير']);
        }
        break;

    case 'POST':
        // إضافة تقرير جديد
        try {
            $taskId = (int)$_POST['task_id'];
            $content = $_POST['content'];
            
            $stmt = $pdo->prepare("INSERT INTO reports (task_id, content) VALUES (?, ?)");
            $stmt->execute([$taskId, $content]);
            
            echo json_encode(['success' => true, 'message' => 'تم إضافة التقرير بنجاح']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في إضافة التقرير']);
        }
        break;
} 