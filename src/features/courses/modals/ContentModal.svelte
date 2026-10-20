<script lang="ts">
  import {
    asyncPostCourseContent,
    asyncPutCourseContent,
    type CourseContentItem,
  } from "../states/coursesStore";

  let {
    isOpen = false,
    courseId = "",
    contentData = null,
    onClose = () => {},
    onSuccess = () => {},
  }: {
    isOpen?: boolean;
    courseId?: number | string;
    contentData?: CourseContentItem | null;
    onClose?: () => void;
    onSuccess?: () => void;
  } = $props();

  let title = $state("");
  let youtube = $state("");

  $effect(() => {
    if (contentData) {
      title = contentData.title || "";
      youtube = contentData.youtube || "";
    } else {
      title = "";
      youtube = "";
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    const ok = contentData
      ? await asyncPutCourseContent(contentData.id, title, youtube)
      : await asyncPostCourseContent(courseId, title, youtube);

    if (ok) {
      title = "";
      youtube = "";
      onSuccess();
      onClose();
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    data-testid="content-modal"
  >
    <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
      <h2 class="text-xl font-bold text-slate-900" data-testid="content-modal-title">
        {contentData ? "Ubah Materi" : "Tambah Materi"}
      </h2>
      <form onsubmit={handleSubmit} class="space-y-4" data-testid="content-form">
        <div>
          <label for="content-title" class="block text-sm font-medium text-slate-700 mb-1">Judul Materi</label>
          <input
            id="content-title"
            type="text"
            required
            bind:value={title}
            placeholder="Pengenalan Svelte 5"
            data-testid="content-title-input"
            class="w-full px-4 py-2 border border-slate-300 rounded-xl"
          />
        </div>
        <div>
          <label for="content-youtube" class="block text-sm font-medium text-slate-700 mb-1">Tautan YouTube</label>
          <input
            id="content-youtube"
            type="url"
            required
            bind:value={youtube}
            placeholder="https://www.youtube.com/watch?v=..."
            data-testid="content-youtube-input"
            class="w-full px-4 py-2 border border-slate-300 rounded-xl"
          />
        </div>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            onclick={onClose}
            data-testid="btn-cancel-content"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="btn-submit-content"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
          >
            Simpan Materi
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
