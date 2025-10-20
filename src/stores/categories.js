import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const response = await api.category.getAll()
      categories.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  async function createCategory(categoryData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.category.create(categoryData)
      categories.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCategory(categoryData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.category.update(categoryData)
      const index = categories.value.findIndex(c => c.categoryId === categoryData.categoryId)
      if (index !== -1) {
        categories.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCategory(categoryId) {
    loading.value = true
    error.value = null
    try {
      await api.category.delete(categoryId)
      categories.value = categories.value.filter(c => c.categoryId !== categoryId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return { categories, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory }
})