<script lang="ts">
  import { goto } from "$app/navigation";
  import { useInput } from "../../../hooks/useInput";
  import { asyncSetIsAuthLogin } from "../states/authStore";
  import { asyncSetProfile } from "../../users/states/usersStore";

  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");
  let isLoading = $state(false);

  async function handleSubmit(event: Event) {
    event.preventDefault();
    isLoading = true;
    const ok = await asyncSetIsAuthLogin($email, $password);
    if (ok) {
      await asyncSetProfile();
      goto("/");
    }
    isLoading = false;
  }
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Masuk ke Akun</h1>
    <p class="text-sm text-slate-500 mt-1">Silakan masuk untuk mengakses daftar kursus</p>
  </div>

  <form onsubmit={handleSubmit} class="space-y-4" data-testid="login-form">
    <div>
      <label for="login-email-input" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
      <input
        id="login-email-input"
        name="email"
        type="email"
        autocomplete="email"
        required
        value={$email}
        oninput={onEmailChange}
        placeholder="nama@email.com"
        data-testid="login-email-input"
        class="w-full px-4 py-2.5 border border-slate-300 rounded-xl"
      />
    </div>

    <div>
      <label for="login-password-input" class="block text-sm font-medium text-slate-700 mb-1">Kata Sandi</label>
      <input
        id="login-password-input"
        name="password"
        type="password"
        autocomplete="current-password"
        required
        value={$password}
        oninput={onPasswordChange}
        placeholder="••••••••"
        data-testid="login-password-input"
        class="w-full px-4 py-2.5 border border-slate-300 rounded-xl"
      />
    </div>

    <button
      id="login-submit-button"
      type="submit"
      disabled={isLoading}
      data-testid="login-submit-button"
      class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
    >
      {isLoading ? "Memproses..." : "Masuk"}
    </button>
  </form>

  <p class="text-center text-sm text-slate-600">
    Belum punya akun? <a href="/auth/register" class="text-blue-600 font-semibold hover:underline">Daftar sekarang</a>
  </p>
</div>
