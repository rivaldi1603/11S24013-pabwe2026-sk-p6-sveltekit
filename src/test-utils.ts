import { render } from "@testing-library/svelte";
import type { Component } from "svelte";

export function renderWithProviders(
  component: Component<any>,
  options: Record<string, any> = {}
) {
  return render(component, options);
}
