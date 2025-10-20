<template>
  <div class="layout">
    <Sidebar />
    <div class="main-content">
      <Header :title="`Order #${orderId?.slice(0, 8)}`" />
      <div class="content-area">
        <!-- Back Button -->
        <button @click="goBack" class="btn-back">
          <ArrowLeftIcon :size="18" />
          Back to Orders
        </button>

        <LoadingSpinner v-if="loading" message="Loading order details..." />

        <div v-else-if="order" class="order-details-container">
          <!-- Order Status Header -->
          <div class="status-header">
            <div>
              <h2>Order #{{ order.checkoutId?.slice(0, 16) }}</h2>
              <p class="order-date">Placed on {{ formatDateTime(order.dateOfCheckout) }}</p>
            </div>
            <div class="status-actions">
              <span :class="['badge-large', getBadgeClass(order.status)]">
                {{ getStatusText(order.status) }}
              </span>
              <button 
                v-if="canManageOrder"
                @click="showManageModal = true" 
                class="btn-primary"
              >
                <SettingsIcon :size="18" />
                Manage Order
              </button>
              <button 
                v-else
                disabled
                class="btn-primary btn-disabled"
                title="Order is already completed"
              >
                <SettingsIcon :size="18" />
                Manage Order
              </button>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="details-grid">
            <!-- Left Column -->
            <div class="details-column">
              <!-- Order Items -->
              <div class="card">
                <h3 class="card-title">Order Items</h3>
                <div v-if="order.cart?.cartProducts" class="order-items">
                  <div v-for="item in order.cart.cartProducts" :key="item.cartProductId" class="order-item">
                    <img 
                      :src="item.product?.defaultImage || '/placeholder.png'" 
                      :alt="item.product?.productName"
                      class="item-image"
                    />
                    <div class="item-details">
                      <h4>{{ item.product?.productName || 'Product' }}</h4>
                      <p class="item-meta">{{ item.product?.productDescription || '' }}</p>
                      <p class="item-price">₵{{ item.amount.toFixed(2) }} × {{ item.quantity }}</p>
                    </div>
                    <div class="item-total">
                      ₵{{ (item.amount * item.quantity).toFixed(2) }}
                    </div>
                  </div>
                </div>
                <div v-else class="empty-items">
                  <p>No items in this order</p>
                </div>

                <!-- Order Summary -->
                <div class="order-summary">
                  <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>₵{{ getOrderTotal() }}</span>
                  </div>
                  <div class="summary-row">
                    <span>Delivery Fee:</span>
                    <span>₵0.00</span>
                  </div>
                  <div class="summary-row total">
                    <strong>Total:</strong>
                    <strong>₵{{ getOrderTotal() }}</strong>
                  </div>
                </div>
              </div>

              <!-- Payment Information -->
              <div class="card">
                <h3 class="card-title">Payment Information</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Payment Method:</span>
                    <span class="info-value">{{ order.paymentMethod || 'Not specified' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Transaction ID:</span>
                    <span class="info-value">{{ order.transactionId?.slice(0, 16) || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Transaction Status:</span>
                    <span v-if="order.transaction" :class="['badge', getTransactionBadgeClass(order.transaction.transactionStatus)]">
                      {{ getTransactionStatusText(order.transaction.transactionStatus) }}
                    </span>
                    <span v-else class="info-value">N/A</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Amount Paid:</span>
                    <span class="info-value">₵{{ order.transaction?.amount?.toFixed(2) || getOrderTotal() }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="details-column">
              <!-- Customer Information -->
              <div class="card">
                <h3 class="card-title">Customer Information</h3>
                <div class="customer-info">
                  <div class="customer-avatar">
                    {{ getCustomerInitials() }}
                  </div>
                  <div class="customer-details">
                    <h4>{{ order.customer?.username || 'Guest Customer' }}</h4>
                    <p>{{ order.customer?.contactNumber || 'No email' }}</p>
                  </div>
                </div>
                <div class="info-divider"></div>
                <div class="info-item">
                  <span class="info-label">Customer ID:</span>
                  <span class="info-value">{{ order.customerId?.slice(0, 16) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Alternate Number:</span>
                  <span class="info-value">{{ order.alternateNumber || 'N/A' }}</span>
                </div>
              </div>

              <!-- Delivery Information -->
              <div class="card">
                <h3 class="card-title">Delivery Information</h3>
                <div class="info-grid">
                  <div class="info-item full-width">
                    <span class="info-label">Delivery Address:</span>
                    <span class="info-value">{{ order.deliveryLocation || 'Not specified' }}</span>
                  </div>
                  <div class="info-item full-width">
                    <span class="info-label">GPS Location:</span>
                    <span class="info-value">{{ order.gpsLocation || 'Not provided' }}</span>
                  </div>
                  <div class="info-item full-width">
                    <span class="info-label">Delivery Note:</span>
                    <span class="info-value">{{ order.deliveryNote || 'No special instructions' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Delivery Date:</span>
                    <span class="info-value">{{ formatDateTime(order.deliveryDate) }}</span>
                  </div>
                </div>
              </div>

              <!-- Rider Information (if assigned) -->
              <div v-if="order.assignedRidersName" class="card">
                <h3 class="card-title">Rider Information</h3>
                <div class="rider-info">
                  <div class="rider-avatar">
                    <UserIcon :size="32" />
                  </div>
                  <div class="rider-details">
                    <h4>{{ order.assignedRidersName }}</h4>
                    <p>{{ order.assignedRidersNumber }}</p>
                  </div>
                </div>
              </div>

              <!-- Order Timeline -->
              <div class="card">
                <h3 class="card-title">Order Timeline</h3>
                <div class="timeline">
                  <div class="timeline-item completed">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <p class="timeline-title">Order Placed</p>
                      <p class="timeline-date">{{ formatDateTime(order.dateOfCheckout) }}</p>
                    </div>
                  </div>
                  <div :class="['timeline-item', { completed: order.status >= 2 }]">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <p class="timeline-title">Order Processing</p>
                      <p class="timeline-date">{{ order.status >= 2 ? 'In progress' : 'Pending' }}</p>
                    </div>
                  </div>
                  <div :class="['timeline-item', { completed: order.status >= 3 }]">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <p class="timeline-title">Order Dispatched</p>
                      <p class="timeline-date">{{ order.status >= 3 ? 'On the way' : 'Pending' }}</p>
                    </div>
                  </div>
                  <div :class="['timeline-item', { completed: order.status >= 4 }]">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <p class="timeline-title">Delivered</p>
                      <p class="timeline-date">{{ order.status >= 4 ? formatDateTime(order.deliveryDate) : 'Pending' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Manage Order Modal -->
        <Modal :isOpen="showManageModal" title="Manage Order" @close="closeManageModal">
          <form @submit.prevent="handleManageOrder" class="form">
            <div class="form-group">
              <label>Order Status *</label>
              <select v-model.number="manageForm.status" required>
                <option value="1">Order Received</option>
                <option value="2">Order Processing</option>
                <option value="3">Order Dispatched</option>
                <option value="4">Order Delivered</option>
                <option value="5">Order Cancelled</option>
              </select>
            </div>

            <div class="form-group">
              <label>Assigned Rider Name</label>
              <input v-model="manageForm.assignedRidersName" type="text" placeholder="Enter rider name" />
            </div>

            <div class="form-group">
              <label>Assigned Rider Number</label>
              <input v-model="manageForm.assignedRidersNumber" type="text" placeholder="Enter rider phone number" />
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeManageModal" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                {{ submitting ? 'Updating...' : 'Update Order' }}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '../stores/orders'
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import Modal from '../components/Modal.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { ArrowLeft as ArrowLeftIcon, Settings as SettingsIcon, User as UserIcon } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()

const orderId = ref(route.params.id)
const order = ref(null)
const loading = ref(true)
const showManageModal = ref(false)
const submitting = ref(false)

const manageForm = ref({
  checkoutId: '',
  status: 1,
  assignedRidersName: '',
  assignedRidersNumber: ''
})

const canManageOrder = computed(() => {
  // Can only manage if status is 1, 2, or 3 (not Delivered or Completed)
  return order.value && order.value.status < 4
})

function goBack() {
  router.push('/orders')
}

function getOrderTotal() {
  return order.value?.cart?.totalCartAmount?.toFixed(2) || '0.00'
}

function getCustomerInitials() {
  const name = order.value?.customer?.name || 'GU'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDateTime(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getBadgeClass(status) {
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

function getTransactionBadgeClass(status) {
  switch(status) {
    case 1: return 'badge-warning'
    case 2: return 'badge-info'
    case 3: return 'badge-success'
    case 4:
    case 5:
    case 6: return 'badge-danger'
    default: return 'badge-secondary'
  }
}

function getTransactionStatusText(status) {
  switch(status) {
    case 1: return 'Pending Payment'
    case 2: return 'Processing Payment'
    case 3: return 'Paid'
    case 4: return 'Payment Failed'
    case 5: return 'Cancelled'
    case 6: return 'Refunded'
    default: return 'Unknown'
  }
}

function closeManageModal() {
  showManageModal.value = false
  resetManageForm()
}

function resetManageForm() {
  manageForm.value = {
    checkoutId: order.value.checkoutId,
    status: order.value.status,
    assignedRidersName: order.value.assignedRidersName || '',
    assignedRidersNumber: order.value.assignedRidersNumber || ''
  }
}

async function handleManageOrder() {
  submitting.value = true
  try {
    await ordersStore.manageCheckout(manageForm.value)
    // Update local order data
    order.value.status = manageForm.value.status
    order.value.assignedRidersName = manageForm.value.assignedRidersName
    order.value.assignedRidersNumber = manageForm.value.assignedRidersNumber
    
    alert('Order updated successfully!')
    closeManageModal()
  } catch (error) {
    alert('Error updating order: ' + error.message)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    loading.value = true
    order.value = await ordersStore.fetchOrderById(orderId.value)
    resetManageForm()
  } catch (error) {
    console.error('Error fetching order:', error)
    alert('Error loading order details')
    router.push('/orders')
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
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: background 0.2s;
}

.btn-back:hover {
  background: #e5e7eb;
}

.order-details-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.status-header {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.status-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1f2937;
}

.order-date {
  margin: 0.25rem 0 0 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.status-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.badge-large {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
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

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

.badge-secondary {
  background: #f3f4f6;
  color: #374151;
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
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}

.details-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 0.375rem;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
}

.item-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #1f2937;
}

.item-meta {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.item-price {
  margin: 0;
  font-size: 0.875rem;
  color: #374151;
}

.item-total {
  font-weight: 600;
  font-size: 1.125rem;
  color: #1f2937;
  flex-shrink: 0;
}

.empty-items {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.order-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: #374151;
}

.summary-row.total {
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
  font-size: 1.125rem;
  margin-top: 0.5rem;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.info-item.full-width {
  flex-direction: column;
  align-items: flex-start;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.info-value {
  font-weight: 500;
  color: #1f2937;
  text-align: right;
}

.info-item.full-width .info-value {
  text-align: left;
}

.info-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 1rem 0;
}

.customer-info,
.rider-info {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.customer-avatar,
.rider-avatar {
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

.rider-avatar {
  background: #10b981;
}

.customer-details h4,
.rider-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  color: #1f2937;
}

.customer-details p,
.rider-details p {
  margin: 0.125rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item {
  position: relative;
}

.timeline-dot {
  position: absolute;
  left: -1.5rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e5e7eb;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #e5e7eb;
}

.timeline-item.completed .timeline-dot {
  background: #10b981;
  box-shadow: 0 0 0 2px #10b981;
}

.timeline-title {
  margin: 0 0 0.25rem 0;
  font-weight: 500;
  color: #1f2937;
}

.timeline-date {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
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
.form-group select {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group select:focus {
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
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
</style>