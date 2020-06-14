import {
  Application,
  send,
  HttpError,
  Status,
} from "https://deno.land/x/oak/mod.ts";
import {
  green,
  red,
  yellow,
  bold,
} from "https://deno.land/std@0.57.0/fmt/colors.ts";

const app = new Application();

// Error handler
app.use(async (context, next) => {
  try {
    await next();
  } catch (e) {
    if (e instanceof HttpError) {
      context.response.status = e.status as any;
      if (e.expose && e.status !== Status.NotFound) {
        context.response.body = `<!DOCTYPE html>
            <html>
              <body>
                <h1>${e.status} - ${e.message}</h1>
              </body>
            </html>`;
      } else {
        context.response.body = `<!DOCTYPE html>
            <html>
              <body>
                <h1>${e.status} - ${Status[e.status]}</h1>
              </body>
            </html>`;
      }
    } else if (e instanceof Error) {
      context.response.status = 500;
      context.response.body = `<!DOCTYPE html>
            <html>
              <body>
                <h1>500 - Internal Server Error</h1>
              </body>
            </html>`;
      console.log("Unhandled Error:", red(bold(e.message)));
      console.log(e.stack);
    }
  }
});

// Logger
app.use(async (context, next) => {
  try {
    await next();
  } finally {
    const ip = context.request.ip;
    const log =
      `[${context.response.status}] ${ip} ${context.request.method} ${context.request.url.pathname}`;
    const colorizedLog = Math.trunc(context.response.status / 100) === 2
      ? green(log)
      : red(log);

    console.log(colorizedLog);
  }
});

// Static Content
app.use(async (context) => {
  await send(context, context.request.url.pathname, {
    root: `${Deno.cwd()}/../docs`,
    index: "index.html",
  });
});

app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    yellow(
      `Listening on: ${secure ? "https://" : "http://"}${hostname ??
        "localhost"}:${port}`,
    ),
  );
});

const secure = Deno.env.get("SECURE") === "1";

if (secure) {
  console.log(yellow("Starting Secure Server [HTTPS]"));
  await app.listen(
    {
      port: 8081,
      secure: true,
      certFile: "./tls/localhost/localhost.crt",
      keyFile: "./tls/localhost/localhost.key",
    },
  );
} else {
  console.log(yellow("Starting Insecure Server [HTTP]"));
  await app.listen(
    {
      port: 8080,
    },
  );
}
