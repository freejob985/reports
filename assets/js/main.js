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
        const taskElement = $(`
            <div class="list-group-item task-status-${task.status}">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-1">${escapeHtml(task.title)}</h5>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-info" onclick="showSubtasksModal(${task.id})" title="المهام الفرعية">
                            <i class="fas fa-tasks"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="showReportsModal(${task.id})" title="التقارير">
                            <i class="fas fa-file-alt"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary" onclick="editTask(${task.id})" title="تحرير">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="mb-1">${escapeHtml(task.description || '')}</p>
                <div class="progress mt-2" style="height: 10px;">
                    <div class="progress-bar" role="progressbar" 
                         style="width: ${task.progress || 0}%" 
                         aria-valuenow="${task.progress || 0}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                    </div>
                </div>
                <small class="text-muted">
                    الحالة: ${getStatusText(task.status)} | 
                    المهام الفرعية: ${task.total_subtasks || 0} | 
                    التقارير: ${task.reports_count || 0}
                </small>
            </div>
        `);
        tasksList.append(taskElement);
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
    progressBar.css('width', `${progress}%`).text(`${Math.round(progress)}%`);

    // تحديث لون شريط التقدم بناءً على النسبة
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