import { c as createComponent } from './astro-component_iApg47jB.mjs';
import 'piccolore';
import { o as createRenderInstruction, h as addAttribute, p as renderHead, q as renderSlot, k as renderTemplate, v as renderComponent, m as maybeRenderHead } from './entrypoint_Bm9H-Rj2.mjs';
import 'clsx';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  const { title = "Webflow Status" } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.ico"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="generator"${addAttribute(Astro2.generator, "content")}><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Manrope:wght@700&display=swap" rel="stylesheet"><title>${title}</title>${renderHead()}</head> <body class="relative min-h-screen bg-background text-foreground font-sans antialiased"> <div aria-hidden="true" class="dot-pattern dot-grid-overlay fixed inset-0"></div> <div class="relative z-10"> ${renderSlot($$result, $$slots["default"])} </div> </body></html>`;
}, "D:/VS/internal-webflow-sentry/src/layouts/Layout.astro", void 0);

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const users = ["George", "Arianne", "Jep"];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Who is using Webflow?" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="flex min-h-screen flex-col items-center justify-center px-6 py-12"> <div class="w-full max-w-3xl space-y-8 rounded-2xl border border-border bg-card/80 p-8 shadow-sm backdrop-blur-sm"> <header class="space-y-2 text-center"> <h1 class="font-heading text-4xl font-bold tracking-tight text-foreground">
Who is using Webflow right now?
</h1> <p class="text-sm font-normal text-muted-foreground">
Tap your name when you open Webflow. Everyone on this page sees the same status.
</p> </header> <div id="status-banner" role="status" aria-live="polite" data-status="free">
Webflow is free to use
</div> <div class="grid gap-4 sm:grid-cols-3"> ${users.map((user) => renderTemplate`<article class="user-card flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"${addAttribute(user, "data-user")}> <h2 class="font-heading text-xl font-semibold text-card-foreground">${user}</h2> <button type="button" class="user-action btn-primary"${addAttribute(user, "data-user")}>
I'm in Webflow
</button> </article>`)} </div> </div> </main> ` })} ${renderScript($$result, "D:/VS/internal-webflow-sentry/src/pages/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/VS/internal-webflow-sentry/src/pages/index.astro", void 0);

const $$file = "D:/VS/internal-webflow-sentry/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
