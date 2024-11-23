<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'database.php';
require_once 'Logger.php';

$db = new Database();
$logger = new Logger();

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // إذا كان الطلب للإحصائيات
            if (isset($_GET['project_id']) && isset($_GET['stats'])) {
                // جلب جميع المهام للمشروع المحدد
                $result = $db->query('
                    SELECT t.*, 
                           (SELECT COUNT(*) FROM subtasks WHERE task_id = t.id) as subtasks_count,
                           (SELECT COUNT(*) FROM subtasks WHERE task_id = t.id AND completed = 1) as completed_subtasks
                    FROM tasks t
                    WHERE project_id = :project_id
                ', [':project_id' => $_GET['project_id']]);
                
                $tasks = [];
                $stats = [
                    'total' => 0,
                    'completed' => 0,
                    'in_progress' => 0,
                    'pending' => 0
                ];
                
                while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                    $tasks[] = $row;
                    $stats['total']++;
                    
                    switch ($row['status']) {
                        case 'completed':
                            $stats['completed']++;
                            break;
                        case 'in-progress':
                            $stats['in_progress']++;
                            break;
                        case 'pending':
                            $stats['pending']++;
                            break;
                    }
                }
                
                // حساب نسبة التقدم الكلية للمشروع
                $totalProgress = 0;
                if (count($tasks) > 0) {
                    foreach ($tasks as $task) {
                        if ($task['subtasks_count'] > 0) {
                            $taskProgress = ($task['completed_subtasks'] / $task['subtasks_count']) * 100;
                        } else {
                            $taskProgress = $task['status'] === 'completed' ? 100 : 0;
                        }
                        $totalProgress += $taskProgress;
                    }
                    $totalProgress = round($totalProgress / count($tasks));
                }
                
                echo json_encode([
                    'success' => true,
                    'tasks' => $tasks,
                    'stats' => $stats,
                    'progress' => $totalProgress
                ]);
                exit;
            }

            // جلب المهام العادية
            $query = 'SELECT * FROM tasks';
            $params = [];
            
            if (isset($_GET['project_id'])) {
                $query .= ' WHERE project_id = :project_id';
                $params[':project_id'] = $_GET['project_id'];
            }
            
            $query .= ' ORDER BY created_at DESC';
            $result = $db->query($query, $params);
            
            $tasks = [];
            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                // إضافة معلومات المهام الفرعية
                $subtasksResult = $db->query('
                    SELECT COUNT(*) as total,
                           SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
                    FROM subtasks
                    WHERE task_id = :task_id
                ', [':task_id' => $row['id']]);
                
                $subtasks = $subtasksResult->fetchArray(SQLITE3_ASSOC);
                $row['subtasks_count'] = $subtasks['total'];
                $row['completed_subtasks'] = $subtasks['completed'];
                
                $tasks[] = $row;
            }
            
            echo json_encode(['success' => true, 'tasks' => $tasks]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || empty($input['title'])) {
                throw new Exception('عنوان المهمة مطلوب');
            }

            if (!isset($input['project_id'])) {
                throw new Exception('معرف المشروع مطلوب');
            }

            $result = $db->query('
                INSERT INTO tasks (project_id, title, description, status)
                VALUES (:project_id, :title, :description, :status)
            ', [
                ':project_id' => $input['project_id'],
                ':title' => $input['title'],
                ':description' => $input['description'] ?? '',
                ':status' => $input['status'] ?? 'pending'
            ]);

            $newId = $db->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'تم إنشاء المهمة بنجاح',
                'id' => $newId
            ]);
            break;

        case 'PUT':
            if (!isset($_GET['id'])) {
                throw new Exception('معرف المهمة مطلوب للتحديث');
            }

            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || empty($input['title'])) {
                throw new Exception('عنوان المهمة مطلوب');
            }

            $result = $db->query('
                UPDATE tasks 
                SET title = :title,
                    description = :description,
                    status = :status,
                    project_id = :project_id
                WHERE id = :id
            ', [
                ':id' => $_GET['id'],
                ':project_id' => $input['project_id'],
                ':title' => $input['title'],
                ':description' => $input['description'] ?? '',
                ':status' => $input['status'] ?? 'pending'
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'تم تحديث المهمة بنجاح'
            ]);
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                throw new Exception('معرف المهمة مطلوب');
            }

            $result = $db->query('
                DELETE FROM tasks WHERE id = :id
            ', [':id' => $_GET['id']]);

            echo json_encode([
                'success' => true,
                'message' => 'تم حذف المهمة بنجاح'
            ]);
            break;

        default:
            throw new Exception('طريقة الطلب غير مدعومة');
    }
} catch (Exception $e) {
    $logger->error('خطأ في معالجة طلب المهام', [
        'error' => $e->getMessage(),
        'method' => $method,
        'input' => json_decode(file_get_contents('php://input'), true)
    ]);
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 