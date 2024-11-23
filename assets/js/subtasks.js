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
        const element = $(`
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" 
                           ${subtask.completed ? 'checked' : ''}
                           onchange="toggleSubtask(${subtask.id}, this.checked)">
                    <label class="form-check-label">${escapeHtml(subtask.title)}</label>
                </div>
                <button class="btn btn-sm btn-danger" onclick="deleteSubtask(${subtask.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `);
        subtasksList.append(element);
    });
}

/**
 * إضافة مهمة فرعية جديدة
 */
function addSubtask() {
    const title = $('#newSubtaskTitle').val().trim();
    if (!title) {
        toastr.error('يرجى إدخال عنوان المهمة الفرعية');
        return;
    }

    $.ajax({
        url: 'api/subtasks.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            task_id: currentTaskId,
            title: title
        }),
        success: function(response) {
            if (response.success) {
                $('#newSubtaskTitle').val('');
                loadSubtasks();
                loadTasks(); // تحديث التقدم في المهمة الرئيسية
                toastr.success('تم إضافة المهمة الفرعية بنجاح');
            } else {
                toastr.error(response.message || 'حدث خطأ أثناء إضافة المهمة الفرعية');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error adding subtask:', error);
            toastr.error('حدث خطأ أثناء إضافة المهمة الفرعية');
        }
    });
}

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