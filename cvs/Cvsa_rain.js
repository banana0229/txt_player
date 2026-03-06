const Cvsa_rain = (() => {
  class Rain {
    constructor(cvs, opt = {}) {
      this.cvs = cvs;
      this.color = opt.color || "#000";
      this.len = opt.len || 0.5;
      this.len_offset = opt.len_offset || 0;
      this.speed = opt.speed || 10;
      this.speed_offset = opt.speed_offset || 0;
      this.deg = opt.deg || 45;
      this.density = opt.density || 1;
      this.drops = [];
    }
    init() {
      create_drops(this);
    }
    run() {
      this.drops.forEach(drop => {
        drop.x += drop.move_vec.x;
        drop.y += drop.move_vec.y;
      });
    }
    draw() {
      this.cvs.ctx.reset();
      this.cvs.ctx.style = {color: this.color};
      this.deg %= 360;
      this.drops.forEach(drop => {
        this.cvs.ctx.style = {width: drop.width};
        this.cvs.fl(
          `M ${drop.x} ${drop.y}`,
          `l ${drop.len_vec.x} ${drop.len_vec.y}`
        );
        check_reset(this, drop);
      });
    }
  }
  return Rain;

  function create_drops(cvsa) {
    cvsa.drops = [];
    let drop_count = Math.round((cvsa.cvs.width + cvsa.cvs.height) / 30 * cvsa.density);
    for(let f=0; f<drop_count; f++) {
      let drop = create_drop(cvsa);
      cvsa.drops.push(drop);
    }
  }
  function check_reset(cvsa, drop) {
    let tail_dot = {
      x: drop.x + drop.len_vec.x,
      y: drop.y + drop.len_vec.y,
    };
    let beyond =
      drop.x < 0 && tail_dot.x < 0 ||
      drop.y < 0 && tail_dot.y < 0 ||
      drop.x > cvsa.cvs.width && tail_dot.x > cvsa.cvs.width ||
      drop.y > cvsa.cvs.height && tail_dot.y > cvsa.cvs.height;
    if(beyond) {
      let pos = MathEx.random(-cvsa.cvs.height, cvsa.cvs.width);
      if(pos < 0) { drop.x = 0; drop.y = -pos; }
      else { drop.x = pos; drop.y = 0; }
      if(cvsa.deg > 270) drop.y = cvsa.cvs.height;
      else if(cvsa.deg > 180) {
        drop.x = cvsa.cvs.width;
        drop.y = cvsa.cvs.height;
      }
      else if(cvsa.deg > 90 && pos < 0) drop.x = cvsa.cvs.width;
    }
  }
  function create_drop(cvsa) {
    let drop = {};

    /* 雨滴尺寸 */
    let len = cvsa.cvs.height * cvsa.len;
    len += MathEx.random(-cvsa.len_offset, cvsa.len_offset);
    drop.len_vec = Geom.deg_len_to_vec(cvsa.deg + 180, len);
    Geom.round_vec(drop.len_vec);
    drop.width = MathEx.random(5, 18) / 10;

    /* 雨滴起始位置 */
    let sx = 0, ex = cvsa.cvs.width;
    let sy = 0, ey = cvsa.cvs.height;
    if(drop.len_vec.x < 0) ex -= drop.len_vec.x;
    else sx -= drop.len_vec.x;
    if(drop.len_vec.y < 0) ey -= drop.len_vec.y;
    else sy -= drop.len_vec.y;
    drop.x = MathEx.random(sx, ex);
    drop.y = MathEx.random(sy, ey);

    /* 速度 */
    let speed = cvsa.speed;
    speed += MathEx.random(-cvsa.speed_offset, cvsa.speed_offset);
    drop.move_vec = Geom.deg_len_to_vec(cvsa.deg, speed);
    Geom.round_vec(drop.move_vec);

    return drop;
  }
})();
