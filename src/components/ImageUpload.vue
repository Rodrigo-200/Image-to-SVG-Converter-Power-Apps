<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { Upload, FileImage, X } from 'lucide-vue-next'

const emit = defineEmits(['image-selected'])

const dragActive = ref(false)
const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)

const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']

const isValidFile = (file) => {
  return file && acceptedTypes.includes(file.type)
}

// Watch for file changes to create/cleanup preview URL
watch(selectedFile, (newFile, oldFile) => {
  // Clean up old URL
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  
  // Create new URL if we have a file
  if (newFile) {
    previewUrl.value = URL.createObjectURL(newFile)
  }
}, { immediate: true })

// Clean up on component unmount
onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})

const handleFileSelect = (file) => {
  if (isValidFile(file)) {
    selectedFile.value = file
    emit('image-selected', file)
  } else {
    alert('Please select a valid image file (JPG, PNG, GIF, WEBP, BMP)')
  }
}

const handleDrop = (e) => {
  e.preventDefault()
  dragActive.value = false
  
  const files = Array.from(e.dataTransfer.files)
  if (files.length > 0) {
    handleFileSelect(files[0])
  }
}

const handleDragOver = (e) => {
  e.preventDefault()
  dragActive.value = true
}

const handleDragLeave = (e) => {
  e.preventDefault()
  dragActive.value = false
}

const openFileDialog = () => {
  fileInput.value?.click()
}

const handleFileInputChange = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    handleFileSelect(file)
  }
}

const clearSelection = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<template>
  <div class="upload-container">
    <div 
      class="drop-zone"
      :class="{ 
        'drag-active': dragActive,
        'has-file': selectedFile
      }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="openFileDialog"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedTypes.join(',')"
        @change="handleFileInputChange"
        class="file-input"
      />
      
      <div v-if="!selectedFile" class="upload-content">
        <Upload class="upload-icon" />
        <h3>Drag & drop your image here</h3>
        <p>or <span class="link-text">click to browse</span></p>
        <div class="supported-formats">
          <small>Supported formats: JPG, PNG, GIF, WEBP, BMP</small>
        </div>
      </div>      <div v-else class="file-selected">
        <div class="selected-info">
          <FileImage class="file-icon" />
          <div class="file-details">
            <div class="file-name">{{ selectedFile.name }}</div>
            <div class="file-meta">{{ formatFileSize(selectedFile.size) }} • {{ selectedFile.type.split('/')[1].toUpperCase() }}</div>
          </div>
        </div>
        <button
          class="clear-btn"
          @click.stop="clearSelection"
          type="button"
          title="Remove image"
        >
          <X class="clear-icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-container {
  width: 100%;
}

.drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-large);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-primary);
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone:hover {
  border-color: var(--primary-color);
  background: var(--primary-color-light);
}

.drop-zone.drag-active {
  border-color: var(--primary-color);
  background: var(--primary-color-light);
  transform: scale(1.02);
}

.drop-zone.has-file {
  border-style: solid;
  border-color: var(--success-color);
  background: var(--bg-secondary);
}

.file-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.upload-content h3 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.25rem;
}

.upload-content p {
  color: var(--text-secondary);
  margin: 0;
}

.link-text {
  color: var(--primary-color);
  font-weight: 500;
}

.supported-formats {
  color: var(--text-muted);
  margin-top: 1rem;
}

.file-selected {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: var(--radius-medium);
  border: 1px solid var(--success-color);
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--success-color);
}

.file-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.file-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.clear-btn {
  padding: 0.5rem;
  background: var(--error-color);
  color: white;
  border-radius: var(--radius-small);
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover {
  background: #b91c1c;
}

.clear-icon {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 768px) {
  .drop-zone {
    padding: 1.5rem 1rem;
    min-height: 120px;
    margin: 0;
  }
  
  .upload-icon {
    width: 2rem;
    height: 2rem;
  }
  
  .upload-content h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .upload-content p {
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }
  
  .upload-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    width: 100%;
    max-width: 200px;
  }
    .file-selected {
    padding: 0.75rem;
  }
  
  .file-name {
    font-size: 0.8rem;
  }
  
  .file-meta {
    font-size: 0.7rem;
  }
  
  .file-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}
</style>
