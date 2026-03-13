const Cvsa_img_transform = (() => {
  class ImgTransform {
    constructor(cvs, opt = {}) {
      this.cvs = cvs;

      this.w = opt.w == undefined ? 1 : MathEx.clamp(+opt.w || 0, 0, 2);
      this.h = opt.h == undefined ? 1 : MathEx.clamp(+opt.h || 0, 0, 2);
      this.x = MathEx.clamp(+opt.x || 0, -3, 3);
      this.y = MathEx.clamp(+opt.y || 0, -3, 3);
      this.cx = MathEx.clamp(+opt.cx || 0, -3, 3);
      this.cy = MathEx.clamp(+opt.cy || 0, -3, 3);
      this.a = opt.a == undefined ? 1 : MathEx.clamp(+opt.a || 0, 0, 1);

      this.img_url = opt.img_url || null;
    }
    init() {
      this.cur_w = this.w;
      this.cur_h = this.h;
      this.cur_x = this.x;
      this.cur_y = this.y;
      this.cur_cx = this.cx;
      this.cur_cy = this.cy;
      this.cur_a = this.a;
      if(this.img_url) {
        this.img_loading = true;
        this.img = new Image();
        this.img.addEventListener("load", () => {
          delete this.img_loading;
        });
        this.img.addEventListener("error", () => {
          delete this.img_loading;
          delete this.img;
        });
        this.img.src = this.img_url;
      }
    }
    run() {
      if(this.is_stop) return;
      ["x", "y", "w", "h", "cx", "cy", "a"].forEach(key => {
        let cur_key = "cur_" + key;
        if(Math.abs(this[cur_key] - this[key]) > 0.01) {
          this[cur_key] += (this[key] - this[cur_key]) * 0.4;
        }
        else this[cur_key] = this[key];
      });
    }
    get is_stop() {
      return (
        this.cur_w == this.w &&
        this.cur_h == this.h &&
        this.cur_x == this.x &&
        this.cur_y == this.y &&
        this.cur_cx == this.cx &&
        this.cur_cy == this.cy &&
        this.cur_a == this.a
      );
    }
    draw() {
      if(!this.img) return;
      let w = this.img.width * this.cur_w;
      let h = this.img.height * this.cur_h;
      let x = this.cvs.width * (0.5 + this.cur_x * 0.5);
      let y = this.cvs.height * (0.5 + this.cur_y * 0.5);
      x += w * (-0.5 - this.cur_cx * 0.5);
      y += h * (-0.5 - this.cur_cy * 0.5);
      this.cvs.ctx.reset();
      this.cvs.ctx.style = {alpha: this.cur_a};
      this.cvs.ctx.drawImage(this.img, x, y, w, h);
    }
  }

  return ImgTransform;
})();
