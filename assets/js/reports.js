/**
 * إدارة التقارير
 * يتيح هذا الملف إضافة التقارير المرتبطة بالمهام
 */

// نستخدم IIFE لتجنب تداخل المتغيرات العامة
(function() {
    let currentReportTaskId = null;
    let editor = null;
    let currentReportId = null;

    // تصدير الدوال للنطاق العام
    window.showReportsModal = function(taskId) {
        currentReportTaskId = taskId;
        if (editor) {
            editor.setContent('');
        }
        $('#reportModal').modal('show');
    };

    window.addReport = function() {
        if (!editor) return;
        const content = editor.getContent();
        if (!content.trim()) {
            toastr.error('يرجى إدخال محتوى التقرير');
            return;
        }

        const method = currentReportId ? 'PUT' : 'POST';
        const url = currentReportId ?
            `api/reports.php?id=${currentReportId}` :
            'api/reports.php';

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify({
                task_id: currentReportTaskId,
                content: editor.getContent({ format: 'text' }),
                html_content: content
            }),
            success: function(response) {
                if (response.success) {
                    editor.setContent('');
                    $('#reportModal').modal('hide');
                    toastr.success(currentReportId ? 'تم تحديث التقرير بنجاح' : 'تم إضافة التقرير بنجاح');
                    loadTaskReports(currentReportTaskId);
                    currentReportId = null;
                } else {
                    toastr.error(response.message || 'حدث خطأ أثناء حفظ التقرير');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error saving report:', error);
                toastr.error('حدث خطأ أثناء حفظ التقرير');
            }
        });
    };

    // تهيئة محرر TinyMCE عند تحميل الصفحة
    $(document).ready(function() {
        initTinyMCE();
    });

    /**
     * تهيئة محرر TinyMCE
     */
    function initTinyMCE() {
        tinymce.init({
            selector: '#reportContent',
            directionality: 'rtl',
            language: 'ar',
            height: 300,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | formatselect | ' +
                'bold italic backcolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
            content_style: 'body { font-family: "Tajawal", sans-serif; }',
            setup: function(ed) {
                editor = ed;
            }
        });
    }

    /**
     * حذف تقرير
     * @param {number} reportId - معرف التقرير
     * @param {number} taskId - معرف المهمة
     */
    window.deleteReport = function(reportId, taskId) {
        Swal.fire({
            title: 'تأكيد الحذف',
            text: 'هل أنت متأكد من حذف هذا التقرير؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `api/reports.php?id=${reportId}`,
                    method: 'DELETE',
                    success: function(response) {
                        if (response.success) {
                            toastr.success('تم حذف التقرير بنجاح');
                            // تحديث عرض التقارير في الصفحة الرئيسية
                            loadTaskReports(taskId);
                        } else {
                            toastr.error(response.message || 'حدث خطأ أثناء حذف التقرير');
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Error deleting report:', error);
                        toastr.error('حدث خطأ أثناء حذف التقرير');
                    }
                });
            }
        });
    };

    // تصدير دالة تحميل التقارير للنطاق العام
    window.loadTaskReports = function(taskId) {
        $.ajax({
            url: `api/reports.php?task_id=${taskId}`,
            method: 'GET',
            success: function(response) {
                if (response.success) {
                    renderTaskReports(taskId, response.reports);
                } else {
                    console.error('Error loading reports:', response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error loading reports:', error);
            }
        });
    };

    // تحويل الفرق إلى الوحدة المناسبة
    function timeAgo(dateString) {
        const date = new Date(dateString.replace(' ', 'T')); // تحويل التاريخ إلى صيغة ISO
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        // تحويل الفرق إلى الوحدة المناسبة
        const intervals = {
            سنة: 31536000,
            شهر: 2592000,
            يوم: 86400,
            ساعة: 3600,
            دقيقة: 60,
            ثانية: 1
        };

        for (const [unit, seconds] of Object.entries(intervals)) {
            const interval = Math.floor(diffInSeconds / seconds);

            if (interval >= 1) {
                // معالجة صيغة الجمع
                if (unit === 'شهر' && interval >= 3 && interval <= 10) {
                    return `منذ ${interval} أشهر`;
                }
                return `منذ ${interval} ${unit}${interval > 2 ? 'ات' : ''}`;
            }
        }

        return 'الآن';
    }

    /**
     * تحديث عرض التقارير مع إضافة الشارات
     * @param {number} taskId - معرف المهمة
     * @param {Array} reports - مصفوفة التقارير
     */
    window.renderTaskReports = function(taskId, reports) {
        const reportsList = $(`#reports-list-${taskId}`);
        reportsList.empty();

        // تحديث عداد التقارير في بطاقة المهمة
        $(`#reports-count-${taskId}`).text(reports.length);

        reportsList.append(`
            <div class="reports-header mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <h6 class="mb-0 d-flex align-items-center">
                        <i class="fas fa-file-alt me-2"></i>
                        التقارير
                        <span class="badge bg-primary rounded-pill ms-2">${reports.length}</span>
                    </h6>
                    <button class="btn btn-sm btn-outline-primary" onclick="showReportModal(${taskId})">
                        <i class="fas fa-plus"></i>
                        <span class="badge bg-primary">تقرير جديد</span>
                    </button>
                </div>
            </div>
        `);

        if (!reports || reports.length === 0) {
            reportsList.append(`
                <div class="alert alert-info">
                    <span class="badge bg-info me-2">
                        <i class="fas fa-info-circle"></i>
                    </span>
                    لا توجد تقارير
                </div>
            `);
            return;
        }

        reports.forEach(report => {
            const timeAgoText = timeAgo(report.created_at);
            const reportDate = new Date(report.created_at.replace(' ', 'T')).toLocaleString('ar-SA');

            const reportElement = $(`
                <div class="card mb-2 report-card" data-report-id="${report.id}">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <span class="badge bg-info me-2" data-bs-toggle="tooltip" title="وقت النشر">
                                    <i class="fas fa-clock me-1"></i>
                                    ${timeAgoText}
                                </span>
                                <span class="badge bg-secondary" data-bs-toggle="tooltip" title="تاريخ النشر">
                                    <i class="fas fa-calendar-alt me-1"></i>
                                    ${reportDate}
                                </span>
                            </div>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-primary" 
                                        onclick="editReport(${report.id}, ${taskId})"
                                        data-bs-toggle="tooltip"
                                        title="تعديل التقرير">
                                    <i class="fas fa-edit"></i>
                                    <span class="badge bg-primary">تعديل</span>
                                </button>
                                <button class="btn btn-sm btn-outline-danger"
                                        onclick="deleteReport(${report.id}, ${taskId})"
                                        data-bs-toggle="tooltip"
                                        title="حذف التقرير">
                                    <i class="fas fa-trash"></i>
                                    <span class="badge bg-danger">حذف</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        ${report.html_content}
                        <div class="report-footer mt-3 pt-2 border-top">
                            <span class="badge bg-light text-dark">
                                <i class="fas fa-hashtag"></i>
                                تقرير ${report.id}
                            </span>
                        </div>
                    </div>
                </div>
            `);
            reportsList.append(reportElement);
        });

        // تفعيل tooltips
        $('[data-bs-toggle="tooltip"]').tooltip();
    };

    // إضافة CSS للتقارير
    $('<style>')
        .text(`
            .report-card {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .report-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .report-card .badge {
                transition: all 0.3s ease;
            }
            .report-card .badge:hover {
                transform: scale(1.1);
            }
            .reports-header .badge {
                font-size: 0.9rem;
                padding: 0.4em 0.8em;
            }
            .report-footer .badge {
                font-size: 0.85rem;
                padding: 0.5em 1em;
            }
        `)
        .appendTo('head');

    // إضافة دالة تعديل التقرير
    window.editReport = function(reportId, taskId) {
        $.ajax({
            url: `api/reports.php?id=${reportId}`,
            method: 'GET',
            success: function(response) {
                if (response.success && response.report) {
                    const report = response.report;
                    editor.setContent(report.html_content);
                    currentReportTaskId = taskId;
                    currentReportId = reportId;
                    $('#reportModal .modal-title').text('تعديل التقرير');
                    $('#reportModal').modal('show');
                }
            }
        });
    };
})();