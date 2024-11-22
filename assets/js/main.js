// إعدادات Toast
toastr.options = {
    "closeButton": true,
    "progressBar": true,
    "positionClass": "toast-top-left",
    "timeOut": "3000"
};

// إعدادات المحرر المتقدم
const initEditor = (selector) => {
    tinymce.init({
        selector: selector,
        directionality: 'rtl',
        language: 'ar',
        plugins: 'lists link image table code',
        toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | table | code',
        height: 300
    });
};

// دالة تحميل المهام
const loadTasks = () => {
    $.ajax({
        url: 'api/tasks.php',
        method: 'GET',
        success: function(response) {
            $('#tasksList').empty();
            response.tasks.forEach(task => {
                $('#tasksList').append(createTaskCard(task));
            });
        },
        error: function(xhr, status, error) {
            toastr.error('حدث خطأ أثناء تحميل المهام');
        }
    });
};

// دالة إنشاء بطاقة المهمة
const createTaskCard = (task) => {
    return `
        <div class="task-card bg-white p-4 rounded-lg shadow-md">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                    <input type="checkbox" class="task-checkbox" 
                           data-task-id="${task.id}" 
                           ${task.status ? 'checked' : ''}>
                    <h3 class="text-lg font-semibold mr-2 ${task.status ? 'completed-task' : ''}">${task.title}</h3>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editTask(${task.id})" class="text-blue-500 hover:text-blue-700">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteTask(${task.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p class="text-gray-600 mb-3">${task.description}</p>
            <div class="mt-4">
                <button onclick="showReports(${task.id})" class="text-sm text-blue-500 hover:text-blue-700">
                    <i class="fas fa-file-alt ml-1"></i>التقارير
                </button>
                <button onclick="exportToPDF(${task.id})" class="text-sm text-green-500 hover:text-green-700 mr-3">
                    <i class="fas fa-file-pdf ml-1"></i>PDF
                </button>
            </div>
        </div>
    `;
};

// دالة إضافة مهمة جديدة
const addTask = () => {
    const taskData = {
        title: $('#taskTitle').val(),
        description: $('#taskDescription').val()
    };

    $.ajax({
        url: 'api/tasks.php',
        method: 'POST',
        data: taskData,
        success: function(response) {
            $('#addTaskModal').modal('hide');
            toastr.success('تم إضافة المهمة بنجاح');
            loadTasks();
        },
        error: function(xhr, status, error) {
            toastr.error('حدث خطأ أثناء إضافة المهمة');
        }
    });
};

// دالة عرض التقارير
const showReports = (taskId) => {
        $.ajax({
                    url: `api/reports.php?task_id=${taskId}`,
                    method: 'GET',
                    success: function(response) {
                            // إنشاء نافذة أكبر للتقارير
                            Swal.fire({
                                        title: 'تقارير المهمة',
                                        html: `
                    <div class="reports-container mb-4" style="max-height: 300px; overflow-y: auto;">
                        ${response.reports.map(report => `
                            <div class="report-item mb-3 p-3 border rounded">
                                <div class="report-content">${report.content}</div>
                                <div class="text-muted text-sm">${formatDate(report.created_at)}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-4">
                        <div id="newReportWrapper">
                            <textarea id="newReport" style="width: 100%; min-height: 200px;"></textarea>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'إضافة تقرير',
                cancelButtonText: 'إغلاق',
                width: '800px', // جعل النافذة أكبر
                didOpen: () => {
                    // تهيئة المحرر بعد فتح النافذة مباشرة
                    tinymce.init({
                        selector: '#newReport',
                        directionality: 'rtl',
                        language: 'ar',
                        plugins: 'lists link image table code',
                        toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | table | code',
                        height: 200,
                        menubar: false,
                        statusbar: false,
                        setup: function(editor) {
                            editor.on('change', function() {
                                editor.save(); // حفظ المحتوى في textarea
                            });
                        }
                    });
                },
                preConfirm: () => {
                    // الحصول على محتوى المحرر
                    const content = tinymce.get('newReport').getContent();
                    if (!content) {
                        Swal.showValidationMessage('الرجاء كتابة محتوى التقرير');
                        return false;
                    }
                    return addReport(taskId, content);
                },
                willClose: () => {
                    // تدمير المحرر عند إغلاق النافذة
                    tinymce.remove('#newReport');
                }
            });
        },
        error: function(xhr, status, error) {
            toastr.error('حدث خطأ أثناء تحميل التقارير');
        }
    });
};

