const CvsFx_blood = (() => {
  class Blood {
    constructor(cvs, opt = {}) {
      this.cvs = cvs;
      this.x = opt.x || cvs.width / 2;
      this.y = opt.y || cvs.height / 2;
      this.color = opt.color || "#711"; // px
      this.r = opt.r || 200; // px
      this.range_offset = opt.range_offset || 10; // px
      this.drop_count = opt.drop_count || 24;
      this.drop_r = opt.drop_r || 8; // px
      this.drop_r_offset = opt.drop_r_offset || 2; // px
      this.speed = opt.speed || 16; // px
      this.speed_offset = opt.speed_offset || 3; // px
      this.drops = [];
      this.pools = [];
    }
    init() {
      create_drops(this);
      create_pools(this);
    }
    run() {
      this.pool_life++;
      this.pools.forEach(pool => {
        pool.x += pool.move_vec.x;
        pool.y += pool.move_vec.y;
      });
      this.drops.forEach(drop => {
        if(drop.life > 0) {
          drop.x += drop.move_vec.x;
          drop.y += drop.move_vec.y;
          drop.tail_x += drop.tail_move_vec.x;
          drop.tail_y += drop.tail_move_vec.y;
        }
        drop.life++;
      });
    }
    draw() {
      let ctx = this.cvs.ctx;
      ctx.reset();
      ctx.style = {bg: this.color};

      /* 算血灘 */
      let pl = this.pool_life, pml = this.pool_max_life;
      let min_pct = 0.2;
      let r_pct = min_pct + (pl / pml) * (1 - min_pct);
      let opacity = (pml - pl) / (pml * 0.3);

      /* 畫血灘 */
      ctx.beginPath();
      this.pools.forEach(pool => {
        ctx.globalAlpha = opacity;
        ctx.arc(pool.x, pool.y, pool.r * r_pct, 0, Math.PI * 2);
      });
      ctx.fill();
      if(pl >= pml) this.pools = [];
      
      /* 畫血滴 */
      this.drops = this.drops.filter(drop => {
        let dl = drop.life, dml = drop.max_life;
        ctx.globalAlpha = (dml - dl) / (dml * 0.7);
        if(ctx.globalAlpha == 0) return;
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.r, drop.start_rad, drop.end_rad);
        ctx.lineTo(drop.tail_x, drop.tail_y);
        ctx.fill();
        return dl < dml;
      });
    }
    get is_end() {
      return !this.pools.length && !this.drops.length;
    }
  }
  return Blood;
  function create_pools(cvsfx) {
    cvsfx.pools = [];

    /* 速度 */
    let speed = cvsfx.speed * 0.16;

    /* 壽命 */
    let target_pos = cvsfx.r * 0.2;
    cvsfx.pool_max_life = Math.floor(target_pos / speed * 1);
    cvsfx.pool_life = 0;

    for(let i=0; i<5; i++) {
      let pool = create_pool(cvsfx, i, speed, target_pos);
      cvsfx.pools.push(pool);
    }
  }
  function create_pool(cvsfx, i, speed, target_pos) {
    let pool = {};

    /* 位置 */
    pool.x = cvsfx.x;
    pool.y = cvsfx.y;

    /* 移動 */
    let deg = 360 / 5 * i;
    pool.move_vec = Geom.deg_len_to_vec(deg, speed);

    /* 大小 */
    pool.r = target_pos * MathEx.random(15, 18) / 10;

    return pool;
  }
  function create_drops(cvsfx) {
    cvsfx.drops = [];
    for(let i=0; i<cvsfx.drop_count; i++) {
      let drop = create_drop(cvsfx);
      cvsfx.drops.push(drop);
    }
  }
  function create_drop(cvsfx) {
    let drop = {};

    /* 血滴初始位置 */
    drop.x = cvsfx.x;
    drop.y = cvsfx.y;
    drop.tail_x = cvsfx.x;
    drop.tail_y = cvsfx.y;

    /* 血滴尺寸 */
    drop.r = cvsfx.drop_r;
    drop.r += MathEx.random(-cvsfx.drop_r_offset * 100, cvsfx.drop_r_offset * 100) / 100;

    /* 血滴移動設定 */
    let deg = MathEx.random(360);
    let move_dir = Geom.deg_to_dir(deg);
    let speed = cvsfx.speed;
    speed += MathEx.random(-cvsfx.speed_offset * 100, cvsfx.speed_offset * 100) / 100;
    drop.move_vec = {x: move_dir.x * speed, y: move_dir.y * speed};
    drop.tail_move_vec = {x: move_dir.x * speed * 0.4, y: move_dir.y * speed * 0.4};

    /* 血滴形狀 */
    drop.start_rad = (deg + 180 + 60) * Geom.R;
    drop.end_rad = (deg + 180 - 60) * Geom.R;

    /* 血滴壽命 */
    let target_pos = cvsfx.r;
    target_pos += MathEx.random(-cvsfx.range_offset, cvsfx.range_offset);
    drop.max_life = Math.floor(target_pos / speed);
    drop.life = MathEx.random(-4, -1);

    return drop;
  }
})();