// تهيئة المتغيرات العامة
let tasks = [];
let subtasks = [];
let reports = [];

// تهيئة إعدادات toastr
toastr.options = {
    "closeButton": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "timeOut": "3000"
};

// دالة تحميل المهام عند بدء التطبيق
$(document).ready(function() {
    loadTasks();
});

// دالة تحميل المهام من قاعدة البيانات
function loadTasks() {
    $.ajax({
        url: 'api/tasks.php',
        method: 'GET',
        success: function(response) {
            tasks = response.tasks || [];
            renderTasks();
            updateOverallProgress();
        },
        error: function(xhr, status, error) {
            toastr.error('حدث خطأ أثناء تحميل المهام');
            console.error('Error loading tasks:', error);
        }
    });
}

/**
 * دالة تحرير المهمة
 * @param {number} taskId - معرف المهمة المراد تحريرها
 */
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        toastr.error('المهمة غير موجودة');
        return;
    }

    // تعبئة نموذج التحرير بالبيانات الحالية
    $('#taskId').val(task.id);
    $('#taskTitle').val(task.title);
    $('#taskDescription').val(task.description);
    $('#taskStatus').val(task.status);

    // عرض النموذج
    $('#taskModal').modal('show');
}

/**
 * دالة حذف المهمة
 * @param {number} taskId - معرف المهمة المراد حذفها
 */
function deleteTask(taskId) {
    // تأكيد الحذف باستخدام SweetAlert2
    Swal.fire({
        title: 'تأكيد الحذف',
        text: 'هل أنت متأكد من حذف هذه المهمة؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `api/tasks.php?id=${taskId}`,
                method: 'DELETE',
                success: function(response) {
                    if (response.success) {
                        loadTasks();
                        toastr.success('تم حذف المهمة بنجاح');
                    } else {
                        toastr.error(response.message || 'حدث خطأ أثناء حذف المهمة');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error deleting task:', error);
                    toastr.error('حدث خطأ أثناء حذف المهمة');
                }
            });
        }
    });
}

// دالة عرض نموذج إضافة مهمة جديدة
function showAddTaskModal() {
    // إعادة تعيين النموذج
    $('#taskForm')[0].reset();
    $('#taskId').val('');
    $('#taskStatus').val('pending');

    // تحديث عنوان النموذج
    $('.modal-title').text('إضافة مهمة جديدة');

    // عرض النموذج
    $('#taskModal').modal('show');
}

