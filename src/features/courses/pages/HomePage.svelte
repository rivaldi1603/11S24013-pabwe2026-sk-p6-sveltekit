<script lang="ts">
  import { onMount } from "svelte";
  import { Plus, Search, Trash2, BookOpen } from "lucide-svelte";
  import {
    courses,
    asyncSetCourses,
    asyncDeleteCourse,
    asyncDeleteAllCourses,
  } from "../states/coursesStore";
  import { profile } from "../../users/states/usersStore";
  import { showConfirmDialog } from "../../../helpers/toolsHelper";
  import AddModal from "../modals/AddModal.svelte";

  let search = $state("");
  let onlyMine = $state(false);
  let showAddModal = $state(false);

  let filteredCourses = $derived(
    $courses.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchMine = !onlyMine || ($profile ? c.user_id === $profile.id : false);
      return matchSearch && matchMine;
    })
  );

  function isCourseOwner(userId: number): boolean {
    return Boolean($profile && userId === $profile.id);
  }

  onMount(() => {
    asyncSetCourses();
  });

  async function handleFilterMineChange() {
    await asyncSetCourses(onlyMine);
  }

  async function handleDeleteCourse(id: number) {
    const confirmed = await showConfirmDialog("Hapus kursus ini?");
    if (confirmed) {
      const ok = await asyncDeleteCourse(id);
      if (ok) await asyncSetCourses(onlyMine);
    }
  }

  async function handleDeleteAll() {
    const confirmed = await showConfirmDialog("Hapus semua kursus milik Anda?");
    if (confirmed) {
      const ok = await asyncDeleteAllCourses();
      if (ok) await asyncSetCourses(onlyMine);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Semua Kursus</h1>
      <p class="text-sm text-slate-500">Jelajahi dan kelola daftar kursus pembelajaran</p>
    </div>

    <div class="flex items-center gap-2">
      <button
        type="button"
        onclick={() => (showAddModal = true)}
        data-testid="open-add-modal"
        class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
      >
        <Plus class="w-4 h-4" />
        <span>Tambah Kursus</span>
      </button>

      <button
        type="button"
        onclick={handleDeleteAll}
        data-testid="delete-all-courses"
        class="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl"
      >
        <Trash2 class="w-4 h-4" />
        <span>Hapus Semua</span>
      </button>
    </div>
  </div>

  <div class="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
    <div class="relative w-full sm:w-80">
      <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
      <input
        type="text"
        bind:value={search}
        placeholder="Cari judul atau deskripsi kursus..."
        aria-label="Cari judul atau deskripsi kursus"
        data-testid="search-course"
        class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl"
      />
    </div>

    <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        bind:checked={onlyMine}
        onchange={handleFilterMineChange}
        data-testid="filter-mine"
        class="rounded border-slate-300 text-blue-600"
      />
      <span>Milik Saya</span>
    </label>
  </div>

  {#if filteredCourses.length === 0}
    <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2" data-testid="empty-courses">
      <BookOpen class="w-10 h-10 text-slate-400 mx-auto" />
      <p class="text-slate-600 font-semibold">Belum ada kursus yang tersedia</p>
    </div>
  {:else}
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="courses-grid">
      {#each filteredCourses as item (item.id)}
        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between">
          <div>
            {#if item.cover}
              <img src={item.cover} alt={item.title} class="w-full h-44 object-cover" />
            {/if}
            <div class="p-5 space-y-2">
              <h2 class="text-lg font-bold text-slate-900">{item.title}</h2>
              <p class="text-sm text-slate-600 line-clamp-2">{item.description}</p>
            </div>
          </div>

          <div class="px-5 pb-5 flex items-center justify-between gap-2">
            <a
              href={"/courses/" + item.id}
              data-testid={"view-course-" + item.id}
              class="text-sm font-semibold text-blue-600 hover:underline"
            >
              Lihat Detail
            </a>

            {#if isCourseOwner(item.user_id)}
              <button
                type="button"
                onclick={() => handleDeleteCourse(item.id)}
                aria-label={"Hapus kursus " + item.title}
                data-testid={"delete-course-" + item.id}
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<AddModal
  isOpen={showAddModal}
  onClose={() => (showAddModal = false)}
  onSuccess={() => asyncSetCourses(onlyMine)}
/>
