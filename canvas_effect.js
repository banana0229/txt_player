const CanvasEffect = (() => {
  let cvs;
  let cur_efs = {};

  /* ================================ */
  /*  初始                            */
  /* ================================ */
  window.addEventListener("load", () => {
    canvas_effect.width = 960;
    canvas_effect.height = 720;
    cvs = Cvs.create(canvas_effect);
    setInterval(() => {
      cvs.clear();
      Object.entries(cur_efs).forEach(([key, cvsa_arr]) => {
        cvsa_arr = cvsa_arr.filter(cvsa => {
          cvsa.run();
          cvsa.draw();
          return !cvsa.is_end;
        });
        if(cvsa_arr.length == 0) delete cur_efs[key];
      });
    }, 60);
  });

  /* ================================ */
  /*  操作                            */
  /* ================================ */
  function add(key, ef_name) {
    switch(ef_name) {
      case "雨": cur_efs[key] = add_rain(); break;
      case "霧": cur_efs[key] = add_mist(); break;
      case "橫向速度線": cur_efs[key] = add_speed_h(); break;
      case "血": cur_efs[key] = add_blood(); break;
      case "警告": cur_efs[key] = add_warning(); break;
    }
  }
  function del(key) {
    delete cur_efs[key];
  }
  function clear() {
    cur_efs = {};
  }
  return {add, del, clear};

  /* ================================ */
  /*  可用效果                        */
  /* ================================ */
  /* 雨 */
  function add_rain() {
    let rain = new Cvsa_rain(cvs, {
      len: 0.36,
      deg: 135,
      density: 5,
      speed: 10,
      speed_offset: 3,
      color: "#fff4",
    });
    rain.init();
    return [rain];
  }
  /* 霧 */
  function add_mist() {
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
    return [mist];
  }
  /* 橫向速度線 */
  function add_speed_h() {
    let rain = new Cvsa_rain(cvs, {
      len: 0.8,
      deg: 180,
      density: 1,
      speed: 70,
      speed_offset: 10,
      color: "#fff3",
    });
    rain.init();
    return [rain];
  }
  /* 警告 */
  function add_warning() {
    let warning = new Cvsa_warning(cvs);
    warning.init();
    return [warning];
  }
  /* 噴血 */
  function add_blood() {
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
    return bloods;
  }
})();
