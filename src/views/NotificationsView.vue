<template>
  <div class="layout">
    <Sidebar />
    <div class="main-content">
      <Header title="Notifications" />
      <div class="content-area">
        <div class="page-header">
          <h3 class="subtitle">Send notifications to users</h3>
          <div class="header-actions">
            <button 
              v-if="selectedNotifications.length > 0" 
              @click="deleteSelectedNotifications" 
              class="btn-danger"
              :disabled="deleting"
            >
              {{ deleting ? 'Deleting...' : `Delete (${selectedNotifications.length})` }}
            </button>
            <button @click="showModal = true" class="btn-primary">
              <PlusIcon :size="18" />
              Create Notification
            </button>
          </div>
        </div>

        <div class="notifications-list">
          <div v-if="loadingNotifications" class="loading-state">
            Loading notifications...
          </div>
          
          <div v-else-if="notifications.length === 0" class="empty-state">
            <BellIcon :size="48" />
            <p>No notifications sent yet</p>
            <p class="empty-subtitle">Create your first notification to get started</p>
          </div>
          
          <template v-else>
            <div class="select-all-row">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  :checked="notifications.length > 0 && selectedNotifications.length === notifications.length"
                  :indeterminate="selectedNotifications.length > 0 && selectedNotifications.length < notifications.length"
                  @change="toggleSelectAll"
                />
                <span>Select All</span>
              </label>
              <span v-if="selectedNotifications.length > 0" class="selected-info">
                {{ selectedNotifications.length }} selected
              </span>
            </div>
            
            <div v-for="notification in notifications" :key="notification.notificationId" class="notification-card">
              <div class="notification-select">
                <input 
                  type="checkbox" 
                  :value="notification.notificationId"
                  :checked="selectedNotifications.includes(notification.notificationId)"
                  @change="toggleNotification(notification.notificationId)"
                />
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <BellIcon :size="20" />
                  <span class="notification-date">{{ formatDate(notification.dateSent) }}</span>
                </div>
                <p class="notification-message">{{ notification.message }}</p>
                <div class="notification-footer">
                  <div class="user-badge">
                    <span class="user-name">{{ notification.user?.username || 'Unknown User' }}</span>
                    <span class="user-contact">{{ notification.user?.contactNumber || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Create Notification Modal -->
        <Modal :isOpen="showModal" title="Create Notification" @close="closeModal">
          <form @submit.prevent="handleSubmit" class="form">
            <div class="form-group">
              <label>Message *</label>
              <textarea v-model="formData.message" rows="4" required></textarea>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.sendToAll" />
                <span>Send to all users</span>
              </label>
            </div>

            <div v-if="!formData.sendToAll" class="form-group">
              <div class="users-header">
                <label>Select Users *</label>
                <button type="button" @click="selectAllUsers" class="btn-link">
                  {{ formData.selectedUserIds.length === users.length ? 'Deselect All' : 'Select All' }}
                </button>
              </div>
              
              <div class="search-bar">
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search by contact number or username..."
                  class="search-input"
                />
              </div>
              
              <div v-if="loadingUsers" class="loading-text">Loading users...</div>
              
              <div v-else class="users-list">
                <div v-if="filteredUsers.length === 0" class="no-results">
                  No users found matching "{{ searchQuery }}"
                </div>
                <label 
                  v-for="user in filteredUsers" 
                  :key="user.userId" 
                  class="user-item"
                >
                  <input 
                    type="checkbox" 
                    :value="user.userId"
                    :checked="formData.selectedUserIds.includes(user.userId)"
                    @change="toggleUser(user.userId)"
                  />
                  <div class="user-info">
                    <span class="user-name">{{ user.username }}</span>
                    <span class="user-contact">{{ user.contactNumber }}</span>
                  </div>
                </label>
              </div>
              
              <div v-if="!loadingUsers && formData.selectedUserIds.length > 0" class="selected-count">
                {{ formData.selectedUserIds.length }} user(s) selected
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                {{ submitting ? 'Sending...' : 'Send Notification' }}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import Modal from '../components/Modal.vue'
import { Plus as PlusIcon, Bell as BellIcon } from 'lucide-vue-next'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hammerhead-app-68j7i.ondigitalocean.app/api'

const showModal = ref(false)
const submitting = ref(false)
const notifications = ref([])
const users = ref([])
const loadingUsers = ref(false)
const loadingNotifications = ref(false)
const searchQuery = ref('')
const selectedNotifications = ref([])
const deleting = ref(false)

const formData = ref({
  sendToAll: false,
  selectedUserIds: [],
  message: ''
})

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchNotifications()])
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return users.value.filter(user => 
    user.contactNumber?.toLowerCase().includes(query) ||
    user.username?.toLowerCase().includes(query)
  )
})

async function fetchUsers() {
  loadingUsers.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/User/getall`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    users.value = await response.json()
  } catch (error) {
    console.error('Error fetching users:', error)
    alert('Error loading users: ' + error.message)
  } finally {
    loadingUsers.value = false
  }
}

async function fetchNotifications() {
  loadingNotifications.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/Notification/getall`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    notifications.value = await response.json()
  } catch (error) {
    console.error('Error fetching notifications:', error)
    alert('Error loading notifications: ' + error.message)
  } finally {
    loadingNotifications.value = false
  }
}

