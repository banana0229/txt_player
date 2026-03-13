const CvsSw_dash_over = (() => {
  class DashOver {
    constructor(cvs, opt = {}) {
      this.cvs = cvs;
      this.type = opt.type == "open" ? "open" : "close";
      this.color = opt.color || "#000";
      this.line_size = +opt.line_size || 12;
      this.offset = +opt.offset || 8;
    }
    init() {
      this.auto_fill = this.cvs.height;
      this.count = Math.ceil(this.cvs.width / this.line_size);
      this.max_line = this.line_size + Math.floor(this.count / this.offset);
      this.cur_line = this.type == "close" ? 0 : this.max_line;
    }
    run() {
      if(this.is_stop) return;
      if(this.type == "close") this.cur_line++;
      else this.cur_line--;
    }
    get is_stop() {
      if(this.type == "close") return this.cur_line >= this.max_line;
      else return this.cur_line <= 0;
    }
    draw() {
      if(this.is_stop) return this.draw_stop();
      let ctx = this.cvs.ctx;
      let w = this.cvs.ctx;
      ctx.reset();
      ctx.beginPath();
      for(let i=0; i<this.count; i++) {
        let offset = Math.floor(i / this.offset);
        let cur_line = Math.max(this.cur_line - offset, 0);
        ctx.rect(i * this.line_size, 0, cur_line, this.auto_fill);
      }
      ctx.style = {bg: this.color};
      ctx.fill();
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
  return DashOver;
})();