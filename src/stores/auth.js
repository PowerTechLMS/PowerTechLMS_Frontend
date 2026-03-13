import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const token = ref(null)

    const isAuthenticated = computed(() => !!token.value)
    const isAdmin = computed(() => hasRole('Admin'))
    const isInstructor = computed(() => hasRole('Instructor') || hasRole('Admin'))

    function hasRole(roleName) {
        if (!user.value) return false
        const roles = user.value.roles || user.value.Roles || []
        const primaryRole = user.value.role || user.value.Role
        return roles.includes(roleName) || primaryRole === roleName
    }

    function hasPermission(permCode) {
        if (!user.value) return false
        const perms = user.value.permissions || user.value.Permissions || []
        return perms.includes(permCode)
    }

    function hasAnyPermission(...codes) {
        return codes.some(c => hasPermission(c))
    }

    function initAuth() {
        const savedToken = localStorage.getItem('lms_token')
        const savedUser = localStorage.getItem('lms_user')
        if (savedToken && savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
            try {
                token.value = savedToken
                user.value = JSON.parse(savedUser)
            } catch (e) {
                console.error("Auth init failed, clear storage", e)
                logout()
            }
        }
    }

    async function login(email, password) {
        const { data } = await authAPI.login({ email, password })
        token.value = data.token
        user.value = {
            id: data.id,
            fullName: data.fullName,
            email: data.email,
            role: data.role || data.Role,
            avatar: data.avatar || data.Avatar,
            roles: data.roles || data.Roles || [data.role || data.Role],
            permissions: data.permissions || data.Permissions || []
        }
        localStorage.setItem('lms_token', data.token)
        localStorage.setItem('lms_user', JSON.stringify(user.value))
        return data
    }

    async function register(fullName, email, password, role) {
        const { data } = await authAPI.register({ fullName, email, password, role })
        token.value = data.token
        user.value = {
            id: data.id,
            fullName: data.fullName,
            email: data.email,
            role: data.role || data.Role,
            avatar: data.avatar || data.Avatar,
            roles: data.roles || data.Roles || [data.role || data.Role],
            permissions: data.permissions || data.Permissions || []
        }
        localStorage.setItem('lms_token', data.token)
        localStorage.setItem('lms_user', JSON.stringify(user.value))
        return data
    }

    function updateProfileData(profileData) {
        if (!user.value) return;
        user.value.fullName = profileData.fullName;
        user.value.email = profileData.email;
        user.value.avatar = profileData.avatar;
        localStorage.setItem('lms_user', JSON.stringify(user.value))
    }

    function logout() {
        token.value = null
        user.value = null
        localStorage.removeItem('lms_token')
        localStorage.removeItem('lms_user')
    }

    const avatarUpdateTime = ref(Date.now())

    function triggerAvatarRefresh() {
        avatarUpdateTime.value = Date.now()
    }

    return {
        user, token, isAuthenticated, isAdmin, isInstructor,
        initAuth, login, register, logout, hasRole, hasPermission, hasAnyPermission,
        updateProfileData, avatarUpdateTime, triggerAvatarRefresh
    }
})
