/**
 * تعريف وتهيئة الخطوط العربية
 */

// تعريف الخطوط المتاحة في النطاق العام
window.FONT_FAMILIES = {
    cairo: 'Cairo',
    notoKufi: 'Noto Kufi Arabic',
    notoSans: 'Noto Sans Arabic'
};

// إضافة CSS للخطوط
const fontStyles = `
    @font-face {
        font-family: 'Cairo';
        src: url('assets/fonts/Cairo-VariableFont_slnt,wght.ttf') format('truetype');
        font-weight: 200 1000;
        font-style: normal;
        font-display: swap;
    }

    @font-face {
        font-family: 'Noto Kufi Arabic';
        src: url('assets/fonts/NotoKufiArabic-VariableFont_wght.ttf') format('truetype');
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
    }

    @font-face {
        font-family: 'Noto Sans Arabic';
        src: url('assets/fonts/NotoSansArabic-VariableFont_wdth,wght.ttf') format('truetype');
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
    }

    /* تطبيق الخطوط على العناصر */
    body {
        font-family: 'Cairo', 'Noto Kufi Arabic', 'Noto Sans Arabic', sans-serif;
    }

    .task-title {
        font-family: 'Cairo', sans-serif;
        font-weight: 700;
    }

    .subtask-title {
        font-family: 'Noto Kufi Arabic', sans-serif;
        font-weight: 500;
    }

    .report-content {
        font-family: 'Noto Sans Arabic', sans-serif;
        font-weight: 400;
    }
`;

// إضافة الأنماط إلى الصفحة
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);
}