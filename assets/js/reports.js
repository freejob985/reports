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
                return `منذ ${interval} ${unit}${interval > 2 ? '' : ''}`;
            }
        }

        return 'الآن';
    }

    // تعديل دالة renderTaskReports
    window.renderTaskReports = function(taskId, reports) {
        const reportsList = $(`#reports-list-${taskId}`);
        reportsList.empty();

        if (!reports || reports.length === 0) {
            reportsList.append('<div class="text-muted">لا توجد تقارير</div>');
            return;
        }

        reports.forEach(report => {
            const createdDate = new Date(report.created_at.replace(' ', 'T'));
            const timeAgoText = timeAgo(report.created_at);

            // تنسيق التاريخ بالعربية
            const formattedDate = new Intl.DateTimeFormat('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            }).format(createdDate);

            const reportElement = $(`
                <div class="card mb-2 report-card" data-report-id="${report.id}">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div class="report-dates">
                            <span class="date-badge created">
                                <i class="fas fa-calendar-plus"></i>
                                تاريخ الإنشاء: ${formattedDate}
                            </span>
                            <span class="date-badge">
                                <i class="fas fa-clock"></i>
                                ${timeAgoText}
                            </span>
                        </div>
                        <div class="report-actions">
                            <button class="task-action-btn" onclick="editReport(${report.id}, ${taskId})">
                                <i class="fas fa-edit"></i> تعديل
                            </button>
                            <button class="task-action-btn danger" onclick="deleteReport(${report.id}, ${taskId})">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        ${report.html_content}
                    </div>
                </div>
            `);
            reportsList.append(reportElement);
        });

        // تحديث الوقت كل دقيقة
        setInterval(() => {
            reports.forEach(report => {
                const timeAgoText = timeAgo(report.created_at);
                $(`.report-card[data-report-id="${report.id}"] .time-ago`).text(timeAgoText);
            });
        }, 60000);
    };

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