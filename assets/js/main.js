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