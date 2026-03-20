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
    Object.defineProperty(ctx, "reset", { writable: false, value: () => {
      _restore();
      _save();
      ctx.style = {filter: "none"};
    } });
    /* 清除 */
    Object.defineProperty(canvas, "clear", {
      writable: false, value: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      },
    });

    /* ================================ */
    /*  設定                            */
    /* ================================ */
    Object.defineProperty(canvas, "set_size", {
      writable: false, value: (w, h) => {
        canvas.width = Math.min(Math.max(+w || 1, 1), 12000);
        canvas.height = Math.min(Math.max(+h || 1, 1), 12000);
        return canvas;
      },
    });
    Object.defineProperty(ctx, "style", {
      get: () => {
        let matrix = ctx.getTransform();
        return {
          color: ctx.strokeStyle,
          width: ctx.lineWidth,
          cap: ctx.lineCap,
          turn: ctx.lineJoin,
          bg: ctx.fillStyle,
          filter: ctx.filter,
          alpha: ctx.globalAlpha,
          scale_x: matrix.a,
          scale_y: matrix.b,
        };
      },
      set: (opt) => {
        if(!opt) return;
        if(opt.color) ctx.strokeStyle = opt.color || "#000";
        if(opt.width) ctx.lineWidth = +opt.width || 1;
        if(opt.cap) ctx.lineCap = opt.cap || "butt";
        if(opt.turn) ctx.lineJoin = opt.turn || "miter";
        if(opt.bg) ctx.fillStyle = opt.bg || "#000";
        if(opt.filter) ctx.filter = opt.filter || "none";
        if(typeof opt.alpha == "number") ctx.globalAlpha = +opt.alpha || 0;
        if([typeof opt.scale_x, typeof opt.scale_y].includes("number")) {
          let matrix = ctx.getTransform();
          if(typeof opt.scale_x != "number") opt.scale_x = matrix.a;
          if(typeof opt.scale_y != "number") opt.scale_y = matrix.b;
          ctx.scale(opt.scale_x, opt.scale_y);
        }
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
