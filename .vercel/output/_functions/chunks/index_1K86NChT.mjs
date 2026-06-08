import { c as createComponent } from './astro-component_Br4dEppa.mjs';
import 'piccolore';
import { o as createRenderInstruction, h as addAttribute, p as renderHead, q as renderSlot, k as renderTemplate, v as renderComponent, m as maybeRenderHead } from './entrypoint_gKy4zVmr.mjs';
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
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.ico"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title>${renderHead()}</head> <body class="min-h-screen bg-zinc-50 text-zinc-900 antialiased"> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "D:/VS/internal-webflow-sentry/src/layouts/Layout.astro", void 0);

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const users = ["George", "Arianne", "Jep"];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Who is using Webflow?" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-12"> <div class="w-full max-w-2xl space-y-8 text-center"> <header class="space-y-2"> <h1 class="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
Who is using Webflow right now?
</h1> <p class="text-sm text-zinc-500">Tap your name when you open Webflow. Everyone on this page sees the same status.</p> </header> <div id="status-banner" role="status" aria-live="polite" class="rounded-xl border px-6 py-4 text-base font-medium transition-colors duration-200">
🟢 Webflow is currently free to use.
</div> <div class="grid gap-4 sm:grid-cols-3"> ${users.map((user) => renderTemplate`<article class="user-card flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"${addAttribute(user, "data-user")}> <h2 class="text-xl font-semibold text-zinc-900">${user}</h2> <button type="button" class="user-action w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500"${addAttribute(user, "data-user")}>
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
