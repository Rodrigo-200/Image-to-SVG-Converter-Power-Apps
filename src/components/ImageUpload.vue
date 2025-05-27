<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { Upload, FileImage, X, Sparkles } from 'lucide-vue-next'

const emit = defineEmits(['image-selected'])

const dragActive = ref(false)
const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)
const isAnimating = ref(false)
const showSuccess = ref(false)

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
    // Trigger success animation
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 1500)
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
    isAnimating.value = true
    setTimeout(() => {
      selectedFile.value = file
      emit('image-selected', file)
      isAnimating.value = false
    }, 300)
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
        <div class="upload-icon-container" :class="{ 'animating': isAnimating }">
          <Upload class="upload-icon" />
          <Sparkles v-if="showSuccess" class="success-sparkles" />
        </div>
        <h3>Drag & drop your image here</h3>
        <p>or <span class="link-text">click to browse</span></p>
        <div class="supported-formats">
          <small>Supported formats: JPG, PNG, GIF, WEBP, BMP</small>
        </div>
      </div>
      
      <div v-else class="file-selected" :class="{ 'slide-in': selectedFile }">        <div class="selected-info" :class="{ 'fade-in': selectedFile }">
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
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.drop-zone:hover .upload-icon {
  transform: scale(1.1);
  color: var(--primary-color);
}

.drop-zone:hover .upload-content h3 {
  color: var(--primary-color);
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
  animation: successPulse 0.6s ease-out;
}

@keyframes successPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
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

.upload-icon-container {
  position: relative;
  margin-bottom: 0.5rem;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  color: var(--text-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-icon-container.animating .upload-icon {
  transform: scale(1.1);
  color: var(--primary-color);
}

.success-sparkles {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--success-color);
  animation: sparkle 1.5s ease-out;
}

@keyframes sparkle {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 0;
  }
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
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.file-selected.slide-in {
  opacity: 1;
  transform: translateY(0);
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s;
}

.selected-info.fade-in {
  opacity: 1;
  transform: translateX(0);
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
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
}

.file-selected.slide-in .clear-btn {
  opacity: 1;
  transform: scale(1);
}

.clear-btn:hover {
  background: #b91c1c;
  transform: scale(1.05);
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
