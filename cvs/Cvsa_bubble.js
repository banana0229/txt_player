const Cvsa_bubble = (() => {
  class Bubble {
    constructor(cvs, opt = {}) {
      this.cvs = cvs;
      this.color = opt.color || "#fff";
      this.speed = opt.speed || 10;
      this.speed_offset = opt.speed_offset || 3;
      this.density = opt.density || 1;
      this.r = opt.r || 8;
      this.r_offset = opt.r_offset || 3;
      this.swing = opt.swing || 30;
      this.swing_offset = opt.swing_offset || 5;
      this.bubbles = [];
    }
    init() {
      create_bubbles(this);
    }
    run() {
      this.bubbles.forEach(bubble => {
        bubble.y -= bubble.speed;
        bubble.offset_x += bubble.speed * 0.2;
        if(bubble.offset_x > bubble.swing) bubble.offset_x = -bubble.swing;
        bubble.a += MathEx.random(-1, 1) / 10;
        bubble.a = MathEx.clamp(bubble.a, 0.1, 1);
      });
    }
    draw() {
      let ctx = this.cvs.ctx;
      ctx.reset();
      ctx.style = {color: this.color};
      this.bubbles.forEach(bubble => {
        this.cvs.ctx.style = {width: bubble.width, alpha: bubble.a};
        let x = bubble.x + Math.abs(bubble.offset_x);
        this.cvs.fl(
          `M ${x + bubble.r} ${bubble.y}`,
          `C ${x} ${bubble.y} ${bubble.r} 0 360`,
        );
        check_reset(this, bubble);
      });
    }
  }

  return Bubble;

  function check_reset(cvsa, bubble) {
    if(bubble.y > -bubble.r) return;

    /* 氣泡尺寸 */
    bubble.r = cvsa.r;
    bubble.r += MathEx.random(-cvsa.r_offset, cvsa.r_offset);
    bubble.width = MathEx.random(5, 18) / 10;
    bubble.a = MathEx.random(3, 10) / 10;

    /* 氣泡起始位置 */
    bubble.x = MathEx.random(-bubble.r, cvsa.cvs.width + bubble.r);
    bubble.y = cvsa.cvs.height + bubble.r;
  }
  function create_bubbles(cvsa) {
    cvsa.bubbles = [];
    let bubble_count = Math.round((cvsa.cvs.width + cvsa.cvs.height) / 100 * cvsa.density);
    for(let f=0; f<bubble_count; f++) {
      let bubble = create_bubble(cvsa);
      cvsa.bubbles.push(bubble);
    }
  }
  function create_bubble(cvsa) {
    let bubble = {};

    /* 氣泡尺寸 */
    bubble.r = cvsa.r;
    bubble.r += MathEx.random(-cvsa.r_offset, cvsa.r_offset);
    bubble.width = MathEx.random(4, 10) / 10;
    bubble.a = MathEx.random(3, 10) / 10;

    /* 氣泡起始位置 */
    bubble.x = MathEx.random(-bubble.r, cvsa.cvs.width + bubble.r);
    bubble.y = MathEx.random(-bubble.r, cvsa.cvs.height + bubble.r);
    bubble.swing = cvsa.swing;
    bubble.swing += MathEx.random(-cvsa.swing_offset, cvsa.swing_offset);
    bubble.offset_x = -bubble.swing;

    /* 速度 */
    bubble.speed = cvsa.speed;
    bubble.speed += MathEx.random(-cvsa.speed_offset, cvsa.speed_offset);

    return bubble;
  }
})();
