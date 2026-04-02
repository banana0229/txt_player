const Fight = (() => {
  /* ================================ */
  /*  初始設定                        */
  /* ================================ */
  const obj = {};
  let cvs = Cvs.create().set_size(960, 720);
  let ctx = cvs.ctx;
  let y_scale = 0.7;
  let ox = cvs.width / 2;
  let oy = cvs.height * 0.4;
  Object.defineProperty(obj, "cvs", { get: () => cvs });
  function yc(raw_y) {
    let raw_ry = raw_y - oy;
    return raw_ry * y_scale + oy;
  }

  /* 設定 */
  let main_color = "#8f0";
  Object.defineProperty(obj, "set_area_color", {
    writable: false, value: (color) => {
      main_color = color || "#8f0";
    },
  });

  /* ================================ */
  /*  動態                            */
  /* ================================ */
  let interval = null;
  Object.defineProperty(obj, "play", {
    writable: false, value: () => {
      clearInterval(interval);
      interval = setInterval(() => {
        run();
        cvs.clear();
        draw();
      }, 60);
    },
  });
  Object.defineProperty(obj, "stop", {
    writable: false, value: () => {
      clearInterval(interval);
      cvs.clear();
      areas = {};
      lines = [];
      interval = null;
    },
  });
  Object.defineProperty(obj, "pause", {
    writable: false, value: () => {
      clearInterval(interval);
      cvs.clear();
      interval = null;
    },
  });

  /* ================================ */
  /*  每幀                            */
  /* ================================ */
  function run() {
    run_areas();
    run_items();
  }
  function draw() {
    draw_areas();
    draw_lines();
    draw_items();
  }

  /* ================================ */
  /*  接戰區域                        */
  /* ================================ */
  /* 每幀 */
  let area_rotate = 0; // 0 ~ 60
  let area_alpha = 0; // -20 ~ 20
  function run_areas() {
    area_rotate++;
    if(area_rotate == 60) area_rotate = 0;
    area_alpha += 0.025;
    if(area_alpha > 0.5) area_alpha = -0.5;

    Object.values(areas).forEach(area => {
      if(area.enter < 0) area.enter = Math.min(area.enter + 0.1, 0);
      if(area.items) area.items.forEach(item => {
        if(item.enter) item.enter = Math.min(item.enter + 1, 0);
      });
    });
    del_areas = del_areas.filter(area => {
      area.leave -= 0.1;
      return area.leave > 0;
    });
  }
  function draw_areas() {
    let dir_arr = [
      Geom.deg_to_dir(120 + area_rotate),
      Geom.deg_to_dir(180 + area_rotate),
      Geom.deg_to_dir(240 + area_rotate),
      Geom.deg_to_dir(300 + area_rotate),
      Geom.deg_to_dir(360 + area_rotate),
    ];
    ctx.style = {color: main_color, width: 2, filter: "blur(1px)"};
    [Object.values(areas), del_areas].flat().forEach(area => {
      ctx.reset();
      ctx.beginPath();
      let cur_dot = Geom.dot_deg_len_to_dot(area.x, area.y, area_rotate, area.r);
      let dots = [ {type: "M", x: cur_dot.x, y: yc(cur_dot.y)} ];
      dir_arr.forEach(dir => {
        dots.push({type: "l", rx: dir.x * area.r, ry: dir.y * area.r * y_scale});
      });
      cvs.fp(...dots, {type: "Z"});
      let alpha = area.leave || 1 - Math.abs(area.enter || area_alpha);
      ctx.style = {alpha};
      ctx.stroke();
      ctx.style = {bg: main_color, filter: "blur(5px)", alpha: alpha * 0.3};
      ctx.fill();
    });
  }

  /* 物件 */
  let areas = {};
  let del_areas = [];
  Object.defineProperty(obj, "area_create", {writable: false, value: area_create});
  function area_create(origin_area_key, new_key, r, deg, len) {
    let dot_x = ox, dot_y = oy;
    let origin_area = null;
    if(origin_area_key) {
      origin_area = areas[origin_area_key] || null;
      if(origin_area) { dot_x = origin_area.x; dot_y = origin_area.y; }
    }
    let new_dot = Geom.dot_deg_len_to_dot(dot_x, dot_y, deg, len);
    areas[new_key] = { x: new_dot.x, y: new_dot.y, r, enter: -1 };
    if(origin_area) line_create_by_area(origin_area, areas[new_key]);
  }
  Object.defineProperty(obj, "area_del", {writable: false, value: area_del});
  function area_del(area_key) {
    let area = areas[area_key];
    if(!area) return;
    delete areas[area_key];
    area.enter = 0;
    area.leave = 1 - Math.abs(area_alpha);
    area.items = null;
    del_areas.push(area);
    lines = lines.filter(line => line.start_area != area && line.end_area != area);
  }
  Object.defineProperty(obj, "area_move", {writable: false, value: area_move});
  function area_move(area_key, deg, len) {
    let area = areas[area_key];
    if(!area) return;
    let new_dot = Geom.dot_deg_len_to_dot(area.x, area.y, deg, len);
    area.x = new_dot.x;
    area.y = new_dot.y;
  }
  Object.defineProperty(obj, "area_set", {writable: false, value: area_set});
  function area_set(area_key, args) {
    let area = areas[area_key];
    if(!area) return;
    if(args.sort_style) area.sort_style = +args.sort_style || 0;
  }

  /* ================================ */
  /*  線段                            */
  /* ================================ */
  /* 每幀 */
  function draw_lines() {
    ctx.reset();
    ctx.beginPath();
    lines.forEach(line => {
      let start_x = line.start_area.x;
      let start_y = line.start_area.y;
      let end_x = line.end_area.x;
      let end_y = line.end_area.y;
      let deg = Geom.dot2_to_deg(start_x, start_y, end_x, end_y);
      let dir = Geom.deg_to_dir(deg);
      cvs.fp(
        {
          type: "M",
          x: start_x + dir.x * (line.start_area.r + 8),
          y: yc(start_y + dir.y * (line.start_area.r + 8)),
        },
        {
          type: "L",
          x: end_x - dir.x * (line.end_area.r + 8),
          y: yc(end_y - dir.y * (line.end_area.r + 8)),
        },
      );
    });
    let alpha = 1 - Math.abs(area_alpha);
    ctx.style = {color: main_color, width: 1, filter: "blur(1px)", alpha};
    ctx.stroke();
  }

  /* 物件 */
  let lines = [];
  Object.defineProperty(obj, "line_create", {writable: false, value: line_create});
  function line_create(start_area_key, end_area_key) {
    if(start_area_key == end_area_key) return null;
    let start_area = areas[start_area_key];
    let end_area = areas[end_area_key];
    line_create_by_area(start_area, end_area);
  }
  function line_create_by_area(start_area, end_area) {
    if(start_area == end_area) return;
    let line = find_line(start_area, end_area);
    if(!line) lines.push({start_area, end_area});
  }
  Object.defineProperty(obj, "line_del", {writable: false, value: line_del});
  function line_del(start_area_key, end_area_key) {
    if(start_area_key == end_area_key) return null;
    let start_area = areas[start_area_key];
    let end_area = areas[end_area_key];
    let target_line = find_line(start_area, end_area);
    lines = lines.filter(line => line != target_line);
  }
  function find_line(start_area, end_area) {
    if(start_area == end_area) return null;
    return lines.find(line => {
      return line.start_area == start_area && line.end_area == end_area ||
      line.start_area == end_area && line.end_area == start_area;
    });
  }

  /* ================================ */
  /*  棋子                            */
  /* ================================ */
  /* 每幀 */
  let item_offset_y = -4;
  function run_items() {
    item_offset_y += 0.4;
    if(item_offset_y > 4) item_offset_y = -4;
  }
  function draw_items(area) {
    Object.values(areas).forEach(area => {
      if(!area.items || !area.items.length) return;
      switch(area.items.length) {
        case 1: draw_char_1(area, area.items); break;
        case 2: draw_char_2(area, area.items); break;
        case 3: draw_char_3(area, area.items); break;
        case 4: default: draw_char_4(area, area.items); break;
      }
    });
  }
  let pin_size = 60;
  function draw_char_1(area, items) {
    ctx.reset();
    items[0].draw_to_fight(area.x, area.y, pin_size);
  }
  function draw_char_2(area, items) {
    ctx.reset();
    let r = area.r * 0.36;
    if(!area.sort_style) {
      items[0].draw_to_fight(area.x - r, area.y + r, pin_size);
      items[1].draw_to_fight(area.x + r, area.y - r, pin_size);
    }
    else {
      items[0].draw_to_fight(area.x - r, area.y - r, pin_size);
      items[1].draw_to_fight(area.x + r, area.y + r, pin_size);
    }
  }
  function draw_char_3(area, items) {
    ctx.reset();
    let r = area.r * 0.6;
    let r2 = r * 0.5, r3 = r * 0.866;
    if(!area.sort_style) {
      items[0].draw_to_fight(area.x - r3, area.y + r2, pin_size);
      items[1].draw_to_fight(area.x     , area.y -  r, pin_size);
      items[2].draw_to_fight(area.x + r3, area.y + r2, pin_size);
    }
    else {
      items[0].draw_to_fight(area.x - r3, area.y - r2, pin_size);
      items[1].draw_to_fight(area.x     , area.y +  r, pin_size);
      items[2].draw_to_fight(area.x + r3, area.y - r2, pin_size);
    }
  }
  function draw_char_4(area, items) {
    ctx.reset();
    let r = area.r * 0.6;
    let r2 = r * 0.3, r3 = r * 0.7;
    items[0].draw_to_fight(area.x - r    , area.y - r2, 60);
    items[2].draw_to_fight(area.x + r / 3, area.y - r2, 60);
    items[1].draw_to_fight(area.x - r / 3, area.y + r3, 60);
    items[3].draw_to_fight(area.x + r    , area.y + r3, 60);
  }

  /* 物件 */
  Object.defineProperty(obj, "item_enter", {writable: false, value: item_enter});
  function item_enter(area_key, item_data) {
    let area = areas[area_key];
    if(!area || !item_data) return;
    if(!area.items) area.items = [];
    if(item_data.img_url) {
      let img = new Image();
      img.addEventListener("load", () => create_item(img));
      img.addEventListener("error", () => create_item(null));
      img.src = item_data.img_url;
    }
    else create_item(null);
    function create_item(target_img) {
      let new_item = {
        name: item_data.name,
        enter: -10,
        img: target_img,
        i: +item_data.i || 0
      };
      draw_item_base(new_item, item_data.color);
      area.items.push(new_item);
      area.items.sort((item_a, item_b) => item_a.i - item_b.i);
    }
  }
  Object.defineProperty(obj, "item_leave", {writable: false, value: item_leave});
  function item_leave(name) {
    Object.values(areas).forEach(area => {
      if(!area.items) return;
      area.items = area.items.filter(item => item.name != name);
      if(!area.items.length) delete area.items;
    });
  }
  Object.defineProperty(obj, "item_move", {writable: false, value: item_move});
  function item_move(name, area_key) {
    let target_item = null;
    Object.values(areas).forEach(area => {
      if(!area.items || target_item) return;
      target_item = area.items.find(item => item.name == name);
      area.items = area.items.filter(item => item.name != name);
      if(!area.items.length) delete area.items;
    });
    if(!target_item) return;
    if(areas[area_key]) {
      if(!areas[area_key].items) areas[area_key].items = [];
      areas[area_key].items.push(target_item);
    }
  }
  Object.defineProperty(obj, "item_set", {writable: false, value: item_set});
  function item_set(name, set_data) {
    let item = null;
    Object.values(areas).forEach(area => {
      if(!area.items || item) return;
      item = area.items.find(item => item.name == name);
    });
    if(!item) return;
    if(set_data.i) item.i = set_data.i;
  }
  

  /* 畫圖釘 */
  function draw_item_base(item, color) {
    item.cvs = Cvs.create().set_size(110, 170);
    let i_ctx = item.cvs.ctx;
    if(!color) color = "#3e4271";

    /* 菱形 */
    item.cvs.fd(
      {bg: color, color: "#fff", width: 3, turn: "round"},
      "A M 55 5 L 105 55 L 55 165 L 5 55 Z",
    );

    /* 圓形 */
    i_ctx.beginPath();
    i_ctx.arc(55, 64, 38, 0, Math.PI * 2);
    i_ctx.style = {bg: "#fff"};
    i_ctx.fill();

    /* 圖片 */
    i_ctx.reset();
    i_ctx.beginPath();
    i_ctx.arc(55, 64, 36, 0, Math.PI * 2);
    i_ctx.clip();
    if(item.img) i_ctx.drawImage(item.img, 19, 28, 72, 72);
    else {
      item.cvs.fd({bg: color, alpha: 0.7}, "A C55,60,20,0,360 C55,105,30,0,360");
    }

    item.draw_to_fight = (x, y, w) => {
      let h = w * item.cvs.height / item.cvs.width;
      x -= w / 2;
      y = yc(y) - h * 0.95 - Math.abs(item_offset_y);
      ctx.drawImage(item.cvs, x, y, w, h);
    }
  }
  return obj;
})();
