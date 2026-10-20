import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import AuthSessionRedirect from "./features/auth/components/AuthSessionRedirect.svelte";
import AuthLayout from "./features/auth/layouts/AuthLayout.svelte";
import LoginPage from "./features/auth/pages/LoginPage.svelte";
import RegisterPage from "./features/auth/pages/RegisterPage.svelte";
import NotFoundPage from "./features/common/pages/NotFoundPage.svelte";
import { mockGoto } from "./setupTests";
import { isAuthLogin } from "./features/auth/states/authStore";
import { profile } from "./features/users/states/usersStore";
import * as authStore from "./features/auth/states/authStore";
import * as usersStore from "./features/users/states/usersStore";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

describe("Auth and Common Components", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    isAuthLogin.set(false);
    profile.set(null);
  });

  describe("AuthSessionRedirect.svelte", () => {
    it("does not redirect if not logged in", async () => {
      render(AuthSessionRedirect);
      await tick();
      expect(mockGoto).not.toHaveBeenCalled();
    });

    it("redirects to home if logged in with token and profile", async () => {
      localStorage.setItem("accessToken", "valid-token");
      isAuthLogin.set(true);
      profile.set({ id: 1, name: "Admin", email: "admin@test.com" });

      render(AuthSessionRedirect);
      await tick();
      expect(mockGoto).toHaveBeenCalledWith("/");
    });
  });

  describe("AuthLayout.svelte", () => {
    it("renders layout with children and branding", () => {
      const { getByText } = render(AuthLayout, {
        props: {
          children: () => null,
        },
      });
      expect(getByText("Platform Manajemen Kursus & Pembelajaran Interaktif")).toBeInTheDocument();
      expect(getByText("© 2026 Delcom Courses. All rights reserved.")).toBeInTheDocument();
    });

    it("renders without children passed", () => {
      const { getByText } = render(AuthLayout);
      expect(getByText("Platform Manajemen Kursus & Pembelajaran Interaktif")).toBeInTheDocument();
    });
  });

  describe("NotFoundPage.svelte", () => {
    it("renders 404 page with return link", () => {
      const { getByText } = render(NotFoundPage);
      expect(getByText("404 - Halaman Tidak Ditemukan")).toBeInTheDocument();
      const link = getByText("Kembali ke Beranda");
      expect(link).toHaveAttribute("href", "/");
    });
  });

  describe("LoginPage.svelte", () => {
    it("submits form successfully and redirects", async () => {
      const loginSpy = vi.spyOn(authStore, "asyncSetIsAuthLogin").mockResolvedValue(true);
      const profileSpy = vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue({
        id: 1,
        name: "Test",
        email: "test@example.com",
      });

      const { getByLabelText, getByRole } = render(LoginPage);
      const emailInput = getByLabelText("Email");
      const passwordInput = getByLabelText("Kata Sandi");
      const submitBtn = getByRole("button", { name: "Masuk" });

      await fireEvent.input(emailInput, { target: { value: "user@test.com" } });
      await fireEvent.input(passwordInput, { target: { value: "secret123" } });
      await fireEvent.click(submitBtn);

      expect(loginSpy).toHaveBeenCalledWith("user@test.com", "secret123");
      expect(profileSpy).toHaveBeenCalled();
      expect(mockGoto).toHaveBeenCalledWith("/");
    });

    it("handles login failure without redirecting", async () => {
      vi.spyOn(authStore, "asyncSetIsAuthLogin").mockResolvedValue(false);

      const { getByLabelText, getByRole } = render(LoginPage);
      await fireEvent.input(getByLabelText("Email"), { target: { value: "wrong@test.com" } });
      await fireEvent.input(getByLabelText("Kata Sandi"), { target: { value: "wrong" } });
      await fireEvent.click(getByRole("button", { name: "Masuk" }));

      expect(mockGoto).not.toHaveBeenCalled();
    });
  });

  describe("RegisterPage.svelte", () => {
    it("submits form successfully and redirects to login", async () => {
      const registerSpy = vi.spyOn(authStore, "asyncSetIsAuthRegister").mockResolvedValue(true);

      const { getByLabelText, getByRole } = render(RegisterPage);
      await fireEvent.input(getByLabelText("Nama Lengkap"), { target: { value: "New User" } });
      await fireEvent.input(getByLabelText("Email"), { target: { value: "new@test.com" } });
      await fireEvent.input(getByLabelText("Kata Sandi"), { target: { value: "password" } });
      await fireEvent.click(getByRole("button", { name: "Daftar" }));

      expect(registerSpy).toHaveBeenCalledWith("New User", "new@test.com", "password");
      expect(mockGoto).toHaveBeenCalledWith("/auth/login");
    });

    it("handles registration failure without redirecting", async () => {
      vi.spyOn(authStore, "asyncSetIsAuthRegister").mockResolvedValue(false);

      const { getByLabelText, getByRole } = render(RegisterPage);
      await fireEvent.input(getByLabelText("Nama Lengkap"), { target: { value: "New User" } });
      await fireEvent.input(getByLabelText("Email"), { target: { value: "fail@test.com" } });
      await fireEvent.input(getByLabelText("Kata Sandi"), { target: { value: "password" } });
      await fireEvent.click(getByRole("button", { name: "Daftar" }));

      expect(mockGoto).not.toHaveBeenCalled();
    });
  });
});
