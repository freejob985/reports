/**
 * إدارة المهام الفرعية
 * يتيح هذا الملف إضافة وتحديث وحذف المهام الفرعية المرتبطة بالمهام الرئيسية
 */

let currentTaskId = null;

/**
 * عرض نموذج المهام الفرعية
 * @param {number} taskId - معرف المهمة الرئيسية
 */
function showSubtasksModal(taskId) {
    currentTaskId = taskId;
    loadSubtasks();
    $('#subtaskModal').modal('show');
}

/**
 * تحميل المهام الفرعية للمهمة الحالية
 */
function loadSubtasks() {
    $.ajax({
        url: `api/subtasks.php?task_id=${currentTaskId}`,
        method: 'GET',
        success: function(response) {
            if (response.success) {
                renderSubtasks(response.subtasks);
            } else {
                toastr.error(response.message || 'حدث خطأ أثناء تحميل المهام الفرعية');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading subtasks:', error);
            toastr.error('حدث خطأ أثناء تحميل المهام الفرعية');
        }
    });
}

/**
 * عرض المهام الفرعية في النموذج
 * @param {Array} subtasks - قائمة المهام الفرعية
 */
function renderSubtasks(subtasks) {
    const subtasksList = $('#subtasksList');
    subtasksList.empty();

    if (subtasks.length === 0) {
        subtasksList.append('<div class="alert alert-info">لا توجد مهام فرعية</div>');
        return;
    }

    subtasks.forEach(subtask => {
        const element = $(renderSubtask(subtask));
        subtasksList.append(element);
    });
}

/**
 * إضافة مهمة فرعية جديدة
 */


/**
 * تحديث حالة المهمة الفرعية
 * @param {number} subtaskId - معرف المهمة الفرعية
 * @param {boolean} completed - حالة الإكمال
 */
function toggleSubtask(subtaskId, completed) {
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
                loadTasks(); // تحديث التقدم في المهمة الرئيسية
            } else {
                toastr.error(response.message || 'حدث خطأ أثناء تحديث المهمة الفرعية');
                loadSubtasks(); // إعادة تحميل المهام الفرعية في حالة الفشل
            }
        },
        error: function(xhr, status, error) {
            console.error('Error updating subtask:', error);
            toastr.error('حدث خطأ أثناء تحديث المهمة الفرعية');
            loadSubtasks();
        }
    });
}

/**
 * حذف مهمة فرعية
 * @param {number} subtaskId - معرف المهمة الفرعية
 */
function deleteSubtask(subtaskId) {
    Swal.fire({
        title: 'تأكيد الحذف',
        text: 'هل أنت متأكد من حذف هذه المهمة الفرعية؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `api/subtasks.php?id=${subtaskId}`,
                method: 'DELETE',
                success: function(response) {
                    if (response.success) {
                        loadSubtasks();
                        loadTasks(); // تحديث التقدم في المهمة الرئيسية
                        toastr.success('تم حذف المهمة الفرعية بنجاح');
                    } else {
                        toastr.error(response.message || 'حدث خطأ أثناء حذف المهمة الفرعية');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error deleting subtask:', error);
                    toastr.error('حدث خطأ أثناء حذف المهمة الفرعية');
                }
            });
        }
    });
}

function initDragAndDrop(containerId) {
    const container = $(`#${containerId}`);

    container.sortable({
        items: '.subtask-draggable',
        handle: '.drag-handle',
        placeholder: 'subtask-placeholder',
        axis: 'y',
        opacity: 0.7,
        cursor: 'move',
        tolerance: 'pointer',
        helper: 'clone',
        forceHelperSize: true,
        forcePlaceholderSize: true,
        update: function(event, ui) {
            const draggedId = ui.item.data('subtask-id');
            const droppedId = ui.item.next().data('subtask-id');

            if (draggedId && droppedId) {
                reorderSubtasks(draggedId, droppedId);
            }
        }
    }).disableSelection();

    // تحسين مظهر مقبض السحب
    $('.subtask-draggable').each(function() {
        if (!$(this).find('.drag-handle').length) {
            $(this).prepend(`
                <div class="drag-handle me-2" style="cursor: move;">
                    <i class="fas fa-grip-vertical text-muted"></i>
                </div>
            `);
        }
    });
}

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
                toastr.success('تم إعادة ترتيب المهام الفرعية بنجاح');
            } else {
                toastr.error(response.message || 'حدث خطأ أثناء إعادة الترتيب');
                // إعادة تحميل المهام الفرعية في حالة الفشل
                loadTaskSubtasks(currentTaskId);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error reordering subtasks:', error);
            toastr.error('حدث خطأ أثناء إعادة الترتيب');
            loadTaskSubtasks(currentTaskId);
        }
    });
}

/**
 * تحرير مهمة فرعية
 * @param {number} subtaskId - معرف المهمة الفرعية
 * @param {number} taskId - معرف المهمة الرئيسية
 */
function editSubtask(subtaskId, taskId) {
    // البحث عن المهمة الفرعية في DOM
    const subtaskElement = $(`.subtask-draggable[data-subtask-id="${subtaskId}"]`);
    const currentTitle = subtaskElement.find('.form-check-label').text().trim();

    // عرض مربع حوار للتحرير باستخدام SweetAlert2
    Swal.fire({
        title: 'تحرير المهمة الفرعية',
        input: 'text',
        inputValue: currentTitle,
        inputLabel: 'عنوان المهمة الفرعية',
        showCancelButton: true,
        confirmButtonText: 'حفظ',
        cancelButtonText: 'إلغاء',
        inputValidator: (value) => {
            if (!value.trim()) {
                return 'يرجى إدخال عنوان المهمة الفرعية';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const newTitle = result.value.trim();

            // تحديث المهمة الفرعية في قاعدة البيانات
            $.ajax({
                url: 'api/subtasks.php',
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    id: subtaskId,
                    title: newTitle,
                    action: 'update_title'
                }),
                success: function(response) {
                    if (response.success) {
                        // تحديث العنوان في واجهة المستخدم
                        subtaskElement.find('.form-check-label').text(newTitle);
                        toastr.success('تم تحديث المهمة الفرعية بنجاح');
                    } else {
                        toastr.error(response.message || 'حدث خطأ أثناء تحديث المهمة الفرعية');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error updating subtask:', error);
                    toastr.error('حدث خطأ أثناء تحديث المهمة الفرعية');
                }
            });
        }
    });
}

function renderSubtask(subtask) {
    return `
        <div class="subtask-item ${subtask.completed ? 'completed-subtask' : ''}" 
             data-id="${subtask.id}">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" 
                       ${subtask.completed ? 'checked' : ''}
                       onchange="toggleSubtask(${subtask.id}, this.checked)">
                <label class="form-check-label">
                    ${escapeHtml(subtask.title)}
                </label>
            </div>
            <div class="subtask-actions ms-auto">
                <button class="btn btn-sm btn-outline-primary" 
                        onclick="editSubtask(${subtask.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" 
                        onclick="deleteSubtask(${subtask.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}