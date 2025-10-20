<template>
  <div class="layout">
    <Sidebar />
    <div class="main-content">
      <Header title="Orders" />
      <div class="content-area">
        <div class="tabs">
          <button 
            @click="activeTab = 'all'" 
            :class="['tab', { active: activeTab === 'all' }]"
          >
            All Orders
          </button>
          <button 
            @click="activeTab = 'ongoing'" 
            :class="['tab', { active: activeTab === 'ongoing' }]"
          >
            Ongoing ({{ ongoingOrders.length }})
          </button>
          <button 
            @click="activeTab = 'completed'" 
            :class="['tab', { active: activeTab === 'completed' }]"
          >
            Completed ({{ completedOrders.length }})
          </button>
        </div>

        <LoadingSpinner v-if="loading" message="Loading orders..." />

        <div v-else-if="displayedOrders.length === 0" class="empty-state">
          <p>No orders found</p>
        </div>

        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in displayedOrders" :key="order.checkoutId">
                <td><strong>#{{ order.checkoutId?.slice(0, 8) || 'N/A' }}</strong></td>
                <td>{{ getCustomerName(order) }}</td>
                <td>{{ order.deliveryLocation || 'N/A' }}</td>
                <td>{{ formatDate(order.dateOfCheckout) }}</td>
                <td>₵{{ getOrderTotal(order) }}</td>
                <td>
                  <span :class="['badge', getBadgeClass(order.status)]">
                    {{ getStatusText(order.status) }}
                  </span>
                </td>
                <td>
                  <button @click="viewOrder(order)" class="btn-icon" title="View Details">
                    <EyeIcon :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- View Order Modal -->
        <Modal :isOpen="showViewModal" title="Order Details" @close="closeViewModal">
          <div v-if="viewingOrder" class="order-view">
            <div class="view-section">
              <h4>Order Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Order ID:</span>
                  <span class="detail-value">#{{ viewingOrder.checkoutId?.slice(0, 16) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Customer:</span>
                  <span class="detail-value">{{ getCustomerName(viewingOrder) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Order Date:</span>
                  <span class="detail-value">{{ formatDateTime(viewingOrder.dateOfCheckout) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Delivery Date:</span>
                  <span class="detail-value">{{ formatDateTime(viewingOrder.deliveryDate) }}</span>
                </div>
              </div>
            </div>

            <div class="view-section">
              <h4>Delivery Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Location:</span>
                  <span class="detail-value">{{ viewingOrder.deliveryLocation || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">GPS Location:</span>
                  <span class="detail-value">{{ viewingOrder.gpsLocation || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Alternate Number:</span>
                  <span class="detail-value">{{ viewingOrder.alternateNumber || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Delivery Note:</span>
                  <span class="detail-value">{{ viewingOrder.deliveryNote || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <div v-if="viewingOrder.assignedRidersName" class="view-section">
              <h4>Rider Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Rider Name:</span>
                  <span class="detail-value">{{ viewingOrder.assignedRidersName }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Rider Number:</span>
                  <span class="detail-value">{{ viewingOrder.assignedRidersNumber }}</span>
                </div>
              </div>
            </div>

            <div v-if="viewingOrder.cart" class="view-section">
              <h4>Order Items</h4>
              <div class="cart-products">
                <div v-for="item in viewingOrder.cart.cartProducts" :key="item.cartProductId" class="cart-item">
                  <div class="item-details">
                    <img 
                      :src="item.product?.defaultImage || '/placeholder.png'" 
                      :alt="item.product?.productName"
                      class="item-image"
                    />
                    <div>
                      <p class="item-name">{{ item.product?.productName || 'Product' }}</p>
                      <p class="item-quantity">Qty: {{ item.quantity }} × ₵{{ item.amount.toFixed(2) }}</p>
                    </div>
                  </div>
                  <div class="item-total">
                    ₵{{ (item.quantity * item.amount).toFixed(2) }}
                  </div>
                </div>
              </div>
              <div class="order-total">
                <strong>Total:</strong>
                <strong>₵{{ getOrderTotal(viewingOrder) }}</strong>
              </div>
            </div>

            <div class="view-section">
              <h4>Payment Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Payment Method:</span>
                  <span class="detail-value">{{ viewingOrder.paymentMethod || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Transaction ID:</span>
                  <span class="detail-value">{{ viewingOrder.transactionId?.slice(0, 16) || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Total Amount:</span>
                  <span class="detail-value">₵{{ getOrderTotal(viewingOrder) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Order Status:</span>
                  <span :class="['badge', getBadgeClass(viewingOrder.status)]">
                    {{ getStatusText(viewingOrder.status) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeViewModal" class="btn-secondary">
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
import { useOrdersStore } from '../stores/orders'
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import Modal from '../components/Modal.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { Eye as EyeIcon } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const ordersStore = useOrdersStore()
const activeTab = ref('all')
const showViewModal = ref(false)
const viewingOrder = ref(null)
const router = useRouter()

const loading = computed(() => ordersStore.loading)
const ongoingOrders = computed(() => ordersStore.ongoingOrders || [])
const completedOrders = computed(() => ordersStore.completedOrders || [])

const displayedOrders = computed(() => {
  if (activeTab.value === 'ongoing') {
    return ongoingOrders.value
  } else if (activeTab.value === 'completed') {
    return completedOrders.value
  }
  return [...ongoingOrders.value, ...completedOrders.value]
})

function getCustomerName(order) {
  return order.customer?.name || order.customer?.email || order.customerId?.slice(0, 8) || 'N/A'
}

function getOrderTotal(order) {
  return order.cart?.totalCartAmount?.toFixed(2) || '0.00'
}

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

function formatDateTime(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}

function getBadgeClass(status) {
  // OrderStatus: Pending = 1, Processing = 2, Shipped = 3, Delivered = 4, Completed = 5
  switch(status) {
    case 1: return 'badge-warning'
    case 2: return 'badge-info'
    case 3: return 'badge-primary'
    case 4: 
    case 5: return 'badge-success'
    default: return 'badge-secondary'
  }
}

function getStatusText(status) {
  switch(status) {
    case 1: return 'Pending'
    case 2: return 'Processing'
    case 3: return 'Shipped'
    case 4: return 'Delivered'
    case 5: return 'Completed'
    default: return 'Unknown'
  }
}

function viewOrder(order) {
  router.push(`/orders/${order.checkoutId}`)
  // viewingOrder.value = order
  // showViewModal.value = true
}

function closeViewModal() {
  showViewModal.value = false
  viewingOrder.value = null
}

onMounted(async () => {
  await Promise.all([
    ordersStore.fetchAllOngoingOrders(),
    ordersStore.fetchAllCompletedOrders()
  ])
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

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  font-weight: 500;
  cursor: pointer;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab:hover {
  color: #1f2937;
}

.tab.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
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

.badge-info {
  background: #dbeafe;
  color: #1e40af;
}

.badge-primary {
  background: #e0e7ff;
  color: #4338ca;
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

.order-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.view-section {
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.view-section:last-child {
  border-bottom: none;
}

.view-section h4 {
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

.cart-products {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.item-details {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.item-image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 0.25rem;
}

.item-name {
  font-weight: 500;
  color: #1f2937;
  margin: 0;
}

.item-quantity {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.item-total {
  font-weight: 600;
  color: #1f2937;
}

.order-total {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-top: 2px solid #e5e7eb;
  margin-top: 0.5rem;
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