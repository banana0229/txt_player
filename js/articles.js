const Articles = (() => {
  /* ================================ */
  /*  資料                            */
  /* ================================ */
  let obj = {};
  let articles;
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
      Player.var_init();
      find("#section_list").innerHTML = "";
      articles = TextConverter.to_cover("");
      cur_folder_url = "";
    },
  });

  /* ================================ */
  /*  讀取                            */
  /* ================================ */
  Object.defineProperty(obj, "read", {
    writable: false, value: async (target_folder_url) => {
      Articles.init();
      let articles_txt = await get_file_cnt_text(target_folder_url, "!目錄");
      if(!articles_txt) throw new Error("無內容");
      articles = TextConverter.to_cover(articles_txt);
      cur_folder_url = target_folder_url;
      create_section_btns(articles.section_list);
      find("title").innerHTML = articles.scenario_name || "團錄撥放器";
      Articles.show_cover();
    },
  });
  function create_section_btns(section_list_data) {
    let list_el = find("#section_list");

    /* 封面按紐 */
    let btn = new_el_to_el(list_el, "button.section", "封面");
    btn.addEventListener("click", Articles.show_cover);
    btn.addEventListener("keydown", e => e.preventDefault());

    /* 列表生成 */
    section_list_data.forEach(section => {
      let btn = new_el_to_el(list_el, "button.section", section.name);
      btn.addEventListener("click", async () => {
        try {
          await Player.read_section(section.file_name);
          Player.auto_next_play();
        }
        catch (err) { alert(err); }
      });
      btn.addEventListener("keydown", e => e.preventDefault());
    });
  }

  /* ================================ */
  /*  顯示封面                        */
  /* ================================ */
  Object.defineProperty(obj, "show_cover", {
    writable: false, value: () => {
      Player.init();
      let data = Articles.data;
      Player.set_bg(data.bg_url);
      data.bg_effect_list.forEach((img_url, i) => Player.set_bg_effect(i, img_url));
      data.cvsa_list.forEach((args, i) => CanvasEffect.add(i, args.cvsa_name, args));
      find("#name").innerText = data.scenario_name || "";
      find("#text").innerText = data.describe || "";
    },
  });

  return obj;
})();
