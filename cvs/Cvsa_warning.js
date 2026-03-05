const Cvsa_warning = (() => {
  class Warning {
    constructor(cvs, opt = {}) {
      this.cvs = cvs;
      this.max_alpha = +opt.max_alpha || 0.4;
      this.min_alpha = +opt.min_alpha || 0.1;
      this.alpha_speed = (+opt.alpha_speed || 2) * 0.01;
      this.line_speed = +opt.line_speed || 2; // px
    }
    init() {
      this.alpha_range = this.max_alpha - this.min_alpha;
      this.cur_alpha = 0;

      this.line_width = this.cvs.width * 0.1;
      this.line_gap = this.cvs.width * 0.01;
      this.cur_line_pos = 0;
      this.y1 = this.cvs.height * 0.03;
      this.y2 = this.cvs.height * 0.08;
      this.y3 = this.cvs.height - this.y2;
      this.y4 = this.cvs.height - this.y1;
      this.x_move = this.line_width * 0.2;
    }
    run() {
      this.cur_alpha += this.alpha_speed;
      if(this.cur_alpha >= this.alpha_range) {
        this.cur_alpha = this.cur_alpha % this.alpha_range - this.alpha_range;
      }
      this.cur_line_pos += this.line_speed;
      this.cur_line_pos %= this.line_width + this.line_gap;
    }
    draw() {
      let ctx = this.cvs.ctx;
      ctx.reset();

      /* 畫紅光 */
      ctx.style = {bg: "#f00"};
      ctx.globalAlpha = this.min_alpha + Math.abs(this.cur_alpha);
      ctx.rect(0, 0, this.cvs.width, this.cvs.height);
      ctx.fill();

      /* 畫線條 - 上 */
      ctx.globalAlpha = 1;
      ctx.style = {bg: "#f005"};
      ctx.beginPath();
      let cur_pos = this.cur_line_pos - this.line_width;
      while(cur_pos < this.cvs.width) {
        ctx.moveTo(cur_pos, this.y2);
        ctx.lineTo(cur_pos + this.x_move, this.y1);
        ctx.lineTo(cur_pos += this.line_width, this.y1);
        ctx.lineTo(cur_pos - this.x_move, this.y2);
        cur_pos += this.line_gap;
      }
      ctx.fill();

      /* 畫線條 - 下 */
      ctx.beginPath();
      cur_pos = this.cvs.width - this.cur_line_pos + this.line_width;
      while(cur_pos > 0) {
        ctx.moveTo(cur_pos, this.y3);
        ctx.lineTo(cur_pos - this.x_move, this.y4);
        ctx.lineTo(cur_pos -= this.line_width, this.y4);
        ctx.lineTo(cur_pos + this.x_move, this.y3);
        cur_pos -= this.line_gap;
      }
      ctx.fill();
    }
  }
  return Warning;
})();
