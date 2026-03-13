const CanvasEffect = (() => {
  let cur_efs = {};

  /* ================================ */
  /*  初始                            */
  /* ================================ */
  function start_run(key, {cvs, cvsa_arr}) {
    return setInterval(() => {
      cvs.clear();
      cvs.cvsa = cvsa_arr;
      let runing_count = cvsa_arr.filter(cvsa => {
        if(!cvsa.is_end) {
          cvsa.run();
          cvsa.draw();
        }
        return !cvsa.is_end;
      }).length;
      if(runing_count == 0) del(key);
    }, 60);
  }

  /* ================================ */
  /*  操作                            */
  /* ================================ */
  function add_animation(key, ef_name, args) {
    if(cur_efs[key]) del(key);
    switch(ef_name) {
      case "雨": cur_efs[key] = add_rain(); break;
      case "霧": cur_efs[key] = add_mist(); break;
      case "橫向速度線": cur_efs[key] = add_speed_h(); break;
      case "警告": cur_efs[key] = add_warning(); break;
      case "HUD框": cur_efs[key] = add_hud_frame(args); break;
      default: return;
    }
    cur_efs[key].interval = start_run(key, cur_efs[key]);
  }
  function add_one_shot(ef_name, args) {
    let key = {};
    switch(ef_name) {
      case "血": cur_efs[key] = add_blood(); break;
      case "水波紋": cur_efs[key] = add_ripples(args); break;
      default: return;
    }
    cur_efs[key].interval = start_run(key, cur_efs[key]);
  }
  function add_switch(key, ef_name, args) {
    if(!cur_efs[key]) {
      switch(ef_name) {
        case "衝過": cur_efs[key] = add_dash_over(args); break;
        default: return;
      }
      cur_efs[key].ef_name = ef_name;
      cur_efs[key].interval = start_run(key, cur_efs[key]);
    }
    else {
      switch(cur_efs[key].ef_name) {
        case "衝過": sw_dash_over(cur_efs[key], args); break;
      }
    }
  }
  function del(key) {
    cur_efs[key].cvs.remove();
    clearInterval(cur_efs[key].interval);
    delete cur_efs[key];
  }
  function clear() {
    for(let key in cur_efs) del(key);
  }
  return {
    add_one_shot,
    add_switch,
    add_animation,
    del,
    clear,
  };

  /* ================================ */
  /*  新增畫布                        */
  /* ================================ */
  function new_cvs() {
    let cvs = Cvs.create().set_size(960, 720);
    find("#canvas_effect_holder").append(cvs);
    return cvs;
  }

  /* ================================ */
  /*  可用效果                        */
  /* ================================ */
  /* 雨 */
  function add_rain() {
    let cvs = new_cvs();
    let rain = new Cvsa_rain(cvs, {
      len: 0.36,
      deg: 135,
      density: 5,
      speed: 10,
      speed_offset: 3,
      color: "#fff4",
    });
    rain.init();
    return {cvs, cvsa_arr: [rain]};
  }
  /* 霧 */
  function add_mist() {
    let cvs = new_cvs();
    let mist = new Cvsa_mist(cvs, {
      count: 12,
      r_offset: 20,
      inner_color: "#fff8",
      color: "#fff4",
      speed: 1.5,
      speed_offset: 1,
      border_offset: -10,
    });
    mist.init();
    return {cvs, cvsa_arr: [mist]};
  }
  /* 橫向速度線 */
  function add_speed_h() {
    let cvs = new_cvs();
    let rain = new Cvsa_rain(cvs, {
      len: 0.8,
      deg: 180,
      density: 1,
      speed: 70,
      speed_offset: 10,
      color: "#fff3",
    });
    rain.init();
    return {cvs, cvsa_arr: [rain]};
  }
  /* 警告 */
  function add_warning() {
    let cvs = new_cvs();
    let warning = new Cvsa_warning(cvs);
    warning.init();
    return {cvs, cvsa_arr: [warning]};
  }
  /* HUD框 */
  function add_hud_frame(args) {
    let cvs = new_cvs();
    let hud_frame = new Cvsa_hud_frame(cvs, {
      img_url: args.img_url,
      ry: -100,
      w: 500,
      h: 300,
    });
    hud_frame.init();
    return {cvs, cvsa_arr: [hud_frame]};
  }
  /* 衝過 */
  function add_dash_over(args) {
    let type = args.s == "開" ? "open" : "close";
    let cvs = new_cvs();
    let dash_over = new Cvsa_dash_over(cvs, {type});
    dash_over.init();
    return {cvs, cvsa_arr: [dash_over]};
  }
  function sw_dash_over({cvs, cvsa_arr}, args) {
    if(args.s == "開") cvsa_arr[0].type = "open";
    else if(args.s == "關") cvsa_arr[0].type = "close";
  }
  /* 水波紋 */
  function add_ripples(args) {
    let cvs = new_cvs();
    let ripples_data = [
      {size: 0.30, speed: 24, width: 3},
      {size: 0.22, speed: 16, width: 4},
      {size: 0.14, speed: 8, width: 5},
    ];
    let ripples = ripples_data.map((data, i) => {
      Object.assign(data, {
        x: cvs.width * (args.x || 0.5),
        y: cvs.height * (args.y || 0.4) - 8 * i,
        scale_y: 0.8,
        size: cvs.width * data.size,
        width: data.width,
        blur: 1,
        color: "#bedefb",
      });
      let ripple = new CvsFx_ripples(cvs, data);
      ripple.init();
      return ripple;
    });
    return {cvs, cvsa_arr: ripples};
  }
  /* 噴血 */
  function add_blood() {
    let cvs = new_cvs();
    let bloods_data = [
      {x: 0.55, y: 0.4, r: 0.3, speed: 24, delay: 10},
      {x: 0.36, y: 0.55, r: 0.2, speed: 16, delay: 120},
      {x: 0.42, y: 0.25, r: 0.14, speed: 12, delay: 200},
    ];
    let bloods = [];
    bloods_data.forEach((data, i) => {
      Object.assign(data, {
        x: cvs.width * data.x,
        y: cvs.height * data.y,
        r: cvs.width * data.r,
      });
      let blood = new CvsFx_blood(cvs, data);
      blood.init();
      setTimeout(() => {
        bloods.push(blood);
      }, data.delay);
    });
    return {cvs, cvsa_arr: bloods};
  }
})();
