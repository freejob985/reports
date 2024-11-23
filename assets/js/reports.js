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

    // إضافة دالة حساب الوقت منذ كتابة التقرير
    function timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' سنة';

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' شهر';

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' يوم';

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' ساعة';

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' دقيقة';

        return Math.floor(seconds) + ' ثانية';
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
            const timeAgoText = timeAgo(report.created_at);
            const reportElement = $(`
                <div class="card mb-2 report-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <small class="text-muted">منذ ${timeAgoText}</small>
                            <small class="text-muted ms-2">${new Date(report.created_at).toLocaleString('ar-SA')}</small>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="editReport(${report.id}, ${taskId})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteReport(${report.id}, ${taskId})">
                                <i class="fas fa-trash"></i>
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
                $(`[data-report-id="${report.id}"] .time-ago`).text(`منذ ${timeAgoText}`);
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