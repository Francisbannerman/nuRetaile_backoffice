<template>
  <div class="layout">
    <Sidebar />
    <div class="main-content">
      <Header title="Categories" />
      <div class="content-area">
        <div class="page-header">
          <div class="search-filter">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search categories..."
              class="search-input"
            />
          </div>
          <button @click="openCreateModal" class="btn-primary">
            <PlusIcon :size="18" />
            Add Category
          </button>
        </div>

        <LoadingSpinner v-if="loading" message="Loading categories..." />
        
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Display Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in filteredCategories" :key="cat.categoryId">
                <td>
                  <img 
                    :src="cat.categoryImage || '/placeholder.png'" 
                    :alt="cat.categoryName"
                    class="category-image"
                  />
                </td>
                <td>{{ cat.categoryName }}</td>
                <td>{{ cat.displayOrder || '—' }}</td>
                <td>
                  <span :class="['badge', cat.isActive ? 'badge-success' : 'badge-danger']">
                    {{ cat.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button @click="viewCategory(cat)" class="btn-icon" title="View">
                      <EyeIcon :size="16" />
                    </button>
                    <button @click="editCategory(cat)" class="btn-icon" title="Edit">
                      <Edit2Icon :size="16" />
                    </button>
                    <button @click="deleteCategory(cat)" class="btn-icon btn-danger" title="Delete">
                      <Trash2Icon :size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Create/Edit Modal -->
        <Modal :isOpen="showModal" :title="modalTitle" @close="closeModal">
          <form @submit.prevent="handleSubmit" class="form">
            <div class="form-group">
              <label>Category Name *</label>
              <input v-model="formData.categoryName" type="text" required />
            </div>

            <div class="form-group">
              <label>Category Image URL</label>
              <input v-model="formData.categoryImage" type="text" placeholder="https://example.com/image.jpg" />
            </div>

            <div class="form-group">
              <label>Display Order</label>
              <input v-model.number="formData.displayOrder" type="number" placeholder="Order priority (optional)" />
            </div>

            <div class="form-checkbox">
              <label>
                <input v-model="formData.isActive" type="checkbox" />
                Active Category
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                {{ submitting ? 'Saving...' : 'Save Category' }}
              </button>
            </div>
          </form>
        </Modal>

        <!-- View Category Modal -->
        <Modal :isOpen="showViewModal" title="Category Details" @close="closeViewModal">
          <div v-if="viewingCategory" class="category-view">
            <div class="view-section">
              <div class="category-image-large">
                <img :src="viewingCategory.categoryImage || '/placeholder.png'" :alt="viewingCategory.categoryName" />
              </div>
            </div>

            <div class="view-section">
              <h3>{{ viewingCategory.categoryName }}</h3>
            </div>

            <div class="view-section">
              <h4>Category Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Display Order:</span>
                  <span class="detail-value">{{ viewingCategory.displayOrder || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <span :class="['badge', viewingCategory.isActive ? 'badge-success' : 'badge-danger']">
                    {{ viewingCategory.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeViewModal" class="btn-secondary">
                Close
              </button>
              <button @click="editCategory(viewingCategory); closeViewModal()" class="btn-primary">
                Edit Category
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
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import Modal from '../components/Modal.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { useCategoriesStore } from '../stores/categories'
import { Plus as PlusIcon, Eye as EyeIcon, Edit2 as Edit2Icon, Trash2 as Trash2Icon } from 'lucide-vue-next'

const categoriesStore = useCategoriesStore()

const searchQuery = ref('')
const showModal = ref(false)
const showViewModal = ref(false)
const editMode = ref(false)
const submitting = ref(false)
const viewingCategory = ref(null)

const formData = ref({
  categoryId: null,
  categoryName: '',
  categoryImage: '',
  displayOrder: null,
  isActive: true
})

const loading = computed(() => categoriesStore.loading)
const categories = computed(() => categoriesStore.categories)

const filteredCategories = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return categories.value.filter(c => 
    c.categoryName.toLowerCase().includes(q)
  )
})

const modalTitle = computed(() => editMode.value ? 'Edit Category' : 'Add New Category')

function openCreateModal() {
  editMode.value = false
  resetForm()
  showModal.value = true
}

function editCategory(cat) {
  editMode.value = true
  formData.value = { ...cat }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

function viewCategory(cat) {
  viewingCategory.value = cat
  showViewModal.value = true
}

function closeViewModal() {
  showViewModal.value = false
  viewingCategory.value = null
}

function resetForm() {
  formData.value = {
    categoryId: null,
    categoryName: '',
    categoryImage: '',
    displayOrder: null,
    isActive: true
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    if (editMode.value) {
      await categoriesStore.updateCategory(formData.value)
    } else {
      const newCategory = {
        ...formData.value,
        categoryId: crypto.randomUUID()
      }
      await categoriesStore.createCategory(newCategory)
    }
    closeModal()
  } catch (error) {
    alert('Error saving category: ' + error.message)
  } finally {
    submitting.value = false
  }
}

async function deleteCategory(cat) {
  if (!confirm(`Are you sure you want to delete "${cat.categoryName}"?`)) return
  try {
    await categoriesStore.deleteCategory(cat.categoryId)
  } catch (error) {
    alert('Error deleting category: ' + error.message)
  }
}

onMounted(async () => {
  await categoriesStore.fetchCategories()
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
  gap: 1rem;
  flex-wrap: wrap;
}
.search-filter {
  display: flex;
  gap: 1rem;
  flex: 1;
  max-width: 400px;
}
.search-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  position: relative;
  z-index: 10;
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
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
}
.data-table tbody tr:hover {
  background: #f9fafb;
}
.category-image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 0.25rem;
  background: #f3f4f6;
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
.action-buttons {
  display: flex;
  gap: 0.5rem;
}
.btn-icon {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  color: #6b7280;
  transition: all 0.2s;
}
.btn-icon:hover {
  background: #f3f4f6;
  color: #1f2937;
}
.btn-icon.btn-danger:hover {
  background: #fee2e2;
  color: #991b1b;
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
.form-group textarea {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.form-checkbox label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}
.form-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
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
  cursor: pointer;
}
.btn-secondary:hover {
  background: #e5e7eb;
}
.category-view {
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
.view-section h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}
.view-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #374151;
}
.category-image-large {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}
.category-image-large img {
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
</style>