const Cvs = (() => {
  let cvs = {};
  let ex_list = {};
  Object.defineProperty(cvs, "create", { writable: false, value: create });
  Object.defineProperty(cvs, "add_ex", { writable: false, value: (key, ex) => { ex_list[key] = ex; } });
  return cvs;
  function create(target_canvas) {
    /* ================================ */
    /*  初始                            */
    /* ================================ */
    let canvas;
    if(target_canvas instanceof HTMLCanvasElement) canvas = target_canvas;
    else canvas = document.createElement("canvas");
    canvas.setAttribute("cvs", "");
    Object.defineProperty(canvas, "is_cvs", { writable: false, value: true });

    let ctx = canvas.getContext("2d");
    Object.defineProperty(canvas, "ctx", { writable: false, value: ctx });
  
    /* ================================ */
    /*  重設                            */
    /* ================================ */
    /* 重設樣式 */
    const _save = ctx.save.bind(ctx);  
    const _restore = ctx.restore.bind(ctx);
    _save();
    Object.defineProperty(ctx, "save", { writable: false, value: new Error("Disable save") });
    Object.defineProperty(ctx, "restore", { writable: false, value: new Error("Disable restore") });
    Object.defineProperty(ctx, "reset", { writable: false, value: () => { _restore(); _save(); } });
    /* 清除 */
    Object.defineProperty(canvas, "clear", {
      writable: false, value: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      },
    });

    /* ================================ */
    /*  設定                            */
    /* ================================ */
    Object.defineProperty(ctx, "style", {
      get: () => {
        return {
          color: ctx.strokeStyle,
          width: ctx.lineWidth,
          cap: ctx.lineCap,
          bg: ctx.fillStyle,
          filter: ctx.filter,
        };
      },
      set: (opt) => {
        if(!opt) return;
        if(opt.color) ctx.strokeStyle = opt.color || "#000";
        if(opt.width) ctx.lineWidth = +opt.width || 1;
        if(opt.cap) ctx.lineCap = opt.cap || "butt";
        if(opt.bg) ctx.fillStyle = opt.bg || "#000";
        if(opt.filter) ctx.filter = opt.filter || "none";
      },
    });

    /* ================================ */
    /*  額外                            */
    /* ================================ */
    Object.entries(ex_list).forEach(([key, ex]) => {
      Object.defineProperty(canvas, key, {
        writable: false,
        value: ex.bind(canvas),
      });
    });

    return canvas;
  }
})();
