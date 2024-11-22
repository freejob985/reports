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
        <div class="task-list-item bg-white rounded-lg shadow-sm p-4">
            <div class="flex items-start">
                <!-- مؤشر الحالة والأولوية -->
                <div class="flex flex-col items-center space-y-2 ml-4">
                    <input type="checkbox" class="task-checkbox w-5 h-5" 
                           data-task-id="${task.id}" 
                           ${task.status ? 'checked' : ''}>
                    <div class="status-badge status-${task.status_type}">
                        ${task.status_type}
                    </div>
                    <div class="priority-badge priority-${task.priority}">
                        ${getPriorityLabel(task.priority)}
                    </div>
                </div>
                
                <!-- تفاصيل المهمة -->
                <div class="flex-grow">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold ${task.status ? 'line-through text-gray-500' : ''}">${task.title}</h3>
                        <div class="flex space-x-2">
                            <button onclick="editTask(${task.id})" class="text-blue-500 hover:text-blue-700">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteTask(${task.id})" class="text-red-500 hover:text-red-700">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <p class="text-gray-600 mt-2">${task.description}</p>
                    
                    <!-- المهام الفرعية -->
                    ${task.subtasks && task.subtasks.length > 0 ? `
                        <div class="subtasks-list">
                            <h4 class="text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-tasks ml-1"></i>المهام الفرعية
                            </h4>
                            <ul class="space-y-2">
                                ${task.subtasks.map(subtask => `
                                    <li class="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <div class="flex items-center">
                                            <input type="checkbox" 
                                                   class="subtask-checkbox mr-2" 
                                                   data-subtask-id="${subtask.id}"
                                                   ${subtask.status ? 'checked' : ''}>
                                            <span class="${subtask.status ? 'line-through text-gray-500' : ''}">${subtask.title}</span>
                                        </div>
                                        <span class="priority-badge priority-${subtask.priority}">
                                            ${getPriorityLabel(subtask.priority)}
                                        </span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <!-- التقارير -->
                    ${task.reports && task.reports.length > 0 ? `
                        <div class="reports-list">
                            <h4 class="text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-file-alt ml-1"></i>التقارير
                            </h4>
                            <ul class="space-y-2">
                                ${task.reports.map(report => `
                                    <li class="bg-gray-50 p-3 rounded">
                                        <div class="text-sm">${report.content}</div>
                                        <div class="text-xs text-gray-500 mt-2">
                                            ${formatDate(report.created_at)}
                                        </div>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <!-- أزرار الإجراءات -->
                    <div class="mt-4 flex items-center space-x-4">
                        <button onclick="addSubtask(${task.id})" 
                                class="text-sm text-blue-500 hover:text-blue-700">
                            <i class="fas fa-plus ml-1"></i>مهمة فرعية
                        </button>
                        <button onclick="showReports(${task.id})" 
                                class="text-sm text-blue-500 hover:text-blue-700">
                            <i class="fas fa-file-alt ml-1"></i>إضافة تقرير
                        </button>
                        <button onclick="changeStatus(${task.id})" 
                                class="text-sm text-blue-500 hover:text-blue-700">
                            <i class="fas fa-exchange-alt ml-1"></i>تغيير الحالة
                        </button>
                    </div>
                </div>
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
            toastr.error('حدث خطأ أناء تحميل التقارير');
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

// دالة تصدير المهمة إلى PDF
const exportToPDF = (taskId) => {
    $.ajax({
        url: `api/tasks.php?id=${taskId}`,
        method: 'GET',
        success: function(response) {
            const task = response.task;
            
            // جلب التقارير المرتبطة بالمهمة
            $.ajax({
                url: `api/reports.php?task_id=${taskId}`,
                method: 'GET',
                success: function(reportsResponse) {
                    // إنشاء محتوى PDF
                    const content = `
                        <div class="pdf-container" dir="rtl" style="font-family: 'Tajawal', sans-serif; padding: 20px;">
                            <h1 style="text-align: center; color: #2563eb; margin-bottom: 20px;">تقرير المهمة</h1>
                            
                            <div class="task-details" style="margin-bottom: 30px;">
                                <h2 style="color: #1f2937;">تفاصيل المهمة</h2>
                                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
                                    <h3 style="margin: 0 0 10px 0;">${task.title}</h3>
                                    <p style="margin: 0; color: #4b5563;">${task.description}</p>
                                    <p style="margin: 10px 0 0 0; color: #6b7280;">
                                        الحالة: ${task.status ? 'مكتملة' : 'قيد التنفيذ'}
                                    </p>
                                </div>
                            </div>
                            
                            <div class="reports-section">
                                <h2 style="color: #1f2937;">التقارير</h2>
                                ${reportsResponse.reports.map(report => `
                                    <div style="background: #ffffff; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 15px;">
                                        <div style="margin-bottom: 10px;">${report.content}</div>
                                        <div style="color: #6b7280; font-size: 0.875rem;">
                                            ${formatDate(report.created_at)}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;

                    // إعدادات PDF
                    const opt = {
                        margin: 1,
                        filename: `مهمة_${task.title}.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { 
                            scale: 2,
                            useCORS: true,
                            logging: false
                        },
                        jsPDF: { 
                            unit: 'cm', 
                            format: 'a4', 
                            orientation: 'portrait'
                        }
                    };

                    // إنشاء PDF
                    const element = document.createElement('div');
                    element.innerHTML = content;
                    document.body.appendChild(element);

                    html2pdf().set(opt).from(element).save().then(() => {
                        document.body.removeChild(element);
                    });
                },
                error: function(xhr, status, error) {
                    toastr.error('حدث خطأ أثناء تحميل التقارير');
                }
            });
        },
        error: function(xhr, status, error) {
            toastr.error('حدث خطأ أثناء تحميل بيانات المهمة');
        }
    });
};

// دالة تصدير جميع المهام
const exportAllTasks = () => {
    $.ajax({
        url: 'api/tasks.php',
        method: 'GET',
        success: function(response) {
            const tasks = response.tasks;
            
            // إنشاء محتوى PDF لجميع المهام
            const content = `
                <div class="pdf-container" dir="rtl" style="font-family: 'Tajawal', sans-serif; padding: 20px;">
                    <h1 style="text-align: center; color: #2563eb; margin-bottom: 30px;">تقرير جميع المهام</h1>
                    
                    ${tasks.map(task => `
                        <div class="task-section" style="margin-bottom: 30px;">
                            <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                                ${task.title}
                            </h2>
                            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
                                <p style="margin: 0; color: #4b5563;">${task.description}</p>
                                <p style="margin: 10px 0 0 0; color: #6b7280;">
                                    الحالة: ${task.status ? 'مكتملة' : 'قيد التنفيذ'}
                                </p>
                                <p style="margin: 5px 0 0 0; color: #6b7280;">
                                    تاريخ الإنشاء: ${formatDate(task.created_at)}
                                </p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            // إعدادات PDF
            const opt = {
                margin: 1,
                filename: 'جميع_المهام.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    logging: false
                },
                jsPDF: { 
                    unit: 'cm', 
                    format: 'a4', 
                    orientation: 'portrait'
                }
            };

            // إنشاء PDF
            const element = document.createElement('div');
            element.innerHTML = content;
            document.body.appendChild(element);

            html2pdf().set(opt).from(element).save().then(() => {
                document.body.removeChild(element);
            });
        },
        error: function(xhr, status, error) {
            toastr.error('حدث خطأ أثناء تحميل المهام');
        }
    });
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

    $('#exportAllPDF').click(function() {
        exportAllTasks();
    });
});