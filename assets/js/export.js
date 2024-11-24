/**
 * وحدة تصدير التقارير إلى PDF باستخدام html2pdf.js
 */

// تعريف الثوابت العامة
const PDF_MARGIN = 5; // تقليل الهوامش
const COLORS = {
    primary: '#0d6efd',
    success: '#198754',
    warning: '#ffc107',
    danger: '#dc3545',
    secondary: '#6c757d',
    light: '#f8f9fa',
    dark: '#212529'
};

// تعريف أنماط CSS للتقرير
const reportStyles = `
    .report-container {
        font-family: 'Cairo', 'Tajawal', sans-serif;
        direction: rtl;
        padding: 0;
        width: 100%;
        max-width: 100%;
        margin: 0;
        background: #fff;
        line-height: 1.6;
    }

    /* رأس التقرير */
    .report-header {
        background: linear-gradient(135deg, ${COLORS.primary} 0%, #1a237e 100%);
        color: white;
        padding: 40px;
        text-align: center;
        margin-bottom: 40px;
    }

    .report-header h1 {
        font-size: 32px;
        font-weight: 700;
        margin: 0 0 15px 0;
    }

    /* قسم المهام */
    .tasks-section {
        padding: 0 40px;
        margin-bottom: 40px;
    }

    /* المهام الرئيسية */
    .task-item {
        background: white;
        padding: 30px;
        margin-bottom: 30px;
        border-radius: 15px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        position: relative;
        overflow: hidden;
    }

    .task-item::before {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 6px;
        background: ${COLORS.primary};
    }

    .task-item.completed::before {
        background: ${COLORS.success};
    }

    .task-item h3 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #eee;
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .task-item.completed h3::after {
        content: '✓';
        display: inline-block;
        width: 30px;
        height: 30px;
        background: ${COLORS.success};
        color: white;
        border-radius: 50%;
        text-align: center;
        line-height: 30px;
        font-size: 18px;
        margin-right: auto;
    }

    /* المهام الفرعية */
    .subtasks-section {
        margin: 25px 0;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 10px;
    }

    .subtasks-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 15px;
    }

    .subtask-item {
        display: flex;
        align-items: center;
        padding: 15px 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        position: relative;
        padding-right: 50px;
    }

    .subtask-item::before {
        content: '×';
        position: absolute;
        right: 15px;
        width: 24px;
        height: 24px;
        background: ${COLORS.danger};
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: bold;
    }

    .subtask-item.completed::before {
        content: '✓';
        background: ${COLORS.success};
    }

    .subtask-item.completed {
        background: #f0f8f1;
        color: ${COLORS.success};
        text-decoration: line-through;
    }

    /* التقارير */
    .reports-section {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 2px solid #eee;
    }

    .report-item {
        background: #f8f9fa;
        padding: 20px;
        margin-bottom: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }

    .report-date {
        color: ${COLORS.secondary};
        font-size: 14px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .report-content {
        font-size: 16px;
        line-height: 1.8;
        color: #333;
    }

    /* شارات الحالة */
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 20px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        color: white;
        margin: 10px 0;
    }

    /* تنسيقات الطباعة */
    @media print {
        .report-container {
            padding: 0;
        }

        .task-item {
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .subtasks-section {
            break-inside: avoid;
            page-break-inside: avoid;
        }
    }
`;

/**
 * تصدير تقرير المشروع إلى PDF
 * @param {number} projectId - معرف المشروع
 */
async function exportProjectReport(projectId = null) {
    const reportContainer = document.createElement('div');
    reportContainer.className = 'report-container';

    const styleElement = document.createElement('style');
    styleElement.textContent = reportStyles;
    reportContainer.appendChild(styleElement);

    document.body.appendChild(reportContainer);

    try {
        const response = await $.ajax({
            url: `api/projects.php?id=${projectId}`,
            method: 'GET'
        });

        if (response.success) {
            const project = response.project;
            const tasks = await getProjectTasks(projectId);

            // جلب المهام الفرعية والتقارير لكل مهمة
            for (let task of tasks) {
                const subtasksResponse = await $.ajax({
                    url: `api/subtasks.php?task_id=${task.id}`,
                    method: 'GET'
                });
                task.subtasks = subtasksResponse.success ? subtasksResponse.subtasks : [];

                const reportsResponse = await $.ajax({
                    url: `api/reports.php?task_id=${task.id}`,
                    method: 'GET'
                });
                task.reports = reportsResponse.success ? reportsResponse.reports : [];
            }

            const today = new Intl.DateTimeFormat('ar', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            }).format(new Date());

            reportContainer.innerHTML += `
                <div class="report-header">
                    <h1>تقرير ${project.name}</h1>
                    <p>${today}</p>
                </div>

                <div class="tasks-section">
                    ${tasks.map(task => `
                        <div class="task-item ${task.status === 'completed' ? 'completed' : ''}">
                            <h3>${task.title}</h3>
                            <div class="status-badge" style="background: ${getStatusColor(task.status)}">
                                ${getStatusText(task.status)}
                            </div>

                            <!-- المهام الفرعية -->
                            ${task.subtasks && task.subtasks.length > 0 ? `
                                <div class="subtasks-section">
                                    <ul class="subtasks-list">
                                        ${task.subtasks.map(subtask => `
                                            <li class="subtask-item ${subtask.completed ? 'completed' : ''}">
                                                ${subtask.title}
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}

                            <!-- التقارير -->
                            ${task.reports && task.reports.length > 0 ? `
                                <div class="reports-section">
                                    ${task.reports.map(report => `
                                        <div class="report-item">
                                            <div class="report-date">
                                                ${new Date(report.created_at).toLocaleDateString('ar', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div class="report-content">
                                                ${report.content}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `;

            const options = {
                margin: 0,
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

            await html2pdf().from(reportContainer).set(options).save();
            reportContainer.remove();
            toastr.success('تم تصدير التقرير بنجاح');
        }
    } catch (error) {
        console.error('Error exporting report:', error);
        toastr.error('حدث خطأ أثناء تصدير التقرير');
        reportContainer.remove();
    }
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