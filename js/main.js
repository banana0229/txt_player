window.addEventListener("load", async () => {
  Fight.cvs.id = "fight_canvas";
  find("#fight_canvas_holder").after(Fight.cvs);
  find("#fight_canvas_holder").remove();
  Articles.init();
  auto_read_articles();
});
async function auto_read_articles() {
  let hash = decodeURIComponent(location.hash).replace(/^#/, "").split(/\r|\n/)[0].trim();
  let target_url = "";
  if(/^@/.test(hash)) {
    target_url = "google_word/" + hash.replace(/^@/, "");
  }
  else if(hash) {
    target_url = "./replay/" + hash;
  }
  if(target_url) {
    let result = await read_go(target_url);
    if(result) return;
  }
  let url_el = find("#folder_url");
  if(url_el) url_el.addEventListener("keydown", async e => {
    if(e.keyCode != 13) return;
    await read_go(url_el.value);
  });
  async function read_go(target_url) {
    if(!target_url) return;
    let folder_url_input = find("#folder_url");
    folder_url_input.setAttribute("disabled", "");
    folder_url_input.value = "讀取中...";
    try {
      await Articles.read(target_url);
      folder_url_input.remove();
      return true;
    }
    catch (err) {
      folder_url_input.removeAttribute("disabled");
      folder_url_input.value = "";
      alert(err);
      return false;
    }
  }
}
function wait(sec) {
  return new Promise(resolve => {
    setTimeout(resolve, 1e3 * sec || 10);
  });
}

/* ================================ */
/*  取得 text                       */
/* ================================ */
let cur_word_id = null;
let cur_word_file = {};
async function get_file_cnt_text(url, tab_name) {
  if(!window.XMLHttpRequest) {
    alert('無法連線，請更換瀏覽器');
    return;
  }
  if(/^google_word\//.test(url)) {
    let word_id = url.replace(/^google_word\//, "").trim();
    if(!word_id) return null;
    if(cur_word_id == word_id) return cur_word_file[tab_name] || null;
    cur_word_id = word_id;
    let get_url = "https://script.google.com/macros/s/AKfycbwvYFK-HeY8uVvp4k6OHUQxt3qAn5RjpU-HTPvhwzS6fLufYp3tW-OyhJ-7xU-TdxaM/exec";
    let result_url = `${get_url}?id=${word_id}`;
    cur_word_file = await get_text(result_url, "json");
    return cur_word_file[tab_name] || null;
  }
  else {
    if(!url || !tab_name) return null;
    let result_url = `${url}/${tab_name}.txt`;
    return await get_text(result_url, "text");
  }
}
function get_text(url, type) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    if(type == "json") xhr.responseType = "json";
    else xhr.responseType = "text";
    xhr.addEventListener('load', () => {
      if(xhr.status == 200){
        if(type == "json") {
          if(xhr.response?.err) reject(xhr.response?.err);
          else resolve(xhr.response);
        }
        else resolve(xhr.response);
      }
      else {
        reject(xhr.status);
      }
    });
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send();
  });
}
