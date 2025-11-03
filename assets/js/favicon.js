(function() {
    try {
        function createFaviconPng(size) {
            var canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            var ctx = canvas.getContext('2d');
            
            // Blue background
            ctx.fillStyle = '#2563EB';
            ctx.fillRect(0, 0, size, size);
            
            // Thick curved crescent element (simplified version)
            // Outer arc
            ctx.beginPath();
            ctx.moveTo(size * 0.609, size * 0.109);
            ctx.bezierCurveTo(size * 0.734, size * 0.078, size * 0.859, size * 0.141, size * 0.859, size * 0.297);
            ctx.bezierCurveTo(size * 0.859, size * 0.453, size * 0.859, size * 0.609, size * 0.766, size * 0.672);
            ctx.bezierCurveTo(size * 0.672, size * 0.734, size * 0.609, size * 0.734, size * 0.547, size * 0.734);
            ctx.bezierCurveTo(size * 0.484, size * 0.734, size * 0.422, size * 0.703, size * 0.359, size * 0.672);
            ctx.bezierCurveTo(size * 0.297, size * 0.609, size * 0.266, size * 0.453, size * 0.297, size * 0.297);
            ctx.bezierCurveTo(size * 0.328, size * 0.141, size * 0.391, size * 0.109, size * 0.484, size * 0.109);
            ctx.bezierCurveTo(size * 0.547, size * 0.109, size * 0.609, size * 0.109, size * 0.609, size * 0.109);
            ctx.closePath();
            ctx.fillStyle = '#3b82f6';
            ctx.globalAlpha = 0.85;
            ctx.fill();
            
            // Inner cutout for crescent
            ctx.beginPath();
            ctx.moveTo(size * 0.547, size * 0.172);
            ctx.bezierCurveTo(size * 0.578, size * 0.156, size * 0.609, size * 0.172, size * 0.641, size * 0.266);
            ctx.bezierCurveTo(size * 0.672, size * 0.359, size * 0.672, size * 0.453, size * 0.641, size * 0.516);
            ctx.bezierCurveTo(size * 0.609, size * 0.578, size * 0.578, size * 0.609, size * 0.547, size * 0.641);
            ctx.bezierCurveTo(size * 0.516, size * 0.672, size * 0.484, size * 0.641, size * 0.453, size * 0.578);
            ctx.bezierCurveTo(size * 0.422, size * 0.516, size * 0.422, size * 0.422, size * 0.453, size * 0.328);
            ctx.bezierCurveTo(size * 0.484, size * 0.234, size * 0.516, size * 0.203, size * 0.547, size * 0.172);
            ctx.closePath();
            ctx.fillStyle = '#2563EB';
            ctx.globalAlpha = 1.0;
            ctx.fill();
            
            // Letter S (white with subtle gradient effect)
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 ' + Math.round(size * 0.422) + 'px Arial Black, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('S', size * 0.281, size * 0.461);
            
            // Letter T (white)
            ctx.fillText('T', size * 0.531, size * 0.461);
            
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
        
        // Also set as primary favicon
        var primary32 = createFaviconPng(32);
        var primaryLink = document.createElement('link');
        primaryLink.rel = 'icon';
        primaryLink.type = 'image/png';
        primaryLink.href = primary32;
        document.head.appendChild(primaryLink);
    } catch (e) {
        console.error('Error creating favicon:', e);
    }
})();
