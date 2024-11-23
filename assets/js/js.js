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

// تحديث تعريف الحالات
const taskStatuses = {
    'pending': { text: 'قيد الانتظار', icon: 'clock', class: 'bg-warning' },
    'in-progress': { text: 'قيد التنفيذ', icon: 'spinner fa-spin', class: 'bg-info' },
    'completed': { text: 'مكتملة', icon: 'check-circle', class: 'bg-success' },
    'development': { text: 'تطوير', icon: 'code', class: 'bg-primary' },
    'paused': { text: 'إيقاف', icon: 'pause-circle', class: 'bg-secondary' },
    'postponed': { text: 'تأجيل', icon: 'clock', class: 'bg-warning' },
    'searching': { text: 'بحث', icon: 'search', class: 'bg-info' },
    'cancelled': { text: 'إلغاء', icon: 'times-circle', class: 'bg-danger' }
};

// دالة تحميل المهام عند بدء التطبيق
$(document).ready(function() {
    loadTasks();
});

// دلة تحميل المهام من قاعدة البيانات
function loadTasks() {
    $.ajax({
        url: 'api/tasks.php',
        method: 'GET',
        success: function(response) {
            tasks = response.tasks || [];
            renderTasks();
            updateOverallProgress();
            updateStats();
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

    // تحديث عنوان النموذج
    $('.modal-title').text('تعديل المهمة');

    // إنشاء أزرار تغيير الحالة السريع لجميع الحالات المتاحة
    const quickStatusButtons = `
        <div class="mb-3">
            <label class="form-label">تغيير سريع للحالة:</label>
            <div class="btn-group-vertical w-100">
                ${Object.entries(taskStatuses).map(([status, info]) => `
                    <button type="button" 
                            class="btn btn-outline-${info.class.replace('bg-', '')} mb-1" 
                            onclick="quickUpdateStatus(${taskId}, '${status}')">
                        <i class="fas fa-${info.icon}"></i> ${info.text}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    // إضافة الأزرار إلى النموذج
    $('#taskForm').prepend(quickStatusButtons);

    // عرض النموذج
    $('#taskModal').modal('show');
}

/**
 * تحديث سريع لحالة المهمة
 * @param {number} taskId - معرف المهمة
 * @param {string} status - الحالة الجديدة
 */
function quickUpdateStatus(taskId, status) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        toastr.error('المهمة غير موجودة');
        return;
    }

    // التحقق من أن الحالة موجودة في قائمة الحالات المعرفة
    if (!taskStatuses[status]) {
        toastr.error('الحالة غير صالحة');
        return;
    }

    $.ajax({
        url: 'api/tasks.php',
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
            id: taskId,
            title: task.title,
            description: task.description,
            status: status
        }),
        success: function(response) {
            if (response.success) {
                $('#taskModal').modal('hide');
                loadTasks();
                toastr.success('تم تحديث حالة المهمة بنجاح');
            } else {
                toastr.error(response.message || 'حدث خطأ أثناء تحديث حالة المهمة');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error updating task status:', error);
            toastr.error('حدث خطأ أثناء تحديث حالة المهمة');
        }
    });
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
                toastr.success(taskData.id ? 'تم تحديث المهمة بنجاح' : 'تم إضافة المهمة بنجاح');
            } else {
                toastr.error(response.message || 'حدث خطأ أثناء حفظ المهمة');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error saving task:', error);
            toastr.error('حدث خطأ أثناء حفظ المهمة');
        }
    });
}

/**
 * دالة للحصول على النص ��لعربي للحالة
 * @param {string} status - حالة المهمة
 * @returns {string} - النص العربي للحالة
 */
function getStatusText(status) {
    return taskStatuses[status] && taskStatuses[status].text ? taskStatuses[status].text : status;
}

/**
 * دالة للحصول على لون الحالة
 * @param {string} status - حالة المهمة
 * @returns {string} - صنف لون الحالة
 */
function getStatusBadgeClass(status) {
    return taskStatuses[status] && taskStatuses[status].class ? taskStatuses[status].class : 'bg-secondary';
}

/**
 * دالة للحصول على أيقونة الحالة
 * @param {string} status - حالة المهمة
 * @returns {string} - اسم الأيقونة
 */
function getStatusIcon(status) {
    return taskStatuses[status] && taskStatuses[status].icon ? taskStatuses[status].icon : 'question-circle';
}

