import { fetchWithAuth } from "../../../helpers/apiHelper";

export async function postCourse(title: string, description: string) {
  const response = await fetchWithAuth(`${DELCOM_BASEURL}/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description }),
  });
  return response.json();
}

export async function postCourseCover(courseId: number | string, cover: File) {
  const formData = new FormData();
  formData.append("cover", cover);
  const response = await fetchWithAuth(
    `${DELCOM_BASEURL}/courses/${courseId}/cover`,
    {
      method: "POST",
      body: formData,
    }
  );
  return response.json();
}

export async function putCourse(
  courseId: number | string,
  title: string,
  description: string
) {
  const response = await fetchWithAuth(`${DELCOM_BASEURL}/courses/${courseId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description }),
  });
  return response.json();
}

export async function getCourses(isMe?: boolean) {
  const query = isMe ? "?is_me=1" : "";
  const response = await fetchWithAuth(`${DELCOM_BASEURL}/courses${query}`);
  return response.json();
}

export async function getCourseById(courseId: number | string) {
  const response = await fetchWithAuth(`${DELCOM_BASEURL}/courses/${courseId}`);
  return response.json();
}

export async function deleteCourse(courseId: number | string) {
  const response = await fetchWithAuth(`${DELCOM_BASEURL}/courses/${courseId}`, {
    method: "DELETE",
  });
  return response.json();
}

export async function deleteAllCourses() {
  const response = await fetchWithAuth(`${DELCOM_BASEURL}/courses`, {
    method: "DELETE",
  });
  return response.json();
}

export async function postStudentJoin(courseId: number | string) {
  const response = await fetchWithAuth(
    `${DELCOM_BASEURL}/courses/${courseId}/students`,
    {
      method: "POST",
    }
  );
  return response.json();
}

export async function deleteStudentLeave(courseId: number | string) {
  const response = await fetchWithAuth(
    `${DELCOM_BASEURL}/courses/${courseId}/students`,
    {
      method: "DELETE",
    }
  );
  return response.json();
}

export async function putStudentRatings(
  courseId: number | string,
  ratings: number,
  comment = ""
) {
  const response = await fetchWithAuth(
    `${DELCOM_BASEURL}/courses/${courseId}/students/ratings`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratings, comment }),
    }
  );
  return response.json();
}

export async function postCourseContent(
  courseId: number | string,
  title: string,
  youtube: string
) {
  const response = await fetchWithAuth(
    `${DELCOM_BASEURL}/courses/${courseId}/contents`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, youtube }),
    }
  );
  return response.json();
}

export async function putCourseContent(
  contentId: number | string,
  title: string,
  youtube: string
) {
  const response = await fetchWithAuth(
    `${DELCOM_BASEURL}/courses/-/contents/${contentId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, youtube }),
    }
  );
  return response.json();
}

export async function getCourseContentById(contentId: number | string) {
  const response = await fetchWithAuth(
    `${DELCOM_BASEURL}/courses/-/contents/${contentId}`
  );
  return response.json();
}

export async function deleteCourseContent(contentId: number | string) {
  const response = await fetchWithAuth(
    `${DELCOM_BASEURL}/courses/-/contents/${contentId}`,
    {
      method: "DELETE",
    }
  );
  return response.json();
}

export async function postCourseContentStatus(
  contentId: number | string,
  status: 0 | 1
) {
  const response = await fetchWithAuth(
    `${DELCOM_BASEURL}/courses/-/contents/${contentId}/learns`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  );
  return response.json();
}

export default {
  postCourse,
  postCourseCover,
  putCourse,
  getCourses,
  getCourseById,
  deleteCourse,
  deleteAllCourses,
  postStudentJoin,
  deleteStudentLeave,
  putStudentRatings,
  postCourseContent,
  putCourseContent,
  getCourseContentById,
  deleteCourseContent,
  postCourseContentStatus,
};
