<template>
  <aside :class="['sidebar', { collapsed: !isOpen }]">
    <div class="sidebar-header">
      <h1 v-if="isOpen" class="logo">Boxxis Admin</h1>
      <button @click="toggleSidebar" class="toggle-btn">
        <component :is="isOpen ? XIcon : MenuIcon" :size="20" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        active-class="active"
      >
        <component :is="item.icon" :size="20" />
        <span v-if="isOpen">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button @click="handleLogout" class="nav-item logout-btn">
        <LogOutIcon :size="20" />
        <span v-if="isOpen">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  Wallet, 
  Bell, 
  LogOut as LogOutIcon,
  Menu as MenuIcon,
  X as XIcon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const isOpen = ref(true)

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/categories', label: 'Categories', icon: FolderTree },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/carts', label: 'Carts', icon: ShoppingCart },
  { path: '/transactions', label: 'Transactions', icon: CreditCard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/wallets', label: 'Wallets', icon: Wallet },
  { path: '/notifications', label: 'Notifications', icon: Bell }
]

function toggleSidebar() {
  isOpen.value = !isOpen.value
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 256px;
  background: #1f2937;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  height: 100vh;
  position: sticky;
  top: 0;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #374151;
}

.logo {
  font-size: 1.25rem;
  font-weight: bold;
}

.toggle-btn {
  padding: 0.5rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #374151;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  color: white;
  text-decoration: none;
  transition: background 0.2s;
  white-space: nowrap;
}

.nav-item:hover {
  background: #374151;
}

.nav-item.active {
  background: #2563eb;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #374151;
}

.logout-btn {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  color: white;
}
</style>