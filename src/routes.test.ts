import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import * as layoutConfig from "./routes/+layout";
import RootLayout from "./routes/+layout.svelte";
import RootPage from "./routes/+page.svelte";
import RootError from "./routes/+error.svelte";
import AuthLayoutRoute from "./routes/auth/+layout.svelte";
import AuthLoginRoute from "./routes/auth/login/+page.svelte";
import AuthRegisterRoute from "./routes/auth/register/+page.svelte";
import CourseDetailRoute from "./routes/courses/[courseId]/+page.svelte";
import CourseContentRoute from "./routes/courses/[courseId]/contents/[contentId]/+page.svelte";
import CoursesRoute from "./routes/courses/+page.svelte";
import UsersRoute from "./routes/users/+page.svelte";
import ProfileRoute from "./routes/profile/+page.svelte";
import { mockPage } from "./setupTests";
import { courseContent } from "./features/courses/states/coursesStore";

describe("SvelteKit Routes", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    courseContent.set(null);
  });

  it("checks +layout.ts ssr and prerender flags", () => {
    expect(layoutConfig.ssr).toBe(false);
    expect(layoutConfig.prerender).toBe(false);
  });

  it("renders RootLayout for auth route and non-auth route", () => {
    mockPage.url = new URL("http://localhost:3005/auth/login");
    const { container: c1 } = render(RootLayout, {
      props: { children: () => null },
    });
    expect(c1).toBeInTheDocument();

    mockPage.url = new URL("http://localhost:3005/");
    const { container: c2 } = render(RootLayout, {
      props: { children: () => null },
    });
    expect(c2).toBeInTheDocument();
  });

  it("renders all page routes successfully and evaluates route parameters", async () => {
    render(RootPage);
    render(RootError);
    render(AuthLayoutRoute, { props: { children: () => null } });
    render(AuthLoginRoute);
    render(AuthRegisterRoute);
    render(CourseDetailRoute);

    // Set courseContent so ContentPage renders {:else} and evaluates courseId prop
    courseContent.set({
      id: 10,
      course_id: 1,
      title: "Title Content",
      youtube: "https://youtu.be/123",
      my_status_finished: 0,
    });
    render(CourseContentRoute);
    await tick();

    render(CoursesRoute);
    render(UsersRoute);
    render(ProfileRoute);
  });
});
