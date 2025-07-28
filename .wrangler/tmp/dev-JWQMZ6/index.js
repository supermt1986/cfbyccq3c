var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-zHIKBC/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-zHIKBC/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// node_modules/itty-router/index.mjs
var t = /* @__PURE__ */ __name(({ base: e = "", routes: t2 = [], ...r2 } = {}) => ({ __proto__: new Proxy({}, { get: (r3, o2, a, s) => (r4, ...c) => t2.push([o2.toUpperCase?.(), RegExp(`^${(s = (e + r4).replace(/\/+(\/|$)/g, "$1")).replace(/(\/?\.?):(\w+)\+/g, "($1(?<$2>*))").replace(/(\/?\.?):(\w+)/g, "($1(?<$2>[^$1/]+?))").replace(/\./g, "\\.").replace(/(\/?)\*/g, "($1.*)?")}/*$`), c, s]) && a }), routes: t2, ...r2, async fetch(e2, ...o2) {
  let a, s, c = new URL(e2.url), n = e2.query = { __proto__: null };
  for (let [e3, t3] of c.searchParams)
    n[e3] = n[e3] ? [].concat(n[e3], t3) : t3;
  e:
    try {
      for (let t3 of r2.before || [])
        if (null != (a = await t3(e2.proxy ?? e2, ...o2)))
          break e;
      t:
        for (let [r3, n2, l, i] of t2)
          if ((r3 == e2.method || "ALL" == r3) && (s = c.pathname.match(n2))) {
            e2.params = s.groups || {}, e2.route = i;
            for (let t3 of l)
              if (null != (a = await t3(e2.proxy ?? e2, ...o2)))
                break t;
          }
    } catch (t3) {
      if (!r2.catch)
        throw t3;
      a = await r2.catch(t3, e2.proxy ?? e2, ...o2);
    }
  try {
    for (let t3 of r2.finally || [])
      a = await t3(a, e2.proxy ?? e2, ...o2) ?? a;
  } catch (t3) {
    if (!r2.catch)
      throw t3;
    a = await r2.catch(t3, e2.proxy ?? e2, ...o2);
  }
  return a;
} }), "t");
var r = /* @__PURE__ */ __name((e = "text/plain; charset=utf-8", t2) => (r2, o2 = {}) => {
  if (void 0 === r2 || r2 instanceof Response)
    return r2;
  const a = new Response(t2?.(r2) ?? r2, o2.url ? void 0 : o2);
  return a.headers.set("content-type", e), a;
}, "r");
var o = r("application/json; charset=utf-8", JSON.stringify);
var p = r("text/plain; charset=utf-8", String);
var f = r("text/html");
var u = r("image/jpeg");
var h = r("image/png");
var g = r("image/webp");

