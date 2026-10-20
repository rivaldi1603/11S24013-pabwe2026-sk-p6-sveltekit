import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

(globalThis as any).DELCOM_BASEURL = "https://open-api.delcom.org/api/v1";

export const mockGoto = vi.fn();
export const mockPage = {
  url: new URL("http://localhost:3005/"),
  params: {
    courseId: "1",
    contentId: "10",
  } as Record<string, string>,
};

vi.mock("$app/navigation", () => ({
  goto: mockGoto,
}));

vi.mock("$app/state", () => ({
  get page() {
    return mockPage;
  },
}));
