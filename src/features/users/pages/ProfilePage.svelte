<script lang="ts">
  import { onMount } from "svelte";
  import { User, Camera, Lock } from "lucide-svelte";
  import {
    profile,
    asyncSetProfile,
    asyncPutProfile,
    asyncPostProfilePhoto,
    asyncPutProfilePassword,
  } from "../states/usersStore";

  let name = $state("");
  let email = $state("");
  let currentPassword = $state("");
  let newPassword = $state("");
  let selectedPhoto = $state<File | null>(null);

  onMount(async () => {
    const user = await asyncSetProfile();
    if (user) {
      name = user.name;
      email = user.email;
    }
  });

  async function handleUpdateProfile(e: Event) {
    e.preventDefault();
    await asyncPutProfile(name, email);
  }

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    selectedPhoto = target.files?.[0] || null;
  }

  async function handleUploadPhoto(e: Event) {
    e.preventDefault();
    if (selectedPhoto) {
      await asyncPostProfilePhoto(selectedPhoto);
      selectedPhoto = null;
    }
  }

  async function handleUpdatePassword(e: Event) {
    e.preventDefault();
    const ok = await asyncPutProfilePassword(currentPassword, newPassword);
    if (ok) {
      currentPassword = "";
      newPassword = "";
    }
  }
</script>

<div class="space-y-6 max-w-4xl">
  <div class="flex items-center gap-3">
    <div class="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
      <User class="w-6 h-6" />
    </div>
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Profil Saya</h1>
      <p class="text-sm text-slate-500">Kelola informasi akun, foto profil, dan kata sandi</p>
    </div>
  </div>

  <div class="grid md:grid-cols-2 gap-6">
    <div class="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
      <h2 class="text-lg font-bold text-slate-900">Informasi Pribadi</h2>
      <form onsubmit={handleUpdateProfile} class="space-y-4" data-testid="profile-form">
        <div>
          <label for="profile-name" class="block text-sm font-medium text-slate-700 mb-1">Nama</label>
          <input
            id="profile-name"
            type="text"
            required
            bind:value={name}
            data-testid="profile-name-input"
            class="w-full px-4 py-2 border border-slate-300 rounded-xl"
          />
        </div>

        <div>
          <label for="profile-email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            id="profile-email"
            type="email"
            required
            bind:value={email}
            data-testid="profile-email-input"
            class="w-full px-4 py-2 border border-slate-300 rounded-xl"
          />
        </div>

        <button
          type="submit"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
        >
          Simpan Profil
        </button>
      </form>
    </div>

    <div class="space-y-6">
      <div class="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Camera class="w-5 h-5 text-blue-600" />
          Foto Profil
        </h2>
        {#if $profile?.photo}
          <img
            src={$profile.photo}
            alt={$profile.name}
            data-testid="profile-photo-img"
            class="w-20 h-20 rounded-full object-cover"
          />
        {/if}
        <form onsubmit={handleUploadPhoto} class="space-y-3" data-testid="photo-form">
          <div>
            <label for="photo-input" class="block text-sm font-medium text-slate-700 mb-1">Pilih Berkas Foto</label>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              onchange={handleFileChange}
              aria-label="Pilih berkas foto profil"
              data-testid="photo-input"
              class="block w-full text-sm text-slate-600"
            />
          </div>
          <button
            type="submit"
            disabled={!selectedPhoto}
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50"
          >
            Unggah Foto
          </button>
        </form>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Lock class="w-5 h-5 text-blue-600" />
          Ubah Kata Sandi
        </h2>
        <form onsubmit={handleUpdatePassword} class="space-y-3" data-testid="password-form">
          <div>
            <label for="old-password" class="block text-sm font-medium text-slate-700 mb-1">Kata Sandi Lama</label>
            <input
              id="old-password"
              type="password"
              required
              bind:value={currentPassword}
              data-testid="current-password-input"
              class="w-full px-4 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label for="new-password" class="block text-sm font-medium text-slate-700 mb-1">Kata Sandi Baru</label>
            <input
              id="new-password"
              type="password"
              required
              bind:value={newPassword}
              data-testid="new-password-input"
              class="w-full px-4 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
          >
            Perbarui Kata Sandi
          </button>
        </form>
      </div>
    </div>
  </div>
</div>
