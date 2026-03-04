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
      Object.values(cur_efs).forEach(cvsa_arr => {
        cvsa_arr.forEach(cvsa => {
          cvsa.run();
          cvsa.draw();
        });
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
})();
