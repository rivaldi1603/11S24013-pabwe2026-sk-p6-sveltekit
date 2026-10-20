import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import Navbar from "./features/courses/components/Navbar.svelte";
import Sidebar from "./features/courses/components/Sidebar.svelte";
import CourseLayout from "./features/courses/layouts/CourseLayout.svelte";
import { mockGoto, mockPage } from "./setupTests";
import { profile } from "./features/users/states/usersStore";
import * as authStore from "./features/auth/states/authStore";
import * as usersStore from "./features/users/states/usersStore";

describe("Navbar, Sidebar, and CourseLayout", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    profile.set(null);
    mockPage.url = new URL("http://localhost:3005/");
  });

  describe("Navbar.svelte", () => {
    it("renders branding and handles toggle sidebar and logout", async () => {
      const toggleMock = vi.fn();
      profile.set({ id: 1, name: "Student Delcom", email: "student@test.com" });

      const { getByTestId, getByText } = render(Navbar, {
        props: {
          onToggleSidebar: toggleMock,
        },
      });

      expect(getByText("Delcom Courses")).toBeInTheDocument();
      expect(getByTestId("profile-link")).toHaveTextContent("Student Delcom");

      await fireEvent.click(getByTestId("toggle-sidebar"));
      expect(toggleMock).toHaveBeenCalled();

      await fireEvent.click(getByTestId("logout-button"));
      expect(mockGoto).toHaveBeenCalledWith("/auth/login");
    });

    it("works with default onToggleSidebar", async () => {
      const { getByTestId } = render(Navbar);
      await fireEvent.click(getByTestId("toggle-sidebar"));
    });
  });

  describe("Sidebar.svelte", () => {
    it("renders menus and handles close callback on click for /users", async () => {
      mockPage.url = new URL("http://localhost:3005/users");
      const closeMock = vi.fn();

      const { getByTestId } = render(Sidebar, {
        props: {
          isOpen: true,
          onClose: closeMock,
        },
      });

      const aside = getByTestId("sidebar");
      expect(aside).toHaveClass("block");

      const usersLink = getByTestId("sidebar-link-users");
      expect(usersLink).toHaveClass("bg-blue-600");

      await fireEvent.click(usersLink);
      expect(closeMock).toHaveBeenCalled();
    });

    it("handles root / and courses active route and profile route", async () => {
      mockPage.url = new URL("http://localhost:3005/");
      const r1 = render(Sidebar);
      expect(r1.getByTestId("sidebar-link-home")).toHaveClass("bg-blue-600");
      await fireEvent.click(r1.getByTestId("sidebar-link-home"));
      await fireEvent.click(r1.getByTestId("sidebar-link-users"));
      await fireEvent.click(r1.getByTestId("sidebar-link-profile"));
      r1.unmount();

      mockPage.url = new URL("http://localhost:3005/courses/1");
      const r2 = render(Sidebar);
      expect(r2.getByTestId("sidebar-link-home")).toHaveClass("bg-blue-600");
      r2.unmount();

      mockPage.url = new URL("http://localhost:3005/profile");
      const r3 = render(Sidebar);
      expect(r3.getByTestId("sidebar-link-profile")).toHaveClass("bg-blue-600");
      r3.unmount();

      mockPage.url = new URL("http://localhost:3005/unknown-route");
      const r4 = render(Sidebar);
      expect(r4.getByTestId("sidebar-link-home")).not.toHaveClass("bg-blue-600");
      r4.unmount();
    });
  });

  describe("CourseLayout.svelte", () => {
    it("redirects to login if token is missing", async () => {
      render(CourseLayout);
      await tick();
      expect(mockGoto).toHaveBeenCalledWith("/auth/login");
    });

    it("redirects to login if token exists but profile returns null", async () => {
      localStorage.setItem("accessToken", "invalid-token");
      vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue(null);

      render(CourseLayout);
      await tick();
      expect(mockGoto).toHaveBeenCalledWith("/auth/login");
    });

    it("authenticates and renders content when token and profile are valid", async () => {
      localStorage.setItem("accessToken", "valid-token");
      vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue({
        id: 1,
        name: "User OK",
        email: "user@test.com",
      });

      const { getByTestId } = render(CourseLayout);
      await tick();

      expect(mockGoto).not.toHaveBeenCalled();

      // Test toggling sidebar and closing
      const toggleBtn = getByTestId("toggle-sidebar");
      await fireEvent.click(toggleBtn);
      const homeLink = getByTestId("sidebar-link-home");
      await fireEvent.click(homeLink);
    });
  });
});