// دالة تعديل المهمة
const editTask = (taskId) => {
    $.ajax({
        url: `api/tasks.php?id=${taskId}`,
        method: 'GET',
        success: function(response) {
            const task = response.task;
            Swal.fire({
                title: 'تعديل المهمة',
                html: `
                    <input id="editTaskTitle" class="swal2-input" value="${task.title}" placeholder="عنوان المهمة">
                    <textarea id="editTaskDescription" class="swal2-textarea" placeholder="وصف المهمة">${task.description}</textarea>
                `,
                showCancelButton: true,
                confirmButtonText: 'حفظ',
                cancelButtonText: 'إلغاء',
                preConfirm: () => {
                    const data = {
                        id: taskId,
                        title: $('#editTaskTitle').val(),
                        description: $('#editTaskDescription').val()
                    };
                    return $.ajax({
                        url: 'api/tasks.php',
                        method: 'PUT',
                        data: JSON.stringify(data),
                        contentType: 'application/json'
                    });
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    toastr.success('تم تحديث المهمة بنجاح');
                    loadTasks();
                }
            });
        },
        error: function(xhr, status, error) {
            toastr.error('حدث خطأ أثناء تحميل بيانات المهمة');
        }
    });
};

// دالة حذف المهمة
const deleteTask = (taskId) => {
    Swal.fire({
        title: 'هل أنت متأكد؟',
        text: 'سيتم حذف المهمة وجميع تقاريرها',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `api/tasks.php?id=${taskId}`,
                method: 'DELETE',
                success: function(response) {
                    toastr.success('تم حذف المهمة بنجاح');
                    loadTasks();
                },
                error: function(xhr, status, error) {
                    toastr.error('حدث خطأ أثناء حذف المهمة');
                }
            });
        }
    });
};

// دالة تحديث حالة المهمة
const updateTaskStatus = (taskId, status) => {
    $.ajax({
        url: 'api/tasks.php',
        method: 'PATCH',
        data: JSON.stringify({
            id: taskId,
            status: status
        }),
        contentType: 'application/json',
        success: function(response) {
            toastr.success('تم تحديث حالة المهمة');
            loadTasks();
        },
        error: function(xhr, status, error) {
            toastr.error('حدث خطأ أثناء تحديث حالة المهمة');
        }
    });
};

// دالة إضافة تقرير
const addReport = (taskId, content) => {
    return $.ajax({
        url: 'api/reports.php',
        method: 'POST',
        data: {
            task_id: taskId,
            content: content
        },
        success: function(response) {
            toastr.success('تم إضافة التقرير بنجاح');
            return true;
        },
        error: function(xhr, status, error) {
            toastr.error('حدث خطأ أثناء إضافة التقرير');
            return false;
        }
    });
};

// دالة تنسيق التاريخ
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// تهيئة الأحداث عند تحميل الصفحة
$(document).ready(function() {
    // تحميل المهام
    loadTasks();

    // إضافة مهمة جديدة
    $('#addTaskBtn').click(function() {
        Swal.fire({
            title: 'إضافة مهمة جديدة',
            html: `
                <input id="taskTitle" class="swal2-input" placeholder="عنوان المهمة">
                <textarea id="taskDescription" class="swal2-textarea" placeholder="وصف المهمة"></textarea>
            `,
            showCancelButton: true,
            confirmButtonText: 'إضافة',
            cancelButtonText: 'إلغاء',
            preConfirm: () => {
                return {
                    title: $('#taskTitle').val(),
                    description: $('#taskDescription').val()
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                addTask();
            }
        });
    });

    // تحديث حالة المهمة
    $(document).on('change', '.task-checkbox', function() {
        const taskId = $(this).data('task-id');
        const status = $(this).prop('checked');
        updateTaskStatus(taskId, status);
    });
});