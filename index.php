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
    
    <!-- خط Cairo و Tajawal -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Tajawal', sans-serif;
        }
        .task-status-pending { background-color: #fff3cd; }
        .task-status-in-progress { background-color: #cfe2ff; }
        .task-status-completed { background-color: #d1e7dd; }
        .task-status-cancelled { background-color: #f8d7da; }
    </style>
</head>
<body>
    <div class="container mt-4">
        <h1 class="text-center mb-4">نظام إدارة المهام</h1>
        
        <!-- إجمالي تقدم المهام -->
        <div class="progress mb-4" style="height: 25px;">
            <div class="progress-bar" role="progressbar" id="overall-progress" style="width: 0%">0%</div>
        </div>

        <!-- زر إضافة مهمة جديدة -->
        <button class="btn btn-primary mb-4" onclick="showAddTaskModal()">
            <i class="fas fa-plus"></i> إضافة مهمة جديدة
        </button>

        <!-- قائمة المهام -->
        <div id="tasks-list" class="list-group">
            <!-- سيتم إضافة المهام هنا ديناميكياً -->
        </div>
    </div>

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
                    <h5 class="modal-title">التقارير</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">تقرير جديد</label>
                        <textarea id="reportContent"></textarea>
                    </div>
                    <button class="btn btn-primary mb-3" onclick="addReport()">إضافة تقرير</button>
                    <div id="reportsList">
                        <!-- سيتم إضافة التقارير هنا -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- المكتبات JavaScript -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/toastr@2.1.4/build/toastr.min.js"></script>
    <script src="https://cdn.tiny.cloud/1/7e1mldkbut3yp4tyeob9lt5s57pb8wrb5fqbh11d6n782gm7/tinymce/7/tinymce.min.js" referrerpolicy="origin"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/subtasks.js"></script>
    <script src="assets/js/reports.js"></script>
</body>
</html> 