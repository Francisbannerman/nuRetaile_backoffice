<template>
  <div class="layout">
    <Sidebar />
    <div class="main-content">
      <Header title="Wallets" />
      <div class="content-area">
        <div class="page-header">
          <h3 class="subtitle">User wallet management</h3>
          <div class="stats-summary">
            <div class="stat-item">
              <span class="stat-label">Total Wallets:</span>
              <span class="stat-value">{{ wallets.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Balance:</span>
              <span class="stat-value">₵{{ totalBalance.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <LoadingSpinner v-if="loading" message="Loading wallets..." />

        <div v-else-if="wallets.length === 0" class="empty-state">
          <p>No wallets found</p>
        </div>

        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Wallet ID</th>
                <th>Account Number</th>
                <th>User</th>
                <th>Wallet Name</th>
                <th>Balance</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="wallet in wallets" :key="wallet.walletId">
                <td><strong>{{ wallet.walletId?.slice(0, 8) }}</strong></td>
                <td><code>{{ wallet.accountNumber }}</code></td>
                <td>{{ wallet.user?.username || wallet.userId?.slice(0, 8) || 'N/A' }}</td>
                <td>{{ wallet.walletName || 'N/A' }}</td>
                <td>
                  <span class="balance-amount">
                    ₵{{ wallet.systemBalance?.toFixed(2) || '0.00' }}
                  </span>
                </td>
                <td>{{ formatDate(wallet.createdAt) }}</td>
                <td>
                  <button @click="viewWallet(wallet)" class="btn-icon" title="View Details">
                    <EyeIcon :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Wallet Details Modal -->
        <Modal :isOpen="showDetailsModal" title="Wallet Details" @close="closeDetailsModal">
          <div v-if="selectedWallet" class="wallet-details">
            <div class="balance-card">
              <div class="balance-header">
                <WalletIcon :size="32" />
                <span>Current Balance</span>
              </div>
              <div class="balance-value">
                ₵{{ selectedWallet.systemBalance?.toFixed(2) || '0.00' }}
              </div>
              <div class="balance-currency">
                GHS (Ghana Cedis)
              </div>
            </div>

            <div class="detail-section">
              <h4>Wallet Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Wallet ID:</span>
                  <span class="detail-value">{{ selectedWallet.walletId?.slice(0, 16) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Account Number:</span>
                  <span class="detail-value"><code>{{ selectedWallet.accountNumber }}</code></span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Wallet Name:</span>
                  <span class="detail-value">{{ selectedWallet.walletName }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Description:</span>
                  <span class="detail-value">{{ selectedWallet.description || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Created At:</span>
                  <span class="detail-value">{{ formatDateTime(selectedWallet.createdAt) }}</span>
                </div>
              </div>
            </div>

            <div v-if="selectedWallet.user" class="detail-section">
              <h4>User Information</h4>
              <div class="user-info">
                <div class="user-avatar">
                  {{ getUserInitials(selectedWallet.user) }}
                </div>
                <div class="user-details">
                  <h5>{{ selectedWallet.user.username || 'Unknown User' }}</h5>
                  <p>{{ selectedWallet.user.contactNumber || 'No phone' }}</p>
                  <p>{{ selectedWallet.user.email || 'No email' }}</p>
                </div>
              </div>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Referral Code:</span>
                  <span class="detail-value"><code>{{ selectedWallet.user.referralCode }}</code></span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Earned Commission:</span>
                  <span class="detail-value">₵{{ selectedWallet.user.earnedCommission?.toFixed(2) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Monthly Spent:</span>
                  <span class="detail-value">₵{{ selectedWallet.user.monthlyAmountSpent?.toFixed(2) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Account Status:</span>
                  <span :class="['badge', selectedWallet.user.isActive ? 'badge-success' : 'badge-danger']">
                    {{ selectedWallet.user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeDetailsModal" class="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import Modal from '../components/Modal.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { Eye as EyeIcon, Wallet as WalletIcon } from 'lucide-vue-next'

const wallets = ref([])
const loading = ref(true)
const showDetailsModal = ref(false)
const selectedWallet = ref(null)

const totalBalance = computed(() => {
  return wallets.value.reduce((sum, wallet) => sum + (wallet.systemBalance || 0), 0)
})

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

function formatDateTime(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}

function getUserInitials(user) {
  const name = user?.username || 'U'
  return name.slice(0, 2).toUpperCase()
}

function viewWallet(wallet) {
  selectedWallet.value = wallet
  showDetailsModal.value = true
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedWallet.value = null
}

onMounted(async () => {
  try {
    const response = await api.wallet.getAll()
    wallets.value = response.data
  } catch (error) {
    console.error('Error fetching wallets:', error)
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.subtitle {
  font-size: 1.125rem;
  color: #6b7280;
}

.stats-summary {
  display: flex;
  gap: 2rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 0.5rem;
  color: #6b7280;
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

code {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.balance-amount {
  font-weight: 600;
  color: #10b981;
  font-size: 1.125rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

.btn-icon {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  color: #2563eb;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #eff6ff;
}

.wallet-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 0.75rem;
  text-align: center;
}

.balance-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.balance-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.balance-currency {
  opacity: 0.9;
  font-size: 1.125rem;
}

.detail-section {
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #374151;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.detail-value {
  font-weight: 500;
  color: #1f2937;
}

.user-info {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.user-avatar {
  width: 64px;
  height: 64px;
  background: #2563eb;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.user-details h5 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  color: #1f2937;
}

.user-details p {
  margin: 0.125rem 0;
  font-size: 0.875rem;
  color: #6b7280;
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
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
</style>