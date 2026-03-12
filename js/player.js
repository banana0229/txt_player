const Player = (() => {
  /* ================================ */
  /*  資料                            */
  /* ================================ */
  let obj = {};
  let playlist = null;
  let playlist_cur_i = 0;
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
      playlist_cur_i = 0;
      cur_section_file_name = null;
      Player.reset_show();
    },
  });
  Object.defineProperty(obj, "reset_show", {
    writable: false, value: () => {
      find("#bg_effect_holder").innerHTML = "";
      find("#tachie_holder").innerHTML = "";
      find("#text").innerHTML = "";
      find("#opts_holder").innerHTML = "";
      Player.set_bg(null);
      CanvasEffect.clear();
      Sound.BGM_clear();
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
    if(playing || find("#opts_holder").matches(":not(:empty)")) return;
    playing = true;
    if(!playlist?.length || !playlist[playlist_cur_i]) {
      let next_name = Articles.next_section_name(cur_section_file_name);
      try {
        if(next_name) await Player.read_section(next_name);
        playing = false;
        if(next_name) auto_next_play();
      }
      catch (err) { alert(err); }
      return;
    }
    await one_play_cmd_arr();
    playing = false;
  }
  async function one_play_cmd_arr() {
    let cmd_arr = playlist[playlist_cur_i];
    let mark = cmd_arr.find(cmd => cmd.type == "#");
    let to_mark = cmd_arr.find(cmd => cmd.type == "跳到");
    let cond_to_mark = cmd_arr.find(cmd => cmd.type == "判斷跳到");
    if(mark) await one_play_mark();
    else if(to_mark) await one_play_to_mark(to_mark);
    else if(cond_to_mark) await one_play_cond_to_mark(cond_to_mark);
    else {
      await Promise.all(cmd_arr.map(play));
      playlist_cur_i++;
    }
  }
  async function one_play_mark() {
    playlist_cur_i++;
    playing = false;
    await auto_next_play();
  }
  async function one_play_to_mark(to_mark) {
    playing = false;
    if(to_mark.file_name) await Player.read_section(to_mark.file_name);
    if(to_mark.name) await jump_to_mark(to_mark.name);
    else await auto_next_play();
  }
  async function one_play_cond_to_mark(cond_to_mark) {
    let target = cond_to_mark.opts.find(opt => {
      let count = 0;
      opt.conds.forEach(cond => count += VarMgr.if(cond));
      return count == opt.conds.length;
    });
    if(target) {
      playing = false;
      if(target.file_name) await Player.read_section(target.file_name);
      if(target.mark) await jump_to_mark(target.mark);
      else await auto_next_play();
    }
    else {
      playlist_cur_i++;
      playing = false;
      await auto_next_play();
    }
  }

  /* ================================ */
  /*  跳段                            */
  /* ================================ */
  Object.defineProperty(obj, "jump_to_mark", {writable: false, value: jump_to_mark});
  async function jump_to_mark(target_mark_name) {
    if(!playlist) throw new Error("無撥放列表");
    let get_mark_i = playlist.findIndex(cmd_arr => {
      let to_mark = cmd_arr.find(cmd => cmd.type == "#");
      return to_mark?.name == target_mark_name;
    });
    if(get_mark_i == -1) throw new Error("找不到標記");
    Player.reset_show();
    let cmd_arr = playlist[get_mark_i];
    await Promise.all(cmd_arr.map(play));
    playlist_cur_i = get_mark_i;
    await auto_next_play();
  }
  Object.defineProperty(obj, "jump_to_section_mark", {writable: false, value: jump_to_section_mark});
  async function jump_to_section_mark(file_name, target_mark_name) {
    try {
      if(cur_section_file_name != file_name) await Player.read_section(file_name);
    }
    catch (err) { throw new Error("讀取段落檔案失敗"); }
    if(target_mark_name) await Player.jump_to_mark(target_mark_name);
    else await auto_next_play();
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
  Object.defineProperty(obj, "set_bg_show_img", { writable: false, value: set_bg_show_img });
  function set_bg_show_img(siid, url) {
    if(!url) return;
    let el = find(`.bg_show_img[siid="${siid}"]`);
    if(!el) el = new_el_to_el("#bg_effect_holder", "img.bg_show_img", {siid});
    el.src = url;
  }
  function delete_bg_show_img(siid) {
    if(!siid) return;
    let el = find(`.bg_show_img[siid="${siid}"]`);
    if(el) el.remove();
  }

  /* ================================ */
  /*  執行播放                        */
  /* ================================ */
  /* 全部 */
  function play(play_cnt) {
    switch(play_cnt.type) {
      case "背景": return Player.set_bg(play_cnt.url);
      case "背景效果": return set_bg_effect(play_cnt.id, play_cnt.url);
      case "背景效果刪除": return delete_bg_effect(play_cnt.id);
      case "背景效果清空": return find_all(".bg_effect").forEach(el => el.remove());

      case "圖片": return set_bg_show_img(play_cnt.id, play_cnt.url);
      case "圖片刪除": return delete_bg_show_img(play_cnt.id);
      case "圖片清空": return find_all(".bg_show_img").forEach(el => el.remove());

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

      case "選項": return create_option_btn(play_cnt.opts);
      case "數值歸零": return VarMgr.del(play_cnt.id);
      case "數值設定": return VarMgr.set(play_cnt.id, play_cnt.val);
      case "數值變更": return VarMgr.add(play_cnt.id, play_cnt.val);
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
  /* 選項 */
  function create_option_btn(opts) {
    let opts_el = find("#opts_holder");
    opts.forEach(opt_data => {
      let btn = new_el_to_el(opts_el, "button", opt_data.show);
      btn.addEventListener("click", async () => {
        opts_el.innerHTML = "";
        try {
          if(opt_data.file_name) await jump_to_section_mark(opt_data.file_name, opt_data.mark);
          else await jump_to_mark(opt_data.mark);
        }
        catch (err) {
          new_el_to_el(opts_el, "button", {disabled: ""}, err.message);
        }
      });
    });
  }

  /* ================================ */
  /*  數值控制                        */
  /* ================================ */
  const VarMgr = (() => {
    const vm_obj = {};
    let var_list = {};

    Object.defineProperty(vm_obj, "init", {
      writable: false, value: () => {
        var_list = {};
      },
    });
    Object.defineProperty(vm_obj, "del", {
      writable: false, value: (id) => {
        delete var_list[id];
      },
    });
    Object.defineProperty(vm_obj, "set", {
      writable: false, value: (id, val) => {
        var_list[id] = val;
      },
    });
    Object.defineProperty(vm_obj, "add", {
      writable: false, value: (id, val) => {
        var_list[id] = MathEx.clamp((var_list[id] || 0) + val, -9999, 9999);
      },
    });
    Object.defineProperty(vm_obj, "if", {
      writable: false, value: (cond) => {
        if(["以上皆非", "else", "以外", "其他"].includes(cond)) return true;
        if(!/^[^=<>]+(=|<|>|<=|>=)-?\d{1,4}$/.test(cond)) return false;
        let operator = cond.match(/<=|>=|=|<|>/)?.[0] || null;
        let id = cond.match(/^[^=<>]+/)?.[0] || null;
        let val = var_list[id] || 0;
        let target_val = cond.match(/-?\d+$/)?.[0] || 0;
        switch(operator) {
          case "=": return val == target_val;
          case "<": return val < target_val;
          case ">": return val > target_val;
          case "<=": return val <= target_val;
          case ">=": return val >= target_val;
          default: return false;
        }
      },
    });

    /* VarMgr */
    Object.defineProperty(obj, "test", { get: () => var_list });
    return vm_obj;
  })();
  Object.defineProperty(obj, "var_init", { writable: false, value: VarMgr.init });

  /* Player */
  return obj;
})();
