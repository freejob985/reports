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

// دالة تحميل المهام من قاعدة البيانات
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

    // إضافة أزرار تغيير الحالة السريع
    const quickStatusButtons = `
        <div class="mb-3">
            <label class="form-label">تغيير سريع للحالة:</label>
            <div class="btn-group w-100">
                <button type="button" class="btn btn-outline-warning" onclick="quickUpdateStatus(${taskId}, 'pending')">
                    قيد الانتظار
                </button>
                <button type="button" class="btn btn-outline-info" onclick="quickUpdateStatus(${taskId}, 'in-progress')">
                    قيد التنفيذ
                </button>
                <button type="button" class="btn btn-outline-success" onclick="quickUpdateStatus(${taskId}, 'completed')">
                    مكتملة
                </button>
                <button type="button" class="btn btn-outline-danger" onclick="quickUpdateStatus(${taskId}, 'cancelled')">
                    ملغاة
                </button>
            </div>
        </div>
    `;

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
 * دالة للحصول على النص العربي للحالة
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

// تحديث دالة renderTasks لاستخدام الدوال الجديدة
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
        const taskElement = $(`
            <div class="card mb-4 task-card" data-task-id="${task.id}">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="mb-0">
                            ${escapeHtml(task.title)}
                        </h5>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary" onclick="editTask(${task.id})" title="تحرير المهمة">
                                <i class="fas fa-edit"></i> تحرير
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="quickUpdateStatus(${task.id}, 'completed')" title="إكمال المهمة">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})" title="حذف المهمة">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        ${statusBadge}
                    </div>
                </div>
                <div class="card-body">
                    <!-- وصف المهمة -->
                    <p class="card-text">${escapeHtml(task.description || '')}</p>

                    <!-- المهام الفرعية -->
                    <div class="subtasks-section mb-3">
                        <h6 class="mb-3">المهام الفرعية</h6>
                        
                        <!-- نموذج إضافة مهمة فرعية -->
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

                        <!-- قائمة المهام الفرعية -->
                        <div id="subtasks-list-${task.id}" class="list-group">
                            <!-- سيتم تحميل المهام الفرعية هنا -->
                        </div>
                    </div>

                    <!-- قسم التقارير -->
                    <div class="reports-section mb-3">
                        <h6 class="mb-3">التقارير</h6>
                        <button class="btn btn-outline-primary mb-3" onclick="showReportsModal(${task.id})">
                            <i class="fas fa-file-alt"></i> إضافة تقرير
                        </button>
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

/**
 * تحديث حالة المهمة الفرعية
 * @param {number} subtaskId - معرف المهمة الفرعية
 * @param {boolean} completed - حالة الإكمال
 * @param {number} taskId - معرف المهمة الرئيسية
 */
function toggleSubtask(subtaskId, completed, taskId) {
    event.preventDefault();
    event.stopPropagation();

    const subtaskElement = $(`.list-group-item[data-subtask-id="${subtaskId}"]`);
    const checkboxElement = subtaskElement.find('input[type="checkbox"]');
    const labelElement = subtaskElement.find('.form-check-label');

    $.ajax({
        url: 'api/subtasks.php',
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
            id: subtaskId,
            completed: completed
        }),
        success: function(response) {
            if (response.success) {
                // تحديث مظهر المهمة الفرعية
                if (completed) {
                    subtaskElement.addClass('completed-subtask');
                    labelElement.css('text-decoration', 'line-through');
                } else {
                    subtaskElement.removeClass('completed-subtask');
                    labelElement.css('text-decoration', 'none');
                }

                // تحديث حالة الـ checkbox
                checkboxElement.prop('checked', completed);

                // تحديث تقدم المهمة
                loadTaskSubtasks(taskId);
            } else {
                toastr.error(response.message || 'حدث خطأ أثناء تحديث المهمة الفرعية');
                // إعادة الـ checkbox لحالته السابقة
                checkboxElement.prop('checked', !completed);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error updating subtask:', error);
            toastr.error('حدث خطأ أثناء تحديث المهمة الفرعية');
            // إعادة الـ checkbox لحالته السابقة
            checkboxElement.prop('checked', !completed);
        }
    });
}

// دالة عرض التقارير
function renderTaskReports(taskId, reports) {
    const reportsList = $(`#reports-list-${taskId}`);
    reportsList.empty();

    if (!reports || reports.length === 0) {
        reportsList.append('<div class="text-muted">لا توجد تقارير</div>');
        return;
    }

    reports.forEach(report => {
        const reportDate = new Date(report.created_at).toLocaleString('ar-SA');
        const reportElement = $(`
            <div class="card mb-2">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <small class="text-muted">${reportDate}</small>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteReport(${report.id}, ${taskId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="card-body">
                    ${report.html_content}
                </div>
            </div>
        `);
        reportsList.append(reportElement);
    });
}

// إضافة دالة معالجة ضغط Enter في حقل المهمة الفرعية
function handleSubtaskKeyPress(event, taskId) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addSubtask(taskId);
    }
}

/**
 * إضافة مهمة فرعية جديدة
 * @param {number} taskId - معرف المهمة الرئيسية
 */
