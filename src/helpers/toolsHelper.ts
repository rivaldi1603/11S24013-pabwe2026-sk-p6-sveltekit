import Swal from "sweetalert2";

export function showSuccessDialog(message: string, title = "Berhasil") {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonColor: "#2563eb",
  });
}

export function showErrorDialog(message: string, title = "Gagal") {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonColor: "#dc2626",
  });
}

export function showWarningDialog(message: string, title = "Peringatan") {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonColor: "#d97706",
  });
}

export async function showConfirmDialog(
  message: string,
  title = "Konfirmasi"
): Promise<boolean> {
  const result = await Swal.fire({
    icon: "question",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#64748b",
  });
  return Boolean(result.isConfirmed);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default {
  showSuccessDialog,
  showErrorDialog,
  showWarningDialog,
  showConfirmDialog,
  formatDate,
};
