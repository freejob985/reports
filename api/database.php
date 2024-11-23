<?php
require_once 'Logger.php';

class Database {
    private $db;
    private $logger;
    
    public function __construct() {
        $this->logger = new Logger();
        
        // التأكد من وجود مجلد data
        $dataDir = __DIR__ . '/../data';
        if (!file_exists($dataDir)) {
            if (!mkdir($dataDir, 0777, true)) {
                $this->logger->error('فشل في إنشاء مجلد data');
                die('فشل في إنشاء مجلد data');
            }
            chmod($dataDir, 0777);
            $this->logger->info('تم إنشاء مجلد data بنجاح');
        }
        
        $dbPath = $dataDir . '/tasks.db';
        $isNewDb = !file_exists($dbPath);
        
        try {
            if (!is_writable($dataDir)) {
                $this->logger->error('لا توجد صلاحيات كتابة على مجلد data');
                die('لا توجد صلاحيات كتابة على مجلد data');
            }
            
            $this->db = new SQLite3($dbPath);
            chmod($dbPath, 0666);
            $this->db->exec('PRAGMA foreign_keys = ON');
            
            if ($isNewDb) {
                $this->createTables();
                $this->logger->info('تم إنشاء قاعدة البيانات وجداولها بنجاح');
            }
        } catch (Exception $e) {
            $this->logger->error('خطأ في الاتصال بقاعدة البيانات', ['error' => $e->getMessage()]);
            die('خطأ في الاتصال بقاعدة البيانات: ' . $e->getMessage());
        }
    }
    
    private function createTables() {
        // جدول المهام الرئيسية
        $this->db->exec('
            CREATE TABLE tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT "pending",
                progress INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ');
        
        // جدول المهام الفرعية
        $this->db->exec('
            CREATE TABLE subtasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER,
                title TEXT NOT NULL,
                completed BOOLEAN DEFAULT 0,
                sort_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
            )
        ');
        
        // جدول التقارير
        $this->db->exec('
            CREATE TABLE reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER,
                content TEXT,
                html_content TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
            )
        ');
    }
    
    public function query($sql, $params = []) {
        try {
            $stmt = $this->db->prepare($sql);
            
            foreach ($params as $param => $value) {
                $stmt->bindValue($param, $value);
            }
            
            $result = $stmt->execute();
            $this->logger->debug('تم تنفيذ الاستعلام بنجاح', [
                'sql' => $sql,
                'params' => $params
            ]);
            
            return $result;
        } catch (Exception $e) {
            $this->logger->error('خطأ في تنفيذ الاستعلام', [
                'sql' => $sql,
                'params' => $params,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
    
    public function lastInsertId() {
        return $this->db->lastInsertRowID();
    }
} 