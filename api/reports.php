<?php
require_once '../config/database.php';
require_once '../helpers/functions.php';

header('Content-Type: application/json');

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        try {
            $taskId = isset($_GET['task_id']) ? (int)$_GET['task_id'] : 0;
            
            // جلب التقارير مع معلومات المهمة المرتبطة
            $stmt = $pdo->prepare("
                SELECT r.*, t.title as task_title, t.status_type, t.priority
                FROM reports r
                JOIN tasks t ON r.task_id = t.id
                WHERE r.task_id = ?
                ORDER BY r.created_at DESC
            ");
            $stmt->execute([$taskId]);
            $reports = $stmt->fetchAll();
            
            // تنسيق التقارير وإضافة معلومات إضافية
            foreach ($reports as &$report) {
                $report['formatted_date'] = formatArabicDate($report['created_at']);
                $report['status_label'] = getStatusLabel($report['status_type']);
                $report['priority_label'] = getPriorityLabel($report['priority']);
            }
            
            echo json_encode(['success' => true, 'reports' => $reports]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في جلب التقارير']);
        }
        break;

    case 'POST':
        try {
            $taskId = (int)$_POST['task_id'];
            $content = cleanInput($_POST['content']);
            
            // التحقق من وجود المهمة
            $checkStmt = $pdo->prepare("SELECT id FROM tasks WHERE id = ?");
            $checkStmt->execute([$taskId]);
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'المهمة غير موجودة']);
                break;
            }
            
            $stmt = $pdo->prepare("INSERT INTO reports (task_id, content) VALUES (?, ?)");
            $stmt->execute([$taskId, $content]);
            
            // جلب التقرير المضاف مع المعلومات الإضافية
            $reportId = $pdo->lastInsertId();
            $getReportStmt = $pdo->prepare("
                SELECT r.*, t.title as task_title, t.status_type, t.priority
                FROM reports r
                JOIN tasks t ON r.task_id = t.id
                WHERE r.id = ?
            ");
            $getReportStmt->execute([$reportId]);
            $report = $getReportStmt->fetch();
            $report['formatted_date'] = formatArabicDate($report['created_at']);
            
            echo json_encode([
                'success' => true, 
                'message' => 'تم إضافة التقرير بنجاح',
                'report' => $report
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في إضافة التقرير']);
        }
        break;

    case 'PUT':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = (int)$data['id'];
            $content = cleanInput($data['content']);
            
            $stmt = $pdo->prepare("UPDATE reports SET content = ? WHERE id = ?");
            $stmt->execute([$content, $id]);
            
            // جلب التقرير المحدث
            $getReportStmt = $pdo->prepare("
                SELECT r.*, t.title as task_title, t.status_type, t.priority
                FROM reports r
                JOIN tasks t ON r.task_id = t.id
                WHERE r.id = ?
            ");
            $getReportStmt->execute([$id]);
            $report = $getReportStmt->fetch();
            $report['formatted_date'] = formatArabicDate($report['created_at']);
            
            echo json_encode([
                'success' => true, 
                'message' => 'تم تحديث التقرير بنجاح',
                'report' => $report
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في تحديث التقرير']);
        }
        break;

    case 'DELETE':
        try {
            $id = (int)$_GET['id'];
            
            // التحقق من وجود التقرير قبل الحذف
            $checkStmt = $pdo->prepare("SELECT id FROM reports WHERE id = ?");
            $checkStmt->execute([$id]);
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'التقرير غير موجود']);
                break;
            }
            
            $stmt = $pdo->prepare("DELETE FROM reports WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true, 'message' => 'تم حذف التقرير بنجاح']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في حذف التقرير']);
        }
        break;
} 