function addSubtask(taskId) {
    // تحديد حقل الإدخال باستخدام معرف المهمة
    const input = $(`.subtask-input[data-task-id="${taskId}"]`);
    const title = input.val().trim();

    // إزالة رسائل الخطأ السابقة
    input.removeClass('is-invalid');
    input.parent().find('.error-message').remove();

    // التحقق من القيمة المدخلة
    if (!title) {
        input.addClass('is-invalid');
        input.parent().append('<div class="error-message">يرجى إدخال عنوان المهمة الفرعية</div>');
        input.focus();
        return;
    }

    // إرسال طلب إضافة المهمة الفرعية
    $.ajax({
        url: 'api/subtasks.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            task_id: taskId,
            title: title
        }),
        beforeSend: function() {
            input.prop('disabled', true);
            input.siblings('button').prop('disabled', true);
        },
        success: function(response) {
            if (response.success) {
                input.val('').removeClass('is-invalid');
                loadTaskSubtasks(taskId);
                toastr.success('تم إضافة المهمة الفرعية بنجاح');
            } else {
                toastr.error(response.message || 'حدث خطأ أثناء إضافة المهمة الفرعية');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error adding subtask:', error);
            toastr.error('حدث خطأ أثناء إضافة المهمة الفرعية');
        },
        complete: function() {
            input.prop('disabled', false);
            input.siblings('button').prop('disabled', false);
            input.focus();
        }
    });
}

/**
 * تهيئة خاصية السحب والإفلات للمهام الفرعية
 * @param {string} containerId - معرف حاوية المهام الفرعية
 */
function initDragAndDrop(containerId) {
    const container = $(`#${containerId}`);
    const items = container.find('.subtask-draggable');

    items.each(function() {
        $(this).attr('draggable', true);

        $(this).on('dragstart', function(e) {
            e.originalEvent.dataTransfer.setData('text/plain', $(this).data('subtask-id'));
            $(this).addClass('dragging');
        });

        $(this).on('dragend', function() {
            $(this).removeClass('dragging');
            $('.subtask-drop-zone').removeClass('active');
        });

        $(this).on('dragover', function(e) {
            e.preventDefault();
            const draggingItem = $('.dragging');
            if (!draggingItem.is($(this))) {
                const dropZone = $(this).next('.subtask-drop-zone');
                dropZone.addClass('active');
            }
        });

        $(this).on('dragleave', function() {
            $(this).next('.subtask-drop-zone').removeClass('active');
        });

        $(this).on('drop', function(e) {
            e.preventDefault();
            const draggedId = e.originalEvent.dataTransfer.getData('text/plain');
            const droppedId = $(this).data('subtask-id');

            if (draggedId !== droppedId) {
                reorderSubtasks(draggedId, droppedId);
            }
        });
    });
}

/**
 * إعادة ترتيب المهام الفرعية
 * @param {number} draggedId - معرف المهمة المسحوبة
 * @param {number} droppedId - معرف المهمة المفلوت عليها
 */
function reorderSubtasks(draggedId, droppedId) {
    $.ajax({
        url: 'api/subtasks.php',
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
            action: 'reorder',
            dragged_id: draggedId,
            dropped_id: droppedId
        }),
        success: function(response) {
            if (response.success) {
                loadTaskSubtasks(currentTaskId);
                toastr.success('تم إعادة ترتيب المهام الفرعية بنجاح');
            } else {
                toastr.error('حدث خطأ أثناء إعادة الترتيب');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error reordering subtasks:', error);
            toastr.error('حدث خطأ أثناء إعادة الترتيب');
        }
    });
}

// تحديث دالة showStatusModal لاستخدام الدوال الجديدة
function showStatusModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let buttonsHtml = '';
    Object.entries(taskStatuses).forEach(([status, info]) => {
        const badgeClass = info.class.replace('bg-', '');
        buttonsHtml += `
            <button type="button" class="btn btn-lg btn-outline-${badgeClass} mb-2 w-100" 
                    onclick="updateTaskStatus(${taskId}, '${status}')">
                <i class="fas fa-${info.icon}"></i> ${info.text}
            </button>
        `;
    });

    Swal.fire({
        title: 'تغيير حالة المهمة',
        html: `<div class="status-buttons">${buttonsHtml}</div>`,
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
            popup: 'status-modal'
        }
    });
}

// إضافة دالة لتحديث حالة المهمة
function updateTaskStatus(taskId, status) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

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
                Swal.close();
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

// إضافة دالة تبديل تحديد المهمة الفرعية
function toggleSubtaskSelection(subtaskId) {
    const label = $(`.subtask-title[onclick*="${subtaskId}"]`);
    label.toggleClass('selected-subtask');
}

// إضافة دالة تحديث الإحصائيات
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;

    // تحديث إحصائيات الهيدر
    $('#total-tasks').text(totalTasks);
    $('#completed-tasks').text(completedTasks);
    $('#pending-tasks').text(pendingTasks);

    // تحديث إحصائيات الفوتر
    $('#footer-total').text(totalTasks);
    $('#footer-completed').text(completedTasks);
    $('#footer-progress').text(inProgressTasks);
}