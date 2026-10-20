<script lang="ts">
  import { goto } from "$app/navigation";
  import { GraduationCap, LogOut, Menu } from "lucide-svelte";
  import { profile } from "../../users/states/usersStore";
  import { asyncUnsetIsAuthLogin } from "../../auth/states/authStore";

  let { onToggleSidebar = () => {} }: { onToggleSidebar?: () => void } = $props();

  function handleLogout() {
    asyncUnsetIsAuthLogin();
    goto("/auth/login");
  }
</script>

<header class="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between">
  <div class="flex items-center gap-3">
    <button
      type="button"
      onclick={onToggleSidebar}
      data-testid="toggle-sidebar"
      class="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
    >
      <Menu class="w-5 h-5" />
    </button>
    <a href="/" class="flex items-center gap-2.5 text-blue-600 font-extrabold text-xl">
      <GraduationCap class="w-7 h-7" />
      <span>Delcom Courses</span>
    </a>
  </div>

  <div class="flex items-center gap-4">
    {#if $profile}
      <a href="/profile" class="text-sm font-semibold text-slate-700 hover:text-blue-600" data-testid="profile-link">
        {$profile.name}
      </a>
    {/if}
    <button
      type="button"
      onclick={handleLogout}
      data-testid="logout-button"
      class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
    >
      <LogOut class="w-4 h-4" />
      <span>Keluar</span>
    </button>
  </div>
</header>
