<script lang="ts">
  import { onMount } from "svelte";
  import { Users, Search } from "lucide-svelte";
  import { users, asyncSetUsers } from "../states/usersStore";
  import { formatDate } from "../../../helpers/toolsHelper";

  let search = $state("");

  let filteredUsers = $derived(
    $users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )
  );

  onMount(() => {
    asyncSetUsers();
  });
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
        <Users class="w-6 h-6" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Daftar Pengguna</h1>
        <p class="text-sm text-slate-500">Direktori seluruh pengguna terdaftar</p>
      </div>
    </div>

    <div class="relative w-full sm:w-72">
      <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
      <input
        type="text"
        bind:value={search}
        placeholder="Cari pengguna..."
        aria-label="Cari pengguna"
        data-testid="search-users-input"
        class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl bg-white"
      />
    </div>
  </div>

  {#if filteredUsers.length === 0}
    <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500" data-testid="empty-users">
      Tidak ada pengguna ditemukan.
    </div>
  {:else}
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="users-list">
      {#each filteredUsers as user (user.id)}
        <div class="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
            {#if user.photo}
              <img src={user.photo} alt={user.name} class="w-full h-full object-cover" />
            {:else}
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            {/if}
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="font-semibold text-slate-900 truncate">{user.name}</h2>
            <p class="text-sm text-slate-500 truncate">{user.email}</p>
            <p class="text-xs text-slate-600 mt-1">Bergabung: {formatDate(user.created_at)}</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
