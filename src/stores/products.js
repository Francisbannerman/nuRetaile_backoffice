// ==================== src/stores/products.js ====================
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const response = await api.product.getAll()
      products.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  async function createProduct(productData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.product.create(productData)
      products.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProduct(productData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.product.update(productData)
      const index = products.value.findIndex(p => p.productId === productData.productId)
      if (index !== -1) {
        products.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProduct(productId) {
    loading.value = true
    error.value = null
    try {
      await api.product.delete(productId)
      products.value = products.value.filter(p => p.productId !== productId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return { products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct }
})