<script lang="ts">
  import { page } from "$app/state";
  import { BookOpen, Users, User } from "lucide-svelte";

  let { isOpen = false, onClose = () => {} }: { isOpen?: boolean; onClose?: () => void } = $props();

  let pathname = $derived(page.url.pathname);

  const menus = [
    { href: "/", label: "Semua Kursus", icon: BookOpen, testId: "sidebar-link-home" },
    { href: "/users", label: "Pengguna", icon: Users, testId: "sidebar-link-users" },
    { href: "/profile", label: "Profil", icon: User, testId: "sidebar-link-profile" },
  ];

  function isMenuActive(href: string, currentPath: string): boolean {
    if (href === "/") {
      return currentPath === "/" || currentPath.startsWith("/courses");
    }
    return currentPath.startsWith(href);
  }
</script>

<aside
  data-testid="sidebar"
  class="w-64 bg-white border-r border-slate-200 shrink-0 {isOpen ? 'block' : 'hidden'} lg:block"
>
  <nav class="p-4 space-y-1">
    {#each menus as item (item.href)}
      {@const Icon = item.icon}
      {@const active = isMenuActive(item.href, pathname)}
      <a
        href={item.href}
        onclick={onClose}
        data-testid={item.testId}
        class="flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition {active
          ? 'bg-blue-600 text-white'
          : 'text-slate-600 hover:bg-slate-100'}"
      >
        <Icon class="w-5 h-5" />
        <span>{item.label}</span>
      </a>
    {/each}
  </nav>
</aside>
