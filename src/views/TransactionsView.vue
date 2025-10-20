<template>
  <div class="layout">
    <Sidebar />
    <div class="main-content">
      <Header title="Transactions" />
      <div class="content-area">
        <div class="page-header">
          <h3 class="subtitle">All payment transactions</h3>
          <div class="filter-group">
            <select v-model="filterStatus" class="filter-select">
              <option value="">All Status</option>
              <option value="1">Pending</option>
              <option value="2">Processing</option>
              <option value="3">Paid</option>
              <option value="4">Failed</option>
              <option value="5">Cancelled</option>
              <option value="6">Reversed</option>
            </select>
          </div>
        </div>

        <LoadingSpinner v-if="loading" message="Loading transactions..." />

        <div v-else-if="transactions.length === 0" class="empty-state">
          <p>No transactions found</p>
        </div>

        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in filteredTransactions" :key="transaction.transactionId">
                <td><strong>#{{ transaction.transactionId?.slice(0, 8) }}</strong></td>
                <td>{{ transaction.user?.username || transaction.userId?.slice(0, 8) || 'N/A' }}</td>
                <td>₵{{ transaction.amount?.toFixed(2) || '0.00' }}</td>
                <td>
                  <span class="transaction-type">{{ getTransactionType(transaction.transactionTypes) }}</span>
                </td>
                <td>{{ formatDate(transaction.transactionDate) }}</td>
                <td>
                  <span :class="['badge', getStatusBadgeClass(transaction.transactionStatus)]">
                    {{ getStatusText(transaction.transactionStatus) }}
                  </span>
                </td>
                <td>
                  <button @click="viewTransaction(transaction)" class="btn-icon" title="View Details">
                    <EyeIcon :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Transaction Details Modal -->
        <Modal :isOpen="showDetailsModal" title="Transaction Details" @close="closeDetailsModal">
          <div v-if="selectedTransaction" class="transaction-details">
            <div class="detail-section">
              <h4>Transaction Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Transaction ID:</span>
                  <span class="detail-value">{{ selectedTransaction.transactionId?.slice(0, 16) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">User:</span>
                  <span class="detail-value">{{ selectedTransaction.user?.username || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Amount:</span>
                  <span class="detail-value">₵{{ selectedTransaction.amount?.toFixed(2) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Type:</span>
                  <span class="detail-value">{{ getTransactionType(selectedTransaction.transactionTypes) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">{{ formatDateTime(selectedTransaction.transactionDate) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <span :class="['badge', getStatusBadgeClass(selectedTransaction.transactionStatus)]">
                    {{ getStatusText(selectedTransaction.transactionStatus) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4>Description</h4>
              <p>{{ selectedTransaction.description || 'No description provided' }}</p>
            </div>

            <div v-if="selectedTransaction.order" class="detail-section">
              <h4>Related Order</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Order ID:</span>
                  <span class="detail-value">{{ selectedTransaction.order.checkoutId?.slice(0, 16) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Order Status:</span>
                  <span class="detail-value">{{ getOrderStatusText(selectedTransaction.order.status) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Delivery Location:</span>
                  <span class="detail-value">{{ selectedTransaction.order.deliveryLocation || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4>Additional Details</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">External Reference:</span>
                  <span class="detail-value">{{ selectedTransaction.externalReference || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Source User:</span>
                  <span class="detail-value">{{ selectedTransaction.sourceUserId?.slice(0, 16) || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Destination User:</span>
                  <span class="detail-value">{{ selectedTransaction.destinationUserId?.slice(0, 16) || 'N/A' }}</span>
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
import { Eye as EyeIcon } from 'lucide-vue-next'

const transactions = ref([])
const loading = ref(true)
const filterStatus = ref('')
const showDetailsModal = ref(false)
const selectedTransaction = ref(null)

const filteredTransactions = computed(() => {
  if (!filterStatus.value) return transactions.value
  return transactions.value.filter(t => t.transactionStatus === parseInt(filterStatus.value))
})

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

function formatDateTime(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}

function getStatusBadgeClass(status) {
  switch(status) {
    case 1: return 'badge-warning'  // Pending
    case 2: return 'badge-info'      // Processing
    case 3: return 'badge-success'   // Paid
    case 4:
    case 5:
    case 6: return 'badge-danger'    // Failed/Cancelled/Reversed
    default: return 'badge-secondary'
  }
}

function getStatusText(status) {
  switch(status) {
    case 1: return 'Pending'
    case 2: return 'Processing'
    case 3: return 'Paid'
    case 4: return 'Failed'
    case 5: return 'Cancelled'
    case 6: return 'Reversed'
    default: return 'Unknown'
  }
}

function getTransactionType(type) {
  switch(type) {
    case 1: return 'Credit'
    case 2: return 'Debit'
    case 3: return 'Refund'
    case 4: return 'Purchase'
    case 5: return 'Transfer'
    default: return 'Other'
  }
}

function getOrderStatusText(status) {
  switch(status) {
    case 1: return 'Pending'
    case 2: return 'Processing'
    case 3: return 'Shipped'
    case 4: return 'Delivered'
    case 5: return 'Completed'
    default: return 'Unknown'
  }
}

function viewTransaction(transaction) {
  selectedTransaction.value = transaction
  showDetailsModal.value = true
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedTransaction.value = null
}

onMounted(async () => {
  try {
    const response = await api.transaction.getAll()
    transactions.value = response.data
  } catch (error) {
    console.error('Error fetching transactions:', error)
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

.filter-group {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  min-width: 150px;
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

.transaction-type {
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #374151;
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

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-info {
  background: #dbeafe;
  color: #1e40af;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

.badge-secondary {
  background: #f3f4f6;
  color: #374151;
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

.transaction-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.detail-section p {
  color: #374151;
  line-height: 1.5;
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