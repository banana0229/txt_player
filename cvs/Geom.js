class Geom {
  static R = Math.PI / 180;
  static round_vec(vec, places) {
    if(typeof MathEx == "undefined") {
      vec.x = Math.round(vec.x);
      vec.y = Math.round(vec.y);
    }
    else {
      vec.x = MathEx.round(vec.x, places);
      vec.y = MathEx.round(vec.y, places);
    }
  }

  /* ================================ */
  /*  兩點                            */
  /* ================================ */
  static dot2_to_len_sq(start_x, start_y, end_x, end_y) {
    let dx = end_x - start_x;
    let dy = end_y - start_y;
    return dx * dx + dy * dy;
  }
  static dot2_to_len(start_x, start_y, end_x, end_y) {
    let dx = end_x - start_x;
    let dy = end_y - start_y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  static dot2_to_deg(start_x, start_y, end_x, end_y) {
    let dx = end_x - start_x;
    let dy = end_y - start_y;
    const abs_y = Math.abs(dy) + 1e-10;
    let deg;
    if(dx >= 0) deg = 45 - 45 * (dx - abs_y) / (dx + abs_y);
    else deg = 135 - 45 * (dx + abs_y) / (abs_y - dx);
    return dy < 0 ? 360 - deg : deg;
  }
  static dot2_pct_to_dot(start_x, start_y, end_x, end_y, pct) {
    return {
      x: start_x + end_x * pct - start_x * pct,
      y: start_y + end_y * pct - start_y * pct,
    };
  }
  static dot2_deg_to_dot(start_x, start_y, end_x, end_y, deg) {
    let len = Geom.dot2_to_len(start_x, start_y, end_x, end_y);
    let base_deg = Geom.dot2_to_deg(start_x, start_y, end_x, end_y);
    return Geom.dot_deg_len_to_dot(start_x, start_y, base_deg + deg, len);
  }

  /* ================================ */
  /*  轉來轉去                        */
  /* ================================ */
  static deg_to_dir(deg) {
    let rad = deg * Geom.R;
    return { x: Math.cos(rad), y: Math.sin(rad) };
  }
  static deg_len_to_vec(deg, len) {
    let rad = deg * Geom.R;
    return { x: Math.cos(rad) * len, y: Math.sin(rad) * len };
  }
  static dot_deg_len_to_dot(x, y, deg, len) {
    let vec = Geom.deg_len_to_vec(deg, len);
    return { x: x + vec.x, y: y + vec.y };
  }
  static dot_dir_len_to_dot(x, y, dir, len) {
    return { x: x + dir.x * len, y: y + dir.y * len };
  }
  static dot_vec_to_dot(x, y, vec) {
    return { x: x + vec.x, y: y + vec.y };
  }
}
