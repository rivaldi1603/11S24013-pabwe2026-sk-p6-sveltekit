<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {
    Edit,
    Image,
    Plus,
    Trash2,
    Star,
    UserPlus,
    UserMinus,
    Video,
  } from "lucide-svelte";
  import {
    course,
    asyncSetCourse,
    asyncDeleteCourse,
    asyncPostStudentJoin,
    asyncDeleteStudentLeave,
    asyncPutStudentRatings,
    asyncDeleteCourseContent,
    type CourseContentItem,
  } from "../states/coursesStore";
  import { profile } from "../../users/states/usersStore";
  import { showConfirmDialog } from "../../../helpers/toolsHelper";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ContentModal from "../modals/ContentModal.svelte";

  let { courseId = "" }: { courseId?: string } = $props();

  let showEditModal = $state(false);
  let showCoverModal = $state(false);
  let showContentModal = $state(false);
  let editingContent = $state<CourseContentItem | null>(null);

  let ratingScore = $state(5);
  let ratingComment = $state("");

  // Pemilik kursus adalah pengguna yang user_id-nya sama dengan id profil
  let isOwner = $derived(Boolean($profile && $course && $course.user_id === $profile.id));

  // Peserta adalah pengguna yang id-nya ada di students
  let isStudent = $derived(
    Boolean(
      $profile &&
        $course &&
        Array.isArray($course.students) &&
        $course.students.some((s) =>
          typeof s === "number"
            ? s === $profile!.id
            : s.user_id === $profile!.id || s.id === $profile!.id
        )
    )
  );

  let contentsList = $derived($course?.contents || $course?.my_Contents || []);

  onMount(() => {
    if (courseId) asyncSetCourse(courseId);
  });

  async function handleJoin() {
    const ok = await asyncPostStudentJoin(courseId);
    if (ok) await asyncSetCourse(courseId);
  }

  async function handleLeave() {
    const ok = await asyncDeleteStudentLeave(courseId);
    if (ok) await asyncSetCourse(courseId);
  }

  async function handleSubmitRating(e: Event) {
    e.preventDefault();
    const ok = await asyncPutStudentRatings(courseId, Number(ratingScore), ratingComment);
    if (ok) await asyncSetCourse(courseId);
  }

  async function handleDeleteCourse() {
    const confirmed = await showConfirmDialog("Yakin ingin menghapus kursus ini?");
    if (confirmed) {
      const ok = await asyncDeleteCourse(courseId);
      if (ok) goto("/");
    }
  }

  function openAddContent() {
    editingContent = null;
    showContentModal = true;
  }

  function openEditContent(item: CourseContentItem) {
    editingContent = item;
    showContentModal = true;
  }

  async function handleDeleteContent(contentId: number) {
    const confirmed = await showConfirmDialog("Hapus materi ini?");
    if (confirmed) {
      const ok = await asyncDeleteCourseContent(contentId);
      if (ok) await asyncSetCourse(courseId);
    }
  }
</script>

