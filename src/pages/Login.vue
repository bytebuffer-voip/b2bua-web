<script setup>
import {LockClosedOutline, MailOutline} from "@vicons/ionicons5";
import {inject, onMounted, ref} from "vue";
import accountService from "@/services/AccountService.js";
import {useAuthStore} from "@/stores/store.js";
import {useMessage} from "naive-ui";
import {useRoute, useRouter} from "vue-router";

const loginFormRef = ref(null);
const message = useMessage();
const model = ref({ email: '', password: '' });
const rules = ref({
  email: [{ required: true, message: 'Vui lòng nhập email', trigger: ["input", "blur"] }],
  password: [{ required: true, message: 'Vui lòng nhập mật khẩu', trigger: ["input", "blur"] }]
});
const loadingLogin = ref(false);
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const finishLoading = inject('finishLoading');

onMounted(() => {
  finishLoading();

  if (authStore.getAuthStatus) {
    const redirect = route.query.redirect;
    router.push(redirect || { name: 'Home' });
  }
})

const handleLogin = (e) => {
  e.preventDefault();

  loginFormRef.value?.validate((valid) => {
    if (valid && valid.length > 0) return;

    loadingLogin.value = true;
    accountService.login(model.value.email, model.value.password, null)
        .then((res) => {
          loadingLogin.value = false;
          if (res.data && (res.data.rc === 0 || res.data.rc === 51)) {
            if (res.data.user) authStore.setUser(res.data.user);
            const redirect = route.query.redirect;
            router.push(redirect || { name: 'Home' });
          } else {
            message.error("Thông tin đăng nhập không chính xác");
          }
        })
        .catch((err) => {
          loadingLogin.value = false;
          let msg = "Thông tin đăng nhập không chính xác.";
          if (err.data && err.data.rd) msg = err.data.rd;
          message.error(msg);
        });
  });
};
</script>

<template>
  <div class="login-page">
    <n-card class="login-card">
      <n-form ref="loginFormRef" :model="model" :rules="rules" size="large">
        <div class="text-center login-title-box">
          <h2 style="font-size: 28px; color: var(--color-primary);">Demo Call</h2>
          <h2 style="font-size: 28px">Đăng nhập</h2>
          <p><i>Vui lòng nhập thông tin đăng nhập của bạn</i></p>
        </div>
        <n-form-item path="email" label="Email">
          <n-input
              class="input-icon"
              v-model:value="model.email"
              placeholder="Vui lòng nhập email"
              @keydown.enter.prevent="handleLogin"
          >
            <template #prefix>
              <n-icon :component="MailOutline"/>
            </template>
          </n-input>
        </n-form-item>
        <n-form-item path="password" label="Mật khẩu">
          <n-input
              class="input-icon"
              v-model:value="model.password"
              show-password-on="click"
              type="password"
              placeholder="Vui lòng nhập mật khẩu"
              @keydown.enter.prevent="handleLogin"
          >
            <template #prefix>
              <n-icon :component="LockClosedOutline"/>
            </template>
          </n-input>
        </n-form-item>
        <div>
          <n-button @click="handleLogin" :loading="loadingLogin" size="large" class="btn-login">Đăng nhập</n-button>
        </div>
      </n-form>
    </n-card>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background-main-light);

  .card-no-access {
    width: 600px;
    max-width: 90%;
    margin: auto;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }

  .login-card {
    padding-top: 20px;
    width: 440px;
    max-width: 90%;
    margin: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

    .login-title-box {
      padding-bottom: 20px;
      h2 { margin: 0; font-weight: 600; }
    }

    .btn-login {
      width: 100%;
      height: 40px;
      font-size: 16px;
      color: #fff;
      background-color: var(--color-primary);
      border-radius: 4px;
    }
  }
}
</style>
