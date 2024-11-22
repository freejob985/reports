<?php
// بداية الجلسة
session_start();

// استدعاء ملف الاتصال بقاعدة البيانات
require_once 'config/database.php';

// استدعاء ملف الوظائف المساعدة
require_once 'helpers/functions.php';
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام إدارة المهام والتقارير</title>
    
    <!-- المكتبات الخارجية -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">
    
    <!-- الستايلات المخصصة -->
    <link rel="stylesheet" href="assets/css/style.css">
    
    <!-- إضافة Favicon -->
    <link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg">
    <link rel="icon" type="image/png" href="assets/images/favicon.png">
    
    <style>
        body {
            font-family: 'Tajawal', sans-serif;
            scroll-behavior: smooth;
        }
        
        /* تنعيم السكرول */
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 5px;
            transition: all 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        
        /* تنعيم الانتقالات */
        .task-list-item {
            transition: all 0.3s ease;
        }
        
        .task-list-item:hover {
            background-color: #f8fafc;
        }
    </style>
</head>
<body class="bg-gray-100">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    
    <!-- القائمة العلوية -->
    <nav class="bg-white shadow-lg">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <h1 class="text-xl font-bold">نظام إدارة المهام والتقارير</h1>
                <div class="flex space-x-4">
                    <button id="addTaskBtn" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        <i class="fas fa-plus ml-2"></i>مهمة جديدة
                    </button>
                    <button id="exportAllPDF" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        <i class="fas fa-file-pdf ml-2"></i>تصدير الكل
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- محتوى الصفحة الرئيسي -->
    <main class="container mx-auto px-4 py-8">
        <div id="tasksList" class="space-y-4">
            <!-- سيتم إضافة المهام هنا ديناميكياً -->
        </div>
    </main>

    <!-- نموذج إضافة مهمة جديدة -->
    <div id="addTaskModal" class="modal fade" tabindex="-1">
        <!-- محتوى النموذج -->
    </div>

    <!-- السكربتات -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
    <script src="https://cdn.tiny.cloud/1/1dho1iufg28k6retqsoh5b9hlqme73w2vm6u1z5bjfewe9fp/tinymce/5/tinymce.min.js"></script>
    <script src="assets/js/main.js"></script>
</body>
</html>
