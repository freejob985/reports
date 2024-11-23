<?php
header('Content-Type: application/json');
require_once 'database.php';
require_once 'Logger.php';

$db = new Database();
$logger = new Logger();

// تحديد طريقة الطلب
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $logger->info('بدء معالجة طلب المهام الفرعية', [
        'method' => $method,
        'request_data' => file_get_contents('php://input')
    ]);

    switch ($method) {
        case 'GET':
            if (!isset($_GET['task_id'])) {
                throw new Exception('معرف المهمة الرئيسية مطلوب');
            }

            $result = $db->query('
                SELECT * FROM subtasks 
                WHERE task_id = :task_id 
                ORDER BY created_at ASC
            ', [':task_id' => $_GET['task_id']]);

            $subtasks = [];
            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                $subtasks[] = $row;
            }

            $logger->info('تم جلب المهام الفرعية', [
                'task_id' => $_GET['task_id'],
                'count' => count($subtasks)
            ]);

            echo json_encode(['success' => true, 'subtasks' => $subtasks]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['task_id']) || !isset($input['title'])) {
                throw new Exception('البيانات المطلوبة غير مكتملة');
            }

            $result = $db->query('
                INSERT INTO subtasks (task_id, title)
                VALUES (:task_id, :title)
            ', [
                ':task_id' => $input['task_id'],
                ':title' => trim($input['title'])
            ]);

            $newId = $db->lastInsertId();
            $logger->info('تم إضافة مهمة فرعية جديدة', [
                'id' => $newId,
                'task_id' => $input['task_id']
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'تم إضافة المهمة الفرعية بنجاح',
                'id' => $newId
            ]);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id']) || !isset($input['completed'])) {
                throw new Exception('البيانات المطلوبة غير مكتملة');
            }

            $result = $db->query('
                UPDATE subtasks 
                SET completed = :completed
                WHERE id = :id
            ', [
                ':id' => $input['id'],
                ':completed' => $input['completed'] ? 1 : 0
            ]);

            $logger->info('تم تحديث حالة المهمة الفرعية', [
                'id' => $input['id'],
                'completed' => $input['completed']
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'تم تحديث المهمة الفرعية بنجاح'
            ]);
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                throw new Exception('معرف المهمة الفرعية مطلوب');
            }

            $result = $db->query('
                DELETE FROM subtasks WHERE id = :id
            ', [':id' => $_GET['id']]);

            $logger->info('تم حذف المهمة الفرعية', ['id' => $_GET['id']]);

            echo json_encode([
                'success' => true,
                'message' => 'تم حذف المهمة الفرعية بنجاح'
            ]);
            break;

        default:
            throw new Exception('طريقة الطلب غير مدعومة');
    }
} catch (Exception $e) {
    $logger->error('خطأ في معالجة طلب المهام الفرعية', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);

    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 