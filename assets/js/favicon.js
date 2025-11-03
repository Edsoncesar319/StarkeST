(function() {
    try {
        function createFaviconPng(size) {
            var canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            var ctx = canvas.getContext('2d');
            // Background circle
            ctx.fillStyle = '#2563EB';
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.fill();
            // Text
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '700 ' + Math.round(size * 0.48) + 'px Segoe UI, Arial, sans-serif';
            ctx.fillText('ST', size / 2, size / 2);
            return canvas.toDataURL('image/png');
        }

        function injectIcon(dataUrl, size) {
            var link = document.createElement('link');
            link.rel = 'alternate icon';
            link.type = 'image/png';
            link.sizes = size + 'x' + size;
            link.href = dataUrl;
            document.head.appendChild(link);
        }

        var png32 = createFaviconPng(32);
        var png64 = createFaviconPng(64);
        injectIcon(png32, 32);
        injectIcon(png64, 64);
    } catch (e) {
        // Silently ignore if canvas is unavailable
    }
})();


