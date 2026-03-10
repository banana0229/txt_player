const Player = (() => {
  /* ================================ */
  /*  資料                            */
  /* ================================ */
  let obj = {};
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
      playlist = null;
      cur_section_file_name = null;
      find("#bg_effect_holder").innerHTML = "";
      find("#tachie_holder").innerHTML = "";
      find("#text").innerHTML = "";
      Player.set_bg(null);
      CanvasEffect.clear();
      Sound.BGM(0, null);
      Sound.BGM(1, null);
      Fight.stop();
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
        Articles.show_cover();
        throw new Error("未找到段落檔案");
      }
      playlist = TextConverter.to_section(section_txt);
      if(!playlist.length) {
        Articles.show_cover();
        throw new Error("段落檔案無內容");
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
      try {
        if(next_name) await Player.read_section(next_name);
        playing = false;
        if(next_name) auto_next_play();
      }
      catch (err) { alert(err); }
      return;
    }
    let target_play = playlist.shift();
    await Promise.all(target_play.map(play));
    playing = false;
  }

  /* ================================ */
  /*  背景                            */
  /* ================================ */
  Object.defineProperty(obj, "set_bg", { writable: false, value: (url) => {
    let val = url ? `url(${url})` : "";
    find("#main").style.setProperty("--bg", val);
  } });
  Object.defineProperty(obj, "set_bg_effect", { writable: false, value: set_bg_effect });
  function set_bg_effect(eid, url) {
    if(!url) return;
    let el = find(`.bg_effect[eid="${eid}"]`);
    if(!el) el = new_el_to_el("#bg_effect_holder", "div.bg_effect", {eid});
    el.style.setProperty("--img", `url(${url})`);
  }
  function delete_bg_effect(eid) {
    if(!eid) return;
    let el = find(`.bg_effect[eid="${eid}"]`);
    if(el) el.remove();
  }

  return obj;

  /* ================================ */
  /*  執行播放                        */
  /* ================================ */
  /* 全部 */
  function play(play_cnt) {
    switch(play_cnt.type) {
      case "背景": return Player.set_bg(play_cnt.url);
      case "背景效果刪除": return delete_bg_effect(play_cnt.id);
      case "背景效果": return Player.set_bg_effect(play_cnt.id, play_cnt.url);
      case "背景效果清空": return find("#bg_effect_holder").innerHTML = "";

      case "CVS_effect": return CanvasEffect.add(play_cnt.id, play_cnt.ef_name, play_cnt);
      case "CVS_effect_del": return CanvasEffect.del(play_cnt.id);
      case "CVSA清空": return CanvasEffect.clear();

      case "BGM": return Sound.BGM(play_cnt.id, play_cnt.url, play_cnt.volume);
      case "BGM停止": return Sound.BGM_stop(play_cnt.id);
      case "BGM清空": return Sound.BGM_clear();
      case "SE": return Sound.SE(play_cnt.url, play_cnt);

      case "立繪": return set_tachie(play_cnt);
      case "立繪刪除": return del_tachie(play_cnt.id);
      case "立繪清空": return find("#tachie_holder").innerHTML = "";
      case "文字": return set_text_content(play_cnt.name, play_cnt.cnt);

      case "戰鬥開始": return Fight.play();
      case "戰鬥結束": return Fight.stop();
      case "戰鬥設定": return Fight.set_area_color(play_cnt.area_color);
      case "戰鬥_新增接戰區": return Fight.area_create(
        play_cnt.origin, play_cnt.area_key, play_cnt.size, play_cnt.deg, play_cnt.dist
      );
      case "戰鬥_刪除接戰區": return Fight.area_del(play_cnt.area_key);
      case "戰鬥_移動接戰區": return Fight.area_move(play_cnt.area_key, play_cnt.deg, play_cnt.dist);
      case "戰鬥_接戰區連線": return Fight.line_create(play_cnt.area1, play_cnt.area2);
      case "戰鬥_刪除連線": return Fight.line_del(play_cnt.area1, play_cnt.area2);

      case "戰鬥_棋子加入": return Fight.item_enter(play_cnt.area_key, play_cnt);
      case "戰鬥_棋子離開": return Fight.item_leave(play_cnt.name);
      case "戰鬥_棋子移動": {
        if(play_cnt.area_key) Fight.item_move(play_cnt.name, play_cnt.area_key);
        if(play_cnt.i) Fight.item_set(play_cnt.name, play_cnt);
        break;
      }
    }
  }
  /* 立繪 */
  function set_tachie(play_cnt) {
    let tachie = find(`.tachie[tid="${play_cnt.id}"]`);
    if(!tachie) tachie = new_el_to_el("#tachie_holder", "img.tachie", {tid: play_cnt.id});

    if(play_cnt.img_url) tachie.src = play_cnt.img_url;
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
    if(play_cnt.i == "bottom") find("#tachie_holder").prepend(tachie);
    if(play_cnt.i == "top") find("#tachie_holder").append(tachie);
  }
  function del_tachie(id) {
    if(!id) return;
    let tachie = find(`.tachie[tid="${id}"]`);
    if(tachie) tachie.remove();
  }
  /* 文字 */
  function set_text_content(name, cnt) {
    find("#name").innerText = name || "";
    find("#text").innerText = cnt || "";
    find("#text").scrollTop = 0;
  }
})();
