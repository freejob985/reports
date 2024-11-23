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
            if (isset($_GET['id'])) {
                $result = $db->query('
                    SELECT * FROM projects WHERE id = :id
                ', [':id' => $_GET['id']]);
                
                $project = $result->fetchArray(SQLITE3_ASSOC);
                if ($project) {
                    echo json_encode([
                        'success' => true,
                        'project' => $project
                    ]);
                } else {
                    throw new Exception('المشروع غير موجود');
                }
                break;
            }
            $result = $db->query('SELECT * FROM projects ORDER BY created_at DESC');
            $projects = [];
            
            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                $tasksCount = $db->query('
                    SELECT COUNT(*) as count FROM tasks WHERE project_id = :project_id
                ', [':project_id' => $row['id']])->fetchArray(SQLITE3_ASSOC);
                
                $row['tasks_count'] = $tasksCount['count'];
                $projects[] = $row;
            }
            
            echo json_encode(['success' => true, 'projects' => $projects]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || empty($input['name'])) {
                throw new Exception('اسم المشروع مطلوب');
            }

            $result = $db->query('
                INSERT INTO projects (name, description)
                VALUES (:name, :description)
            ', [
                ':name' => $input['name'],
                ':description' => $input['description'] ?? ''
            ]);

            $newId = $db->lastInsertId();
            echo json_encode([
                'success' => true,
                'message' => 'تم إنشاء المشروع بنجاح',
                'id' => $newId
            ]);
            break;

        case 'DELETE':
            if (isset($_GET['action']) && $_GET['action'] === 'truncate') {
                $db->query('DELETE FROM projects');
                $db->query('DELETE FROM tasks');
                $db->query('DELETE FROM subtasks');
                $db->query('DELETE FROM reports');
                
                echo json_encode([
                    'success' => true,
                    'message' => 'تم حذف جميع البيانات بنجاح'
                ]);
            } else if (isset($_GET['id'])) {
                $db->query('DELETE FROM projects WHERE id = :id', [':id' => $_GET['id']]);
                echo json_encode([
                    'success' => true,
                    'message' => 'تم حذف المشروع بنجاح'
                ]);
            } else {
                throw new Exception('معرف المشروع مطلوب');
            }
            break;

        case 'PUT':
            if (!isset($_GET['id'])) {
                throw new Exception('معرف المشروع مطلوب للتحديث');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || empty($input['name'])) {
                throw new Exception('اسم المشروع مطلوب');
            }
            
            $result = $db->query('
                UPDATE projects 
                SET name = :name,
                    description = :description
                WHERE id = :id
            ', [
                ':id' => $_GET['id'],
                ':name' => $input['name'],
                ':description' => $input['description'] ?? ''
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'تم تحديث المشروع بنجاح'
            ]);
            break;

        default:
            throw new Exception('طريقة الطلب غير مدعومة');
    }
} catch (Exception $e) {
    $logger->error('خطأ في معالجة طلب المشاريع', [
        'error' => $e->getMessage()
    ]);
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 