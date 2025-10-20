import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function createNotification(notificationData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.notification.create(notificationData)
      notifications.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return { notifications, loading, error, createNotification }
})