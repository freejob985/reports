/**
 * إدارة التقارير
 * يتيح هذا الملف إضافة وعرض التقارير المرتبطة بالمهام
 */

// نستخدم IIFE لتجنب تداخل المتغيرات العامة
(function() {
    let currentReportTaskId = null;
    let editor = null;

    // تصدير الدوال للنطاق العام
    window.showReportsModal = function(taskId) {
        currentReportTaskId = taskId;
        if (editor) {
            editor.setContent('');
        }
        loadReports();
        $('#reportModal').modal('show');
    };

    window.addReport = function() {
        if (!editor) return;
        const content = editor.getContent();
        if (!content.trim()) {
            toastr.error('يرجى إدخال محتوى التقرير');
            return;
        }

        $.ajax({
            url: 'api/reports.php',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                task_id: currentReportTaskId,
                content: editor.getContent({ format: 'text' }),
                html_content: content
            }),
            success: function(response) {
                if (response.success) {
                    editor.setContent('');
                    loadReports();
                    loadTasks(); // تحديث القائمة الرئيسية
                    toastr.success('تم إضافة التقرير بنجاح');
                } else {
                    toastr.error(response.message || 'حدث خطأ أثناء إضافة التقرير');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error adding report:', error);
                toastr.error('حدث خطأ أثناء إضافة التقرير');
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
            plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount',
            toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
            content_style: 'body { font-family: "Tajawal", sans-serif; }',
            setup: function(ed) {
                editor = ed;
            }
        });
    }

    /**
     * تحميل التقارير للمهمة الحالية
     */
    function loadReports() {
        $.ajax({
            url: `api/reports.php?task_id=${currentReportTaskId}`,
            method: 'GET',
            success: function(response) {
                if (response.success) {
                    renderReports(response.reports);
                } else {
                    toastr.error(response.message || 'حدث خطأ أثناء تحميل التقارير');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error loading reports:', error);
                toastr.error('حدث خطأ أثناء تحميل التقارير');
            }
        });
    }

    /**
     * عرض التقارير في النموذج
     * @param {Array} reports - قائمة التقارير
     */
    function renderReports(reports) {
        const reportsList = $('#reportsList');
        reportsList.empty();

        if (reports.length === 0) {
            reportsList.append('<div class="alert alert-info">لا توجد تقارير</div>');
            return;
        }

        reports.forEach(report => {
            const reportDate = new Date(report.created_at).toLocaleString('ar-SA');
            const element = $(`
                <div class="card mb-3">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>تاريخ: ${reportDate}</span>
                        <button class="btn btn-sm btn-danger" onclick="deleteReport(${report.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="card-body">
                        ${report.html_content}
                    </div>
                </div>
            `);
            reportsList.append(element);
        });
    }

    /**
     * حذف تقرير
     * @param {number} reportId - معرف التقرير
     */
    function deleteReport(reportId) {
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
                            loadReports();
                            toastr.success('تم حذف التقرير بنجاح');
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
    }
})();