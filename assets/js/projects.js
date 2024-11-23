/**
 * إدارة المشاريع
 * يتيح هذا الملف إدارة المشاريع وتخزين المشروع الحالي
 */

// المتغير العام للمشروع الحالي
let currentProjectId = null;

// تحميل المشاريع عند بدء التطبيق
$(document).ready(function() {
    // استرجاع معرف المشروع المحفوظ
    currentProjectId = localStorage.getItem('currentProjectId');
    if (currentProjectId) {
        currentProjectId = parseInt(currentProjectId);
    }
    loadProjects();
});

/**
 * تحميل المشاريع
 * يقوم بتحميل المشاريع من قاعدة البيانات وعرضها
 */
function loadProjects() {
    $.ajax({
        url: 'api/projects.php',
        method: 'GET',
        success: function(response) {
            if (response.success) {
                // التحقق من وجود المشروع المحفوظ
                if (currentProjectId) {
                    const projectExists = response.projects.some(p => p.id === currentProjectId);
                    if (!projectExists) {
                        // إذا لم يعد المشروع موجوداً، نحذف التخزين
                        currentProjectId = null;
                        localStorage.removeItem('currentProjectId');
                    }
                }
                renderProjects(response.projects);

                // تحديث واجهة المستخدم لتعكس المشروع الحالي
                updateProjectInterface();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading projects:', error);
            toastr.error('حدث خطأ أثناء تحميل المشاريع');
        }
    });
}

/**
 * تحديث واجهة المشروع
 * يقوم بتحديث العناصر المرئية لتعكس المشروع المحدد
 */
function updateProjectInterface() {
    // تحديث عنوان الصفحة
    if (currentProjectId) {
        const projectName = $('.project-tab.active').text().trim();
        document.title = `${projectName} - نظام إدارة المهام`;
    } else {
        document.title = 'نظام إدارة المهام';
    }

    // تحديث زر إضافة المهام
    const addTaskBtn = $('.btn-add-task');
    if (currentProjectId) {
        addTaskBtn.prop('disabled', false)
            .attr('title', 'إضاف مهمة جديدة للمشروع');
    } else {
        addTaskBtn.prop('disabled', true)
            .attr('title', 'يرجى اختيار مشروع أولاً');
    }

    // إضافة مؤشر المشروع الحالي في الهيدر
    updateCurrentProjectIndicator();
}

/**
 * تحديث مؤشر المشروع الحالي
 * يعرض اسم المشروع الحالي في الهيدر
 */
function updateCurrentProjectIndicator() {
    const indicator = $('#current-project-indicator');
    if (!indicator.length) {
        // إنشاء عنصر المؤشر إذا لم يكن موجوداً
        $('.header-content').append(`
            <div id="current-project-indicator" class="mt-3">
                <span class="current-project-label"></span>
            </div>
        `);
    }

    const label = $('.current-project-label');
    if (currentProjectId) {
        const projectName = $('.project-tab.active').text().trim();
        label.html(`
            <span class="badge bg-light text-dark">
                <i class="fas fa-folder-open"></i>
                المشروع الحالي: ${projectName}
            </span>
        `);
    } else {
        label.html(`
            <span class="badge bg-secondary">
                <i class="fas fa-folder"></i>
                لم يتم اختيار مشروع
            </span>
        `);
    }
}

/**
 * اختيار مشروع
 * @param {number|null} projectId - معرف المشروع
 */
function selectProject(projectId) {
    currentProjectId = projectId;

    // حفظ المشروع المحدد
    if (projectId) {
        localStorage.setItem('currentProjectId', projectId);
    } else {
        localStorage.removeItem('currentProjectId');
    }

    // تحديث الواجهة
    $('.project-tab').removeClass('active');
    if (projectId === null) {
        $('[onclick="selectProject(null)"]').addClass('active');
    } else {
        $(`[onclick="selectProject(${projectId})"]`).addClass('active');
    }

    // تحديث الواجهة والمهام
    updateProjectInterface();
    loadTasks(projectId);
    loadProjects();

    // إظهار رسالة تأكيد
    const projectName = projectId ? $('.project-tab.active').text().trim() : 'جميع المشاريع';
    toastr.success(`تم اختيار ${projectName}`);
}

// إضافة CSS للمؤشر
$('<style>')
    .text(`
        #current-project-indicator {
            transition: all 0.3s ease;
        }
        
        .current-project-label {
            font-size: 1.1rem;
        }
        
        .current-project-label .badge {
            padding: 0.5rem 1rem;
            border-radius: 50px;
            transition: all 0.3s ease;
        }
        
        .current-project-label .badge:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
    `)
    .appendTo('head');

/**
 * عرض المشاريع
 * @param {Array} projects - قائمة المشاريع
 */
function renderProjects(projects) {
    const projectsNav = $('#projects-nav');
    const projectsCount = $('#projects-count');
    projectsNav.empty();

    // تحديث عدد المشاريع
    projectsCount.text(projects.length);

    if (projects.length === 0) {
        projectsNav.append('<div class="alert alert-info">لا توجد مشاريع حالياً</div>');
        return;
    }

    // إضافة زر "جميع المشاريع"
    projectsNav.append(`
        <button class="nav-link project-tab ${!currentProjectId ? 'active' : ''}" 
                onclick="selectProject(null)">
            <i class="fas fa-list"></i> جميع المشاريع
        </button>
    `);

    // إضافة أزرار المشاريع
    projects.forEach(project => {
        const projectTab = $(`
            <button class="nav-link project-tab ${currentProjectId === project.id ? 'active' : ''}" 
                    onclick="selectProject(${project.id})">
                <i class="fas fa-folder"></i>
                ${escapeHtml(project.name)}
                <span class="badge bg-secondary rounded-pill ms-2">${project.tasks_count}</span>
            </button>
        `);
        projectsNav.append(projectTab);
    });

    // تحديث معلومات المشروع الحالي
    updateCurrentProjectInfo(projects);
}

/**
 * عرض نموذج إضافة مشروع
 */
function showAddProjectModal() {
    // إعادة تعيين النموذج بالكامل
    $('#projectForm')[0].reset();
    $('#projectId').val('');

    // إزالة أي محتوى سابق من قائمة المشاريع
    $('#taskProject').remove();

    // تحديث عنوان النموذج
    $('.modal-title').text('إضافة مشروع جديد');

    // إزالة أي أزرار إضافية تم إضافتها سابقاً
    $('.quick-status-buttons').remove();

    // عرض النموذج
    $('#projectModal').modal('show');
}

/**
 * تحرير مشروع
 * @param {number} projectId - معرف المشروع
 */
function editProject(projectId) {
    // منع انتشار الحدث لتجنب تحديد المشروع
    event.stopPropagation();

    // جعادة تعيين النموذج أولاً
    $('#projectForm')[0].reset();
    $('#projectId').val('');

    // إزالة أي محتوى سابق من قائمة المشاريع
    $('#taskProject').remove();

    // جلب بيانات المشروع
    $.ajax({
        url: `api/projects.php?id=${projectId}`,
        method: 'GET',
        success: function(response) {
            if (response.success && response.project) {
                const project = response.project;

                // تعبئة النموذج
                $('#projectId').val(project.id);
                $('#projectName').val(project.name);
                $('#projectDescription').val(project.description);

                // تحديث عنوان النموذج
                $('.modal-title').text('تعديل المشروع');

                // عرض النموذج
                $('#projectModal').modal('show');
            } else {
                toastr.error('لم يتم العثور على المشروع');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading project:', error);
            toastr.error('حدث خطأ أثناء تحميل بيانات المشروع');
        }
    });
}

// إضافة معالج حدث إغلاق النموذج
$('#projectModal').on('hidden.bs.modal', function() {
    // إعادة تعيين النموذج عند إغلاقه
    $('#projectForm')[0].reset();
    $('#projectId').val('');
    $('.modal-title').text('إضافة مشروع جديد');
    $('#taskProject').remove();
    $('.quick-status-buttons').remove();
});

/**
 * حفظ مشروع (جديد أو تعديل)
 */
function saveProject() {
    const projectId = $('#projectId').val();
    const projectData = {
        name: $('#projectName').val().trim(),
        description: $('#projectDescription').val().trim()
    };

    if (!projectData.name) {
        toastr.error('يرجى إدخال اسم المشروع');
        return;
    }

    const method = projectId ? 'PUT' : 'POST';
    const url = projectId ? `api/projects.php?id=${projectId}` : 'api/projects.php';

    $.ajax({
        url: url,
        method: method,
        contentType: 'application/json',
        data: JSON.stringify(projectData),
        success: function(response) {
            if (response.success) {
                $('#projectModal').modal('hide');

                // إذا كان مشروع جديد، نجعله المشروع الحالي
                if (!projectId && response.id) {
                    currentProjectId = response.id;
                    localStorage.setItem('currentProjectId', response.id);
                }

                // تحديث واجهة المستخدم
                loadProjects();
                loadTasks(currentProjectId);
                updateProjectInterface();
                updateStats();

                toastr.success(projectId ? 'تم تحديث المشروع بنجاح' : 'تم إضافة المشروع بنجاح');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error saving project:', error);
            toastr.error('حدث خطأ أثناء حفظ المشروع');
        }
    });
}

/**
 * حذف جميع البيانات
 */
function truncateAllData() {
    Swal.fire({
        title: 'تأكيد الحذف',
        text: 'هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، احذف الكل',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: 'api/projects.php?action=truncate',
                method: 'DELETE',
                success: function(response) {
                    if (response.success) {
                        loadProjects();
                        loadTasks();
                        updateStats();
                        toastr.success('تم حذف جميع البيانات بنجاح');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error truncating data:', error);
                    toastr.error('حدث خطأ أثناء حذف البيانات');
                }
            });
        }
    });
}

// إضافة CSS للمشاريع
$('<style>')
    .text(`
        .project-card {
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .project-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .project-card.active {
            border-color: #0d6efd;
            background-color: #f8f9fa;
        }
        
        .project-actions {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .project-card:hover .project-actions {
            opacity: 1;
        }
    `)
    .appendTo('head');

/**
 * تحديث إحصائيات المهام للمشروع
 * @param {number} projectId - معرف المشروع
 */
function updateProjectTasksStats(projectId) {
    if (!projectId) return;

    $.ajax({
        url: `api/tasks.php?project_id=${projectId}&stats=true`,
        method: 'GET',
        success: function(response) {
            if (response.success) {
                const stats = response.stats;

                // تحديث الإحصائيات في واجهة المستخدم
                $(`#project-total-tasks-${projectId}`).text(stats.total || 0);
                $(`#completed-tasks-count-${projectId}`).text(stats.completed || 0);
                $(`#in-progress-tasks-count-${projectId}`).text(stats.in_progress || 0);

                // تحديث شريط التقدم
                const progressBar = $(`#project-progress-${projectId}`);
                const progress = response.progress || 0;

                progressBar.css('width', `${progress}%`).text(`${progress}%`);

                // تحديث لون شريط التقدم
                progressBar.removeClass('bg-danger bg-warning bg-info bg-success');
                if (progress >= 75) {
                    progressBar.addClass('bg-success');
                } else if (progress >= 50) {
                    progressBar.addClass('bg-info');
                } else if (progress >= 25) {
                    progressBar.addClass('bg-warning');
                } else {
                    progressBar.addClass('bg-danger');
                }

                // تحديث الإحصائيات العامة
                updateOverallStats(response.tasks || []);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading project stats:', error);
        }
    });
}

/**
 * تحديث الإحصائيات العامة
 * @param {Array} tasks - قائمة المهام
 */
function updateOverallStats(tasks) {
    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        pending: tasks.filter(t => t.status === 'pending').length
    };

    // تحديث الإحصائيات في الهيدر
    $('#total-tasks').text(stats.total);
    $('#completed-tasks').text(stats.completed);
    $('#pending-tasks').text(stats.pending);

    // تحديث الإحصائيات في الفوتر
    $('#footer-total').text(stats.total);
    $('#footer-completed').text(stats.completed);
    $('#footer-progress').text(stats.inProgress);

    // تحديث شريط التقدم الإجمالي
    const overallProgress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    $('#overall-progress')
        .css('width', `${overallProgress}%`)
        .text(`${overallProgress}%`);
}

/**
 * تحديث معلومات المشروع الحالي
 * @param {Array} projects - قائمة المشاريع
 */
function updateCurrentProjectInfo(projects) {
    const currentProjectInfo = $('#current-project-info');

    if (!currentProjectId) {
        currentProjectInfo.html(`
            <div class="text-center text-muted">
                <i class="fas fa-tasks fa-2x mb-2"></i>
                <p>عرض جميع المهام</p>
            </div>
        `);
        return;
    }

    const currentProject = projects.find(p => p.id === currentProjectId);
    if (!currentProject) return;

    currentProjectInfo.html(`
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h5>${escapeHtml(currentProject.name)}</h5>
                <p class="text-muted">${escapeHtml(currentProject.description || '')}</p>
            </div>
            <div class="btn-group">
                <button class="btn btn-outline-primary btn-sm" onclick="editProject(${currentProject.id})">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteProject(${currentProject.id})">
                    <i class="fas fa-trash"></i> حذف
                </button>
                <button class="btn btn-outline-success btn-sm" onclick="exportProjectReport(${currentProject.id})">
                    <i class="fas fa-file-pdf"></i> تصدير التقرير
                </button>
            </div>
        </div>
        <div class="project-stats">
            <div class="project-stat-item">
                <i class="fas fa-tasks"></i>
                المهام: <span id="project-total-tasks-${currentProject.id}">0</span>
            </div>
            <div class="project-stat-item">
                <i class="fas fa-check-circle text-success"></i>
                المكتملة: <span id="completed-tasks-count-${currentProject.id}">0</span>
            </div>
            <div class="project-stat-item">
                <i class="fas fa-spinner text-primary"></i>
                قيد التنفيذ: <span id="in-progress-tasks-count-${currentProject.id}">0</span>
            </div>
        </div>
        <div class="progress mt-3" style="height: 10px;">
            <div class="progress-bar" id="project-progress-${currentProject.id}" 
                 role="progressbar" style="width: 0%" 
                 aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
        </div>
        
        <!-- أزرار إضافية -->
        <div class="project-actions mt-3">
            <button class="btn btn-primary" onclick="showAddTaskModal()">
                <i class="fas fa-plus"></i> إضافة مهمة
            </button>
            <button class="btn btn-success" onclick="exportProjectReport(${currentProject.id})">
                <i class="fas fa-file-pdf"></i> تصدير تقرير المشروع
            </button>
        </div>
    `);

    // تحديث إحصائيات المهام للمشروع الحالي
    updateProjectTasksStats(currentProject.id);
}

// إضافة CSS للأزرار
$('<style>')
    .text(`
        .project-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }

        .project-actions .btn {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 8px 15px;
            border-radius: 20px;
            transition: all 0.3s ease;
        }

        .project-actions .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .project-actions .btn i {
            font-size: 1.1em;
        }
    `)
    .appendTo('head');

/**
 * حذف مشروع
 * @param {number} projectId - معرف المشروع
 */
function deleteProject(projectId) {
    Swal.fire({
        title: 'تأكيد الحذف',
        text: 'هل أنت متأكد من حذف هذا المشروع وجميع مهامه؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#d33'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `api/projects.php?id=${projectId}`,
                method: 'DELETE',
                success: function(response) {
                    if (response.success) {
                        // إذا تم حذف المشروع الحالي
                        if (currentProjectId === projectId) {
                            currentProjectId = null;
                            localStorage.removeItem('currentProjectId');
                        }

                        loadProjects();
                        loadTasks();
                        updateStats();
                        toastr.success('تم حذف المشروع بنجاح');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error deleting project:', error);
                    toastr.error('حدث خطأ أثناء حذف المشروع');
                }
            });
        }
    });
}