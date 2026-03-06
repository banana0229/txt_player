const Cvsa_hud_frame = (() => {
  class HudFrame {
    constructor(cvs, opt = {}) {
      this.cvs = cvs;

      /* 位置 */
      if(typeof opt.rx == "number") this.x = this.cvs.width / 2 + opt.rx;
      else if(["number", "string"].includes(typeof opt.x)) this.x = +opt.x;
      else this.x = this.cvs.width / 2;

      if(typeof opt.ry == "number") this.y = this.cvs.height / 2 + opt.ry;
      else if(["number", "string"].includes(typeof opt.y)) this.y = +opt.y;
      else this.y = this.cvs.height / 2;

      /* 內尺寸 */
      this.w = MathEx.clamp(+opt.w || 600, 0, 1200);
      this.h = MathEx.clamp(+opt.h || 400, 100, 1200);
      this.border_w = MathEx.clamp(+opt.border_w || 2, 0, 20);
      this.border_color = opt.border_color || "#4be2fa";

      /* 外尺寸 */
      this.outline_x = MathEx.clamp(+opt.outline_x || 24, 0, 100);
      this.outline_y = MathEx.clamp(+opt.outline_y || 12, 0, 100);
      this.outline_w = MathEx.clamp(+opt.outline_w || 4, 0, 20);
      this.outline_color = opt.outline_color || "#4be2fa";
      this.corner_size = MathEx.clamp(+opt.corner_size || 20, 0, Math.min(this.w, this.h) / 2);
      this.finger_len = MathEx.clamp(+opt.finger_len || this.h * 0.2, 0, 100);
      this.finger_w = MathEx.clamp(+opt.finger_w || 8, 0, 50);
      this.arm_w = MathEx.clamp(+opt.arm_w || 12, 0, 50);

      /* 速度 */
      if(this.speed === 0) this.speed = 0;
      else this.speed = MathEx.clamp(+opt.speed || this.w / 8, 10, Math.min(this.w, this.h));

      /* 圖片 */
      this.img_url = opt.img_url || null;
    }
    init() {
      this.max_half_w = this.w / 2;
      this.half_w = -this.outline_x;
      this.half_h = this.h / 2;
      this.max_start_y = this.half_h + this.outline_y + this.outline_w;
      this.start_y = -this.max_start_y;
      this.light_dot_w = this.outline_x / 4;
      this.light_dot_x = this.max_half_w + this.outline_x / 2;
      this.light_dot_y = this.half_h - this.corner_size * 2;
      this.light_dot_count = this.half_h * 0.8 / (this.light_dot_w * 2);
      this.light_dot = this.light_dot_count * 2 + 20;

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
      if(this.img_loading) return;
      if(this.start_y < this.max_start_y) {
        this.start_y += this.speed;
      }
      else if(this.half_w < this.max_half_w) {
        this.half_w = Math.min(this.half_w + this.speed, this.max_half_w);
      }
      else {
        this.light_dot++;
        if(this.light_dot >= this.light_dot_count * 2 + 20) this.light_dot = -20;
      }
    }
    draw() {
      this.cvs.ctx.reset();
      if(this.half_w >= 0) {
        draw_img(this);
        draw_border(this);
      }
      draw_outline(this);
      draw_light_dot(this);
    }
  }

  return HudFrame;

  function draw_light_dot(cvsa) {
    if(cvsa.light_dot == cvsa.light_dot_count) return;
    let x = cvsa.light_dot_x;
    let y = cvsa.light_dot_y;
    let w = cvsa.light_dot_w;
    let style = {color: cvsa.border_color, width: w};
    for(let f=0; f<cvsa.light_dot_count; f++) {
      cvsa.cvs.ctx.globalAlpha = Math.max(1 - Math.abs(cvsa.light_dot / 2 - f) * 0.1, 0);
      if(!cvsa.cvs.ctx.globalAlpha) return;
      cvsa.cvs.fd(
        style,
        {type: "A"},
        `M${cvsa.x + x},${cvsa.y + y} l0,${-w}`,
        `M${cvsa.x - x},${cvsa.y - y} l0,${w}`,
      );
      y -= w * 2;
    }
  }
  function draw_img(cvsa) {
    let beyond_w = cvsa.img.width - cvsa.w;
    let beyond_h = cvsa.img.height - cvsa.h;
    let clip_w = cvsa.img.width;
    let clip_h = cvsa.img.height;
    if(beyond_w < beyond_h) clip_h = clip_w / cvsa.w * cvsa.h;
    else if(beyond_h > beyond_w) clip_w = clip_h / cvsa.h * cvsa.w;

    clip_w *= cvsa.half_w * 2 / cvsa.w;
    let x = cvsa.x - cvsa.half_w;
    let y = cvsa.y - cvsa.half_h;
    let clip_x = (cvsa.img.width - clip_w) / 2;
    let clip_y = (cvsa.img.height - clip_h) / 2;
    cvsa.cvs.ctx.drawImage(
      cvsa.img,
      clip_x, clip_y, clip_w, clip_h,
      x, y, cvsa.half_w * 2, cvsa.h,
    );
  }
  function draw_border(cvsa) {
    let half_t = cvsa.border_w / 2;
    let len_s = cvsa.h * 0.05;
    let dots = [
      {x: cvsa.half_w - len_s, y: -cvsa.half_h - half_t}, 
      {x: len_s + half_t, y: 0}, 
      {x: 0, y: cvsa.h + cvsa.border_w}, 
      {x: -len_s - half_t, y: 0}, 
    ];

    let left_dots = [];
    let right_dots = [];
    dots.forEach((dot, i) => {
      if(!i) {
        left_dots.push({  type: "M", x: cvsa.x + dot.x, y: cvsa.y + dot.y });
        right_dots.push({ type: "M", x: cvsa.x - dot.x, y: cvsa.y - dot.y });
      }
      else {
        left_dots.push({  type: "l", rx: dot.x, ry: dot.y });
        right_dots.push({ type: "l", rx: -dot.x, ry: -dot.y });
      }
    });

    let style = {color: cvsa.border_color, width: cvsa.border_w};
    cvsa.cvs.ctx.reset();
    cvsa.cvs.fd(style, {type: "A"}, ...left_dots);
    cvsa.cvs.fd(style, {type: "A"}, ...right_dots);
  }

  function draw_outline(cvsa) {
    let {
      outline_x, outline_y, outline_w, outline_color,
      corner_size, finger_w, half_w, half_h,
    } = cvsa;
    let len_s = cvsa.h * 0.4;
    if(finger_w * 2 > len_s) finger_w = len_s / 2;
    let finger_len = Math.min(cvsa.finger_len, len_s - finger_w * 2);
    let arm_w = Math.min(cvsa.arm_w, outline_x);
    let outer_half_h = half_h + outline_y + outline_w - corner_size;

    let dots = [
      { x: 0, y: 0 },
      { x: -corner_size, y: -corner_size },
      { x: -len_s + finger_len + finger_w * 2, y: 0 },
      { x: -finger_w, y: -finger_w },
      { x: -finger_len, y: 0 },
      { x: -finger_w, y: finger_w },
      { x: len_s * 0.2 - outline_w, y: 0 },
      { x: outline_w, y: outline_w },
      { x: len_s * 0.8 - outline_w, y: 0 },
      { x: corner_size, y: corner_size },
    ];
    let cur_pos = { x: half_w + outline_x + outline_w, y: -outer_half_h };
    dots.forEach(dot => {
      dot.x = cur_pos.x += dot.x;
      dot.y = cur_pos.y += dot.y;
    });

    let lt_dots = [];
    let rb_dots = [];
    let lb_dots = [];
    let rt_dots = [];
    dots.forEach((dot, i) => {
      let type = !i ? "M" : "L";
      lt_dots.push({ type, x: cvsa.x + dot.x, y: cvsa.y + dot.y });
      rb_dots.push({ type, x: cvsa.x - dot.x, y: cvsa.y - dot.y });
    });
    for(let w=dots.length; w--;) {
      let dot = dots[w];
      lb_dots.push({ type: "L", x: cvsa.x + dot.x, y: cvsa.y - dot.y });
      rt_dots.push({ type: "L", x: cvsa.x - dot.x, y: cvsa.y + dot.y });
    }
    lt_dots.forEach(dot => { dot.x = Math.max(dot.x, cvsa.x); dot.y = Math.min(dot.y, cvsa.y); });
    lb_dots.forEach(dot => { dot.x = Math.max(dot.x, cvsa.x); dot.y = Math.max(dot.y, cvsa.y); });
    rt_dots.forEach(dot => { dot.x = Math.min(dot.x, cvsa.x); dot.y = Math.min(dot.y, cvsa.y); });
    rb_dots.forEach(dot => { dot.x = Math.min(dot.x, cvsa.x); dot.y = Math.max(dot.y, cvsa.y); });

    let lt_last = lt_dots.pop();
    let rt_last = rb_dots.pop();
    lt_dots.push({type: "L", x: lt_last.x -= arm_w, y: lt_last.y -= arm_w });
    rb_dots.push({type: "L", x: rt_last.x += arm_w, y: rt_last.y += arm_w });
    lt_dots.push({type: "L", x: lt_last.x, y: lt_last.y += outer_half_h * 0.6 });
    rb_dots.push({type: "L", x: rt_last.x, y: rt_last.y -= outer_half_h * 0.6 });
    lt_dots.push({type: "L", x: lt_last.x += arm_w, y: lt_last.y += arm_w });
    rb_dots.push({type: "L", x: rt_last.x -= arm_w, y: rt_last.y -= arm_w });

    if(cvsa.start_y < cvsa.max_start_y) {
      lt_dots.forEach(dot => { dot.y = Math.max(dot.y, cvsa.y - cvsa.start_y); });
      lb_dots.forEach(dot => { dot.y = Math.max(dot.y, cvsa.y - cvsa.start_y); });
      rb_dots.forEach(dot => { dot.y = Math.min(dot.y, cvsa.y + cvsa.start_y); });
      rt_dots.forEach(dot => { dot.y = Math.min(dot.y, cvsa.y + cvsa.start_y); });
    }

    let style = {bg: outline_color};
    cvsa.cvs.fd(style,
      {type: "A"},
      ...lt_dots, ...lb_dots,
      ...rb_dots, ...rt_dots,
      {type: "Z"},
    );
  }
})();
