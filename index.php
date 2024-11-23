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
            background: linear-gradient(135deg, #1976d2 0%, #2196F3 100%);
            padding: 2rem 0;
            margin-bottom: 2rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .header-content {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .app-icon {
            font-size: 3rem;
            color: white;
            margin-bottom: 1rem;
            animation: float 3s ease-in-out infinite;
        }

        .header-stats {
            display: flex;
            gap: 2rem;
            margin-top: 1.5rem;
        }

        .stat-item {
            text-align: center;
            color: white;
            padding: 1rem;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            backdrop-filter: blur(5px);
            transition: transform 0.3s ease;
        }

        .stat-item:hover {
            transform: translateY(-5px);
        }

        .stat-item i {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .stat-item span {
            display: block;
            font-size: 1.5rem;
            font-weight: bold;
        }

        /* تصميم الفوتر */
        .app-footer {
            background: linear-gradient(135deg, #2196F3 0%, #1976d2 100%);
            color: white;
            padding: 2rem 0;
            margin-top: 3rem;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
        }

        .footer-stats {
            list-style: none;
            padding: 0;
        }

        .footer-stats li {
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .footer-brand {
            padding: 1rem;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            backdrop-filter: blur(5px);
        }

        .footer-brand i {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .footer-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        }

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
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
            background: white;
            border: 1px solid rgba(0,0,0,0.1);
            border-radius: 8px;
            margin-bottom: 0.5rem;
            padding: 0.75rem;
            transition: all 0.3s ease;
        }

        .subtask-draggable:hover {
            background: #f8f9fa;
            transform: translateX(-5px);
            box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
        }

        .subtask-draggable .drag-handle {
            color: #adb5bd;
            cursor: move;
            padding: 0.25rem;
            border-radius: 4px;
            transition: all 0.3s ease;
        }

        .subtask-draggable .drag-handle:hover {
            background: #e9ecef;
            color: #6c757d;
        }

        .subtask-draggable .form-check-label {
            font-size: 1rem;
            color: #495057;
            transition: all 0.3s ease;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
        }

        .subtask-draggable .form-check-input {
            cursor: pointer;
            width: 1.2rem;
            height: 1.2rem;
        }

        .completed-subtask {
            background: #f8f9fa;
            opacity: 0.8;
        }

        .completed-subtask .form-check-label {
            text-decoration: line-through;
            color: #6c757d;
        }

        .selected-subtask {
            background: #e3f2fd;
            color: #1976d2 !important;
            font-weight: 500;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
        }

        .subtask-draggable .btn-group {
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .subtask-draggable:hover .btn-group {
            opacity: 1;
        }

        .subtask-draggable .btn {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
        }

        .subtask-placeholder {
            border: 2px dashed #dee2e6;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 0.5rem 0;
            height: 3rem;
        }

        /* تحسين مظهر حقل إدخال المهام الفرعية */
        .subtask-input {
            border-radius: 8px;
            padding: 0.75rem;
            border: 1px solid #ced4da;
            transition: all 0.3s ease;
        }

        .subtask-input:focus {
            border-color: #2196F3;
            box-shadow: 0 0 0 0.2rem rgba(33, 150, 243, 0.25);
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

        /* تنسيقات الشارات في الهيدر */
        .header-stats .badge {
            font-size: 1.2rem;
            padding: 0.5rem 1rem;
            margin: 0.25rem;
            transition: all 0.3s ease;
        }

        .header-stats .badge:hover {
            transform: scale(1.1);
        }

        .header-stats small.badge {
            font-size: 0.8rem;
            padding: 0.25rem 0.5rem;
        }

        /* تنسيقات الشارات في الفوتر */
        .footer-stats .badge {
            font-size: 1rem;
            padding: 0.4rem 0.8rem;
            margin-right: 0.5rem;
            transition: all 0.3s ease;
        }

        .footer-stats .badge:hover {
            transform: translateY(-2px);
        }

        /* تنسيقات عامة للشارات */
        .badge {
            border-radius: 50px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .badge.bg-primary {
            background: var(--primary-gradient) !important;
        }

        .badge.bg-success {
            background: var(--success-gradient) !important;
        }

        .badge.bg-warning {
            background: var(--secondary-gradient) !important;
            color: white;
        }

        .badge.bg-info {
            background: linear-gradient(135deg, #03a9f4 0%, #00bcd4 100%) !important;
        }

        /* تحسين مظهر القوائم في الفوتر */
        .footer-stats li {
            background: rgba(255,255,255,0.1);
            padding: 0.5rem 1rem;
            border-radius: 10px;
            margin-bottom: 0.5rem;
            backdrop-filter: blur(5px);
            transition: all 0.3s ease;
        }

        .footer-stats li:hover {
            background: rgba(255,255,255,0.2);
            transform: translateX(-5px);
        }

        /* تنسيقات شارات التقارير */
        .report-badge {
            font-size: 0.9rem;
            padding: 0.4em 0.8em;
            border-radius: 50px;
            transition: all 0.3s ease;
            margin: 0 0.2rem;
        }

        .report-badge:hover {
            transform: scale(1.1);
        }

        .report-badge.bg-info {
            background: linear-gradient(135deg, #03a9f4 0%, #00bcd4 100%) !important;
            color: white;
        }

        .report-badge.bg-primary {
            background: var(--primary-gradient) !important;
        }

        .report-badge.bg-danger {
            background: var(--danger-gradient) !important;
        }

        /* تنسيقات أزرار التقارير */
        .report-actions .btn {
            display: inline-flex;
            align-items: center;
            padding: 0.375rem 0.75rem;
            border-radius: 50px;
            transition: all 0.3s ease;
        }

        .report-actions .btn:hover {
            transform: translateY(-2px);
        }

        .report-actions .btn .badge {
            margin-left: 0.5rem;
            font-size: 0.75rem;
            padding: 0.25em 0.6em;
        }

        /* تحسينات إضافية للشارات */
        .badge {
            font-weight: 500;
            letter-spacing: 0.5px;
        }

        .badge.with-icon {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
        }

        .badge.with-icon i {
            font-size: 0.85em;
        }

        /* تنسيقات الشارات والأزرار */
        .task-status-badges {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }

        .task-status-badges .badge {
            padding: 0.5em 1em;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .task-status-badges .badge:hover {
            transform: translateY(-2px);
        }

        .task-date {
            font-size: 0.8rem;
            padding: 0.4em 0.8em;
        }

        .btn-group .btn .badge {
            margin-left: 0.5rem;
            font-size: 0.75rem;
            padding: 0.25em 0.6em;
            transition: all 0.3s ease;
        }

        .btn-group .btn:hover .badge {
            transform: scale(1.1);
        }

        /* تنسيقات التقارير */
        .report-card .badge {
            font-size: 0.85rem;
            padding: 0.4em 0.8em;
        }

        .report-footer .badge {
            font-size: 0.8rem;
            padding: 0.4em 0.8em;
            background: rgba(0,0,0,0.05);
        }

        /* تأثيرات حركية للشارات */
        .badge {
            transition: all 0.3s ease;
        }

        .badge:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <!-- الهيدر -->
    <header class="app-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-12 text-center">
                    <div class="header-content">
                        <div class="app-icon">
                            <i class="fas fa-tasks"></i>
                        </div>
                        <h1>نظام إدارة المهام</h1>
                        <div class="header-stats">
                            <div class="stat-item">
                                <i class="fas fa-list"></i>
                                <span id="total-tasks" class="badge bg-primary rounded-pill">0</span>
                                <small class="badge bg-light text-dark">المهام الكلية</small>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-check-circle"></i>
                                <span id="completed-tasks" class="badge bg-success rounded-pill">0</span>
                                <small class="badge bg-light text-dark">المهام المكتملة</small>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-clock"></i>
                                <span id="pending-tasks" class="badge bg-warning rounded-pill">0</span>
                                <small class="badge bg-light text-dark">قيد الانتظار</small>
                            </div>
                        </div>
                    </div>
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
                <div class="col-md-4">
                    <h5><i class="fas fa-chart-line"></i> إحصائيات سريعة</h5>
                    <ul class="footer-stats">
                        <li>
                            <i class="fas fa-tasks"></i> 
                            إجمالي المهام: <span id="footer-total" class="badge bg-primary">0</span>
                        </li>
                        <li>
                            <i class="fas fa-check"></i> 
                            المكتملة: <span id="footer-completed" class="badge bg-success">0</span>
                        </li>
                        <li>
                            <i class="fas fa-spinner"></i> 
                            قيد التنفيذ: <span id="footer-progress" class="badge bg-info">0</span>
                        </li>
                    </ul>
                </div>
                <div class="col-md-4 text-center">
                    <div class="footer-brand">
                        <i class="fas fa-tasks"></i>
                        <h5>نظام إدارة المهام</h5>
                        <p>جميع الحقوق محفوظة &copy; 2024</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="footer-actions">
                        <button class="btn btn-light" onclick="showAddTaskModal()">
                            <i class="fas fa-plus"></i> مهمة جديدة
                        </button>
                        <button class="btn btn-light" onclick="showStats()">
                            <i class="fas fa-chart-bar"></i> الإحصائيات
                        </button>
                    </div>
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
                        <!-- سيتم إضافة المهام الفرعية هن -->
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