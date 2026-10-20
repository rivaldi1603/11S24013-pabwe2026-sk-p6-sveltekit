import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import UsersPage from "./features/users/pages/UsersPage.svelte";
import ProfilePage from "./features/users/pages/ProfilePage.svelte";
import * as usersStore from "./features/users/states/usersStore";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

describe("Users Components", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    usersStore.users.set([]);
    usersStore.profile.set(null);
  });

  describe("UsersPage.svelte", () => {
    it("renders empty state when no users", () => {
      const { getByTestId } = render(UsersPage);
      expect(getByTestId("empty-users")).toHaveTextContent("Tidak ada pengguna ditemukan.");
    });

    it("renders user cards and filters by name or email, handles empty name fallback", async () => {
      usersStore.users.set([
        { id: 1, name: "Alice Wonderland", email: "alice@test.com", photo: "https://pic.com/1.jpg", created_at: "2026-01-01" },
        { id: 2, name: "Bob Builder", email: "bob@test.com", created_at: "" },
        { id: 3, name: "", email: "noname@test.com" }, // triggers user.name fallback "U"
      ]);

      const { getByText, getByTestId, queryByText } = render(UsersPage);
      expect(getByText("Alice Wonderland")).toBeInTheDocument();
      expect(getByText("Bob Builder")).toBeInTheDocument();
      expect(getByText("noname@test.com")).toBeInTheDocument();

      const searchInput = getByTestId("search-users-input");
      await fireEvent.input(searchInput, { target: { value: "alice" } });
      expect(getByText("Alice Wonderland")).toBeInTheDocument();
      expect(queryByText("Bob Builder")).not.toBeInTheDocument();

      // Filter by email match
      await fireEvent.input(searchInput, { target: { value: "noname" } });
      expect(getByText("noname@test.com")).toBeInTheDocument();
    });
  });

  describe("ProfilePage.svelte", () => {
    it("loads profile on mount and handles profile, photo, and password submissions", async () => {
      const mockUser = {
        id: 1,
        name: "Current User",
        email: "user@test.com",
        photo: "https://pic.com/user.jpg",
      };
      usersStore.profile.set(mockUser);
      vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue(mockUser);
      const putProfSpy = vi.spyOn(usersStore, "asyncPutProfile").mockResolvedValue(true);
      const postPhotoSpy = vi.spyOn(usersStore, "asyncPostProfilePhoto").mockResolvedValue(true);
      const putPwdSpy = vi.spyOn(usersStore, "asyncPutProfilePassword").mockResolvedValue(true);

      const { getByTestId } = render(ProfilePage);
      await new Promise((r) => setTimeout(r, 50));
      await tick();

      expect(getByTestId("profile-photo-img")).toBeInTheDocument();

      // Submit photo form when selectedPhoto is null
      await fireEvent.submit(getByTestId("photo-form"));
      expect(postPhotoSpy).not.toHaveBeenCalled();

      // Update Profile
      const nameInput = getByTestId("profile-name-input");
      const emailInput = getByTestId("profile-email-input");
      await fireEvent.input(nameInput, { target: { value: "Updated Name" } });
      await fireEvent.input(emailInput, { target: { value: "updated@test.com" } });
      await fireEvent.submit(getByTestId("profile-form"));
      expect(putProfSpy).toHaveBeenCalledWith("Updated Name", "updated@test.com");

      // Upload Photo with file
      const photoInput = getByTestId("photo-input");
      const file = new File(["dummy"], "avatar.png", { type: "image/png" });
      await fireEvent.change(photoInput, { target: { files: [file] } });
      await fireEvent.submit(getByTestId("photo-form"));
      expect(postPhotoSpy).toHaveBeenCalledWith(file);

      // Trigger change with empty files list
      await fireEvent.change(photoInput, { target: { files: [] } });

      // Change Password
      const oldPwdInput = getByTestId("current-password-input");
      const newPwdInput = getByTestId("new-password-input");
      await fireEvent.input(oldPwdInput, { target: { value: "oldsecret" } });
      await fireEvent.input(newPwdInput, { target: { value: "newsecret" } });
      await fireEvent.submit(getByTestId("password-form"));
      expect(putPwdSpy).toHaveBeenCalledWith("oldsecret", "newsecret");
      expect((oldPwdInput as HTMLInputElement).value).toBe("");
      expect((newPwdInput as HTMLInputElement).value).toBe("");
    });

    it("handles password update failure without clearing inputs", async () => {
      vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue(null);
      vi.spyOn(usersStore, "asyncPutProfilePassword").mockResolvedValue(false);

      const { getByTestId } = render(ProfilePage);
      await tick();

      const oldPwdInput = getByTestId("current-password-input") as HTMLInputElement;
      const newPwdInput = getByTestId("new-password-input") as HTMLInputElement;
      await fireEvent.input(oldPwdInput, { target: { value: "wrong" } });
      await fireEvent.input(newPwdInput, { target: { value: "new" } });
      await fireEvent.submit(getByTestId("password-form"));

      expect(oldPwdInput.value).toBe("wrong");
      expect(newPwdInput.value).toBe("new");
    });
  });
});
