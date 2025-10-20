import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const completedOrders = ref([])
  const ongoingOrders = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchAllCompletedOrders() {
    loading.value = true
    error.value = null
    try {
      const response = await api.checkout.getAllCompleted()
      completedOrders.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching completed orders:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchAllOngoingOrders() {
    loading.value = true
    error.value = null
    try {
      const response = await api.checkout.getAllOngoing()
      ongoingOrders.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching ongoing orders:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderById(id) {
    loading.value = true
    error.value = null
    try {
      const response = await api.checkout.getById(id)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function manageCheckout(checkoutData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.checkout.manageCheckout(checkoutData)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return { 
    orders, 
    completedOrders, 
    ongoingOrders, 
    loading, 
    error, 
    fetchAllCompletedOrders, 
    fetchAllOngoingOrders,
    fetchOrderById,
    manageCheckout
  }
})