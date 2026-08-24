/* ==========================================================================
   BG3D — Cinematic WebGL background
   Liquid-metal sculpture · orbiting light rig · particle halo · glow core.
   Scroll-linked rotation & dolly · pointer parallax · theme aware.
   Reduced-motion safe · tab-visibility paused · graceful CSS fallback.
   ========================================================================== */
(function () {
    'use strict';

    var canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMobile = window.innerWidth < 768;

    /* ---------------- theme palettes ---------------- */
    var P = {
        dark: {
            bg: 0x000000,
            fog: 0x000000,
            fogDensity: 0.016,
            metal: 0x16171d,
            metalRough: 0.22,
            wire: 0x9aa3b5,
            wireOpacity: 0.05,
            ringA: 0x2997ff, ringAOp: 0.38,
            ringB: 0x7d5aff, ringBOp: 0.22,
            blend: THREE.AdditiveBlending,
            haloA: new THREE.Color(0x8fb8ff),
            haloB: new THREE.Color(0xffffff),
            haloC: new THREE.Color(0x7d5aff),
            haloOp: 0.68,
            dust: new THREE.Color(0x6f7787),
            dustOp: 0.55,
            glowColor: 0x2a4a8f,
            glowOpacity: 0.34,
            ambient: 0x23242c, ambientI: 0.85,
            keyI: 26, fillI: 14, rimI: 10,
            camZ: 30
        },
        light: {
            bg: 0xfbfbfd,
            fog: 0xfbfbfd,
            fogDensity: 0.020,
            metal: 0xaeb4c0,
            metalRough: 0.38,
            wire: 0x2a2f3a,
            wireOpacity: 0.09,
            ringA: 0x0071e3, ringAOp: 0.30,
            ringB: 0x7d5aff, ringBOp: 0.18,
            /* dark pigments + NORMAL blending — additive vanishes on white */
            blend: THREE.NormalBlending,
            haloA: new THREE.Color(0x0057c2),
            haloB: new THREE.Color(0x6a3ff0),
            haloC: new THREE.Color(0x7c8698),
            haloOp: 0.52,
            dust: new THREE.Color(0x596273),
            dustOp: 0.5,
            glowColor: 0x9db8e8,
            glowOpacity: 0.16,
            ambient: 0xffffff, ambientI: 1.0,
            keyI: 18, fillI: 10, rimI: 7,
            camZ: 34
        }
    };
    var T = document.body.classList.contains('light-theme') ? 'light' : 'dark';

    var renderer, scene, camera, clock;
    var sculpt, innerMetal, outerWire, ringA, ringB;
    var halo, dust, glowSprite;
    var keyLight, fillLight, rimLight, ambLight;
    var mouseX = 0, mouseY = 0, px = 0, py = 0;      /* parallax current */
    var scrollP = 0, scrollS = 0;                    /* scroll target / smoothed */
    var running = false, rafId = null;

    function init() {
        try {
            renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: !isMobile,
                alpha: false,
                powerPreference: 'high-performance'
            });
        } catch (e) { return; } /* no WebGL — CSS aurora/grid remain */

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.75));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = isMobile ? 1.25 : 1.15;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(P[T].bg);
        scene.fog = new THREE.FogExp2(P[T].fog, P[T].fogDensity);

        camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 140);
        camera.position.set(0, 0.4, isMobile ? P[T].camZ + 6 : P[T].camZ);

        buildLights();
        buildSculpture();
        buildHalo();
        buildDust();
        buildGlow();

        clock = new THREE.Clock();

        window.addEventListener('resize', onResize);
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        document.addEventListener('visibilitychange', onVisibility);

        canvas.classList.add('ready');

        if (prefersReduced) renderFrame(1200);
        else startLoop();
    }

    /* ---------------- lights (orbiting rig → liquid-metal streaks) -------- */
    function buildLights() {
        var p = P[T];
        ambLight = new THREE.AmbientLight(p.ambient, p.ambientI);
        scene.add(ambLight);

        keyLight = new THREE.PointLight(0x2997ff, p.keyI, 90, 2);
        keyLight.position.set(14, 8, 12);

        fillLight = new THREE.PointLight(0x7d5aff, p.fillI, 90, 2);
        fillLight.position.set(-16, -6, 10);

        rimLight = new THREE.PointLight(0xff5e7e, p.rimI, 80, 2);
        rimLight.position.set(0, 12, -14);

        scene.add(keyLight, fillLight, rimLight);
    }

    /* ---------------- central sculpture ---------------- */
    function buildSculpture() {
        var p = P[T];
        sculpt = new THREE.Group();

        innerMetal = new THREE.Mesh(
            new THREE.IcosahedronGeometry(isMobile ? 6.2 : 7, 1),
            new THREE.MeshStandardMaterial({
                color: p.metal,
                metalness: 0.96,
                roughness: p.metalRough,
                flatShading: true
            })
        );
        sculpt.add(innerMetal);

        outerWire = new THREE.Mesh(
            new THREE.IcosahedronGeometry(isMobile ? 9.4 : 10.6, 1),
            new THREE.MeshBasicMaterial({
                color: p.wire, wireframe: true,
                transparent: true, opacity: p.wireOpacity
            })
        );
        sculpt.add(outerWire);

        ringA = new THREE.Mesh(
            new THREE.TorusGeometry(isMobile ? 12.5 : 13.5, 0.045, 8, 160),
            new THREE.MeshBasicMaterial({ color: p.ringA, transparent: true, opacity: p.ringAOp })
        );
        ringA.rotation.x = Math.PI / 2.15;
        sculpt.add(ringA);

        ringB = new THREE.Mesh(
            new THREE.TorusGeometry(isMobile ? 15.5 : 16.5, 0.03, 8, 180),
            new THREE.MeshBasicMaterial({ color: p.ringB, transparent: true, opacity: p.ringBOp })
        );
        ringB.rotation.x = Math.PI / 2.7;
        ringB.rotation.y = 0.5;
        sculpt.add(ringB);

        scene.add(sculpt);
    }

    /* ---------------- spherical particle halo ---------------- */
    function buildHalo() {
        var count = isMobile ? 650 : 1400;
        var pos = new Float32Array(count * 3);
        var col = new Float32Array(count * 3);
        var c = new THREE.Color();
        var r, theta, phi, flatten = 0.62;

        for (var i = 0; i < count; i++) {
            r = 17 + Math.pow(Math.random(), 1.6) * 19;
            theta = Math.random() * Math.PI * 2;
            phi = Math.acos(2 * Math.random() - 1);
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.cos(phi) * flatten;
            pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 0.75 - 6;

            var t = Math.random();
            if (t < 0.55) c.copy(P[T].haloA);
            else if (t < 0.9) c.copy(P[T].haloB);
            else c.copy(P[T].haloC);
            col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
        }

        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

        halo = new THREE.Points(geo, new THREE.PointsMaterial({
            size: 0.11,
            vertexColors: true,
            transparent: true,
            opacity: P[T].haloOp,
            depthWrite: false,
            blending: P[T].blend,
            sizeAttenuation: true
        }));
        scene.add(halo);
    }

    /* ---------------- near-field drifting dust ---------------- */
    function buildDust() {
        var count = isMobile ? 160 : 320;
        var pos = new Float32Array(count * 3);
        for (var i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 70;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 44;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 26 + 4;
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        dust = new THREE.Points(geo, new THREE.PointsMaterial({
            color: P[T].dust,
            size: 0.09,
            transparent: true,
            opacity: P[T].dustOp,
            depthWrite: false,
            blending: P[T].blend
        }));
        scene.add(dust);
    }

    /* ---------------- soft radial glow behind the sculpture --------------- */
    function buildGlow() {
        var cnv = document.createElement('canvas');
        cnv.width = cnv.height = 256;
        var ctx = cnv.getContext('2d');
        var g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.28, 'rgba(255,255,255,.45)');
        g.addColorStop(0.62, 'rgba(255,255,255,.12)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 256, 256);

        var tex = new THREE.CanvasTexture(cnv);
        glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: tex,
            color: P[T].glowColor,
            transparent: true,
            opacity: P[T].glowOpacity,
            depthWrite: false,
            blending: P[T].blend
        }));
        glowSprite.scale.setScalar(46);
        glowSprite.position.set(0, 0, -8);
        scene.add(glowSprite);
    }

    /* ---------------- interaction ---------------- */
    function onPointerMove(e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    function onResize() {
        isMobile = window.innerWidth < 768;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (prefersReduced) renderFrame(clock.getElapsedTime());
    }

    function onVisibility() {
        if (document.hidden) stopLoop();
        else if (!prefersReduced) startLoop();
    }

    /* ---------------- frame ---------------- */
    function renderFrame(tSec) {
        var t = typeof tSec === 'number' ? tSec : performance.now() / 1000;

        scrollS += (scrollP - scrollS) * 0.06;
        px += ((mouseX * 1.9) - px) * 0.04;
        py += ((mouseY * -1.3) - py) * 0.04;

        /* sculpture: slow self-spin + scroll-driven rotation */
        sculpt.rotation.y = t * 0.05 + scrollS * Math.PI * 1.35;
        sculpt.rotation.x = Math.sin(t * 0.08) * 0.06 + py * 0.12;
        outerWire.rotation.y = -t * 0.032;
        ringA.rotation.z = t * 0.05;
        ringB.rotation.z = -t * 0.035;

        /* orbiting light rig */
        keyLight.position.set(Math.cos(t * 0.21) * 17, 8 + Math.sin(t * 0.13) * 4, Math.sin(t * 0.21) * 17);
        fillLight.position.set(Math.cos(-t * 0.16 + 2.1) * 19, -6 + Math.cos(t * 0.1) * 5, Math.sin(-t * 0.16 + 2.1) * 19);
        rimLight.position.set(Math.cos(t * 0.09 + 4.2) * 13, 12 + Math.sin(t * 0.07) * 3, -12 + Math.sin(t * 0.09 + 4.2) * 8);

        /* halo breathing + rotation */
        halo.rotation.y = t * 0.0085 + scrollS * 0.5;
        halo.material.opacity = P[T].haloOp + Math.sin(t * 0.45) * 0.1;
        dust.rotation.y = -t * 0.004;
        dust.position.y = Math.sin(t * 0.06) * 1.2;

        /* glow pulse */
        glowSprite.material.opacity = P[T].glowOpacity + Math.sin(t * 0.5) * 0.045;

        /* camera dolly with scroll + pointer parallax */
        camera.position.x = px;
        camera.position.y = 0.4 + py + scrollS * -1.2;
        camera.position.z = (isMobile ? P[T].camZ + 6 : P[T].camZ) + scrollS * 7;
        camera.lookAt(px * 0.4, py * 0.3, -4);

        renderer.render(scene, camera);
    }

    function loop() {
        rafId = requestAnimationFrame(loop);
        renderFrame(clock.getElapsedTime());
    }

    function startLoop() {
        if (!running && rafId === null) { running = true; loop(); }
    }

    function stopLoop() {
        running = false;
        if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    }

    /* ---------------- public API ---------------- */

    /* scroll progress 0..1 from page script */
    function setScroll(progress) {
        scrollP = Math.max(0, Math.min(1, progress || 0));
        if (prefersReduced && scene) renderFrame(clock.getElapsedTime());
    }

    function setTheme(next) {
        T = next;
        if (!scene) return;
        var p = P[T];

        scene.background.setHex(p.bg);
        scene.fog.color.setHex(p.fog);
        scene.fog.density = p.fogDensity;

        innerMetal.material.color.setHex(p.metal);
        innerMetal.material.roughness = p.metalRough;

        outerWire.material.color.setHex(p.wire);
        outerWire.material.opacity = p.wireOpacity;

        ringA.material.color.setHex(p.ringA); ringA.material.opacity = p.ringAOp;
        ringB.material.color.setHex(p.ringB); ringB.material.opacity = p.ringBOp;

        recolor(halo.geometry.attributes.color, [p.haloA, p.haloB, p.haloC], [0.55, 0.9, 1]);
        halo.material.opacity = p.haloOp;
        halo.material.blending = p.blend;
        halo.material.needsUpdate = true;

        dust.material.color.copy(p.dust);
        dust.material.opacity = p.dustOp;
        dust.material.blending = p.blend;
        dust.material.needsUpdate = true;

        glowSprite.material.color.setHex(p.glowColor);
        glowSprite.material.opacity = p.glowOpacity;
        glowSprite.material.blending = p.blend;
        glowSprite.material.needsUpdate = true;

        ambLight.color.setHex(p.ambient); ambLight.intensity = p.ambientI;
        keyLight.intensity = p.keyI;
        fillLight.intensity = p.fillI;
        rimLight.intensity = p.rimI;

        if (prefersReduced) renderFrame(clock.getElapsedTime());
    }

    function recolor(attr, colors, stops) {
        var c = new THREE.Color();
        for (var i = 0; i < attr.count; i++) {
            var t = Math.random();
            c.copy(t < stops[0] ? colors[0] : t < stops[1] ? colors[1] : colors[2]);
            attr.setXYZ(i, c.r, c.g, c.b);
        }
        attr.needsUpdate = true;
    }

    window.Bg3D = { setTheme: setTheme, setScroll: setScroll };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
