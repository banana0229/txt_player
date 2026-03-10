const Articles = (() => {
  /* ================================ */
  /*  資料                            */
  /* ================================ */
  let obj = {};
  let articles = articles_parse("");
  let cur_folder_url = "";

  Object.defineProperty(obj, "data", { get: () => articles });
  Object.defineProperty(obj, "folder_url", { get: () => cur_folder_url });
  Object.defineProperty(obj, "next_section_name", {
    writable: false, value: (cur_section_file_name) => {
      if(!cur_section_file_name) {
        return articles.section_list[0]?.file_name || null;
      }
      let i = articles.section_list.findIndex(section => {
        return section.file_name == cur_section_file_name;
      });
      let next_section = articles.section_list[i + 1];
      return next_section?.file_name || null;
    },
  });

  /* ================================ */
  /*  初始                            */
  /* ================================ */
  Object.defineProperty(obj, "init", {
    writable: false, value: () => {
      Player.init();
      find("#section_list").innerHTML = "";
      articles = articles_parse("");
      cur_folder_url = "";
    },
  });

  /* ================================ */
  /*  讀取                            */
  /* ================================ */
  Object.defineProperty(obj, "read", {
    writable: false, value: async (target_folder_url) => {
      /* 重置 */
      Articles.init();
      /* 讀取 */
      let articles_txt = await get_file_cnt_text(target_folder_url, "!目錄");
      if(!articles_txt) throw new Error("無內容");
      articles = articles_parse(articles_txt);
      cur_folder_url = target_folder_url;
      /* 封面按紐 */
      let list_el = find("#section_list");
      let btn = new_el_to_el(list_el, "button.section", "封面");
      btn.addEventListener("click", Player.to_cover);
      btn.addEventListener("keydown", e => e.preventDefault());
      /* 列表生成 */
      articles.section_list.forEach(section => {
        let btn = new_el_to_el(list_el, "button.section", section.name);
        btn.addEventListener("click", async () => {
          let result_to_cover = await Player.read_section(section.file_name);
          if(!result_to_cover) Player.auto_next_play();
        });
        btn.addEventListener("keydown", e => e.preventDefault());
      });
      Player.to_cover();
    },
  });
  return obj;

  /* ================================ */
  /*  解析                            */
  /* ================================ */
  function articles_parse(txt) {
    /* 列表 */
    let imgs = imgs_parse(txt);

    /* 背景圖 */
    let bg_key = txt.match(/@\[背景\].*/)?.[0] || "";
    if(bg_key) {
      bg_key = bg_key.replace(/^@\[背景\]/, "").trim();
    }

    /* 背景效果列 */
    let bg_effect_list = [];
    let bg_effect_list_str = txt.match(/@\[背景效果\][^@\r\n]*/g) || [];
    bg_effect_list_str.forEach(bg_effect_str => {
      bg_effect_str = bg_effect_str.replace(/^@\[背景效果\]/, "").trim();
      bg_effect_list.push(bg_effect_str);
    });

    /* 動態效果列 */
    let cvsa_list = [];
    let cvsa_list_str = txt.match(/@\[CVSA\][^@\r\n]*/g) || [];
    cvsa_list_str.forEach((cvsa_str, i) => {
      let ef_name = cvsa_str.replace(/^@\[CVSA\]/, "").trim();
      cvsa_list.push(ef_name);
    });

    /* 劇本名 */
    let scenario_name = txt.match(/@\[劇本名\].*/)?.[0] || "";
    if(scenario_name) {
      scenario_name = scenario_name.replace(/^@\[劇本名\]/, "").trim();
    }

    /* 說明 */
    let describe = txt.match(/@\[說明\][^@]*/)?.[0] || "";
    if(describe) {
      describe = describe.replace(/^@\[說明\]/, "").trim();
    }

    /* 段落列表 */
    let section_list = [];
    let section_list_str = txt.match(/@\[段落\][^@]*/g) || [];
    if(section_list_str) {
      section_list_str.forEach(section_str => {
        section_str = section_str.replace(/^@\[段落\]/, "").trim();
        let [name = "--", file_name] = line_split(section_str);
        if(!file_name) file_name = name.replace(/\<br\>/g, "");
        name = name.replace(/\<br\>/g, "\n");
        section_list.push({name, file_name});
      });
    }

    /* 資料 */
    let data = {
      imgs,
      bg: bg_key || null,
      bg_effect_list,
      cvsa_list,
      scenario_name,
      describe,
      section_list,
    };
    return data;
  }
})();
