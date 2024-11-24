/**
 * وحدة تصدير التقارير
 * تتيح تصدير المهام والتقارير بتنسيق PDF
 */

const ExportManager = {
        /**
         * تهيئة خيارات التصدير
         * يتم استخدام القيمة المخزنة في localStorage أو القيمة الافتراضية 1500
         */
        config: {
            margin: 0,
            filename: 'تقرير-المهام.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false
            },
            jsPDF: {
                unit: 'mm',
                format: [297, null], // سيتم تحديث الطول ديناميكياً
                orientation: 'portrait'
            }
        },

        /**
         * تهيئة المدير عند تحميل الصفحة
         */
        init() {
            // إضافة مستمع لحدث تغيير طول الصفحة
            document.getElementById('pdfHeight').addEventListener('change', this.updatePageHeight.bind(this));

            // تحميل القيمة المخزنة أو استخدام القيمة الافتراضية
            const savedHeight = localStorage.getItem('pdfPageHeight') || '1500';
            document.getElementById('pdfHeight').value = savedHeight;
            this.config.jsPDF.format[1] = parseInt(savedHeight);
        },

        /**
         * تحديث ارتفاع الصفحة وحفظه
         * @param {Event} event حدث تغيير القيمة
         */
        updatePageHeight(event) {
            const height = parseInt(event.target.value);
            if (height > 0) {
                this.config.jsPDF.format[1] = height;
                localStorage.setItem('pdfPageHeight', height.toString());
                toastr.success('تم تحديث ارتفاع الصفحة بنجاح');
            } else {
                toastr.error('يرجى إدخال قيمة صحيحة للارتفاع');
            }
        },

        /**
         * تصدير تقرير مشروع
         * @param {number} projectId معرف المشروع
         */
        async exportProjectReport(projectId) {
            try {
                if (!projectId) {
                    toastr.error('الرجاء اختيار مشروع أولاً');
                    return;
                }

                if (typeof html2pdf === 'undefined') {
                    toastr.error('لم يتم تحميل مكتبة html2pdf');
                    return;
                }

                // إظهار مؤشر التحميل
                Swal.fire({
                    title: 'جاري تجهيز التقرير...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                // إنشاء عنصر الطباعة
                const printElement = document.createElement('div');
                printElement.className = 'print-container';
                document.body.appendChild(printElement);

                // جلب بيانات المشروع
                const projectData = await this.getProjectData(projectId);

                // إنشاء محتوى التقرير
                const content = this.generateReportContent(projectData);
                printElement.innerHTML = content;

                // تطبيق أنماط الطباعة
                this.applyPrintStyles(printElement);

                // تصدير PDF
                const pdfOptions = {
                    ...this.config,
                    filename: `تقرير-مشروع-${projectData.project.name}.pdf`
                };

                await html2pdf()
                    .set(pdfOptions)
                    .from(printElement)
                    .save();

                // تنظيف
                document.body.removeChild(printElement);

                // إظلاق مؤشر التحميل
                Swal.close();

                // إظهار رسالة نجاح
                toastr.success('تم تصدير التقرير بنجاح');

            } catch (error) {
                console.error('خطأ في تصدير التقرير:', error);
                Swal.close();
                toastr.error('حدث خطأ أثناء تصدير التقرير');
            }
        },

        /**
         * جلب بيانات المشروع والمهام
         * @param {number} projectId معرف المشروع
         * @returns {Promise<Object>} بيانات المشروع
         */
        async getProjectData(projectId) {
            try {
                // جلب بيانات المشروع
                const projectResponse = await fetch(`api/projects.php?id=${projectId}`);
                const projectData = await projectResponse.json();
                if (!projectData.success) throw new Error('فشل في جلب بيانات المشروع');

                // جلب المهام
                const tasksResponse = await fetch(`api/tasks.php?project_id=${projectId}`);
                const tasksData = await tasksResponse.json();
                if (!tasksData.success) throw new Error('فشل في جلب المهام');

                // جلب المهام الفرعية والتقارير لكل مهمة
                const tasks = await Promise.all(tasksData.tasks.map(async task => {
                    // جلب المهام الفرعية
                    const subtasksResponse = await fetch(`api/subtasks.php?task_id=${task.id}`);
                    const subtasksData = await subtasksResponse.json();

                    // جلب التقارير
                    const reportsResponse = await fetch(`api/reports.php?task_id=${task.id}`);
                    const reportsData = await reportsResponse.json();

                    return {
                        ...task,
                        subtasks: subtasksData.success ? subtasksData.subtasks : [],
                        reports: reportsData.success ? reportsData.reports : []
                    };
                }));

                return {
                    project: projectData.project,
                    tasks: tasks
                };

            } catch (error) {
                console.error('خطأ في جلب البيانات:', error);
                throw new Error('فشل في جلب البيانات الكاملة للمشروع');
            }
        },

        /**
         * إنشاء محتوى التقرير
         * @param {Object} data بيانات المشروع والمهام
         * @returns {string} HTML محتوى التقرير
         */
        generateReportContent(data) {
            const { project, tasks } = data;

            return `
                <div class="report-header">
                    <h1>${project.name}</h1>
                    <div class="report-meta">
                        <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
                        <p>عدد المهام: ${tasks.length}</p>
                    </div>
                </div>

                <div class="report-body">
                    ${project.description ? `
                        <div class="project-details">
                            <h2>تفاصيل المشروع</h2>
                            <p>${project.description}</p>
                        </div>
                    ` : ''}

                    <div class="tasks-section">
                        <h2>المهام</h2>
                        ${this.generateTasksContent(tasks)}
                    </div>

                    <div class="report-summary">
                        <h2>ملخص التقدم</h2>
                        ${this.generateProgressSummary(tasks)}
                    </div>
                </div>
            `;
        },

        /**
         * إنشاء محتوى المهام
         * @param {Array} tasks قائمة لمهام
         * @returns {string} HTML محتوى المهام
         */
        generateTasksContent(tasks) {
            if (!Array.isArray(tasks)) return '<p>لا توجد مهام</p>';

            return tasks.map(task => {
                // تحديد الأيقونة واللون حسب حالة المهمة
                const statusConfig = {
                    'completed': {
                        icon: 'fa-check-circle',
                        color: '#4CAF50',
                        text: 'مكتملة'
                    },
                    'in-progress': {
                        icon: 'fa-clock',
                        color: '#2196F3',
                        text: 'قيد التنفيذ'
                    },
                    'pending': {
                        icon: 'fa-hourglass',
                        color: '#FFC107',
                        text: 'قيد الانتظار'
                    }
                };

                const status = statusConfig[task.status] || statusConfig.pending;

                return `
                    <div class="task-card" style="border-left: 4px solid ${status.color}; margin-bottom: 20px; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h3 class="task-title">
                            <i class="fas fa-tasks"></i>
                            ${task.title}
                            <span class="task-status" style="float: left; color: ${status.color};">
                                <i class="fas ${status.icon}"></i>
                                ${status.text}
                            </span>
                        </h3>
                        <p class="task-description">${task.description || 'لا يوجد وصف'}</p>
                        
                        <div class="task-meta" style="color: #666; font-size: 0.9rem; margin: 10px 0;">
                            <i class="fas fa-calendar-alt"></i>
                            ${new Date(task.created_at).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                        
                        <div class="subtasks-section">
                            <h4>
                                <i class="fas fa-list-ul"></i>
                                المهام الفرعية
                            </h4>
                            <ul class="subtasks-list">
                                ${(task.subtasks || []).map(subtask => `
                                    <li class="subtask-item ${subtask.completed ? 'completed' : ''}" 
                                        style="padding: 8px; border-bottom: 1px solid #eee;">
                                        <i class="fas ${subtask.completed ? 'fa-check-circle text-success' : 'fa-circle text-muted'}"></i>
                                        <span class="subtask-title">${subtask.title}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <div class="reports-section">
                            <h4>
                                <i class="fas fa-file-alt"></i>
                                التقارير
                            </h4>
                            ${(task.reports || []).map(report => `
                                <div class="report-item" style="border: 1px solid #eee; padding: 15px; margin: 10px 0; border-radius: 8px;">
                                    <div class="report-content">
                                        ${report.html_content}
                                    </div>
                                    <div class="report-meta" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
                                        <i class="fas fa-calendar-alt"></i>
                                        ${new Date(report.created_at).toLocaleDateString('ar-EG', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'long'
                                        })}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        },

        /**
         * إنشاء محتوى المهام الفرعية
         * @param {Object} task المهمة الرئيسية
         * @returns {string} HTML محتوى المهام الفرعية
         */
        async generateSubtasksContent(task) {
            const response = await fetch(`api/subtasks.php?task_id=${task.id}`);
            const data = await response.json();

            if (!data.subtasks || data.subtasks.length === 0) {
                return '<p class="no-subtasks">لا توجد مهام فرعية</p>';
            }

            return `
            <div class="subtasks-section">
                <h4>المهام الفرعية</h4>
                <ul class="subtasks-list">
                    ${data.subtasks.map(subtask => `
                        <li class="${subtask.completed ? 'completed' : ''}">
                            ${subtask.title}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    },

    /**
     * إنشاء محتوى التقارير
     * @param {Object} task المهمة الرئيسية
     * @returns {string} HTML محتوى التقارير
     */
    async generateReportsContent(task) {
        const response = await fetch(`api/reports.php?task_id=${task.id}`);
        const data = await response.json();
        
        if (!data.reports || data.reports.length === 0) {
            return '<p class="no-reports">لا توجد تقارير</p>';
        }

        return `
            <div class="reports-section">
                <h4>التقارير</h4>
                ${data.reports.map(report => `
                    <div class="report-item">
                        <div class="report-content">
                            ${report.html_content}
                        </div>
                        <div class="report-date">
                            ${new Date(report.created_at).toLocaleDateString('ar-SA')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * إنشاء ملخص التقدم
     * @param {Array} tasks قائمة المهام
     * @returns {string} HTML ملخص التقدم
     */
    generateProgressSummary(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const inProgress = tasks.filter(t => t.status === 'in-progress').length;
        const pending = tasks.filter(t => t.status === 'pending').length;

        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return `
            <div class="progress-summary">
                <div class="progress-stats">
                    <div class="stat-item">
                        <span class="stat-label">إجمالي الهام:</span>
                        <span class="stat-value">${total}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">المهام المكتملة:</span>
                        <span class="stat-value">${completed}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">قيد التنفيذ:</span>
                        <span class="stat-value">${inProgress}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">قيد الانتظار:</span>
                        <span class="stat-value">${pending}</span>
                    </div>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%">
                        ${progress}%
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * تطبيق أنماط الطباعة
     * @param {HTMLElement} element عنصر الطباعة
     */
    applyPrintStyles(element) {
        const style = document.createElement('style');
        style.textContent = `
            .print-container {
                font-family: 'Cairo', 'Noto Kufi Arabic', sans-serif;
                padding: 10mm 20mm;
                background: white;
                direction: rtl;
                max-width: 100%;
                width: 100%;
            }

            .report-header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #333;
                padding-bottom: 15px;
                background: linear-gradient(135deg, #1976d2 0%, #2196F3 100%);
                color: white;
                padding: 1rem;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }

            .report-header h1 {
                font-size: 2rem;
                margin-bottom: 0.5rem;
                color: white;
            }

            .report-header h2 {
                font-size: 1.5rem;
                margin-bottom: 1rem;
                color: white;
                opacity: 0.9;
            }

            .report-meta {
                color: white;
                font-size: 14px;
                display: flex;
                justify-content: space-around;
                margin-top: 1rem;
            }

            .report-meta p {
                background: rgba(255,255,255,0.1);
                padding: 0.5rem 1rem;
                border-radius: 20px;
                margin: 0;
                color: white;
            }

            .task-card {
                border: 1px solid #eee;
                border-radius: 8px;
                margin-bottom: 25px;
                background: #fff;
                page-break-inside: avoid;
                position: relative;
                transition: all 0.3s ease;
            }

            .task-title {
                font-size: 1.3rem;
                color: #1976d2;
                border-bottom: 2px solid #eee;
                padding-bottom: 0.8rem;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .task-title i {
                color: #4CAF50;
            }

            .subtasks-section {
                margin: 25px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
                border-right: 4px solid #4CAF50;
            }

            .subtasks-section h4 {
                color: #2c3e50;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }

            .subtasks-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .subtask-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px;
                border-bottom: 1px solid #eee;
                transition: all 0.3s ease;
            }

            .subtask-item:hover {
                background: rgba(0,0,0,0.02);
            }

            .subtask-item.completed {
                background: #f1f8f1;
            }

            .subtask-item i {
                font-size: 1.2rem;
                width: 24px;
                text-align: center;
            }

            .subtask-title {
                flex: 1;
                font-size: 1rem;
                line-height: 1.4;
            }

            .reports-section {
                margin: 25px 0;
                padding: 20px;
                background: #fff;
                border-radius: 10px;
                border-right: 4px solid #2196F3;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }

            .reports-section h4 {
                color: #2c3e50;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }

            .report-item {
                padding: 15px;
                border-radius: 8px;
                background: #f8f9fa;
                margin-bottom: 15px;
                border: 1px solid #eee;
            }

            .report-content {
                font-size: 1rem;
                line-height: 1.6;
                color: #333;
                margin-bottom: 1rem;
            }

            .report-meta {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #666;
                font-size: 0.9rem;
                border-top: 1px solid #eee;
                padding-top: 0.5rem;
            }

            .progress-summary {
                margin: 40px 0;
                padding: 30px;
                background: #ffffff;
                border-radius: 15px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                border: 1px solid #e0e0e0;
            }

            .progress-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .stat-item {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                border: 1px solid #eee;
                transition: transform 0.2s ease;
            }

            .stat-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }

            .stat-label {
                display: block;
                color: #666;
                font-size: 0.9rem;
                margin-bottom: 8px;
            }

            .stat-value {
                display: block;
                font-size: 1.5rem;
                font-weight: bold;
                color: #2196F3;
            }

            .progress-bar {
                height: 25px;
                background: #f0f0f0;
                border-radius: 15px;
                overflow: hidden;
                margin: 20px 0;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
                position: relative;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(45deg, #2196F3, #00BCD4);
                border-radius: 15px;
                transition: width 1s ease-in-out;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
                box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3);
            }

            .progress-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(
                    45deg,
                    rgba(255,255,255,0.2) 25%,
                    transparent 25%,
                    transparent 50%,
                    rgba(255,255,255,0.2) 50%,
                    rgba(255,255,255,0.2) 75%,
                    transparent 75%,
                    transparent
                );
                background-size: 25px 25px;
                animation: progressStripes 1s linear infinite;
                border-radius: 15px;
            }

            @keyframes progressStripes {
                0% {
                    background-position: 0 0;
                }
                100% {
                    background-position: 25px 0;
                }
            }

            .progress-label {
                position: absolute;
                width: 100%;
                text-align: center;
                color: white;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
                z-index: 1;
            }

            @media print {
                .print-container {
                    padding: 5mm 15mm;
                }
                
                .task-card {
                    break-inside: avoid;
                    margin: 10px 0;
                }

                .report-header {
                    margin-top: 0;
                    padding-top: 10px;
                }
            }

            .task-status {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 0.9rem;
                background: rgba(0,0,0,0.05);
            }

            .task-meta {
                color: #666;
                font-size: 0.9rem;
                margin: 10px 0;
                display: flex;
                align-items: center;
                gap: 5px;
            }
        `;
        
        element.appendChild(style);
    },

    /**
     * تحويل حالة المهمة إلى نص
     * @param {string} status حالة المهمة
     * @returns {string} النص المقابل للحالة
     */
    getStatusText(status) {
        const statusMap = {
            'completed': 'مكتملة',
            'in-progress': 'قيد التنفيذ',
            'pending': 'قيد الانتظار'
        };
        return statusMap[status] || status;
    }
};

// تصدير الوحدة للاستخدام العام
window.ExportManager = ExportManager;

// تهيئة الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة معالج الأحداث لجميع أزرار التصدير
    document.querySelectorAll('.export-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const projectId = this.getAttribute('data-project-id') || window.currentProjectId;
            if (projectId) {
                ExportManager.exportProjectReport(projectId);
            } else {
                toastr.error('الرجاء اختيار مشروع أولاً');
            }
        });
    });
});

// تهيئة المدير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    ExportManager.init();
});