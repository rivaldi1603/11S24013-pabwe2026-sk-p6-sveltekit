import { writable } from "svelte/store";

export function useInput(initialValue = "") {
  const value = writable<string>(initialValue);

  function handleValueChange(event: Event) {
    const target = event.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
      | null;
    value.set(target ? target.value : "");
  }

  function setValue(newValue: string) {
    value.set(newValue);
  }

  return [value, handleValueChange, setValue] as const;
}

export default useInput;