// src/routes/auth.js
async function registerUser(request, env) {
  try {
    const { username, email, password } = await request.json();
    if (!username || !email || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const existingUser = await env.D1_DB.prepare(
      "SELECT id FROM users WHERE email = ? OR username = ?"
    ).bind(email, username).first();
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }
    const hashedPassword = btoa(password);
    await env.D1_DB.prepare(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
    ).bind(username, email, hashedPassword).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(registerUser, "registerUser");
async function loginUser(request, env) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Missing email or password" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const hashedPassword = btoa(password);
    const user = await env.D1_DB.prepare(
      "SELECT id, username FROM users WHERE email = ? AND password = ?"
    ).bind(email, hashedPassword).first();
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      user: { id: user.id, username: user.username }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(loginUser, "loginUser");

// src/index.js
var router = t();
router.post("/api/register", registerUser);
router.post("/api/login", loginUser);
router.get("/", () => {
  return new Response(htmlTemplate, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
});
router.get("/static/:filename", ({ params }) => {
  const { filename } = params;
  if (filename === "style.css") {
    return new Response(cssTemplate, {
      headers: {
        "Content-Type": "text/css"
      }
    });
  }
  if (filename === "script.js") {
    return new Response(jsTemplate, {
      headers: {
        "Content-Type": "application/javascript"
      }
    });
  }
  return new Response("File not found", { status: 404 });
});
router.all("*", () => new Response("Not Found", { status: 404 }));
var src_default = {
  async fetch(request, env) {
    return router.handle(request, env);
  }
};
var htmlTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\u5546\u57CE\u7CFB\u7EDF - \u767B\u5F55/\u6CE8\u518C</title>
    <link rel="stylesheet" href="/static/style.css">
</head>
<body>
    <div class="container">
        <div class="form-container">
            <div class="form-header">
                <h2>\u6B22\u8FCE\u6765\u5230\u5546\u57CE\u7CFB\u7EDF</h2>
                <div class="tab">
                    <button class="tab-button active" onclick="showForm('login')">\u767B\u5F55</button>
                    <button class="tab-button" onclick="showForm('register')">\u6CE8\u518C</button>
                </div>
            </div>
            
            <!-- \u767B\u5F55\u8868\u5355 -->
            <form id="login-form" class="form active">
                <div class="input-group">
                    <label for="login-email">\u90AE\u7BB1</label>
                    <input type="email" id="login-email" required>
                </div>
                <div class="input-group">
                    <label for="login-password">\u5BC6\u7801</label>
                    <input type="password" id="login-password" required>
                </div>
                <button type="submit" class="submit-btn">\u767B\u5F55</button>
                <div class="form-footer">
                    <a href="#" onclick="showForm('register')">\u8FD8\u6CA1\u6709\u8D26\u6237\uFF1F\u7ACB\u5373\u6CE8\u518C</a>
                </div>
            </form>
            
            <!-- \u6CE8\u518C\u8868\u5355 -->
            <form id="register-form" class="form">
                <div class="input-group">
                    <label for="register-username">\u7528\u6237\u540D</label>
                    <input type="text" id="register-username" required>
                </div>
                <div class="input-group">
                    <label for="register-email">\u90AE\u7BB1</label>
                    <input type="email" id="register-email" required>
                </div>
                <div class="input-group">
                    <label for="register-password">\u5BC6\u7801</label>
                    <input type="password" id="register-password" required>
                </div>
                <div class="input-group">
                    <label for="register-confirm-password">\u786E\u8BA4\u5BC6\u7801</label>
                    <input type="password" id="register-confirm-password" required>
                </div>
                <button type="submit" class="submit-btn">\u6CE8\u518C</button>
                <div class="form-footer">
                    <a href="#" onclick="showForm('login')">\u5DF2\u6709\u8D26\u6237\uFF1F\u7ACB\u5373\u767B\u5F55</a>
                </div>
            </form>
        </div>
    </div>
    
    <script src="/static/script.js"><\/script>
</body>
</html>`;
var cssTemplate = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    width: 100%;
    max-width: 400px;
    padding: 20px;
}

.form-container {
    background: white;
    border-radius: 10px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.form-header {
    padding: 30px;
    text-align: center;
    background: #f8f9fa;
}

.form-header h2 {
    color: #333;
    margin-bottom: 20px;
}

.tab {
    display: flex;
    border-radius: 25px;
    background: #e9ecef;
    padding: 5px;
}

.tab-button {
    flex: 1;
    border: none;
    padding: 10px;
    border-radius: 20px;
    cursor: pointer;
    background: transparent;
    transition: all 0.3s ease;
    font-weight: 500;
}

.tab-button.active {
    background: #667eea;
    color: white;
}

.form {
    display: none;
    padding: 30px;
    animation: fadeIn 0.5s ease;
}

.form.active {
    display: block;
}

.input-group {
    margin-bottom: 20px;
}

.input-group label {
    display: block;
    margin-bottom: 8px;
    color: #555;
    font-weight: 500;
}

.input-group input {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    transition: border-color 0.3s;
}

.input-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submit-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
}

.submit-btn:hover {
    transform: translateY(-2px);
}

.submit-btn:active {
    transform: translateY(0);
}

.form-footer {
    text-align: center;
    margin-top: 20px;
}

.form-footer a {
    color: #667eea;
    text-decoration: none;
    font-size: 14px;
}

.form-footer a:hover {
    text-decoration: underline;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* \u54CD\u5E94\u5F0F\u8BBE\u8BA1 */
@media (max-width: 480px) {
    .container {
        padding: 10px;
    }
    
    .form-header, .form {
        padding: 20px;
    }
}`;
var jsTemplate = `// \u5207\u6362\u8868\u5355\u663E\u793A
function showForm(formType) {
    // \u9690\u85CF\u6240\u6709\u8868\u5355
    document.querySelectorAll('.form').forEach(form => {
        form.classList.remove('active');
    });
    
    // \u663E\u793A\u9009\u4E2D\u7684\u8868\u5355
    document.getElementById(formType + '-form').classList.add('active');
    
    // \u66F4\u65B0\u6807\u7B7E\u6309\u94AE\u72B6\u6001
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    event.target.classList.add('active');
}

// \u5904\u7406\u767B\u5F55\u8868\u5355\u63D0\u4EA4
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('\u767B\u5F55\u6210\u529F\uFF01');
            // \u5728\u5B9E\u9645\u5E94\u7528\u4E2D\uFF0C\u8FD9\u91CC\u5E94\u8BE5\u91CD\u5B9A\u5411\u5230\u7528\u6237\u4EEA\u8868\u677F
            console.log('Logged in user:', result.user);
        } else {
            alert('\u767B\u5F55\u5931\u8D25: ' + (result.error || '\u672A\u77E5\u9519\u8BEF'));
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('\u767B\u5F55\u8FC7\u7A0B\u4E2D\u53D1\u751F\u9519\u8BEF');
    }
});

// \u5904\u7406\u6CE8\u518C\u8868\u5355\u63D0\u4EA4
document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // \u7B80\u5355\u9A8C\u8BC1
    if (password !== confirmPassword) {
        alert('\u5BC6\u7801\u548C\u786E\u8BA4\u5BC6\u7801\u4E0D\u5339\u914D');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('\u6CE8\u518C\u6210\u529F\uFF01\u8BF7\u767B\u5F55');
            showForm('login');
        } else if (response.status === 409) {
            alert('\u7528\u6237\u5DF2\u5B58\u5728\uFF0C\u8BF7\u4F7F\u7528\u5176\u4ED6\u90AE\u7BB1\u6216\u7528\u6237\u540D');
        } else {
            alert('\u6CE8\u518C\u5931\u8D25: ' + (result.error || '\u672A\u77E5\u9519\u8BEF'));
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('\u6CE8\u518C\u8FC7\u7A0B\u4E2D\u53D1\u751F\u9519\u8BEF');
    }
});

// \u9875\u9762\u52A0\u8F7D\u5B8C\u6210\u540E\u663E\u793A\u767B\u5F55\u8868\u5355
document.addEventListener('DOMContentLoaded', function() {
    showForm('login');
});`;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-zHIKBC/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-zHIKBC/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
