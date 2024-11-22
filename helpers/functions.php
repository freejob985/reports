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