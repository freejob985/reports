<?php
/**
 * نظام تسجيل الأخطاء والأحداث
 * 
 * يقوم هذا الملف بتسجيل الأخطاء والأحداث في ملفات log
 * مع دعم مستويات مختلفة من التسجيل
 */
class Logger {
    // مسار مجلد السجلات
    private $logPath;
    
    // أنواع السجلات المدعومة
    const ERROR = 'ERROR';
    const INFO = 'INFO';
    const DEBUG = 'DEBUG';
    const WARNING = 'WARNING';
    
    /**
     * تهيئة نظام التسجيل
     */
    public function __construct() {
        // إنشاء مجلد logs إذا لم يكن موجوداً
        $this->logPath = __DIR__ . '/../logs';
        if (!file_exists($this->logPath)) {
            if (!mkdir($this->logPath, 0777, true)) {
                die('فشل في إنشاء مجلد السجلات');
            }
            chmod($this->logPath, 0777);
        }
    }
    
    /**
     * تسجيل حدث في الملف
     * 
     * @param string $type نوع السجل (ERROR, INFO, DEBUG, WARNING)
     * @param string $message الرسالة المراد تسجيلها
     * @param array $context بيانات إضافية للسجل
     * @return bool نجاح أو فشل عملية التسجيل
     */
    public function log($type, $message, array $context = []) {
        $date = date('Y-m-d');
        $time = date('H:i:s');
        $logFile = $this->logPath . "/{$date}.log";
        
        // تنسيق الرسالة
        $logMessage = sprintf(
            "[%s] [%s] %s %s\n",
            $time,
            strtoupper($type),
            $message,
            !empty($context) ? json_encode($context, JSON_UNESCAPED_UNICODE) : ''
        );
        
        try {
            file_put_contents($logFile, $logMessage, FILE_APPEND);
            return true;
        } catch (Exception $e) {
            error_log("فشل في تسجيل السجل: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * تسجيل خطأ
     */
    public function error($message, array $context = []) {
        return $this->log(self::ERROR, $message, $context);
    }
    
    /**
     * تسجيل معلومة
     */
    public function info($message, array $context = []) {
        return $this->log(self::INFO, $message, $context);
    }
    
    /**
     * تسجيل تحذير
     */
    public function warning($message, array $context = []) {
        return $this->log(self::WARNING, $message, $context);
    }
    
    /**
     * تسجيل معلومات التصحيح
     */
    public function debug($message, array $context = []) {
        return $this->log(self::DEBUG, $message, $context);
    }
    
    /**
     * جلب سجلات يوم معين
     * 
     * @param string $date التاريخ (Y-m-d)
     * @return array سجلات اليوم
     */
    public function getLogsForDate($date) {
        $logFile = $this->logPath . "/{$date}.log";
        if (!file_exists($logFile)) {
            return [];
        }
        
        return file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    }
} 