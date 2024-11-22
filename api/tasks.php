<?php
require_once '../config/database.php';
require_once '../helpers/functions.php';

header('Content-Type: application/json');

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        try {
            if (isset($_GET['id'])) {
                // جلب مهمة واحدة مع مهامها الفرعية
                $taskId = (int)$_GET['id'];
                $stmt = $pdo->prepare("
                    SELECT t.*, 
                           GROUP_CONCAT(st.id) as subtask_ids,
                           GROUP_CONCAT(st.title) as subtask_titles,
                           GROUP_CONCAT(st.status) as subtask_statuses,
                           GROUP_CONCAT(st.priority) as subtask_priorities
                    FROM tasks t
                    LEFT JOIN subtasks st ON t.id = st.task_id
                    WHERE t.id = ?
                    GROUP BY t.id
                ");
                $stmt->execute([$taskId]);
                $task = $stmt->fetch();
                
                if ($task) {
                    // تحويل المهام الفرعية إلى مصفوفة
                    if ($task['subtask_ids']) {
                        $subtasks = [];
                        $ids = explode(',', $task['subtask_ids']);
                        $titles = explode(',', $task['subtask_titles']);
                        $statuses = explode(',', $task['subtask_statuses']);
                        $priorities = explode(',', $task['subtask_priorities']);
                        
                        for ($i = 0; $i < count($ids); $i++) {
                            $subtasks[] = [
                                'id' => $ids[$i],
                                'title' => $titles[$i],
                                'status' => $statuses[$i],
                                'priority' => $priorities[$i]
                            ];
                        }
                        $task['subtasks'] = $subtasks;
                    }
                    
                    // جلب التقارير المرتبطة
                    $reportsStmt = $pdo->prepare("SELECT * FROM reports WHERE task_id = ? ORDER BY created_at DESC");
                    $reportsStmt->execute([$taskId]);
                    $task['reports'] = $reportsStmt->fetchAll();
                    
                    echo json_encode(['success' => true, 'task' => $task]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'المهمة غير موجودة']);
                }
            } else {
                // جلب جميع المهام مع المهام الفرعية
                $stmt = $pdo->query("
                    SELECT t.*, 
                           GROUP_CONCAT(st.id) as subtask_ids,
                           GROUP_CONCAT(st.title) as subtask_titles,
                           GROUP_CONCAT(st.status) as subtask_statuses,
                           GROUP_CONCAT(st.priority) as subtask_priorities
                    FROM tasks t
                    LEFT JOIN subtasks st ON t.id = st.task_id
                    WHERE t.parent_id IS NULL
                    GROUP BY t.id
                    ORDER BY t.priority DESC, t.created_at DESC
                ");
                $tasks = $stmt->fetchAll();
                
                // تحويل المهام الفرعية لكل مهمة
                foreach ($tasks as &$task) {
                    if ($task['subtask_ids']) {
                        // نفس المنطق السابق لتحويل المهام الفرعية
                    }
                    
                    // جلب التقارير لكل مهمة
                    $reportsStmt = $pdo->prepare("SELECT * FROM reports WHERE task_id = ? ORDER BY created_at DESC");
                    $reportsStmt->execute([$task['id']]);
                    $task['reports'] = $reportsStmt->fetchAll();
                }
                
                echo json_encode(['success' => true, 'tasks' => $tasks]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في جلب المهام']);
        }
        break;

    case 'POST':
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

    case 'PUT':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = (int)$data['id'];
            $title = cleanInput($data['title']);
            $description = cleanInput($data['description']);
            
            $stmt = $pdo->prepare("UPDATE tasks SET title = ?, description = ? WHERE id = ?");
            $stmt->execute([$title, $description, $id]);
            
            echo json_encode(['success' => true, 'message' => 'تم تحديث المهمة بنجاح']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في تحديث المهمة']);
        }
        break;

    case 'DELETE':
        try {
            $id = (int)$_GET['id'];
            $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true, 'message' => 'تم حذف المهمة بنجاح']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في حذف المهمة']);
        }
        break;

    case 'PATCH':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = (int)$data['id'];
            $status = (bool)$data['status'];
            
            $stmt = $pdo->prepare("UPDATE tasks SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            
            echo json_encode(['success' => true, 'message' => 'تم تحديث حالة المهمة بنجاح']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'خطأ في تحديث حالة المهمة']);
        }
        break;
} 