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

/**
 * تحديث الإحصائيات مع تأثيرات حركية
 * @param {Object} stats - كائن يحتوي على الإحصائيات
 */
function updateStats() {
    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length
    };

    // تحديث شارات الهيدر مع تأثير حركي
    animateCounter('#total-tasks', stats.total);
    animateCounter('#completed-tasks', stats.completed);
    animateCounter('#pending-tasks', stats.pending);

    // تحديث شارات الفوتر مع تأثير حركي
    animateCounter('#footer-total', stats.total);
    animateCounter('#footer-completed', stats.completed);
    animateCounter('#footer-progress', stats.inProgress);

    // إضافة تأثير وميض للشارات عند التحديث
    $('.badge').addClass('badge-updated');
    setTimeout(() => {
        $('.badge').removeClass('badge-updated');
    }, 500);
}

/**
 * دالة لإضافة تأثير حركي للعدادات
 * @param {string} selector - محدد العنصر
 * @param {number} endValue - القيمة النهائية
 */
function animateCounter(selector, endValue) {
    const $element = $(selector);
    const startValue = parseInt($element.text()) || 0;

    $({ value: startValue }).animate({ value: endValue }, {
        duration: 500,
        easing: 'swing',
        step: function() {
            $element.text(Math.floor(this.value));
        },
        complete: function() {
            $element.text(endValue);
        }
    });
}

// إضافة CSS للتأثير الحركي
$('<style>')
    .text(`
        @keyframes badgeUpdate {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        .badge-updated {
            animation: badgeUpdate 0.5s ease;
        }
    `)
    .appendTo('head');