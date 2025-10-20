<template>
  <div class="layout">
    <Sidebar />
    <div class="main-content">
      <Header title="Users" />
      <div class="content-area">
        <LoadingSpinner v-if="loading" message="Loading users..." />

        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Earned Commission</th>
                <th>Monthly Amount Spent</th>
                <th>Joined Date</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.userId }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.contactNumber || 'N/A' }}</td>
                <td>GH₵ {{ user.earnedCommission || '0.00' }}</td>
                <td>GH₵ {{ user.monthlyAmountSpent || '0.00' }}</td>
                <td>{{ formatDate(user.dateJoined) }}</td>
                <td>{{ formatDate(user.lastSeen) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const users = ref([])
const loading = ref(true)

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  try {
    const response = await api.user.getAll()
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
})
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

.table-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.btn-icon {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  color: #2563eb;
}

.btn-icon:hover {
  background: #eff6ff;
}
</style>
