const CvsSw_eyes = (() => {
  const time_line = [
    {t: 0, v: 1.5},
    {t: 16, v: 0.22},
    {t: 24, v: 0.3},
    {t: 40, v: 0.08},
    {t: 48, v: 0.18},
    {t: 56, v: 0},
  ];
  const time_line_len = Math.max(...time_line.map(v => v.t)) + 2;
  class Eyes {
    constructor(cvs, opt = {}) {
      this.cvs = cvs;
      this.type = opt.type == "open" ? "open" : "close";
      this.color = opt.color || "#000";
    }
    init() {
      this.x = this.cvs.width / 2;
      this.y = this.cvs.height / 2;
      this.r = this.x * 2;
      if(this.type == "close") this.index = 0;
      else this.index = time_line_len;
    }
    run() {
      if(this.is_stop) return;
      if(this.type == "close") this.index++;
      else this.index--;
    }
    get is_stop() {
      if(this.type == "close") return this.index >= time_line_len;
      else return this.index <= 0;
    }
    draw() {
      if(this.is_stop) return this.draw_stop();
      let ctx = this.cvs.ctx;

      ctx.reset();
      ctx.style = {bg: this.color};
      ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);

      ctx.reset();
      let gap_size = get_cur_gap(this.index);
      let y = parseInt(this.y / gap_size) || 0;
      ctx.style = {scale_y: gap_size};

      let grad = ctx.createRadialGradient(this.x, y, 0, this.x, y, this.r);
      grad.addColorStop(0.5, '#000');
      grad.addColorStop(1, '#0000');

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.style = {bg: grad};
      ctx.arc(this.x, y, this.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.reset();
    }
    draw_stop() {
      if(this.type == "close") {
        let ctx = this.cvs.ctx;
        ctx.reset();
        ctx.style = {bg: this.color};
        ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
      }
    }
    get is_end() {
      if(this.type == "open") return this.is_stop;
      return false;
    }
  }

  return Eyes;
  
  function get_cur_gap(i) {
    i--;
    let before_time = time_line.findLast(time => time.t <= i);
    let after_time = time_line.find(time => time.t > i);
    if(!after_time) return before_time.v;
    let t_len = after_time.t - before_time.t;
    let ratio = (i - before_time.t) / t_len;
    let v_len = after_time.v - before_time.v;
    let v = before_time.v + v_len * ratio;
    return v;
  }
})();