{#if !$course}
  <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500" data-testid="loading-course">
    Memuat detail kursus...
  </div>
{:else}
  <div class="space-y-6">
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {#if $course.cover}
        <img
          src={$course.cover}
          alt={$course.title}
          data-testid="course-cover-img"
          class="w-full h-64 object-cover"
        />
      {/if}
      <div class="p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900" data-testid="course-title">{$course.title}</h1>
            <p class="text-slate-600 mt-1" data-testid="course-description">{$course.description}</p>
          </div>

          {#if isOwner}
            <!-- Antarmuka pemilik ditampilkan lebih dulu bila keduanya terpenuhi -->
            <div class="flex flex-wrap items-center gap-2" data-testid="owner-actions">
              <button
                type="button"
                onclick={() => (showCoverModal = true)}
                data-testid="btn-change-cover"
                class="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold"
              >
                <Image class="w-4 h-4" />
                <span>Sampul</span>
              </button>

              <button
                type="button"
                onclick={() => (showEditModal = true)}
                data-testid="btn-edit-course"
                class="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-sm font-semibold"
              >
                <Edit class="w-4 h-4" />
                <span>Ubah Data</span>
              </button>

              <button
                type="button"
                onclick={handleDeleteCourse}
                data-testid="btn-delete-course"
                class="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold"
              >
                <Trash2 class="w-4 h-4" />
                <span>Hapus</span>
              </button>
            </div>
          {:else if isStudent}
            <div class="flex items-center gap-2" data-testid="student-actions">
              <button
                type="button"
                onclick={handleLeave}
                data-testid="btn-leave-course"
                class="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold"
              >
                <UserMinus class="w-4 h-4" />
                <span>Keluar Kursus</span>
              </button>
            </div>
          {:else}
            <div class="flex items-center gap-2" data-testid="guest-actions">
              <button
                type="button"
                onclick={handleJoin}
                data-testid="btn-join-course"
                class="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold"
              >
                <UserPlus class="w-4 h-4" />
                <span>Daftar Kursus</span>
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>

    {#if !isOwner && isStudent}
      <div class="bg-white rounded-2xl border border-slate-200 p-6 space-y-4" data-testid="rating-section">
        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Star class="w-5 h-5 text-amber-500" />
          Berikan Rating Kursus (1 - 5)
        </h2>
        <form onsubmit={handleSubmitRating} class="space-y-4" data-testid="rating-form">
          <div>
            <label for="rating-select" class="block text-sm font-medium text-slate-700 mb-1">Skala Rating</label>
            <select
              id="rating-select"
              bind:value={ratingScore}
              data-testid="rating-select"
              class="w-full sm:w-48 px-4 py-2 border border-slate-300 rounded-xl"
            >
              <option value={1}>1 - Sangat Kurang</option>
              <option value={2}>2 - Kurang</option>
              <option value={3}>3 - Cukup</option>
              <option value={4}>4 - Baik</option>
              <option value={5}>5 - Sangat Baik</option>
            </select>
          </div>
          <div>
            <label for="rating-comment" class="block text-sm font-medium text-slate-700 mb-1">Ulasan</label>
            <textarea
              id="rating-comment"
              rows="2"
              bind:value={ratingComment}
              placeholder="Tulis komentar ulasan Anda..."
              data-testid="rating-comment-input"
              class="w-full px-4 py-2 border border-slate-300 rounded-xl"
            ></textarea>
          </div>
          <button
            type="submit"
            data-testid="btn-submit-rating"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
          >
            Kirim Rating
          </button>
        </form>
      </div>
    {/if}

    <div class="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Video class="w-5 h-5 text-blue-600" />
          Daftar Konten Materi
        </h2>
        {#if isOwner}
          <button
            type="button"
            onclick={openAddContent}
            data-testid="btn-add-content"
            class="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold"
          >
            <Plus class="w-4 h-4" />
            <span>Tambah Materi</span>
          </button>
        {/if}
      </div>

      {#if contentsList.length === 0}
        <p class="text-sm text-slate-500" data-testid="empty-contents">Belum ada materi pada kursus ini.</p>
      {:else}
        <div class="space-y-3" data-testid="contents-list">
          {#each contentsList as item (item.id)}
            <div class="flex items-center justify-between p-4 rounded-xl border border-slate-200">
              <div class="flex items-center gap-3">
                <Video class="w-5 h-5 text-blue-600 shrink-0" />
                <a
                  href={"/courses/" + courseId + "/contents/" + item.id}
                  data-testid={"content-link-" + item.id}
                  class="font-semibold text-slate-900 hover:text-blue-600"
                >
                  {item.title}
                </a>
              </div>

              {#if isOwner}
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    onclick={() => openEditContent(item)}
                    aria-label={"Ubah materi " + item.title}
                    data-testid={"edit-content-" + item.id}
                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onclick={() => handleDeleteContent(item.id)}
                    aria-label={"Hapus materi " + item.title}
                    data-testid={"delete-content-" + item.id}
                    class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <ChangeModal
    isOpen={showEditModal}
    courseData={$course}
    onClose={() => (showEditModal = false)}
    onSuccess={() => asyncSetCourse(courseId)}
  />

  <ChangeCoverModal
    isOpen={showCoverModal}
    courseId={courseId}
    onClose={() => (showCoverModal = false)}
    onSuccess={() => asyncSetCourse(courseId)}
  />

  <ContentModal
    isOpen={showContentModal}
    courseId={courseId}
    contentData={editingContent}
    onClose={() => (showContentModal = false)}
    onSuccess={() => asyncSetCourse(courseId)}
  />
{/if}
