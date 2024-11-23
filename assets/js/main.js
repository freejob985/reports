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
    return $.ajax({
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

// دالة الحصول على تسمية الأولوية
const getPriorityLabel = (priority) => {
    const labels = {
        0: 'عادية',
        1: 'منخفضة',
        2: 'متوسطة',
        3: 'عالية'
    };
    return labels[priority] || 'غير محدد';
};

// دالة إنشاء بطاقة المهمة
const createTaskCard = (task) => {
        return `
        <div class="task-list-item bg-white rounded-lg shadow-sm p-4" data-task-id="${task.id}">
            <div class="flex flex-col">
                <!-- رأس المهمة -->
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-4">
                        <div class="handle cursor-move">
                            <i class="fas fa-grip-vertical text-gray-400"></i>
                        </div>
                        <input type="checkbox" class="task-checkbox" 
                               data-task-id="${task.id}" 
                               ${task.status ? 'checked' : ''}>
                        <h3 class="text-lg font-semibold ${task.status ? 'line-through text-gray-500' : ''}">${task.title}</h3>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="status-badge status-${task.status_type}">
                            ${task.status_type}
                        </span>
                        <span class="priority-badge priority-${task.priority}">
                            ${getPriorityLabel(task.priority)}
                        </span>
                        <div class="dropdown">
                            <button class="btn btn-link" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" onclick="editTask(${task.id})">
                                    <i class="fas fa-edit ml-2"></i>تعديل
                                </a></li>
                                <li><a class="dropdown-item" onclick="showStatusModal(${task.id})">
                                    <i class="fas fa-exchange-alt ml-2"></i>تغيير الحالة
                                </a></li>
                                <li><a class="dropdown-item" onclick="deleteTask(${task.id})">
                                    <i class="fas fa-trash ml-2"></i>حذف
                                </a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- وصف المهمة -->
                <p class="text-gray-600 mb-4">${task.description}</p>

                <!-- المهام الفرعية -->
                <div class="subtasks-container mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="text-sm font-semibold">المهام الفرعية</h4>
                        <button onclick="showSubtaskForm(${task.id})" class="text-sm text-blue-500">
                            <i class="fas fa-plus ml-1"></i>إضافة
                        </button>
                    </div>
                    <ul class="subtasks-list space-y-2" data-parent-id="${task.id}">
                        ${task.subtasks ? task.subtasks.map((subtask, index) => `
                            <li class="subtask-item bg-gray-50 p-3 rounded-lg flex items-center justify-between" 
                                data-subtask-id="${subtask.id}">
                                <div class="flex items-center space-x-3">
                                    <div class="handle cursor-move">
                                        <i class="fas fa-grip-vertical text-gray-400"></i>
                                    </div>
                                    <input type="checkbox" class="subtask-checkbox" 
                                           ${subtask.status ? 'checked' : ''}>
                                    <span class="${subtask.status ? 'line-through' : ''}">${subtask.title}</span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <button onclick="deleteSubtask(${subtask.id})" class="text-red-500">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        `).join('') : ''}
                    </ul>
                    <!-- نموذج إضافة مهمة فرعية -->
                    <form class="subtask-form mt-2" onsubmit="return false;">
                        <div class="flex items-center space-x-2">
                            <input type="text" class="form-control flex-grow" 
                                   placeholder="أدخل المهمة الفرعية هنا..."
                                   id="newSubtask_${task.id}">
                            <button onclick="addSubtask(${task.id})" class="btn btn-primary">
                                إضافة
                            </button>
                        </div>
                    </form>
                </div>

                <!-- التقارير -->
                <div class="reports-container">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="text-sm font-semibold">التقارير والملاحظات</h4>
                        <button onclick="showReportForm(${task.id})" class="text-sm text-blue-500">
                            <i class="fas fa-plus ml-1"></i>إضافة
                        </button>
                    </div>
                    <div class="reports-list space-y-3">
                        ${task.reports ? task.reports.map(report => `
                            <div class="report-item bg-gray-50 p-4 rounded-lg">
                                <div class="report-content prose max-w-none">
                                    ${report.content}
                                </div>
                                <div class="flex items-center justify-between mt-2 text-sm text-gray-500">
                                    <span>${formatDate(report.created_at)}</span>
                                    <div>
                                        <button onclick="editReport(${report.id})" class="text-blue-500 mr-2">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="deleteReport(${report.id})" class="text-red-500">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('') : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
};

// دالة إضافة مهمة فرعية
const showSubtaskForm = (taskId) => {
    Swal.fire({
        title: 'إضافة مهمة فرعية',
        html: `
            <input id="subtaskTitle" class="swal2-input" placeholder="عنوان المهمة الفرعية">
            <select id="subtaskPriority" class="swal2-select">
                <option value="0">أولوية عادية</option>
                <option value="1">أولوية منخفضة</option>
                <option value="2">أولوية متوسطة</option>
                <option value="3">أولوية عالية</option>
            </select>
        `,
        showCancelButton: true,
        confirmButtonText: 'إضافة',
        cancelButtonText: 'إلغاء',
        preConfirm: () => {
            return {
                title: document.getElementById('subtaskTitle').value,
                priority: document.getElementById('subtaskPriority').value,
                task_id: taskId
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            addSubtask(result.value);
        }
    });
};

// دالة إضافة مهمة فرعية للخادم
const addSubtask = (data) => {
    // التحقق من نوع البيانات المرسلة
    let taskId, title, priority;
    
    if (typeof data === 'object') {
        // إذا تم استدعاء الدالة من نموذج SweetAlert
        taskId = data.task_id;
        title = data.title;
        priority = data.priority || 0;
    } else {
        // إذا تم استدعاء الدالة من نموذج الإضافة السريعة
        taskId = data;
        title = $(`#newSubtask_${taskId}`).val().trim();
        priority = 0;
    }
    
    if (!title) {
        toastr.error('الرجاء إدخال عنوان المهمة الفرعية');
        return;
    }
    
    $.ajax({
        url: 'api/subtasks.php',
        method: 'POST',
        data: {
            task_id: taskId,
            title: title,
            priority: priority
        },
        success: function(response) {
            if (response.success) {
                if (typeof data !== 'object') {
                    $(`#newSubtask_${taskId}`).val(''); // تفريغ حقل الإدخال
                }
                toastr.success('تم إضافة المهمة الفرعية بنجاح');
                loadTasks();
            } else {
                toastr.error(response.message || 'حدث خطأ أثناء إضافة المهمة الفرعية');
            }
        },
        error: function() {
            toastr.error('حدث خطأ أثناء إضافة المهمة الفرعية');
        }
    });
};

// تهيئة السحب والإفلات
const initSortable = () => {
    document.querySelectorAll('.subtasks-list').forEach(list => {
        new Sortable(list, {
            handle: '.handle',
            animation: 150,
            onEnd: function(evt) {
                const subtaskId = evt.item.dataset.subtaskId;
                const newIndex = Array.from(evt.item.parentNode.children).indexOf(evt.item);
                updateSubtaskOrder(subtaskId, newIndex + 1); // +1 لأن الترتيب يبدأ من 1
            }
        });
    });
};

// تحديث ترتيب المهام الفرعية
const updateSubtaskOrder = (subtaskId, newIndex) => {
    $.ajax({
        url: 'api/subtasks.php',
        method: 'PATCH',
        data: JSON.stringify({
            id: subtaskId,
            order: newIndex
        }),
        contentType: 'application/json',
        success: function(response) {
            if (response.success) {
                toastr.success('تم تحديث الترتيب بنجاح');
            } else {
                toastr.error(response.message);
            }
        },
        error: function() {
            toastr.error('حدث خطأ أثناء تحديث الترتيب');
        }
    });
};

// دالة إنشاء بطاقة المهمة


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

// دالة تحيث حالة المهمة
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
                    <h1 style="text-align: center; color: #2563eb; margin-bottom: 30px;">تقرير جمي المهام</h1>
                    
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

// دالة عرض نموذج إضافة تقرير جديد
const showReportForm = (taskId) => {
    Swal.fire({
        title: 'إضافة تقرير جديد',
        html: `
            <div id="reportEditorWrapper">
                <textarea id="reportEditor"></textarea>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'إضافة',
        cancelButtonText: 'إلغاء',
        width: '800px',
        didOpen: () => {
            // تهيئة محرر TinyMCE
            tinymce.init({
                selector: '#reportEditor',
                directionality: 'rtl',
                language: 'ar',
                height: 300,
                plugins: 'lists link image table code',
                toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | table | code',
                setup: function(editor) {
                    editor.on('change', function() {
                        editor.save();
                    });
                }
            });
        },
        preConfirm: () => {
            const content = tinymce.get('reportEditor').getContent();
            if (!content) {
                Swal.showValidationMessage('الرجاء كتابة محتوى التقرير');
                return false;
            }
            
            return $.ajax({
                url: 'api/reports.php',
                method: 'POST',
                data: {
                    task_id: taskId,
                    content: content
                }
            });
        },
        willClose: () => {
            // إزالة المحرر عند إغلاق النافذة
            tinymce.remove('#reportEditor');
        }
    }).then((result) => {
        if (result.isConfirmed) {
            toastr.success('تم إضافة التقرير بنجاح');
            loadTasks();
        }
    });
};

// دالة تحرير تقرير موجود
const editReport = (reportId) => {
    // جلب بيانات التقرير أولاً
    $.ajax({
        url: `api/reports.php?id=${reportId}`,
        method: 'GET',
        success: function(response) {
            if (!response.success) {
                toastr.error('لم يتم العثور على التقرير');
                return;
            }

            const report = response.report;
            
            Swal.fire({
                title: 'تعديل التقرير',
                html: `
                    <div id="editReportWrapper">
                        <textarea id="editReportContent" class="swal2-textarea" style="display: none;">${report.content}</textarea>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'حفظ التعديلات',
                cancelButtonText: 'إلغاء',
                width: '800px',
                didOpen: () => {
                    // تهيئة محرر النصوص للتعديل
                    tinymce.init({
                        selector: '#editReportContent',
                        directionality: 'rtl',
                        language: 'ar',
                        plugins: 'lists link image table code',
                        toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | table | code',
                        height: 300,
                        menubar: false,
                        statusbar: false
                    });
                },
                preConfirm: () => {
                    const content = tinymce.get('editReportContent').getContent();
                    if (!content) {
                        Swal.showValidationMessage('الرجاء كتابة محتوى التقرير');
                        return false;
                    }

                    // تحديث التقرير
                    return $.ajax({
                        url: 'api/reports.php',
                        method: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            id: reportId,
                            content: content
                        })
                    }).then(response => {
                        if (response.success) {
                            return response;
                        }
                        throw new Error(response.message || 'حدث خطأ أثناء تحديث التقرير');
                    }).catch(error => {
                        Swal.showValidationMessage(error.message);
                        return false;
                    });
                },
                willClose: () => {
                    tinymce.remove('#editReportContent');
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    toastr.success('تم تحديث التقرير بنجاح');
                    loadTasks();
                }
            });
        },
        error: function() {
            toastr.error('حدث خطأ أثناء تحميل بيانات التقرير');
        }
    });
};

// دالة حذف تقرير
const deleteReport = (reportId) => {
    Swal.fire({
        title: 'تأكيد الحذف',
        text: 'هل أنت متأكد من حذف هذا التقرير؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `api/reports.php?id=${reportId}`,
                method: 'DELETE',
                success: function(response) {
                    if (response.success) {
                        toastr.success('تم حذف التقرير بنجاح');
                        loadTasks();
                    } else {
                        toastr.error(response.message);
                    }
                },
                error: function() {
                    toastr.error('حدث خطأ أثناء حذف التقرير');
                }
            });
        }
    });
};

// تهيئة الأحداث عند تحميل الصفحة
$(document).ready(function() {
    // تحميل المهام
    loadTasks().then(() => {
        initSortable();
    });

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