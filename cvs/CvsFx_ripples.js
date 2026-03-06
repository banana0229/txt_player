const CvsFx_ripples = (() => {
  class WaterRipples {
    constructor(cvs, opt = {}) {
      this.cvs = cvs;
      this.x = +opt.x || cvs.width / 2;
      this.y = +opt.y || cvs.height / 2;
      this.delay = -opt.delay || 0;
      this.size = +opt.size || 100;
      this.color = opt.color || "#fff";
      this.blur = +opt.blur || 0;
      this.speed = +opt.speed || 10;
      this.width = +opt.width || 3;
      this.scale_x = typeof opt.scale_x == "number" ? opt.scale_x : 1;
      this.scale_y = typeof opt.scale_y == "number" ? opt.scale_y : 1;
    }
    init() {
      this.r = 0;
      this.alpha = 1;
    }
    run() {
      this.delay++;
      if(this.delay >= 0 && this.r < this.size) {
        this.r = Math.min(this.r + this.speed, this.size);
        this.alpha = (this.size - this.r) / (this.size * 0.3);
      }
    }
    draw() {
      if(this.delay < 0 || this.alpha <= 0) return;
      let ctx = this.cvs.ctx;
      ctx.reset();
      ctx.style = {};
      ctx.beginPath();
      ctx.style = {
        color: this.color,
        alpha: this.alpha,
        width: this.width,
        scale_x: this.scale_x,
        scale_y: this.scale_y,
        filter: `blur(${this.blur}px)`,
      };
      ctx.arc(
        this.x / this.scale_x,
        this.y / this.scale_y,
        this.r, 0, Math.PI * 2
      );
      ctx.stroke();
    }
    get is_end() {
      return this.alpha == 0;
    }
  }
  return WaterRipples;
})();