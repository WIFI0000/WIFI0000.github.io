<script lang="ts">
  import { onMount } from "svelte";
  import { calendarConfig } from "../config";

  export let username: string = calendarConfig.username;
  export let cardTitle: string = calendarConfig.cardTitle;
  export let palette: string[] = calendarConfig.palette ?? ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

  let container: HTMLDivElement | null = null;
  let scrollWrap: HTMLDivElement | null = null;
  let tooltipText = "";
  let tooltipVisible = false;
  let tooltipStyle = { left: "0px", top: "0px" };
  let monthLabels: { label: string; col: number }[] = [];
  let weeksCount = 0;
  let totalContributions = 0;

  function colorForCount(count: number, max: number, paletteLocal: string[]) {
    if (count <= 0) return paletteLocal[0];
    const step = Math.max(1, Math.ceil(max / (paletteLocal.length - 1)));
    const idx = Math.min(paletteLocal.length - 1, Math.ceil(count / step));
    return paletteLocal[idx];
  }

  type ContributionDay = { date: string; count: number };

  function parseContributions(raw: unknown): ContributionDay[] {
    if (!raw || typeof raw !== "object") return [];
    const data = raw as { contributions?: unknown };
    const list = data.contributions;
    if (!Array.isArray(list)) return [];

    const normalized: ContributionDay[] = [];
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const it = item as { date?: unknown; count?: unknown };
      if (typeof it.date === "string" && typeof it.count === "number") {
        normalized.push({ date: it.date, count: it.count });
      }
    }
    return normalized;
  }

  function buildCalendarGrid(
    contribs: ContributionDay[],
    paletteLocal: string[],
    rangeStart: Date,
    rangeEnd: Date,
  ) {
    if (!container) return;
    container.innerHTML = "";

    if (!contribs.length) {
      container.innerHTML = `<div class="text-sm text-red-500">無法載入 GitHub Calendar</div>`;
      return;
    }

    const byDate = new Map<string, number>();
    contribs.forEach((c) => byDate.set(c.date, c.count));

    const sortedDates = contribs
      .map((c) => c.date)
      .sort((a, b) => new Date(`${a}T00:00:00Z`).getTime() - new Date(`${b}T00:00:00Z`).getTime());
    const first = new Date(`${sortedDates[0]}T00:00:00Z`);
    const last = new Date(`${sortedDates[sortedDates.length - 1]}T00:00:00Z`);

    const start = new Date(first);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());

    const end = new Date(last);
    end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));

    const days: ContributionDay[] = [];
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      days.push({ date: dateStr, count: byDate.get(dateStr) ?? 0 });
    }

    const max = days.length ? Math.max(...days.map((d) => d.count)) : 0;
    const weeks = Math.ceil(days.length / 7);
    weeksCount = weeks;

    const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    for (let i = 0; i < days.length; i += 1) {
      const dt = new Date(`${days[i].date}T00:00:00Z`);
      if (dt < rangeStart || dt > rangeEnd) continue;
      const month = dt.getUTCMonth();
      if (month !== lastMonth) {
        const col = Math.floor(i / 7) + 1;
        labels.push({ label: shortMonths[month], col });
        lastMonth = month;
      }
    }
    monthLabels = labels;
    totalContributions = contribs.reduce((sum, c) => sum + c.count, 0);

    const wrapper = document.createElement("div");
    wrapper.className = "gh-calendar-wrapper";

    const grid = document.createElement("div");
    grid.className = "gh-calendar-grid";
    grid.style.setProperty("--weeks", String(weeks));

    days.forEach((day) => {
      const dayDate = new Date(`${day.date}T00:00:00Z`);
      const inRange = dayDate >= rangeStart && dayDate <= rangeEnd;
      const cell = document.createElement("div");
      const fill = inRange ? colorForCount(day.count, max, paletteLocal) : paletteLocal[0];
      cell.className = "gh-day";
      cell.style.backgroundColor = fill;
      cell.setAttribute("data-count", String(day.count));
      cell.setAttribute("data-date", inRange ? day.date : "");
      cell.setAttribute("aria-label", `${day.count} contributions on ${day.date}`);
      if (!inRange) cell.classList.add("is-pad");

      cell.addEventListener("mouseenter", (ev) => {
        if (!inRange) return;
        tooltipText = `${day.count} contribution${day.count === 1 ? "" : "s"} • ${day.date}`;
        tooltipVisible = true;
        const rectB = (ev.target as Element).getBoundingClientRect();
        const containerB = container!.getBoundingClientRect();
        tooltipStyle = {
          left: `${rectB.left - containerB.left + rectB.width / 2}px`,
          top: `${rectB.top - containerB.top - 8}px`,
        };
      });
      cell.addEventListener("mouseleave", () => {
        tooltipVisible = false;
      });

      grid.appendChild(cell);
    });

    wrapper.appendChild(grid);
    container.appendChild(wrapper);
  }

  onMount(async () => {
    if (!container) return;
    try {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      const contribs = parseContributions(data);
      if (!contribs.length) throw new Error("No contributions data");
      const lastDateStr = contribs
        .map((c) => c.date)
        .sort((a, b) => new Date(`${a}T00:00:00Z`).getTime() - new Date(`${b}T00:00:00Z`).getTime())
        .at(-1)!;
      const lastDate = new Date(`${lastDateStr}T00:00:00Z`);
      const startDate = new Date(Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), 1));
      startDate.setUTCMonth(startDate.getUTCMonth() - 11);
      const filtered = contribs.filter((c) => {
        const d = new Date(`${c.date}T00:00:00Z`);
        return d >= startDate && d <= lastDate;
      });
      buildCalendarGrid(filtered, palette, startDate, lastDate);
      if (scrollWrap) {
        requestAnimationFrame(() => {
          scrollWrap!.scrollLeft = scrollWrap!.scrollWidth;
        });
      }
    } catch (e) {
      console.error(e);
      if (container) container.innerHTML = `<div class="text-sm text-red-500">無法載入 GitHub Calendar</div>`;
    }
  });