// دالة حفظ المهمة
function saveTask() {
    const taskData = {
        id: $('#taskId').val(),
        title: $('#taskTitle').val().trim(),
        description: $('#taskDescription').val().trim(),
        status: $('#taskStatus').val()
    };

    if (!taskData.title) {
        toastr.error('يرجى إدخال عنوان المهمة');
        return;
    }

    const method = taskData.id ? 'PUT' : 'POST';
    const url = 'api/tasks.php' + (taskData.id ? `?id=${taskData.id}` : '');

    $.ajax({
        url: url,
        method: method,
        contentType: 'application/json',
        data: JSON.stringify(taskData),
        success: function(response) {
            if (response.success) {
                $('#taskModal').modal('hide');
                loadTasks();
                toastr.success(response.message || 'تم حفظ المهمة بنجاح');
            } else {
                toastr.error(response.message || 'حدث خطأ أثناء حفظ المهمة');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error saving task:', xhr.responseText);
            toastr.error('حدث خطأ أثناء حفظ المهمة');
        }
    });
}

// دالة عرض المهام في الصفحة
function renderTasks() {
    const tasksList = $('#tasks-list');
    tasksList.empty();

    if (tasks.length === 0) {
        tasksList.append('<div class="alert alert-info">لا توجد مهام حالياً</div>');
        return;
    }

    tasks.forEach(task => {
        const statusBadgeClass = {
            'pending': 'bg-warning',
            'in-progress': 'bg-info',
            'completed': 'bg-success',
            'cancelled': 'bg-danger'
        }[task.status] || 'bg-secondary';

        const taskElement = $(`
            <div class="card mb-4 task-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        ${escapeHtml(task.title)}
                        <span class="badge ${statusBadgeClass} ms-2">${getStatusText(task.status)}</span>
                    </h5>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="editTask(${task.id})" title="تحرير">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <!-- وصف المهمة -->
                    <p class="card-text">${escapeHtml(task.description || '')}</p>

                    <!-- المهام الفرعية -->
                    <div class="subtasks-section mb-3">
                        <h6 class="d-flex justify-content-between align-items-center">
                            <span>المهام الفرعية</span>
                            <button class="btn btn-sm btn-outline-info" onclick="showSubtasksModal(${task.id})">
                                <i class="fas fa-plus"></i> إضافة مهمة فرعية
                            </button>
                        </h6>
                        <div id="subtasks-list-${task.id}" class="list-group mt-2">
                            <!-- سيتم تحميل المهام الفرعية هنا -->
                        </div>
                    </div>

                    <!-- التقارير -->
                    <div class="reports-section mb-3">
                        <h6 class="d-flex justify-content-between align-items-center">
                            <span>التقارير</span>
                            <button class="btn btn-sm btn-outline-success" onclick="showReportsModal(${task.id})">
                                <i class="fas fa-plus"></i> إضافة تقرير
                            </button>
                        </h6>
                        <div id="reports-list-${task.id}" class="mt-2">
                            <!-- سيتم تحميل التقارير هنا -->
                        </div>
                    </div>

                    <!-- شريط التقدم -->
                    <div class="progress" style="height: 15px;">
                        <div class="progress-bar ${statusBadgeClass}" 
                             role="progressbar" 
                             style="width: ${task.progress || 0}%" 
                             aria-valuenow="${task.progress || 0}" 
                             aria-valuemin="0" 
                             aria-valuemax="100">
                            ${Math.round(task.progress || 0)}%
                        </div>
                    </div>
                </div>
            </div>
        `);

        tasksList.append(taskElement);

        // تحميل المهام الفرعية والتقارير لهذه المهمة
        loadTaskSubtasks(task.id);
        loadTaskReports(task.id);
    });
}

/**
 * دالة لحماية النص من XSS
 * @param {string} text - النص المراد معالجته
 * @returns {string} - النص المعالج
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * دالة للحصول على النص العربي للحالة
 * @param {string} status - حالة المهمة
 * @returns {string} - النص العربي للحالة
 */
function getStatusText(status) {
    const statusMap = {
        'pending': 'قيد الانتظار',
        'in-progress': 'قيد التنفيذ',
        'completed': 'مكتملة',
        'cancelled': 'ملغاة'
    };
    return statusMap[status] || status;
}

// دالة تحديث التقدم الإجمالي
function updateOverallProgress() {
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    const progressBar = $('#overall-progress');

    // تحديث تدريجي للنسبة
    $({ percent: parseFloat(progressBar.css('width')) || 0 }).animate({ percent: progress }, {
        duration: 1000,
        step: function(now) {
            progressBar.css('width', now + '%');
            progressBar.text(Math.round(now) + '%');
        },
        complete: function() {
            // تحديث اللون بناءً على النسبة
            if (progress >= 75) {
                progressBar.removeClass().addClass('progress-bar bg-success');
            } else if (progress >= 50) {
                progressBar.removeClass().addClass('progress-bar bg-info');
            } else if (progress >= 25) {
                progressBar.removeClass().addClass('progress-bar bg-warning');
            } else {
                progressBar.removeClass().addClass('progress-bar bg-danger');
            }
        }
    });
}

// دالة تحميل المهام الفرعية لمهمة محددة
function loadTaskSubtasks(taskId) {
    $.ajax({
        url: `api/subtasks.php?task_id=${taskId}`,
        method: 'GET',
        success: function(response) {
            if (response.success) {
                renderTaskSubtasks(taskId, response.subtasks);
            }
        }
    });
}

// دالة تحميل التقارير لمهمة محددة
function loadTaskReports(taskId) {
    $.ajax({
        url: `api/reports.php?task_id=${taskId}`,
        method: 'GET',
        success: function(response) {
            if (response.success) {
                renderTaskReports(taskId, response.reports);
            }
        }
    });
}

// دالة عرض المهام الفرعية
function renderTaskSubtasks(taskId, subtasks) {
    const subtasksList = $(`#subtasks-list-${taskId}`);
    subtasksList.empty();

    if (subtasks.length === 0) {
        subtasksList.append('<div class="text-muted small">لا توجد مهام فرعية</div>');
        return;
    }

    // عرض ملخص فقط
    const completedCount = subtasks.filter(s => s.completed).length;
    const totalCount = subtasks.length;
    const progress = (completedCount / totalCount) * 100;

    const summary = $(`
        <div>
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">المهام المكتملة: ${completedCount}/${totalCount}</span>
                <span class="badge bg-${progress === 100 ? 'success' : 'info'}">${Math.round(progress)}%</span>
            </div>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar" role="progressbar" 
                     style="width: ${progress}%" 
                     aria-valuenow="${progress}" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                </div>
            </div>
        </div>
    `);
    subtasksList.append(summary);
}

// دالة عرض التقارير
function renderTaskReports(taskId, reports) {
    const reportsList = $(`#reports-list-${taskId}`);
    reportsList.empty();

    if (reports.length === 0) {
        reportsList.append('<div class="text-muted small">لا توجد تقارير</div>');
        return;
    }

    // عرض ملخص فقط
    const latestReport = reports[0];
    const reportDate = new Date(latestReport.created_at).toLocaleString('ar-SA');

    const summary = $(`
        <div class="d-flex justify-content-between align-items-center">
            <span class="text-muted">عدد التقارير: ${reports.length}</span>
            <span class="text-muted">آخر تحديث: ${reportDate}</span>
        </div>
    `);
    reportsList.append(summary);
}