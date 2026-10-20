<script lang="ts">
  import { FileQuestion } from "lucide-svelte";
</script>

<div class="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
  <div class="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-4">
    <FileQuestion class="w-12 h-12" />
  </div>
  <h1 class="text-3xl font-extrabold text-slate-900">404 - Halaman Tidak Ditemukan</h1>
  <p class="text-slate-500 mt-2 max-w-md">
    Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
  </p>
  <a
    href="/"
    class="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
  >
    Kembali ke Beranda
  </a>
</div>
