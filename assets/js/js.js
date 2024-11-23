// تهيئة المتغيرات العامة
let tasks = [];
let subtasks = [];
let reports = [];

// إضافة متغيرات للتحكم في حالة العرض
let showSubtasks = true;
let showReports = true;

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
function loadTasks(projectId = null) {
    let url = 'api/tasks.php';
    if (projectId) {
        url += `?project_id=${projectId}`;
    }

    $.ajax({
        url: url,
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

    // جلب قائمة المشاريع
    $.ajax({
                url: 'api/projects.php',
                method: 'GET',
                success: function(response) {
                        if (response.success) {
                            const projects = response.projects;

                            // تعبئة نموذج التحرير بالبيانات الحالية
                            $('#taskId').val(task.id);
                            $('#taskTitle').val(task.title);
                            $('#taskDescription').val(task.description);
                            $('#taskStatus').val(task.status);

                            // إضافة قائمة المشاريع
                            const projectSelect = `
                    <div class="mb-3">
                        <label class="form-label">المشروع</label>
                        <select class="form-select" id="taskProject">
                            ${projects.map(project => `
                                <option value="${project.id}" ${project.id === task.project_id ? 'selected' : ''}>
                                    ${escapeHtml(project.name)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                `;

                // إضافة قائمة المشاريع قبل حقل العنوان
                $('#taskTitle').parent().before(projectSelect);

                // تحديث عنوان النموذج
                $('.modal-title').text('تعديل المهمة');

                // إنشاء أزرار تغيير الحالة السريع
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
        },
        error: function(xhr, status, error) {
            console.error('Error loading projects:', error);
            toastr.error('حدث خطأ أثناء تحميل المشاريع');
        }
    });
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

/**
 * حفظ المهمة
 */
function saveTask() {
    const taskData = {
        id: $('#taskId').val(),
        project_id: $('#taskProject').val(),
        title: $('#taskTitle').val().trim(),
        description: $('#taskDescription').val().trim(),
        status: $('#taskStatus').val()
    };

    if (!taskData.title) {
        toastr.error('يرجى إدخال عنوان المهمة');
        return;
    }

    if (!taskData.project_id) {
        toastr.error('يرجى اختيار مشروع');
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
                
                // إذا تم نقل المهمة لمشروع آخر
                if (taskData.id && taskData.project_id !== currentProjectId) {
                    toastr.success('تم نقل المهمة إلى المشروع الجديد بنجاح');
                    // تحديث عرض المهام للمشروع الحالي
                    loadTasks(currentProjectId);
                } else {
                    toastr.success(taskData.id ? 'تم تحديث المهمة بنجاح' : 'تم إضافة المهمة بنجاح');
                    loadTasks(taskData.project_id);
                }
                
                // تحديث إحصائيات المشاريع
                loadProjects();
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
 * عرض نموذج إضافة مهمة جديدة
 */
function showAddTaskModal() {
    // إعادة تعيين النموذج
    $('#taskForm')[0].reset();
    $('#taskId').val('');
    $('#taskStatus').val('pending');

    // جلب قائمة المشاريع
    $.ajax({
        url: 'api/projects.php',
        method: 'GET',
        success: function(response) {
            if (response.success) {
                const projects = response.projects;
                
                // إضافة قائمة المشاريع
                const projectSelect = `
                    <div class="mb-3">
                        <label class="form-label">المشروع</label>
                        <select class="form-select" id="taskProject" required>
                            <option value="">اختر المشروع</option>
                            ${projects.map(project => `
                                <option value="${project.id}" ${project.id === currentProjectId ? 'selected' : ''}>
                                    ${escapeHtml(project.name)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                `;

                // إضافة قائمة المشاريع قبل حقل العنوان
                $('#taskTitle').parent().before(projectSelect);

                // تحديث عنوان النموذج
                $('.modal-title').text('إضافة مهمة جديدة');

                // عرض النموذج
                $('#taskModal').modal('show');
            }
        }
    });
}

/**
 * دالة للحصول على النص لعربي للحالة
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

// تحديث دالة renderTasks لدعم إخفاء/إظهار الأقسام
function renderTasks() {
    const tasksList = $('#tasks-list');
    tasksList.empty();

    if (tasks.length === 0) {
        tasksList.append('<div class="alert alert-info">لا توجد مهام حالياً</div>');
        return;
    }

    // إضافة أزرار التحكم في العرض
    const viewControls = $(`
        <div class="view-controls mb-4">
            <div class="btn-group">
                <button class="btn ${showSubtasks ? 'btn-primary' : 'btn-outline-primary'}" 
                        onclick="toggleSubtasks()">
                    <i class="fas ${showSubtasks ? 'fa-eye-slash' : 'fa-eye'}"></i>
                    المهام الفرعية
                </button>
                <button class="btn ${showReports ? 'btn-primary' : 'btn-outline-primary'}" 
                        onclick="toggleReports()">
                    <i class="fas ${showReports ? 'fa-eye-slash' : 'fa-eye'}"></i>
                    التقارير
                </button>
            </div>
        </div>
    `);
    tasksList.append(viewControls);

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
                            <span class="badge bg-primary task-title-badge">
                                <i class="fas fa-tasks me-1"></i>
                                ${escapeHtml(task.title)}
                            </span>
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
                    <p class="card-text">${escapeHtml(task.description || '')}</p>

                    <!-- المهام الفرعية -->
                    <div class="subtasks-section mb-3" style="display: ${showSubtasks ? 'block' : 'none'}">
                        <h6 class="mb-3">
                            المهام الفرعية
                            <button class="btn btn-sm btn-outline-primary float-end" 
                                    onclick="toggleSubtasksSection(${task.id})">
                                <i class="fas fa-chevron-up"></i>
                            </button>
                        </h6>
                        <div class="subtasks-content" id="subtasks-content-${task.id}">
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
                    </div>

                    <!-- قسم التقارير -->
                    <div class="reports-section mb-3" style="display: ${showReports ? 'block' : 'none'}">
                        <h6 class="mb-3">
                            التقارير
                            <button class="btn btn-sm btn-outline-primary float-end" 
                                    onclick="toggleReportsSection(${task.id})">
                                <i class="fas fa-chevron-up"></i>
                            </button>
                        </h6>
                        <div class="reports-content" id="reports-content-${task.id}">
                            <div id="reports-list-${task.id}">
                                <!-- سيتم تحميل التقارير هنا -->
                            </div>
                        </div>
                    </div>

                    <!-- شريط التقدم -->
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" style="width: 0%" 
                             aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                    </div>
                </div>
            </div>
        `);

        tasksList.append(taskElement);
        
        if (showSubtasks) {
            loadTaskSubtasks(task.id);
        }
        if (showReports) {
            loadTaskReports(task.id);
        }
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
            // تحديث اللون بناءً عل النسبة
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

// إضافة تنسيقات CSS جديدة للـ Badge
$('<style>')
    .text(`
        .task-title-badge {
            font-size: 1.1rem;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            background: linear-gradient(135deg, #6B73FF 0%, #000DFF 100%);
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .task-title-badge:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            background: linear-gradient(135deg, #000DFF 0%, #6B73FF 100%);
        }

        .task-title-badge i {
            margin-right: 8px;
            font-size: 0.9em;
        }
    `)
    .appendTo('head');

/**
 * تحديث الإحصائيات العامة
 */
function updateStats() {
    // جلب إحصائيات جميع المشاريع
    $.ajax({
        url: 'api/tasks.php?stats=all',
        method: 'GET',
        success: function(response) {
            if (response.success) {
                const stats = response.stats;
                
                // تحديث الإحصائيات في الهيدر
                $('#total-tasks').text(stats.total || 0);
                $('#completed-tasks').text(stats.completed || 0);
                $('#pending-tasks').text(stats.pending || 0);

                // تحديث الإحصائيات في الفوتر
                $('#footer-total').text(stats.total || 0);
                $('#footer-completed').text(stats.completed || 0);
                $('#footer-progress').text(stats.in_progress || 0);

                // تحديث شريط التقدم الإجمالي
                const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                const progressBar = $('#overall-progress');
                
                progressBar.css('width', `${progress}%`).text(`${progress}%`);
                
                // تحديث لون شريط التقدم
                progressBar.removeClass('bg-danger bg-warning bg-info bg-success');
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
        },
        error: function(xhr, status, error) {
            console.error('Error updating stats:', error);
        }
    });
}

/**
 * تبديل حالة عرض المهام الفرعية
 */
function toggleSubtasks() {
    showSubtasks = !showSubtasks;
    localStorage.setItem('showSubtasks', showSubtasks);
    renderTasks();
}

/**
 * تبديل حالة عرض التقارير
 */
function toggleReports() {
    showReports = !showReports;
    localStorage.setItem('showReports', showReports);
    renderTasks();
}

/**
 * تبديل حالة عرض قسم المهام الفرعية لمهمة محددة
 * @param {number} taskId - معرف المهمة
 */
function toggleSubtasksSection(taskId) {
    const content = $(`#subtasks-content-${taskId}`);
    const button = content.prev().find('button i');
    
    if (content.is(':visible')) {
        content.slideUp();
        button.removeClass('fa-chevron-up').addClass('fa-chevron-down');
    } else {
        content.slideDown();
        button.removeClass('fa-chevron-down').addClass('fa-chevron-up');
        loadTaskSubtasks(taskId);
    }
}

/**
 * تبديل حالة عرض قسم التقارير لمهمة محددة
 * @param {number} taskId - معرف المهمة
 */
function toggleReportsSection(taskId) {
    const content = $(`#reports-content-${taskId}`);
    const button = content.prev().find('button i');
    
    if (content.is(':visible')) {
        content.slideUp();
        button.removeClass('fa-chevron-up').addClass('fa-chevron-down');
    } else {
        content.slideDown();
        button.removeClass('fa-chevron-down').addClass('fa-chevron-up');
        loadTaskReports(taskId);
    }
}

// استرجاع حالة العرض عند تحميل الصفحة
$(document).ready(function() {
    showSubtasks = localStorage.getItem('showSubtasks') !== 'false';
    showReports = localStorage.getItem('showReports') !== 'false';
    loadTasks();
});