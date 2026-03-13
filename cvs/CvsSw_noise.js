const CvsSw_noise = (() => {
  const hex_arr = [
    "#0006", "#3336", "#6666",
    "#9996", "#ccc6", "#fff6",
  ];
  class Noise {
    constructor(cvs, opt = {}) {
      this.cvs = cvs;
      this.width = MathEx.clamp(+opt.width || 6, 5, 20);
      this.max_count = MathEx.clamp(+opt.max_count || 16, 10, 30);
      this.type = opt.type == "open" ? "open" : "close";
      this.mask_color = opt.mask_color || "#fff";
    }
    init() {
      this.mask_alpha = this.type == "open" ? 1 : (this.max_count - 5) * -0.1;
      this.line_count = this.type == "open" ? this.max_count : 0;
    }
    run() {
      if(this.is_stop) return;
      if(this.type == "close") {
        if(this.mask_alpha < 1) this.mask_alpha = Math.min(this.mask_alpha + 0.1, 1);
        if(this.line_count < this.max_count) this.line_count++;
      }
      else {
        if(this.mask_alpha > 0) this.mask_alpha = Math.max(this.mask_alpha - 0.1, 0);
        if(this.line_count > 0) this.line_count--;
      }
    }
    get is_stop() {
      if(this.type == "close") {
        return this.line_count >= this.max_count && this.mask_alpha >= 1;
      }
      else {
        return this.cur_line <= 0 && this.mask_alpha <= 0;
      }
    }
    draw() {
      if(this.is_stop) return this.draw_stop();
      let ctx = this.cvs.ctx;
      ctx.reset();
      let hexs = create_hexs(this);
      Object.entries(hexs).forEach(([hex, dots]) => {
        draw_color(this.cvs, this.width, hex, dots);
      });
      ctx.reset();
      if(this.mask_alpha > 0) {
        ctx.beginPath();
        ctx.style = {bg: this.mask_color, alpha: this.mask_alpha};
        ctx.rect(0, 0, this.cvs.width, this.cvs.height);
        ctx.fill();
      }
    }
    draw_stop() {
      if(this.type == "close") {
        let ctx = this.cvs.ctx;
        ctx.reset();
        ctx.style = {bg: this.mask_color};
        ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
      }
    }
    get is_end() {
      if(this.type == "open") return this.is_stop;
      return false;
    }
  }

  return Noise;

  function draw_color(cvs, width, color, dots) {
    cvs.ctx.style = {color, width};
    cvs.ctx.beginPath();
    dots.forEach(dot => {
      cvs.fp(`M${dot.x},${dot.y} L${dot.x + width},${dot.y}`);
    });
    cvs.ctx.stroke();
  }

  function create_hexs(cvssw) {
    let hexs = {};
    let count = cvssw.line_count * 12;
    while(count--) {
      create_line(hexs, cvssw);
    }
    return hexs;
  }
  function create_line(hexs, cvssw) {
    let x = MathEx.random(cvssw.cvs.width);
    let y = MathEx.random(cvssw.cvs.height);
    let len = MathEx.random(3, 8);
    let w = cvssw.width;
    let left_x = x - len / 2 * w;
    for(let i=0; i<len; i++) {
      let hex = hex_arr[MathEx.random(hex_arr.length)];
      if(!hexs[hex]) hexs[hex] = [];
      hexs[hex].push({ x: left_x + w * i, y });
    }
  }
})();
