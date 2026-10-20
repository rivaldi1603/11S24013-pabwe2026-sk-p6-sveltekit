<script lang="ts">
  import { onMount } from "svelte";
  import { Video, CheckCircle } from "lucide-svelte";
  import {
    courseContent,
    asyncSetCourseContent,
    asyncPostCourseContentStatus,
  } from "../states/coursesStore";

  let {
    courseId = "",
    contentId = "",
  }: {
    courseId?: string;
    contentId?: string;
  } = $props();

  function getYoutubeEmbedUrl(url?: string): string {
    if (!url) return "";
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/
    );
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  }

  let isFinished = $derived(Boolean($courseContent?.my_status_finished));
  let embedUrl = $derived(getYoutubeEmbedUrl($courseContent?.youtube || ""));
  let backUrl = $derived("/courses/" + courseId);

  onMount(() => {
    if (contentId) {
      asyncSetCourseContent(contentId);
    }
  });

  async function handleToggleStatus() {
    const nextStatus: 0 | 1 = isFinished ? 0 : 1;
    const ok = await asyncPostCourseContentStatus(contentId, nextStatus);
    if (ok) {
      await asyncSetCourseContent(contentId);
    }
  }
</script>

{#if !$courseContent}
  <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500" data-testid="loading-content">
    Memuat materi pembelajaran...
  </div>
{:else}
  <div class="space-y-6 max-w-4xl">
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
          <Video class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900" data-testid="content-title">{$courseContent.title}</h1>
          <a href={backUrl} class="text-sm text-blue-600 hover:underline" data-testid="back-to-course">
            ← Kembali ke Detail Kursus
          </a>
        </div>
      </div>

      <button
        type="button"
        onclick={handleToggleStatus}
        data-testid="toggle-status-btn"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition {isFinished
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-blue-600 text-white hover:bg-blue-700'}"
      >
        <CheckCircle class="w-4 h-4" />
        <span>{isFinished ? "Selesai Dipelajari" : "Tandai Selesai"}</span>
      </button>
    </div>

    <div class="bg-black rounded-2xl overflow-hidden aspect-video">
      <iframe
        title={$courseContent.title}
        src={embedUrl}
        class="w-full h-full"
        allowfullscreen
        data-testid="youtube-iframe"
      ></iframe>
    </div>
  </div>
{/if}
