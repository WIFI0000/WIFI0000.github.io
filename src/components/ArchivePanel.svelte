
<script lang="ts">
import { onMount } from "svelte";
import { calendarConfig } from "../config";
import GithubCalendar from "./GithubCalendar.svelte";

import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getPostUrlBySlug } from "../utils/url-utils";

export let tags: string[] = [];
export let categories: string[] = [];
export let sortedPosts: Post[] = [];

// optional props to override config
export let calendarUsername: string = calendarConfig.username;
export let calendarCardTitle: string = calendarConfig.cardTitle;

let uncategorized: string | null = null;
if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    tags = params.has("tag") ? params.getAll("tag") : [];
    categories = params.has("category") ? params.getAll("category") : [];
    uncategorized = params.get("uncategorized");
}

interface Post {
    slug: string;
    data: {
        title: string;
        tags: string[];
        category?: string;
        published: Date;
    };
}

interface Group {
    year: number;
    posts: Post[];
}

let groups: Group[] = [];

function formatDate(date: Date) {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${month}-${day}`;
}

function formatTag(tagList: string[]) {
    return tagList.map((t) => `#${t}`).join(" ");
}

function colorForCount(count: number, max: number, palette: string[]) {
    if (count <= 0) return palette[0];
    const step = Math.max(1, Math.ceil(max / (palette.length - 1)));
    const idx = Math.min(palette.length - 1, Math.ceil(count / step));
    return palette[idx];
}

onMount(async () => {
    let filteredPosts: Post[] = sortedPosts;

    if (tags.length > 0) {
        filteredPosts = filteredPosts.filter(
            (post) =>
                Array.isArray(post.data.tags) && post.data.tags.some((tag) => tags.includes(tag)),
        );
    }

    if (categories.length > 0) {
        filteredPosts = filteredPosts.filter(
            (post) => post.data.category && categories.includes(post.data.category),
        );
    }

    if (uncategorized) {
        filteredPosts = filteredPosts.filter((post) => !post.data.category);
    }

    const grouped = filteredPosts.reduce(
        (acc, post) => {
            const year = post.data.published.getFullYear();
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(post);
            return acc;
        },
        {} as Record<number, Post[]>,
    );

    const groupedPostsArray = Object.keys(grouped).map((yearStr) => ({
        year: Number.parseInt(yearStr, 10),
        posts: grouped[Number.parseInt(yearStr, 10)],
    }));

    groupedPostsArray.sort((a, b) => b.year - a.year);

    groups = groupedPostsArray;

    // calendar handled by GithubCalendar component (client-only)
});
</script>

<div class="card-base px-8 py-6">
    <!-- calendar (use GithubCalendar component) -->
    {#if calendarConfig.enabled}
      <div class="mb-6">
        <GithubCalendar
          client:load
          username={calendarUsername}
          cardTitle={calendarCardTitle}
          palette={calendarConfig.palette}
        />
      </div>
    {/if}

    <!-- archive groups -->
    {#each groups as group}
        <div>
            <div class="flex flex-row w-full items-center h-[3.75rem]">
                <div class="w-[15%] md:w-[10%] transition text-2xl font-bold text-right text-75">
                    {group.year}
                </div>
                <div class="w-[15%] md:w-[10%]">
                    <div
                        class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto
                  -outline-offset-[2px] z-50 outline-3"
                    ></div>
                </div>
                <div class="w-[70%] md:w-[80%] transition text-left text-50">
                    {group.posts.length} {i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
                </div>
            </div>

            {#each group.posts as post}
                <a
                    href={getPostUrlBySlug(post.slug)}
                    aria-label={post.data.title}
                    class="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
                >
                    <div class="flex flex-row justify-start items-center h-full">
                        <!-- date -->
                        <div class="w-[15%] md:w-[10%] transition text-sm text-right text-50">
                            {formatDate(post.data.published)}
                        </div>

                        <!-- dot and line -->
                        <div class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center">
                            <div
                                class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                       bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
                       outline outline-4 z-50
                       outline-[var(--card-bg)]
                       group-hover:outline-[var(--btn-plain-bg-hover)]
                       group-active:outline-[var(--btn-plain-bg-active)]"
                            ></div>
                        </div>

                        <!-- post title -->
                        <div
                            class="w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold font-ubuntu-mono
                     group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                     text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden"
                        >
                            {post.data.title}
                        </div>

                        <!-- tag list -->
                        <div
                            class="hidden md:block md:w-[15%] text-left text-sm transition
                     whitespace-nowrap overflow-ellipsis overflow-hidden text-30"
                        >
                            {formatTag(post.data.tags)}
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    {/each}
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
