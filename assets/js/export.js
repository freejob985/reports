/**
 * وحدة تصدير التقارير إلى PDF باستخدام html2pdf.js
 * 
 * المتطلبات:
 * - html2pdf.js
 * - jQuery
 * - خطوط Cairo و Tajawal
 */

// تعريف الثوابت العامة
const PDF_MARGIN = 20;
const PAGE_SIZE = {
    width: 297,
    height: 420
};

// تعريف الألوان أولاً لأنها تستخدم في الأنماط
const COLORS = {
    primary: '#0d6efd',
    primaryGradient: 'linear-gradient(135deg, #0d6efd 0%, #1a237e 100%)',
    success: '#198754',
    warning: '#ffc107',
    danger: '#dc3545',
    secondary: '#6c757d',
    light: '#f8f9fa',
    dark: '#212529',
    border: '#e9ecef'
};

// تحديث تعريف الخطوط
const FONTS = {
    primary: "'Cairo', 'Tajawal', sans-serif",
    weights: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700
    }
};

// تعريف أنماط CSS للتقرير
const reportStyles = `
    /* استيراد الخطوط من Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap');

    .report-container {
        font-family: ${FONTS.primary};
        direction: rtl;
        padding: 20px;
        width: calc(100% - 40px);
        max-width: 100%;
        margin: 0 auto;
        background: #fff;
        line-height: 1.6;
        border: 1px solid ${COLORS.border};
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0,0,0,0.05);
    }

    /* تحسين رأس التقرير */
    .report-header {
        background: ${COLORS.primaryGradient};
        color: white;
        padding: 40px;
        text-align: center;
        margin: -20px -20px 30px -20px;
        border-radius: 8px 8px 0 0;
        position: relative;
        overflow: hidden;
    }

    .report-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="rgba(255,255,255,0.1)" x="0" y="0" width="100" height="100"/></svg>');
        opacity: 0.1;
    }

    .report-header h1 {
        font-size: 38px;
        font-weight: ${FONTS.weights.bold};
        margin: 0 0 15px 0;
        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .report-header p {
        font-size: 18px;
        opacity: 0.9;
        margin: 0;
    }

    /* تحسين مظهر المهام الرئيسية */
    .task-item {
        background: white;
        padding: 0;
        margin-bottom: 30px;
        border-radius: 15px;
        box-shadow: 0 3px 15px rgba(0,0,0,0.08);
        border: 1px solid ${COLORS.border};
        overflow: hidden;
    }

    .task-header {
        padding: 20px 30px;
        background: ${COLORS.light};
        border-bottom: 1px solid ${COLORS.border};
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .task-header h3 {
        font-size: 24px;
        font-weight: ${FONTS.weights.semibold};
        margin: 0;
        color: ${COLORS.dark};
    }

    .task-content {
        padding: 30px;
    }

    .task-footer {
        padding: 20px 30px;
        background: ${COLORS.light};
        border-top: 1px solid ${COLORS.border};
    }

    /* تحسين المهام الفرعية */
    .subtasks-section {
        margin: 25px 0;
        background: white;
        border-radius: 12px;
        border: 1px solid ${COLORS.border};
    }

    .subtasks-header {
        padding: 15px 25px;
        border-bottom: 1px solid ${COLORS.border};
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .subtasks-header i {
        color: ${COLORS.primary};
    }

    .subtasks-header h4 {
        margin: 0;
        font-size: 18px;
        font-weight: ${FONTS.weights.medium};
    }

    .subtasks-list {
        list-style: none;
        padding: 20px;
        margin: 0;
        display: grid;
        gap: 12px;
    }

    .subtask-item {
        display: flex;
        align-items: center;
        padding: 15px 60px 15px 20px;
        background: ${COLORS.light};
        border-radius: 8px;
        border: 1px solid ${COLORS.border};
        position: relative;
        transition: all 0.3s ease;
    }

    .subtask-item.completed {
        background: #f0f8f1;
        border-color: ${COLORS.success}20;
    }

    /* تحسين قسم التقارير */
    .reports-section {
        margin-top: 30px;
        background: white;
        border-radius: 12px;
        border: 1px solid ${COLORS.border};
    }

    .reports-header {
        padding: 15px 25px;
        border-bottom: 1px solid ${COLORS.border};
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .reports-header i {
        color: ${COLORS.primary};
    }

    .reports-header h4 {
        margin: 0;
        font-size: 18px;
        font-weight: ${FONTS.weights.medium};
    }

    .reports-content {
        padding: 20px;
    }

    .report-item {
        background: ${COLORS.light};
        padding: 20px;
        margin-bottom: 15px;
        border-radius: 8px;
        border: 1px solid ${COLORS.border};
    }

    /* تحسين الفواصل */
    .section-divider {
        margin: 30px 0;
        border: none;
        border-top: 1px solid ${COLORS.border};
        position: relative;
    }

    .section-divider::before {
        content: '';
        position: absolute;
        top: -1px;
        right: 0;
        width: 50px;
        border-top: 2px solid ${COLORS.primary};
    }

    /* إعدادات الطباعة */
    @media print {
        .report-container {
            width: ${PAGE_SIZE.width}mm;
            min-height: ${PAGE_SIZE.height}mm;
        }

        .task-item,
        .subtasks-section,
        .reports-section {
            break-inside: avoid;
            page-break-inside: avoid;
        }
    }
`;

