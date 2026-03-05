(() => {
  const GeomR = Math.PI / 180;
  if(typeof Cvs == "undefined") return;
  Cvs.add_ex("fd", fast_draw);

  /* ================================ */
  /*  主要                            */
  /* ================================ */
  function fast_draw(style, ...dots) {
    /* 設定 */
    if(!this.is_cvs) return;
    let ctx = this.ctx;
    ctx.style = style;
    dots = dots.map(dots_parse).flat();

    /* 開始畫 */
    ctx.beginPath();
    let cursor = {x: 0, y: 0};
    dots.forEach(dot => {
      if(typeof dot.rx == "number") dot.x = cursor.x + dot.rx;
      if(typeof dot.ry == "number") dot.y = cursor.y + dot.ry;
      switch(dot.type) {
        case "M": case "m": ctx.moveTo(dot.x, dot.y); break;
        case "L": case "l": ctx.lineTo(dot.x, dot.y); break;
        case "C": case "c": ctx.arc(dot.x, dot.y, dot.r, dot.sdeg * GeomR, dot.edeg * GeomR); break;
        case "Z": case "z": ctx.closePath(); break;
      }
      if(typeof dot.x == "number") cursor.x = dot.x;
      if(typeof dot.y == "number") cursor.y = dot.y;
    });
    if(!style.no_color) ctx.stroke();
  }

  /* ================================ */
  /*  字串轉 dot                      */
  /* ================================ */
  function dots_parse(dots_str) {
    if(typeof dots_str != "string" || !dots_str.trim()) return [];
    dots_str = dots_str.replace(/[^a-z0-9 \,\-\.]/ig, "");
    let dots_arr = dots_str.match(/[a-z][^a-z]*/ig) || [];
    return dots_arr.map(str => {
      let type = str[0];
      let args = str.substr(1).replace(/,/g, " ").trim().split(/\s+/).map(v => +v || 0);
      args = Object.assign(new Array(2).fill(0), args);
      switch(type) {
        case "M": case "L":
          return {type, x: +args[0], y: +args[1]};
        case "m": case "l":
          return {type, rx: +args[0], ry: +args[1]};
        case "C": case "c": {
          let data = {type, r: +args[2], sdeg: +args[3], edeg: +args[4] };
          if(type == "C") { data.x = +args[0]; data.y = +args[1]; }
          else { data.rx = +args[0]; data.ry = +args[1]; }
          return data;
        }
        case "Z": case "z": return {type};
        default: return null;
      }
    })
    .filter(v => v);
  }
})();