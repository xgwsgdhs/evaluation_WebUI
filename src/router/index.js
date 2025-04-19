import { createRouter, createWebHashHistory } from 'vue-router'
import { verifyToken } from '../api/token';  // 导入验证方法
import Home from '../pages/HomePage.vue'
import Login from '../pages/LoginPage.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true },  // 添加需要认证的标记
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresUnauth: true }  // 添加 meta 标记，表示不允许已登录用户访问
    },
];

const router = createRouter({
    history: createWebHashHistory (),
    routes
})

// 路由守卫：验证 token 是否有效
router.beforeEach(async (to, from, next) => {
    const token = localStorage.getItem('access_token');  // 获取 token

    const isValid = await verifyToken(token); // 返回用户信息
    if (isValid && to.path === '/login') {
        next('/');  // 如果已登录并访问了登录页面，重定向到主页
        return;
    }
    // 如果访问的是需要认证的路由
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (token) {
            // 调用 api 文件中的 verifyToken 方法
            if (isValid) {
                next(); // 认证通过，继续访问目标路由
            } else {
                next('/login');  // 如果 token 无效，重定向到登录页面
            }
        } else {
            next('/login');  // 如果没有 token，跳转到登录页面
        }
    } else {
        next();  // 如果不需要认证，继续访问目标页面
    }
});

export default router