// تحديث دالة renderTasks لتحسين تنسيق الأزرار في الهيدر
function renderTasks() {
    const tasksList = $('#tasks-list');
    tasksList.empty();

    if (tasks.length === 0) {
        tasksList.append('<div class="alert alert-info">لا توجد مهام حالياً</div>');
        return;
    }

    tasks.forEach(task => {
        const statusBadgeClass = getStatusBadgeClass(task.status);
        const statusIcon = getStatusIcon(task.status);
        const statusText = getStatusText(task.status);

        const statusBadge = `
            <span class="badge ${statusBadgeClass} status-badge" 
                  style="cursor: pointer;"
                  onclick="showStatusModal(${task.id})"
                  title="تغيير الحالة">
                <i class="fas fa-${statusIcon}"></i> ${statusText}
            </span>
        `;

        // تحديث تنسيق أزرار الهيدر
        const taskElement = $(`
            <div class="card mb-4 task-card" data-task-id="${task.id}">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="mb-0 task-title">
                            ${escapeHtml(task.title)}
                        </h5>
                        <div class="task-header-actions">
                            <div class="btn-group">
                                <button class="task-action-btn primary" onclick="editTask(${task.id})" title="تحرير المهمة">
                                    <i class="fas fa-edit"></i>
                                    <span class="action-text">تحرير</span>
                                </button>
                                <button class="task-action-btn success" onclick="quickUpdateStatus(${task.id}, 'completed')" title="إكمال المهمة">
                                    <i class="fas fa-check"></i>
                                    <span class="action-text">إكمال</span>
                                </button>
                                <button class="task-action-btn info" onclick="showSubtasksModal(${task.id})" title="المهام الفرعية">
                                    <i class="fas fa-tasks"></i>
                                    <span class="action-text">المهام الفرعية</span>
                                </button>
                                <button class="task-action-btn warning" onclick="showReportsModal(${task.id})" title="التقارير">
                                    <i class="fas fa-file-alt"></i>
                                    <span class="action-text">التقارير</span>
                                </button>
                                <button class="task-action-btn danger" onclick="deleteTask(${task.id})" title="حذف المهمة">
                                    <i class="fas fa-trash"></i>
                                    <span class="action-text">حذف</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        ${statusBadge}
                    </div>
                </div>
                <div class="card-body">
                    <!-- باقي محتوى الكارد بدون تغيير -->
                    <p class="card-text">${escapeHtml(task.description || '')}</p>

                    <!-- المهام الفرعية -->
                    <div class="subtasks-section mb-3">
                        <h6 class="mb-3">المهام الفرعية</h6>
                        <div class="input-group mb-3">
                            <input type="text" 
                                   class="form-control subtask-input" 
                                   data-task-id="${task.id}"
                                   placeholder="أضف مهمة فرعية جديدة"
                                   onkeypress="handleSubtaskKeyPress(event, ${task.id})"
                                   autocomplete="off">
                            <button class="btn btn-outline-primary" onclick="addSubtask(${task.id})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div id="subtasks-list-${task.id}" class="list-group">
                            <!-- سيتم تحميل المهام الفرعية هنا -->
                        </div>
                    </div>

                    <!-- قسم التقارير -->
                    <div class="reports-section mb-3">
                        <h6 class="mb-3">التقارير</h6>
                        <div id="reports-list-${task.id}">
                            <!-- سيتم تحميل التقارير هنا -->
                        </div>
                    </div>

                    <!-- شريط التقدم -->
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                    </div>
                </div>
            </div>
        `);

        tasksList.append(taskElement);
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

// دالة تحميل المها الفرعية لمهمة محددة
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
            } else {
                console.error('Error loading reports:', response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading reports:', error);
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

    subtasks.forEach((subtask, index) => {
        const element = $(`
            <div class="list-group-item subtask-draggable d-flex align-items-center ${subtask.completed ? 'completed-subtask' : ''}"
                 data-subtask-id="${subtask.id}">
                <div class="drag-handle me-2">
                    <i class="fas fa-grip-vertical text-muted"></i>
                </div>
                <div class="form-check flex-grow-1">
                    <input class="form-check-input" type="checkbox" 
                           ${subtask.completed ? 'checked' : ''}
                           onchange="toggleSubtask(${subtask.id}, this.checked, ${taskId})">
                    <label class="form-check-label subtask-title" 
                           onclick="toggleSubtaskSelection(${subtask.id})"
                           style="cursor: pointer;">
                        ${escapeHtml(subtask.title)}
                    </label>
                </div>
                <div class="btn-group ms-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="editSubtask(${subtask.id}, ${taskId})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSubtask(${subtask.id}, ${taskId})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `);
        subtasksList.append(element);
    });

    // تهيئة خاصية السحب والإفلات
    initDragAndDrop(`subtasks-list-${taskId}`);
    updateTaskProgress(taskId, subtasks);
}

/**
 * تحديث لون شريط التقدم بناءً على النسبة
 * @param {jQuery} progressBar - عنصر شريط التقدم
 * @param {number} progress - نسبة التقدم
 */
function updateProgressBarColor(progressBar, progress) {
    // إزالة جميع الألوان السابقة
    progressBar.removeClass('bg-danger bg-warning bg-info bg-success');

    // إضافة اللون المناسب بناءً على نسبة التقدم
    if (progress >= 75) {
        progressBar.addClass('bg-success');
    } else if (progress >= 50) {
        progressBar.addClass('bg-info');
    } else if (progress >= 25) {
        progressBar.addClass('bg-warning');
    } else {
        progressBar.addClass('bg-danger');
    }
}

/**
 * تحديث تقدم المهمة
 * @param {number} taskId - معرف المهمة
 * @param {Array} subtasks - قائمة المهام الفرعية
 */
function updateTaskProgress(taskId, subtasks) {
    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter(s => s.completed).length;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    const progressBar = $(`.task-card[data-task-id="${taskId}"] .progress-bar`);

    // تحديث عرض شريط التقدم بشكل متحرك
    progressBar.css({
        'width': `${progress}%`,
        'transition': 'width 0.4s ease-in-out'
    }).text(Math.round(progress) + '%');

    // تحديث لون شريط التقدم
    updateProgressBarColor(progressBar, progress);
}