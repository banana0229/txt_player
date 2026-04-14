window.addEventListener("load", () => {
  load_contents();
  menu_click_event();
});

function load_contents() {
  [
    "建立檔案",
    "素材註冊區",
    "目錄分頁說明",
    "播放分頁說明",
    "文字指令",
    "圖片指令",
    "聲音指令",
    "效果指令",
    "其他指令",
    "遊戲指令",
  ]
  .forEach(async cnt_name => {
    let pos = new_el_to_el(content, "template");
    let cnts = await get_template_html(cnt_name);
    cnts.forEach(cnt => {
      find_all(cnt, "code").forEach(code_trim);
      find_all(cnt, ".fold_head").forEach(set_fold_head_click);
      pos.before(cnt);
    });
    pos.remove();
  });
}
function code_trim(code_el) {
  let html = code_el.innerHTML;
  let space = (html.match(/ *$/)?.[0] || "") + "  ";
  let reg = new RegExp("\n" + space, "g");
  html = html.replace(/\r\n/g, "\n").replace(reg, "\n");
  code_el.innerHTML = html.trim();
}
function set_fold_head_click(fold_head_el) {
  fold_head_el.addEventListener("click", () => {
    fold_head_el.classList.toggle("fold");
  });
}
function menu_click_event() {
  find_all("#menu .items_title").forEach(el => {
    el.addEventListener("click", () => el.classList.toggle("open"));
  });
  find_all("#menu .item, #menu .sub_item").forEach(el => {
    el.addEventListener("click", () => {
      let name = el.getAttribute("target") || el.innerText;
      let span = find(el, "span")?.innerText;
      if(span) name = name.replace(span, "");
      scroll_to_tag(name);
    });
  });
}
function scroll_to_tag(tag_name) {
  let tag = find(`[tag="${tag_name}"]`);
  if(!tag) return;
  let top_offset = tag.matches(".section_title") ? 32 : 24;
  content.scrollTop = tag.offsetTop - top_offset;
  if(tag.matches(".fold_head.fold")) tag.classList.remove("fold");
}
function get_template_html(file_name) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `./contents/${file_name}.html`, true);
    xhr.responseType = "text";
    xhr.addEventListener("load", () => {
      if(xhr.status == 200){
        let temp = new_el("template");
        temp.innerHTML = xhr.response || "";
        resolve([...temp.content.children]);
      }
      else {
        reject(xhr.status);
      }
    });
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send();
  });
}


