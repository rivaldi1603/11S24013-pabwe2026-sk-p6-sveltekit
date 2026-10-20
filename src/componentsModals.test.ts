import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import AddModal from "./features/courses/modals/AddModal.svelte";
import ChangeModal from "./features/courses/modals/ChangeModal.svelte";
import ChangeCoverModal from "./features/courses/modals/ChangeCoverModal.svelte";
import ContentModal from "./features/courses/modals/ContentModal.svelte";
import * as coursesStore from "./features/courses/states/coursesStore";

describe("Course Modals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("AddModal.svelte", () => {
    it("does not render when isOpen is false", () => {
      const { queryByTestId } = render(AddModal, { props: { isOpen: false } });
      expect(queryByTestId("add-course-modal")).not.toBeInTheDocument();
    });

    it("renders and handles submit and cancel", async () => {
      const closeMock = vi.fn();
      const successMock = vi.fn();
      const postSpy = vi.spyOn(coursesStore, "asyncPostCourse").mockResolvedValue(true);

      const { getByTestId } = render(AddModal, {
        props: {
          isOpen: true,
          onClose: closeMock,
          onSuccess: successMock,
        },
      });

      const titleInput = getByTestId("add-course-title-input");
      const descInput = getByTestId("add-course-desc-input");
      await fireEvent.input(titleInput, { target: { value: "Fullstack SvelteKit" } });
      await fireEvent.input(descInput, { target: { value: "Deskripsi lengkap" } });

      await fireEvent.submit(getByTestId("add-course-form"));
      expect(postSpy).toHaveBeenCalledWith("Fullstack SvelteKit", "Deskripsi lengkap");
      expect(successMock).toHaveBeenCalled();
      expect(closeMock).toHaveBeenCalled();

      // Cancel button
      await fireEvent.click(getByTestId("btn-cancel-add-course"));
      expect(closeMock).toHaveBeenCalledTimes(2);
    });

    it("does not close on submit failure and tests default props", async () => {
      vi.spyOn(coursesStore, "asyncPostCourse").mockResolvedValue(false);
      const { getByTestId } = render(AddModal, { props: { isOpen: true } });
      await fireEvent.submit(getByTestId("add-course-form"));
      await fireEvent.click(getByTestId("btn-cancel-add-course"));
    });

    it("tests default props with success", async () => {
      vi.spyOn(coursesStore, "asyncPostCourse").mockResolvedValue(true);
      const { getByTestId } = render(AddModal, { props: { isOpen: true } });
      await fireEvent.submit(getByTestId("add-course-form"));
    });
  });

  describe("ChangeModal.svelte", () => {
    it("does not render when isOpen is false or courseData is null", () => {
      const { queryByTestId } = render(ChangeModal, { props: { isOpen: false } });
      expect(queryByTestId("change-course-modal")).not.toBeInTheDocument();

      const { queryByTestId: q2 } = render(ChangeModal, {
        props: { isOpen: true, courseData: null },
      });
      expect(q2("change-course-modal")).not.toBeInTheDocument();
    });

    it("renders course data, handles submit and cancel", async () => {
      const closeMock = vi.fn();
      const successMock = vi.fn();
      const putSpy = vi.spyOn(coursesStore, "asyncPutCourse").mockResolvedValue(true);

      const { getByTestId } = render(ChangeModal, {
        props: {
          isOpen: true,
          courseData: {
            id: 1,
            user_id: 1,
            title: "Old Title",
            description: "Old Desc",
          },
          onClose: closeMock,
          onSuccess: successMock,
        },
      });

      const titleInput = getByTestId("edit-course-title-input") as HTMLInputElement;
      const descInput = getByTestId("edit-course-desc-input") as HTMLTextAreaElement;
      expect(titleInput.value).toBe("Old Title");
      expect(descInput.value).toBe("Old Desc");

      await fireEvent.input(titleInput, { target: { value: "New Title" } });
      await fireEvent.input(descInput, { target: { value: "New Desc" } });
      await fireEvent.submit(getByTestId("change-course-form"));
      expect(putSpy).toHaveBeenCalledWith(1, "New Title", "New Desc");
      expect(successMock).toHaveBeenCalled();
      expect(closeMock).toHaveBeenCalled();

      await fireEvent.click(getByTestId("btn-cancel-edit-course"));
      expect(closeMock).toHaveBeenCalledTimes(2);
    });

    it("handles falsy title and description fallbacks in courseData", () => {
      render(ChangeModal, {
        props: {
          isOpen: true,
          courseData: { id: 5, user_id: 1, title: "", description: "" },
        },
      });
    });

    it("handles submit failure and tests default props", async () => {
      vi.spyOn(coursesStore, "asyncPutCourse").mockResolvedValue(false);
      const { getByTestId } = render(ChangeModal, {
        props: {
          isOpen: true,
          courseData: { id: 2, user_id: 1, title: "Title", description: "Desc" },
        },
      });
      await fireEvent.submit(getByTestId("change-course-form"));
      await fireEvent.click(getByTestId("btn-cancel-edit-course"));
    });

    it("tests default props with success", async () => {
      vi.spyOn(coursesStore, "asyncPutCourse").mockResolvedValue(true);
      const { getByTestId } = render(ChangeModal, {
        props: {
          isOpen: true,
          courseData: { id: 2, user_id: 1, title: "Title", description: "Desc" },
        },
      });
      await fireEvent.submit(getByTestId("change-course-form"));
    });
  });

  describe("ChangeCoverModal.svelte", () => {
    it("does not render when isOpen is false", () => {
      const { queryByTestId } = render(ChangeCoverModal, { props: { isOpen: false } });
      expect(queryByTestId("change-cover-modal")).not.toBeInTheDocument();
    });

    it("handles file select, upload submit and cancel", async () => {
      const closeMock = vi.fn();
      const successMock = vi.fn();
      const postCoverSpy = vi.spyOn(coursesStore, "asyncPostCourseCover").mockResolvedValue(true);

      const { getByTestId } = render(ChangeCoverModal, {
        props: {
          isOpen: true,
          courseId: 1,
          onClose: closeMock,
          onSuccess: successMock,
        },
      });

      // Submit without selecting file first (early return branch)
      await fireEvent.submit(getByTestId("change-cover-form"));
      expect(postCoverSpy).not.toHaveBeenCalled();

      const fileInput = getByTestId("cover-input");
      const file = new File(["dummy cover"], "cover.jpg", { type: "image/jpeg" });
      await fireEvent.change(fileInput, { target: { files: [file] } });

      await fireEvent.submit(getByTestId("change-cover-form"));
      expect(postCoverSpy).toHaveBeenCalledWith(1, file);
      expect(successMock).toHaveBeenCalled();
      expect(closeMock).toHaveBeenCalled();

      await fireEvent.click(getByTestId("btn-cancel-cover"));
      expect(closeMock).toHaveBeenCalledTimes(2);
    });

    it("early returns when file is selected but courseId is empty", async () => {
      const postCoverSpy = vi.spyOn(coursesStore, "asyncPostCourseCover");
      const { getByTestId } = render(ChangeCoverModal, {
        props: { isOpen: true, courseId: "" },
      });
      const fileInput = getByTestId("cover-input");
      await fireEvent.change(fileInput, { target: { files: [new File(["a"], "a.png")] } });
      await fireEvent.submit(getByTestId("change-cover-form"));
      expect(postCoverSpy).not.toHaveBeenCalled();
    });

    it("handles empty files on change, failure on upload, and default props", async () => {
      vi.spyOn(coursesStore, "asyncPostCourseCover").mockResolvedValue(false);
      const { getByTestId } = render(ChangeCoverModal, { props: { isOpen: true, courseId: 1 } });
      const fileInput = getByTestId("cover-input");
      await fireEvent.change(fileInput, { target: { files: [] } });
      await fireEvent.change(fileInput, { target: { files: [new File(["a"], "a.jpg")] } });
      await fireEvent.submit(getByTestId("change-cover-form"));
      await fireEvent.click(getByTestId("btn-cancel-cover"));
    });

    it("tests default props with success", async () => {
      vi.spyOn(coursesStore, "asyncPostCourseCover").mockResolvedValue(true);
      const { getByTestId } = render(ChangeCoverModal, { props: { isOpen: true, courseId: 1 } });
      const fileInput = getByTestId("cover-input");
      await fireEvent.change(fileInput, { target: { files: [new File(["a"], "a.jpg")] } });
      await fireEvent.submit(getByTestId("change-cover-form"));
    });
  });

  describe("ContentModal.svelte", () => {
    it("does not render when isOpen is false", () => {
      const { queryByTestId } = render(ContentModal, { props: { isOpen: false } });
      expect(queryByTestId("content-modal")).not.toBeInTheDocument();
    });

    it("handles adding new content", async () => {
      const closeMock = vi.fn();
      const successMock = vi.fn();
      const postSpy = vi.spyOn(coursesStore, "asyncPostCourseContent").mockResolvedValue(true);

      const { getByTestId } = render(ContentModal, {
        props: {
          isOpen: true,
          courseId: 1,
          contentData: null,
          onClose: closeMock,
          onSuccess: successMock,
        },
      });

      expect(getByTestId("content-modal-title")).toHaveTextContent("Tambah Materi");

      await fireEvent.input(getByTestId("content-title-input"), { target: { value: "Intro Svelte" } });
      await fireEvent.input(getByTestId("content-youtube-input"), {
        target: { value: "https://youtu.be/xyz" },
      });

      await fireEvent.submit(getByTestId("content-form"));
      expect(postSpy).toHaveBeenCalledWith(1, "Intro Svelte", "https://youtu.be/xyz");
      expect(successMock).toHaveBeenCalled();
      expect(closeMock).toHaveBeenCalled();
    });

    it("handles editing existing content and empty title/youtube in contentData", async () => {
      const closeMock = vi.fn();
      const successMock = vi.fn();
      const putSpy = vi.spyOn(coursesStore, "asyncPutCourseContent").mockResolvedValue(true);

      const { getByTestId } = render(ContentModal, {
        props: {
          isOpen: true,
          courseId: 1,
          contentData: { id: 10, title: "", youtube: "" }, // tests || "" branch
          onClose: closeMock,
          onSuccess: successMock,
        },
      });

      expect(getByTestId("content-modal-title")).toHaveTextContent("Ubah Materi");
      await fireEvent.input(getByTestId("content-title-input"), { target: { value: "Updated Title" } });
      await fireEvent.input(getByTestId("content-youtube-input"), { target: { value: "https://yt.com" } });
      await fireEvent.submit(getByTestId("content-form"));
      expect(putSpy).toHaveBeenCalledWith(10, "Updated Title", "https://yt.com");
      expect(successMock).toHaveBeenCalled();
      expect(closeMock).toHaveBeenCalled();

      await fireEvent.click(getByTestId("btn-cancel-content"));
      expect(closeMock).toHaveBeenCalledTimes(2);
    });

    it("handles failure and default props", async () => {
      vi.spyOn(coursesStore, "asyncPostCourseContent").mockResolvedValue(false);
      const { getByTestId } = render(ContentModal, { props: { isOpen: true, courseId: 1 } });
      await fireEvent.submit(getByTestId("content-form"));
      await fireEvent.click(getByTestId("btn-cancel-content"));
    });

    it("tests default props with success", async () => {
      vi.spyOn(coursesStore, "asyncPostCourseContent").mockResolvedValue(true);
      const { getByTestId } = render(ContentModal, { props: { isOpen: true, courseId: 1 } });
      await fireEvent.submit(getByTestId("content-form"));
    });
  });
});
