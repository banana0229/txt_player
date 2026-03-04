class MathEx {
  /* ================================ */
  /*  判斷                            */
  /* ================================ */
  static is_clamp(value, min, max) {
    return min <= value && value <= max;
  }

  /* ================================ */
  /*  數學                            */
  /* ================================ */
  static sum(...values) {
    return values.reduce((p, c)=> p + (+c || 0), 0);
  }
  static clamp(value, min, max) {
    if(isNaN(+value)) return +value;
    return Math.min(Math.max(+value || 0, min), max);
  }
  static round(value, places) {
    if(isNaN(+value)) return +value;
    places = MathEx.clamp(Math.round(+places || 0), -10, 10);
    let value_str = (+value).toExponential();
    let [mantissa, exponent] = value_str.split("e");
    exponent = +exponent + places;
    let result = Math.round(mantissa + "e" + exponent) + "e-" + places;
    return +result;
  }
  static random(start, end) {
    if(typeof end != "number") { end = start - 1; start = 0; }
    start = MathEx.round(start) || 0;
    end = MathEx.round(end) || 0;
    let range = Math.abs(end - start) + 1;
    return Math.floor(Math.random() * range) + start;
  }
}
