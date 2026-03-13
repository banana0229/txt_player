const CvsSw_dissolve = (() => {
  class Dissolve {
    constructor(cvs, opt = {}) {
      this.cvs = cvs;
      this.type = opt.type == "open" ? "open" : "close";
      this.color = opt.color || "#000";
    }
    init() {
      this.temp_cvs_arr = create_temp_cvs_arr(this);
      if(this.type == "close") this.cur_i = 0;
      else this.cur_i = this.temp_cvs_arr.length;
    }
    run() {
      if(this.is_stop) return;
      if(this.type == "close") this.cur_i++;
      else this.cur_i--;
    }
    get is_stop() {
      if(this.type == "close") return this.cur_i >= this.temp_cvs_arr.length;
      else return this.cur_i <= 0;
    }
    draw() {
      if(this.is_stop) return this.draw_stop();
      let ctx = this.cvs.ctx;
      ctx.reset();
      this.temp_cvs_arr.slice(0, this.cur_i).forEach(temp_cvs => {
        ctx.drawImage(temp_cvs, 0, 0);
      });
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

  return Dissolve;

  function create_temp_cvs_arr(cvssw) {
    let temp_cvs_arr = [];
    let cvs_count = 32;
    let min_r = 0.05, max_r = 0.1;
    let min_c = 50, max_c = 100;
    for(let i=0; i<cvs_count; i++) {
      let temp_cvs = Cvs.create().set_size(cvssw.cvs.width, cvssw.cvs.height);
      temp_cvs.ctx.style = {bg: cvssw.color};
      let ratio = min_r + (max_r - min_r) * (i / cvs_count);
      let count = max_c - (max_c - min_c) * (i / cvs_count);
      random_black(temp_cvs, ratio, count);
      random_clear(temp_cvs, ratio, count);
      temp_cvs_arr.push(temp_cvs);
    }
    return temp_cvs_arr;
  }

  function random_black(temp_cvs, ratio, count) {
    let min_ratio = ratio - 0.05;
    let max_ratio = ratio + 0.05;
    for(let c=count; c-- > 0;) {
      let x = MathEx.random(temp_cvs.width * -max_ratio, temp_cvs.width);
      let y = MathEx.random(temp_cvs.height * -max_ratio, temp_cvs.height);
      let w = MathEx.random(temp_cvs.width * min_ratio, temp_cvs.width * max_ratio);
      let h = MathEx.random(temp_cvs.height * min_ratio, temp_cvs.height * max_ratio);
      temp_cvs.ctx.fillRect(x, y, w, h);
    }
  }
  function random_clear(temp_cvs, ratio, count) {
    let min_ratio = ratio * 0.5 - 0.05;
    let max_ratio = ratio * 0.5 + 0.05;
    for(let c=count * 0.8; c-- > 0;) {
      let x = MathEx.random(temp_cvs.width * -max_ratio, temp_cvs.width);
      let y = MathEx.random(temp_cvs.height * -max_ratio, temp_cvs.height);
      let w = MathEx.random(temp_cvs.width * min_ratio, temp_cvs.width * max_ratio);
      let h = MathEx.random(temp_cvs.height * min_ratio, temp_cvs.height * max_ratio);
      temp_cvs.ctx.clearRect(x, y, w, h);
    }
  }
})();
