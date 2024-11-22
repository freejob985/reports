<?php
require_once '../config/database.php';
require_once '../helpers/functions.php';

header('Content-Type: application/json');

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        try {
            $taskId = isset($_GET['task_id']) ? (int)$_GET['task_id'] : 0;
            $stmt = $pdo->prepare("
                SELECT * FROM subtasks 
                WHERE task_id = ? 
                ORDER BY priority DESC, created_at ASC
            ");
            $stmt->execute([$taskId]);
            $subtasks = $stmt->fetchAll();
            echo json_encode(['success' => true, 'subtasks' => $subtasks]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في جلب المهام الفرعية']);
        }
        break;

    case 'POST':
        try {
            $taskId = (int)$_POST['task_id'];
            $title = cleanInput($_POST['title']);
            $priority = (int)$_POST['priority'];
            
            // التحقق من وجود المهمة الرئيسية
            $checkStmt = $pdo->prepare("SELECT id FROM tasks WHERE id = ?");
            $checkStmt->execute([$taskId]);
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'المهمة الرئيسية غير موجودة']);
                break;
            }
            
            // الحصول على أعلى ترتيب للمهام الفرعية الحالية
            $orderStmt = $pdo->prepare("
                SELECT MAX(priority) as max_order 
                FROM subtasks 
                WHERE task_id = ?
            ");
            $orderStmt->execute([$taskId]);
            $maxOrder = $orderStmt->fetch()['max_order'];
            $newOrder = $maxOrder ? $maxOrder + 1 : 1;
            
            $stmt = $pdo->prepare("
                INSERT INTO subtasks (task_id, title, priority) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$taskId, $title, $newOrder]);
            
            echo json_encode([
                'success' => true, 
                'message' => 'تم إضافة المهمة الفرعية بنجاح',
                'subtask_id' => $pdo->lastInsertId()
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في إضافة المهمة الفرعية']);
        }
        break;

    case 'PUT':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = (int)$data['id'];
            $title = cleanInput($data['title']);
            $priority = (int)$data['priority'];
            
            $stmt = $pdo->prepare("
                UPDATE subtasks 
                SET title = ?, priority = ? 
                WHERE id = ?
            ");
            $stmt->execute([$title, $priority, $id]);
            
            echo json_encode(['success' => true, 'message' => 'تم تحديث المهمة الفرعية بنجاح']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في تحديث المهمة الفرعية']);
        }
        break;

    case 'PATCH':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = (int)$data['id'];
            
            // تحديث الحالة
            if (isset($data['status'])) {
                $status = (bool)$data['status'];
                $stmt = $pdo->prepare("UPDATE subtasks SET status = ? WHERE id = ?");
                $stmt->execute([$status, $id]);
            }
            
            // تحديث الترتيب
            if (isset($data['order'])) {
                $order = (int)$data['order'];
                // الحصول على task_id للمهمة الفرعية
                $getTaskIdStmt = $pdo->prepare("SELECT task_id FROM subtasks WHERE id = ?");
                $getTaskIdStmt->execute([$id]);
                $taskId = $getTaskIdStmt->fetch()['task_id'];
                
                // تحديث ترتيب جميع المهام الفرعية
                $stmt = $pdo->prepare("
                    UPDATE subtasks 
                    SET priority = ? 
                    WHERE id = ?
                ");
                $stmt->execute([$order, $id]);
                
                // إعادة ترتيب باقي المهام الفرعية
                reorderSubtasks($taskId);
            }
            
            echo json_encode(['success' => true, 'message' => 'تم تحديث المهمة الفرعية بنجاح']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في تحديث المهمة الفرعية']);
        }
        break;

    case 'DELETE':
        try {
            $id = (int)$_GET['id'];
            
            // الحصول على task_id قبل الحذف
            $getTaskIdStmt = $pdo->prepare("SELECT task_id FROM subtasks WHERE id = ?");
            $getTaskIdStmt->execute([$id]);
            $taskId = $getTaskIdStmt->fetch()['task_id'];
            
            // حذف المهمة الفرعية
            $stmt = $pdo->prepare("DELETE FROM subtasks WHERE id = ?");
            $stmt->execute([$id]);
            
            // إعادة ترتيب المهام الفرعية المتبقية
            reorderSubtasks($taskId);
            
            echo json_encode(['success' => true, 'message' => 'تم حذف المهمة الفرعية بنجاح']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في حذف المهمة الفرعية']);
        }
        break;
} 