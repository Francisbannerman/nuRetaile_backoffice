<template>
  <div class="layout">
    <Sidebar />
    <div class="main-content">
      <Header title="Active Carts" />
      <div class="content-area">
        <LoadingSpinner v-if="loading" message="Loading carts..." />

        <div v-else-if="carts.length === 0" class="empty-state">
          <p>No active carts found</p>
        </div>

        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Cart ID</th>
                <th>User</th>
                <th>Items</th>
                <th>Total Value</th>
                <th>Last Updated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cart in carts" :key="cart.cartId">
                <td><strong>#{{ cart.cartId?.slice(0, 8) }}</strong></td>
                <td>{{ cart.user?.username || cart.userId?.slice(0, 8) || 'N/A' }}</td>
                <td>{{ cart.cartProducts?.length || 0 }} items</td>
                <td>₵{{ cart.totalCartAmount?.toFixed(2) || '0.00' }}</td>
                <td>{{ formatDate(cart.lastUpdated) }}</td>
                <td>
                  <span :class="['badge', cart.isCheckout ? 'badge-success' : 'badge-warning']">
                    {{ cart.isCheckout ? 'Checked Out' : 'Active' }}
                  </span>
                </td>
                <td>
                  <button @click="viewCart(cart)" class="btn-icon" title="View Details">
                    <EyeIcon :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cart Details Modal -->
        <Modal :isOpen="showDetailsModal" title="Cart Details" @close="closeDetailsModal">
          <div v-if="selectedCart" class="cart-details">
            <div class="detail-section">
              <h4>Cart Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Cart ID:</span>
                  <span class="detail-value">{{ selectedCart.cartId?.slice(0, 16) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">User:</span>
                  <span class="detail-value">{{ selectedCart.user?.username || 'Guest' }} - {{ selectedCart.user.contactNumber }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Last Updated:</span>
                  <span class="detail-value">{{ formatDate(selectedCart.lastUpdated) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <span :class="['badge', selectedCart.isCheckout ? 'badge-success' : 'badge-warning']">
                    {{ selectedCart.isCheckout ? 'Checked Out' : 'Active' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4>Cart Items</h4>
              <div v-if="selectedCart.cartProducts && selectedCart.cartProducts.length > 0" class="cart-items">
                <div v-for="item in selectedCart.cartProducts" :key="item.cartProductId" class="cart-item">
                  <img 
                    :src="item.product?.defaultImage || '/placeholder.png'" 
                    :alt="item.product?.productName"
                    class="item-image"
                  />
                  <div class="item-details">
                    <p class="item-name">{{ item.product?.productName || 'Product' }}</p>
                    <p class="item-meta">Qty: {{ item.quantity }} × ₵{{ item.amount.toFixed(2) }}</p>
                  </div>
                  <div class="item-total">
                    ₵{{ (item.quantity * item.amount).toFixed(2) }}
                  </div>
                </div>
              </div>
              <div v-else class="empty-items">
                <p>No items in this cart</p>
              </div>

              <div class="cart-summary">
                <div class="summary-row total">
                  <strong>Total:</strong>
                  <strong>₵{{ selectedCart.totalCartAmount?.toFixed(2) || '0.00' }}</strong>
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
import { ref, onMounted } from 'vue'
import api from '../services/api'
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import Modal from '../components/Modal.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { Eye as EyeIcon } from 'lucide-vue-next'

const carts = ref([])
const loading = ref(true)
const showDetailsModal = ref(false)
const selectedCart = ref(null)

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}

function viewCart(cart) {
  selectedCart.value = cart
  showDetailsModal.value = true
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedCart.value = null
}

onMounted(async () => {
  try {
    const response = await api.cart.getAllCarts()
    carts.value = response.data
  } catch (error) {
    console.error('Error fetching carts:', error)
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

.cart-details {
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

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  align-items: center;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.375rem;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
}

.item-name {
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.item-meta {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.item-total {
  font-weight: 600;
  color: #1f2937;
}

.empty-items {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.cart-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.summary-row.total {
  font-size: 1.125rem;
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