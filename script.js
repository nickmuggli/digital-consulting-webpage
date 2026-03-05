// ============================================
// DIGITALCONSULTING — INTERACTIVE ANIMATIONS
// ============================================

(() => {
  'use strict';

  // ===== SHARED MOUSE STATE =====
  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // ===== FILM GRAIN CANVAS =====
  const grainCanvas = document.getElementById('grainCanvas');
  const grainCtx = grainCanvas.getContext('2d');

  function resizeGrain() {
    grainCanvas.width = window.innerWidth / 3;
    grainCanvas.height = window.innerHeight / 3;
  }
  resizeGrain();
  window.addEventListener('resize', resizeGrain);

  function renderGrain() {
    const w = grainCanvas.width;
    const h = grainCanvas.height;
    const imageData = grainCtx.createImageData(w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    grainCtx.putImageData(imageData, 0, 0);
    requestAnimationFrame(renderGrain);
  }
  renderGrain();

  // ===== PAGE REVEAL — hide content until explosion finishes =====
  const pageContent = document.querySelector('.nav-header');
  const mainContent = document.querySelector('main');
  const footerContent = document.querySelector('footer');
  const cursorGlowEl = document.getElementById('cursorGlow');
  [pageContent, mainContent, footerContent, cursorGlowEl].forEach(el => {
    if (el) { el.style.opacity = '0'; el.style.transition = 'none'; }
  });

  function revealPage() {
    [pageContent, mainContent, footerContent, cursorGlowEl].forEach(el => {
      if (el) {
        el.style.transition = 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.opacity = '1';
      }
    });
  }

  // ===== METAL SUPERNOVA PARTICLE SYSTEM =====
  const particleCanvas = document.getElementById('particleCanvas');
  const pCtx = particleCanvas.getContext('2d');

  function resizeParticles() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  }
  resizeParticles();
  window.addEventListener('resize', () => {
    resizeParticles();
    centerX = particleCanvas.width / 2;
    centerY = particleCanvas.height / 2;
  });

  // --- Configuration ---
  const PARTICLE_COUNT = 500;
  const MOUSE_RADIUS = 250;
  const MOUSE_REPEL = 4;
  const CONNECTION_DIST = 120;

  // --- Phase timings (ms) ---
  const PHASE = {
    IMPLODE_DURATION: 2200,
    PULSE_DURATION: 400,
    EXPLODE_DURATION: 1800,
    SETTLE_DURATION: 2200,
  };

  const IMPLODE_END = PHASE.IMPLODE_DURATION;
  const PULSE_END = IMPLODE_END + PHASE.PULSE_DURATION;
  const EXPLODE_END = PULSE_END + PHASE.EXPLODE_DURATION;
  const SETTLE_END = EXPLODE_END + PHASE.SETTLE_DURATION;

  // --- Easing ---
  function easeInCubic(t) { return t * t * t; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
  function easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }

  let centerX = particleCanvas.width / 2;
  let centerY = particleCanvas.height / 2;

  const TWO_PI = Math.PI * 2;

  // --- Generate geometric target positions ---
  function generateGeometricTargets(count, W, H) {
    const targets = [];
    const cx = W / 2, cy = H / 2;
    const maxR = Math.max(W, H) * 0.7;

    // --- Layer 1: Hexagonal grid (50%) ---
    const hexCount = Math.floor(count * 0.5);
    const spacing = 55;
    const cols = Math.ceil(W / spacing) + 2;
    const rows = Math.ceil(H / (spacing * 0.866)) + 2;
    const hexPoints = [];
    for (let row = -2; row < rows; row++) {
      for (let col = -2; col < cols; col++) {
        const px = col * spacing + (row % 2) * (spacing / 2) - W * 0.05;
        const py = row * spacing * 0.866 - H * 0.05;
        if (px > -40 && px < W + 40 && py > -40 && py < H + 40) {
          hexPoints.push({ x: px, y: py });
        }
      }
    }
    for (let i = hexPoints.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [hexPoints[i], hexPoints[j]] = [hexPoints[j], hexPoints[i]];
    }
    for (let i = 0; i < Math.min(hexCount, hexPoints.length); i++) {
      targets.push(hexPoints[i]);
    }

    // --- Layer 2: Concentric rings (30%) ---
    const ringCount = Math.floor(count * 0.3);
    const rings = 6;
    let ringIdx = 0;
    for (let r = 1; r <= rings && ringIdx < ringCount; r++) {
      const radius = (r / rings) * maxR * 0.5;
      const pointsOnRing = Math.floor(12 + r * 8);
      for (let p = 0; p < pointsOnRing && ringIdx < ringCount; p++) {
        const a = (p / pointsOnRing) * TWO_PI + r * 0.2;
        targets.push({ x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius });
        ringIdx++;
      }
    }

    // --- Layer 3: Radial spokes (20%) ---
    const spokeCount = count - targets.length;
    const spokes = 8;
    for (let i = 0; i < spokeCount; i++) {
      const spoke = i % spokes;
      const a = (spoke / spokes) * TWO_PI;
      const dist = 40 + Math.random() * maxR * 0.55;
      targets.push({ x: cx + Math.cos(a) * dist + (Math.random() - 0.5) * 12, y: cy + Math.sin(a) * dist + (Math.random() - 0.5) * 12 });
    }

    return targets;
  }

  const geoTargets = generateGeometricTargets(PARTICLE_COUNT, particleCanvas.width, particleCanvas.height);

  // --- Color palette: cyan/mint metallic (DigitalConsulting brand) ---
  function metalColor(i) {
    const r = Math.random();
    if (r < 0.3) {
      // Bright white-cyan (the "shiny" ones)
      return { h: 190, s: 15 + (i % 20), l: 88 + (i % 12) };
    } else if (r < 0.6) {
      // Electric cyan
      return { h: 195 + (i % 15), s: 70 + (i % 25), l: 65 + (i % 20) };
    } else {
      // Cool mint-teal
      return { h: 170 + (i % 20), s: 40 + (i % 30), l: 60 + (i % 25) };
    }
  }

  // --- Create particles ---
  const particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * TWO_PI;
    const startRadius = 900 + Math.random() * 700;
    const spiralSpeed = 1.0 + Math.random() * 1.5;
    const spiralTwist = (Math.random() - 0.5) * 0.05;
    const color = metalColor(i);
    const isBright = color.l > 85;

    const explodeAngle = angle + (Math.random() - 0.5) * 0.8;
    const explodeVelocity = 250 + Math.random() * 500;
    const tangentialForce = (Math.random() - 0.5) * 180;

    const target = geoTargets[i] || { x: Math.random() * particleCanvas.width, y: Math.random() * particleCanvas.height };

    particles.push({
      angle, radius: startRadius, spiralSpeed, spiralTwist,
      explodeAngle, explodeVelocity, tangentialForce,
      ex: 0, ey: 0,

      x: centerX + Math.cos(angle) * startRadius,
      y: centerY + Math.sin(angle) * startRadius,
      targetX: target.x, targetY: target.y,

      size: isBright ? (1.5 + Math.random() * 2.5) : (0.8 + Math.random() * 2),
      baseSize: isBright ? (1.5 + Math.random() * 2.5) : (0.8 + Math.random() * 2),
      baseAlpha: isBright ? (0.6 + Math.random() * 0.4) : (0.2 + Math.random() * 0.4),
      currentAlpha: 0,
      color,
      isBright,
      pulseOffset: Math.random() * TWO_PI,

      driftX: (Math.random() - 0.5) * 0.12,
      driftY: (Math.random() - 0.5) * 0.12,

      lit: 0, pushX: 0, pushY: 0,
      trail: [],
    });
  }

  // --- Animation state ---
  const animStart = performance.now();
  let bloomAlpha = 0;
  let pageRevealed = false;

  // --- Main render loop ---
  function renderSupernova(now) {
    const elapsed = now - animStart;
    const time = now * 0.001;
    const W = particleCanvas.width;
    const H = particleCanvas.height;

    pCtx.clearRect(0, 0, W, H);

    const isImploding = elapsed < IMPLODE_END;
    const isPulsing = elapsed >= IMPLODE_END && elapsed < PULSE_END;
    const isExploding = elapsed >= PULSE_END && elapsed < EXPLODE_END;
    const isSettling = elapsed >= EXPLODE_END && elapsed < SETTLE_END;
    const isAmbient = elapsed >= SETTLE_END;

    if (isSettling && !pageRevealed) {
      pageRevealed = true;
      revealPage();
    }

    // --- BLOOM FLASH ---
    if (isPulsing) {
      const p = (elapsed - IMPLODE_END) / PHASE.PULSE_DURATION;
      bloomAlpha = Math.sin(p * Math.PI) * 0.7;
    } else if (isExploding && elapsed < PULSE_END + 500) {
      bloomAlpha *= 0.9;
    } else {
      bloomAlpha *= 0.94;
    }

    if (bloomAlpha > 0.005) {
      const r = 500;
      const grad = pCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, r);
      grad.addColorStop(0, `rgba(180, 240, 255, ${bloomAlpha})`);
      grad.addColorStop(0.15, `rgba(100, 220, 255, ${bloomAlpha * 0.7})`);
      grad.addColorStop(0.4, `rgba(0, 183, 255, ${bloomAlpha * 0.3})`);
      grad.addColorStop(1, 'rgba(0, 100, 200, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(centerX - r, centerY - r, r * 2, r * 2);
    }

    // --- Shockwave ring during explosion ---
    if (isExploding) {
      const p = (elapsed - PULSE_END) / PHASE.EXPLODE_DURATION;
      const ringRadius = easeOutCubic(p) * Math.max(W, H) * 0.6;
      const ringAlpha = (1 - p) * 0.25;
      if (ringAlpha > 0.01) {
        pCtx.beginPath();
        pCtx.arc(centerX, centerY, ringRadius, 0, TWO_PI);
        pCtx.strokeStyle = `rgba(0, 220, 255, ${ringAlpha})`;
        pCtx.lineWidth = 2 + (1 - p) * 4;
        pCtx.stroke();
        pCtx.beginPath();
        pCtx.arc(centerX, centerY, ringRadius * 0.7, 0, TWO_PI);
        pCtx.strokeStyle = `rgba(0, 255, 209, ${ringAlpha * 0.4})`;
        pCtx.lineWidth = 1;
        pCtx.stroke();
      }
    }

    const litParticles = [];

    // --- Update & draw ---
    for (const p of particles) {

      // === IMPLODE ===
      if (isImploding) {
        const progress = elapsed / PHASE.IMPLODE_DURATION;
        const eased = easeInCubic(progress);

        p.radius -= p.spiralSpeed * eased * 3.5;
        p.angle += p.spiralTwist + (1 - progress) * 0.01;
        if (p.radius < 1) p.radius = 1;

        // Organic distortion — grows stronger as particles converge to center
        const closeness = 1 - Math.min(p.radius / 180, 1);
        const wobble = closeness * (
          Math.sin(p.angle * 3 + time * 5) * 10 +
          Math.sin(p.angle * 5 - time * 3.7) * 5 +
          Math.sin(time * 7.5 + p.pulseOffset) * 4
        );
        const displayRadius = Math.max(1, p.radius + wobble);

        p.x = centerX + Math.cos(p.angle) * displayRadius;
        p.y = centerY + Math.sin(p.angle) * displayRadius;

        const brightness = easeOutCubic(progress);
        p.currentAlpha = p.baseAlpha * brightness * (p.isBright ? 1.5 : 1);
        p.size = p.baseSize * (0.3 + progress * 0.9);
      }

      // === PULSE ===
      else if (isPulsing) {
        const progress = (elapsed - IMPLODE_END) / PHASE.PULSE_DURATION;
        const intensity = Math.sin(progress * Math.PI);

        // Organic plasma blob — overlapping sine waves distort the shape
        const a = p.angle;
        const t = time;
        const blob = 1
          + Math.sin(a * 2 + t * 6) * 0.35
          + Math.sin(a * 3 - t * 4.5) * 0.2
          + Math.sin(a * 5 + t * 9) * 0.12;

        const baseR = 3 + (1 - intensity) * 10;
        const compressR = Math.max(0.5, baseR * blob + Math.sin(p.pulseOffset + t * 12) * 2.5);

        // Each particle rotates at its own organic speed
        p.angle += 0.015 + p.spiralTwist * 3 + intensity * 0.04;

        p.x = centerX + Math.cos(p.angle) * compressR;
        p.y = centerY + Math.sin(p.angle) * compressR;
        p.currentAlpha = 0.7 + intensity * 0.3;
        p.size = p.baseSize * (1.0 + intensity * 1.2);
        p.ex = 0; p.ey = 0;
        p.trail = [];
      }

      // === EXPLODE ===
      else if (isExploding) {
        const progress = (elapsed - PULSE_END) / PHASE.EXPLODE_DURATION;
        const eased = easeOutQuart(progress);
        const damping = 1 / (1 + progress * 2.5);

        const dist = p.explodeVelocity * eased * damping;
        const tangDist = p.tangentialForce * eased * damping;
        const ac = Math.cos(p.explodeAngle);
        const as = Math.sin(p.explodeAngle);

        p.ex = ac * dist - as * tangDist;
        p.ey = as * dist + ac * tangDist;

        p.x = centerX + p.ex;
        p.y = centerY + p.ey;
        p.currentAlpha = (p.isBright ? 0.9 : p.baseAlpha) * (0.7 + (1 - progress) * 0.3);
        p.size = p.baseSize * (1.6 - progress * 0.6);

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 6) p.trail.shift();
      }

      // === SETTLE ===
      else if (isSettling) {
        const progress = (elapsed - EXPLODE_END) / PHASE.SETTLE_DURATION;
        p.x += (p.targetX - p.x) * 0.04;
        p.y += (p.targetY - p.y) * 0.04;
        p.currentAlpha = p.baseAlpha * (0.4 + easeInOutCubic(progress) * 0.6);
        p.size = p.baseSize;
        p.trail = [];
      }

      // === AMBIENT ===
      else {
        p.x += p.driftX;
        p.y += p.driftY;

        if (p.x < -30) p.x = W + 30;
        if (p.x > W + 30) p.x = -30;
        if (p.y < -30) p.y = H + 30;
        if (p.y > H + 30) p.y = -30;

        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && mouseX > 0) {
          const proximity = 1 - (dist / MOUSE_RADIUS);
          p.lit += (proximity - p.lit) * 0.18;

          if (dist > 1) {
            const force = MOUSE_REPEL * proximity * proximity;
            p.pushX += (dx / dist) * force;
            p.pushY += (dy / dist) * force;
          }
        } else {
          p.lit *= 0.92;
        }

        p.x += p.pushX;
        p.y += p.pushY;
        p.pushX *= 0.9;
        p.pushY *= 0.9;

        const pulse = Math.sin(time * 1.5 + p.pulseOffset) * 0.06;
        p.currentAlpha = p.baseAlpha + pulse + p.lit * 0.7;
        p.size = p.baseSize * (1 + p.lit * 0.8);

        if (p.lit > 0.04) litParticles.push(p);
      }

      // === DRAW ===
      const alpha = Math.max(0, Math.min(1, p.currentAlpha));
      if (alpha < 0.005) continue;

      const { h, s, l } = p.color;

      // --- Explosion trails ---
      if (p.trail.length > 1) {
        for (let t = 0; t < p.trail.length - 1; t++) {
          const trailAlpha = (t / p.trail.length) * alpha * 0.3;
          pCtx.beginPath();
          pCtx.arc(p.trail[t].x, p.trail[t].y, p.size * 0.4, 0, TWO_PI);
          pCtx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${trailAlpha})`;
          pCtx.fill();
        }
      }

      // --- Outer glow ---
      const glowAmount = isAmbient ? p.lit :
        (isPulsing ? 0.8 : (isExploding ? 0.5 : (isImploding ? easeInCubic(elapsed / PHASE.IMPLODE_DURATION) * 0.3 : 0)));
      if (glowAmount > 0.03) {
        const glowSize = p.size * (p.isBright ? 8 : 5);
        const glowGrad = pCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
        glowGrad.addColorStop(0, `hsla(${h}, ${s}%, ${Math.min(100, l + 20)}%, ${glowAmount * 0.2})`);
        glowGrad.addColorStop(0.5, `hsla(${h}, ${s}%, ${l}%, ${glowAmount * 0.06})`);
        glowGrad.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
        pCtx.fillStyle = glowGrad;
        pCtx.fillRect(p.x - glowSize, p.y - glowSize, glowSize * 2, glowSize * 2);
      }

      // --- Bright core ---
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.size, 0, TWO_PI);
      pCtx.fillStyle = `hsla(${h}, ${s}%, ${Math.min(100, l + (p.lit || (isPulsing ? 1 : 0)) * 35)}%, ${alpha})`;
      pCtx.fill();

      // --- White specular highlight for bright particles ---
      if (p.isBright && alpha > 0.3) {
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size * 0.4, 0, TWO_PI);
        pCtx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        pCtx.fill();
      }
    }

    // === GEOMETRIC CONNECTION LINES ===
    if (litParticles.length > 1) {
      pCtx.lineWidth = 0.6;
      for (let i = 0; i < litParticles.length; i++) {
        for (let j = i + 1; j < litParticles.length; j++) {
          const a = litParticles[i], b = litParticles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const lineAlpha = (1 - dist / CONNECTION_DIST) * Math.min(a.lit, b.lit) * 0.4;
            pCtx.beginPath();
            pCtx.moveTo(a.x, a.y);
            pCtx.lineTo(b.x, b.y);
            pCtx.strokeStyle = `rgba(0, 220, 255, ${lineAlpha})`;
            pCtx.stroke();
          }
        }
      }
    }

    requestAnimationFrame(renderSupernova);
  }

  requestAnimationFrame(renderSupernova);

  // ===== CONNECTION LINES CANVAS (impact map) =====
  const connectionCanvases = document.querySelectorAll('.card-canvas[data-effect="connections"]');

  connectionCanvases.forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;

    function resize() {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const nodes = parent.querySelectorAll('.node');

    function drawConnections() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now() * 0.001;
      const centerNode = parent.querySelector('.node-center');
      if (!centerNode) return;

      const centerRect = centerNode.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      const cx = centerRect.left + centerRect.width / 2 - parentRect.left;
      const cy = centerRect.top + centerRect.height / 2 - parentRect.top;

      nodes.forEach((node, i) => {
        if (node.classList.contains('node-center')) return;

        const nodeRect = node.getBoundingClientRect();
        const nx = nodeRect.left + nodeRect.width / 2 - parentRect.left;
        const ny = nodeRect.top + nodeRect.height / 2 - parentRect.top;

        const gradient = ctx.createLinearGradient(cx, cy, nx, ny);
        const alpha = 0.15 + Math.sin(time * 2 + i) * 0.08;
        gradient.addColorStop(0, `rgba(0, 183, 255, ${alpha})`);
        gradient.addColorStop(1, `rgba(0, 183, 255, ${alpha * 0.3})`);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -time * 20;
        ctx.stroke();
        ctx.setLineDash([]);

        const dotProgress = ((time * 0.3 + i * 0.3) % 1);
        const dotX = cx + (nx - cx) * dotProgress;
        const dotY = cy + (ny - cy) * dotProgress;

        ctx.beginPath();
        ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 183, 255, ${0.5 + Math.sin(time * 3) * 0.2})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 183, 255, 0.1)';
        ctx.fill();
      });

      requestAnimationFrame(drawConnections);
    }

    setTimeout(drawConnections, 200);
  });

  // ===== CURSOR GLOW =====
  const cursorGlow = document.getElementById('cursorGlow');
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', () => {
    cursorGlow.classList.add('active');
  });

  document.addEventListener('mouseleave', () => {
    cursorGlow.classList.remove('active');
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();

  // ===== 3D TILT EFFECT =====
  document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -2.5;
      const rotateY = ((x - centerX) / centerX) * 2.5;

      el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.008)`;
      el.style.transition = 'transform 0.1s ease-out';

      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      el.style.setProperty('--mouse-x', percentX + '%');
      el.style.setProperty('--mouse-y', percentY + '%');
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)';
      el.style.transition = 'transform 0.6s ease-out';
    });
  });

  // ===== INTEGRATION CARD HOVER GLOW =====
  document.querySelectorAll('.integration-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });

  // ===== SCROLL REVEAL =====
  const revealElements = document.querySelectorAll('.reveal-up');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ===== COUNTER ANIMATION =====
  const counters = document.querySelectorAll('.counter');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2500;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          counter.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(updateCounter);
        }

        requestAnimationFrame(updateCounter);
        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  // ===== NAV SCROLL EFFECT =====
  const navHeader = document.querySelector('.nav-header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navHeader.style.background = 'rgba(6, 13, 31, 0.95)';
      navHeader.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
    } else {
      navHeader.style.background = 'rgba(6, 13, 31, 0.75)';
      navHeader.style.borderBottomColor = 'rgba(255, 255, 255, 0.06)';
    }
  });

  // ===== FEATURE TABS =====
  document.querySelectorAll('.feature-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.feature-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // ===== HERO PARALLAX =====
  const heroCard = document.querySelector('.hero-card');
  const hero = document.querySelector('.hero');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    if (scrollY < heroBottom && heroCard) {
      const progress = scrollY / heroBottom;
      heroCard.style.transform = `translateY(${progress * -30}px)`;
    }
  });

  // ===== UPTIME BARS ANIMATION =====
  const uptimeBars = document.querySelectorAll('.uptime-bar');

  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        uptimeBars.forEach((bar, i) => {
          const height = bar.getAttribute('data-height');
          bar.style.transitionDelay = `${i * 0.08}s`;
          setTimeout(() => {
            bar.style.height = height + '%';
          }, 100);
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  if (uptimeBars.length > 0) {
    barObserver.observe(uptimeBars[0].closest('.uptime-graph'));
  }

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== EMAIL CTA FALLBACK (desktop) =====
  const isMobileViewport = () => window.matchMedia('(max-width: 900px)').matches;
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (isMobileViewport()) return;

      const rawHref = link.getAttribute('href') || '';
      const email = rawHref.replace(/^mailto:/i, '').split('?')[0].trim();
      if (!email) return;

      e.preventDefault();
      const gmailCompose = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
      const win = window.open(gmailCompose, '_blank', 'noopener,noreferrer');
      if (!win) {
        window.location.href = rawHref;
      }
    });
  });

  // ===== NODE FLOATING (impact map) =====
  const floatNodes = document.querySelectorAll('.node:not(.node-center)');

  floatNodes.forEach((node, i) => {
    const amplitude = 2 + Math.random() * 3;
    const speed = 2500 + Math.random() * 1500;
    const offset = Math.random() * Math.PI * 2;

    function floatNode() {
      const time = Date.now() / speed;
      const y = Math.sin(time + offset) * amplitude;
      const x = Math.cos(time * 0.7 + offset) * (amplitude * 0.6);
      node.style.marginTop = y + 'px';
      node.style.marginLeft = x + 'px';
      requestAnimationFrame(floatNode);
    }

    floatNode();
  });

  // ===== PROOF VERB WORD ROTATION =====
  const proofVerb = document.querySelector('.proof-verb');
  if (proofVerb) {
    const words = ['convert', 'scale', 'optimize', 'capture'];
    let wordIndex = 0;

    setInterval(() => {
      proofVerb.style.opacity = '0';
      proofVerb.style.transform = 'translateY(8px)';
      proofVerb.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

      setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        proofVerb.textContent = words[wordIndex];
        proofVerb.style.opacity = '1';
        proofVerb.style.transform = 'translateY(0)';
      }, 300);
    }, 3000);
  }

  // ===== SARA VOICE ASSISTANT (Gemini Live Audio) =====
  const GEMINI_API_KEY = '__GEMINI_API_KEY__';
  const GEMINI_WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
  const CAL_API_KEY = '__CAL_API_KEY__';
  const CAL_USERNAME = 'gabriele-tupini-da60rn';
  const CAL_EVENT_SLUG = '15min';
  const CAL_API_BASE = 'https://api.cal.com/v2';

  // DOM elements
  const saraToggle = document.getElementById('saraToggle');
  const saraOverlay = document.getElementById('saraOverlay');
  const saraBack = document.getElementById('saraBack');
  const saraOrb = document.getElementById('saraOrb');
  const saraOrbWrap = document.querySelector('.sara-orb-wrap');
  const saraMicIcon = document.getElementById('saraMicIcon');
  const saraMicOffIcon = document.getElementById('saraMicOffIcon');
  const saraStatusEl = document.getElementById('saraStatus');
  const saraStartCall = document.getElementById('saraStartCall');
  const saraEndCall = document.getElementById('saraEndCall');
  const saraErrorEl = document.getElementById('saraError');

  // State
  let saraWs = null;
  let saraAudioCtx = null;
  let saraPlaybackCtx = null;
  let saraStream = null;
  let saraProcessor = null;
  let saraActiveSources = [];
  let saraNextStartTime = 0;
  let saraSpeakingTimeout = null;
  let saraIsConnected = false;
  let saraIsConnecting = false;
  let saraIsSpeaking = false;

  // AudioWorklet code for real-time mic capture
  const pcmWorkletCode = `
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input.length > 0 && input[0].length > 0) {
      this.port.postMessage(input[0]);
    }
    return true;
  }
}
registerProcessor('pcm-processor', PCMProcessor);
`;

  function floatTo16BitPCM(float32) {
    const buffer = new ArrayBuffer(float32.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  }

  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function buildSaraSystemPrompt() {
    const callerTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const callerTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: callerTz });
    const todayDate = new Date().toISOString().split('T')[0];

    return `Your name is Sara, and you are the AI voice assistant for DigitalConsulting, a performance marketing and revenue infrastructure agency. You are warm, professional, and confident — you speak like a senior strategist who genuinely loves helping businesses grow. Keep responses concise and conversational since this is a voice call. Avoid long monologues.

When the call starts, introduce yourself briefly and immediately ask what the caller needs. Example:
"Hi, I'm Sara from DigitalConsulting! Are you looking to chat about our services, or would you like to schedule a free revenue audit with our team?"

Timezone info:
- The caller's timezone is ${callerTz} and their local time is ${callerTime}.
- Today's date is ${todayDate}.

About DigitalConsulting:
DigitalConsulting builds AI-powered revenue infrastructure for growth-focused businesses. We combine Google and Meta performance marketing, enterprise-level tracking systems, and 24/7 AI appointment capture to turn marketing into predictable revenue.

What we do:
- Google Ads management and optimization
- Meta (Facebook/Instagram) Ads management
- Enterprise-level tracking (GA4, GTM, Meta CAPI, server-side tracking)
- AI Secretary — 24/7 automated inbound call handling and appointment booking
- Landing page design and conversion rate optimization
- Video ad creative and UGC direction

Core philosophy: Infrastructure First. Scaling Second.
Step 1: Infrastructure Audit — analyze tracking, booking rates, and revenue leakage.
Step 2: Build the System — landing pages, tracking, AI call automation, ad architecture.
Step 3: Optimize and Scale — structured testing, budget allocation, revenue-based scaling.

Results:
- Average +312% revenue lift for clients
- 5x+ ROAS track record
- -28% average CPA reduction
- +32% booked appointment lift

Contact:
- Email: gabrieletupini@gmail.com
- Phone: +1 (612) 398-5577
- WhatsApp: +1 (612) 398-5577

Pricing Policy:
IMPORTANT: Never quote specific prices or price ranges. Every engagement depends on current infrastructure, ad spend level, and revenue goals. Always redirect pricing questions toward booking a free revenue audit.

When the caller wants to book or learn more, gather these details naturally, one at a time:
1. Name — use it throughout the call
2. Business type / industry
3. Current marketing channels and approximate ad spend
4. Main goal (more leads, lower CPA, better tracking, etc.)
5. Email address — spell it back letter by letter to confirm. Say: "Just to make sure I got that right — that's J-O-H-N at example dot com, correct?"

Once you have at least their name, email, and what they need, move to booking.

Booking a Consultation:
You can book a consultation directly for the caller — no forms, no links, everything happens through this voice call. You have two tools:

Step 1: Check available slots
Use get_available_slots to look up open time slots. Ask the caller when they'd prefer to meet (e.g. "Do you prefer this week or next week? Morning or afternoon?"), then call the function with the appropriate date range.
- Present 3–5 good options to the caller in their local time.
- Example: "I've got a few great options for you. How about Tuesday at 10 AM, Wednesday at 2 PM, or Thursday at 11 AM — your time?"

Step 2: Book the slot
Once the caller picks a time, use book_consultation with their name, email, and the chosen time slot.
Before calling the function, briefly say: "Perfect, let me lock that in for you now."
- If the response says success: Say enthusiastically: "You're all set! You'll get a confirmation email shortly. The team is looking forward to chatting with you! Is there anything else I can help with?"
- If the response says failure: Say: "Hmm, something went wrong on my end. No worries — you can also book directly at cal.com/gabriele-tupini-da60rn/15min, or I can have the team reach out to you by email."

Important booking notes:
- Always gather name and email before booking.
- Always spell back the email to confirm before booking.
- The consultation is free, 15 minutes — no commitment.
- If the caller changes their mind about the time, just check slots again and rebook.

Conversation Guidelines:
- Be concise. This is a voice call. Keep answers to 2-3 sentences.
- Be data-driven — reference specific metrics when relevant.
- Never discuss specific prices. Always redirect to a revenue audit.
- Always offer a next step.
- If you don't know something, say: "Great question — I'll have the team follow up on that directly."
- Tone: Confident, strategic, approachable. Think senior consultant, not salesperson.`;
  }

  function updateSaraUI() {
    // Orb states
    saraOrb.classList.toggle('connected', saraIsConnected);
    saraOrb.classList.toggle('connecting', saraIsConnecting);
    saraOrb.classList.toggle('speaking', saraIsConnected && saraIsSpeaking);
    saraOrbWrap.classList.toggle('connected', saraIsConnected);
    saraOrbWrap.classList.toggle('speaking', saraIsConnected && saraIsSpeaking);

    // Mic icon
    if (saraIsConnected) {
      saraMicIcon.style.display = '';
      saraMicOffIcon.style.display = 'none';
    } else {
      saraMicIcon.style.display = 'none';
      saraMicOffIcon.style.display = '';
    }

    // Status text
    saraStatusEl.className = 'sara-call-status';
    if (saraIsConnecting) {
      saraStatusEl.textContent = 'Connecting\u2026';
      saraStatusEl.classList.add('connecting');
    } else if (saraIsConnected && saraIsSpeaking) {
      saraStatusEl.textContent = 'Speaking\u2026';
      saraStatusEl.classList.add('speaking');
    } else if (saraIsConnected) {
      saraStatusEl.textContent = 'Listening\u2026';
      saraStatusEl.classList.add('listening');
    } else {
      saraStatusEl.textContent = 'Ready';
    }

    // Buttons
    saraStartCall.style.display = saraIsConnected ? 'none' : '';
    saraEndCall.style.display = saraIsConnected ? '' : 'none';
    saraStartCall.disabled = saraIsConnecting;
    saraStartCall.textContent = saraIsConnecting ? 'Connecting\u2026' : '';
    if (!saraIsConnecting) {
      saraStartCall.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> Start call';
    }
  }

  function handleInterruption() {
    saraActiveSources.forEach(function(s) { try { s.stop(); } catch(_) {} });
    saraActiveSources = [];
    if (saraPlaybackCtx) {
      saraNextStartTime = saraPlaybackCtx.currentTime;
    }
    saraIsSpeaking = false;
    updateSaraUI();
  }

  function playPCMAudio(base64Data) {
    if (!saraPlaybackCtx) return;
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }

    const audioBuffer = saraPlaybackCtx.createBuffer(1, float32.length, 24000);
    audioBuffer.getChannelData(0).set(float32);

    const source = saraPlaybackCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(saraPlaybackCtx.destination);

    const startTime = Math.max(saraPlaybackCtx.currentTime, saraNextStartTime);
    source.start(startTime);
    saraActiveSources.push(source);

    saraIsSpeaking = true;
    updateSaraUI();

    if (saraSpeakingTimeout) clearTimeout(saraSpeakingTimeout);
    saraSpeakingTimeout = setTimeout(function() {
      saraIsSpeaking = false;
      updateSaraUI();
    }, (startTime - saraPlaybackCtx.currentTime + audioBuffer.duration) * 1000);

    source.onended = function() {
      saraActiveSources = saraActiveSources.filter(function(s) { return s !== source; });
    };

    saraNextStartTime = startTime + audioBuffer.duration;
  }

  // Cal.com API functions
  async function fetchAvailableSlots(startDate, endDate, timeZone) {
    const params = new URLSearchParams({
      eventTypeSlug: CAL_EVENT_SLUG,
      'usernameList[]': CAL_USERNAME,
      start: startDate,
      end: endDate,
      timeZone: timeZone
    });
    const res = await fetch(CAL_API_BASE + '/slots/available?' + params, {
      headers: {
        'cal-api-version': '2024-09-04',
        'Authorization': 'Bearer ' + CAL_API_KEY
      }
    });
    if (!res.ok) throw new Error('Cal.com slots error: ' + res.status);
    const json = await res.json();
    return json.data;
  }

  async function createBooking(startTime, attendeeName, attendeeEmail, attendeeTimeZone) {
    const res = await fetch(CAL_API_BASE + '/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cal-api-version': '2024-08-13',
        'Authorization': 'Bearer ' + CAL_API_KEY
      },
      body: JSON.stringify({
        start: startTime,
        eventTypeSlug: CAL_EVENT_SLUG,
        username: CAL_USERNAME,
        attendee: {
          name: attendeeName,
          email: attendeeEmail,
          timeZone: attendeeTimeZone
        }
      })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error('Cal.com booking error: ' + res.status + ' — ' + text);
    }
    return await res.json();
  }

  async function saraConnect() {
    try {
      saraIsConnecting = true;
      saraErrorEl.textContent = '';
      updateSaraUI();

      // Create playback context at 24kHz
      saraPlaybackCtx = new AudioContext({ sampleRate: 24000 });
      if (saraPlaybackCtx.state === 'suspended') await saraPlaybackCtx.resume();
      saraNextStartTime = saraPlaybackCtx.currentTime;

      // Get mic access
      saraStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create capture context at 16kHz
      saraAudioCtx = new AudioContext({ sampleRate: 16000 });
      if (saraAudioCtx.state === 'suspended') await saraAudioCtx.resume();
      const micSource = saraAudioCtx.createMediaStreamSource(saraStream);

      // Load AudioWorklet
      const workletBlob = new Blob([pcmWorkletCode], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(workletBlob);
      await saraAudioCtx.audioWorklet.addModule(workletUrl);
      URL.revokeObjectURL(workletUrl);

      saraProcessor = new AudioWorkletNode(saraAudioCtx, 'pcm-processor');
      micSource.connect(saraProcessor);
      saraProcessor.connect(saraAudioCtx.destination);

      // Connect WebSocket to Gemini Live API
      const wsUrl = GEMINI_WS_URL + '?key=' + GEMINI_API_KEY;
      saraWs = new WebSocket(wsUrl);

      saraWs.onopen = function() {
        // Send setup message
        saraWs.send(JSON.stringify({
          setup: {
            model: 'models/gemini-2.5-flash-native-audio-preview-09-2025',
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Zephyr' }
                }
              }
            },
            systemInstruction: {
              parts: [{ text: buildSaraSystemPrompt() }]
            },
            tools: [{
              functionDeclarations: [
                {
                  name: 'get_available_slots',
                  description: 'Check available consultation time slots for a given date range. Call this when the caller wants to book and you need to offer them specific times.',
                  parameters: {
                    type: 'OBJECT',
                    properties: {
                      start_date: { type: 'STRING', description: 'Start date in YYYY-MM-DD format' },
                      end_date: { type: 'STRING', description: 'End date in YYYY-MM-DD format, max 7 days from start' }
                    },
                    required: ['start_date', 'end_date']
                  }
                },
                {
                  name: 'book_consultation',
                  description: 'Book a specific consultation time slot. Call this after the caller picks a time from the available slots.',
                  parameters: {
                    type: 'OBJECT',
                    properties: {
                      caller_name: { type: 'STRING', description: "The caller's full name" },
                      caller_email: { type: 'STRING', description: "The caller's email address" },
                      start_time: { type: 'STRING', description: 'The selected slot start time in ISO 8601 format (must be one of the times returned by get_available_slots)' }
                    },
                    required: ['caller_name', 'caller_email', 'start_time']
                  }
                }
              ]
            }]
          }
        }));
      };

      saraWs.onmessage = function(event) {
        let msg;
        try { msg = JSON.parse(event.data); } catch(_) { return; }

        // Setup complete — start streaming mic
        if (msg.setupComplete) {
          saraIsConnecting = false;
          saraIsConnected = true;
          updateSaraUI();

          // Stream mic audio to Gemini
          saraProcessor.port.onmessage = function(e) {
            if (saraWs && saraWs.readyState === WebSocket.OPEN) {
              const pcm = floatTo16BitPCM(e.data);
              const b64 = arrayBufferToBase64(pcm);
              saraWs.send(JSON.stringify({
                realtimeInput: {
                  mediaChunks: [{
                    data: b64,
                    mimeType: 'audio/pcm;rate=16000'
                  }]
                }
              }));
            }
          };
          return;
        }

        // Handle tool calls (Cal.com booking)
        if (msg.toolCall && msg.toolCall.functionCalls) {
          var callerTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          msg.toolCall.functionCalls.forEach(function(fc) {
            if (fc.name === 'get_available_slots') {
              var args = fc.args || {};
              fetchAvailableSlots(args.start_date, args.end_date, callerTz)
                .then(function(slots) {
                  // Format slots nicely for Sara to read out
                  var formatted = {};
                  Object.keys(slots).forEach(function(date) {
                    var d = new Date(date + 'T12:00:00Z');
                    var label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
                    formatted[label] = slots[date].map(function(t) {
                      var dt = new Date(t.start);
                      return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: callerTz });
                    });
                  });
                  saraWs.send(JSON.stringify({
                    toolResponse: {
                      functionResponses: [{
                        id: fc.id,
                        name: fc.name,
                        response: { available_slots: formatted, timezone: callerTz, raw_slots: slots }
                      }]
                    }
                  }));
                })
                .catch(function(err) {
                  console.error('Failed to fetch slots:', err);
                  saraWs.send(JSON.stringify({
                    toolResponse: {
                      functionResponses: [{
                        id: fc.id,
                        name: fc.name,
                        response: { error: 'Failed to fetch available slots. Suggest the caller visit cal.com/gabriele-tupini-da60rn/15min directly.' }
                      }]
                    }
                  }));
                });
            }
            if (fc.name === 'book_consultation') {
              var bArgs = fc.args || {};
              createBooking(bArgs.start_time, bArgs.caller_name, bArgs.caller_email, callerTz)
                .then(function() {
                  saraWs.send(JSON.stringify({
                    toolResponse: {
                      functionResponses: [{
                        id: fc.id,
                        name: fc.name,
                        response: { success: true, message: 'Booking confirmed!' }
                      }]
                    }
                  }));
                })
                .catch(function(err) {
                  console.error('Failed to book:', err);
                  saraWs.send(JSON.stringify({
                    toolResponse: {
                      functionResponses: [{
                        id: fc.id,
                        name: fc.name,
                        response: { success: false, message: err.message }
                      }]
                    }
                  }));
                });
            }
          });
          return;
        }

        // Audio response from Gemini
        if (msg.serverContent) {
          if (msg.serverContent.interrupted) {
            handleInterruption();
            return;
          }
          const parts = msg.serverContent.modelTurn && msg.serverContent.modelTurn.parts;
          if (parts) {
            for (let i = 0; i < parts.length; i++) {
              if (parts[i].inlineData && parts[i].inlineData.data) {
                playPCMAudio(parts[i].inlineData.data);
              }
            }
          }
        }
      };

      saraWs.onclose = function() {
        saraDisconnect();
      };

      saraWs.onerror = function(e) {
        console.error('Sara WebSocket error:', e);
        saraErrorEl.textContent = 'Connection error. Please try again.';
        saraDisconnect();
      };

    } catch (err) {
      console.error('Sara connect failed:', err);
      saraErrorEl.textContent = err.message || 'Failed to connect. Check microphone permissions.';
      saraIsConnecting = false;
      updateSaraUI();
      saraDisconnect();
    }
  }

  function saraDisconnect() {
    if (saraWs) {
      try { saraWs.close(); } catch(_) {}
      saraWs = null;
    }
    if (saraStream) {
      saraStream.getTracks().forEach(function(t) { t.stop(); });
      saraStream = null;
    }
    if (saraAudioCtx) {
      saraAudioCtx.close();
      saraAudioCtx = null;
    }
    if (saraPlaybackCtx) {
      saraPlaybackCtx.close();
      saraPlaybackCtx = null;
    }
    if (saraSpeakingTimeout) {
      clearTimeout(saraSpeakingTimeout);
      saraSpeakingTimeout = null;
    }
    saraProcessor = null;
    saraActiveSources = [];
    saraIsConnected = false;
    saraIsConnecting = false;
    saraIsSpeaking = false;
    updateSaraUI();
  }

  // Event listeners
  if (saraToggle && saraOverlay) {
    const saraMobileMedia = window.matchMedia('(max-width: 600px)');
    let lastScrollY = window.scrollY || 0;
    let saraScrollTicking = false;

    function updateSaraToggleOnScroll() {
      saraScrollTicking = false;
      if (!saraMobileMedia.matches) {
        saraToggle.classList.remove('sara-toggle-hidden');
        lastScrollY = window.scrollY || 0;
        return;
      }
      if (!saraOverlay.hasAttribute('hidden')) return;

      const currentScrollY = window.scrollY || 0;
      const isNearTop = currentScrollY < 80;
      const isScrollingDown = currentScrollY > lastScrollY + 6;
      const isScrollingUp = currentScrollY < lastScrollY - 6;

      if (isNearTop || isScrollingUp) {
        saraToggle.classList.remove('sara-toggle-hidden');
      } else if (isScrollingDown) {
        saraToggle.classList.add('sara-toggle-hidden');
      }

      lastScrollY = currentScrollY;
    }

    function handleSaraScroll() {
      if (saraScrollTicking) return;
      saraScrollTicking = true;
      window.requestAnimationFrame(updateSaraToggleOnScroll);
    }

    window.addEventListener('scroll', handleSaraScroll, { passive: true });
    window.addEventListener('resize', updateSaraToggleOnScroll);
    if (typeof saraMobileMedia.addEventListener === 'function') {
      saraMobileMedia.addEventListener('change', updateSaraToggleOnScroll);
    } else if (typeof saraMobileMedia.addListener === 'function') {
      saraMobileMedia.addListener(updateSaraToggleOnScroll);
    }
    updateSaraToggleOnScroll();

    saraToggle.addEventListener('click', function() {
      saraOverlay.removeAttribute('hidden');
      saraToggle.classList.remove('sara-toggle-hidden');
      saraToggle.style.display = 'none';
    });

    saraBack.addEventListener('click', function() {
      if (saraIsConnected) saraDisconnect();
      saraOverlay.setAttribute('hidden', '');
      saraToggle.style.display = '';
      updateSaraToggleOnScroll();
    });

    saraStartCall.addEventListener('click', function() {
      if (!saraIsConnecting && !saraIsConnected) saraConnect();
    });

    saraEndCall.addEventListener('click', function() {
      saraDisconnect();
    });
  }

})();
