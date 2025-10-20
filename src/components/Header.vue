<template>
  <header class="header">
    <h2 class="page-title">{{ title }}</h2>
    <div class="header-actions">
      <div class="search-box">
        <SearchIcon :size="20" class="search-icon" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search..."
          class="search-input"
        />
      </div>
      
      <div class="user-menu">
        <button @click="toggleDropdown" class="user-avatar">
          {{ initials }}
        </button>
        
        <div v-if="showDropdown" class="dropdown-menu">
          <div class="user-info">
            <p class="user-name">{{ userName }}</p>
            <p class="user-email">{{ userEmail }}</p>
          </div>
          <div class="dropdown-divider"></div>
          <button @click="handleLogout" class="logout-button">
            <LogOutIcon :size="18" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Search as SearchIcon, LogOut as LogOutIcon } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

defineProps({
  title: {
    type: String,
    required: true
  }
})

const router = useRouter()
const authStore = useAuthStore()
const searchQuery = ref('')
const showDropdown = ref(false)

const initials = computed(() => {
  if (authStore.user?.name) {
    return authStore.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
  }
  if (authStore.user?.email) {
    return authStore.user.email[0].toUpperCase()
  }
  return 'A'
})

const userName = computed(() => {
  return authStore.user?.name || 'Staff User'
})

const userEmail = computed(() => {
  return authStore.user?.email || 'staff@nuretail.com'
})

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    authStore.logout()
    router.push('/login')
  }
}

function closeDropdown(event) {
  if (!event.target.closest('.user-menu')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.header {
  background: white;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  text-transform: capitalize;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  padding: 0.5rem 0.5rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  width: 300px;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.user-menu {
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  padding: 0.5rem;
  z-index: 50;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-info {
  padding: 0.75rem;
}

.user-name {
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
  font-size: 0.9375rem;
}

.user-email {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.5rem 0;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  background: none;
  border: none;
  border-radius: 0.375rem;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-button:hover {
  background: #fee2e2;
}
</style>