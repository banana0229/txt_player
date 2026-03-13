const CvsSw_tv_screen = (() => {
  class TvScreen {
    constructor(cvs, opt = {}) {
      this.cvs = cvs;
      this.type = opt.type == "open" ? "open" : "close";
    }
    init() {
      if(this.type == "close") {
        this.white = 0;
        this.y1 = 0.5;
        this.y2 = 0.3;
        this.x1 = 0.5;
        this.x2 = 0.4;
      }
      else {
        this.white = 255;
        this.y1 = 0.0166;
        this.y2 = 0.01;
        this.x1 = 0.33;
        this.x2 = 0.26;
      }
    }
    run() {
      if(this.is_stop) return;
      if(this.type == "close") {
        if(this.y1 > 0.0166) this.y1 *= 0.5; else this.y1 = 0.0166;
        if(this.y2 > 0.01) this.y2 *= 0.5; else this.y2 = 0.01;
        if(this.x1 > 0.33) this.x1 *= 0.9; else this.x1 = 0.33;
        if(this.x2 > 0.26) this.x2 *= 0.9; else this.x2 = 0.26;
        if(this.white < 255) this.white = Math.min(this.white + 50, 255);
      }
      else {
        if(this.y1 < 0.5) this.y1 = Math.min(this.y1 / 0.5, 0.5);
        if(this.y2 < 0.5) this.y2 = Math.min(this.y2 / 0.5, 0.5);
        if(this.x1 < 0.5) this.x1 = Math.min(this.x1 / 0.9, 0.5);
        if(this.x2 < 0.5) this.x2 = Math.min(this.x2 / 0.9, 0.5);
        if(this.white > 0) this.white = Math.max(this.white - 50, 0);
      }
    }
    get is_stop() {
      if(this.type == "close") {
        return this.y1 <= 0.0166 && this.x1 <= 0.33 && this.white >= 255;
      }
      else {
        return this.y1 >= 0.5 && this.x1 >= 0.5 && this.white <= 0;
      }
    }
    draw() {
      if(this.is_stop) return this.draw_stop();
      let ctx = this.cvs.ctx;

      ctx.reset();
      let grad_x = ctx.createLinearGradient(0, 0, this.cvs.width, 0);
      let white_a = this.white.toString(16).padStart(2, 0);
      grad_x.addColorStop(0.5 - this.x1, "#000");
      grad_x.addColorStop(0.5 - this.x2, "#ffffff" + white_a);
      grad_x.addColorStop(0.5 + this.x2, "#ffffff" + white_a);
      grad_x.addColorStop(0.5 + this.x1, "#000");
      ctx.fillStyle = grad_x;
      ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);

      ctx.reset();
      let grad_y = ctx.createLinearGradient(0, 0, 0, this.cvs.height);
      grad_y.addColorStop(0.5 - this.y1, "#000");
      grad_y.addColorStop(0.5 - this.y2, "#0000");
      grad_y.addColorStop(0.5 + this.y2, "#0000");
      grad_y.addColorStop(0.5 + this.y1, "#000");
      ctx.fillStyle = grad_y;
      ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
    }
    draw_stop() {
      if(this.type == "close") {
        let ctx = this.cvs.ctx;
        ctx.reset();
        ctx.style = {bg: "#000"};
        ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
      }
    }
    get is_end() {
      if(this.type == "open") return this.is_stop;
      return false;
    }
  }

  return TvScreen;
})();
