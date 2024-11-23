<?php
header('Content-Type: application/json');
require_once 'database.php';
require_once 'Logger.php';

$db = new Database();
$logger = new Logger();

// تحديد طريقة الطلب
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// دالة للتحقق من البيانات المطلوبة
function validateTaskData($data) {
    global $logger;
    
    if (!is_array($data)) {
        $logger->error('البيانات المرسلة غير صحيحة', ['data' => $data]);
        return ['valid' => false, 'message' => 'البيانات المرسلة غير صحيحة'];
    }
    
    if (empty($data['title'])) {
        $logger->error('عنوان المهمة مطلوب', ['data' => $data]);
        return ['valid' => false, 'message' => 'عنوان المهمة مطلوب'];
    }
    
    // تحديث قائمة الحالات المسموح بها
    $allowedStatuses = [
        'pending', 'in-progress', 'completed', 'cancelled',
        'development', 'paused', 'postponed', 'searching'
    ];
    
    // التأكد من وجود القيم الأساسية وتعيين القيم الافتراضية
    $cleanData = [
        'title' => trim($data['title']),
        'description' => isset($data['description']) ? trim($data['description']) : '',
        'status' => isset($data['status']) && in_array($data['status'], $allowedStatuses) 
            ? $data['status'] 
            : 'pending'
    ];
    
    $logger->info('تم التحقق من صحة البيانات بنجاح', ['cleanData' => $cleanData]);
    return ['valid' => true, 'data' => $cleanData];
}

try {
    $logger->info('بدء معالجة الطلب', [
        'method' => $method,
        'request_data' => file_get_contents('php://input'),
        'request_headers' => getallheaders()
    ]);

    switch ($method) {
        case 'GET':
            $result = $db->query('SELECT * FROM tasks ORDER BY created_at DESC');
            $tasks = [];
            
            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                // حساب نسبة التقدم من المهام الفرعية
                $subtasksResult = $db->query('
                    SELECT COUNT(*) as total,
                           SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
                    FROM subtasks
                    WHERE task_id = :task_id
                ', [':task_id' => $row['id']]);
                
                $subtasks = $subtasksResult->fetchArray(SQLITE3_ASSOC);
                
                $row['progress'] = 0;
                if ($subtasks && $subtasks['total'] > 0) {
                    $row['progress'] = ($subtasks['completed'] / $subtasks['total']) * 100;
                }
                
                $tasks[] = $row;
            }
            
            $logger->info('تم جلب المهام بنجاح', ['count' => count($tasks)]);
            echo json_encode(['success' => true, 'tasks' => $tasks]);
            break;
            
        case 'POST':
            $rawInput = file_get_contents('php://input');
            $logger->debug('البيانات المستلمة', ['raw_input' => $rawInput]);
            
            $input = json_decode($rawInput, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $logger->error('خطأ في تحليل JSON', ['error' => json_last_error_msg()]);
                throw new Exception('خطأ في تحليل البيانات المرسلة');
            }
            
            $validation = validateTaskData($input);
            
            if (!$validation['valid']) {
                $logger->warning('فشل التحقق من صحة البيانات', ['validation' => $validation]);
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => $validation['message']]);
                break;
            }
            
            $data = $validation['data'];
            
            try {
                $result = $db->query('
                    INSERT INTO tasks (title, description, status)
                    VALUES (:title, :description, :status)
                ', [
                    ':title' => $data['title'],
                    ':description' => $data['description'],
                    ':status' => $data['status']
                ]);
                
                $newId = $db->lastInsertId();
                $logger->info('تم إنشاء مهمة جديدة', ['task_id' => $newId, 'data' => $data]);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'تم إنشاء المهمة بنجاح',
                    'id' => $newId
                ]);
            } catch (Exception $e) {
                $logger->error('فشل في إنشاء المهمة', [
                    'error' => $e->getMessage(),
                    'data' => $data
                ]);
                throw new Exception('فشل في إنشاء المهمة: ' . $e->getMessage());
            }
            break;
            
        case 'PUT':
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                $logger->error('خطأ في تحليل JSON للتحديث', ['error' => json_last_error_msg()]);
                throw new Exception('خطأ في تحليل البيانات المرسلة');
            }
            
            if (empty($input['id'])) {
                $logger->error('معرف المهمة مطلوب للتحديث', ['input' => $input]);
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'معرف المهمة مطلوب']);
                break;
            }
            
            $validation = validateTaskData($input);
            if (!$validation['valid']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => $validation['message']]);
                break;
            }
            
            $data = $validation['data'];
            
            try {
                $result = $db->query('
                    UPDATE tasks 
                    SET title = :title,
                        description = :description,
                        status = :status
                    WHERE id = :id
                ', [
                    ':id' => $input['id'],
                    ':title' => $data['title'],
                    ':description' => $data['description'],
                    ':status' => $data['status']
                ]);
                
                $logger->info('تم تحديث المهمة بنجاح', [
                    'task_id' => $input['id'],
                    'data' => $data
                ]);
                
                echo json_encode(['success' => true, 'message' => 'تم تحديث المهمة بنجاح']);
            } catch (Exception $e) {
                $logger->error('فشل في تحديث المهمة', [
                    'error' => $e->getMessage(),
                    'task_id' => $input['id'],
                    'data' => $data
                ]);
                throw $e;
            }
            break;
            
        case 'DELETE':
            if (!isset($_GET['id'])) {
                $logger->error('معرف المهمة مطلوب للحذف');
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'معرف المهمة مطلوب']);
                break;
            }
            
            try {
                $result = $db->query('DELETE FROM tasks WHERE id = :id', [':id' => $_GET['id']]);
                $logger->info('تم حذف المهمة بنجاح', ['task_id' => $_GET['id']]);
                echo json_encode(['success' => true, 'message' => 'تم حذف المهمة بنجاح']);
            } catch (Exception $e) {
                $logger->error('فشل في حذف المهمة', [
                    'error' => $e->getMessage(),
                    'task_id' => $_GET['id']
                ]);
                throw $e;
            }
            break;
            
        default:
            $logger->warning('طريقة طلب ير مدعومة', ['method' => $method]);
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'طريقة الطلب غير مدعومة']);
            break;
    }
} catch (Exception $e) {
    $logger->error('خطأ في الخادم', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'method' => $method,
        'request_uri' => $_SERVER['REQUEST_URI']
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ في الخادم: ' . $e->getMessage()
    ]);
} 