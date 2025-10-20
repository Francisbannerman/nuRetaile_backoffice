<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-section">
        <div class="logo">
          <ShoppingBagIcon :size="48" />
        </div>
        <h1 class="brand-name">Nu Retail</h1>
        <p class="tagline">Groceries & Everyday Essentials</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <h2 class="form-title">Staff Login</h2>
        
        <div v-if="errorMessage" class="error-alert">
          <AlertCircleIcon :size="20" />
          <span>{{ errorMessage }}</span>
        </div>

        <div class="form-group">
          <label for="email">Email or Username</label>
          <div class="input-wrapper">
            <MailIcon :size="20" class="input-icon" />
            <input
              id="email"
              v-model="formData.email"
              type="text"
              placeholder="Enter your email or username"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <LockIcon :size="20" class="input-icon" />
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              required
              :disabled="loading"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="toggle-password"
              :disabled="loading"
            >
              <EyeIcon v-if="!showPassword" :size="20" />
              <EyeOffIcon v-else :size="20" />
            </button>
          </div>
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          <span v-if="!loading">Login</span>
          <span v-else class="loading-text">
            <LoaderIcon :size="20" class="spinner" />
            Logging in...
          </span>
        </button>
      </form>

      <div class="footer">
        <p>&copy; 2025 Nu Retail. All rights reserved.</p>
      </div>
    </div>

    <div class="background-pattern"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { 
  ShoppingBag as ShoppingBagIcon, 
  Mail as MailIcon, 
  Lock as LockIcon, 
  Eye as EyeIcon, 
  EyeOff as EyeOffIcon,
  AlertCircle as AlertCircleIcon,
  Loader as LoaderIcon
} from 'lucide-vue-next'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hammerhead-app-68j7i.ondigitalocean.app/api'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(
      `${API_BASE_URL}/Staff/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.value.email,
          password: formData.value.password
        })
      }
    )

    if (response.ok) {
      const result = await response.json()
      
      if (result === true) {
        authStore.login(
          { email: formData.value.email },
          'auth-token-' + Date.now()
        )
        
        router.push('/dashboard')
      } else {
        errorMessage.value = 'Invalid credentials. Please try again.'
      }
    } else {
      const errorText = await response.text()
      errorMessage.value = errorText || 'Login failed. Please check your credentials.'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = 'Unable to connect to server. Please try again later.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.background-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.login-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 440px;
  padding: 3rem 2.5rem;
  position: relative;
  z-index: 1;
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1rem;
  color: white;
  margin-bottom: 1rem;
}

.brand-name {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.tagline {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
}

.login-form {
  margin-top: 2rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 0.5rem;
  color: #991b1b;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
  pointer-events: none;
}

.form-group input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 1.5px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  transition: all 0.2s;
  background: white;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.toggle-password:hover:not(:disabled) {
  color: #667eea;
}

.toggle-password:disabled {
  cursor: not-allowed;
}

.login-button {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.footer p {
  font-size: 0.8125rem;
  color: #9ca3af;
  margin: 0;
}

@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
  }

  .brand-name {
    font-size: 1.75rem;
  }

  .logo {
    width: 70px;
    height: 70px;
  }
}
</style>