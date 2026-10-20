<script lang="ts">
  import { GraduationCap } from "lucide-svelte";
  import AuthSessionRedirect from "../components/AuthSessionRedirect.svelte";

  let { children } = $props();
</script>

<AuthSessionRedirect />

<div class="min-h-screen grid lg:grid-cols-2 bg-slate-50">
  <div class="hidden lg:flex flex-col justify-between bg-blue-600 text-white p-12">
    <div class="flex items-center gap-3">
      <div class="p-2.5 bg-white/15 rounded-xl">
        <GraduationCap class="w-8 h-8" />
      </div>
      <span class="text-2xl font-bold tracking-tight">Delcom Courses</span>
    </div>

    <div class="space-y-4 max-w-md">
      <h1 class="text-4xl font-extrabold leading-tight">
        Platform Manajemen Kursus & Pembelajaran Interaktif
      </h1>
      <p class="text-blue-100 text-lg">
        Kelola kursus, materi video pembelajaran, peserta, dan rating dalam satu ekosistem pembelajaran terpadu.
      </p>
    </div>

    <p class="text-sm text-blue-200">© 2026 Delcom Courses. All rights reserved.</p>
  </div>

  <div class="flex items-center justify-center p-6 sm:p-12">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div class="flex lg:hidden items-center gap-2 mb-6 text-blue-600">
        <GraduationCap class="w-7 h-7" />
        <span class="text-xl font-bold">Delcom Courses</span>
      </div>
      {@render children?.()}
    </div>
  </div>
</div>
