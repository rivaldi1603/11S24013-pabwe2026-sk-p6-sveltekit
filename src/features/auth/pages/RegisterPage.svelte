<script lang="ts">
  import { goto } from "$app/navigation";
  import { useInput } from "../../../hooks/useInput";
  import { asyncSetIsAuthRegister, setIsAuthRegister } from "../states/authStore";

  const [name, onNameChange] = useInput("");
  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");
  let isLoading = $state(false);

  async function handleSubmit(event: Event) {
    event.preventDefault();
    isLoading = true;
    const ok = await asyncSetIsAuthRegister($name, $email, $password);
    isLoading = false;
    if (ok) {
      setIsAuthRegister(false);
      goto("/auth/login");
    }
  }
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Buat Akun Baru</h1>
    <p class="text-sm text-slate-500 mt-1">Daftar untuk mulai membuat dan mengikuti kursus</p>
  </div>

  <form onsubmit={handleSubmit} class="space-y-4" data-testid="register-form">
    <div>
      <label for="register-name-input" class="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
      <input
        id="register-name-input"
        type="text"
        required
        value={$name}
        oninput={onNameChange}
        placeholder="Nama Lengkap"
        data-testid="register-name-input"
        class="w-full px-4 py-2.5 border border-slate-300 rounded-xl"
      />
    </div>

    <div>
      <label for="register-email-input" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
      <input
        id="register-email-input"
        type="email"
        required
        value={$email}
        oninput={onEmailChange}
        placeholder="nama@email.com"
        data-testid="register-email-input"
        class="w-full px-4 py-2.5 border border-slate-300 rounded-xl"
      />
    </div>

    <div>
      <label for="register-password-input" class="block text-sm font-medium text-slate-700 mb-1">Kata Sandi</label>
      <input
        id="register-password-input"
        type="password"
        required
        value={$password}
        oninput={onPasswordChange}
        placeholder="••••••••"
        data-testid="register-password-input"
        class="w-full px-4 py-2.5 border border-slate-300 rounded-xl"
      />
    </div>

    <button
      id="register-submit-button"
      type="submit"
      disabled={isLoading}
      data-testid="register-submit-button"
      class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
    >
      {isLoading ? "Memproses..." : "Daftar"}
    </button>
  </form>

  <p class="text-center text-sm text-slate-600">
    Sudah punya akun? <a href="/auth/login" class="text-blue-600 font-semibold hover:underline">Masuk di sini</a>
  </p>
</div>
