<template>
  <div class="layout">
    <Sidebar />
    <div class="main-content">
      <Header title="Products" />
      <div class="content-area">
        <div class="page-header">
          <div class="search-filter">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search products..."
              class="search-input"
            />
            <select v-model="filterCategory" class="filter-select">
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat.categoryId" :value="cat.categoryId">
                {{ cat.categoryName }}
              </option>
            </select>
          </div>
          <button @click="openCreateModal" class="btn-primary">
            <PlusIcon :size="18" />
            Add Product
          </button>
        </div>

        <LoadingSpinner v-if="loading" message="Loading products..." />
        
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Selling Price</th>
                <th>Status</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in filteredProducts" :key="product.productId">
                <td>
                  <div class="product-cell">
                    <img 
                      :src="product.defaultImage || '/placeholder.png'" 
                      :alt="product.productName"
                      class="product-image"
                    />
                    <span>{{ product.productName }}</span>
                  </div>
                </td>
                <td>{{ getCategoryName(product.categoryId) }}</td>
                <td>₵{{ product.unitPrice.toFixed(2) }}</td>
                <td>₵{{ product.sellingPrice.toFixed(2) }}</td>
                <td>
                  <span :class="['badge', product.isAvailable ? 'badge-success' : 'badge-danger']">
                    {{ product.isAvailable ? 'Available' : 'Unavailable' }}
                  </span>
                </td>
                <td>{{ product.stock }}</td>
                <td>
                  <div class="action-buttons">
                    <button @click="viewProduct(product)" class="btn-icon" title="View">
                      <EyeIcon :size="16" />
                    </button>
                    <button @click="editProduct(product)" class="btn-icon" title="Edit">
                      <Edit2Icon :size="16" />
                    </button>
                    <button @click="deleteProduct(product)" class="btn-icon btn-danger" title="Delete">
                      <Trash2Icon :size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Create/Edit Modal -->
        <!-- Create/Edit Modal -->
        <Modal :isOpen="showModal" :title="modalTitle" @close="closeModal">
          <form @submit.prevent="handleSubmit" class="form">
            <div class="form-group">
              <label>Product Name *</label>
              <input v-model="formData.productName" type="text" required />
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea v-model="formData.productDescription" rows="3"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Unit Price *</label>
                <input v-model.number="formData.unitPrice" type="number" step="0.01" required />
              </div>

              <div class="form-group">
                <label>Selling Price *</label>
                <input v-model.number="formData.sellingPrice" type="number" step="0.01" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Stock*</label>
                <input v-model.number="formData.stock" type="number" step="0.01" required />
              </div>
            </div>

            <div class="form-group">
              <label>Category *</label>
              <select v-model="formData.categoryId" required>
                <option value="">Select Category</option>
                <option v-for="cat in categories" :key="cat.categoryId" :value="cat.categoryId">
                  {{ cat.categoryName }}
                </option>
              </select>
            </div>

            <!-- Default Image Upload -->
            <div class="form-group">
              <label>Default Image *</label>
              <div class="image-upload-container">
                <input 
                  type="file" 
                  @change="handleImageUpload($event, 'defaultImage')" 
                  accept="image/*"
                  :required="!formData.defaultImage && !editMode"
                  ref="defaultImageInput"
                />
                
                <!-- Image Preview -->
                <div v-if="imagePreviews.defaultImage" class="image-preview">
                  <img :src="imagePreviews.defaultImage" alt="Default Image Preview" />
                  <button 
                    type="button" 
                    @click="removeImage('defaultImage')" 
                    class="remove-image-btn"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <!-- Additional Images Upload -->
            <div class="form-group">
              <label>Additional Images</label>
              
              <!-- Image 1 -->
              <div class="image-upload-container mt-2">
                <input 
                  type="file" 
                  @change="handleImageUpload($event, 'image1')" 
                  accept="image/*"
                  ref="image1Input"
                />
                <div v-if="imagePreviews.image1" class="image-preview">
                  <img :src="imagePreviews.image1" alt="Image 1 Preview" />
                  <button 
                    type="button" 
                    @click="removeImage('image1')" 
                    class="remove-image-btn"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <!-- Image 2 -->
              <div class="image-upload-container mt-2">
                <input 
                  type="file" 
                  @change="handleImageUpload($event, 'image2')" 
                  accept="image/*"
                  ref="image2Input"
                />
                <div v-if="imagePreviews.image2" class="image-preview">
                  <img :src="imagePreviews.image2" alt="Image 2 Preview" />
                  <button 
                    type="button" 
                    @click="removeImage('image2')" 
                    class="remove-image-btn"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <!-- Image 3 -->
              <div class="image-upload-container mt-2">
                <input 
                  type="file" 
                  @change="handleImageUpload($event, 'image3')" 
                  accept="image/*"
                  ref="image3Input"
                />
                <div v-if="imagePreviews.image3" class="image-preview">
                  <img :src="imagePreviews.image3" alt="Image 3 Preview" />
                  <button 
                    type="button" 
                    @click="removeImage('image3')" 
                    class="remove-image-btn"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Weight</label>
                <input v-model="formData.weight" type="text" />
              </div>

              <div class="form-group">
                <label>Size</label>
                <input v-model="formData.size" type="text" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Brand</label>
                <input v-model="formData.brand" type="text" />
              </div>

              <div class="form-group">
                <label>Manufacturer</label>
                <input v-model="formData.manufacturer" type="text" />
              </div>
            </div>

            <div class="form-group">
              <label>Display Order</label>
              <input v-model.number="formData.displayOrder" type="number" placeholder="Order priority (optional)" />
            </div>

            <div class="form-checkbox">
              <label>
                <input v-model="formData.isAvailable" type="checkbox" />
                Available for Sale
              </label>
            </div>

            <div class="form-checkbox">
              <label>
                <input v-model="formData.isOnHomePage" type="checkbox" />
                Display on Home Page
              </label>
            </div>

            <div class="form-checkbox">
              <label>
                <input v-model="formData.hasVariants" type="checkbox" />
                Has Product Variants
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                {{ submitting ? 'Saving...' : 'Save Product' }}
              </button>
            </div>
          </form>
        </Modal>

        <!-- View Product Modal (Read-only) -->
        <Modal :isOpen="showViewModal" title="Product Details" @close="closeViewModal">
          <div v-if="viewingProduct" class="product-view">
            <div class="view-section">
              <div class="product-images-gallery">
                <div class="main-image">
                  <img :src="viewingProduct.defaultImage || '/placeholder.png'" :alt="viewingProduct.productName" />
                </div>
                <div v-if="viewingProduct.image1 || viewingProduct.image2 || viewingProduct.image3" class="additional-images">
                  <img v-if="viewingProduct.image1" :src="viewingProduct.image1" alt="Image 1" class="thumbnail" />
                  <img v-if="viewingProduct.image2" :src="viewingProduct.image2" alt="Image 2" class="thumbnail" />
                  <img v-if="viewingProduct.image3" :src="viewingProduct.image3" alt="Image 3" class="thumbnail" />
                </div>
              </div>
            </div>

            <div class="view-section">
              <h3>{{ viewingProduct.productName }}</h3>
              <p class="product-description">{{ viewingProduct.productDescription || 'No description' }}</p>
            </div>

            <div class="view-section">
              <h4>Pricing</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Unit Price:</span>
                  <span class="detail-value">${{ viewingProduct.unitPrice.toFixed(2) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Selling Price:</span>
                  <span class="detail-value">${{ viewingProduct.sellingPrice.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <div class="view-section">
              <h4>Stock</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-value">{{ viewingProduct.stock }}</span>
                </div>
              </div>
            </div>

            <div class="view-section">
              <h4>Product Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">{{ getCategoryName(viewingProduct.categoryId) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Brand:</span>
                  <span class="detail-value">{{ viewingProduct.brand || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Manufacturer:</span>
                  <span class="detail-value">{{ viewingProduct.manufacturer || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Weight:</span>
                  <span class="detail-value">{{ viewingProduct.weight || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Size:</span>
                  <span class="detail-value">{{ viewingProduct.size || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <span :class="['badge', viewingProduct.isAvailable ? 'badge-success' : 'badge-danger']">
                    {{ viewingProduct.isAvailable ? 'Available' : 'Unavailable' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="view-section">
              <h4>Display Settings</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">On Home Page:</span>
                  <span class="detail-value">{{ viewingProduct.isOnHomePage ? 'Yes' : 'No' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Display Order:</span>
                  <span class="detail-value">{{ viewingProduct.displayOrder || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Has Variants:</span>
                  <span class="detail-value">{{ viewingProduct.hasVariants ? 'Yes' : 'No' }}</span>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeViewModal" class="btn-secondary">
                Close
              </button>
              <button @click="editProduct(viewingProduct); closeViewModal()" class="btn-primary">
                Edit Product
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
import { useProductsStore } from '../stores/products'
import { useCategoriesStore } from '../stores/categories'
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import Modal from '../components/Modal.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { Plus as PlusIcon, Eye as EyeIcon, Edit2 as Edit2Icon, Trash2 as Trash2Icon } from 'lucide-vue-next'

const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

const searchQuery = ref('')
const filterCategory = ref('')
const showModal = ref(false)
const showViewModal = ref(false)
const editMode = ref(false)
const submitting = ref(false)
const viewingProduct = ref(null)

// ✅ Image handling
const imageFiles = ref({
  defaultImage: null,
  image1: null,
  image2: null,
  image3: null
})

const imagePreviews = ref({
  defaultImage: null,
  image1: null,
  image2: null,
  image3: null
})

// ✅ Refs for file inputs
const defaultImageInput = ref(null)
const image1Input = ref(null)
const image2Input = ref(null)
const image3Input = ref(null)

const formData = ref({
  productId: null,
  productName: '',
  productDescription: '',
  unitPrice: 0,
  sellingPrice: 0,
  stock: 0,
  categoryId: '',
  defaultImage: '',
  image1: '',
  image2: '',
  image3: '',
  weight: '',
  size: '',
  brand: '',
  manufacturer: '',
  displayOrder: null,
  isAvailable: true,
  isOnHomePage: false,
  hasVariants: false
})

const loading = computed(() => productsStore.loading || categoriesStore.loading)
const products = computed(() => productsStore.products)
const categories = computed(() => categoriesStore.categories)

const filteredProducts = computed(() => {
  let filtered = products.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.productName.toLowerCase().includes(query) ||
      p.productDescription?.toLowerCase().includes(query)
    )
  }

  if (filterCategory.value) {
    filtered = filtered.filter(p => p.categoryId === filterCategory.value)
  }

  return filtered
})

const modalTitle = computed(() => editMode.value ? 'Edit Product' : 'Add New Product')

function getCategoryName(categoryId) {
  const category = categories.value.find(c => c.categoryId === categoryId)
  return category?.categoryName || 'N/A'
}

// ✅ Handle image file selection
function handleImageUpload(event, imageKey) {
  const file = event.target.files[0]
  
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file')
    return
  }

  // Validate file size (e.g., 5MB max)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    alert('Image size must be less than 5MB')
    return
  }

  // Store the file
  imageFiles.value[imageKey] = file

  // Create preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreviews.value[imageKey] = e.target.result
    
    // Also update formData to track that an image exists
    formData.value[imageKey] = file.name
  }
  reader.readAsDataURL(file)
}

// ✅ Remove image
function removeImage(imageKey) {
  imageFiles.value[imageKey] = null
  imagePreviews.value[imageKey] = null
  formData.value[imageKey] = ''
  
  // Clear the file input
  const inputRefs = {
    defaultImage: defaultImageInput,
    image1: image1Input,
    image2: image2Input,
    image3: image3Input
  }
  
  const inputRef = inputRefs[imageKey]
  if (inputRef?.value) {
    inputRef.value.value = ''
  }
}

// ✅ Handle form submission using productsStore
async function handleSubmit() {
  submitting.value = true
  
  try {
    // Create FormData object
    const formDataToSend = new FormData()

    // Append all form fields
    formDataToSend.append('productName', formData.value.productName)
    formDataToSend.append('productDescription', formData.value.productDescription || '')
    formDataToSend.append('unitPrice', formData.value.unitPrice)
    formDataToSend.append('sellingPrice', formData.value.sellingPrice)
    formDataToSend.append('stock', formData.value.stock)
    formDataToSend.append('categoryId', formData.value.categoryId)
    formDataToSend.append('weight', formData.value.weight || '')
    formDataToSend.append('size', formData.value.size || '')
    formDataToSend.append('brand', formData.value.brand || '')
    formDataToSend.append('manufacturer', formData.value.manufacturer || '')
    formDataToSend.append('displayOrder', formData.value.displayOrder || 0)
    formDataToSend.append('isAvailable', formData.value.isAvailable)
    formDataToSend.append('isOnHomePage', formData.value.isOnHomePage)
    formDataToSend.append('hasVariants', formData.value.hasVariants)

    // Append image files
    if (imageFiles.value.defaultImage) {
      formDataToSend.append('defaultImage', imageFiles.value.defaultImage)
    }
    if (imageFiles.value.image1) {
      formDataToSend.append('image1', imageFiles.value.image1)
    }
    if (imageFiles.value.image2) {
      formDataToSend.append('image2', imageFiles.value.image2)
    }
    if (imageFiles.value.image3) {
      formDataToSend.append('image3', imageFiles.value.image3)
    }

    // ✅ Call productsStore methods
    if (editMode.value) {
      formDataToSend.append('productId', formData.value.productId)
      await productsStore.updateProduct(formDataToSend)
    } else {
      await productsStore.createProduct(formDataToSend)
    }
    await productsStore.fetchProducts()

    closeModal()
  } catch (error) {
    alert('Error saving product: ' + error.message)
  } finally {
    submitting.value = false
  }
}

function openCreateModal() {
  editMode.value = false
  resetForm()
  showModal.value = true
}

function editProduct(product) {
  editMode.value = true
  formData.value = { ...product }
  
  // Load existing images as previews
  imagePreviews.value.defaultImage = product.defaultImage || null
  imagePreviews.value.image1 = product.image1 || null
  imagePreviews.value.image2 = product.image2 || null
  imagePreviews.value.image3 = product.image3 || null
  
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

function viewProduct(product) {
  viewingProduct.value = product
  showViewModal.value = true
}

function closeViewModal() {
  showViewModal.value = false
  viewingProduct.value = null
}

function resetForm() {
  formData.value = {
    productId: null,
    productName: '',
    productDescription: '',
    unitPrice: 0,
    sellingPrice: 0,
    stock: 0,
    categoryId: '',
    defaultImage: '',
    image1: '',
    image2: '',
    image3: '',
    weight: '',
    size: '',
    brand: '',
    manufacturer: '',
    displayOrder: null,
    isAvailable: true,
    isOnHomePage: false,
    hasVariants: false
  }
  
  imageFiles.value = {
    defaultImage: null,
    image1: null,
    image2: null,
    image3: null
  }
  
  imagePreviews.value = {
    defaultImage: null,
    image1: null,
    image2: null,
    image3: null
  }
}

async function deleteProduct(product) {
  if (!confirm(`Are you sure you want to delete "${product.productName}"?`)) return
  
  try {
    await productsStore.deleteProduct(product.productId)
  } catch (error) {
    alert('Error deleting product: ' + error.message)
  }
}

onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    categoriesStore.fetchCategories()
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
  max-width: 600px;
}

.search-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  min-width: 200px;
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

.product-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-image {
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
.form-group select,
.form-group textarea {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-group input.mt-2 {
  margin-top: 0.5rem;
}

.form-group input:focus,
.form-group select:focus,
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
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.product-view {
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
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.view-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #374151;
}

.product-description {
  color: #6b7280;
  line-height: 1.5;
}

.product-images-gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.main-image img {
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.additional-images {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 0.375rem;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: border-color 0.2s;
}

.thumbnail:hover {
  border-color: #2563eb;
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



.image-upload-container {
  position: relative;
}

.image-upload-container input[type="file"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.image-preview {
  position: relative;
  margin-top: 10px;
  width: 150px;
  height: 150px;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.remove-image-btn:hover {
  background: rgba(255, 0, 0, 1);
}

.mt-2 {
  margin-top: 8px;
}



</style>