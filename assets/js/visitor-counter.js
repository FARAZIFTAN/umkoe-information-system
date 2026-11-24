(function () {
    'use strict';

    const API_URL = 'https://script.google.com/macros/s/AKfycby-DdnbE7oR7p4WtRNhTy25DuROJyoFnzsDqQ-p-6hnBIDPCNLQifQcC3aeacTchKioqw/exec';

    // Buat identitas pengunjung anonim.
    function getVisitorId() {
        const storageKey = 'pusdatin_visitor_id';

        try {
            let visitorId = localStorage.getItem(storageKey);

            if (!visitorId) {
                visitorId = (
                    'visitor_' +
                    Date.now().toString(36) +
                    '_' +
                    Math.random().toString(36).substring(2, 12)
                );

                localStorage.setItem(storageKey, visitorId);
            }

            return visitorId;
        } catch (error) {
            // Gunakan ID sementara jika localStorage tidak tersedia.
            return 'temporary_' + Math.random().toString(36).substring(2, 12);
        }
    }

    // Siapkan data halaman yang sedang dibuka.
    const visitData = {
        visitorId: getVisitorId(),
        page: window.location.pathname,
        title: document.title || 'Halaman tanpa judul'
    };

    // Kirim data ke Google Apps Script.
    fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'text/plain;charset=UTF-8'
        },
        body: JSON.stringify(visitData),
        keepalive: true
    }).catch(function (error) {
        console.error('Gagal mengirim data kunjungan:', error);
    });
})();
