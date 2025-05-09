<?php
header('Content-Type: application/json');
require_once 'database.php';
require_once 'Logger.php';

$db = new Database();
$logger = new Logger();

// تحديد طريقة الطلب
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $logger->info('بدء معالجة طلب التقارير', [
        'method' => $method,
        'request_data' => file_get_contents('php://input')
    ]);

    switch ($method) {
        case 'GET':
            // إذا تم تحديد معرف تقرير محدد
            if (isset($_GET['id'])) {
                $result = $db->query('
                    SELECT * FROM reports 
                    WHERE id = :id
                ', [':id' => $_GET['id']]);

                $report = $result->fetchArray(SQLITE3_ASSOC);
                
                if (!$report) {
                    throw new Exception('التقرير غير موجود');
                }

                $logger->info('تم جلب التقرير', ['id' => $_GET['id']]);
                echo json_encode([
                    'success' => true,
                    'report' => $report
                ]);
                break;
            }

            // إذا تم تحديد معرف المهمة
            if (!isset($_GET['task_id'])) {
                throw new Exception('معرف المهمة الرئيسية مطلوب');
            }

            $result = $db->query('
                SELECT * FROM reports 
                WHERE task_id = :task_id 
                ORDER BY created_at DESC
            ', [':task_id' => $_GET['task_id']]);

            $reports = [];
            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                $reports[] = $row;
            }

            $logger->info('تم جلب التقارير', [
                'task_id' => $_GET['task_id'],
                'count' => count($reports)
            ]);

            echo json_encode(['success' => true, 'reports' => $reports]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['task_id']) || !isset($input['content']) || !isset($input['html_content'])) {
                throw new Exception('البيانات المطلوبة غير مكتملة');
            }

            $result = $db->query('
                INSERT INTO reports (task_id, content, html_content, created_at)
                VALUES (:task_id, :content, :html_content, datetime("now", "localtime"))
            ', [
                ':task_id' => $input['task_id'],
                ':content' => $input['content'],
                ':html_content' => $input['html_content']
            ]);

            $newId = $db->lastInsertId();
            $logger->info('تم إضافة تقرير جديد', [
                'id' => $newId,
                'task_id' => $input['task_id']
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'تم إضافة التقرير بنجاح',
                'id' => $newId
            ]);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($_GET['id'])) {
                throw new Exception('معرف التقرير مطلوب للتحديث');
            }

            if (!isset($input['content']) || !isset($input['html_content'])) {
                throw new Exception('محتوى التقرير مطلوب');
            }

            $result = $db->query('
                UPDATE reports 
                SET content = :content,
                    html_content = :html_content,
                    created_at = datetime("now", "localtime")
                WHERE id = :id
            ', [
                ':id' => $_GET['id'],
                ':content' => $input['content'],
                ':html_content' => $input['html_content']
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'تم تحديث التقرير بنجاح'
            ]);
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                throw new Exception('معرف التقرير مطلوب');
            }

            $result = $db->query('
                DELETE FROM reports WHERE id = :id
            ', [':id' => $_GET['id']]);

            $logger->info('تم حذف التقرير', ['id' => $_GET['id']]);

            echo json_encode([
                'success' => true,
                'message' => 'تم حذف التقرير بنجاح'
            ]);
            break;

        default:
            throw new Exception('طريقة الطلب غير مدعومة');
    }
} catch (Exception $e) {
    $logger->error('خطأ في معالجة طلب التقارير', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);

    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 