// تحديث دالة getStatusText
function getStatusText(status) {
    const texts = {
        'pending': 'قيد الانتظار',
        'in-progress': 'قيد التنفيذ',
        'completed': 'مكتملة',
        'cancelled': 'ملغاة'
    };
    return texts[status] || status;
}

// تحديث دالة getStatusClass
function getStatusClass(status) {
    return `status-${status}`;
}

/**
 * تصدير تقرير المشروع إلى PDF
 * @param {number} projectId - معرف المشروع
 */
async function exportProjectReport(projectId = null) {
    if (!projectId) {
        toastr.error('معرف المشروع مطلوب');
        return;
    }

    const reportContainer = document.createElement('div');
    reportContainer.className = 'report-container';

    // إضافة الأنماط
    const styleElement = document.createElement('style');
    styleElement.textContent = reportStyles;
    reportContainer.appendChild(styleElement);

    document.body.appendChild(reportContainer);

    try {
        // جلب بيانات المشروع والمهام في نفس الوقت
        const [projectData, tasksData] = await Promise.all([
            $.ajax({
                url: `api/projects.php?id=${projectId}`,
                method: 'GET'
            }),
            $.ajax({
                url: `api/tasks.php?project_id=${projectId}`,
                method: 'GET',
                data: { limit: 1000 }
            })
        ]);

        if (!projectData.success || !tasksData.success) {
            throw new Error('فشل في جلب بيانات المشروع');
        }

        const project = projectData.project;
        const tasks = tasksData.tasks;

        // جلب المهام الفرعية والتقارير لكل مهمة
        const enrichedTasks = await Promise.all(tasks.map(async task => {
            const [subtasksData, reportsData] = await Promise.all([
                $.ajax({
                    url: `api/subtasks.php?task_id=${task.id}`,
                    method: 'GET',
                    data: { limit: 1000 }
                }),
                $.ajax({
                    url: `api/reports.php?task_id=${task.id}`,
                    method: 'GET',
                    data: { limit: 1000 }
                })
            ]);

            return {
                ...task,
                subtasks: subtasksData.success ? subtasksData.subtasks : [],
                reports: reportsData.success ? reportsData.reports : []
            };
        }));

        // تنسيق التاريخ بالعربية
        const today = new Intl.DateTimeFormat('ar', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        }).format(new Date());

        // بناء محتوى التقرير
        reportContainer.innerHTML = `
            <div class="report-header">
                <h1>${project.name}</h1>
                <p>${today}</p>
            </div>

            <div class="tasks-section">
                ${enrichedTasks.map(task => `
                    <div class="task-item ${task.status === 'completed' ? 'completed' : ''}">
                        <div class="task-header">
                            <h3>${task.title}</h3>
                            <div class="status-badge ${getStatusClass(task.status)}">
                                ${getStatusText(task.status)}
                            </div>
                        </div>

                        <div class="task-content">
                            ${task.description ? `
                                <div class="task-description">
                                    ${task.description}
                                </div>
                            ` : ''}
                            
                            <div class="task-meta">
                                <div class="task-meta-item">
                                    <i class="fas fa-calendar"></i>
                                    ${new Date(task.created_at).toLocaleDateString('ar')}
                                </div>
                                <div class="task-meta-item">
                                    <i class="fas fa-tasks"></i>
                                    المهام الفرعية: ${task.subtasks ? task.subtasks.length : 0}
                                </div>
                                <div class="task-meta-item">
                                    <i class="fas fa-clipboard"></i>
                                    التقارير: ${task.reports ? task.reports.length : 0}
                                </div>
                            </div>

                            <hr class="section-divider">

                            <!-- المهام الفرعية -->
                            ${task.subtasks && task.subtasks.length > 0 ? `
                                <div class="subtasks-section">
                                    <div class="subtasks-header">
                                        <i class="fas fa-tasks"></i>
                                        <h4>المهام الفرعية</h4>
                                    </div>
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
                                    <div class="reports-header">
                                        <i class="fas fa-clipboard"></i>
                                        <h4>التقارير</h4>
                                    </div>
                                    <div class="reports-content">
                                        ${task.reports.map(report => `
                                            <div class="report-item">
                                                <div class="report-date">
                                                    ${new Date(report.created_at).toLocaleDateString('ar')}
                                                </div>
                                                <div class="report-content">
                                                    ${report.content}
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // إعدادات تصدير PDF
        const exportOptions = {
            margin: PDF_MARGIN,
            filename: `${project.name}_report.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: false,
                width: PAGE_SIZE.width * 3.779528,
                height: PAGE_SIZE.height * 3.779528
            },
            jsPDF: { 
                unit: 'mm', 
                format: [PAGE_SIZE.width, PAGE_SIZE.height],
                orientation: 'portrait'
            }
        };

        // تصدير PDF
        await html2pdf().from(reportContainer).set(exportOptions).save();
        
        // تنظيف
        reportContainer.remove();
        toastr.success('تم تصدير التقرير بنجاح');

    } catch (error) {
        console.error('Error exporting report:', error);
        toastr.error('حدث خطأ أثناء تصدير التقرير');
        reportContainer.remove();
    }
}