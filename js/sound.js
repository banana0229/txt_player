const Sound = (() => {
  /* ================================ */
  /*  資料                            */
  /* ================================ */
  let obj = {};
  let cur_bgm = [null, null];
  let main_volume = 0.5;

  /* ================================ */
  /*  操作                            */
  /* ================================ */
  window.addEventListener("load", () => {
    let el = find("#main_volume");
    el.addEventListener("input", () => {
      let new_volume = el.value / 100;
      cur_bgm.forEach(bgm => {
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
      if(args.delay > 0) setTimeout(() => play_se(url), 1e3 * args.delay);
      else play_se(url);
    },
  });
  function play_se(url) {
    let se = new Audio();
    se.addEventListener("loadedmetadata", () => {
      se.volume = main_volume;
      se.play();
    });
    se.src = url;
  }

  /* ================================ */
  /*  BGM                             */
  /* ================================ */
  Object.defineProperty(obj, "BGM", {
    writable: false, value: (index, url, volume) => {
      if(!volume) volume = 1;
      stop_bgm(index);
      if(url) start_bgm(index, url, volume);
    },
  });
  function start_bgm(index, url, volume) {
    let target_volume = volume * main_volume;
    let this_bgm = cur_bgm[index] = new Audio();
    this_bgm.loop = true;
    this_bgm.addEventListener("loadedmetadata", async () => {
      this_bgm.volume = 0.02;
      this_bgm.play();
      while(this_bgm.volume < target_volume) {
        if(cur_bgm[index] != this_bgm) return;
        await wait(0.1);
        this_bgm.volume = Math.min(this_bgm.volume / 0.7, target_volume);
      }
    });
    this_bgm.src = url;
  }
  async function stop_bgm(index) {
    if(!cur_bgm[index]) return;
    let target_bgm = cur_bgm[index];
    cur_bgm[index] = null;
    while(target_bgm.volume >= 0.01) {
      await wait(0.1);
      target_bgm.volume *= 0.7;
    }
    target_bgm.pause();
  }

  return obj;
})();
