import React, { useRef, useEffect, useCallback } from 'react';

/**
 * Canvas 2D cloth simulation for curtain opening.
 * Uses Verlet integration with distance constraints.
 * Two curtain panels pinned at top, slide apart on open.
 * Smooth, heavy, no bounce — just graceful drape.
 */

// Physics constants — tuned for smooth heavy fabric
const GRAVITY = 0.3;
const DAMPING = 0.97;
const CONSTRAINT_ITERATIONS = 5;

class Point {
  constructor(x, y, pinned = false) {
    this.x = x;
    this.y = y;
    this.oldX = x;
    this.oldY = y;
    this.pinned = pinned;
    this.pinX = x;
  }

  update() {
    if (this.pinned) {
      this.x += (this.pinX - this.x) * 0.06;
      this.oldX = this.x;
      this.oldY = this.y;
      return;
    }
    const vx = (this.x - this.oldX) * DAMPING;
    const vy = (this.y - this.oldY) * DAMPING;
    this.oldX = this.x;
    this.oldY = this.y;
    this.x += vx;
    this.y += vy + GRAVITY;
  }
}

class Constraint {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    this.restLength = Math.sqrt(dx * dx + dy * dy);
  }

  solve() {
    const dx = this.p2.x - this.p1.x;
    const dy = this.p2.y - this.p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;
    const diff = (dist - this.restLength) / dist * 0.5;
    const offsetX = dx * diff;
    const offsetY = dy * diff;
    if (!this.p1.pinned) { this.p1.x += offsetX; this.p1.y += offsetY; }
    if (!this.p2.pinned) { this.p2.x -= offsetX; this.p2.y -= offsetY; }
  }
}

function createCurtainPanel(startX, endX, top, bottom, cols, rows) {
  const points = [];
  const constraints = [];
  const spacingX = (endX - startX) / (cols - 1);
  const spacingY = (bottom - top) / (rows - 1);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * spacingX;
      const y = top + r * spacingY;
      const pinned = r === 0;
      points.push(new Point(x, y, pinned));
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      constraints.push(new Constraint(points[r * cols + c], points[r * cols + c + 1]));
    }
  }
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      constraints.push(new Constraint(points[r * cols + c], points[(r + 1) * cols + c]));
    }
  }

  return { points, constraints, cols, rows };
}

function renderPanel(ctx, panel) {
  const { points, cols, rows } = panel;

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const i = r * cols + c;
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + cols + 1];
      const p4 = points[i + cols];

      // Fold shading based on column
      const shade = Math.sin(c * 0.7) * 15;
      const red = Math.min(95, Math.max(40, 70 + shade));
      const green = Math.min(20, Math.max(8, 14 + shade * 0.2));
      const blue = Math.min(20, Math.max(8, 14 + shade * 0.2));

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.fill();
    }
  }
}

export default function ClothCurtain({ isOpen, onOpenComplete }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const leftPanel = useRef(null);
  const rightPanel = useRef(null);
  const openProgress = useRef(0);
  const hasCompleted = useRef(false);

  const init = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cols = 20;
    const rows = 28;

    leftPanel.current = createCurtainPanel(-60, w * 0.55, -20, h + 100, cols, rows);
    rightPanel.current = createCurtainPanel(w * 0.45, w + 60, -20, h + 100, cols, rows);
    hasCompleted.current = false;
    openProgress.current = 0;
  }, []);

  useEffect(() => {
    init();
    const handleResize = () => init();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [init]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;

      const lp = leftPanel.current;
      const rp = rightPanel.current;
      if (!lp || !rp) { animRef.current = requestAnimationFrame(animate); return; }

      // Opening
      if (isOpen && openProgress.current < 1) {
        openProgress.current = Math.min(1, openProgress.current + 0.003);
        const eased = 1 - Math.pow(1 - openProgress.current, 3);

        for (let c = 0; c < lp.cols; c++) {
          const originalX = -60 + (c / (lp.cols - 1)) * (w * 0.55 + 60);
          lp.points[c].pinX = originalX - eased * (w * 0.85);
        }
        for (let c = 0; c < rp.cols; c++) {
          const originalX = w * 0.45 + (c / (rp.cols - 1)) * (w * 0.55 + 60);
          rp.points[c].pinX = originalX + eased * (w * 0.85);
        }

        if (openProgress.current >= 1 && !hasCompleted.current) {
          hasCompleted.current = true;
          onOpenComplete?.();
        }
      }

      // Closing
      if (!isOpen && openProgress.current > 0) {
        openProgress.current = Math.max(0, openProgress.current - 0.004);
        const eased = 1 - Math.pow(1 - openProgress.current, 3);

        for (let c = 0; c < lp.cols; c++) {
          const originalX = -60 + (c / (lp.cols - 1)) * (w * 0.55 + 60);
          lp.points[c].pinX = originalX - eased * (w * 0.85);
        }
        for (let c = 0; c < rp.cols; c++) {
          const originalX = w * 0.45 + (c / (rp.cols - 1)) * (w * 0.55 + 60);
          rp.points[c].pinX = originalX + eased * (w * 0.85);
        }
      }

      // Physics
      const updatePanel = (panel) => {
        for (const p of panel.points) p.update();
        for (let i = 0; i < CONSTRAINT_ITERATIONS; i++) {
          for (const c of panel.constraints) c.solve();
        }
      };

      updatePanel(lp);
      updatePanel(rp);

      // Render
      ctx.clearRect(0, 0, w, h);
      renderPanel(ctx, lp);
      renderPanel(ctx, rp);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isOpen, onOpenComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    />
  );
}
