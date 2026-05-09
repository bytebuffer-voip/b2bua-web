import { createRouter, createWebHistory } from 'vue-router'
import {useAuthStore} from "@/stores/store.js";

const routes = [
    {
        path: '/',
        component: () => import('@/layouts/LayoutWrapper.vue'),
        children: [
            {
                path: '',
                name: 'Home',
                redirect: { name: 'B2BUA' }
            },
            {
                path: 'b2bua',
                name: 'B2BUA',
                meta: {
                    label: 'B2BUA',
                },
                component: () => import('@/pages/b2bua/B2BUA.vue'),
            },
        ]
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/pages/Login.vue'),
        meta: {
            requiresAuth: false,
        }
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const requiresAuth = to.meta.requiresAuth ?? true;
    const isAuthenticated = !!authStore.getUser.user_id;

    if (!isAuthenticated && requiresAuth) {
        next({ name: 'Login', query: { redirect: to.fullPath } });
        return;
    }

    if (isAuthenticated && to.name === 'Login') {
        next({ name: 'Home' });
        return;
    }

    next();
})

export default router
