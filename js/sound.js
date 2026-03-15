const Sound = (() => {
  /* ================================ */
  /*  資料                            */
  /* ================================ */
  let obj = {};
  let cur_bgm = {};
  let main_volume = 0.5;

  /* ================================ */
  /*  操作                            */
  /* ================================ */
  window.addEventListener("load", () => {
    let el = find("#main_volume");
    el.addEventListener("input", () => {
      let new_volume = el.value / 100;
      Object.values(cur_bgm).forEach(bgm => {
        if(bgm) bgm.volume = new_volume;
      });
      main_volume = new_volume;
    });
    main_volume = el.value / 100;
  });

  /* ================================ */
  /*  SE                              */
  /* ================================ */
  Object.defineProperty(obj, "SE", {
    writable: false, value: (url, args = {}) => {
      if(args.delay > 0) setTimeout(() => play_se(url, args.volume), 1e3 * args.delay);
      else play_se(url, args.volume);
    },
  });
  function play_se(url, volume) {
    let se = new Audio();
    se.addEventListener("loadedmetadata", () => {
      let target_volume = volume != undefined ? volume : 1;
      se.volume = target_volume * main_volume;
      se.play();
    });
    se.src = url;
  }

  /* ================================ */
  /*  BGM                             */
  /* ================================ */
  Object.defineProperty(obj, "BGM_clear", {
    writable: false, value: () => {
      Object.keys(cur_bgm).forEach(id => stop_bgm(id));
    },
  });
  Object.defineProperty(obj, "BGM", {
    writable: false, value: (id, url, volume) => {
      if(typeof volume != "number") volume = 1;
      stop_bgm(id);
      if(url) start_bgm(id, url, volume);
    },
  });
  function start_bgm(id, url, volume) {
    let target_volume = volume * main_volume;
    let this_bgm = cur_bgm[id] = new Audio();
    this_bgm.loop = true;
    this_bgm.addEventListener("loadedmetadata", async () => {
      this_bgm.volume = 0.02;
      this_bgm.play();
      while(this_bgm.volume < target_volume) {
        if(cur_bgm[id] != this_bgm) return;
        await wait(0.1);
        this_bgm.volume = Math.min(this_bgm.volume / 0.7, target_volume);
      }
    });
    if (!file_name.endsWith('.enc')) {
      this_bgm.src = url;
    }
    else {
      load_enc_audio(url)
        .then((loaded_url) => {
            this_bgm.src = loaded_url;
        })
        .catch(err => {
            console.error("Audio load failed:", err);
        });
    }
  }
  Object.defineProperty(obj, "BGM_stop", { writable: false, value: stop_bgm });
  async function stop_bgm(id) {
    if(!cur_bgm[id]) return;
    let target_bgm = cur_bgm[id];
    delete cur_bgm[id];
    while(target_bgm.volume >= 0.01) {
      await wait(0.1);
      target_bgm.volume *= 0.7;
    }
    target_bgm.pause();
  }

  return obj;
})();
