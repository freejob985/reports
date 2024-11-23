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
                        <h6 class="mb-3">المهام الفرعية</h6>
                        
                        <!-- تحديث نموذج إضافة مهمة فرعية -->
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

    subtasks.forEach((subtask, index) => {
        const element = $(`
            <div class="list-group-item subtask-draggable d-flex justify-content-between align-items-center ${subtask.completed ? 'completed-subtask' : ''}"
                 data-subtask-id="${subtask.id}">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" 
                           ${subtask.completed ? 'checked' : ''}
                           onchange="toggleSubtask(${subtask.id}, this.checked, ${taskId})">
                    <label class="form-check-label">${escapeHtml(subtask.title)}</label>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteSubtask(${subtask.id}, ${taskId})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="subtask-drop-zone"></div>
        `);
        subtasksList.append(element);
    });

    // تهيئة خاصية السحب والإفلات
    initDragAndDrop(`subtasks-list-${taskId}`);
    updateTaskProgress(taskId, subtasks);
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

    // استخدام CSS transition بدلاً من jQuery animate
    progressBar.css({
        'width': `${progress}%`,
        'transition': 'width 0.4s ease-in-out'
    }).text(Math.round(progress) + '%');

    // تحديث اللون بناءً على التقدم
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
    const input = $(`.subtask-input[data-task-id="${taskId}"]`);
    const title = input.val().trim();

    // إزالة رسائل الخطأ السابقة
    input.removeClass('is-invalid');
    input.parent().find('.error-message').remove();

    if (!title) {
        return;
    }

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
                input.val('');
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