<template>
  <div class="home">
    <h1>欢迎回来, {{ user.username }}</h1>  <!-- 显示当前用户的姓名 -->

    <div>
      <button @click="logout">登出</button>
      <button @click="goToEvaluationManagement">评估管理</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { verifyToken } from '../api/token';  // 导入验证api
import { useRouter } from 'vue-router';

export default {
  name: 'Home',
  setup() {
    const user = ref({});  // 用来存储用户信息
    const router = useRouter();  // 用于路由跳转
    const token = localStorage.getItem('access_token');

    // 在组件挂载时获取当前用户信息
    onMounted(async () => {
      if (token) {
        const userData = await verifyToken(token);  // 验证 token 是否有效
        if (userData.valid) {
          user.value = userData;  // 将用户数据存储在响应式变量中
          console.log(user)
        } else {
          // 如果 token 无效，跳转到登录页面
          router.push('/login');
        }
      } else {
        router.push('/login');  // 如果没有 token，跳转到登录页面
      }
    });

    // 登出功能
    const logout = () => {
      localStorage.removeItem('access_token');  // 移除 token
      router.push('/login');  // 跳转到登录页面
    };

    // 跳转到评估管理页面
    const goToEvaluationManagement = () => {
      router.push('/evaluation-management');
    };

    return {
      user,
      logout,
      goToEvaluationManagement
    };
  },
};
</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 50px;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 10px;
}

button:hover {
  background-color: #45a049;
}
</style>
