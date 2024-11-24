/**
 * وحدة تصدير التقارير إلى PDF باستخدام html2pdf.js
 */

// تعريف الثوابت العامة
const PDF_MARGIN = 0; // إزالة الهوامش تماماً
const PAGE_SIZE = {
    width: 297, // عرض A4 بالمليمتر
    height: 420 // ارتفاع A4 بالمليمتر
};
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
        font-family: 'Noto Sans Arabic', 'Cairo', 'Tajawal', sans-serif;
        direction: rtl;
        padding: 0;
        width: 100%;
        max-width: 100%;
        margin: 0;
        background: #fff;
        line-height: 1.6;
    }

    /* تحسين رأس التقرير */
    .report-header {
        background: linear-gradient(135deg, ${COLORS.primary} 0%, #1a237e 100%);
        color: white;
        padding: 20px 40px; /* تقليل التباعد العلوي */
        text-align: center;
        margin-bottom: 20px;
    }

    .report-header h1 {
        font-size: 38px; /* تكبير حجم العنوان */
        font-weight: 700;
        margin: 0 0 10px 0;
        letter-spacing: 1px;
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

    /* تحسين تنسيق المهام الفرعية */
    .subtasks-section {
        margin: 15px 0;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
        padding: 12px 50px 12px 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        position: relative;
        margin-bottom: 10px;
        transition: all 0.3s ease;
    }

    /* تحسين أيقونات الحالة */
    .subtask-item::before {
        content: '×';
        position: absolute;
        right: 12px;
        width: 26px;
        height: 26px;
        background: ${COLORS.danger};
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
        transition: all 0.3s ease;
    }

    .subtask-item.completed::before {
        content: '✓';
        background: ${COLORS.success};
        font-size: 16px;
    }

    .subtask-item.completed {
        background: #f0f8f1;
        color: ${COLORS.success};
        text-decoration: line-through;
    }

    /* تحسين مظهر التقارير */
    .reports-section {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 2px solid #eee;
    }

    .report-item {
        background: white;
        padding: 20px;
        margin-bottom: 15px;
        border-radius: 12px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.08);
        border: 1px solid #eee;
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

    /* تحسين شارات الحالة */
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 20px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        color: white;
        margin: 10px 0;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    /* إعدادات الطباعة المحسنة */
    @media print {
        .report-container {
            width: ${PAGE_SIZE.width}mm;
            min-height: ${PAGE_SIZE.height}mm;
            padding: 0;
            margin: 0;
        }

        .task-item {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 20px;
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

            const exportOptions = {
                margin: PDF_MARGIN,
                filename: 'project_report.pdf',
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    width: PAGE_SIZE.width * 3.779528, // تحويل من مم إلى بكسل
                    height: PAGE_SIZE.height * 3.779528
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: [PAGE_SIZE.width, PAGE_SIZE.height],
                    orientation: 'portrait'
                }
            };

            await html2pdf().from(reportContainer).set(exportOptions).save();
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