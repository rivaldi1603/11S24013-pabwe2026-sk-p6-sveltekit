import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import Swal from "sweetalert2";
import authApi from "./features/auth/api/authApi";
import * as authStore from "./features/auth/states/authStore";
import userApi from "./features/users/api/userApi";
import * as usersStore from "./features/users/states/usersStore";
import courseApi from "./features/courses/api/courseApi";
import * as coursesStore from "./features/courses/states/coursesStore";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

describe("API and Store modules", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("authApi & authStore", () => {
    it("tests authApi directly", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success", message: "ok" }),
      } as any);

      const regRes = await authApi.postRegister("User", "user@test.com", "pass");
      expect(regRes.status).toBe("success");

      const loginRes = await authApi.postLogin("user@test.com", "pass");
      expect(loginRes.status).toBe("success");
    });

    it("tests authStore functions and branches", async () => {
      authStore.setIsAuthLogin(true);
      expect(get(authStore.isAuthLogin)).toBe(true);
      authStore.setIsAuthRegister(true);
      expect(get(authStore.isAuthRegister)).toBe(true);

      // Register success
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success", message: "Registered" }),
      } as any);
      const regOk = await authStore.asyncSetIsAuthRegister("Name", "email@test.com", "pwd");
      expect(regOk).toBe(true);

      // Register failure
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Error" }),
      } as any);
      const regFail = await authStore.asyncSetIsAuthRegister("Name", "email@test.com", "pwd");
      expect(regFail).toBe(false);

      // Register catch with and without message
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
      expect(await authStore.asyncSetIsAuthRegister("Name", "email@test.com", "pwd")).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await authStore.asyncSetIsAuthRegister("Name", "email@test.com", "pwd")).toBe(false);

      // Login success
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          status: "success",
          message: "Logged in",
          data: { token: "token-abc" },
        }),
      } as any);
      const loginOk = await authStore.asyncSetIsAuthLogin("email@test.com", "pwd");
      expect(loginOk).toBe(true);
      expect(get(authStore.isAuthLogin)).toBe(true);

      // Login failure (status != success)
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Wrong credentials" }),
      } as any);
      const loginFail = await authStore.asyncSetIsAuthLogin("email@test.com", "pwd");
      expect(loginFail).toBe(false);

      // Login catch with and without error message
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Login failed"));
      expect(await authStore.asyncSetIsAuthLogin("email@test.com", "pwd")).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await authStore.asyncSetIsAuthLogin("email@test.com", "pwd")).toBe(false);

      // Unset auth login
      authStore.asyncUnsetIsAuthLogin();
      expect(get(authStore.isAuthLogin)).toBe(false);
    });
  });

  describe("userApi & usersStore", () => {
    it("tests userApi directly", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success" }),
      } as any);

      await userApi.getUsers();
      await userApi.getProfile();
      await userApi.putProfile("New Name", "new@test.com");
      await userApi.postProfilePhoto(new File(["photo"], "pic.jpg"));
      await userApi.putProfilePassword("old", "new");
      expect(globalThis.fetch).toHaveBeenCalledTimes(5);
    });

    it("tests usersStore setters and async functions", async () => {
      usersStore.setIsProfile(true);
      usersStore.setIsChangeProfile(true);
      usersStore.setIsChangeProfilePhoto(true);
      usersStore.setIsChangeProfilePassword(true);
      expect(get(usersStore.isProfile)).toBe(true);
      expect(get(usersStore.isChangeProfile)).toBe(true);
      expect(get(usersStore.isChangeProfilePhoto)).toBe(true);
      expect(get(usersStore.isChangeProfilePassword)).toBe(true);

      // asyncSetUsers success
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          status: "success",
          data: { users: [{ id: 1, name: "Alice", email: "alice@test.com" }] },
        }),
      } as any);
      await usersStore.asyncSetUsers();
      expect(get(usersStore.users).length).toBe(1);

      // asyncSetUsers success without data.users
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success" }),
      } as any);
      await usersStore.asyncSetUsers();
      expect(get(usersStore.users).length).toBe(0);

      // asyncSetUsers failure & catch
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail" }),
      } as any);
      await usersStore.asyncSetUsers();
      expect(get(usersStore.users).length).toBe(0);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Net error"));
      await usersStore.asyncSetUsers();
      expect(get(usersStore.users).length).toBe(0);

      // asyncSetProfile success
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          status: "success",
          data: { user: { id: 1, name: "Alice", email: "alice@test.com" } },
        }),
      } as any);
      const prof = await usersStore.asyncSetProfile();
      expect(prof?.id).toBe(1);
      expect(get(usersStore.profile)?.name).toBe("Alice");
      expect(get(usersStore.isProfile)).toBe(true);

      // asyncSetProfile failure & catch
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail" }),
      } as any);
      expect(await usersStore.asyncSetProfile()).toBeNull();
      expect(get(usersStore.isProfile)).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await usersStore.asyncSetProfile()).toBeNull();

      // asyncPutProfile
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          status: "success",
          message: "Updated",
          data: { user: { id: 1, name: "Bob", email: "bob@test.com" } },
        }),
      } as any);
      expect(await usersStore.asyncPutProfile("Bob", "bob@test.com")).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Failed" }),
      } as any);
      expect(await usersStore.asyncPutProfile("Bob", "bob@test.com")).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await usersStore.asyncPutProfile("Bob", "bob@test.com")).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await usersStore.asyncPutProfile("Bob", "bob@test.com")).toBe(false);

      // asyncPostProfilePhoto
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          status: "success",
          message: "Photo uploaded",
          data: { user: { id: 1, name: "Bob", email: "bob@test.com" } },
        }),
      } as any);
      expect(await usersStore.asyncPostProfilePhoto(new File(["a"], "a.jpg"))).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Failed" }),
      } as any);
      expect(await usersStore.asyncPostProfilePhoto(new File(["a"], "a.jpg"))).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await usersStore.asyncPostProfilePhoto(new File(["a"], "a.jpg"))).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await usersStore.asyncPostProfilePhoto(new File(["a"], "a.jpg"))).toBe(false);

      // asyncPutProfilePassword
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success", message: "Password updated" }),
      } as any);
      expect(await usersStore.asyncPutProfilePassword("old", "new")).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Failed" }),
      } as any);
      expect(await usersStore.asyncPutProfilePassword("old", "new")).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await usersStore.asyncPutProfilePassword("old", "new")).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await usersStore.asyncPutProfilePassword("old", "new")).toBe(false);
    });
  });

  describe("courseApi & coursesStore", () => {
    it("tests courseApi methods directly", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success" }),
      } as any);

      await courseApi.postCourse("T", "D");
      await courseApi.postCourseCover(1, new File(["c"], "c.png"));
      await courseApi.putCourse(1, "T", "D");
      await courseApi.getCourses(true);
      await courseApi.getCourses(false);
      await courseApi.getCourseById(1);
      await courseApi.deleteCourse(1);
      await courseApi.deleteAllCourses();
      await courseApi.postStudentJoin(1);
      await courseApi.deleteStudentLeave(1);
      await courseApi.putStudentRatings(1, 4, "Bagus");
      await courseApi.putStudentRatings(1, 4);
      await courseApi.postCourseContent(1, "V", "https://youtube.com");
      await courseApi.putCourseContent(1, "V", "https://youtube.com");
      await courseApi.getCourseContentById(1);
      await courseApi.deleteCourseContent(1);
      await courseApi.postCourseContentStatus(1, 1);
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it("tests coursesStore async actions and branch variations", async () => {
      // asyncSetCourses
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          status: "success",
          data: { courses: [{ id: 1, user_id: 1, title: "Course 1", description: "Desc" }] },
        }),
      } as any);
      await coursesStore.asyncSetCourses();
      expect(get(coursesStore.courses).length).toBe(1);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success" }),
      } as any);
      await coursesStore.asyncSetCourses(true);
      expect(get(coursesStore.courses).length).toBe(0);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail" }),
      } as any);
      await coursesStore.asyncSetCourses();
      expect(get(coursesStore.courses).length).toBe(0);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      await coursesStore.asyncSetCourses();
      expect(get(coursesStore.courses).length).toBe(0);

      // asyncSetCourse
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          status: "success",
          data: { course: { id: 1, user_id: 1, title: "Course 1", description: "Desc" } },
        }),
      } as any);
      const c = await coursesStore.asyncSetCourse(1);
      expect(c?.id).toBe(1);
      expect(get(coursesStore.course)?.id).toBe(1);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail" }),
      } as any);
      expect(await coursesStore.asyncSetCourse(1)).toBeNull();

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await coursesStore.asyncSetCourse(1)).toBeNull();

      // asyncPostCourse
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          status: "success",
          message: "Created",
          data: { course_id: 10 },
        }),
      } as any);
      expect(await coursesStore.asyncPostCourse("Title", "Desc")).toBe(10);
      expect(get(coursesStore.isAddCourse)).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success", message: "Created" }),
      } as any);
      expect(await coursesStore.asyncPostCourse("Title", "Desc")).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Failed" }),
      } as any);
      expect(await coursesStore.asyncPostCourse("Title", "Desc")).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await coursesStore.asyncPostCourse("Title", "Desc")).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await coursesStore.asyncPostCourse("Title", "Desc")).toBe(false);

      // asyncPutCourse
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success", message: "Updated" }),
      } as any);
      expect(await coursesStore.asyncPutCourse(1, "New Title", "New Desc")).toBe(true);
      expect(get(coursesStore.isChangeCourse)).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Failed" }),
      } as any);
      expect(await coursesStore.asyncPutCourse(1, "New Title", "New Desc")).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await coursesStore.asyncPutCourse(1, "New Title", "New Desc")).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await coursesStore.asyncPutCourse(1, "New Title", "New Desc")).toBe(false);

      // asyncPostCourseCover
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success", message: "Cover uploaded" }),
      } as any);
      expect(await coursesStore.asyncPostCourseCover(1, new File(["a"], "cover.jpg"))).toBe(true);
      expect(get(coursesStore.isChangeCourseCover)).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Failed" }),
      } as any);
      expect(await coursesStore.asyncPostCourseCover(1, new File(["a"], "cover.jpg"))).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await coursesStore.asyncPostCourseCover(1, new File(["a"], "cover.jpg"))).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await coursesStore.asyncPostCourseCover(1, new File(["a"], "cover.jpg"))).toBe(false);

      // asyncDeleteCourse
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success", message: "Deleted" }),
      } as any);
      expect(await coursesStore.asyncDeleteCourse(1)).toBe(true);
      expect(get(coursesStore.isDeleteCourse)).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Failed" }),
      } as any);
      expect(await coursesStore.asyncDeleteCourse(1)).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await coursesStore.asyncDeleteCourse(1)).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await coursesStore.asyncDeleteCourse(1)).toBe(false);

      // asyncDeleteAllCourses
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success", message: "Deleted All" }),
      } as any);
      expect(await coursesStore.asyncDeleteAllCourses()).toBe(true);
      expect(get(coursesStore.isDeleteAllCourses)).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Failed" }),
      } as any);
      expect(await coursesStore.asyncDeleteAllCourses()).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await coursesStore.asyncDeleteAllCourses()).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await coursesStore.asyncDeleteAllCourses()).toBe(false);

      // asyncPostStudentJoin
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success", message: "Joined" }),
      } as any);
      expect(await coursesStore.asyncPostStudentJoin(1)).toBe(true);
      expect(get(coursesStore.isStudentJoin)).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Failed" }),
      } as any);
      expect(await coursesStore.asyncPostStudentJoin(1)).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await coursesStore.asyncPostStudentJoin(1)).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await coursesStore.asyncPostStudentJoin(1)).toBe(false);

      // asyncDeleteStudentLeave
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success", message: "Left" }),
      } as any);
      expect(await coursesStore.asyncDeleteStudentLeave(1)).toBe(true);
      expect(get(coursesStore.isStudentLeave)).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Failed" }),
      } as any);
      expect(await coursesStore.asyncDeleteStudentLeave(1)).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await coursesStore.asyncDeleteStudentLeave(1)).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await coursesStore.asyncDeleteStudentLeave(1)).toBe(false);

      // asyncPutStudentRatings (with comment and default comment)
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success", message: "Rated" }),
      } as any);
      expect(await coursesStore.asyncPutStudentRatings(1, 5, "Mantap")).toBe(true);
      expect(get(coursesStore.isStudentRating)).toBe(true);
      expect(await coursesStore.asyncPutStudentRatings(1, 4)).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Failed" }),
      } as any);
      expect(await coursesStore.asyncPutStudentRatings(1, 5)).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await coursesStore.asyncPutStudentRatings(1, 5)).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await coursesStore.asyncPutStudentRatings(1, 5)).toBe(false);

      // asyncSetCourseContent
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          status: "success",
          data: { course_content: { id: 10, title: "Content 1", youtube: "https://youtu.be/123" } },
        }),
      } as any);
      const cnt = await coursesStore.asyncSetCourseContent(10);
      expect(cnt?.id).toBe(10);
      expect(get(coursesStore.courseContent)?.id).toBe(10);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail" }),
      } as any);
      expect(await coursesStore.asyncSetCourseContent(10)).toBeNull();

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await coursesStore.asyncSetCourseContent(10)).toBeNull();

      // asyncPostCourseContent
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success", message: "Content added" }),
      } as any);
      expect(await coursesStore.asyncPostCourseContent(1, "Title", "https://yt.com")).toBe(true);
      expect(get(coursesStore.isAddContent)).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Failed" }),
      } as any);
      expect(await coursesStore.asyncPostCourseContent(1, "Title", "https://yt.com")).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await coursesStore.asyncPostCourseContent(1, "Title", "https://yt.com")).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await coursesStore.asyncPostCourseContent(1, "Title", "https://yt.com")).toBe(false);

      // asyncPutCourseContent
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success", message: "Content updated" }),
      } as any);
      expect(await coursesStore.asyncPutCourseContent(10, "Title 2", "https://yt.com")).toBe(true);
      expect(get(coursesStore.isChangeContent)).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Failed" }),
      } as any);
      expect(await coursesStore.asyncPutCourseContent(10, "Title 2", "https://yt.com")).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await coursesStore.asyncPutCourseContent(10, "Title 2", "https://yt.com")).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await coursesStore.asyncPutCourseContent(10, "Title 2", "https://yt.com")).toBe(false);

      // asyncDeleteCourseContent
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success", message: "Content deleted" }),
      } as any);
      expect(await coursesStore.asyncDeleteCourseContent(10)).toBe(true);
      expect(get(coursesStore.isDeleteContent)).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Failed" }),
      } as any);
      expect(await coursesStore.asyncDeleteCourseContent(10)).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await coursesStore.asyncDeleteCourseContent(10)).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await coursesStore.asyncDeleteCourseContent(10)).toBe(false);

      // asyncPostCourseContentStatus
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "success", message: "Status updated" }),
      } as any);
      expect(await coursesStore.asyncPostCourseContentStatus(10, 1)).toBe(true);
      expect(get(coursesStore.isContentStatusChanged)).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: "fail", message: "Failed" }),
      } as any);
      expect(await coursesStore.asyncPostCourseContentStatus(10, 1)).toBe(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("err"));
      expect(await coursesStore.asyncPostCourseContentStatus(10, 1)).toBe(false);
      globalThis.fetch = vi.fn().mockRejectedValue({});
      expect(await coursesStore.asyncPostCourseContentStatus(10, 1)).toBe(false);
    });
  });
});
