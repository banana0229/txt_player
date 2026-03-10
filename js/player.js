const Player = (() => {
  /* ================================ */
  /*  資料                            */
  /* ================================ */
  let obj = {};
  let imgs = {};
  let sounds = {};
  let playlist = null;
  let cur_section_file_name = null;

  /* ================================ */
  /*  操作                            */
  /* ================================ */
  window.addEventListener("load", () => {
    find("#next_btn").addEventListener("click", Player.next_play);
    find("#next_btn").addEventListener("keydown", e => e.preventDefault());
  });
  document.addEventListener("keydown", (e) => {
    if(e.keyCode == 32) Player.next_play();
  });

  /* ================================ */
  /*  初始                            */
  /* ================================ */
  Object.defineProperty(obj, "init", {
    writable: false, value: () => {
      imgs = {};
      sounds = {};
      playlist = null;
      cur_section_file_name = null;
      find("#bg_effect_holder").innerHTML = "";
      find("#tachie_holder").innerHTML = "";
      find("#text").innerHTML = "";
      set_bg(null);
      CanvasEffect.clear();
      Sound.BGM(0, null);
      Sound.BGM(1, null);
      Fight.stop();
    },
  });

  /* ================================ */
  /*  封面                            */
  /* ================================ */
  Object.defineProperty(obj, "to_cover", {
    writable: false, value: () => {
      Player.init();
      let data = Articles.data;
      let cover_url = data.imgs[data.bg] || "";
      set_bg(cover_url);
      data.bg_effect_list.forEach(bg_effect => {
        let url = data.imgs[bg_effect] || "";
        if(!url) return;
        let el = new_el_to_el("#bg_effect_holder", "div.bg_effect");
        el.style.setProperty("--img", `url(${url})`);
      });
      data.cvsa_list.forEach((ef_name, i) => CanvasEffect.add(i, ef_name));
      find("#name").innerText = data.scenario_name || "";
      find("#text").innerText = data.describe || "";
    },
  });

  /* ================================ */
  /*  讀取                            */
  /* ================================ */
  Object.defineProperty(obj, "read_section", {
    writable: false, value: async (file_name) => {
      Player.init();
      let section_txt = await get_file_cnt_text(Articles.folder_url, file_name);
      if(!section_txt) {
        Player.to_cover();
        return -1;
      }
      imgs = imgs_parse(section_txt);
      sounds = sounds_parse(section_txt);
      playlist = section_parse(section_txt);
      if(!playlist.length) {
        Player.to_cover();
        return -1;
      }
      cur_section_file_name = file_name;
    },
  });

  /* ================================ */
  /*  下一頁                          */
  /* ================================ */
  let playing = false;
  let next_play_cd = false;
  Object.defineProperty(obj, "next_play", {
    writable: false, value: async () => {
      if(next_play_cd) return;
      next_play_cd = true;
      await auto_next_play();
      setTimeout(() => { next_play_cd = false; }, 100);
    },
  });
  Object.defineProperty(obj, "auto_next_play", {writable: false, value: auto_next_play});
  async function auto_next_play() {
    if(playing) return;
    playing = true;
    if(!playlist?.length) {
      let next_name = Articles.next_section_name(cur_section_file_name);
      if(next_name) await Player.read_section(next_name);
      playing = false;
      if(next_name) auto_next_play();
      return;
    }
    let target_play = playlist.shift();
    await Promise.all(target_play.map(play));
    playing = false;
  }
  return obj;

  /* ================================ */
  /*  背景                            */
  /* ================================ */
  function set_bg(url) {
    let val = url ? `url(${url})` : "";
    find("#main").style.setProperty("--bg", val);
  }

  /* ================================ */
  /*  執行播放                        */
  /* ================================ */
  /* 全部 */
  function play(play_cnt) {
    switch(play_cnt.type) {
      case "背景": return set_bg(play_cnt.url);
      case "背景效果": return play_bg_effect(play_cnt);
      case "效果清空": return find("#bg_effect_holder").innerHTML = "";

      case "CVSA": case "CVSFX": return play_canvas_effect(play_cnt);
      case "CVSA清空": return CanvasEffect.clear();

      case "BGM_A": return Sound.BGM(0, play_cnt.url, play_cnt.volume);
      case "BGM_B": return Sound.BGM(1, play_cnt.url, play_cnt.volume);
      case "SE": return Sound.SE(play_cnt.url, play_cnt);

      case "立繪": return play_tachie(play_cnt);
      case "立繪清空": return find("#tachie_holder").innerHTML = "";
      case "文字": return play_text(play_cnt);

      case "戰鬥開始": return Fight.play();
      case "戰鬥結束": return Fight.stop();
      case "戰鬥控制": return play_fight_ctrl(play_cnt);
    }
  }
  /* 戰鬥控制 */
  function play_fight_ctrl(play_cnt) {
    if(play_cnt.action == "接戰區") {
      Fight.area_create(
        play_cnt.origin || null,
        play_cnt.key,
        +play_cnt.size || 80,
        +play_cnt.deg || 0,
        +play_cnt.dist || 0,
      );
    }
    else if(play_cnt.action == "接戰區刪除") {
      Fight.area_del(play_cnt.key);
    }
    else if(play_cnt.action == "接戰區移動") {
      Fight.area_move(
        play_cnt.key,
        play_cnt.deg || 0,
        play_cnt.dist || 0,
      );
    }
    else if(play_cnt.action == "棋子") {
      let data = {name: play_cnt.key, i: play_cnt.i || 0};
      if(play_cnt.color) data.color = play_cnt.color;
      if(play_cnt.img) data.img_url = imgs[play_cnt.img] || null;
      Fight.item_enter(play_cnt.area, data);
    }
    else if(play_cnt.action == "棋子移動") {
      if(play_cnt.area) Fight.item_move(play_cnt.key, play_cnt.area);
      if(play_cnt.i) Fight.item_set(play_cnt.key, {
        i: play_cnt.i,
      });
    }
    else if(play_cnt.action == "棋子刪除") {
      Fight.item_leave(play_cnt.key);
    }
    else if(play_cnt.action == "連線") {
      Fight.line_create(play_cnt.area1, play_cnt.area2);
    }
    else if(play_cnt.action == "連線刪除") {
      Fight.line_del(play_cnt.area1, play_cnt.area2);
    }
    else if(play_cnt.action == "設定") {
      if(play_cnt.area_color) Fight.set_area_color(play_cnt.area_color);
    }
  }
  /* 動態效果 */
  function play_canvas_effect(play_cnt) {
    if(play_cnt.del) CanvasEffect.del(play_cnt.key);
    else CanvasEffect.add(play_cnt.key, play_cnt.ef_name, play_cnt);
  }
  /* 背景效果 */
  function play_bg_effect(play_cnt) {
    let bg_effect = find(`.bg_effect[eid="${play_cnt.id}"]`);
    if(play_cnt.del) {
      if(bg_effect) bg_effect.remove();
      return;
    }
    if(!bg_effect) {
      bg_effect = new_el_to_el("#bg_effect_holder", "div.bg_effect", {eid: play_cnt.id});
    }
    if(play_cnt.url) {
      bg_effect.style.setProperty("--img", `url(${play_cnt.url})`);
    }
  }
  /* 文字 */
  function play_text(play_cnt) {
    find("#name").innerText = play_cnt.name || "？？";
    find("#text").innerText = play_cnt.cnt || "";
    find("#text").scrollTop = 0;
  }
  /* 立繪 */
  function play_tachie(play_cnt) {
    let tachie = find(`.tachie[tid="${play_cnt.id}"]`);
    if(play_cnt.del) {
      if(tachie) tachie.remove();
      return;
    }
    if(!tachie) {
      tachie = new_el_to_el("#tachie_holder", "img.tachie", {tid: play_cnt.id});
    }
    if(play_cnt.img) {
      let url = imgs[play_cnt.img];
      if(url) tachie.src = url;
    }
    if(play_cnt.z) tachie.style.setProperty("--z", play_cnt.z);
    if(play_cnt.s) tachie.setAttribute("state", play_cnt.s);
    if(play_cnt.l) {
      tachie.style.setProperty("--l", play_cnt.l);
      tachie.style.setProperty("--r", "");
    }
    if(play_cnt.r) {
      tachie.style.setProperty("--r", play_cnt.r);
      tachie.style.setProperty("--l", "");
    }
    if(play_cnt.i == "up" && tachie.nextElementSibling) {
      tachie.nextElementSibling.after(tachie);
    }
    if(play_cnt.i == "down" && tachie.previousElementSibling) {
      tachie.previousElementSibling.before(tachie);
    }
    if(play_cnt.i == "bottom") find("#tachie_holder").prepend(tachie);
    if(play_cnt.i == "top") find("#tachie_holder").append(tachie);
  }

  /* ================================ */
  /*  執行解析                        */
  /* ================================ */
  /* 全部 */
  function section_parse(txt) {
    txt = txt.replace(/```[^`]*```/g, "");
    let list = txt.split(/[\n\r]+`[\n\r]+/).map(raw => {
      raw = raw.trim();
      let plar_arr = raw.match(/@[^@]*/g) || [];
      return plar_arr
        .map(str => one_plar_parse(str))
        .filter(v => v);
    });
    return list;
  }
  /* 分類 */
  function one_plar_parse(str) {
    str = str.trim();
    if(!str) return null;
    else if(/^@\[背景\]/.test(str)) return opp_bg(str);
    else if(/^@\[背景效果:[^\]]*\]/.test(str)) return opp_bg_effect(str);

    else if(/^@\[CVSA:[^\]]*\]/.test(str)) return opp_cvsa_effect(str);
    else if(/^@\[CVSFX\]/.test(str)) return opp_cvs_effect_os(str);
    else if(/^@\[CVSA清空\]/.test(str)) return {type: "CVSA清空"};

    else if(/^@\[BGM_(A|B)(:.*)?\]/.test(str)) return opp_bgm(str);
    else if(/^@\[SE\]/.test(str)) return opp_se(str);

    else if(/^@\[立繪:[^\]]*\]/.test(str)) return opp_tachie(str);
    else if(/^@\[立繪清空\]/.test(str)) return {type: "立繪清空"};
    else if(/^@\[效果清空\]/.test(str)) return {type: "效果清空"};
    else if(/^@\[文字:[^\]]*\]/.test(str)) return opp_text(str);

    else if(/^@\[戰鬥開始\]/.test(str)) return {type: "戰鬥開始"};
    else if(/^@\[戰鬥結束\]/.test(str)) return {type: "戰鬥結束"};
    else if(/^@\[戰鬥:[^\]]*\]/.test(str)) return opp_fight_ctrl(str);
    return null;
  }
  /* 背景 */
  function opp_bg(str) {
    let key = str.replace(/^@\[背景\]/, "").split(/\r|\n/)[0];
    let url = imgs[key] || null;
    return {type: "背景", url};
  }
  /* 背景音樂 */
  function opp_bgm(str) {
    let type = /^@\[BGM_A/.test(str) ? "BGM_A" : "BGM_B";
    let key = str.replace(/^@\[BGM_(A|B)(:.*)?\]/, "").split(/\r|\n/)[0];
    let url = sounds[key] || null;
    let volume = str.replace(/^@\[BGM_(A|B):?|\].*$/g, "").split(/\r|\n/)[0];
    volume = +volume || 1;
    return {type, url, volume};
  }
  /* 音效 */
  function opp_se(str) {
    let data = {type: "SE"};
    let sets = str.replace(/^@\[SE\]/, "").split(/\r|\n/)[0].trim();
    if(!sets) return null;
    sets.split(",").forEach(set => {
      if(!/:/.test(set)) {
        let sound_key = set.trim();
        data.url = sounds[sound_key] || null;
      }
      else {
        let key = set.replace(/:.*/, "");
        let val = set.replace(/^[^:]*:/, "");
        data[key.trim()] = val.trim();
      }
    });
    return data;
  }
  /* 文字 */
  function opp_text(str) {
    return {
      type: "文字",
      name: str.replace(/^@\[文字:|\].*/g, "").split("\n")[0],
      cnt: str.replace(/^@\[文字[^\]]*\]/, "").trim(),
    };
  }
  /* 背景效果 */
  function opp_bg_effect(str) {
    let data = {type: "背景效果"};
    data.id = str.replace(/^@\[背景效果:|\].*/g, "").split("\n")[0];
    let key = str.replace(/^@\[背景效果[^\]]*\]/, "").split("\n")[0].trim();
    if(!key) data.del = true;
    else data.url = imgs[key] || null;
    return data;
  }
  /* 動態效果 */
  function opp_cvsa_effect(str) {
    let data = {type: "CVSA"};
    data.key = str.replace(/^@\[CVSA:|\].*/g, "").split(/\r|\n/)[0];
    let sets = str.replace(/^@\[CVSA[^\]]*\]/, "").split(/\r|\n/)[0].trim();
    if(!sets) data.del = true;
    sets.split(",").forEach(set => {
      if(!/:/.test(set)) data.ef_name = set.trim();
      else {
        let key = set.replace(/:.*/, "");
        let val = set.replace(/^[^:]*:/, "");
        data[key.trim()] = val.trim();
      }
    });
    return data;
  }
  /* cvs特效 (one shot) */
  function opp_cvs_effect_os(str) {
    let data = {type: "CVSFX"};
    data.key = data;
    let sets = str.replace(/^@\[CVSFX\]/, "").split(/\r|\n/)[0].trim();
    if(!sets) return null;
    sets.split(",").forEach(set => {
      if(!/:/.test(set)) data.ef_name = set.trim();
      else {
        let key = set.replace(/:.*/, "");
        let val = set.replace(/^[^:]*:/, "");
        data[key.trim()] = val.trim();
      }
    });
    return data;
  }
  /* 立繪 */
  function opp_tachie(str) {
    let data = {type: "立繪"};
    data.id = str.replace(/^@\[立繪:|\].*/g, "");
    let sets = str.replace(/^@\[立繪:[^\]]*\]/, "").trim();
    if(!sets) data.del = true;
    else {
      sets.split(",").forEach(set => {
        if(!/:/.test(set)) data.img = set.trim();
        else {
          let key = set.replace(/:.*/, "");
          let val = set.replace(/^[^:]*:/, "");
          data[key.trim()] = val.trim();
        }
      });
    }
    return data;
  }
  /* 戰鬥控制 */
  function opp_fight_ctrl(str) {
    let data = {type: "戰鬥控制"};
    data.action = str.replace(/^@\[戰鬥:|\].*/g, "").split(/\r|\n/)[0].trim();
    let sets = str.replace(/^@\[戰鬥:[^\]]*\]/, "").trim();
    if(!sets) return;
    sets.split(",").forEach(set => {
      if(!/:/.test(set)) data.key = set.trim();
      else {
        let key = set.split(":")[0];
        let val = set.replace(/^[^:]*:/, "");
        data[key.trim()] = val.trim() || null;
      }
    });
    return data;
  }
})();
