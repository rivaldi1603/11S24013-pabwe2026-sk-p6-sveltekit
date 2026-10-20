import { writable } from "svelte/store";
import courseApi from "../api/courseApi";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";

export interface CourseContentItem {
  id: number;
  course_id?: number;
  title: string;
  youtube: string;
  my_status_finished?: boolean | number;
  created_at?: string;
}

export interface CourseStudent {
  id?: number;
  user_id?: number;
  name?: string;
  ratings?: number;
  comment?: string;
}

export interface CourseItem {
  id: number;
  user_id: number;
  title: string;
  description: string;
  cover?: string;
  avg_ratings?: number;
  students?: Array<number | CourseStudent>;
  contents?: CourseContentItem[];
  my_Contents?: CourseContentItem[];
  created_at?: string;
  updated_at?: string;
}

export const courses = writable<CourseItem[]>([]);
export const course = writable<CourseItem | null>(null);
export const courseContent = writable<CourseContentItem | null>(null);

export const isAddCourse = writable<boolean>(false);
export const isChangeCourse = writable<boolean>(false);
export const isChangeCourseCover = writable<boolean>(false);
export const isDeleteCourse = writable<boolean>(false);
export const isDeleteAllCourses = writable<boolean>(false);
export const isStudentJoin = writable<boolean>(false);
export const isStudentLeave = writable<boolean>(false);
export const isStudentRating = writable<boolean>(false);
export const isAddContent = writable<boolean>(false);
export const isChangeContent = writable<boolean>(false);
export const isDeleteContent = writable<boolean>(false);
export const isContentStatusChanged = writable<boolean>(false);

export async function asyncSetCourses(isMe?: boolean) {
  try {
    const res = await courseApi.getCourses(isMe);
    if (res.status === "success") {
      courses.set(res.data?.courses || []);
      return;
    }
    courses.set([]);
  } catch {
    courses.set([]);
  }
}

export async function asyncSetCourse(courseId: number | string) {
  try {
    const res = await courseApi.getCourseById(courseId);
    if (res.status === "success" && res.data?.course) {
      course.set(res.data.course);
      return res.data.course as CourseItem;
    }
    course.set(null);
    return null;
  } catch {
    course.set(null);
    return null;
  }
}

export async function asyncPostCourse(title: string, description: string) {
  try {
    const res = await courseApi.postCourse(title, description);
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isAddCourse.set(true);
      return res.data?.course_id ?? true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal menambahkan kursus");
    return false;
  }
}

export async function asyncPutCourse(
  courseId: number | string,
  title: string,
  description: string
) {
  try {
    const res = await courseApi.putCourse(courseId, title, description);
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isChangeCourse.set(true);
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal mengubah kursus");
    return false;
  }
}

export async function asyncPostCourseCover(
  courseId: number | string,
  cover: File
) {
  try {
    const res = await courseApi.postCourseCover(courseId, cover);
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isChangeCourseCover.set(true);
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal mengubah sampul kursus");
    return false;
  }
}

export async function asyncDeleteCourse(courseId: number | string) {
  try {
    const res = await courseApi.deleteCourse(courseId);
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isDeleteCourse.set(true);
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal menghapus kursus");
    return false;
  }
}

export async function asyncDeleteAllCourses() {
  try {
    const res = await courseApi.deleteAllCourses();
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isDeleteAllCourses.set(true);
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal menghapus semua kursus");
    return false;
  }
}

export async function asyncPostStudentJoin(courseId: number | string) {
  try {
    const res = await courseApi.postStudentJoin(courseId);
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isStudentJoin.set(true);
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal mendaftar ke kursus");
    return false;
  }
}

export async function asyncDeleteStudentLeave(courseId: number | string) {
  try {
    const res = await courseApi.deleteStudentLeave(courseId);
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isStudentLeave.set(true);
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal keluar dari kursus");
    return false;
  }
}

export async function asyncPutStudentRatings(
  courseId: number | string,
  ratings: number,
  comment = ""
) {
  try {
    const res = await courseApi.putStudentRatings(courseId, ratings, comment);
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isStudentRating.set(true);
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal mengirim rating");
    return false;
  }
}

export async function asyncSetCourseContent(contentId: number | string) {
  try {
    const res = await courseApi.getCourseContentById(contentId);
    if (res.status === "success" && res.data?.course_content) {
      courseContent.set(res.data.course_content);
      return res.data.course_content as CourseContentItem;
    }
    courseContent.set(null);
    return null;
  } catch {
    courseContent.set(null);
    return null;
  }
}

export async function asyncPostCourseContent(
  courseId: number | string,
  title: string,
  youtube: string
) {
  try {
    const res = await courseApi.postCourseContent(courseId, title, youtube);
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isAddContent.set(true);
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal menambahkan materi");
    return false;
  }
}

export async function asyncPutCourseContent(
  contentId: number | string,
  title: string,
  youtube: string
) {
  try {
    const res = await courseApi.putCourseContent(contentId, title, youtube);
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isChangeContent.set(true);
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal mengubah materi");
    return false;
  }
}

export async function asyncDeleteCourseContent(contentId: number | string) {
  try {
    const res = await courseApi.deleteCourseContent(contentId);
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isDeleteContent.set(true);
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal menghapus materi");
    return false;
  }
}

export async function asyncPostCourseContentStatus(
  contentId: number | string,
  status: 0 | 1
) {
  try {
    const res = await courseApi.postCourseContentStatus(contentId, status);
    if (res.status === "success") {
      await showSuccessDialog(res.message);
      isContentStatusChanged.set(true);
      return true;
    }
    await showErrorDialog(res.message);
    return false;
  } catch (err: any) {
    await showErrorDialog(err?.message || "Gagal memperbarui status belajar");
    return false;
  }
}
