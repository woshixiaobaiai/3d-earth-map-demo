/**
 * 动画工具函数
 */

// 缓动函数
export const Easing = {
  // 线性
  linear: (t: number): number => t,

  // 缓入
  easeIn: (t: number): number => t * t,

  // 缓出
  easeOut: (t: number): number => t * (2 - t),

  // 缓入缓出
  easeInOut: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // 弹性缓出
  elasticOut: (t: number): number => {
    const p = 0.4;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  },

  // 圆形缓出
  circleOut: (t: number): number => Math.sqrt(1 - Math.pow(t - 1, 2)),
};

// 插值函数
export const Interpolate = {
  // 数值插值
  number: (start: number, end: number, t: number, easing = Easing.easeInOut): number => {
    return start + (end - start) * easing(t);
  },

  // 经纬度插值（考虑经纬度的环形特性）
  coordinate: (
    startLng: number,
    startLat: number,
    endLng: number,
    endLat: number,
    t: number,
    easing = Easing.easeInOut
  ): [number, number] => {
    const progress = easing(t);
    return [startLng + (endLng - startLng) * progress, startLat + (endLat - startLat) * progress];
  },

  // 颜色插值
  color: (startColor: string, endColor: string, t: number, easing = Easing.easeInOut): string => {
    const start = parseColor(startColor);
    const end = parseColor(endColor);
    const progress = easing(t);

    const r = Math.round(start.r + (end.r - start.r) * progress);
    const g = Math.round(start.g + (end.g - start.g) * progress);
    const b = Math.round(start.b + (end.b - start.b) * progress);
    const a = start.a + (end.a - start.a) * progress;

    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
  },
};

// 解析颜色
function parseColor(color: string): { r: number; g: number; b: number; a: number } {
  // 处理 rgba
  if (color.startsWith('rgba')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] ? parseFloat(match[4]) : 1,
      };
    }
  }

  // 处理 rgb
  if (color.startsWith('rgb')) {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: 1,
      };
    }
  }

  // 处理 hex
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b, a: 1 };
  }

  return { r: 0, g: 0, b: 0, a: 1 };
}

// 动画循环
export class AnimationLoop {
  private startTime: number = 0;
  private duration: number;
  private callback: (progress: number) => void;
  private onComplete?: () => void;
  private animationId: number | null = null;
  private isPaused: boolean = false;

  constructor(duration: number, callback: (progress: number) => void, onComplete?: () => void) {
    this.duration = duration;
    this.callback = callback;
    this.onComplete = onComplete;
  }

  start(): void {
    this.startTime = performance.now();
    this.isPaused = false;
    this.animate();
  }

  private animate(): void {
    if (this.isPaused) return;

    const elapsed = performance.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);

    this.callback(progress);

    if (progress < 1) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.onComplete?.();
    }
  }

  pause(): void {
    this.isPaused = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.startTime = performance.now() - (this.duration * Math.min(1, (performance.now() - this.startTime) / this.duration));
      this.animate();
    }
  }

  stop(): void {
    this.isPaused = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// 简单的淡入淡出
export function fadeIn(element: HTMLElement, duration: number = 300): Promise<void> {
  return new Promise((resolve) => {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      setTimeout(resolve, duration);
    });
  });
}

export function fadeOut(element: HTMLElement, duration: number = 300): Promise<void> {
  return new Promise((resolve) => {
    element.style.opacity = '1';
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    requestAnimationFrame(() => {
      element.style.opacity = '0';
      setTimeout(resolve, duration);
    });
  });
}
