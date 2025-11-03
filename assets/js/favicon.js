(function() {
    try {
        function createFaviconPng(size) {
            var canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            var ctx = canvas.getContext('2d');
            // Background circle (slight padding for anti-aliasing)
            var radius = size / 2 - Math.max(1, Math.floor(size * 0.02));
            ctx.fillStyle = '#2563EB';
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
            ctx.fill();
            // Text
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            var fontPx = Math.round(size * 0.5);
            ctx.font = '700 ' + fontPx + 'px Segoe UI, Arial, sans-serif';
            // Subtle y offset for optical centering
            ctx.fillText('ST', size / 2, size / 2 + Math.round(size * 0.02));
            return canvas.toDataURL('image/png');
        }

        function injectIcon(dataUrl, size, rel) {
            var link = document.createElement('link');
            link.rel = rel || 'icon';
            link.type = 'image/png';
            link.sizes = size + 'x' + size;
            link.href = dataUrl;
            document.head.appendChild(link);
        }

        var sizes = [16, 32, 48, 64, 128, 180, 192, 256];
        sizes.forEach(function(sz) {
            var dataUrl = createFaviconPng(sz);
            // Apple touch icon prefers 180x180
            if (sz === 180) {
                injectIcon(dataUrl, sz, 'apple-touch-icon');
            }
            injectIcon(dataUrl, sz, 'icon');
        });
    } catch (e) {
        // Silently ignore if canvas is unavailable
    }
})();


