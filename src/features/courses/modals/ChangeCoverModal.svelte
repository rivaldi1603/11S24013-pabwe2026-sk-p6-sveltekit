<script lang="ts">
  import { asyncPostCourseCover } from "../states/coursesStore";

  let {
    isOpen = false,
    courseId = "",
    onClose = () => {},
    onSuccess = () => {},
  }: {
    isOpen?: boolean;
    courseId?: number | string;
    onClose?: () => void;
    onSuccess?: () => void;
  } = $props();

  let selectedFile = $state<File | null>(null);

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    selectedFile = target.files?.[0] || null;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!selectedFile || !courseId) return;
    const ok = await asyncPostCourseCover(courseId, selectedFile);
    if (ok) {
      selectedFile = null;
      onSuccess();
      onClose();
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    data-testid="change-cover-modal"
  >
    <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
      <h2 class="text-xl font-bold text-slate-900">Ubah Sampul Kursus</h2>
      <form onsubmit={handleSubmit} class="space-y-4" data-testid="change-cover-form">
        <div>
          <label for="cover-file" class="block text-sm font-medium text-slate-700 mb-1">Pilih Berkas Sampul</label>
          <input
            id="cover-file"
            type="file"
            accept="image/*"
            onchange={handleFileChange}
            data-testid="cover-input"
            class="w-full text-sm text-slate-600"
          />
        </div>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            onclick={onClose}
            data-testid="btn-cancel-cover"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={!selectedFile}
            data-testid="btn-submit-cover"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50"
          >
            Unggah
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