function toggleNotification(notificationId) {
  const index = selectedNotifications.value.indexOf(notificationId)
  if (index > -1) {
    selectedNotifications.value.splice(index, 1)
  } else {
    selectedNotifications.value.push(notificationId)
  }
}

function toggleSelectAll() {
  if (selectedNotifications.value.length === notifications.value.length) {
    selectedNotifications.value = []
  } else {
    selectedNotifications.value = notifications.value.map(n => n.notificationId)
  }
}

async function deleteSelectedNotifications() {
  if (selectedNotifications.value.length === 0) return
  
  const confirmed = confirm(`Are you sure you want to delete ${selectedNotifications.value.length} notification(s)?`)
  if (!confirmed) return
  
  deleting.value = true
  try {
    const promises = selectedNotifications.value.map(id => 
      fetch(`http://localhost:5251/api/Notification/delete?id=${id}`, {
        method: 'DELETE'
      })
    )
    
    const results = await Promise.all(promises)
    const allSuccessful = results.every(response => response.ok)
    
    if (allSuccessful) {
      alert(`Successfully deleted ${selectedNotifications.value.length} notification(s)!`)
      selectedNotifications.value = []
      await fetchNotifications()
    } else {
      throw new Error('Some notifications failed to delete')
    }
  } catch (error) {
    alert('Error deleting notifications: ' + error.message)
  } finally {
    deleting.value = false
  }
}

function formatDate(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function closeModal() {
  showModal.value = false
  searchQuery.value = ''
  resetForm()
}

function resetForm() {
  formData.value = {
    sendToAll: false,
    selectedUserIds: [],
    message: ''
  }
}

function toggleUser(userId) {
  const index = formData.value.selectedUserIds.indexOf(userId)
  if (index > -1) {
    formData.value.selectedUserIds.splice(index, 1)
  } else {
    formData.value.selectedUserIds.push(userId)
  }
}

function selectAllUsers() {
  if (formData.value.selectedUserIds.length === users.value.length) {
    formData.value.selectedUserIds = []
  } else {
    formData.value.selectedUserIds = users.value.map(user => user.userId)
  }
}

async function handleSubmit() {
  submitting.value = true
  
  try {
    let targetUserIds = []
    
    if (formData.value.sendToAll) {
      targetUserIds = users.value.map(user => user.userId)
    } else {
      if (formData.value.selectedUserIds.length === 0) {
        alert('Please select at least one user')
        submitting.value = false
        return
      }
      targetUserIds = formData.value.selectedUserIds
    }

    // Send notification to each selected user
    const promises = targetUserIds.map(userId => 
      fetch('http://localhost:5251/api/Notification/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          message: formData.value.message
        })
      })
    )

    const results = await Promise.all(promises)
    
    // Check if all requests were successful
    const allSuccessful = results.every(response => response.ok)
    
    if (allSuccessful) {
      alert(`Notification sent successfully to ${targetUserIds.length} user(s)!`)
      closeModal()
      // Refresh notifications list
      await fetchNotifications()
    } else {
      throw new Error('Some notifications failed to send')
    }
    
  } catch (error) {
    alert('Error sending notification: ' + error.message)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-area {
  padding: 1.5rem;
  flex: 1;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.subtitle {
  font-size: 1.125rem;
  color: #6b7280;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.notifications-list {
  display: grid;
  gap: 1rem;
}

.select-all-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.5rem;
}

.selected-info {
  font-size: 0.875rem;
  color: #2563eb;
  font-weight: 500;
}

.notification-card {
  display: flex;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.notification-select {
  display: flex;
  align-items: flex-start;
  padding-top: 0.25rem;
}

.notification-select input[type="checkbox"] {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #6b7280;
}

.notification-date {
  font-size: 0.875rem;
}

.notification-card h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.notification-message {
  color: #111827;
  margin-bottom: 1rem;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.notification-card p {
  color: #6b7280;
  margin-bottom: 1rem;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
}

.user-badge {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-badge .user-name {
  font-weight: 500;
  color: #111827;
}

.user-badge .user-contact {
  font-size: 0.8125rem;
  color: #6b7280;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #6b7280;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-state svg {
  color: #d1d5db;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 400;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.btn-link {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.btn-link:hover {
  text-decoration: underline;
}

.loading-text {
  text-align: center;
  color: #6b7280;
  padding: 1rem;
}

.users-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.user-item:hover {
  background: #f3f4f6;
}

.user-item input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #111827;
}

.user-contact {
  font-size: 0.875rem;
  color: #6b7280;
}

.selected-count {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #2563eb;
  font-weight: 500;
}

.search-bar {
  margin-bottom: 0.75rem;
}

.search-input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.no-results {
  text-align: center;
  color: #6b7280;
  padding: 2rem 1rem;
  font-size: 0.875rem;
}
</style>