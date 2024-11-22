<?php
/**
 * ملف الوظائف المساعدة
 */

/**
 * تنظيف وتأمين المدخلات
 * @param string $input النص المدخل
 * @return string النص بعد التنظيف
 */
function cleanInput($input) {
    return htmlspecialchars(strip_tags(trim($input)));
}

/**
 * تحويل التاريخ إلى الصيغة العربية
 * @param string $date التاريخ
 * @return string التاريخ بالصيغة العربية
 */
function formatArabicDate($date) {
    $months = [
        'January' => 'يناير',
        'February' => 'فبراير',
        'March' => 'مارس',
        'April' => 'أبريل',
        'May' => 'مايو',
        'June' => 'يونيو',
        'July' => 'يوليو',
        'August' => 'أغسطس',
        'September' => 'سبتمبر',
        'October' => 'أكتوبر',
        'November' => 'نوفمبر',
        'December' => 'ديسمبر'
    ];
    
    $date = date('d F Y', strtotime($date));
    foreach ($months as $en => $ar) {
        $date = str_replace($en, $ar, $date);
    }
    return $date;
}

/**
 * تحويل حالة المهمة إلى نص مقروء
 * @param string $status_type نوع الحالة
 * @return string النص المقروء للحالة
 */
function getStatusLabel($status_type) {
    $labels = [
        'بحث' => 'قيد البحث',
        'ايقاف' => 'متوقفة',
        'الغاء' => 'ملغية',
        'تطوير' => 'قيد التطوير',
        'اجتماع' => 'تحتاج اجتماع',
        'تأجيل' => 'مؤجلة',
        'أولوية' => 'ذات أولوية'
    ];
    return $labels[$status_type] ?? $status_type;
}

/**
 * تحويل مستوى الأولوية إلى نص مقروء
 * @param int $priority مستوى الأولوية
 * @return string النص المقروء للأولوية
 */
function getPriorityLabel($priority) {
    $labels = [
        0 => 'عادية',
        1 => 'منخفضة',
        2 => 'متوسطة',
        3 => 'عالية'
    ];
    return $labels[$priority] ?? 'غير محدد';
}

/**
 * ترقيم المهام الفرعية تلقائياً
 * @param int $taskId معرف المهمة الرئيسية
 * @return bool نجاح العملية
 */
function reorderSubtasks($taskId) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("
            SET @rank := 0;
            UPDATE subtasks 
            SET priority = @rank := @rank + 1
            WHERE task_id = ?
            ORDER BY created_at ASC;
        ");
        $stmt->execute([$taskId]);
        return true;
    } catch (PDOException $e) {
        return false;
    }
} 