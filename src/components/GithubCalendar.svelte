<script lang="ts">
  import { onMount } from "svelte";
  import { calendarConfig } from "../config";

  export let username: string = calendarConfig.username;
  export let cardTitle: string = calendarConfig.cardTitle;
  export let palette: string[] = calendarConfig.palette ?? ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

  let container: HTMLDivElement | null = null;
  let tooltipText = "";
  let tooltipVisible = false;
  let tooltipStyle = { left: "0px", top: "0px" };

  function colorForCount(count: number, max: number, paletteLocal: string[]) {
    if (count <= 0) return paletteLocal[0];
    const step = Math.max(1, Math.ceil(max / (paletteLocal.length - 1)));
    const idx = Math.min(paletteLocal.length - 1, Math.ceil(count / step));
    return paletteLocal[idx];
  }

  onMount(async () => {
    if (!container) return;
    try {
      const res = await fetch(`https://github.com/users/${username}/contributions`);
      if (!res.ok) throw new Error("Fetch failed");
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "image/svg+xml");
      const svg = doc.querySelector("svg");
      if (!svg) throw new Error("No svg returned");

      svg.removeAttribute("width");

      container.innerHTML = "";
      const wrapper = document.createElement("div");
      wrapper.className = "gh-calendar-wrapper";
      wrapper.appendChild(svg);
      container.appendChild(wrapper);

      const rects = Array.from(svg.querySelectorAll("rect[data-count]")) as SVGRectElement[];
      const counts = rects.map((r) => parseInt(r.getAttribute("data-count") || "0", 10));
      const max = counts.length ? Math.max(...counts) : 0;

      rects.forEach((r) => {
        const count = parseInt(r.getAttribute("data-count") || "0", 10);
        const date = r.getAttribute("data-date") || "";
        const fill = colorForCount(count, max, palette);
        r.setAttribute("fill", fill);
        r.style.transition = "fill 160ms ease";

        r.addEventListener("mouseenter", (ev) => {
          tooltipText = `${count} contribution${count === 1 ? "" : "s"} • ${date}`;
          tooltipVisible = true;
          const rectB = (ev.target as Element).getBoundingClientRect();
          const containerB = container!.getBoundingClientRect();
          tooltipStyle = {
            left: `${rectB.left - containerB.left + rectB.width / 2}px`,
            top: `${rectB.top - containerB.top - 8}px`,
          };
        });
        r.addEventListener("mouseleave", () => {
          tooltipVisible = false;
        });
      });
    } catch (e) {
      console.error(e);
      if (container) container.innerHTML = `<div class="text-sm text-red-500">無法載入 GitHub Calendar</div>`;
    }
  });
</script>

<div class="p-4 rounded-lg shadow-sm bg-[--card-bg] max-w-full">
  <div class="flex items-center justify-between mb-2">
    <h3 class="text-sm font-semibold">{cardTitle}</h3>
    <a class="text-xs text-muted" href={"https://github.com/" + username} target="_blank" rel="noreferrer">@{username}</a>
  </div>

  <div class="relative overflow-hidden">
    <div bind:this={container} class="w-full overflow-x-auto"></div>

    {#if tooltipVisible}
      <div
        class="absolute -translate-x-1/2 -translate-y-full pointer-events-none z-50"
        style="left: {tooltipStyle.left}; top: {tooltipStyle.top};">
        <div class="inline-block px-2 py-1 text-xs rounded-md bg-black/90 text-white shadow-md whitespace-nowrap">
          {tooltipText}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(.gh-calendar-wrapper svg) {
    max-width: 100%;
    height: auto;
    display: block;
  }
  :global(.gh-calendar-wrapper rect) {
    cursor: pointer;
    rx: 3;
    ry: 3;
  }
  @media (max-width: 640px) {
    :global(.gh-calendar-wrapper svg) {
      transform: scale(0.95);
      transform-origin: left top;
    }
  }
</style>
