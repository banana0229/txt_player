const TextConverter = (() => {
  const obj = {};

  /* ================================ */
  /*  取得封面資料                    */
  /* ================================ */
  Object.defineProperty(obj, "to_cover", { writable: false, value: to_cover });
  function to_cover(text) {
    let data = {
      bg_url: "",
      bg_effect_list: [], /* "img_url" */
      cvsa_list: [], /* {cvsa_name: "", arg: ""} */
      scenario_name: "",
      describe: "", /* 包含\n */
      section_list: [], /* {name, file_name} */
    };
    if(!text) return data;
    text = text.replace(/\r/g, "");

    /* 素材註冊區 */
    let imgs = get_imgs(text);

    /* 指令區 */
    text = get_no_asset_text(text);
    let command_arr = get_command_arr(text);

    /* 背景圖 */
    let bg_cmd = command_arr.find(cmd => cmd.head == "背景");
    if(bg_cmd) {
      let img_key = get_first_line(bg_cmd);
      data.bg_url = imgs[img_key] || null;
    }

    /* 背景效果列 */
    data.bg_effect_list = command_arr
      .filter(cmd => cmd.head == "背景效果")
      .map(cmd => {
        let img_key = get_first_line(cmd);
        return imgs[img_key] || null;
      })
      .filter(v => v);

    /* 動態效果列 */
    data.cvsa_list = command_arr
      .filter(cmd => cmd.head == "CVSA")
      .map(cmd => {
        let args = get_args(cmd, "cvsa_name");
        return args.cvsa_name ? args : null;
      })
      .filter(v => v);

    /* 劇本名 */
    let name_cmd = command_arr.find(cmd => cmd.head == "劇本名");
    if(name_cmd) data.scenario_name = get_first_line(name_cmd);

    /* 說明 */
    let describe_cmd = command_arr.find(cmd => cmd.head == "說明");
    if(describe_cmd) data.describe = describe_cmd.body;

    /* 段落列表 */
    data.section_list = command_arr
      .filter(cmd => cmd.head == "段落")
      .map(cmd => {
        let [name, file_name] = get_lines(cmd);
        if(!name && !file_name) return;
        if(!name) name = "未命名段落";
        if(!file_name) file_name = name.replace(/\<br\>/g, "");
        name = name.replace(/\<br\>/g, "\n");
        return {name, file_name};
      })
      .filter(v => v);

    return data;
  }

  /* ================================ */
  /*  取得段落資料                    */
  /* ================================ */
  Object.defineProperty(obj, "to_section", { writable: false, value: to_section });
  function to_section(text) {
    text = text.replace(/\r/g, "");

    /* 素材註冊區 */
    let asset = {
      imgs: get_imgs(text),
      sounds: get_sounds(text),
    };

    /* 指令區 */
    return get_no_asset_text(text)
      .split(/\n+`\n+/) /* 照分隔點切割 */
      .map(raw_text => raw_text.trim()).filter(v => v)  /* 空內容去除 */
      .map(raw_text => {
        return get_command_arr(raw_text) /* 轉換成指令 */
        .map(cmd => to_play_cmd(cmd, asset)) /* 解析成撥放指令 */
        .filter(v => v); /* 空指令去除 */
      });
  }

  /* ================================ */
  /*  指令分解                        */
  /* ================================ */
  function get_no_asset_text(text) {
    return text
      .replace(/```[^`]*```/g, "") /* 素材註冊區除外 */
      .replace(/^`|`$/g, ""); /* 頭尾空白分隔點去除 */
  }
  function get_command_arr(str) {
    let command_str_arr = str.match(/@\[[^\]]*\][^@]*/g) || [];
    return command_str_arr
      .map(command_txt => get_command(command_txt))
      .filter(v => v);
  }
  function get_command(command_txt) {
    command_txt = command_txt.trim();
    let head = command_txt.match(/^@\[[^\]]*\]/)?.[0];
    if(!head) return;
    head = head.replace(/^@\[|\]$/g, "");
    let head_main = head.split(":")[0].split("\n")[0].trim();
    if(!head_main) return;
    let head_sub = head.replace(/^[^:]*:?/, "").split("\n")[0].trim();
    let data = {head: head_main};
    if(head_sub) data.sub = head_sub;
    data.body = command_txt.replace(/^@\[[^\]]*\]/, "").trim();
    return data;
  }
  function get_first_line(cmd) { return cmd.body.split("\n")[0].trim(); }
  function get_lines(cmd) { return cmd.body.split("\n").map(line => line.trim()); }
  function get_args(cmd, main_key) {
    main_key = "" + main_key || "id";
    let args = {};
    cmd.body.split(/,|\n/).forEach(arg_str => {
      if(!/:/.test(arg_str)) {
        if(!args[main_key]) args[main_key] = arg_str.trim();
      }
      else {
        let key = arg_str.split(":")[0].trim();
        let val = arg_str.replace(/^[^:]*:/, "").trim();
        if(key && !args[key]) args[key] = val;
      }
    });
    return args;
  }
  function args_url_fill(args, asset_item) {
    Object.keys(args).forEach(arg_key => {
      if(/^img/.test(arg_key)) {
        args[arg_key + "_url"] = asset_item[args[arg_key]] || null;
        delete args[arg_key];
      }
    });
  }

  /* ================================ */
  /*  素材註冊區                      */
  /* ================================ */
  function get_imgs(text) {
    let imgs = {};
    let imgs_str = text.match(/```圖片[^`]*```/)?.[0] || "";
    let lines = imgs_str.split("\n").slice(1, -1).filter(v => v);
    lines.forEach(img_str => {
      let key = img_str.replace(/:.*/, "");
      let val = img_str.replace(/^[^:]*:/, "");
      if(key && val && !imgs[key]) imgs[key] = val;
    });
    return imgs;
  }
  function get_sounds(text) {
    let sounds = {};
    let sounds_str = text.match(/```聲音[^`]*```/)?.[0] || "";
    let lines = sounds_str.split("\n").slice(1, -1).filter(v => v);
    lines.forEach(sound_str => {
      let key = sound_str.replace(/:.*/, "");
      let val = sound_str.replace(/^[^:]*:/, "");
      if(key && val && !sounds[key]) sounds[key] = val;
    });
    return sounds;
  }

  /* ================================ */
  /*  指令分別解析                    */
  /* ================================ */
  function to_play_cmd(cmd, asset) {
    switch(cmd.head) {
      case "背景": return pcmd_bg(cmd, asset.imgs);
      case "背景效果": return pcmd_bg_effect(cmd, asset.imgs);
      case "背景效果清空": return {type: "背景效果清空"};

      case "CVSA": return pcmd_cvsa(cmd, asset.imgs);
      case "CVSA清空": return {type: "CVSA清空"};
      case "CVSFX": return pcmd_cvsfx(cmd, asset.imgs);

      case "BGM": return pcmd_bgm(cmd, asset.sounds);
      case "BGM清空": return {type: "BGM清空"};
      case "SE": return pcmd_se(cmd, asset.sounds);

      case "立繪": return pcmd_tachie(cmd, asset.imgs);
      case "立繪清空": return {type: "立繪清空"};
      case "文字": return {type: "文字", name: cmd.sub || "", cnt: cmd.body};

      case "戰鬥開始": return {type: "戰鬥開始"};
      case "戰鬥結束": return {type: "戰鬥結束"};
      case "戰鬥": return pcmd_fight_ctrl(cmd, asset.imgs);

      default: return null;
    }
  }
  /* 背景 */
  function pcmd_bg(cmd, imgs) {
    let key = get_first_line(cmd);
    let url = imgs[key] || null;
    return {type: "背景", url};
  }
  /* 背景效果 */
  function pcmd_bg_effect(cmd, imgs) {
    if(!cmd.sub) return;
    let img_key = get_first_line(cmd);
    if(!img_key) return {type: "背景效果刪除", id: cmd.sub};
    else return {
      type: "背景效果",
      id: cmd.sub,
      url: imgs[img_key] || null,
    };
  }
  /* CVSA */
  function pcmd_cvsa(cmd, imgs) {
    if(!cmd.sub) return;
    let data = {type: "CVS_effect", id: cmd.sub};
    let args = get_args(cmd, "ef_name");
    if(!args.ef_name) data.type = "CVS_effect_del";
    else {
      delete args.type;
      delete args.id;
      args_url_fill(args, imgs);
      Object.assign(data, args);
    }
    return data;
  }
  /* CVSFX (one shot) */
  function pcmd_cvsfx(cmd, imgs) {
    let data = {type: "CVS_effect", id: []};
    let args = get_args(cmd, "ef_name");
    delete args.type;
    args_url_fill(args, imgs);
    Object.assign(data, args);
    return data;
  }
  /* BGM */
  function pcmd_bgm(cmd, sounds) {
    if(!cmd.sub) return;
    let data = {type: "BGM", id: cmd.sub};
    let args = get_args(cmd, "sound");
    if(!args.sound) { data.type = "BGM停止"; return data; }
    data.url = sounds[args.sound] || null;
    if(args.volume != undefined) data.volume = MathEx.clamp(+args.volume || 0, 0, 1);
    return data;
  }
  /* SE */
  function pcmd_se(cmd, sounds) {
    let data = {type: "SE"};
    let args = get_args(cmd, "sound");
    data.url = sounds[args.sound] || null;
    if(args.volume != undefined) data.volume = MathEx.clamp(+args.volume || 0, 0, 1);
    if(args.delay != undefined) data.delay = MathEx.clamp(+args.delay || 0, 0, 30);
    return data;
  }
  /* 立繪 */
  function pcmd_tachie(cmd, imgs) {
    if(!cmd.sub) return;
    let data = {type: "立繪", id: cmd.sub};
    if(!get_first_line(cmd)) { data.type = "立繪刪除"; return data; }
    let args = get_args(cmd, "img");
    delete args.type;
    delete args.id;
    args_url_fill(args, imgs);
    Object.assign(data, args);
    return data;
  }

  /* ================================ */
  /*  指令分別解析 - 戰鬥             */
  /* ================================ */
  /* 戰鬥控制 */
  function pcmd_fight_ctrl(cmd, imgs) {
    let args = get_args(cmd, "main_key");
    switch(cmd.sub) {
      case "設定": return pcmd_fc_setting(args);
      case "接戰區": return pcmd_fc_create_area(args);
      case "接戰區刪除": return pcmd_fc_del_area(args);
      case "接戰區移動": return pcmd_fc_move_area(args);
      case "連線": return pcmd_fc_create_line(args);
      case "刪除連線": return pcmd_fc_del_line(args);
      case "棋子": return pcmd_fc_item_enter(args, imgs);
      case "棋子移動": return pcmd_fc_item_move(args);
      case "棋子刪除": return pcmd_fc_item_leave(args);
      default: return null;
    }
  }
  function pcmd_fc_create_area(args) {
    if(!args.main_key) return;
    let data = {type: "戰鬥_新增接戰區"};
    data.origin = args.origin || null;
    data.area_key = args.main_key;
    data.size = MathEx.clamp(+args.size || 80, 10, 200);
    data.deg = MathEx.clamp(+args.deg || 0, 0, 360);
    data.dist = MathEx.clamp(+args.dist || 0, -500, 500);
    return data;
  }
  function pcmd_fc_del_area(args) {
    if(!args.main_key) return;
    let data = {type: "戰鬥_刪除接戰區"};
    data.area_key = args.main_key;
    return data;
  }
  function pcmd_fc_move_area(args) {
    if(!args.main_key) return;
    let data = {type: "戰鬥_移動接戰區"};
    data.area_key = args.main_key;
    data.deg = MathEx.clamp(+args.deg || 0, 0, 360);
    data.dist = MathEx.clamp(+args.dist || 0, -500, 500);
    return data;
  }
  function pcmd_fc_create_line(args) {
    if(!args.area1 || !args.area2) return;
    return {
      type: "戰鬥_接戰區連線",
      area1: args.area1,
      area2: args.area2,
    };
  }
  function pcmd_fc_del_line(args) {
    if(!args.area1 || !args.area2) return;
    return {
      type: "戰鬥_刪除連線",
      area1: args.area1,
      area2: args.area2,
    };
  }
  function pcmd_fc_item_enter(args, imgs) {
    if(!args.main_key) return;
    let data = {type: "戰鬥_棋子加入"};
    data.name = args.main_key;
    data.area_key = args.area;
    data.img_url = imgs[args.img] || null;
    data.i = +args.i || 0;
    data.color = args.color;
    return data;
  }
  function pcmd_fc_item_move(args) {
    if(!args.main_key) return;
    let data = {type: "戰鬥_棋子移動"};
    data.name = args.main_key;
    data.area_key = args.area;
    if(args.i) data.i = +args.i || 0;
    return data;
  }
  function pcmd_fc_item_leave(args) {
    if(!args.main_key) return;
    let data = {type: "戰鬥_棋子離開"};
    data.name = args.main_key;
    return data;
  }
  function pcmd_fc_setting(args) {
    if(!args.area_color) return;
    let data = {type: "戰鬥設定"};
    data.area_color = args.area_color;
    return data;
  }

  return obj;
})();