</script>

<div class="p-4 rounded-lg shadow-sm bg-[--card-bg] max-w-full gh-calendar-root">
  <div class="flex items-center justify-between mb-2 gh-calendar-text">
    <h3 class="text-sm font-semibold">{cardTitle}</h3>
    <a class="text-xs text-muted" href={"https://github.com/" + username} target="_blank" rel="noreferrer">@{username}</a>
  </div>

  <div class="relative overflow-hidden">
    <div class="w-full overflow-x-auto" bind:this={scrollWrap}>
      {#if weeksCount > 0}
        <div class="gh-month-row" style="--weeks: {weeksCount};">
          {#each monthLabels as m}
            <div class="gh-month" style="grid-column: {m.col} / span 4;">{m.label}</div>
          {/each}
        </div>
      {/if}
      <div bind:this={container}></div>
    </div>

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

  <div class="mt-3 flex items-center justify-between text-xs gh-calendar-text">
    <div>{totalContributions} contributions in the last year</div>
    <div class="flex items-center gap-2">
      <span>Less</span>
      <div class="gh-legend">
        {#each palette as p}
          <span class="gh-legend-cell" style="background-color: {p};"></span>
        {/each}
      </div>
      <span>More</span>
    </div>
  </div>
</div>

<style>
  :global(.gh-calendar-root) {
    --cell: 16px;
    --gap: 4px;
  }
  :global(.gh-calendar-wrapper) {
    max-width: 100%;
  }
  :global(.gh-month-row) {
    display: grid;
    grid-template-columns: repeat(var(--weeks), var(--cell));
    gap: var(--gap);
    margin-bottom: 8px;
    width: max-content;
    color: var(--calendar-month-text);
    font-family: "Ubuntu Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    font-size: 1.05rem;
    line-height: 1.2;
  }
  :global(.gh-calendar-text) {
    color: var(--calendar-month-text);
    font-family: "Ubuntu Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    font-size: 0.9rem;
  }
  :global(.gh-month) {
    grid-row: 1;
    white-space: nowrap;
    justify-self: start;
    padding-right: 6px;
    transform: translateY(1px);
  }
  :global(.gh-calendar-grid) {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(7, var(--cell));
    grid-auto-columns: var(--cell);
    grid-template-columns: repeat(var(--weeks), var(--cell));
    gap: var(--gap);
    align-content: start;
    width: max-content;
  }
  :global(.gh-day) {
    width: var(--cell);
    height: var(--cell);
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 160ms ease;
  }
  :global(.gh-legend) {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }
  :global(.gh-legend-cell) {
    width: var(--cell);
    height: var(--cell);
    border-radius: 3px;
    display: inline-block;
    box-sizing: border-box;
  }
  @media (max-width: 640px) {
    :global(.gh-month-row) {
      transform: scale(0.95);
      transform-origin: left top;
    }
    :global(.gh-calendar-grid) {
      transform: scale(0.95);
      transform-origin: left top;
    }
  }
</style>
