<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Navbar from "../components/Navbar.svelte";
  import Sidebar from "../components/Sidebar.svelte";
  import { getAccessToken } from "../../../helpers/apiHelper";
  import { asyncSetProfile } from "../../users/states/usersStore";
  import { setIsAuthLogin } from "../../auth/states/authStore";

  let { children } = $props();

  let sidebarOpen = $state(false);

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  function closeSidebar() {
    sidebarOpen = false;
  }

  onMount(async () => {
    const token = getAccessToken();
    if (!token) {
      goto("/auth/login");
      return;
    }
    const user = await asyncSetProfile();
    if (!user) {
      goto("/auth/login");
      return;
    }
    setIsAuthLogin(true);
  });
</script>

<div class="min-h-screen flex flex-col bg-slate-50">
  <Navbar onToggleSidebar={toggleSidebar} />
  <div class="flex flex-1">
    <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
    <main class="flex-1 p-6 max-w-7xl mx-auto w-full">
      {@render children?.()}
    </main>
  </div>
</div>
