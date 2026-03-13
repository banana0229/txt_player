const TextAnimation = (() => {
  let cur_show = [];
  function create(index, str, opts = {}) {
    index = MathEx.clamp(Math.round(+index || 1), 1, 3);
    if(cur_show[index]) remove(index);
    let el = create_el(str);
    el.setAttribute("line", index);
    set_style(opts, el);
    setTimeout(() => run_show(el), 1e3 * (+opts.delay || 0.01));
    cur_show[index] = el;
  }
  function remove(index) {
    if(!cur_show[index]) return;
    cur_show[index].remove();
    delete cur_show[index];
  }
  function clear() {
    Object.keys(cur_show).forEach(index => remove(index));
  }

  function run_show(el) {
    let now_span = find(el, ".hide");
    if(!now_span) return;
    now_span.classList.remove("hide");
    setTimeout(() => run_show(el), 100);
  }
  function set_style(opts, el) {
    if(opts.color) el.style.color = opts.color;
    if(opts.border_color) el.style.setProperty("--ts", opts.border_color);
  }
  function create_el(str) {
    str = str.replace(/\r|\n/g, "");
    let el = new_el("div.text_animation");
    str.split("").forEach(c => {
      if(c == "\n") new_el_to_el(el, "br");
      else new_el_to_el(el, "span.hide", c);
    });
    find("#canvas_effect_holder").append(el);
    el.style.setProperty("--w", el.offsetWidth);
    el.style.setProperty("--h", el.offsetHeight);
    return el;
  }
  
  return {create, remove, clear};
})();
