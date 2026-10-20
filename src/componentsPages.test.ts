import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import HomePage from "./features/courses/pages/HomePage.svelte";
import DetailPage from "./features/courses/pages/DetailPage.svelte";
import ContentPage from "./features/courses/pages/ContentPage.svelte";
import * as coursesStore from "./features/courses/states/coursesStore";
import * as usersStore from "./features/users/states/usersStore";
import * as toolsHelper from "./helpers/toolsHelper";
import { mockGoto } from "./setupTests";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

describe("Courses Pages", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    coursesStore.courses.set([]);
    coursesStore.course.set(null);
    coursesStore.courseContent.set(null);
    usersStore.profile.set(null);
  });

  describe("HomePage.svelte", () => {
    it("renders empty state when there are no courses", () => {
      const { getByTestId } = render(HomePage);
      expect(getByTestId("empty-courses")).toBeInTheDocument();
    });

    it("renders course list and filters by search and onlyMine", async () => {
      usersStore.profile.set({ id: 1, name: "Owner", email: "owner@test.com" });
      coursesStore.courses.set([
        { id: 1, user_id: 1, title: "Svelte 5", description: "Learn Runes", cover: "https://cover1.jpg" },
        { id: 2, user_id: 2, title: "TypeScript Pro", description: "Advanced TS" },
      ]);

      const { getByText, getByTestId, queryByText } = render(HomePage);
      expect(getByText("Svelte 5")).toBeInTheDocument();
      expect(getByText("TypeScript Pro")).toBeInTheDocument();

      // Click view-course links
      await fireEvent.click(getByTestId("view-course-1"));
      await fireEvent.click(getByTestId("view-course-2"));

      // Search filter matching title
      const searchInput = getByTestId("search-course");
      await fireEvent.input(searchInput, { target: { value: "Svelte" } });
      expect(getByText("Svelte 5")).toBeInTheDocument();
      expect(queryByText("TypeScript Pro")).not.toBeInTheDocument();

      // Search filter matching description
      await fireEvent.input(searchInput, { target: { value: "advanced" } });
      expect(getByText("TypeScript Pro")).toBeInTheDocument();
      expect(queryByText("Svelte 5")).not.toBeInTheDocument();

      // Search filter matching neither
      await fireEvent.input(searchInput, { target: { value: "nomatch" } });
      expect(queryByText("Svelte 5")).not.toBeInTheDocument();
      expect(queryByText("TypeScript Pro")).not.toBeInTheDocument();

      await fireEvent.input(searchInput, { target: { value: "" } });

      // Checkbox filter
      const setCoursesSpy = vi.spyOn(coursesStore, "asyncSetCourses").mockResolvedValue();
      const filterMineCheckbox = getByTestId("filter-mine");
      await fireEvent.click(filterMineCheckbox);
      expect(setCoursesSpy).toHaveBeenCalledWith(true);

      // Branch where onlyMine is true but profile is null
      usersStore.profile.set(null);
      await tick();
    });

    it("handles delete course and delete all courses", async () => {
      usersStore.profile.set({ id: 1, name: "Owner", email: "owner@test.com" });
      coursesStore.courses.set([
        { id: 1, user_id: 1, title: "Svelte 5", description: "Learn Runes" },
      ]);

      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
      const delCourseSpy = vi.spyOn(coursesStore, "asyncDeleteCourse").mockResolvedValue(true);
      const delAllSpy = vi.spyOn(coursesStore, "asyncDeleteAllCourses").mockResolvedValue(true);

      const { getByTestId } = render(HomePage);
      await fireEvent.click(getByTestId("delete-course-1"));
      expect(delCourseSpy).toHaveBeenCalledWith(1);

      await fireEvent.click(getByTestId("delete-all-courses"));
      expect(delAllSpy).toHaveBeenCalled();
    });

    it("handles deletion when deleteCourse or deleteAll returns false", async () => {
      usersStore.profile.set({ id: 1, name: "Owner", email: "owner@test.com" });
      coursesStore.courses.set([
        { id: 1, user_id: 1, title: "Svelte 5", description: "Learn Runes" },
      ]);

      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
      vi.spyOn(coursesStore, "asyncDeleteCourse").mockResolvedValue(false);
      vi.spyOn(coursesStore, "asyncDeleteAllCourses").mockResolvedValue(false);

      const { getByTestId } = render(HomePage);
      await fireEvent.click(getByTestId("delete-course-1"));
      await fireEvent.click(getByTestId("delete-all-courses"));
    });

    it("cancels deletion when confirm dialog returns false", async () => {
      usersStore.profile.set({ id: 1, name: "Owner", email: "owner@test.com" });
      coursesStore.courses.set([
        { id: 1, user_id: 1, title: "Svelte 5", description: "Learn Runes" },
      ]);

      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(false);
      const delCourseSpy = vi.spyOn(coursesStore, "asyncDeleteCourse");
      const delAllSpy = vi.spyOn(coursesStore, "asyncDeleteAllCourses");

      const { getByTestId } = render(HomePage);
      await fireEvent.click(getByTestId("delete-course-1"));
      expect(delCourseSpy).not.toHaveBeenCalled();

      await fireEvent.click(getByTestId("delete-all-courses"));
      expect(delAllSpy).not.toHaveBeenCalled();
    });

    it("opens add modal, submits successfully, and tests cancel to trigger HomePage modal callbacks", async () => {
      vi.spyOn(coursesStore, "asyncPostCourse").mockResolvedValue(true);
      const setCoursesSpy = vi.spyOn(coursesStore, "asyncSetCourses").mockResolvedValue();

      const { getByTestId } = render(HomePage);
      await fireEvent.click(getByTestId("open-add-modal"));
      expect(getByTestId("add-course-modal")).toBeInTheDocument();

      // Submit add course form to trigger onSuccess in HomePage
      await fireEvent.input(getByTestId("add-course-title-input"), { target: { value: "New Course" } });
      await fireEvent.input(getByTestId("add-course-desc-input"), { target: { value: "New Desc" } });
      await fireEvent.submit(getByTestId("add-course-form"));
      expect(setCoursesSpy).toHaveBeenCalled();

      // Open and cancel to trigger onClose in HomePage
      await fireEvent.click(getByTestId("open-add-modal"));
      await fireEvent.click(getByTestId("btn-cancel-add-course"));
    });
  });

  describe("DetailPage.svelte", () => {
    it("renders loading when course is null and tests empty courseId", () => {
      const { getByTestId } = render(DetailPage, { props: { courseId: "" } });
      expect(getByTestId("loading-course")).toBeInTheDocument();
    });

    it("renders owner view with edit, cover, delete actions and modal onSuccess/onClose callbacks", async () => {
      usersStore.profile.set({ id: 1, name: "Teacher", email: "t@test.com" });
      coursesStore.course.set({
        id: 1,
        user_id: 1,
        title: "Svelte Mastery",
        description: "Master Svelte 5",
        cover: "https://cover.jpg",
        students: [1, 2], // also student, but owner should take precedence
        contents: [
          { id: 10, title: "Lesson 1", youtube: "https://youtu.be/123" },
        ],
      });

      const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockResolvedValue(null as any);
      vi.spyOn(coursesStore, "asyncPostCourseCover").mockResolvedValue(true);
      vi.spyOn(coursesStore, "asyncPutCourse").mockResolvedValue(true);
      vi.spyOn(coursesStore, "asyncPostCourseContent").mockResolvedValue(true);

      const { getByTestId } = render(DetailPage, { props: { courseId: "1" } });
      expect(getByTestId("course-cover-img")).toBeInTheDocument();
      expect(getByTestId("owner-actions")).toBeInTheDocument();

      // Open and submit cover modal to trigger onSuccess & onClose in DetailPage
      await fireEvent.click(getByTestId("btn-change-cover"));
      const coverInput = getByTestId("cover-input");
      await fireEvent.change(coverInput, { target: { files: [new File(["a"], "a.jpg")] } });
      await fireEvent.submit(getByTestId("change-cover-form"));
      expect(setCourseSpy).toHaveBeenCalled();

      // Open and cancel cover modal
      await fireEvent.click(getByTestId("btn-change-cover"));
      await fireEvent.click(getByTestId("btn-cancel-cover"));

      // Open and submit edit modal to trigger onSuccess & onClose in DetailPage
      await fireEvent.click(getByTestId("btn-edit-course"));
      await fireEvent.submit(getByTestId("change-course-form"));
      expect(setCourseSpy).toHaveBeenCalled();

      // Open and cancel edit modal
      await fireEvent.click(getByTestId("btn-edit-course"));
      await fireEvent.click(getByTestId("btn-cancel-edit-course"));

      // Open and submit content modal to trigger onSuccess & onClose in DetailPage
      await fireEvent.click(getByTestId("btn-add-content"));
      await fireEvent.input(getByTestId("content-title-input"), { target: { value: "New Lesson" } });
      await fireEvent.input(getByTestId("content-youtube-input"), { target: { value: "https://yt.com" } });
      await fireEvent.submit(getByTestId("content-form"));
      expect(setCourseSpy).toHaveBeenCalled();

      // Open and cancel content modal
      await fireEvent.click(getByTestId("btn-add-content"));
      await fireEvent.click(getByTestId("btn-cancel-content"));

      // Open edit content modal
      await fireEvent.click(getByTestId("edit-content-10"));
      await fireEvent.click(getByTestId("btn-cancel-content"));

      // Delete content (confirm false and true)
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValueOnce(false);
      await fireEvent.click(getByTestId("delete-content-10"));

      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValueOnce(true);
      vi.spyOn(coursesStore, "asyncDeleteCourseContent").mockResolvedValueOnce(false);
      await fireEvent.click(getByTestId("delete-content-10"));

      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValueOnce(true);
      const delContentSpy = vi.spyOn(coursesStore, "asyncDeleteCourseContent").mockResolvedValue(true);
      await fireEvent.click(getByTestId("delete-content-10"));
      expect(delContentSpy).toHaveBeenCalledWith(10);

      // Click content link
      await fireEvent.click(getByTestId("content-link-10"));

      // Delete course (confirm false and true, success false and true)
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValueOnce(false);
      await fireEvent.click(getByTestId("btn-delete-course"));

      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValueOnce(true);
      vi.spyOn(coursesStore, "asyncDeleteCourse").mockResolvedValueOnce(false);
      await fireEvent.click(getByTestId("btn-delete-course"));

      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValueOnce(true);
      vi.spyOn(coursesStore, "asyncDeleteCourse").mockResolvedValueOnce(true);
      await fireEvent.click(getByTestId("btn-delete-course"));
      expect(mockGoto).toHaveBeenCalledWith("/");
    });

    it("renders student view and covers my_Contents and different student object types", async () => {
      usersStore.profile.set({ id: 2, name: "Student", email: "student@test.com" });
      coursesStore.course.set({
        id: 1,
        user_id: 1,
        title: "Svelte Mastery",
        description: "Master Svelte 5",
        students: [
          999, // number not matching
          { user_id: 999, id: 998 }, // object not matching
          { id: 997 }, // object without user_id not matching
          { user_id: 2, name: "Student" }, // student with user_id
        ],
        my_Contents: [{ id: 11, title: "My Content", youtube: "https://yt.com" }],
      });

      const leaveSpy = vi.spyOn(coursesStore, "asyncDeleteStudentLeave").mockResolvedValue(true);
      const ratingSpy = vi.spyOn(coursesStore, "asyncPutStudentRatings").mockResolvedValue(true);

      const { getByTestId } = render(DetailPage, { props: { courseId: "1" } });
      expect(getByTestId("student-actions")).toBeInTheDocument();
      expect(getByTestId("rating-section")).toBeInTheDocument();

      // Click content link
      await fireEvent.click(getByTestId("content-link-11"));

      await fireEvent.click(getByTestId("btn-leave-course"));
      expect(leaveSpy).toHaveBeenCalledWith("1");

      const ratingSelect = getByTestId("rating-select");
      await fireEvent.change(ratingSelect, { target: { value: "4" } });
      await fireEvent.input(getByTestId("rating-comment-input"), { target: { value: "Bagus!" } });
      await fireEvent.submit(getByTestId("rating-form"));
      expect(ratingSpy).toHaveBeenCalledWith("1", 4, "Bagus!");

      // Render DetailPage with default props
      const rDef = render(DetailPage);
      rDef.unmount();
    });

    it("handles null/undefined students and contents", () => {
      usersStore.profile.set({ id: 5, name: "Other", email: "o@test.com" });
      coursesStore.course.set({
        id: 99,
        user_id: 88,
        title: "Empty Course",
        description: "No contents or students",
      });
      const r = render(DetailPage, { props: { courseId: "99" } });
      expect(r.getByTestId("guest-actions")).toBeInTheDocument();
      expect(r.getByTestId("empty-contents")).toBeInTheDocument();
      r.unmount();
    });

    it("handles join failure and join success", async () => {
      usersStore.profile.set({ id: 3, name: "Guest", email: "guest@test.com" });
      coursesStore.course.set({
        id: 1,
        user_id: 1,
        title: "Course",
        description: "Desc",
        students: [],
      });

      vi.spyOn(coursesStore, "asyncPostStudentJoin").mockResolvedValue(false);
      const r1 = render(DetailPage, { props: { courseId: "1" } });
      await fireEvent.click(r1.getByTestId("btn-join-course"));
      r1.unmount();

      vi.spyOn(coursesStore, "asyncPostStudentJoin").mockResolvedValue(true);
      const r2 = render(DetailPage, { props: { courseId: "1" } });
      await fireEvent.click(r2.getByTestId("btn-join-course"));
      r2.unmount();
    });

    it("handles leave failure and rating failure", async () => {
      usersStore.profile.set({ id: 4, name: "Student4", email: "s4@test.com" });
      coursesStore.course.set({
        id: 1,
        user_id: 1,
        title: "Course",
        description: "Desc",
        students: [{ id: 4 }], // student with id
      });
      vi.spyOn(coursesStore, "asyncDeleteStudentLeave").mockResolvedValue(false);
      vi.spyOn(coursesStore, "asyncPutStudentRatings").mockResolvedValue(false);

      const { getByTestId } = render(DetailPage, { props: { courseId: "1" } });
      await fireEvent.click(getByTestId("btn-leave-course"));
      await fireEvent.submit(getByTestId("rating-form"));
    });
  });

  describe("ContentPage.svelte", () => {
    it("renders loading state when courseContent is null and tests empty contentId", () => {
      const { getByTestId } = render(ContentPage, {
        props: { courseId: "1", contentId: "" },
      });
      expect(getByTestId("loading-content")).toBeInTheDocument();
    });

    it("renders content and handles youtube urls and toggle status", async () => {
      coursesStore.courseContent.set({
        id: 10,
        course_id: 1,
        title: "Materi Runes",
        youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        my_status_finished: 0,
      });

      const statusSpy = vi.spyOn(coursesStore, "asyncPostCourseContentStatus").mockResolvedValue(true);
      const setContentSpy = vi.spyOn(coursesStore, "asyncSetCourseContent").mockResolvedValue(null as any);

      const { getByTestId, unmount } = render(ContentPage, {
        props: { courseId: "1", contentId: "10" },
      });

      const iframe = getByTestId("youtube-iframe") as HTMLIFrameElement;
      expect(iframe.src).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");

      const toggleBtn = getByTestId("toggle-status-btn");
      expect(toggleBtn).toHaveTextContent("Tandai Selesai");

      await fireEvent.click(toggleBtn);
      expect(statusSpy).toHaveBeenCalledWith("10", 1);
      expect(setContentSpy).toHaveBeenCalledWith("10");

      // Test toggle failure branch
      vi.spyOn(coursesStore, "asyncPostCourseContentStatus").mockResolvedValueOnce(false);
      await fireEvent.click(toggleBtn);

      // Status already finished with youtu.be
      coursesStore.courseContent.set({
        id: 10,
        course_id: 1,
        title: "Materi Runes",
        youtube: "https://youtu.be/shortcode",
        my_status_finished: 1,
      });
      await tick();
      expect(getByTestId("toggle-status-btn")).toHaveTextContent("Selesai Dipelajari");
      await fireEvent.click(getByTestId("toggle-status-btn"));

      // Test with embed url and fallback non-youtube url and empty url
      coursesStore.courseContent.set({
        id: 10,
        title: "Embed Video",
        youtube: "https://www.youtube.com/embed/embedcode",
      });
      await tick();
      expect((getByTestId("youtube-iframe") as HTMLIFrameElement).src).toBe("https://www.youtube.com/embed/embedcode");

      coursesStore.courseContent.set({
        id: 10,
        title: "Other Video",
        youtube: "https://example.com/video.mp4",
      });
      await tick();
      expect((getByTestId("youtube-iframe") as HTMLIFrameElement).src).toBe("https://example.com/video.mp4");

      coursesStore.courseContent.set({
        id: 10,
        title: "Empty Video",
        youtube: "",
      });
      await tick();
      expect(getByTestId("youtube-iframe")).toHaveAttribute("src", "");

      // Click back-to-course link
      await fireEvent.click(getByTestId("back-to-course"));
      unmount();

      // Test default props for ContentPage
      const rDefContent = render(ContentPage);
      await fireEvent.click(rDefContent.getByTestId("back-to-course"));
      rDefContent.unmount();
    });
  });
});
