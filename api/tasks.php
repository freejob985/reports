<?php
require_once '../config/database.php';
require_once '../helpers/functions.php';

header('Content-Type: application/json');

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // جلب المهام
        try {
            $stmt = $pdo->query("SELECT * FROM tasks ORDER BY created_at DESC");
            $tasks = $stmt->fetchAll();
            echo json_encode(['success' => true, 'tasks' => $tasks]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في جلب المهام']);
        }
        break;

    case 'POST':
        // إضافة مهمة جديدة
        try {
            $title = cleanInput($_POST['title']);
            $description = cleanInput($_POST['description']);
            
            $stmt = $pdo->prepare("INSERT INTO tasks (title, description) VALUES (?, ?)");
            $stmt->execute([$title, $description]);
            
            echo json_encode(['success' => true, 'message' => 'تم إضافة المهمة بنجاح']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في إضافة المهمة']);
        }
        break;
} 