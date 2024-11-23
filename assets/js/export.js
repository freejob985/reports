/**
 * وحدة تصدير التقارير إلى PDF
 * تعتمد على مكتبات:
 * - jsPDF: لإنشاء ملفات PDF
 * - html2canvas: لتحويل HTML إلى صور
 */

// تعريف الثوابت العامة
const PDF_MARGIN = 20; // الهامش
const PDF_FONT = 'helvetica'; // الخط المستخدم

/**
 * تصدير تقرير المشروع إلى PDF
 * @param {number} projectId - معرف المشروع
 */
function exportProjectReport(projectId = null) {
    // تهيئة jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // الهوامش
    let yPos = PDF_MARGIN;

    // تنسيق العربية
    doc.setFont(PDF_FONT, "normal");
    doc.setR2L(true);

    // جلب معلومات المشروع والمهام
    $.ajax({
        url: `api/projects.php?id=${projectId}`,
        method: 'GET',
        success: async function(response) {
            if (response.success) {
                const project = response.project;
                const today = new Date().toLocaleDateString('ar-SA');

                // عنوان التقرير
                doc.setFontSize(24);
                doc.text(`تقرير ${project.name} ليوم ${today}`, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
                yPos += 15;

                // معلومات المشروع
                doc.setFontSize(16);
                doc.text(`وصف المشروع:`, PDF_MARGIN, yPos);
                yPos += 10;

                doc.setFontSize(12);
                const description = project.description || 'لا يوجد وصف';
                const descriptionLines = doc.splitTextToSize(description, doc.internal.pageSize.width - 2 * PDF_MARGIN);
                doc.text(descriptionLines, PDF_MARGIN, yPos);
                yPos += descriptionLines.length * 7 + 10;

                // إحصائيات المشروع
                await addProjectStats(doc, projectId, yPos);
                yPos += 40;

                // المهام
                const tasksResponse = await $.ajax({
                    url: `api/tasks.php?project_id=${projectId}&stats=true`,
                    method: 'GET'
                });

                if (tasksResponse.success) {
                    doc.setFontSize(16);
                    doc.text('المهام:', PDF_MARGIN, yPos);
                    yPos += 10;

                    for (const task of tasksResponse.tasks) {
                        // التحقق من الحاجة لصفحة جديدة
                        if (yPos > doc.internal.pageSize.height - 30) {
                            doc.addPage();
                            yPos = PDF_MARGIN;
                        }

                        await addTaskToReport(doc, task, yPos);
                        yPos += 30;

                        // المهام الفرعية
                        const subtasksResponse = await $.ajax({
                            url: `api/subtasks.php?task_id=${task.id}`,
                            method: 'GET'
                        });

                        if (subtasksResponse.success && subtasksResponse.subtasks.length > 0) {
                            doc.setFontSize(12);
                            doc.text('المهام الفرعية:', PDF_MARGIN + 5, yPos);
                            yPos += 7;

                            for (const subtask of subtasksResponse.subtasks) {
                                if (yPos > doc.internal.pageSize.height - 20) {
                                    doc.addPage();
                                    yPos = PDF_MARGIN;
                                }
                                await addSubtaskToReport(doc, subtask, yPos);
                                yPos += 7;
                            }
                            yPos += 5;
                        }

                        // التقارير
                        const reportsResponse = await $.ajax({
                            url: `api/reports.php?task_id=${task.id}`,
                            method: 'GET'
                        });

                        if (reportsResponse.success && reportsResponse.reports.length > 0) {
                            doc.setFontSize(12);
                            doc.text('التقارير:', PDF_MARGIN + 5, yPos);
                            yPos += 7;

                            for (const report of reportsResponse.reports) {
                                if (yPos > doc.internal.pageSize.height - 20) {
                                    doc.addPage();
                                    yPos = PDF_MARGIN;
                                }
                                await addReportToReport(doc, report, yPos);
                                yPos += 10;
                            }
                            yPos += 5;
                        }
                    }
                }

                // حفظ الملف
                const fileName = `تقرير_${project.name}_${today}.pdf`;
                doc.save(fileName);
                toastr.success('تم تصدير التقرير بنجاح');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error exporting report:', error);
            toastr.error('حدث خطأ أثناء تصدير التقرير');
        }
    });
}

/**
 * إضافة إحصائيات المشروع إلى التقرير
 */
async function addProjectStats(doc, projectId, yPos) {
    const response = await $.ajax({
        url: `api/tasks.php?project_id=${projectId}&stats=true`,
        method: 'GET'
    });

    if (response.success) {
        const stats = response.stats;
        doc.setFontSize(14);
        doc.text(`إجمالي المهام: ${stats.total}`, PDF_MARGIN, yPos);
        doc.text(`المهام المكتملة: ${stats.completed}`, PDF_MARGIN, yPos + 10);
        doc.text(`المهام قيد التنفيذ: ${stats.in_progress}`, PDF_MARGIN, yPos + 20);

        // رسم شريط التقدم
        const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        drawProgressBar(doc, PDF_MARGIN, yPos + 30, doc.internal.pageSize.width - 2 * PDF_MARGIN, 5, progress);
    }
}

/**
 * إضافة مهمة إلى التقرير
 * @param {jsPDF} doc - مستند PDF
 * @param {Object} task - بيانات المهمة
 * @param {number} yPos - الموضع العمودي
 */
async function addTaskToReport(doc, task, yPos) {
    doc.setFontSize(14);
    doc.text(`${task.title}`, PDF_MARGIN, yPos);

    doc.setFontSize(12);
    doc.text(`الحالة: ${getStatusText(task.status)}`, PDF_MARGIN + 5, yPos + 7);

    if (task.description) {
        const descriptionLines = doc.splitTextToSize(task.description, doc.internal.pageSize.width - 2 * PDF_MARGIN - 10);
        doc.text(descriptionLines, PDF_MARGIN + 5, yPos + 14);
    }
}

/**
 * إضافة مهمة فرعية إلى التقرير
 * @param {jsPDF} doc - مستند PDF
 * @param {Object} subtask - بيانات المهمة الفرعية
 * @param {number} yPos - الموضع العمودي
 */
async function addSubtaskToReport(doc, subtask, yPos) {
    doc.setFontSize(10);
    const status = subtask.completed ? '✓' : '○';
    doc.text(`${status} ${subtask.title}`, PDF_MARGIN + 10, yPos);
}

/**
 * إضافة تقرير إلى المستند
 * @param {jsPDF} doc - مستند PDF
 * @param {Object} report - بيانات التقرير
 * @param {number} yPos - الموضع العمودي
 */
async function addReportToReport(doc, report, yPos) {
    doc.setFontSize(10);
    const reportLines = doc.splitTextToSize(report.content, doc.internal.pageSize.width - 2 * PDF_MARGIN - 15);
    doc.text(reportLines, PDF_MARGIN + 10, yPos);
}

/**
 * رسم شريط التقدم
 * @param {jsPDF} doc - مستند PDF
 * @param {number} x - الموضع الأفقي
 * @param {number} y - الموضع العمودي
 * @param {number} width - العرض
 * @param {number} height - الارتفاع
 * @param {number} progress - نسبة التقدم
 */
function drawProgressBar(doc, x, y, width, height, progress) {
    // الإطار الخارجي
    doc.setDrawColor(200, 200, 200);
    doc.rect(x, y, width, height);

    // شريط التقدم
    const progressWidth = (width * progress) / 100;
    doc.setFillColor(0, 123, 255);
    doc.rect(x, y, progressWidth, height, 'F');

    // النسبة المئوية
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`${progress}%`, x + width / 2, y + height + 5, { align: 'center' });
}