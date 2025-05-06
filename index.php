<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تطبيق إدارة المهام PWA</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#1976d2">
  <link rel="manifest" href="data:application/json,{&quot;short_name&quot;:&quot;مهامي&quot;,&quot;name&quot;:&quot;تطبيق إدارة المهام&quot;,&quot;icons&quot;:[{&quot;src&quot;:&quot;https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4c3.svg&quot;,&quot;sizes&quot;:&quot;192x192&quot;,&quot;type&quot;:&quot;image/svg+xml&quot;}],&quot;start_url&quot;:&quot;.&quot;,&quot;display&quot;:&quot;standalone&quot;,&quot;background_color&quot;:&quot;#f4f6fa&quot;,&quot;theme_color&quot;:&quot;#1976d2&quot;}">
  <link rel="icon" href="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4c3.svg">
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/toastify-js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="https://cdn.tiny.cloud/1/7e1mldkbut3yp4tyeob9lt5s57pb8wrb5fqbh11d6n782gm7/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
  <style>
    body { font-family:'Cairo', sans-serif; background: #f4f6fa;}
    [dir="rtl"] .material-shadow { box-shadow: 0 6px 16px 0 rgba(33,33,33,0.15);}
    .no-scrollbar::-webkit-scrollbar {display: none;}
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none;}
    .task-row.sortable-ghost { background: #d8eefa;}
    .task-row.sortable-chosen { background: #fffbe7;}
    .material-card { background: #fff; border-radius: 16px; box-shadow: 0 2px 8px 0 #e0e3ea;}
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0;}
    input[type=number] { -moz-appearance:textfield;}
    .dot { width:14px; height:14px; border-radius:50%; display:inline-block; margin-left:4px;}
    .svg-icon { width: 1.25em; height: 1.25em; vertical-align: -0.125em;}
    .tag {font-size: .90em; background: #ebf0f7; display:inline-block; padding:.18em .7em; border-radius:20px; margin-inline:2px;}
    .fav-yes {color:#f99c24;}
    .task-done { text-decoration: line-through; opacity: 0.8; }
    
    /* تحسينات تصميم الجدول */
    .tasks-table {
      --header-bg-from: #2563eb;
      --header-bg-to: #1d4ed8;
      --header-text: #ffffff;
      --footer-bg-from: #f1f5f9;
      --footer-bg-to: #e2e8f0;
      --row-hover: #f0f9ff;
      --border-color: #e5e7eb;
    }
    
    .tasks-table thead {
      background: linear-gradient(to left, var(--header-bg-from), var(--header-bg-to)) !important;
      color: var(--header-text);
      position: relative;
    }
    
    .tasks-table thead::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(to bottom, rgba(0,0,0,0.1), transparent);
    }
    
    .tasks-table thead th {
      font-weight: 700;
      text-shadow: 1px 1px 1px rgba(0,0,0,0.2);
      padding: 1rem !important;
      border: none !important;
    }
    
    .tasks-table tbody tr {
      transition: all 0.2s ease;
    }
    
    .tasks-table tbody tr:hover {
      background: var(--row-hover);
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .tasks-table tbody td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    
    .tasks-table tfoot {
      background: linear-gradient(to left, var(--footer-bg-from), var(--footer-bg-to));
      font-weight: 600;
    }
    
    .tasks-table tfoot td {
      padding: 0.75rem 1rem;
    }
    
    /* تحسين أزرار العمليات */
    .table-actions button {
      transition: all 0.2s ease;
      transform-origin: center;
    }
    
    .table-actions button:hover {
      transform: scale(1.05);
    }
    
    .table-actions button:active {
      transform: scale(0.95);
    }
    
    @media (max-width:690px) {
      html {font-size: 15px;}
      .flex-wrap-responsive { flex-wrap: wrap;}
      .card-responsive { min-width:unset; width:100vw;}
      .hide-on-mobile {display:none;}
      table thead, table tbody, table tr, table td, table th { font-size:14px !important;}
    }
    .tox-tinymce {
      border-radius: 0.5rem !important;
      border-color: #e5e7eb !important;
    }
    .note-content {
      white-space: pre-wrap;
      word-break: break-word;
    }
    .note-content img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body class="text-gray-800">

<header class="w-full bg-gradient-to-tr from-blue-700 to-indigo-700 text-white py-6 px-3 shadow-lg material-shadow print:hidden">
  <div class="container mx-auto flex items-center justify-between">
    <div class="flex items-center space-x-3 space-x-reverse">
      <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4c3.svg" alt="مهام" class="w-10 h-10 mr-2">
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">إدارة المهام</h1>
    </div>
    <span class="text-lg font-semibold hidden sm:inline">كل مشاريعك، مهامك، حالاتك في مكان واحد</span>
  </div>
</header>

<main class="container mx-auto px-2 pt-4 pb-10">
  <section class="w-full flex flex-col gap-5">
    <!-- Filter & Stats panel (Top) -->
    <div class="w-full flex flex-col md:flex-row gap-5">
      <div class="w-full md:w-1/4 flex flex-col gap-6">
        <!-- Current Project, Section, Filter -->
        <div class="material-card p-5 flex flex-col space-y-4">
          <div>
            <label class="block text-sm mb-1 font-bold">المشروع</label>
            <select id="filterProject" class="block w-full px-3 py-2 rounded shadow border-gray-300 focus:ring focus:ring-blue-100 text-base">
              <option value="">جميع المشاريع</option>
            </select>
          </div>
          <div>
            <label class="block text-sm mb-1 font-bold">الحالة</label>
            <select id="filterStatus" class="block w-full px-3 py-2 rounded shadow border-gray-300 focus:ring focus:ring-blue-100 text-base">
              <option value="">كل الحالات</option>
            </select>
          </div>
          <div class="flex gap-2">
            <label class="flex gap-2 items-center text-sm font-bold"><input type="checkbox" id="filterFav"> مفضلة</label>
            <label class="flex gap-2 items-center text-sm font-bold"><input type="checkbox" id="filterArchived"> مؤرشفة</label>
          </div>
          <div>
            <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 mt-2 rounded w-full font-bold" onclick="openAddTaskModal()">+ إضافة مهمة</button>
            <button class="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-4 py-2 mt-2 rounded w-full font-bold" onclick="openAddMultiTaskModal()">+ إضافة مهام متعددة</button>
          </div>
        </div>
        <!-- Statistics -->
        <div class="material-card py-4 px-3">
          <div class="flex items-center justify-between mb-5">
            <div class="font-bold text-lg">إحصائيات المشروع</div>
          </div>
          <div>
            <canvas id="statsChart" height="100"></canvas>
          </div>
          <div class="mt-3 text-sm">
            <span>المهام النشطة: <span id="activeTasks">0</span></span> | 
            <span>مؤرشفة: <span id="archivedTasks">0</span></span>
          </div>
        </div>
        <!-- Management -->
        <div class="material-card p-4">
          <div class="flex flex-col gap-3">
            <button onclick="exportDB()" class="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded w-full font-bold"><i class="fas fa-file-export ml-2"></i>حفظ قاعدة البيانات</button>
            <button onclick="importDB()" class="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded w-full font-bold"><i class="fas fa-file-import ml-2"></i>استيراد قاعدة البيانات</button>
            <button onclick="deleteAllData()" class="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded w-full font-bold"><i class="fas fa-trash ml-2"></i>حذف كل المهام والمشاريع</button>
          </div>
        </div>
        <!-- Statuses Management -->
        <div class="material-card p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="font-bold text-base">الحالات</span>
            <button onclick="openAddStatusModal()" class="text-blue-600 hover:text-blue-800 text-lg" title="إضافة حالة جديدة"><i class="fas fa-plus-circle"></i></button>
          </div>
          <div id="statusesList" class="flex flex-wrap gap-2 mb-1"></div>
          <small class="text-gray-400">يرجى ملاحظة أن حذف أو تعديل الحالات الافتراضية غير متاح.</small>
        </div>
      </div>
      <!-- Main task board-->
      <div class="w-full md:w-3/4 flex flex-col">
        <!-- Project header and progress-->
        <div class="material-card p-6 mb-4">
          <div class="flex flex-wrap-responsive items-center justify-between mb-2">
            <div class="font-bold text-xl">
              <span id="currentProjectName">كل المشاريع</span>
              <span class="text-base text-gray-400" id="currentProjectStats"></span>
            </div>
            <button onclick="openAddProjectModal()" class="bg-blue-100 hover:bg-blue-200 text-blue-800 rounded px-3 py-2 font-bold text-md"><i class="fas fa-plus-circle ml-1"></i>إضافة مشروع</button>
          </div>
          <div class="flex items-center mt-4 mb-1">
            <span class="mr-2 font-semibold text-sm">إنجاز المشروع</span>
            <div class="w-full mr-3">
              <div class="w-full bg-gray-200 rounded-full h-4">
                <div id="progressBar" class="h-4 rounded-full bg-gradient-to-l from-green-400 to-blue-500 transition-all duration-500" style="width:0%"></div>
              </div>
            </div>
            <span id="progressValue" class="ml-2 text-sm font-bold text-green-700">0%</span>
          </div>
        </div>
        <!-- TASKS TABLE + Actions-->
        <div class="material-card p-4" id="taskBoardWrap">
          <div class="mb-3 flex flex-wrap items-center gap-2 table-actions">
              <button onclick="archiveOnes()" class="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded px-3 py-2 text-sm font-bold transition-all duration-200 hover:shadow-md" title="الأرشفة السريعة">
                <i class="fas fa-archive text-purple-600"></i>
                <span>أرشفة المحددات</span>
              </button>
              <button onclick="favOnes()" class="flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded px-3 py-2 text-sm font-bold transition-all duration-200 hover:shadow-md" title="مفضلة">
                <i class="fas fa-star text-yellow-500"></i>
                <span>تمييز كمفضلة</span>
              </button>
              <button onclick="deleteOnes()" class="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-800 rounded px-3 py-2 text-sm font-bold transition-all duration-200 hover:shadow-md">
                <i class="fas fa-trash text-red-500"></i>
                <span>حذف المحددات</span>
              </button>
              <button onclick="copyTasksToClipboard()" class="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded px-3 py-2 text-sm font-bold transition-all duration-200 hover:shadow-md" title="نسخ المهام إلى الحافظة">
                <i class="fas fa-clipboard text-indigo-500"></i>
                <span>نسخ إلى الحافظة</span>
              </button>
              <span id="tableMsg" class="ml-auto text-gray-500 text-sm"></span>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-300 text-right border border-gray-200 rounded-xl overflow-hidden shadow-sm tasks-table">
              <thead>
                <tr class="text-base">
                  <th class="py-2 px-3"><input type="checkbox" id="selectAllTasks" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"></th>
                  <th class="py-2 px-3">المهمة</th>
                  <th class="py-2 px-3">الحالة</th>
                  <th class="py-2 px-3">القسم</th>
                  <th class="py-2 px-3">المشروع</th>
                  <th class="py-2 px-3">عمليات</th>
                </tr>
              </thead>
              <tbody id="tasksTable" class="divide-y divide-gray-100 bg-white">
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="6" class="text-center">
                    <div class="flex justify-between items-center">
                      <span>إجمالي المهام: <strong id="totalTasksCount">0</strong></span>
                      <span>المهام المنجزة: <strong id="completedTasksCount">0</strong></span>
                      <span>نسبة الإنجاز: <strong id="completionRate">0%</strong></span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <!-- Archive/Favorites quick filter box -->
        <div class="material-card p-4 mt-4">
          <div class="flex flex-wrap gap-3 items-center">
            <span class="font-bold text-base ml-2">فلترة متقدمة:</span>
            <button onclick="showOnly('all')" class="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-all duration-200 hover:shadow-md">
              <i class="fas fa-tasks text-blue-600"></i>
              <span>كل المهام</span>
            </button>
            <button onclick="showOnly('archived')" class="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded transition-all duration-200 hover:shadow-md">
              <i class="fas fa-archive text-purple-600"></i>
              <span>المهام المؤرشفة</span>
            </button>
            <button onclick="showOnly('favorite')" class="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded transition-all duration-200 hover:shadow-md">
              <i class="fas fa-star text-yellow-500"></i>
              <span>المهام المفضلة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

<!-- MODALS -->
<!-- Add/Edit Task Modal -->
<div id="taskModal" class="fixed z-30 inset-0 bg-black bg-opacity-40 flex items-center justify-center hidden">
  <div class="material-card p-6 max-w-lg w-full relative">
    <button class="absolute left-3 top-3 text-gray-400 hover:text-gray-800 text-xl" onclick="closeTaskModal()"><i class="fas fa-times"></i></button>
    <form id="taskForm" onsubmit="return saveTask(event)">
      <input type="hidden" id="taskId">
      <div class="mb-4">
        <label class="block mb-1 font-bold">عنوان المهمة</label>
        <input required type="text" id="taskTitle" class="w-full px-3 py-2 border border-gray-200 rounded mt-1 focus:ring focus:ring-blue-100">
      </div>
      <div class="mb-4">
        <label class="block mb-1 font-bold">المشروع</label>
        <select id="taskProject" required class="w-full px-3 py-2 border border-gray-200 rounded mt-1 focus:ring focus:ring-blue-100" onchange="updateSectionsList()">
          <option value="">اختر المشروع</option>
        </select>
      </div>
      <div class="mb-4">
        <label class="block mb-1 font-bold">القسم</label>
        <div class="flex gap-2">
          <select id="taskSection" class="flex-1 px-3 py-2 border border-gray-200 rounded mt-1 focus:ring focus:ring-blue-100">
            <option value="">بدون قسم</option>
          </select>
          <button type="button" onclick="quickAddSection()" class="mt-1 bg-green-100 hover:bg-green-200 text-green-800 px-3 rounded" title="إضافة قسم جديد"><i class="fas fa-plus"></i></button>
        </div>
      </div>
      <div class="mb-4">
        <label class="block mb-1 font-bold">الحالة</label>
        <select id="taskStatus" required class="w-full px-3 py-2 border border-gray-200 rounded mt-1 focus:ring focus:ring-blue-100"></select>
      </div>
      <div class="flex items-center gap-4 mt-3">
        <label class="flex items-center gap-2 font-bold"><input type="checkbox" id="taskFavorite"> مفضلة</label>
      </div>
      <div class="flex mt-6 gap-3">
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-7 rounded font-bold">حفظ</button>
        <button type="button" onclick="closeTaskModal()" class="bg-gray-100 hover:bg-gray-300 text-gray-700 py-2 px-6 rounded">إلغاء</button>
      </div>
    </form>
  </div>
</div>

<!-- Add Multiple Tasks -->
<div id="multiTaskModal" class="fixed z-30 inset-0 bg-black bg-opacity-40 flex items-center justify-center hidden">
  <div class="material-card p-5 max-w-xl w-full relative">
    <button class="absolute left-3 top-3 text-gray-400 hover:text-gray-800 text-xl" onclick="closeMultiTaskModal()"><i class="fas fa-times"></i></button>
    <form id="multiTaskForm" onsubmit="return saveMultiTasks(event)">
      <div class="mb-4">
        <label class="block mb-2 font-bold">المهام الجديدة (ضع كل مهمة في سطر منفصل)</label>
        <textarea required class="w-full px-3 py-2 border border-gray-200 rounded min-h-[130px] focus:ring focus:ring-blue-100" id="multiTasksInput"></textarea>
      </div>
      <div class="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block mb-1 font-bold">المشروع</label>
          <select id="multiTaskProject" required class="w-full px-3 py-2 border border-gray-200 rounded mt-1 focus:ring focus:ring-blue-100"></select>
        </div>
        <div>
          <label class="block mb-1 font-bold">الحالة</label>
          <select id="multiTaskStatus" required class="w-full px-3 py-2 border border-gray-200 rounded mt-1 focus:ring focus:ring-blue-100"></select>
        </div>
      </div>
      <div class="flex mt-6 gap-3">
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-7 rounded font-bold">إضافة الكل</button>
        <button type="button" onclick="closeMultiTaskModal()" class="bg-gray-100 hover:bg-gray-300 text-gray-700 py-2 px-6 rounded">إلغاء</button>
      </div>
    </form>
  </div>
</div>

<!-- Add Project Modal -->
<div id="projectModal" class="fixed z-30 inset-0 bg-black bg-opacity-40 flex items-center justify-center hidden">
  <div class="material-card p-5 max-w-md w-full relative">
    <button class="absolute left-3 top-3 text-gray-400 hover:text-gray-800 text-xl" onclick="closeProjectModal()"><i class="fas fa-times"></i></button>
    <form id="projectForm" onsubmit="return saveProject(event)">
      <input type="hidden" id="projectId">
      <div class="mb-3">
        <label class="block mb-1 font-bold">اسم المشروع</label>
        <input required type="text" id="projectName" class="w-full px-3 py-2 border border-gray-200 rounded mt-1 focus:ring focus:ring-blue-100">
      </div>
      <div class="mb-3">
        <label class="block mb-1 font-bold">الوصف (اختياري)</label>
        <input type="text" id="projectDesc" class="w-full px-3 py-2 border border-gray-200 rounded mt-1 focus:ring focus:ring-blue-100">
      </div>
      <div class="flex mt-6 gap-3">
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-7 rounded font-bold">حفظ</button>
        <button type="button" onclick="closeProjectModal()" class="bg-gray-100 hover:bg-gray-300 text-gray-700 py-2 px-6 rounded">إلغاء</button>
      </div>
    </form>
  </div>
</div>

<!-- Add Status Modal -->
<div id="statusModal" class="fixed z-30 inset-0 bg-black bg-opacity-40 flex items-center justify-center hidden">
  <div class="material-card p-5 max-w-md w-full relative">
    <button class="absolute left-3 top-3 text-gray-400 hover:text-gray-800 text-xl" onclick="closeStatusModal()"><i class="fas fa-times"></i></button>
    <form id="statusForm" onsubmit="return saveStatus(event)">
      <input type="hidden" id="statusId">
      <div class="mb-3">
        <label class="block mb-1 font-bold">اسم الحالة</label>
        <input required type="text" id="statusName" class="w-full px-3 py-2 border border-gray-200 rounded mt-1 focus:ring focus:ring-blue-100">
      </div>
      <div class="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label class="block mb-1 font-bold">لون النص</label>
          <input type="color" id="statusTextColor" class="w-full h-10 rounded">
        </div>
        <div> 
          <label class="block mb-1 font-bold">لون الخلفية</label>
          <input type="color" id="statusBgColor" class="w-full h-10 rounded">
        </div>
      </div>
      <div class="flex mt-6 gap-3">
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-7 rounded font-bold">إضافة</button>
        <button type="button" onclick="closeStatusModal()" class="bg-gray-100 hover:bg-gray-300 text-gray-700 py-2 px-6 rounded">إلغاء</button>
      </div>
    </form>
  </div>
</div>

<!-- Add Section Modal -->
<div id="sectionModal" class="fixed z-30 inset-0 bg-black bg-opacity-40 flex items-center justify-center hidden">
  <div class="material-card p-5 max-w-md w-full relative">
    <button class="absolute left-3 top-3 text-gray-400 hover:text-gray-800 text-xl" onclick="closeSectionModal()"><i class="fas fa-times"></i></button>
    <form id="sectionForm" onsubmit="return saveSection(event)">
      <input type="hidden" id="sectionId">
      <div class="mb-3">
        <label class="block mb-1 font-bold">اسم القسم</label>
        <input required type="text" id="sectionName" class="w-full px-3 py-2 border border-gray-200 rounded mt-1 focus:ring focus:ring-blue-100">
      </div>
      <div class="mb-3">
        <label class="block mb-1 font-bold">المشروع</label>
        <select required id="sectionProject" class="w-full px-3 py-2 border border-gray-200 rounded mt-1 focus:ring focus:ring-blue-100"></select>
      </div>
      <div class="flex mt-6 gap-3">
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-7 rounded font-bold">حفظ</button>
        <button type="button" onclick="closeSectionModal()" class="bg-gray-100 hover:bg-gray-300 text-gray-700 py-2 px-6 rounded">إلغاء</button>
      </div>
    </form>
  </div>
</div>

<!-- Copy Tasks Modal -->
<div id="copyTasksModal" class="fixed z-30 inset-0 bg-black bg-opacity-40 flex items-center justify-center hidden">
  <div class="material-card p-5 max-w-md w-full relative">
    <button class="absolute left-3 top-3 text-gray-400 hover:text-gray-800 text-xl" onclick="closeCopyTasksModal()"><i class="fas fa-times"></i></button>
    <h3 class="text-xl font-bold mb-4">نسخ المهام</h3>
    <div class="mb-4">
      <label class="block mb-2 font-bold">المشروع المستهدف</label>
      <select id="copyTasksProject" class="w-full px-3 py-2 border border-gray-200 rounded"></select>
    </div>
    <div class="flex gap-3">
      <button onclick="copyTasks()" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-bold">نسخ المهام</button>
      <button onclick="closeCopyTasksModal()" class="bg-gray-100 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded">إلغاء</button>
    </div>
  </div>
</div>

<!-- Quick Add Section Modal -->
<div id="quickSectionModal" class="fixed z-40 inset-0 bg-black bg-opacity-40 flex items-center justify-center hidden">
  <div class="material-card p-5 max-w-md w-full relative">
    <button class="absolute left-3 top-3 text-gray-400 hover:text-gray-800 text-xl" onclick="closeQuickSectionModal()"><i class="fas fa-times"></i></button>
    <form id="quickSectionForm" onsubmit="return saveQuickSection(event)">
      <div class="mb-3">
        <label class="block mb-1 font-bold">اسم القسم الجديد</label>
        <input required type="text" id="quickSectionName" class="w-full px-3 py-2 border border-gray-200 rounded mt-1 focus:ring focus:ring-blue-100">
      </div>
      <div class="flex mt-6 gap-3">
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-7 rounded font-bold">إضافة</button>
        <button type="button" onclick="closeQuickSectionModal()" class="bg-gray-100 hover:bg-gray-300 text-gray-700 py-2 px-6 rounded">إلغاء</button>
      </div>
    </form>
  </div>
</div>

<!-- Task Notes Modal -->
<div id="taskNotesModal" class="fixed z-40 inset-0 bg-black bg-opacity-40 flex items-center justify-center hidden">
  <div class="material-card p-5 max-w-2xl w-full relative">
    <button class="absolute left-3 top-3 text-gray-400 hover:text-gray-800 text-xl" onclick="closeTaskNotesModal()"><i class="fas fa-times"></i></button>
    <h3 class="text-xl font-bold mb-4">ملاحظات المهمة</h3>
    <div id="notesList" class="mb-4 max-h-60 overflow-y-auto"></div>
    <form id="addNoteForm" onsubmit="return addTaskNote(event)">
      <div class="mb-2">
        <label class="block mb-1 font-bold">نوع الملاحظة</label>
        <select id="noteType" class="w-full px-2 py-1 border rounded" onchange="updateNoteInputType()">
          <option value="text">نص</option>
          <option value="link">رابط</option>
          <option value="image">سكرين شوت</option>
        </select>
      </div>
      <div class="mb-2" id="noteInputWrap">
        <!-- سيتم توليد المحرر المناسب هنا -->
      </div>
      <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded font-bold">إضافة ملاحظة</button>
    </form>
    <div id="noteImagePreview" class="mt-2"></div>
  </div>
</div>

<input type="file" id="dbFileInput" class="hidden" accept=".json">

<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"></script>
<script>
// ============ DATABASE ===========================
// Database keys & defaults
const DB_TASKS_KEY = 'taskManager.tasks';
const DB_PROJECTS_KEY = 'taskManager.projects';
const DB_STATUS_KEY = 'taskManager.statuses';
const DB_SECTIONS_KEY = 'taskManager.sections';
const DB_PREFS_KEY = 'taskManager.prefs';

// الوضع الافتراضي للحالات
const DEFAULT_STATUSES = [
  { id:'todo',      name:'قيد الانتظار', text:'#ffffff', bg:'#f59e42', fixed:true },
  { id:'inprogress',name:'قيد التنفيذ',  text:'#ffffff', bg:'#439aff', fixed:true },
  { id:'done',      name:'منجز',         text:'#ffffff', bg:'#43f566', fixed:true },
];

// المتغيرات الرئيسية
let tasks = [];
let projects = [];
let statuses = [];
let sections = [];

let filter = {
  projectId: "",
  statusId: "",
  favorite: false,
  archived: false,
  only: "all" // all|archived|favorite
};

/**
 * تحميل قواعد البيانات من التخزين المحلي
 */
function loadDB() {
  tasks = JSON.parse(localStorage.getItem(DB_TASKS_KEY) || '[]');
  projects = JSON.parse(localStorage.getItem(DB_PROJECTS_KEY) || '[]');
  statuses = JSON.parse(localStorage.getItem(DB_STATUS_KEY) || '[]');
  sections = JSON.parse(localStorage.getItem(DB_SECTIONS_KEY) || '[]');
  if (statuses.length === 0) statuses = DEFAULT_STATUSES.slice();
  try {
    filter = {...filter, ...JSON.parse(localStorage.getItem(DB_PREFS_KEY)||'{}')}
  } catch{};
}

/**
 * حفظ كل بيانات التطبيق في التخزين المحلي
 */
function saveDB() {
  localStorage.setItem(DB_TASKS_KEY, JSON.stringify(tasks));
  localStorage.setItem(DB_PROJECTS_KEY, JSON.stringify(projects));
  localStorage.setItem(DB_STATUS_KEY, JSON.stringify(statuses));
  localStorage.setItem(DB_SECTIONS_KEY, JSON.stringify(sections));
  localStorage.setItem(DB_PREFS_KEY, JSON.stringify({projectId:filter.projectId, statusId:filter.statusId, favorite:filter.favorite, archived:filter.archived, only:filter.only}));
}

// ================= يعتبر هذا القسم المنطق المركزي للفلاتر
/**
 * ترشيح المهام
 * @returns {Array} قائمة المهام بعد الترشيح
 */
function filterTasks() {
  let filtered = tasks;
  if(filter.only==="archived") filtered = filtered.filter(t=>t.archived);
  if(filter.only==="favorite") filtered = filtered.filter(t=>t.favorite);
  if(filter.projectId) filtered = filtered.filter(t=>t.projectId===filter.projectId);
  if(filter.statusId) filtered = filtered.filter(t=>t.statusId===filter.statusId);
  if(filter.only==="all") {
    if(filter.archived) filtered = filtered.filter(t=>t.archived);
    else if(!filter.archived) filtered = filtered.filter(t=>!t.archived);
    if(filter.favorite) filtered = filtered.filter(t=>t.favorite);
  }
  return filtered.sort((a,b)=>a.sortOrder-b.sortOrder);
}

/**
 * حفظ وتجديد الشاشة
 */
function saveAndRefresh() {
  saveDB();
  refreshAll();
}

/**
 * تجديد جميع الواجهات والعناصر
 */
function refreshAll() {
  renderProjectsSelect();
  renderStatusSelect();
  renderTaskTable();
  renderStatsChart();
  renderStatuses();
  renderProjectStats();
  updateTableFooter();
}

/**
 * عرض المشاريع في خيارات الفلترة / النماذج
 */
function renderProjectsSelect() {
  let selects = [document.getElementById('filterProject'),document.getElementById('taskProject'),document.getElementById('multiTaskProject'),document.getElementById('sectionProject')];
  selects.forEach(sel=>{
    if(!sel) return;
    let pid = (filter.projectId||"");
    let val = sel.value;
    
    if(projects.length === 0) {
      sel.innerHTML = '<option value="">لا توجد مشاريع - أضف مشروع أولاً</option>';
    } else {
      sel.innerHTML = `<option value="">اختر المشروع</option>` + 
        projects.map(p=>`<option value="${p.id}" ${p.id===val?'selected':''}>${p.name}</option>`).join('');
    }
    sel.value = val||pid;
  });
}

/**
 * عرض الحالات في الفلاتر / النماذج
 */
function renderStatusSelect() {
  let selects = [document.getElementById('filterStatus'), document.getElementById('taskStatus'), document.getElementById('multiTaskStatus')];
  selects.forEach(sel => {
    if (!sel) return;
    let sid = (filter.statusId||"");
    let val = sel.value;
    sel.innerHTML = `<option value="">كل الحالات</option>` +
      statuses.map(s=>`<option value="${s.id}" style="color:${s.text}; background:${s.bg}">${s.name}</option>`).join('');
    sel.value = val||sid;
  });
}

/**
 * عرض الجدول الرئيسي للمهام
 */
function renderTaskTable() {
  let tbody = document.getElementById('tasksTable');
  let filtered = filterTasks();
  let html = '';
  if(filtered.length===0) {
    document.getElementById('tableMsg').innerText = 'لا توجد مهام بهذه الفلترة';
  } else {
    document.getElementById('tableMsg').innerText = '';
  }
  for(let t of filtered) {
    let prj = projects.find(p=>p.id===t.projectId);
    let stat = statuses.find(s=>s.id===t.statusId);
    let isDone = t.statusId === 'done';
    html += `
      <tr class="task-row transition-all duration-75 hover:bg-blue-50 select-none ${isDone ? 'task-done' : ''} cursor-pointer" 
          data-id="${t.id}" 
          draggable="true"
          onclick="toggleTaskStatus('${t.id}')">
        <td class="py-2 px-3" onclick="event.stopPropagation()"><input type="checkbox" class="selectTask" data-id="${t.id}"></td>
        <td class="py-2 px-3">
          <span class="font-bold">${t.title}</span>
          ${t.favorite?'<i class="fas fa-star fav-yes mr-1" aria-label="مفضلة" title="مفضلة"></i>':''}
          ${t.archived?'<i class="fas fa-archive text-gray-400 ml-2" aria-label="مؤرشفة" title="مؤرشفة"></i>':''}
        </td>
        <td class="py-2 px-3">
          <span class="tag" style="background:${stat?.bg};color:${stat?.text};font-weight:700;">${stat?.name||'-'}</span>
        </td>
        <td class="py-2 px-3">${t.section||'-'}</td>
        <td class="py-2 px-3">
          <span class="text-blue-900">${prj?.name||'بدون مشروع'}</span>
        </td>
        <td class="py-2 px-3 flex flex-wrap justify-end gap-2" onclick="event.stopPropagation()">
          <button title="تعديل" class="px-2 py-1 text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded transition-colors" onclick="openEditTask('${t.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button title="ملاحظات" class="px-2 py-1 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100 rounded transition-colors" onclick="openTaskNotesModal('${t.id}')">
            <i class="fas fa-sticky-note"></i>
          </button>
          <button title="أرشفة/إظهار" class="px-2 py-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors" onclick="toggleArchiveTask('${t.id}')">
            <i class="fas fa-box-archive"></i>
          </button>
          <button title="مفضلة" class="px-2 py-1 ${t.favorite?'text-yellow-400':'text-gray-500'} hover:text-yellow-600 hover:bg-yellow-100 rounded transition-colors" onclick="toggleFavTask('${t.id}')">
            <i class="fas fa-star"></i>
          </button>
          <button title="حذف" class="px-2 py-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded transition-colors" onclick="deleteTask('${t.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>`;
  }
  tbody.innerHTML = html;
  // Connect Sortable for drag & drop!
  if(filtered.length>1) {
    if(window.taskTableSortable) window.taskTableSortable.destroy();
    window.taskTableSortable = Sortable.create(tbody, {
      handle: '.task-row',
      animation: 200,
      ghostClass: 'sortable-ghost',
      onEnd: function(evt) {
        reorderTasks(filtered, evt.oldIndex, evt.newIndex);
      }
    });
  }
  // Select all/check all logic
  let selectAll = document.getElementById('selectAllTasks');
  selectAll.checked = false;
  selectAll.onchange = ()=>{
    document.querySelectorAll('.selectTask').forEach(chk=>{chk.checked=selectAll.checked})
  }
}

/**
 * عرض وتجديد الرسم البياني للإحصائيات
 */
function renderStatsChart() {
  let currentTasks = tasks.filter(t=>!t.archived && (!filter.projectId||t.projectId===filter.projectId));
  let data = {};
  statuses.forEach(s=>{data[s.id]=0});
  for(let t of currentTasks) if(data[t.statusId]!==undefined) data[t.statusId]++;
  let ctx = document.getElementById('statsChart').getContext('2d');
  if(window.statsChartObj) window.statsChartObj.destroy();
  window.statsChartObj = new Chart(ctx, {
    type:'doughnut',
    data: {
      labels: statuses.map(s=>s.name),
      datasets: [{
        data: statuses.map(s=>data[s.id]),
        backgroundColor: statuses.map(s=>s.bg),
        borderColor: statuses.map(s=>s.text),
        borderWidth: 2
      }]
    },
    options: {responsive:true, cutout: "70%", plugins: {legend: {rtl:true, position:'bottom', labels: {font:{family:'Cairo'}}}},
      animation:false}
  });
  document.getElementById('activeTasks').innerText = tasks.filter(t=>!t.archived).length;
  document.getElementById('archivedTasks').innerText = tasks.filter(t=>t.archived).length;
}

/**
 * عرض قائمة الحالات
 */
function renderStatuses() {
  let sDiv = document.getElementById('statusesList');
  sDiv.innerHTML = statuses.map(st=>`
    <span class="tag group" style="background:${st.bg};color:${st.text};font-weight:900;min-width:80px;">
      <span>${st.name}</span>
      ${!st.fixed?`
        <button onclick="deleteStatus('${st.id}')" class="ml-1 text-sm text-red-700 hover:text-red-900 align-middle"><i class="fas fa-trash"></i></button>
      `:''}
    </span>
  `).join('');
}

/**
 * عرض معلومات المشروع الحالي وإحصاءات التقدم
 */
function renderProjectStats() {
  let currProj = projects.find(p=>p.id===filter.projectId);
  let nameSpan = document.getElementById('currentProjectName');
  nameSpan.textContent = currProj?currProj.name:'كل المشاريع';
  document.getElementById('currentProjectStats').textContent = currProj?`(${tasks.filter(t=>t.projectId===currProj.id).length} مهام)`:'';
  // Progress
  let tks = tasks.filter(t=>!t.archived && (!currProj||t.projectId===currProj?.id));
  let total = tks.length||1, done = tks.filter(t=>t.statusId==='done').length;
  let percent = Math.round((done/total)*100);
  document.getElementById('progressBar').style.width = percent+'%';
  document.getElementById('progressValue').textContent = percent+"%";
}

/**
 * تحديث إحصائيات الفوتر في الجدول
 */
function updateTableFooter() {
  const filtered = filterTasks();
  const total = filtered.length;
  const completed = filtered.filter(t => t.statusId === 'done').length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  document.getElementById('totalTasksCount').textContent = total;
  document.getElementById('completedTasksCount').textContent = completed;
  document.getElementById('completionRate').textContent = rate + '%';
}

// ================== Tasks OPS =======================

function openAddTaskModal() {
  document.getElementById('taskForm').reset();
  document.getElementById('taskId').value = '';
  document.getElementById('taskModal').classList.remove('hidden');
  renderProjectsSelect();
  renderStatusSelect();
  updateSectionsList();
}
function closeTaskModal() {
  document.getElementById('taskModal').classList.add('hidden');
}

/**
 * حفظ أو تعديل مهمة واحدة (form)
 */
function saveTask(event) {
  event.preventDefault();
  let id = document.getElementById('taskId').value;
  let title = document.getElementById('taskTitle').value.trim();
  let section = document.getElementById('taskSection').value.trim();
  let projectId = document.getElementById('taskProject').value;
  let statusId = document.getElementById('taskStatus').value;
  let favorite = document.getElementById('taskFavorite').checked;
  let d = Date.now();
  if(!projectId || !statusId) return false;
  if(id) {
    let t = tasks.find(t=>t.id===id);
    t.title = title; t.section = section;
    t.projectId = projectId; t.statusId = statusId;
    t.favorite = favorite;
    if (!t.notes) t.notes = [];
  } else {
    let sortOrder = tasks.length?Math.max(...tasks.map(tt=>tt.sortOrder||0))+1:1;
    tasks.push({id:randomId(),title,section,projectId,statusId,favorite,archived:false,created:d,sortOrder, notes:[]});
  }
  saveAndRefresh();
  closeTaskModal();
  return false;
}

/**
 * فتح النموذج لتعديل مهمة
 * @param {string} id معرف المهمة
 */
function openEditTask(id) {
  let t = tasks.find(t=>t.id===id);
  if(!t) return;
  document.getElementById('taskId').value = t.id;
  document.getElementById('taskTitle').value = t.title;
  document.getElementById('taskSection').value = t.section||"";
  document.getElementById('taskProject').value = t.projectId;
  document.getElementById('taskStatus').value = t.statusId;
  document.getElementById('taskFavorite').checked = t.favorite;
  document.getElementById('taskModal').classList.remove('hidden');
  renderProjectsSelect();
  renderStatusSelect();
  updateSectionsList();
}

function toggleArchiveTask(id) {
  let t = tasks.find(t=>t.id===id);
  t.archived = !t.archived;
  saveAndRefresh();
}

function toggleFavTask(id) {
  let t = tasks.find(t=>t.id===id);
  t.favorite = !t.favorite;
  saveAndRefresh();
}

function deleteTask(id) {
  Swal.fire({
    title: 'هل تريد حذف المهمة؟',
    text: "لا يمكن التراجع عن هذه العملية!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'نعم، احذف',
    cancelButtonText: 'إلغاء'
  }).then((result) => {
    if (result.isConfirmed) {
      tasks = tasks.filter(t=>t.id!==id);
      saveAndRefresh();
      Toastify({
        text: "تم حذف المهمة بنجاح",
        duration: 3000,
        gravity: "top",
        position: 'left',
        style: { background: "#22c55e" }
      }).showToast();
    }
  });
}

// =========== Multi Task ==============

function openAddMultiTaskModal() {
  document.getElementById('multiTaskForm').reset();
  document.getElementById('multiTaskModal').classList.remove('hidden');
  renderProjectsSelect();
  renderStatusSelect();
}
function closeMultiTaskModal() {
  document.getElementById('multiTaskModal').classList.add('hidden');
}
/**
 * إضافة عدة مهام دفعه واحدة
 */
function saveMultiTasks(e) {
  e.preventDefault();
  let lines = document.getElementById('multiTasksInput').value.split('\n').map(l=>l.trim()).filter(l=>l);
  let projectId = document.getElementById('multiTaskProject').value;
  let statusId = document.getElementById('multiTaskStatus').value;
  let sortOrder = tasks.length?Math.max(...tasks.map(tt=>tt.sortOrder||0))+1:1;
  for(let line of lines) {
    tasks.push({id:randomId(), title:line, section:"", projectId, statusId, favorite:false,archived:false,created:Date.now(),sortOrder:sortOrder++});
  }
  saveAndRefresh();
  closeMultiTaskModal();
  return false;
}

// ========== PROJECTS ======================

function openAddProjectModal() {
  document.getElementById('projectForm').reset();
  document.getElementById('projectId').value = "";
  document.getElementById('projectModal').classList.remove('hidden');
}
function closeProjectModal() {
  document.getElementById('projectModal').classList.add('hidden');
}

/**
 * حفظ أو تعديل مشروع
 */
function saveProject(e) {
  e.preventDefault();
  let id = document.getElementById('projectId').value;
  let name = document.getElementById('projectName').value.trim();
  let desc = document.getElementById('projectDesc').value.trim();
  if(!name) return false;
  if(id) {
    let p = projects.find(p=>p.id===id);
    p.name = name; p.desc = desc;
  } else {
    projects.push({id:randomId(), name, desc});
  }
  saveAndRefresh();
  closeProjectModal();
  return false;
}

// ============= STATUSES =====================
function openAddStatusModal() {
  document.getElementById('statusForm').reset();
  document.getElementById('statusId').value = '';
  document.getElementById('statusTextColor').value = '#232323';
  document.getElementById('statusBgColor').value = '#f1e44b';
  document.getElementById('statusModal').classList.remove('hidden');
}
function closeStatusModal() {
  document.getElementById('statusModal').classList.add('hidden');
}
/**
 * إضافة حالة جديدة
 */
function saveStatus(e) {
  e.preventDefault();
  let name = document.getElementById('statusName').value.trim();
  let text = document.getElementById('statusTextColor').value;
  let bg = document.getElementById('statusBgColor').value;
  if(!name || !bg || !text) return false;
  let id = randomId("s_");
  statuses.push({id, name, text, bg});
  saveAndRefresh();
  closeStatusModal();
  return false;
}

function deleteStatus(id) {
  let s = statuses.find(s=>s.id===id);
  if(s&&s.fixed) return;
  if(confirm("هل تريد حذف الحالة؟")) {
    statuses=statuses.filter(ss=>ss.id!==id);
    for(let t of tasks) if(t.statusId===id) t.statusId = DEFAULT_STATUSES[0].id;
    saveAndRefresh();
  }
}

// ================== FILTER/PREFS HANDLERS =============
document.getElementById('filterProject').onchange = function() {
  filter.projectId = this.value;
  saveAndRefresh();
};
document.getElementById('filterStatus').onchange = function() {
  filter.statusId = this.value;
  saveAndRefresh();
};
document.getElementById('filterFav').onchange = function() {
  filter.favorite = this.checked;
  saveAndRefresh();
};
document.getElementById('filterArchived').onchange = function() {
  filter.archived = this.checked;
  saveAndRefresh();
};

function showOnly(type) {
  filter.only = type;
  saveAndRefresh();
}

// MULTI SELECT ACTIONS
function getSelectedTaskIds() {
  return Array.from(document.querySelectorAll('.selectTask:checked')).map(cb=>cb.dataset.id);
}

function archiveOnes() {
  let ids = getSelectedTaskIds();
  tasks.forEach(t=>{ if(ids.includes(t.id)) t.archived=true; });
  saveAndRefresh();
}
function favOnes() {
  let ids = getSelectedTaskIds();
  tasks.forEach(t=>{ if(ids.includes(t.id)) t.favorite=true; });
  saveAndRefresh();
}
function deleteOnes() {
  let ids = getSelectedTaskIds();
  if(ids.length === 0) {
    Toastify({
      text: "الرجاء تحديد المهام أولاً",
      duration: 3000,
      gravity: "top",
      position: 'left',
      style: { background: "#ef4444" }
    }).showToast();
    return;
  }

  Swal.fire({
    title: 'حذف المهام المحددة؟',
    text: `سيتم حذف ${ids.length} مهمة. لا يمكن التراجع عن هذه العملية!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'نعم، احذف',
    cancelButtonText: 'إلغاء'
  }).then((result) => {
    if (result.isConfirmed) {
      tasks = tasks.filter(t=>!ids.includes(t.id));
      saveAndRefresh();
      Toastify({
        text: `تم حذف ${ids.length} مهمة بنجاح`,
        duration: 3000,
        gravity: "top",
        position: 'left',
        style: { background: "#22c55e" }
      }).showToast();
    }
  });
}

// ============ DRAG/SORT ================
/**
 * عملية السحب والإفلات وترتيب المهام حسب الظهور
 */
function reorderTasks(filtered, oldIndex, newIndex) {
  if(oldIndex===newIndex) return;
  // Only reordered tasks in that filtering!
  let ids = filtered.map(t=>t.id);
  let newOrder = Array.from(ids);
  let [removed] = newOrder.splice(oldIndex,1);
  newOrder.splice(newIndex,0,removed);
  // Assign new sortOrder for filtered tasks
  let startOrder = Math.min(...filtered.map(t=>t.sortOrder||1));
  for(let i=0; i<newOrder.length; ++i) {
    let t = tasks.find(tt=>tt.id===newOrder[i]);
    t.sortOrder = startOrder + i;
  }
  saveAndRefresh();
}

// ================= DATABASE OPS =============
/**
 * تصدير البيانات كملف JSON
 */
function exportDB() {
  let db = {
    tasks, projects, statuses
  };
  let blob = new Blob([JSON.stringify(db)], {type:'application/json'});
  let a = document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download='task-manager-data.json';
  a.click();
}

/**
 * استيراد قاعدة بيانات JSON مخصصة
 */
function importDB() {
  document.getElementById('dbFileInput').onclick=() => {this.value=null;};
  document.getElementById('dbFileInput').onchange = function() {
    let file = this.files[0];
    if(!file) return;
    let reader = new FileReader();
    reader.onload = function(e) {
      try {
        let db = JSON.parse(e.target.result);
        if(db.tasks && db.projects && db.statuses) {
          tasks = db.tasks; projects = db.projects; statuses = db.statuses;
          saveAndRefresh();
          alert('تم الاستيراد بنجاح'); 
        } else throw "";
      }catch{
        alert('ملف غير صالح');
      }
    }
    reader.readAsText(file);
  };
  document.getElementById('dbFileInput').click();
}

/**
 * حذف جميع قواعد البيانات والمشاريع والحالات
 */
function deleteAllData() {
  Swal.fire({
    title: 'حذف كل البيانات؟',
    text: "سيتم حذف جميع المهام والمشاريع والحالات! لا يمكن التراجع عن هذه العملية!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'نعم، احذف الكل',
    cancelButtonText: 'إلغاء'
  }).then((result) => {
    if (result.isConfirmed) {
      tasks=[]; projects=[]; statuses=DEFAULT_STATUSES.slice();
      saveAndRefresh();
      Toastify({
        text: "تم حذف جميع البيانات بنجاح",
        duration: 3000,
        gravity: "top",
        position: 'left',
        style: { background: "#22c55e" }
      }).showToast();
    }
  });
}

// =========== UTILS =============
/**
 * مولد مُعرف عشوائي للمشاريع والمهام
 * @param {string} prefix بادئة اختيارية
 */
function randomId(prefix="") {
  return prefix+Math.random().toString(36).substring(2,9)+(Date.now()%10000);
}

// =========== PWA ===============
if('serviceWorker' in navigator){
  window.addEventListener('load',function(){
    navigator.serviceWorker.register("data:text/javascript;charset=utf-8,"+encodeURIComponent(`
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>self.clients.claim());
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.open('tm').then(c=>c.match(e.request,{ignoreSearch:true})).then(r=>r||fetch(e.request).then(res=>{
      return caches.open('tm').then(c=>{c.put(e.request,res.clone());return res;});
    }))
  );
});
    `))
  });
}

/**
 * تهيئة التطبيق وتحميل البيانات تلقائياً عند تشغيل الصفحة
 */
window.onload = function() {
  loadDB();
  refreshAll();
  // Filters
  document.getElementById('filterFav').checked = filter.favorite;
  document.getElementById('filterArchived').checked = filter.archived;
};

// ====== Keyboard/Esc for modals ========
window.addEventListener('keydown',function(e){
  if(e.key=='Escape'){
    closeTaskModal();closeProjectModal();closeStatusModal();closeMultiTaskModal();
  }
});

// ============ SECTIONS MANAGEMENT ================
function openAddSectionModal() {
  document.getElementById('sectionForm').reset();
  document.getElementById('sectionId').value = '';
  document.getElementById('sectionModal').classList.remove('hidden');
  renderProjectsSelect();
}

function closeSectionModal() {
  document.getElementById('sectionModal').classList.add('hidden');
}

/**
 * حفظ أو تعديل قسم
 */
function saveSection(e) {
  e.preventDefault();
  let id = document.getElementById('sectionId').value;
  let name = document.getElementById('sectionName').value.trim();
  let projectId = document.getElementById('sectionProject').value;
  
  if(!name || !projectId) return false;
  
  if(id) {
    let s = sections.find(s => s.id === id);
    s.name = name;
    s.projectId = projectId;
  } else {
    sections.push({
      id: randomId('sec_'),
      name,
      projectId
    });
  }
  
  saveAndRefresh();
  closeSectionModal();
  return false;
}

/**
 * حذف قسم
 */
function deleteSection(id) {
  if(confirm('هل تريد حذف القسم؟')) {
    sections = sections.filter(s => s.id !== id);
    // تحديث المهام المرتبطة بالقسم المحذوف
    tasks.forEach(t => {
      if(t.sectionId === id) {
        t.sectionId = null;
      }
    });
    saveAndRefresh();
  }
}

/**
 * تبديل حالة المهمة بين منجز وقيد الانتظار
 */
function toggleTaskStatus(id) {
  let task = tasks.find(t => t.id === id);
  if(task) {
    task.statusId = task.statusId === 'done' ? 'todo' : 'done';
    saveAndRefresh();
  }
}

// ============ COPY TASKS ================
function openCopyTasksModal() {
  document.getElementById('copyTasksModal').classList.remove('hidden');
  renderProjectsSelect();
}

function closeCopyTasksModal() {
  document.getElementById('copyTasksModal').classList.add('hidden');
}

/**
 * نسخ المهام المحددة أو المصفاة إلى الحافظة
 * يستخدم طريقة بديلة للنسخ في حال عدم توفر Clipboard API
 */
function copyTasksToClipboard() {
  let filtered = filterTasks();
  if(filtered.length === 0) {
    Toastify({
      text: "لا توجد مهام للنسخ",
      duration: 3000,
      gravity: "top",
      position: 'left',
      style: { background: "#ef4444" }
    }).showToast();
    return;
  }

  let text = filtered.map(t => {
    let prj = projects.find(p=>p.id===t.projectId);
    let stat = statuses.find(s=>s.id===t.statusId);
    return `${t.title} (${prj?.name||'بدون مشروع'} - ${stat?.name||'-'})`;
  }).join('\n');

  // إنشاء عنصر textarea مؤقت
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    // محاولة النسخ باستخدام Clipboard API أولاً
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showCopySuccess();
      }).catch(() => {
        // في حال فشل Clipboard API، استخدم الطريقة التقليدية
        document.execCommand('copy');
        showCopySuccess();
      });
    } else {
      // استخدام الطريقة التقليدية مباشرة
      document.execCommand('copy');
      showCopySuccess();
    }
  } catch (err) {
    Toastify({
      text: "حدث خطأ أثناء النسخ",
      duration: 3000,
      gravity: "top",
      position: 'left',
      style: { background: "#ef4444" }
    }).showToast();
  } finally {
    // تنظيف العنصر المؤقت
    document.body.removeChild(textarea);
  }
}

/**
 * عرض رسالة نجاح النسخ
 */
function showCopySuccess() {
  Toastify({
    text: `تم نسخ المهام إلى الحافظة`,
    duration: 3000,
    gravity: "top",
    position: 'left',
    style: { background: "#22c55e" }
  }).showToast();
}

// Add new buttons to the task board actions
document.querySelector('.material-card .mb-3').insertAdjacentHTML('beforeend', `
  <button onclick="openCopyTasksModal()" class="bg-purple-100 hover:bg-purple-200 text-purple-800 rounded px-2 py-1 text-sm font-bold"><i class="fas fa-copy"></i> نسخ المهام</button>
  <button onclick="openAddSectionModal()" class="bg-green-100 hover:bg-green-200 text-green-800 rounded px-2 py-1 text-sm font-bold"><i class="fas fa-folder-plus"></i> إضافة قسم</button>
`);

/**
 * تحديث قائمة الأقسام في نموذج المهمة بناءً على المشروع المحدد
 */
function updateSectionsList() {
  let projectId = document.getElementById('taskProject').value;
  let sectionSelect = document.getElementById('taskSection');
  let projectSections = sections.filter(s => s.projectId === projectId);
  
  sectionSelect.innerHTML = '<option value="">بدون قسم</option>' + 
    projectSections.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

/**
 * فتح نافذة إضافة قسم سريع
 */
function quickAddSection() {
  let projectId = document.getElementById('taskProject').value;
  if(!projectId) {
    alert('الرجاء اختيار المشروع أولاً');
    return;
  }
  document.getElementById('quickSectionModal').classList.remove('hidden');
  document.getElementById('quickSectionName').focus();
}

function closeQuickSectionModal() {
  document.getElementById('quickSectionModal').classList.add('hidden');
}

/**
 * حفظ قسم جديد من النافذة السريعة
 * @param {Event} e - حدث النموذج
 */
function saveQuickSection(e) {
  e.preventDefault();
  let projectId = document.getElementById('taskProject').value;
  let name = document.getElementById('quickSectionName').value.trim();
  
  if(!name || !projectId) return false;
  
  let newSection = {
    id: randomId('sec_'),
    name,
    projectId
  };
  
  sections.push(newSection);
  saveDB();
  
  // تحديث قائمة الأقسام وتحديد القسم الجديد
  updateSectionsList();
  document.getElementById('taskSection').value = newSection.id;
  
  closeQuickSectionModal();
  document.getElementById('quickSectionForm').reset();
  return false;
}

/**
 * فتح نافذة ملاحظات المهمة
 * @function openTaskNotesModal
 * @param {string} taskId - معرف المهمة
 * @returns {void}
 */
function openTaskNotesModal(taskId) {
  window.currentNotesTaskId = taskId;
  renderTaskNotes();
  document.getElementById('taskNotesModal').classList.remove('hidden');
  updateNoteInputType();
}

/**
 * إغلاق نافذة الملاحظات
 * @function closeTaskNotesModal
 * @returns {void}
 */
function closeTaskNotesModal() {
  document.getElementById('taskNotesModal').classList.add('hidden');
  window.currentNotesTaskId = null;
  document.getElementById('noteImagePreview').innerHTML = '';
}

/**
 * عرض ملاحظات المهمة المحددة
 * @function renderTaskNotes
 * @returns {void}
 */
function renderTaskNotes() {
  const task = tasks.find(t => t.id === window.currentNotesTaskId);
  const notesDiv = document.getElementById('notesList');
  if (!task) return;
  if (!task.notes) task.notes = [];
  if (task.notes.length === 0) {
    notesDiv.innerHTML = '<div class="text-gray-400">لا توجد ملاحظات بعد.</div>';
    return;
  }
  notesDiv.innerHTML = task.notes.map((note, idx) => {
    let content = '';
    if (note.type === 'text') content = `<span>${note.content}</span>`;
    else if (note.type === 'link') content = `<a href="${note.content}" target="_blank" class="text-blue-600 underline">${note.content}</a>`;
    else if (note.type === 'image') content = `<img src="${note.content}" alt="سكرين شوت" class="max-w-xs max-h-32 border rounded cursor-pointer hover:opacity-90 transition-opacity" onclick="openImageModal('${note.content}')">`;
    return `
      <div class="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded">
        ${content}
        <button onclick="deleteTaskNote(${idx})" class="ml-2 text-red-600 hover:text-red-900" style="margin-right:auto;"><i class="fas fa-trash"></i></button>
        <span class="font-bold text-xs bg-gray-200 px-2 py-1 rounded">${note.type === 'text' ? 'نص' : note.type === 'link' ? 'رابط' : 'سكرين شوت'}</span>
      </div>
    `;
  }).join('');
}

/**
 * إضافة ملاحظة جديدة للمهمة
 * @function addTaskNote
 * @param {Event} e
 * @returns {boolean} false لمنع إعادة تحميل الصفحة
 */
function addTaskNote(e) {
  e.preventDefault();
  const type = document.getElementById('noteType').value;
  let content = document.getElementById('noteContent').value.trim();
  if (!content) return false;
  const task = tasks.find(t => t.id === window.currentNotesTaskId);
  if (!task.notes) task.notes = [];
  // تحقق من الصورة إذا كانت من نوع image
  if (type === 'image' && !content.startsWith('data:image/')) {
    alert('يرجى لصق صورة (Ctrl+V) أو إدخال رابط صورة بصيغة base64.');
    return false;
  }
  task.notes.push({ type, content, date: Date.now() });
  saveAndRefresh();
  renderTaskNotes();
  document.getElementById('addNoteForm').reset();
  document.getElementById('noteType').value = 'text';
  updateNoteInputType();
  document.getElementById('noteImagePreview').innerHTML = '';
  return false;
}

/**
 * حذف ملاحظة من المهمة
 * @function deleteTaskNote
 * @param {number} idx - رقم الملاحظة في المصفوفة
 * @returns {void}
 */
function deleteTaskNote(idx) {
  const task = tasks.find(t => t.id === window.currentNotesTaskId);
  if (!task || !task.notes) return;
  task.notes.splice(idx, 1);
  saveAndRefresh();
  renderTaskNotes();
}

/**
 * تحديث نوع حقل الإدخال حسب نوع الملاحظة
 * @function updateNoteInputType
 * @returns {void}
 */
function updateNoteInputType() {
  const type = document.getElementById('noteType').value;
  const wrap = document.getElementById('noteInputWrap');
  const preview = document.getElementById('noteImagePreview');
  preview.innerHTML = '';
  
  if (type === 'text') {
    wrap.innerHTML = `<textarea id="noteContent" class="w-full px-2 py-1 border rounded" placeholder="أدخل الملاحظة"></textarea>`;
    initTinyMCE();
  } else if (type === 'link') {
    wrap.innerHTML = `<input type="url" id="noteContent" class="w-full px-2 py-1 border rounded" placeholder="أدخل الرابط">`;
  } else if (type === 'image') {
    wrap.innerHTML = `<input type="text" id="noteContent" class="w-full px-2 py-1 border rounded" placeholder="الصق صورة (Ctrl+V) أو أدخل base64">`;
    const input = document.getElementById('noteContent');
    input.addEventListener('paste', handleImagePaste);
    input.addEventListener('input', handleImageInput);
  }
}

/**
 * تهيئة محرر TinyMCE
 * @function initTinyMCE
 * @returns {void}
 */
function initTinyMCE() {
  tinymce.init({
    selector: '#noteContent',
    plugins: 'lists link image table code help wordcount',
    toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | indent outdent | bullist numlist | link image | code',
    directionality: 'rtl',
    language: 'ar',
    height: 300,
    menubar: false,
    branding: false,
    promotion: false,
    content_style: 'body { font-family: Cairo, sans-serif; font-size: 14px; }',
    setup: function(editor) {
      editor.on('change', function() {
        editor.save();
      });
    }
  });
}

/**
 * معالجة لصق الصور
 * @function handleImagePaste
 * @param {ClipboardEvent} e - حدث اللصق
 * @returns {void}
 */
function handleImagePaste(e) {
  if (e.clipboardData && e.clipboardData.items) {
    for (let i = 0; i < e.clipboardData.items.length; i++) {
      const item = e.clipboardData.items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = function(event) {
          const input = document.getElementById('noteContent');
          input.value = event.target.result;
          document.getElementById('noteImagePreview').innerHTML = 
            `<img src="${event.target.result}" class="max-w-xs max-h-32 border rounded mt-2">`;
        };
        reader.readAsDataURL(file);
        e.preventDefault();
        break;
      }
    }
  }
}

/**
 * معالجة تغيير قيمة حقل الصورة
 * @function handleImageInput
 * @param {Event} e - حدث التغيير
 * @returns {void}
 */
function handleImageInput(e) {
  const input = e.target;
  if (input.value.startsWith('data:image/')) {
    document.getElementById('noteImagePreview').innerHTML = 
      `<img src="${input.value}" class="max-w-xs max-h-32 border rounded mt-2">`;
  } else {
    document.getElementById('noteImagePreview').innerHTML = '';
  }
}

/**
 * عرض ملاحظات المهمة
 * @function renderTaskNotes
 * @returns {void}
 */
function renderTaskNotes() {
  const task = tasks.find(t => t.id === window.currentNotesTaskId);
  const notesDiv = document.getElementById('notesList');
  if (!task) return;
  if (!task.notes) task.notes = [];
  if (task.notes.length === 0) {
    notesDiv.innerHTML = '<div class="text-gray-400">لا توجد ملاحظات بعد.</div>';
    return;
  }
  notesDiv.innerHTML = task.notes.map((note, idx) => {
    let content = '';
    if (note.type === 'text') {
      content = `<div class="note-content">${note.content}</div>`;
    } else if (note.type === 'link') {
      content = `<a href="${note.content}" target="_blank" class="text-blue-600 underline">${note.content}</a>`;
    } else if (note.type === 'image') {
      content = `<img src="${note.content}" alt="سكرين شوت" class="max-w-xs max-h-32 border rounded cursor-pointer hover:opacity-90 transition-opacity" onclick="openImageModal('${note.content}')">`;
    }
    return `
      <div class="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded">
        ${content}
        <button onclick="deleteTaskNote(${idx})" class="ml-2 text-red-600 hover:text-red-900" style="margin-right:auto;"><i class="fas fa-trash"></i></button>
        <span class="font-bold text-xs bg-gray-200 px-2 py-1 rounded">${note.type === 'text' ? 'نص' : note.type === 'link' ? 'رابط' : 'سكرين شوت'}</span>
      </div>
    `;
  }).join('');
}

/**
 * إضافة ملاحظة جديدة للمهمة
 * @function addTaskNote
 * @param {Event} e - حدث النموذج
 * @returns {boolean} false لمنع إعادة تحميل الصفحة
 */
function addTaskNote(e) {
  e.preventDefault();
  const type = document.getElementById('noteType').value;
  let content;
  
  if (type === 'text') {
    content = tinymce.get('noteContent').getContent();
  } else {
    content = document.getElementById('noteContent').value.trim();
  }
  
  if (!content) return false;
  
  const task = tasks.find(t => t.id === window.currentNotesTaskId);
  if (!task.notes) task.notes = [];
  
  if (type === 'image' && !content.startsWith('data:image/')) {
    alert('يرجى لصق صورة (Ctrl+V) أو إدخال رابط صورة بصيغة base64.');
    return false;
  }
  
  task.notes.push({ type, content, date: Date.now() });
  saveAndRefresh();
  renderTaskNotes();
  document.getElementById('addNoteForm').reset();
  document.getElementById('noteType').value = 'text';
  updateNoteInputType();
  document.getElementById('noteImagePreview').innerHTML = '';
  
  return false;
}

/**
 * فتح موديول الصورة المكبرة
 * @param {string} imageSrc - رابط الصورة المراد تكبيرها
 */
function openImageModal(imageSrc) {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  modalImage.src = imageSrc;
  modal.classList.remove('hidden');
}

/**
 * إغلاق موديول الصورة المكبرة
 */
function closeImageModal() {
  document.getElementById('imageModal').classList.add('hidden');
}

// إضافة مستمع حدث للضغط على ESC لإغلاق موديول الصورة
window.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeImageModal();
  }
});

</script>

<!-- Image Modal -->
<div id="imageModal" class="fixed z-50 inset-0 bg-black bg-opacity-75 flex items-center justify-center hidden">
  <div class="relative max-w-4xl w-full mx-4">
    <button class="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl" onclick="closeImageModal()">
      <i class="fas fa-times"></i>
    </button>
    <img id="modalImage" src="" alt="صورة مكبرة" class="w-full h-auto rounded-lg shadow-2xl">
  </div>
</div>

</body>
</html>
        