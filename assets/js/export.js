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

// تعريف أنماط CSS للتقرير
const reportStyles = `
    /* تنسيقات عامة للتقرير */
    .report-container {
        font-family: 'Cairo', 'Tajawal', sans-serif;
        direction: rtl;
        padding: 50px;
        max-width: 1200px;
        margin: 0 auto;
        background: #fff;
        line-height: 1.8;
    }

    /* تنسيق رأس التقرير */
    .report-header {
        background: linear-gradient(135deg, ${COLORS.primary} 0%, #1a237e 100%);
        color: white;
        padding: 50px 40px;
        text-align: center;
        border-radius: 20px;
        margin-bottom: 40px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .report-header h1 {
        font-family: 'Cairo', sans-serif;
        font-weight: 800;
        margin: 0 0 20px 0;
        font-size: 3rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    /* تنسيق معلومات المشروع */
    .project-info {
        background: ${COLORS.light};
        padding: 40px;
        border-radius: 20px;
        margin-bottom: 40px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .project-info h2 {
        color: ${COLORS.dark};
        font-weight: 700;
        margin-bottom: 25px;
        font-size: 2rem;
        border-right: 5px solid ${COLORS.primary};
        padding-right: 15px;
    }

    /* تنسيق المهام الرئيسية */
    .task-item {
        background: white;
        padding: 30px;
        border-radius: 15px;
        margin-bottom: 30px;
        box-shadow: 0 3px 15px rgba(0,0,0,0.05);
        border: 1px solid #eee;
        position: relative;
        overflow: hidden;
    }

    .task-item::before {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 5px;
        background: ${COLORS.primary};
    }

    .task-item.completed::before {
        background: ${COLORS.success};
    }

    .task-item.completed h3 {
        text-decoration: line-through;
        color: ${COLORS.success};
    }

    .task-item h3 {
        font-family: 'Cairo', sans-serif;
        font-weight: 700;
        font-size: 1.5rem;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #eee;
    }

    /* تنسيق المهام الفرعية */
    .subtasks-list {
        list-style: none;
        padding: 0;
        margin: 25px 0;
        border-right: 3px solid #eee;
        padding-right: 20px;
    }

    .subtask-item {
        padding: 15px 20px;
        margin-bottom: 15px;
        background: ${COLORS.light};
        border-radius: 10px;
        position: relative;
    }

    .subtask-item.completed {
        text-decoration: line-through;
        color: ${COLORS.success};
        background: #f8fff8;
    }

    .subtask-item.completed::before {
        content: '✓';
        position: absolute;
        right: -30px;
        color: ${COLORS.success};
        font-weight: bold;
    }

    /* تنسيق الملاحظات */
    .notes-section {
        background: #fff9e6;
        padding: 25px;
        border-radius: 15px;
        margin: 30px 0;
        border-right: 5px solid ${COLORS.warning};
    }

    .notes-section h4 {
        color: ${COLORS.warning};
        margin-bottom: 15px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .notes-section h4::before {
        content: '📝';
        font-size: 1.2em;
    }

    /* تنسيق شريط التقدم */
    .progress-container {
        background: ${COLORS.light};
        border-radius: 15px;
        padding: 5px;
        margin: 30px 0;
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.1);
    }

    .progress-bar {
        background: linear-gradient(135deg, ${COLORS.success} 0%, #4CAF50 100%);
        height: 25px;
        border-radius: 10px;
        transition: width 0.4s ease;
        text-align: center;
        color: white;
        font-weight: 600;
        line-height: 25px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    /* تنسيق الإحصائيات */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 25px;
        margin: 30px 0;
    }

    .stat-item {
        background: white;
        padding: 20px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .stat-item .value {
        font-size: 2rem;
        font-weight: 700;
        color: ${COLORS.primary};
        margin: 10px 0;
    }

    /* تنسيق التذييل */
    .report-footer {
        text-align: center;
        margin-top: 50px;
        padding-top: 30px;
        border-top: 2px solid ${COLORS.light};
        color: ${COLORS.secondary};
    }

    .report-footer p {
        margin: 8px 0;
        font-size: 0.9rem;
    }

    /* تنسيقات الطباعة */
    @media print {
        .report-container {
            padding: 20px;
        }

        .report-header {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .task-item, .subtask-item {
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .notes-section {
            break-before: page;
            page-break-before: always;
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

    // إضافة الأنماط
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
            const stats = await getProjectStats(projectId);
            const tasks = await getProjectTasks(projectId);

            // جلب المهام الفرعية والتقارير لكل مهمة
            for (let task of tasks) {
                // جلب المهام الفرعية
                const subtasksResponse = await $.ajax({
                    url: `api/subtasks.php?task_id=${task.id}`,
                    method: 'GET'
                });
                task.subtasks = subtasksResponse.success ? subtasksResponse.subtasks : [];

                // جلب التقارير
                const reportsResponse = await $.ajax({
                    url: `api/reports.php?task_id=${task.id}`,
                    method: 'GET'
                });
                task.reports = reportsResponse.success ? reportsResponse.reports : [];
            }

            const today = new Intl.DateTimeFormat('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(new Date());

            reportContainer.innerHTML += `
                <div class="report-header">
                    <h1>تقرير ${project.name}</h1>
                    <p>ليوم ${today}</p>
                </div>

                <div class="project-info">
                    <h2>وصف المشروع</h2>
                    <p>${project.description || 'لا يوجد وصف'}</p>
                </div>

                <div class="project-stats">
                    <h3>إحصائيات المشروع</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-label">إجمالي المهام</div>
                            <div class="stat-value">${stats.total}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">المهام المكتملة</div>
                            <div class="stat-value">${stats.completed}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">المهام قيد التنفيذ</div>
                            <div class="stat-value">${stats.in_progress}</div>
                        </div>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${stats.progress}%">
                            ${stats.progress}%
                        </div>
                    </div>
                </div>

                <div class="tasks-section">
                    <h2>المهام</h2>
                    ${tasks.map(task => `
                        <div class="task-item ${task.status === 'completed' ? 'completed' : ''}">
                            <h3>${task.title}</h3>
                            <p>${task.description || ''}</p>
                            <div class="status-badge" style="background: ${getStatusColor(task.status)}">
                                ${getStatusText(task.status)}
                            </div>

                            <!-- المهام الفرعية -->
                            ${task.subtasks && task.subtasks.length > 0 ? `
                                <div class="subtasks-section">
                                    <h4>المهام الفرعية</h4>
                                    <ul class="subtasks-list">
                                        ${task.subtasks.map(subtask => `
                                            <li class="subtask-item ${subtask.completed ? 'completed' : ''}">
                                                ${subtask.completed ? '✓' : '○'} ${subtask.title}
                                            </li>
                                        `).join('')}
                                    </ul>
                                    <div class="subtasks-progress">
                                        <div class="progress-label">تقدم المهام الفرعية:</div>
                                        <div class="progress-container">
                                            <div class="progress-bar" style="width: ${
                                                task.subtasks.length > 0 
                                                ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
                                                : 0
                                            }%">
                                                ${
                                                    task.subtasks.length > 0 
                                                    ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
                                                    : 0
                                                }%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ` : '<div class="no-subtasks">لا توجد مهام فرعية</div>'}

                            <!-- التقارير -->
                            ${task.reports && task.reports.length > 0 ? `
                                <div class="reports-section">
                                    <h4>التقارير</h4>
                                    <div class="reports-list">
                                        ${task.reports.map(report => `
                                            <div class="report-item">
                                                <div class="report-date">
                                                    ${new Date(report.created_at).toLocaleDateString('ar-SA')}
                                                </div>
                                                <div class="report-content">
                                                    ${report.content}
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : '<div class="no-reports">لا توجد تقارير</div>'}
                        </div>
                    `).join('')}
                </div>

                <div class="report-footer">
                    <p>تم إنشاء هذا التقرير بواسطة نظام إدارة المهام</p>
                    <p>${today}</p>
                </div>
            `;

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