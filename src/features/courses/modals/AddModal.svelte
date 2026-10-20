<script lang="ts">
  import { asyncPostCourse } from "../states/coursesStore";

  let {
    isOpen = false,
    onClose = () => {},
    onSuccess = () => {},
  }: {
    isOpen?: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
  } = $props();

  let title = $state("");
  let description = $state("");

  async function handleSubmit(e: Event) {
    e.preventDefault();
    const ok = await asyncPostCourse(title, description);
    if (ok) {
      title = "";
      description = "";
      onSuccess();
      onClose();
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    data-testid="add-course-modal"
  >
    <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
      <h2 class="text-xl font-bold text-slate-900">Tambah Kursus Baru</h2>
      <form onsubmit={handleSubmit} class="space-y-4" data-testid="add-course-form">
        <div>
          <label for="add-course-title" class="block text-sm font-medium text-slate-700 mb-1">Judul Kursus</label>
          <input
            id="add-course-title"
            type="text"
            required
            bind:value={title}
            placeholder="Contoh: Pemrograman Web SvelteKit"
            data-testid="add-course-title-input"
            class="w-full px-4 py-2 border border-slate-300 rounded-xl"
          />
        </div>
        <div>
          <label for="add-course-desc" class="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
          <textarea
            id="add-course-desc"
            rows="3"
            required
            bind:value={description}
            placeholder="Deskripsi singkat kursus..."
            data-testid="add-course-desc-input"
            class="w-full px-4 py-2 border border-slate-300 rounded-xl"
          ></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            onclick={onClose}
            data-testid="btn-cancel-add-course"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="btn-submit-add-course"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
