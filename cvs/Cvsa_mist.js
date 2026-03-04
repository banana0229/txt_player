const Cvsa_mist = (() => {
  class Mist {
    constructor(cvs, opt = {}) {
      this.cvs = cvs;
      this.inner_color = opt.inner_color || "#ffffff49";
      this.color = opt.color || "#ffffff10";
      this.outer_color = opt.outer_color || "#fff0";
      this.count = opt.count || 12;
      this.pos_offset = opt.pos_offset || 0.3; // 0 ~ 1
      this.border_offset = opt.border_offset || 0; // px
      this.overlap_width = opt.overlap_width || 0.5; // 0 ~ 0.5
      this.r_offset = opt.r_offset || 20; // px
      this.max_swell = opt.max_swell || 50; // px
      this.max_swell_offset = opt.max_swell_offset || 0; // px
      this.speed = opt.speed || 1; // 0 ~ 100
      this.speed_offset = opt.speed_offset || 0; // 0 ~ 100
      this.lumpys = [];
    }
    init() {
      create_lumpys(this);
      console.log(this.lumpys)
    }
    run() {
      this.lumpys.forEach(lumpy => {
        lumpy.swell += Math.abs(lumpy.speed);
        if(lumpy.swell > 100) lumpy.swell = -100 + lumpy.swell % 100;
      });
    }
    draw() {
      this.cvs.ctx.reset();
      this.lumpys.forEach(lumpy => {
        draw_one_lumpy(this, lumpy);
      });
    }
  }
  return Mist;

  function draw_one_lumpy(cvsa, lumpy) {
    let swell_pct = lumpy.swell;
    if(swell_pct < 0) swell_pct *= -1;
    swell_pct /= 100;

    let radius = lumpy.r + lumpy.max_swell * swell_pct;
    let ctx = cvsa.cvs.ctx;
    console.log();
    let grad = ctx.createRadialGradient(
      lumpy.x, lumpy.y, 0,
      lumpy.x, lumpy.y, radius
    );
    grad.addColorStop(0, cvsa.inner_color);
    grad.addColorStop(0.62, cvsa.color);
    grad.addColorStop(1, cvsa.outer_color);
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.arc(lumpy.x, lumpy.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  function create_lumpys(cvsa) {
    cvsa.lumpys = [];
    let perimeter = cvsa.cvs.width * 2 + cvsa.cvs.height * 2;
    let per_len = perimeter / cvsa.count;
    for(let i=0; i<cvsa.count; i++) {
      let lumpy = create_lumpy(cvsa, per_len, i);
      cvsa.lumpys.push(lumpy);
    }
  }
  function create_lumpy(cvsa, per_len, i) {
    let lumpy = {};

    /* 霧團圓心位置 */
    let pos = per_len * (i + cvsa.pos_offset);
    if(pos < cvsa.cvs.width) {
      lumpy.x = pos;
      lumpy.y = cvsa.border_offset;
    }
    else if(pos < cvsa.cvs.width + cvsa.cvs.height) {
      lumpy.x = cvsa.cvs.width - cvsa.border_offset;
      lumpy.y = pos - cvsa.cvs.width;
    }
    else if(pos < cvsa.cvs.width * 2 + cvsa.cvs.height) {
      lumpy.x = cvsa.cvs.width * 2 + cvsa.cvs.height - pos;
      lumpy.y = cvsa.cvs.height - cvsa.border_offset;
    }
    else {
      lumpy.x = cvsa.border_offset;
      lumpy.y = cvsa.cvs.width * 2 + cvsa.cvs.height * 2 - pos;
    }

    /* 初始半徑 */
    let overlap_width = MathEx.clamp(cvsa.overlap_width, 0, 0.5);
    lumpy.r = per_len / 2 * (1 + overlap_width);
    lumpy.r += MathEx.random(-cvsa.r_offset, cvsa.r_offset);

    /* 可動半徑 */
    lumpy.max_swell = cvsa.max_swell;
    lumpy.max_swell += MathEx.random(-cvsa.max_swell_offset, cvsa.max_swell_offset);

    /* 目前已動半徑百分比 */
    lumpy.swell = MathEx.random(-100, 100);

    /* 速度 */
    lumpy.speed = cvsa.speed;
    lumpy.speed += MathEx.random(-cvsa.speed_offset, cvsa.speed_offset);
    lumpy.speed = MathEx.clamp(lumpy.speed, 0, 100);

    return lumpy;
  }
})();