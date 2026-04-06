import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authAPI } from "@/services/api";

export const useAuthStore = defineStore("auth", () => {
	const user = ref(null);
	const token = ref(null);

	const isAuthenticated = computed(() => !!token.value);
	const isAdmin = computed(() => hasRole("Admin"));
	const isInstructor = computed(
		() => hasRole("Instructor") || hasRole("Admin"),
	);

	const canManage = computed(() => {
		return (
			isAdmin.value ||
			isInstructor.value ||
			hasAnyPermission(
				"course.view",
				"course.create",
				"course.edit",
				"user.manage",
				"role.manage",
				"group.manage",
				"report.view",
				"enrollment.approve",
				"certificate.view",
				"certificate.manage",
			)
		);
	});

	function hasRole(roleName) {
		if (!user.value) return false;
		const roles = user.value.roles || user.value.Roles || [];
		const primaryRole = user.value.role || user.value.Role;

		const normalizedRoles = roles.map((r) => r?.toLowerCase());
		const normalizedPrimary = primaryRole?.toLowerCase();
		const target = roleName.toLowerCase();

		if (target === "admin" || target === "quản trị viên") {
			return (
				normalizedRoles.includes("admin") ||
				normalizedRoles.includes("quản trị viên") ||
				normalizedPrimary === "admin" ||
				normalizedPrimary === "quản trị viên"
			);
		}

		if (target === "instructor" || target === "giảng viên") {
			return (
				normalizedRoles.includes("instructor") ||
				normalizedRoles.includes("giảng viên") ||
				normalizedPrimary === "instructor" ||
				normalizedPrimary === "giảng viên"
			);
		}

		return normalizedRoles.includes(target) || normalizedPrimary === target;
	}

	function hasPermission(permCode) {
		if (!user.value) return false;
		const perms = user.value.permissions || user.value.Permissions || [];
		return perms.includes(permCode);
	}

	function hasAnyPermission(...codes) {
		if (!user.value) return false;
		return codes.some((c) => hasPermission(c));
	}

	function setCookie(name, value, days) {
		let expires = "";
		if (days) {
			const date = new Date();
			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie =
			name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
	}

	function getCookie(name) {
		const nameEQ = name + "=";
		const ca = document.cookie.split(";");
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) === " ") c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
	}

	function eraseCookie(name) {
		document.cookie =
			name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
	}

	function initAuth() {
		let savedToken = getCookie("lms_token");
		let savedUser = getCookie("lms_user");

		if (!savedToken) {
			savedToken = sessionStorage.getItem("lms_token");
			savedUser = sessionStorage.getItem("lms_user");
		}

		if (
			savedToken &&
			savedUser &&
			savedUser !== "undefined" &&
			savedUser !== "null"
		) {
			try {
				token.value = savedToken;
				const decoded = savedUser.includes("%")
					? decodeURIComponent(savedUser)
					: savedUser;
				user.value = JSON.parse(decoded);
			} catch {
				logout();
			}
		}
	}

	async function login(email, password, remember = false) {
		const { data } = await authAPI.login({ email, password });
		token.value = data.token;
		user.value = {
			id: data.id,
			fullName: data.fullName,
			email: data.email,
			role: data.role || data.Role,
			avatar: data.avatar || data.Avatar,
			roles: data.roles || data.Roles || [data.role || data.Role],
			permissions: data.permissions || data.Permissions || [],
		};

		const userStr = encodeURIComponent(JSON.stringify(user.value));

		if (remember) {
			setCookie("lms_token", data.token, 7);
			setCookie("lms_user", userStr, 7);
			setCookie("lms_remembered_email", email, 7);
		} else {
			sessionStorage.setItem("lms_token", data.token);
			sessionStorage.setItem("lms_user", userStr);
			eraseCookie("lms_token");
			eraseCookie("lms_user");
			eraseCookie("lms_remembered_email");
		}

		return data;
	}

	async function register(fullName, email, password, role, remember = false) {
		const { data } = await authAPI.register({
			fullName,
			email,
			password,
			role,
		});
		token.value = data.token;
		user.value = {
			id: data.id,
			fullName: data.fullName,
			email: data.email,
			role: data.role || data.Role,
			avatar: data.avatar || data.Avatar,
			roles: data.roles || data.Roles || [data.role || data.Role],
			permissions: data.permissions || data.Permissions || [],
		};

		const userStr = encodeURIComponent(JSON.stringify(user.value));

		if (remember) {
			setCookie("lms_token", data.token, 7);
			setCookie("lms_user", userStr, 7);
		} else {
			sessionStorage.setItem("lms_token", data.token);
			sessionStorage.setItem("lms_user", userStr);
		}

		return data;
	}

	function updateProfileData(profileData) {
		if (!user.value) return;
		if (profileData.fullName) user.value.fullName = profileData.fullName;
		if (profileData.email) user.value.email = profileData.email;
		if (profileData.avatar !== undefined) user.value.avatar = profileData.avatar;

		const userStr = encodeURIComponent(JSON.stringify(user.value));
		if (getCookie("lms_user")) {
			setCookie("lms_user", userStr, 7);
		} else {
			sessionStorage.setItem("lms_user", userStr);
		}
	}

	function logout() {
		token.value = null;
		user.value = null;
		sessionStorage.removeItem("lms_token");
		sessionStorage.removeItem("lms_user");
		eraseCookie("lms_token");
		eraseCookie("lms_user");
	}

	const avatarUpdateTime = ref(Date.now());

	function triggerAvatarRefresh() {
		avatarUpdateTime.value = Date.now();
	}

	return {
		user,
		token,
		isAuthenticated,
		isAdmin,
		isInstructor,
		canManage,
		initAuth,
		login,
		register,
		logout,
		hasRole,
		hasPermission,
		hasAnyPermission,
		updateProfileData,
		avatarUpdateTime,
		triggerAvatarRefresh,
	};
});
