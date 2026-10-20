import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import Swal from "sweetalert2";
import apiHelper, {
  putAccessToken,
  getAccessToken,
  removeAccessToken,
  fetchWithAuth,
} from "./helpers/apiHelper";
import toolsHelper, {
  showSuccessDialog,
  showErrorDialog,
  showWarningDialog,
  showConfirmDialog,
  formatDate,
} from "./helpers/toolsHelper";
import useInputHook, { useInput } from "./hooks/useInput";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
  },
}));

describe("helpers and hooks", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("apiHelper", () => {
    it("handles put, get, and remove access token", () => {
      expect(getAccessToken()).toBeNull();
      putAccessToken("token-xyz");
      expect(getAccessToken()).toBe("token-xyz");
      removeAccessToken();
      expect(getAccessToken()).toBeNull();
      expect(apiHelper.getAccessToken()).toBeNull();
      apiHelper.putAccessToken("token-123");
      expect(apiHelper.getAccessToken()).toBe("token-123");
      apiHelper.removeAccessToken();
      expect(apiHelper.getAccessToken()).toBeNull();
    });

    it("fetchWithAuth adds Authorization header if token exists", async () => {
      putAccessToken("token-xyz");
      const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
      globalThis.fetch = mockFetch;

      await fetchWithAuth("https://example.com/api", {
        method: "GET",
        headers: { "Custom-Header": "yes" },
      });

      expect(mockFetch).toHaveBeenCalled();
      const callHeaders = mockFetch.mock.calls[0][1].headers as Headers;
      expect(callHeaders.get("Authorization")).toBe("Bearer token-xyz");
      expect(callHeaders.get("Custom-Header")).toBe("yes");
    });

    it("fetchWithAuth works without token and without options", async () => {
      removeAccessToken();
      const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
      globalThis.fetch = mockFetch;

      await apiHelper.fetchWithAuth("https://example.com/api");

      expect(mockFetch).toHaveBeenCalled();
      const callHeaders = mockFetch.mock.calls[0][1].headers as Headers;
      expect(callHeaders.get("Authorization")).toBeNull();
    });
  });

  describe("toolsHelper", () => {
    it("calls showSuccessDialog with and without custom title", async () => {
      (Swal.fire as any).mockResolvedValue({});
      await showSuccessDialog("Berhasil");
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "success",
          title: "Berhasil",
          text: "Berhasil",
        })
      );

      await toolsHelper.showSuccessDialog("Berhasil 2", "Kustom");
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "success",
          title: "Kustom",
          text: "Berhasil 2",
        })
      );
    });

    it("calls showErrorDialog with and without custom title", async () => {
      (Swal.fire as any).mockResolvedValue({});
      await showErrorDialog("Error");
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "error",
          title: "Gagal",
          text: "Error",
        })
      );

      await toolsHelper.showErrorDialog("Error 2", "Custom Title");
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "error",
          title: "Custom Title",
          text: "Error 2",
        })
      );
    });

    it("calls showWarningDialog with and without custom title", async () => {
      (Swal.fire as any).mockResolvedValue({});
      await showWarningDialog("Peringatan 1");
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "warning",
          title: "Peringatan",
          text: "Peringatan 1",
        })
      );

      await toolsHelper.showWarningDialog("Peringatan 2", "Awas");
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "warning",
          title: "Awas",
          text: "Peringatan 2",
        })
      );
    });

    it("calls showConfirmDialog for confirmed true and false", async () => {
      (Swal.fire as any).mockResolvedValue({ isConfirmed: true });
      const res1 = await showConfirmDialog("Lanjutkan?");
      expect(res1).toBe(true);

      (Swal.fire as any).mockResolvedValue({ isConfirmed: false });
      const res2 = await toolsHelper.showConfirmDialog("Batal?", "Tanya");
      expect(res2).toBe(false);
    });

    it("formats dates correctly", () => {
      expect(formatDate()).toBe("-");
      expect(formatDate("")).toBe("-");
      expect(formatDate("not-a-date")).toBe("-");
      const formatted = toolsHelper.formatDate("2026-10-20T00:00:00.000Z");
      expect(formatted).toContain("2026");
    });
  });

  describe("useInput hook", () => {
    it("handles initial value and event changes", () => {
      const [val1, onChange1, setVal1] = useInput();
      expect(get(val1)).toBe("");

      const [val2, onChange2, setVal2] = useInputHook("initial");
      expect(get(val2)).toBe("initial");

      onChange2({ target: { value: "edited" } } as any);
      expect(get(val2)).toBe("edited");

      onChange2({ target: null } as any);
      expect(get(val2)).toBe("");

      setVal2("manual");
      expect(get(val2)).toBe("manual");
    });
  });
});
