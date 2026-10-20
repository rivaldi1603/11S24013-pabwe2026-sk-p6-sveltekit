import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/svelte";
import RootLayout from "./routes/+layout.svelte";
import RootPage from "./routes/+page.svelte";
import { courses } from "./features/courses/states/coursesStore";
import { users, profile } from "./features/users/states/usersStore";
import { isAuthLogin } from "./features/auth/states/authStore";

describe("App.test.ts - Integration Suite", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    isAuthLogin.set(false);
    profile.set(null);
    courses.set([]);
    users.set([]);
  });

  it("renders entire root application without crash", () => {
    const { container } = render(RootPage);
    expect(container).toBeInTheDocument();
  });

  it("renders application layout with logged-in user state", () => {
    localStorage.setItem("accessToken", "active-token");
    isAuthLogin.set(true);
    profile.set({ id: 1, name: "Mahasiswa Delcom", email: "delcom@itdel.ac.id" });

    const { container } = render(RootLayout, {
      props: {
        children: () => null,
      },
    });
    expect(container).toBeInTheDocument();
  });
});
