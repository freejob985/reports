/**
 * وحدة تصدير التقارير إلى PDF باستخدام html2pdf.js
 * المكتبات المطلوبة:
 * - html2pdf.js: https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js
 */

// تعريف الثوابت العامة
const PDF_MARGIN = 20;
const COLORS = {
    primary: '#0d6efd',
    success: '#198754',
    warning: '#ffc107',
    danger: '#dc3545',
    secondary: '#6c757d',
    light: '#f8f9fa',
    dark: '#212529'
};

/**
 * تصدير تقرير المشروع إلى PDF
 * @param {number} projectId - معرف المشروع
 */
function exportProjectReport(projectId = null) {
    // إنشاء عنصر مؤقت لتخزين محتوى التقرير
    const reportContainer = document.createElement('div');
    reportContainer.className = 'report-container';
    document.body.appendChild(reportContainer);

    // جلب معلومات المشروع والمهام
    $.ajax({
        url: `api/projects.php?id=${projectId}`,
        method: 'GET',
        success: async function(response) {
            if (response.success) {
                const project = response.project;

                // استخدام التاريخ العربي
                const today = new Intl.DateTimeFormat('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }).format(new Date());

                // إنشاء هيكل التقرير
                reportContainer.innerHTML = `
                    <div class="report-header" style="background: ${COLORS.primary}; color: white; padding: 20px; text-align: center;">
                        <h1>تقرير ${project.name}</h1>
                        <p>ليوم ${today}</p>
                    </div>

                    <div class="report-content" style="padding: 20px;">
                        <div class="project-info" style="background: ${COLORS.light}; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                            <h2>وصف المشروع</h2>
                            <p>${project.description || 'لا يوجد وصف'}</p>
                        </div>

                        <div class="project-stats" id="projectStats">
                            <!-- سيتم إضافة الإحصائيات هنا -->
                        </div>

                        <div class="tasks-section">
                            <h2>المهام</h2>
                            <div id="tasksList">
                                <!-- سيتم إضافة المهام هنا -->
                            </div>
                        </div>
                    </div>
                `;

                // إضافة الإحصائيات
                const stats = await getProjectStats(projectId);
                document.getElementById('projectStats').innerHTML = `
                    <div style="background: ${COLORS.light}; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <h3>إحصائيات المشروع</h3>
                        <p>إجمالي المهام: ${stats.total}</p>
                        <p>المهام المكتملة: ${stats.completed}</p>
                        <p>المهام قيد التنفيذ: ${stats.in_progress}</p>
                        <div class="progress-bar" style="background: ${COLORS.success}; width: ${stats.progress}%; height: 20px; border-radius: 5px;">
                            ${stats.progress}%
                        </div>
                    </div>
                `;

                // إضافة المهام
                const tasks = await getProjectTasks(projectId);
                const tasksListElement = document.getElementById('tasksList');

                for (const task of tasks) {
                    const taskElement = document.createElement('div');
                    taskElement.className = 'task-item';
                    taskElement.style.cssText = `
                        background: white;
                        padding: 15px;
                        margin-bottom: 15px;
                        border-radius: 5px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    `;

                    taskElement.innerHTML = `
                        <h3>${task.title}</h3>
                        <p>${task.description || ''}</p>
                        <div class="status-badge" style="
                            background: ${getStatusColor(task.status)};
                            color: white;
                            padding: 5px 10px;
                            border-radius: 15px;
                            display: inline-block;
                        ">
                            ${getStatusText(task.status)}
                        </div>
                    `;

                    // إضافة المهام الفرعية
                    if (task.subtasks && task.subtasks.length > 0) {
                        const subtasksList = document.createElement('ul');
                        task.subtasks.forEach(subtask => {
                            subtasksList.innerHTML += `
                                <li style="
                                    ${subtask.completed ? 'text-decoration: line-through; color: #666;' : ''}
                                ">
                                    ${subtask.title}
                                </li>
                            `;
                        });
                        taskElement.appendChild(subtasksList);
                    }

                    tasksListElement.appendChild(taskElement);
                }

                // خيارات تصدير PDF
                const options = {
                    margin: 10,
                    filename: `تقرير_${project.name}_${today}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        logging: false
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'portrait'
                    }
                };

                // تصدير التقرير
                html2pdf().from(reportContainer).set(options).save()
                    .then(() => {
                        // إزالة العنصر المؤقت
                        reportContainer.remove();
                        toastr.success('تم تصدير التقرير بنجاح');
                    })
                    .catch(error => {
                        console.error('Error generating PDF:', error);
                        toastr.error('حدث خطأ أثناء تصدير التقرير');
                        reportContainer.remove();
                    });
            }
        },
        error: function(xhr, status, error) {
            console.error('Error exporting report:', error);
            toastr.error('حدث خطأ أثناء تصدير التقرير');
            reportContainer.remove();
        }
    });
}

/**
 * جلب إحصائيات المشروع
 * @param {number} projectId - معرف المشروع
 * @returns {Promise<Object>} إحصائيات المشروع
 */
async function getProjectStats(projectId) {
    const response = await $.ajax({
        url: `api/tasks.php?project_id=${projectId}&stats=true`,
        method: 'GET'
    });
    return response.stats;
}

/**
 * جلب مهام المشروع
 * @param {number} projectId - معرف المشروع
 * @returns {Promise<Array>} قائمة المهام
 */
async function getProjectTasks(projectId) {
    const response = await $.ajax({
        url: `api/tasks.php?project_id=${projectId}`,
        method: 'GET'
    });
    return response.tasks;
}

/**
 * الحصول على لون الحالة
 * @param {string} status - حالة المهمة
 * @returns {string} لون الحالة
 */
function getStatusColor(status) {
    const colors = {
        'pending': COLORS.warning,
        'in-progress': COLORS.primary,
        'completed': COLORS.success,
        'cancelled': COLORS.danger
    };
    return colors[status] || COLORS.secondary;
}

/**
 * الحصول على نص الحالة
 * @param {string} status - حالة المهمة
 * @returns {string} النص العربي للحالة
 */
function getStatusText(status) {
    const texts = {
        'pending': 'قيد الانتظار',
        'in-progress': 'قيد التنفيذ',
        'completed': 'مكتملة',
        'cancelled': 'ملغاة'
    };
    return texts[status] || status;
}