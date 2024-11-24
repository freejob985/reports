<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام إدارة المهام</title>
    
    <!-- المكتبات الخارجية -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/toastr@2.1.4/build/toastr.min.css" rel="stylesheet">
    <link href="https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet">
    <!-- خط Cairo و Tajawal -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet">
    
    <!-- إضافة Favicon -->
    <link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg">
    
    <!-- إضافة ملف الخط العربي -->
    <link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #2196F3 0%, #4CAF50 100%);
            --secondary-gradient: linear-gradient(135deg, #FF9800 0%, #FF5722 100%);
            --success-gradient: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            --danger-gradient: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        }

        body {
            font-family: 'Tajawal', sans-serif;
            background-color: #f5f5f5;
        }

        /* تحسين عرض الصفحة */
        .container {
            max-width: 1400px;
            padding: 0 30px;
        }

        /* تحسين الهيدر */
        .app-header {
            background: linear-gradient(135deg, #1565C0 0%, #1976d2 100%);
            padding: 1rem 0;
            margin-bottom: 2rem;
            box-shadow: 0 4px 30px rgba(0,0,0,0.15);
            position: relative;
            overflow: hidden;
        }

        /* إضافة تأثير خلفية للهيدر */
        .app-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('assets/images/pattern.svg') repeat;
            opacity: 0.1;
            pointer-events: none;
        }

        .header-content {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .app-icon {
            font-size: 3rem;
            color: white;
            margin-bottom: 1rem;
            animation: float 3s ease-in-out infinite;
        }

        .header-stats {
            display: flex;
            gap: 2rem;
            margin-top: 1.5rem;
        }

        .stat-item {
            text-align: center;
            color: white;
            padding: 1rem;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            backdrop-filter: blur(5px);
            transition: transform 0.3s ease;
        }

        .stat-item:hover {
            transform: translateY(-5px);
        }

        .stat-item i {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .stat-item span {
            display: block;
            font-size: 1.5rem;
            font-weight: bold;
        }

        /* تصميم الفوتر */
        .app-footer {
            background: linear-gradient(135deg, #2196F3 0%, #1976d2 100%);
            color: white;
            padding: 2rem 0;
            margin-top: 3rem;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
        }

        .footer-stats {
            list-style: none;
            padding: 0;
        }

        .footer-stats li {
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .footer-brand {
            padding: 1rem;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            backdrop-filter: blur(5px);
        }

        .footer-brand i {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .footer-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        }

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }

        /* تصميم البطاقات */
        .task-card {
            background: white;
            border: none;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            margin-bottom: 1.5rem;
        }

        .task-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .task-card .card-header {
            background: var(--primary-gradient);
            color: white;
            border-radius: 12px 12px 0 0;
            padding: 1rem;
            border: none;
        }

        .task-card .card-body {
            padding: 1.5rem;
        }

        /* تصميم الأقسام الداخلية */
        .subtasks-section, .reports-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            border: 1px solid rgba(0,0,0,0.1);
        }

        /* تصميم شريط التقدم */
        .progress {
            height: 12px;
            border-radius: 6px;
            background-color: #e9ecef;
            overflow: hidden;
            margin: 1rem 0;
            position: relative;
        }

        .progress-bar {
            transition: width 0.4s ease-in-out;
            position: relative;
        }

        /* تصميم الأزرار */
        .btn-primary {
            background: var(--primary-gradient);
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .btn-primary:hover {
            background: var(--secondary-gradient);
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        /* تصميم البطاقات الفرعية */
        .list-group-item {
            transition: all 0.3s ease;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            border: 1px solid rgba(0,0,0,0.1);
        }

        .list-group-item:hover {
            background-color: #f8f9fa;
        }

        /* تصميم الشارات */
        .badge {
            padding: 0.5em 1em;
            border-radius: 50px;
            font-weight: 500;
        }

        /* تحسينات للنموذج */
        .modal-content {
            border-radius: 12px;
            border: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .modal-header {
            background: var(--primary-gradient);
            color: white;
            border-radius: 12px 12px 0 0;
            border: none;
        }

        .modal-footer {
            border-top: 1px solid rgba(0,0,0,0.1);
        }

        /* تحديث تصميم المهام المكتملة */
        .completed-subtask {
            position: relative;
            opacity: 0.8;
            background-color: #f8f9fa !important;
        }

        .completed-subtask .form-check-label {
            text-decoration: line-through;
            color: #6c757d;
        }

        /* تحسين تصميم حقل إدخال المهام الفرعية */
        .subtask-input {
            border: 1px solid #ced4da;
            transition: all 0.3s ease;
        }

        .subtask-input.is-invalid {
            border-color: #dc3545;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }

        .error-message {
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* تحديث أزرار الكارد */
        .task-card .btn-outline-primary {
            color: #2196F3;
            border-color: #2196F3;
            transition: all 0.3s ease;
        }

        .task-card .btn-outline-primary:hover {
            background: var(--primary-gradient);
            border-color: transparent;
            color: white;
        }

        .task-card .btn-outline-danger {
            color: #f44336;
            border-color: #f44336;
        }

        .task-card .btn-outline-danger:hover {
            background: var(--danger-gradient);
            border-color: transparent;
            color: white;
        }

        /* تصميم المهام الفرعية القابلة للسحب */
        .subtask-draggable {
            background: white;
            border: 1px solid rgba(0,0,0,0.1);
            border-radius: 8px;
            margin-bottom: 0.5rem;
            padding: 0.75rem;
            transition: all 0.3s ease;
        }

        .subtask-draggable:hover {
            background: #f8f9fa;
            transform: translateX(-5px);
            box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
        }

        .subtask-draggable .drag-handle {
            color: #adb5bd;
            cursor: move;
            padding: 0.25rem;
            border-radius: 4px;
            transition: all 0.3s ease;
        }

        .subtask-draggable .drag-handle:hover {
            background: #e9ecef;
            color: #6c757d;
        }

        .subtask-draggable .form-check-label {
            font-size: 1rem;
            color: #495057;
            transition: all 0.3s ease;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
        }

        .subtask-draggable .form-check-input {
            cursor: pointer;
            width: 1.2rem;
            height: 1.2rem;
        }

        .completed-subtask {
            background: #f8f9fa;
            opacity: 0.8;
        }

        .completed-subtask .form-check-label {
            text-decoration: line-through;
            color: #6c757d;
        }

        .selected-subtask {
            background: #e3f2fd;
            color: #1976d2 !important;
            font-weight: 500;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
        }

        .subtask-draggable .btn-group {
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .subtask-draggable:hover .btn-group {
            opacity: 1;
        }

        .subtask-draggable .btn {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
        }

        .subtask-placeholder {
            border: 2px dashed #dee2e6;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 0.5rem 0;
            height: 3rem;
        }

        /* تحسين مظهر حقل إدخال المهام الفرعية */
        .subtask-input {
            border-radius: 8px;
            padding: 0.75rem;
            border: 1px solid #ced4da;
            transition: all 0.3s ease;
        }

        .subtask-input:focus {
            border-color: #2196F3;
            box-shadow: 0 0 0 0.2rem rgba(33, 150, 243, 0.25);
        }

        /* تنسيق السكرول */
        ::-webkit-scrollbar {
            width: 10px;
        }

        ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #2196F3 0%, #4CAF50 100%);
            border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #1976D2 0%, #388E3C 100%);
        }

        /* تنعيم السكرول */
        html {
            scroll-behavior: smooth;
        }

        /* تنسيقات الشارات في الهيدر */
        .header-stats .badge {
            font-size: 1.2rem;
            padding: 0.5rem 1rem;
            margin: 0.25rem;
            transition: all 0.3s ease;
        }

        .header-stats .badge:hover {
            transform: scale(1.1);
        }

        .header-stats small.badge {
            font-size: 0.8rem;
            padding: 0.25rem 0.5rem;
        }

        /* تنسيقات الشارات في الفوتر */
        .footer-stats .badge {
            font-size: 1rem;
            padding: 0.4rem 0.8rem;
            margin-right: 0.5rem;
            transition: all 0.3s ease;
        }

        .footer-stats .badge:hover {
            transform: translateY(-2px);
        }

        /* تنسيقات عامة للشارات */
        .badge {
            border-radius: 50px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .badge.bg-primary {
            background: var(--primary-gradient) !important;
        }

        .badge.bg-success {
            background: var(--success-gradient) !important;
        }

        .badge.bg-warning {
            background: var(--secondary-gradient) !important;
            color: white;
        }

        .badge.bg-info {
            background: linear-gradient(135deg, #03a9f4 0%, #00bcd4 100%) !important;
        }

        /* تحسين مظهر القوائم في الفوتر */
        .footer-stats li {
            background: rgba(255,255,255,0.1);
            padding: 0.5rem 1rem;
            border-radius: 10px;
            margin-bottom: 0.5rem;
            backdrop-filter: blur(5px);
            transition: all 0.3s ease;
        }

        .footer-stats li:hover {
            background: rgba(255,255,255,0.2);
            transform: translateX(-5px);
        }

        /* تنسيقات شارات التقارير */
        .report-badge {
            font-size: 0.9rem;
            padding: 0.4em 0.8em;
            border-radius: 50px;
            transition: all 0.3s ease;
            margin: 0 0.2rem;
        }

        .report-badge:hover {
            transform: scale(1.1);
        }

        .report-badge.bg-info {
            background: linear-gradient(135deg, #03a9f4 0%, #00bcd4 100%) !important;
            color: white;
        }

        .report-badge.bg-primary {
            background: var(--primary-gradient) !important;
        }

        .report-badge.bg-danger {
            background: var(--danger-gradient) !important;
        }

        /* نسيقات أزرار التقارير */
        .report-actions .btn {
            display: inline-flex;
            align-items: center;
            padding: 0.375rem 0.75rem;
            border-radius: 50px;
            transition: all 0.3s ease;
        }

        .report-actions .btn:hover {
            transform: translateY(-2px);
        }

        .report-actions .btn .badge {
            margin-left: 0.5rem;
            font-size: 0.75rem;
            padding: 0.25em 0.6em;
        }

        /* تحسينات إضافية للشارات */
        .badge {
            font-weight: 500;
            letter-spacing: 0.5px;
        }

        .badge.with-icon {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
        }

        .badge.with-icon i {
            font-size: 0.85em;
        }

        /* تنسيق أزرار المهام الرئيسية */
        .task-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
        }

        .task-btn {
            padding: 0.5rem 1rem;
            border-radius: 50px;
            transition: all 0.3s ease;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .task-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .task-btn i {
            font-size: 0.9em;
        }

        /* تنسيق أزرار التقارير */
        .report-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
        }

        .report-btn {
            padding: 0.5rem 1.25rem;
            border-radius: 50px;
            transition: all 0.3s ease;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .report-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .report-btn i {
            font-size: 1.1em;
        }

        /* تنسيق أزرار الحالة */
        .status-btn {
            padding: 0.4rem 1rem;
            border-radius: 50px;
            transition: all 0.3s ease;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, var(--bs-primary) 0%, var(--bs-info) 100%);
            color: white;
            border: none;
        }

        .status-btn:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
        }

        /* تنسيق مجموعة الأزرا */
        .btn-group {
            border-radius: 50px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .btn-group .btn {
            border: none;
            padding: 0.5rem 1rem;
            transition: all 0.3s ease;
        }

        .btn-group .btn:hover {
            transform: translateY(-2px);
            z-index: 2;
        }

        /* تنسيق أزرار المهام الرئيسية */
        .task-action-btn {
            background: linear-gradient(135deg, #6B73FF 0%, #000DFF 100%);
            border: none;
            padding: 10px 20px;
            color: white;
            border-radius: 50px;
            transition: all 0.3s ease;
            margin: 5px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .task-action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            background: linear-gradient(135deg, #000DFF 0%, #6B73FF 100%);
        }

        .task-action-btn.warning {
            background: linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%);
        }

        .task-action-btn.danger {
            background: linear-gradient(135deg, #FF6B6B 0%, #FF0000 100%);
        }

        .task-action-btn.success {
            background: linear-gradient(135deg, #28C76F 0%, #48DA89 100%);
        }

        .task-action-btn i {
            margin-right: 8px;
        }

        /* تنسيق شارات التواريخ */
        .date-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 5px 15px;
            border-radius: 50px;
            font-size: 0.9rem;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .date-badge i {
            font-size: 0.8rem;
        }

        .date-badge.created {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .date-badge.updated {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        /* تنسيق أزرار المهام في الهيدر */
        .task-header-actions {
            display: flex;
            gap: 0.5rem;
        }

        .task-action-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 50px;
            color: white;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .task-action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .task-action-btn i {
            font-size: 1rem;
        }

        .task-action-btn.primary {
            background: linear-gradient(135deg, #6B73FF 0%, #000DFF 100%);
        }

        .task-action-btn.success {
            background: linear-gradient(135deg, #28C76F 0%, #48DA89 100%);
        }

        .task-action-btn.info {
            background: linear-gradient(135deg, #0396FF 0%, #ABDCFF 100%);
        }

        .task-action-btn.warning {
            background: linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%);
        }

        .task-action-btn.danger {
            background: linear-gradient(135deg, #FF6B6B 0%, #FF0000 100%);
        }

        /* تحسين مظهر عنوان المهمة */
        .task-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #2c3e50;
        }

        /* تنسيق مجموعة الأزرار */
        .btn-group {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        /* تحسين مظهر النص في الأزرار على الشاشات الصغيرة */
        @media (max-width: 768px) {
            .action-text {
                display: none;
            }
            
            .task-action-btn {
                padding: 0.5rem;
            }
            
            .task-action-btn i {
                margin: 0;
            }
        }

        .projects-section {
            background: #fff;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .danger-zone {
            background: #fff3f3;
            border: 1px solid #ffcdd2;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
        }

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

        .projects-navigation {
            background: #fff;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-top: -1rem;
        }

        .projects-tabs {
            overflow-x: auto;
            padding: 10px 0;
        }

        .projects-tabs .nav-pills {
            display: flex;
            gap: 10px;
            flex-wrap: nowrap;
            min-width: 100%;
        }

        .project-tab {
            background: #f8f9fa;
            border-radius: 50px;
            padding: 8px 16px;
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }

        .project-tab.active {
            background: #0d6efd;
            color: white;
        }

        .project-tab:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .current-project {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 15px;
            margin-top: 20px;
        }

        .project-stats {
            display: flex;
            gap: 20px;
            margin-top: 10px;
        }

        .project-stat-item {
            background: white;
            padding: 10px 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        /* تنسيق زر التصدير */
        .export-btn {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            border: none;
            padding: 10px 20px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .export-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            background: linear-gradient(135deg, #45a049, #4CAF50);
        }

        .export-btn i {
            font-size: 1.1em;
        }

        /* تنسيق عنصر الطباعة */
        .print-container {
            background: white;
            padding: 20mm;
            margin: 0 auto;
            max-width: 210mm;
            direction: rtl;
        }

        /* تحسين تباعد المكونات */
        .section-spacing {
            margin-bottom: 2.5rem;
        }

        .row-spacing {
            margin-bottom: 1.5rem;
        }

        /* تحسين عرض المهام */
        .task-card {
            margin-bottom: 2rem;
            border: none;
            box-shadow: 0 2px 15px rgba(0,0,0,0.08);
        }

        /* تمييز المهام الفرعية */
        .subtasks-section {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 1.5rem;
            margin: 1rem 0;
            border-left: 4px solid #4CAF50;
        }

        /* قائمة المهام الفرعية */
        .subtasks-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .subtask-item {
            display: flex;
            align-items: center;
            padding: 0.75rem;
            border-bottom: 1px solid #eee;
            transition: all 0.3s ease;
        }

        .subtask-item:last-child {
            border-bottom: none;
        }

        .subtask-item.completed {
            background: #f1f8f1;
        }

        .subtask-item.completed .subtask-title {
            text-decoration: line-through;
            color: #4CAF50;
        }

        /* تمييز التقارير */
        .reports-section {
            background: #fff;
            border-radius: 10px;
            padding: 1.5rem;
            margin: 1rem 0;
            border-left: 4px solid #2196F3;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .report-item {
            padding: 1rem;
            border-radius: 8px;
            background: #f8f9fa;
            margin-bottom: 1rem;
        }

        .report-content {
            font-size: 1rem;
            line-height: 1.6;
            color: #333;
        }

        .report-meta {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-top: 0.5rem;
            color: #666;
            font-size: 0.9rem;
        }

        .export-preview {
            border: 1px solid #dee2e6;
            border-radius: 8px;
        }
        
        .export-preview h6 {
            color: #2196F3;
            margin-bottom: 1rem;
        }
        
        .export-preview ul li {
            margin-bottom: 0.5rem;
            color: #666;
        }
        
        .export-preview ul li i {
            width: 20px;
            margin-right: 8px;
            color: #2196F3;
        }
        
        .input-group-text {
            background: #f8f9fa;
            color: #666;
        }
        
        #pdfHeight:focus {
            border-color: #2196F3;
            box-shadow: 0 0 0 0.2rem rgba(33, 150, 243, 0.25);
        }

        .export-options {
            border: 1px solid #e0e0e0;
            background: #ffffff;
            border-radius: 10px;
        }

        .export-preview {
            border: 1px solid #e0e0e0;
            height: 100%;
            min-height: 200px;
        }

        .export-controls {
            padding-right: 1rem;
            border-right: 1px solid #e0e0e0;
        }

        .form-label i {
            color: #2196F3;
        }

        .input-group {
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .input-group-text {
            background: #f8f9fa;
            border-color: #e0e0e0;
        }

        #pdfHeight {
            border-color: #e0e0e0;
        }

        #pdfHeight:focus {
            border-color: #2196F3;
            box-shadow: 0 0 0 0.2rem rgba(33, 150, 243, 0.25);
        }

        .export-btn {
            transition: all 0.3s ease;
        }

        .export-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .export-preview ul li {
            padding: 0.5rem;
            border-radius: 5px;
            transition: all 0.3s ease;
        }

        .export-preview ul li:hover {
            background: rgba(33, 150, 243, 0.05);
        }

        @media (max-width: 768px) {
            .export-controls {
                padding-right: 0;
                border-right: none;
                border-bottom: 1px solid #e0e0e0;
                margin-bottom: 1rem;
                padding-bottom: 1rem;
            }
        }

        /* تنسيق زر إخفاء/إظهار خيارات التصدير */
        .toggle-export-options {
            cursor: pointer;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            background: #f8f9fa;
            border: 1px solid #e0e0e0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }

        .toggle-export-options:hover {
            background: #e9ecef;
        }

        .toggle-export-options i {
            transition: transform 0.3s ease;
        }

        .toggle-export-options.collapsed i {
            transform: rotate(-180deg);
        }
    </style>
</head>
<body>
    <!-- الهيدر -->
    <header class="app-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-12 text-center">
                    <div class="header-content">
                        <div class="app-icon">
                            <i class="fas fa-tasks"></i>
                        </div>
                        <h1>نظام إدارة المهام</h1>
                        <div class="header-stats">
                            <div class="stat-item">
                                <i class="fas fa-list"></i>
                                <span id="total-tasks" class="badge bg-primary rounded-pill">0</span>
                                <small class="badge bg-light text-dark">المهام الكلية</small>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-check-circle"></i>
                                <span id="completed-tasks" class="badge bg-success rounded-pill">0</span>
                                <small class="badge bg-light text-dark">المهام المكتملة</small>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-clock"></i>
                                <span id="pending-tasks" class="badge bg-warning rounded-pill">0</span>
                                <small class="badge bg-light text-dark">قيد الانتظار</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- إضافة قسم المشاريع بعد الهيدر مباشرة -->
    <div class="container">
        <div class="projects-navigation mb-4">
            <div class="d-flex justify-content-between align-items-center">
                <h4>
                    <i class="fas fa-folder-open"></i>
                    المشاريع
                    <span class="badge bg-primary rounded-pill" id="projects-count">0</span>
                </h4>
                <button class="btn btn-primary" onclick="showAddProjectModal()">
                    <i class="fas fa-plus"></i> مشروع جديد
                </button>
            </div>
            
            <!-- شريط التنقل بين المشاريع -->
            <div class="projects-tabs mt-3">
                <div class="nav nav-pills" id="projects-nav">
                    <!-- سيتم إضافة المشاريع هنا -->
                </div>
            </div>

            <!-- قسم خيارات التصدير - جديد -->
            <div class="d-flex justify-content-between align-items-center mt-3">
                <button class="toggle-export-options" id="toggleExportOptions">
                    <i class="fas fa-chevron-up"></i>
                    خيارات التصدير
                </button>
            </div>

            <div class="export-options mt-2 p-4" id="exportOptionsPanel">
                <div class="row">
                    <div class="col-12 mb-3">
                        <h5 class="border-bottom pb-2">
                            <i class="fas fa-cog text-primary"></i>
                            خيارات التصدير
                        </h5>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="export-controls">
                            <div class="form-group mb-3">
                                <label for="pdfHeight" class="form-label d-flex align-items-center">
                                    <i class="fas fa-arrows-alt-v me-2 text-primary"></i>
                                    ارتفاع صفحة PDF (مم)
                                </label>
                                <div class="input-group">
                                    <input type="number" 
                                           class="form-control" 
                                           id="pdfHeight" 
                                           min="500" 
                                           max="5000" 
                                           step="100"
                                           value="1500">
                                    <span class="input-group-text">مم</span>
                                </div>
                                <small class="form-text text-muted mt-1">
                                    <i class="fas fa-info-circle"></i>
                                    القيمة الافتراضية: 1500 مم. يمكنك تعديل الارتفاع حسب حجم المحتوى.
                                </small>
                            </div>

                            <div class="export-actions mt-3">
                                <button class="btn btn-primary export-btn w-100" data-project-id="">
                                    <i class="fas fa-file-pdf me-2"></i>
                                    تصدير التقرير
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="export-preview p-3 bg-light rounded">
                            <h6 class="mb-3">
                                <i class="fas fa-eye text-primary"></i>
                                معاينة إعدادات التصدير
                            </h6>
                            <ul class="list-unstyled mb-0">
                                <li class="mb-2">
                                    <i class="fas fa-file-pdf text-danger"></i>
                                    نوع الملف: PDF
                                </li>
                                <li class="mb-2">
                                    <i class="fas fa-expand-arrows-alt text-primary"></i>
                                    العرض: 297 مم (A4)
                                </li>
                                <li>
                                    <i class="fas fa-arrows-alt-v text-primary"></i>
                                    الارتفاع: <span id="currentHeight" class="fw-bold">1500</span> مم
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- المشروع الحالي -->
            <div class="current-project mt-3" id="current-project-info">
                <!-- محتوى المشروع الحالي -->
            </div>
        </div>
    </div>

    <!-- إضافة موذج المشروع -->
    <div class="modal fade" id="projectModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">إضافة مشروع جديد</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="projectForm">
                        <input type="hidden" id="projectId">
                        <div class="mb-3">
                            <label class="form-label">اسم المشروع</label>
                            <input type="text" class="form-control" id="projectName" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">الوصف</label>
                            <textarea class="form-control" id="projectDescription" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                    <button type="button" class="btn btn-primary" onclick="saveProject()">حفظ</button>
                </div>
            </div>
        </div>
    </div>

    <!-- المحتوى الرئيسي -->
    <main class="container">
        <!-- إجمالي تقدم المهام -->
        <div class="card mb-4">
            <div class="card-body">
                <h5 class="card-title mb-3">التقدم الإجمالي</h5>
                <div class="progress" style="height: 25px;">
                    <div class="progress-bar" role="progressbar" id="overall-progress" style="width: 0%">0%</div>
                </div>
            </div>
        </div>

        <!-- زر إضافة مهمة جديدة -->
        <div class="text-center mb-4">
            <button class="btn btn-primary btn-lg" onclick="showAddTaskModal()">
                <i class="fas fa-plus"></i> إضافة مهمة ديدة
            </button>
        </div>

        <!-- قائمة المهام -->
        <div id="tasks-list">
            <!-- سيتم إافة المهام هنا ديناميكياً -->
        </div>
    </main>

    <!-- الفوتر -->
    <footer class="app-footer">
        <div class="container">
            <div class="row">
                <div class="col-md-4">
                    <h5><i class="fas fa-chart-line"></i> إحصائيات سريعة</h5>
                    <ul class="footer-stats">
                        <li>
                            <i class="fas fa-tasks"></i> 
                            إجمالي المهام: <span id="footer-total" class="badge bg-primary">0</span>
                        </li>
                        <li>
                            <i class="fas fa-check"></i> 
                            المكتملة: <span id="footer-completed" class="badge bg-success">0</span>
                        </li>
                        <li>
                            <i class="fas fa-spinner"></i> 
                            قيد التنفيذ: <span id="footer-progress" class="badge bg-info">0</span>
                        </li>
                    </ul>
                </div>
                <div class="col-md-4 text-center">
                    <div class="footer-brand">
                        <i class="fas fa-tasks"></i>
                        <h5>نظام إدارة المهام</h5>
                        <p>جميع الحقوق محفوظة &copy; 2024</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="footer-actions">
                        <button class="btn btn-light" onclick="showAddTaskModal()">
                            <i class="fas fa-plus"></i> مهمة جديدة
                        </button>
                        <button class="btn btn-light" onclick="showStats()">
                            <i class="fas fa-chart-bar"></i> الإحصائيات
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </footer>

    <!-- نموذج إضافة/تعديل المهمة -->
    <div class="modal fade" id="taskModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">إضافة مهمة جديدة</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="taskForm">
                        <input type="hidden" id="taskId">
                        <div class="mb-3">
                            <label class="form-label">عنوان المهمة</label>
                            <input type="text" class="form-control" id="taskTitle" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">الوصف</label>
                            <textarea class="form-control" id="taskDescription" rows="3"></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">الحالة</label>
                            <select class="form-select" id="taskStatus">
                                <option value="pending">قيد الانتظار</option>
                                <option value="in-progress">قيد التنفيذ</option>
                                <option value="completed">مكتملة</option>
                                <option value="cancelled">ملغاة</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                    <button type="button" class="btn btn-primary" onclick="saveTask()">حفظ</button>
                </div>
            </div>
        </div>
    </div>

    <!-- نموذج المهام الفرعية -->
    <div class="modal fade" id="subtaskModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">المهام الفرعية</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">مهمة فرعية جديدة</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="newSubtaskTitle">
                            <button class="btn btn-primary" onclick="addSubtask()">إضافة</button>
                        </div>
                    </div>
                    <div id="subtasksList" class="list-group">
                        <!-- سيتم إضافة المهام الفرعية هن -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- نموذج التقارير -->
    <div class="modal fade" id="reportModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">إضافة تقرير جديد</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">محتوى التقرير</label>
                        <textarea id="reportContent"></textarea>
                    </div>
                    <button class="btn btn-primary" onclick="addReport()">إضافة تقرير</button>
                </div>
            </div>
        </div>
    </div>

    <!-- المكتبات JavaScript -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/toastr@2.1.4/build/toastr.min.js"></script>
    <script src="https://cdn.tiny.cloud/1/7e1mldkbut3yp4tyeob9lt5s57pb8wrb5fqbh11d6n782gm7/tinymce/7/tinymce.min.js" referrerpolicy="origin"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

    <!-- ملفات JavaScript الخاصة بالتطبيق -->
    <script src="assets/js/js.js"></script>
    <script src="assets/js/projects.js"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/subtasks.js"></script>
    <script src="assets/js/reports.js"></script>
    <script src="assets/js/export.js"></script>

    <!-- إضافة سكريبت لتحديث المعاينة -->
    <script>
    document.getElementById('pdfHeight').addEventListener('input', function() {
        document.getElementById('currentHeight').textContent = this.value;
    });
    </script>

    <!-- في نهاية الملف، قبل إغلاق body -->
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // تهيئة حقل الارتفاع
        const heightInput = document.getElementById('pdfHeight');
        const heightDisplay = document.getElementById('currentHeight');
        const exportBtn = document.querySelector('.export-btn');
        const toggleBtn = document.getElementById('toggleExportOptions');
        const exportPanel = document.getElementById('exportOptionsPanel');
        
        // تحميل حالة الإظهار/الإخفاء
        const isExportOptionsVisible = localStorage.getItem('exportOptionsVisible') !== 'false';
        if (!isExportOptionsVisible) {
            exportPanel.style.display = 'none';
            toggleBtn.classList.add('collapsed');
        }
        
        // إضافة معالج حدث للزر
        toggleBtn.addEventListener('click', function() {
            const isVisible = exportPanel.style.display !== 'none';
            exportPanel.style.display = isVisible ? 'none' : 'block';
            toggleBtn.classList.toggle('collapsed');
            
            // حفظ الحالة
            localStorage.setItem('exportOptionsVisible', (!isVisible).toString());
        });
        
        if (heightInput && heightDisplay) {
            // تحميل القيمة المحفوظة
            const savedHeight = localStorage.getItem('pdfPageHeight') || '1500';
            heightInput.value = savedHeight;
            heightDisplay.textContent = savedHeight;
            
            // تحديث القيمة عند التغيير
            heightInput.addEventListener('input', function() {
                const value = this.value;
                heightDisplay.textContent = value;
                localStorage.setItem('pdfPageHeight', value);
                
                // تحديث تكوين التصدير
                if (window.ExportManager) {
                    window.ExportManager.config.jsPDF.format[1] = parseInt(value);
                }
            });
        }
        
        // تحديث معرف المشروع في زر التصدير
        function updateExportButton(projectId) {
            if (exportBtn) {
                exportBtn.setAttribute('data-project-id', projectId || '');
            }
        }
        
        // إضافة للكود الموجود للتعامل مع تحديث المشروع الحالي
        window.addEventListener('projectChanged', function(e) {
            if (e.detail && e.detail.projectId) {
                updateExportButton(e.detail.projectId);
            }
        });
    });
    </script>
</body>
</html> 