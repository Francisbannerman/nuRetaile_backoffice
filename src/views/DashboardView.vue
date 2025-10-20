<template>
  <div class="layout">
    <Sidebar />
    <div class="main-content">
      <Header title="Dashboard" />
      <div class="content-area">
        <LoadingSpinner v-if="loading" message="Loading dashboard..." />
        
        <template v-else>
          <!-- Stats Cards -->
          <div class="stats-grid">
            <StatsCard
              label="Total Products"
              :value="dashboardData.inventoryCount"
              :change="getChange('products')"
              :icon="PackageIcon"
              color="blue"
            />
            <StatsCard
              label="Total Orders"
              :value="dashboardData.totalOrders"
              :change="getChange('orders')"
              :icon="ShoppingCartIcon"
              color="green"
            />
            <StatsCard
              label="Total Users"
              :value="dashboardData.totalUsers"
              :change="`${dashboardData.newUsersToday} new today`"
              :icon="UsersIcon"
              color="purple"
            />
            <StatsCard
              label="Total Revenue"
              :value="`GH₵${dashboardData.totalRevenue?.toLocaleString()}`"
              :change="`Today: GH₵${dashboardData.todaysRevenue}`"
              :icon="DollarSignIcon"
              color="orange"
            />
          </div>

          <!-- Dashboard Grid -->
          <div class="dashboard-grid">
            <!-- Order Stats -->
            <div class="card">
              <h3 class="card-title">Order Statistics</h3>
              <div class="stats-list">
                <div class="stat-item">
                  <span class="stat-label">Completed</span>
                  <span class="stat-value completed">{{ dashboardData.completedOrders }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Ongoing</span>
                  <span class="stat-value ongoing">{{ dashboardData.ongoingOrders }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Pending</span>
                  <span class="stat-value pending">{{ dashboardData.pendingOrders }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Cancelled</span>
                  <span class="stat-value cancelled">{{ dashboardData.cancelledOrders }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Average Order Value</span>
                  <span class="stat-value">GH₵{{ dashboardData.averageOrderValue?.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Revenue Breakdown -->
            <div class="card">
              <h3 class="card-title">Revenue Breakdown</h3>
              <div class="stats-list">
                <div class="stat-item">
                  <span class="stat-label">Today</span>
                  <span class="stat-value">GH₵{{ dashboardData.todaysRevenue }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Yesterday</span>
                  <span class="stat-value">GH₵{{ dashboardData.yesterdaysRevenue }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">This Week</span>
                  <span class="stat-value">GH₵{{ dashboardData.thisWeeksRevenue }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">This Month</span>
                  <span class="stat-value">GH₵{{ dashboardData.thisMonthsRevenue }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Total Commission Paid</span>
                  <span class="stat-value">GH₵{{ dashboardData.totalCommissionPaid?.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Top Selling Products -->
            <div class="card">
              <h3 class="card-title">Top Selling Products</h3>
              <div v-if="dashboardData.topSellingItems?.length" class="products-list">
                <div v-for="product in dashboardData.topSellingItems?.slice(0, 5)" :key="product.productId" class="product-item">
                  <div class="product-info">
                    <p class="product-name">{{ product.productName }}</p>
                    <p class="product-price">GH₵{{ product.sellingPrice }}</p>
                  </div>
                  <span class="stock-badge" :class="getStockClass(product.stock)">
                    {{ product.stock }} in stock
                  </span>
                </div>
              </div>
              <div v-else class="empty-state">No sales data yet</div>
            </div>

            <!-- Low Stock Alert -->
            <div class="card">
              <h3 class="card-title">
                Stock Alert 
                <span class="alert-count" v-if="dashboardData.lowStockCount || dashboardData.outOfStockCount">
                  ({{ dashboardData.lowStockCount }} low, {{ dashboardData.outOfStockCount }} out)
                </span>
              </h3>
              <div v-if="dashboardData.lowStockItems?.length || dashboardData.outOfStocksItems?.length" class="products-list">
                <div v-for="product in [...(dashboardData.outOfStocksItems || []), ...(dashboardData.lowStockItems || [])].slice(0, 5)" :key="product.productId" class="product-item">
                  <div class="product-info">
                    <p class="product-name">{{ product.productName }}</p>
                    <p class="product-price">GH₵{{ product.sellingPrice }}</p>
                  </div>
                  <span class="stock-badge" :class="product.stock === 0 ? 'out' : 'low'">
                    {{ product.stock === 0 ? 'Out of stock' : `${product.stock} left` }}
                  </span>
                </div>
              </div>
              <div v-else class="empty-state">All products well stocked!</div>
            </div>

            <!-- Most Frequent Customer -->
            <div class="card">
              <h3 class="card-title">Most Frequent Customer</h3>
              <div v-if="dashboardData.mostFrequentCustomer" class="customer-card">
                <div class="customer-info">
                  <p class="customer-name">{{ dashboardData.mostFrequentCustomer.username }}</p>
                  <p class="customer-contact">{{ dashboardData.mostFrequentCustomer.contactNumber }}</p>
                  <p class="customer-stat">Spent: GH₵{{ dashboardData.mostFrequentCustomer.monthlyAmountSpent }}</p>
                  <p class="customer-stat">Commission: GH₵{{ dashboardData.mostFrequentCustomer.earnedCommission }}</p>
                </div>
              </div>
              <div v-else class="empty-state">No customer data</div>
            </div>

            <!-- Top Referrers -->
            <div class="card">
              <h3 class="card-title">Top Referrers</h3>
              <div v-if="dashboardData.topReferrers?.length" class="users-list">
                <div v-for="user in dashboardData.topReferrers?.slice(0, 5)" :key="user.userId" class="user-item">
                  <div class="user-info">
                    <p class="user-name">{{ user.username }}</p>
                    <p class="user-contact">{{ user.contactNumber }}</p>
                  </div>
                  <span class="commission-badge">GH₵{{ user.earnedCommission }}</span>
                </div>
              </div>
              <div v-else class="empty-state">No referral data</div>
            </div>

            <!-- Performance Trend Chart -->
            <div class="card full-width">
              <h3 class="card-title">Order Trend (Last 7 Days)</h3>
              <div class="trend-chart">
                <div v-for="(value, date) in dashboardData.trendOfPerformance" :key="date" class="trend-bar">
                  <div class="bar" :style="{ height: `${getBarHeight(value, dashboardData.trendOfPerformance)}%` }">
                    <span class="bar-value">{{ value }}</span>
                  </div>
                  <span class="bar-label">{{ formatDate(date) }}</span>
                </div>
              </div>
            </div>

            <!-- Revenue Trend Chart -->
            <div class="card full-width">
              <h3 class="card-title">Revenue Trend (Last 7 Days)</h3>
              <div class="trend-chart">
                <div v-for="(value, date) in dashboardData.revenueTrend" :key="date" class="trend-bar">
                  <div class="bar revenue" :style="{ height: `${getBarHeight(value, dashboardData.revenueTrend)}%` }">
                    <span class="bar-value">₵{{ value }}</span>
                  </div>
                  <span class="bar-label">{{ formatDate(date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import StatsCard from '../components/StatsCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { Package as PackageIcon, ShoppingCart as ShoppingCartIcon, Users as UsersIcon, DollarSign as DollarSignIcon } from 'lucide-vue-next'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hammerhead-app-68j7i.ondigitalocean.app/api'

const dashboardData = ref({})
const loading = ref(true)

onMounted(async () => {
  await fetchDashboard()
})

async function fetchDashboard() {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/Staff/dashboard`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    dashboardData.value = await response.json()
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    alert('Error loading dashboard data: ' + error.message)
  } finally {
    loading.value = false
  }
}

function getChange(type) {
  if (type === 'products') {
    return `${dashboardData.value.lowStockCount} low stock`
  }
  if (type === 'orders') {
    return `${dashboardData.value.ongoingOrders} ongoing`
  }
  return ''
}

function getStockClass(stock) {
  if (stock < 10) return 'low'
  if (stock < 30) return 'medium'
  return 'high'
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getBarHeight(value, data) {
  const values = Object.values(data)
  const maxValue = Math.max(...values)
  if (maxValue === 0) return 0
  return (value / maxValue) * 100
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card.full-width {
  grid-column: 1 / -1;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.alert-count {
  font-size: 0.875rem;
  font-weight: 400;
  color: #6b7280;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-value {
  font-weight: 600;
  color: #111827;
}

.stat-value.completed {
  color: #059669;
}

.stat-value.ongoing {
  color: #2563eb;
}

.stat-value.pending {
  color: #d97706;
}

.stat-value.cancelled {
  color: #dc2626;
}

.products-list, .users-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-item, .user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.product-name, .user-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.9375rem;
}

.product-price, .user-contact {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.stock-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.stock-badge.low {
  background: #fee2e2;
  color: #991b1b;
}

.stock-badge.out {
  background: #1f2937;
  color: #ffffff;
}

.stock-badge.medium {
  background: #fef3c7;
  color: #92400e;
}

.stock-badge.high {
  background: #d1fae5;
  color: #065f46;
}

.commission-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: #dbeafe;
  color: #1e40af;
}

.customer-card {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.customer-name {
  font-weight: 600;
  font-size: 1.125rem;
  color: #111827;
  margin-bottom: 0.5rem;
}

.customer-contact {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.customer-stat {
  font-size: 0.875rem;
  color: #374151;
  margin-top: 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  gap: 0.5rem;
  padding: 1rem 0;
}

.trend-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 0.5rem;
}

.bar {
  width: 100%;
  max-width: 60px;
  background: #3b82f6;
  border-radius: 0.25rem 0.25rem 0 0;
  min-height: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.25rem;
  transition: all 0.3s ease;
  position: relative;
}

.bar:hover {
  background: #2563eb;
}

.bar.revenue {
  background: #10b981;
}

.bar.revenue:hover {
  background: #059669;
}

.bar-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.bar-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  white-space: nowrap;
}
</style>