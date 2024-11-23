<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام إدارة المهام</title>
    
    <!-- المكتبات الخارجية -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/toastr@2.1.4/build/toastr.min.css" rel="stylesheet">
    <link href="https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css" rel="stylesheet">
    
    <!-- خط Cairo و Tajawal -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet">
    
    <!-- إضافة Favicon -->
    <link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg">
    
    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #2196F3 0%, #4CAF50 100%);
            --secondary-gradient: linear-gradient(135deg, #FF9800 0%, #FF5722 100%);
            --success-gradient: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            --danger-gradient: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        }

        body {
            font-family: 'Tajawal', sans-serif;
            background-color: #f5f5f5;
        }

        /* تصميم الهيدر */
        .app-header {
            background: var(--primary-gradient);
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .app-header h1 {
            font-family: 'Cairo', sans-serif;
            font-weight: 700;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        /* تصميم الفوتر */
        .app-footer {
            background: var(--secondary-gradient);
            color: white;
            padding: 1.5rem 0;
            margin-top: 3rem;
            box-shadow: 0 -4px 6px rgba(0,0,0,0.1);
        }

        /* تصميم البطاقات */
        .task-card {
            background: white;
            border: none;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            margin-bottom: 1.5rem;
        }

        .task-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .task-card .card-header {
            background: var(--primary-gradient);
            color: white;
            border-radius: 12px 12px 0 0;
            padding: 1rem;
            border: none;
        }

        .task-card .card-body {
            padding: 1.5rem;
        }

        /* تصميم الأقسام الداخلية */
        .subtasks-section, .reports-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            border: 1px solid rgba(0,0,0,0.1);
        }

        /* تصميم شريط التقدم */
        .progress {
            height: 12px;
            border-radius: 6px;
            background-color: #e9ecef;
            overflow: hidden;
            margin: 1rem 0;
            position: relative;
        }

        .progress-bar {
            transition: width 0.4s ease-in-out;
            position: relative;
        }

        /* تصميم الأزرار */
        .btn-primary {
            background: var(--primary-gradient);
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .btn-primary:hover {
            background: var(--secondary-gradient);
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        /* تصميم البطاقات الفرعية */
        .list-group-item {
            transition: all 0.3s ease;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            border: 1px solid rgba(0,0,0,0.1);
        }

        .list-group-item:hover {
            background-color: #f8f9fa;
        }

        /* تصميم الشارات */
        .badge {
            padding: 0.5em 1em;
            border-radius: 50px;
            font-weight: 500;
        }

        /* تحسينات للنموذج */
        .modal-content {
            border-radius: 12px;
            border: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .modal-header {
            background: var(--primary-gradient);
            color: white;
            border-radius: 12px 12px 0 0;
            border: none;
        }

        .modal-footer {
            border-top: 1px solid rgba(0,0,0,0.1);
        }

        /* تحديث تصميم المهام المكتملة */
        .completed-subtask {
            position: relative;
            opacity: 0.8;
            background-color: #f8f9fa !important;
        }

        .completed-subtask .form-check-label {
            text-decoration: line-through;
            color: #6c757d;
        }

        /* تحسين تصميم حقل إدخال المهام الفرعية */
        .subtask-input {
            border: 1px solid #ced4da;
            transition: all 0.3s ease;
        }

        .subtask-input.is-invalid {
            border-color: #dc3545;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }

        .error-message {
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* تحديث أزرار الكارد */
        .task-card .btn-outline-primary {
            color: #2196F3;
            border-color: #2196F3;
            transition: all 0.3s ease;
        }

        .task-card .btn-outline-primary:hover {
            background: var(--primary-gradient);
            border-color: transparent;
            color: white;
        }

        .task-card .btn-outline-danger {
            color: #f44336;
            border-color: #f44336;
        }

        .task-card .btn-outline-danger:hover {
            background: var(--danger-gradient);
            border-color: transparent;
            color: white;
        }

        /* تصميم المهام الفرعية القابلة للسحب */
        .subtask-draggable {
            cursor: move;
            user-select: none;
            transition: background-color 0.3s ease;
        }

        .subtask-draggable.dragging {
            opacity: 0.5;
            background-color: #f8f9fa;
        }

        .subtask-drop-zone {
            border: 2px dashed #ccc;
            margin: 5px 0;
            min-height: 40px;
            display: none;
        }

        .subtask-drop-zone.active {
            display: block;
        }

        /* تنسيق السكرول */
        ::-webkit-scrollbar {
            width: 10px;
        }

        ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #2196F3 0%, #4CAF50 100%);
            border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #1976D2 0%, #388E3C 100%);
        }

        /* تنعيم السكرول */
        html {
            scroll-behavior: smooth;
        }
    </style>
</head>
<body>
    <!-- الهيدر -->
    <header class="app-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-12 text-center">
                    <h1>نظام إدارة المهام</h1>
                </div>
            </div>
        </div>
    </header>

    <!-- المحتوى الرئيسي -->
    <main class="container">
        <!-- إجمالي تقدم المهام -->
        <div class="card mb-4">
            <div class="card-body">
                <h5 class="card-title mb-3">التقدم الإجمالي</h5>
                <div class="progress" style="height: 25px;">
                    <div class="progress-bar" role="progressbar" id="overall-progress" style="width: 0%">0%</div>
                </div>
            </div>
        </div>

        <!-- زر إضافة مهمة جديدة -->
        <div class="text-center mb-4">
            <button class="btn btn-primary btn-lg" onclick="showAddTaskModal()">
                <i class="fas fa-plus"></i> إضافة مهمة جديدة
            </button>
        </div>

        <!-- قائمة المهام -->
        <div id="tasks-list">
            <!-- سيتم إضافة المهام هنا ديناميكياً -->
        </div>
    </main>

    <!-- الفوتر -->
    <footer class="app-footer">
        <div class="container">
            <div class="row">
                <div class="col-12 text-center">
                    <p class="mb-0">جميع الحقوق محفوظة &copy; 2024</p>
                </div>
            </div>
        </div>
    </footer>

    <!-- نموذج إضافة/تعديل المهمة -->
    <div class="modal fade" id="taskModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">إضافة مهمة جديدة</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="taskForm">
                        <input type="hidden" id="taskId">
                        <div class="mb-3">
                            <label class="form-label">عنوان المهمة</label>
                            <input type="text" class="form-control" id="taskTitle" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">الوصف</label>
                            <textarea class="form-control" id="taskDescription" rows="3"></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">الحالة</label>
                            <select class="form-select" id="taskStatus">
                                <option value="pending">قيد الانتظار</option>
                                <option value="in-progress">قيد التنفيذ</option>
                                <option value="completed">مكتملة</option>
                                <option value="cancelled">ملغاة</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                    <button type="button" class="btn btn-primary" onclick="saveTask()">حفظ</button>
                </div>
            </div>
        </div>
    </div>

    <!-- نموذج المهام الفرعية -->
    <div class="modal fade" id="subtaskModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">المهام الفرعية</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">مهمة فرعية جديدة</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="newSubtaskTitle">
                            <button class="btn btn-primary" onclick="addSubtask()">إضافة</button>
                        </div>
                    </div>
                    <div id="subtasksList" class="list-group">
                        <!-- سيتم إضافة المهام الفرعية هنا -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- نموذج التقارير -->
    <div class="modal fade" id="reportModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">إضافة تقرير جديد</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">محتوى التقرير</label>
                        <textarea id="reportContent"></textarea>
                    </div>
                    <button class="btn btn-primary" onclick="addReport()">إضافة تقرير</button>
                </div>
            </div>
        </div>
    </div>

    <!-- المكتبات JavaScript -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/toastr@2.1.4/build/toastr.min.js"></script>
    <script src="https://cdn.tiny.cloud/1/7e1mldkbut3yp4tyeob9lt5s57pb8wrb5fqbh11d6n782gm7/tinymce/7/tinymce.min.js" referrerpolicy="origin"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/subtasks.js"></script>
    <script src="assets/js/reports.js"></script>
</body>
</html> 