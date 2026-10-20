<script lang="ts">
  import { asyncPutCourse, type CourseItem } from "../states/coursesStore";

  let {
    isOpen = false,
    courseData = null,
    onClose = () => {},
    onSuccess = () => {},
  }: {
    isOpen?: boolean;
    courseData?: CourseItem | null;
    onClose?: () => void;
    onSuccess?: () => void;
  } = $props();

  let title = $state("");
  let description = $state("");

  $effect(() => {
    if (courseData) {
      title = courseData.title || "";
      description = courseData.description || "";
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    const ok = await asyncPutCourse(courseData!.id, title, description);
    if (ok) {
      onSuccess();
      onClose();
    }
  }
</script>

{#if isOpen && courseData}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    data-testid="change-course-modal"
  >
    <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
      <h2 class="text-xl font-bold text-slate-900">Ubah Data Kursus</h2>
      <form onsubmit={handleSubmit} class="space-y-4" data-testid="change-course-form">
        <div>
          <label for="edit-course-title" class="block text-sm font-medium text-slate-700 mb-1">Judul Kursus</label>
          <input
            id="edit-course-title"
            type="text"
            required
            bind:value={title}
            data-testid="edit-course-title-input"
            class="w-full px-4 py-2 border border-slate-300 rounded-xl"
          />
        </div>
        <div>
          <label for="edit-course-desc" class="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
          <textarea
            id="edit-course-desc"
            rows="3"
            required
            bind:value={description}
            data-testid="edit-course-desc-input"
            class="w-full px-4 py-2 border border-slate-300 rounded-xl"
          ></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            onclick={onClose}
            data-testid="btn-cancel-edit-course"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="btn-submit-edit-course"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
          >
            Perbarui
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
