// Nav scroll effect
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    nav.classList.toggle('scrolled', scrollY > 50);
    lastScroll = scrollY;
}, { passive: true });

// Reveal on scroll
const revealElements = document.querySelectorAll('[data-reveal]');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Stagger siblings
            const parent = entry.target.parentElement;
            const siblings = parent.querySelectorAll('[data-reveal]');
            const idx = Array.from(siblings).indexOf(entry.target);
            setTimeout(() => {
                entry.target.classList.add('revealed');
            }, idx * 100);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// ===== Floating Arcs =====
(function() {
    const canvas = document.createElement('canvas');
    canvas.id = 'arcs-canvas';
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    document.querySelector('.hero').style.position = 'relative';
    document.querySelector('.hero').appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let w, h;
    let mouse = { x: -9999, y: -9999 };

    const hero = document.querySelector('.hero');
    function resize() {
        w = canvas.width = hero.offsetWidth;
        h = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    const palette = [
        'rgba(255,90,60,',
        'rgba(255,140,46,',
        'rgba(255,184,48,',
        'rgba(255,214,102,',
    ];

    const arcs = [];
    const numArcs = 8;

    // Edges: 0=left, 1=right, 2=top, 3=bottom
    function edgePosition(edge) {
        switch(edge) {
            case 0: return { x: 0, y: Math.random() * hero.offsetHeight };
            case 1: return { x: hero.offsetWidth, y: Math.random() * hero.offsetHeight };
            case 2: return { x: Math.random() * hero.offsetWidth, y: 0 };
            case 3: return { x: Math.random() * hero.offsetWidth, y: hero.offsetHeight };
        }
    }

    for (let i = 0; i < numArcs; i++) {
        const edge = i % 4;
        const pos = edgePosition(edge);
        arcs.push({
            x: pos.x,
            y: pos.y,
            edge: edge,
            baseX: pos.x,
            baseY: pos.y,
            size: Math.random() * 600 + 500,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.002,
            color: palette[Math.floor(Math.random() * palette.length)],
            alpha: Math.random() * 0.12 + 0.06,
            arcStart: Math.random() * Math.PI,
            arcSpan: Math.random() * Math.PI * 0.6 + Math.PI * 0.5,
            lineWidth: Math.random() * 3 + 2,
            drift: Math.random() * Math.PI * 2,
            driftSpeed: Math.random() * 0.0004 + 0.0002,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        const t = Date.now();

        for (let i = 0; i < arcs.length; i++) {
            const a = arcs[i];

            // Stay anchored to edge, drift along it
            const drift = Math.sin(t * a.driftSpeed + a.drift) * 80;
            if (a.edge === 0 || a.edge === 1) {
                // Left/right edge — x stays pinned, y drifts
                a.x = a.baseX;
                a.y = a.baseY + drift;
            } else {
                // Top/bottom edge — y stays pinned, x drifts
                a.x = a.baseX + drift;
                a.y = a.baseY;
            }

            // Mouse interaction — subtle rotation influence
            const dx = a.x - mouse.x;
            const dy = a.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let mouseRotate = 0;
            if (dist < 300 && dist > 0) {
                mouseRotate = (300 - dist) / 300 * 0.05;
            }

            a.rotation += a.rotSpeed + mouseRotate;

            // Draw curved arc
            ctx.save();
            ctx.translate(a.x, a.y);
            ctx.rotate(a.rotation);
            ctx.beginPath();
            ctx.arc(0, 0, a.size, a.arcStart, a.arcStart + a.arcSpan);
            ctx.strokeStyle = a.color + a.alpha + ')';
            ctx.lineWidth = a.lineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();
        }

        requestAnimationFrame(draw);
    }

    draw();
})();
