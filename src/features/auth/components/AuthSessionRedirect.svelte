<script lang="ts">
  import { goto } from "$app/navigation";
  import { getAccessToken } from "../../../helpers/apiHelper";
  import { isAuthLogin } from "../states/authStore";
  import { profile } from "../../users/states/usersStore";

  let redirected = $state(false);

  $effect(() => {
    const token = getAccessToken();
    if (!redirected && token && $isAuthLogin && $profile) {
      redirected = true;
      goto("/");
    }
  });
</script>
