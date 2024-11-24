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
    height: 700
};

// تعريف الألوان أولاً لأنها تستخدم في الأنماط
const COLORS = {
    primary: '#0d6efd',
    primaryGradient: 'linear-gradient(135deg, #0d6efd 0%, #1a237e 100%)',
    secondaryGradient: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    success: '#198754',
    successLight: '#f0f8f1',
    warning: '#ffc107',
    danger: '#dc3545',
    secondary: '#6c757d',
    light: '#f8f9fa',
    dark: '#212529',
    border: '#e9ecef',
    borderDark: '#dee2e6'
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

    /* تحسين حاوية التقرير الرئيسية */
    .report-container {
        font-family: ${FONTS.primary};
        direction: rtl;
        padding: 40px;  /* زيادة الهوامش الداخلية */
        width: calc(100% - 80px);  /* تعديل العرض مع مراعاة الهوامش */
        max-width: 100%;
        margin: 0 auto;
        background: #fff;
        line-height: 1.6;
        border: 2px solid ${COLORS.borderDark};  /* حدود أكثر وضوحاً */
        border-radius: 12px;  /* زيادة انحناء الحواف */
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);  /* ظل أكثر نعومة */
    }

    /* تحسين رأس التقرير مع تدرج لوني مميز */
    .report-header {
        background: ${COLORS.primaryGradient};
        color: white;
        padding: 50px 40px;  /* زيادة التباعد */
        margin: -40px -40px 40px -40px;  /* تعديل الهوامش السالبة */
        border-radius: 12px 12px 0 0;
        position: relative;
        overflow: hidden;
        text-align: center;
    }

    /* إضافة نمط زخرفي للهيدر */
    .report-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,0.1)' fill-rule='evenodd'/%3E%3C/svg%3E");
        opacity: 0.1;
    }

    .report-header h1 {
        font-size: 42px;
        font-weight: ${FONTS.weights.bold};
        margin: 0 0 20px 0;
        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .report-header p {
        font-size: 20px;
        opacity: 0.9;
        margin: 0;
        font-weight: ${FONTS.weights.medium};
    }

    /* تحسين مظهر المهام الرئيسية */
    .task-item {
        background: white;
        margin-bottom: 40px;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        border: 1px solid ${COLORS.border};
        overflow: hidden;
    }

    /* هيدر المهمة */
    .task-header {
        padding: 25px 30px;
        background: ${COLORS.secondaryGradient};
        border-bottom: 1px solid ${COLORS.border};
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .task-header h3 {
        font-size: 26px;
        font-weight: ${FONTS.weights.semibold};
        margin: 0;
        color: ${COLORS.dark};
    }

    /* محتوى المهمة */
    .task-content {
        padding: 30px;
    }

    /* فوتر المهمة */
    .task-footer {
        padding: 20px 30px;
        background: ${COLORS.secondaryGradient};
        border-top: 1px solid ${COLORS.border};
    }

    /* تحسين قسم المهام الفرعية */
    .subtasks-section {
        margin: 30px 0;
        background: white;
        border-radius: 12px;
        border: 1px solid ${COLORS.border};
    }

    .subtasks-header {
        padding: 20px 25px;
        border-bottom: 1px solid ${COLORS.border};
        display: flex;
        align-items: center;
        gap: 12px;
        background: ${COLORS.light};
    }

    .subtasks-header i {
        color: ${COLORS.primary};
        font-size: 20px;
    }

    .subtasks-header h4 {
        margin: 0;
        font-size: 20px;
        font-weight: ${FONTS.weights.semibold};
        color: ${COLORS.dark};
    }

    /* تحسين قائمة المهام الفرعية */
    .subtasks-list {
        list-style: none;
        padding: 25px;
        margin: 0;
        display: grid;
        gap: 15px;
    }

    /* تحسين عنصر المهمة الفرعية */
    .subtask-item {
        display: flex;
        align-items: center;
        padding: 20px;
        background: ${COLORS.light};
        border-radius: 10px;
        border: 1px solid ${COLORS.border};
        position: relative;
        transition: all 0.3s ease;
    }

    .subtask-item.completed {
        background: ${COLORS.successLight};
        border-color: ${COLORS.success}30;
    }

    .subtask-item.completed::before {
        content: '✓';
        position: absolute;
        right: 20px;
        color: ${COLORS.success};
        font-weight: bold;
    }

    /* تحسين قسم التقارير */
    .reports-section {
        margin: 30px 0;
        background: white;
        border-radius: 12px;
        border: 1px solid ${COLORS.border};
    }

    .reports-header {
        padding: 20px 25px;
        border-bottom: 1px solid ${COLORS.border};
        display: flex;
        align-items: center;
        gap: 12px;
        background: ${COLORS.light};
    }

    .reports-header i {
        color: ${COLORS.primary};
        font-size: 20px;
    }

    .reports-header h4 {
        margin: 0;
        font-size: 20px;
        font-weight: ${FONTS.weights.semibold};
        color: ${COLORS.dark};
    }

    .reports-content {
        padding: 25px;
    }

    .report-item {
        background: ${COLORS.light};
        padding: 25px;
        margin-bottom: 20px;
        border-radius: 10px;
        border: 1px solid ${COLORS.border};
    }

    /* تحسين الفواصل */
    .section-divider {
        margin: 35px 0;
        border: none;
        height: 1px;
        background: ${COLORS.border};
        position: relative;
    }

    .section-divider::before {
        content: '';
        position: absolute;
        top: -1px;
        right: 0;
        width: 60px;
        height: 3px;
        background: ${COLORS.primary};
        border-radius: 3px;
    }

    /* تحسينات الطباعة */
    @media print {
        .report-container {
            width: ${PAGE_SIZE.width}mm;
            min-height: ${PAGE_SIZE.height}mm;
            padding: 20mm;
            margin: 0;
            border: none;
            box-shadow: none;
        }

        .task-item,
        .subtasks-section,
        .reports-section {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 10mm;
        }

        .report-header {
            margin: -20mm -20mm 10mm -20mm;
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