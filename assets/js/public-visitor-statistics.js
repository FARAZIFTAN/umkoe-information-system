(function () {
    'use strict';

    const API_URL = 'https://script.google.com/macros/s/AKfycby-DdnbE7oR7p4WtRNhTy25DuROJyoFnzsDqQ-p-6hnBIDPCNLQifQcC3aeacTchKioqw/exec';

    const PUBLIC_PAGE_COUNT = 10;

    const numberFormat = new Intl.NumberFormat('id-ID');

    const elements = {
        total: document.getElementById('publicTotalVisits'),
        today: document.getElementById('publicTodayVisits'),
        month: document.getElementById('publicMonthVisits'),
        pages: document.getElementById('publicPageCount'),
        chart: document.getElementById('publicDailyChart'),
        popular: document.getElementById('publicPopularPages'),
        status: document.getElementById('publicStatsStatus'),
        updated: document.getElementById('publicStatsUpdated')
    };

    function formatNumber(value) {
        const number = Number(value);
        return numberFormat.format(
            Number.isFinite(number) && number >= 0 ? number : 0
        );
    }

    function showMessage(element, message) {
        element.textContent = message;
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    function renderCards(data) {
        elements.total.textContent = formatNumber(data.totalVisits);
        elements.today.textContent = formatNumber(data.todayVisits);
        elements.month.textContent = formatNumber(data.monthVisits);
        elements.pages.textContent = formatNumber(PUBLIC_PAGE_COUNT);
    }

    function formatDay(dateValue) {
        const date = new Date(dateValue + 'T00:00:00');

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short'
        }).format(date);
    }

    function renderChart(dailyVisits) {
        elements.chart.replaceChildren();

        const visits = Array.isArray(dailyVisits)
            ? dailyVisits.slice(-7)
            : [];

        if (!visits.length) {
            showMessage(elements.chart, 'Data aktivitas belum tersedia.');
            return;
        }

        const maxVisits = Math.max(
            1,
            ...visits.map(item => Number(item.visits) || 0)
        );

        visits.forEach(function (item) {
            const count = Math.max(0, Number(item.visits) || 0);

            const column = createElement('div', 'public-chart-item');

            const value = createElement(
                'span',
                'public-chart-value',
                formatNumber(count)
            );

            const track = createElement('div', 'public-chart-track');
            const bar = createElement('div', 'public-chart-bar');

            bar.style.height = Math.max(
                3,
                (count / maxVisits) * 100
            ) + '%';

            track.appendChild(bar);

            const label = createElement(
                'span',
                'public-chart-label',
                formatDay(item.date)
            );

            column.append(value, track, label);
            elements.chart.appendChild(column);
        });
    }

    function renderPopularPages(popularPages) {
        elements.popular.replaceChildren();

        const pages = Array.isArray(popularPages)
            ? popularPages.slice(0, 3)
            : [];

        if (!pages.length) {
            showMessage(
                elements.popular,
                'Belum ada data halaman populer.'
            );
            return;
        }

        pages.forEach(function (page, index) {
            const item = createElement('div', 'public-popular-item');

            const rank = createElement(
                'div',
                'public-popular-rank',
                String(index + 1)
            );

            const info = createElement('div', 'public-popular-info');

            const title = createElement(
                'strong',
                '',
                page.title || page.page || 'Halaman tanpa judul'
            );

            const count = createElement(
                'span',
                '',
                formatNumber(page.visits) + ' kunjungan'
            );

            info.append(title, count);
            item.append(rank, info);

            elements.popular.appendChild(item);
        });
    }

    function renderStatistics(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Format data statistik tidak valid.');
        }

        renderCards(data);
        renderChart(data.dailyVisits);
        renderPopularPages(data.popularPages);

        elements.status.textContent = 'Data statistik berhasil diperbarui.';

        elements.updated.textContent =
            'Terakhir diperbarui: ' +
            new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short'
            }).format(new Date());
    }

    function loadStatistics() {
        const callbackName =
            'pusdatinPublicStats_' +
            Date.now() +
            '_' +
            Math.random().toString(36).substring(2, 8);

        const script = document.createElement('script');

        let finished = false;

        function cleanup() {
            delete window[callbackName];

            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }

        const timeout = setTimeout(function () {
            if (finished) return;

            finished = true;
            cleanup();

            elements.status.textContent =
                'Statistik belum dapat dimuat. Silakan coba beberapa saat lagi.';
        }, 15000);

        window[callbackName] = function (data) {
            if (finished) return;

            finished = true;
            clearTimeout(timeout);
            cleanup();

            try {
                renderStatistics(data);
            } catch (error) {
                console.error('Gagal menampilkan statistik:', error);

                elements.status.textContent =
                    'Terjadi kesalahan saat menampilkan data statistik.';
            }
        };

        script.onerror = function () {
            if (finished) return;

            finished = true;
            clearTimeout(timeout);
            cleanup();

            elements.status.textContent =
                'Tidak dapat terhubung ke layanan statistik.';
        };

        script.src =
            API_URL +
            '?action=stats&callback=' +
            encodeURIComponent(callbackName) +
            '&_=' +
            Date.now();

        document.body.appendChild(script);
    }

    elements.pages.textContent = formatNumber(PUBLIC_PAGE_COUNT);

    loadStatistics();
})();
