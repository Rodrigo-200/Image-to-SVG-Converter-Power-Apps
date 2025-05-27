<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Upload, FileImage, X, Clipboard, Link, Loader, CheckCircle, AlertCircle, Camera, Sparkles, RotateCcw } from 'lucide-vue-next'

const emit = defineEmits(['image-selected', 'reset-app'])

// State management
const activeMethod = ref('upload')
const dragActive = ref(false)
const selectedFile = ref(null)
const previewUrl = ref(null)
const isAnimating = ref(false)
const showSuccess = ref(false)

// File upload state
const fileInput = ref(null)

// URL input state
const imageUrl = ref('')
const isUrlLoading = ref(false)
const urlError = ref('')
const isAutoLoading = ref(false) // New state for auto-loading indicator

// Clipboard state
const showPasteHint = ref(true)
const lastPastedFile = ref(null)

// Camera state (for future implementation)
const cameraSupported = ref(false)

const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']

const inputMethods = [
  { id: 'upload', label: 'Upload', icon: Upload, description: 'Choose file from device' },
  { id: 'clipboard', label: 'Paste', icon: Clipboard, description: 'Paste from clipboard' },
  { id: 'url', label: 'URL', icon: Link, description: 'Load from web URL' },
  { id: 'camera', label: 'Camera', icon: Camera, description: 'Take photo', disabled: !cameraSupported.value }
]

// Computed properties
const isValidFile = (file) => {
  return file && acceptedTypes.includes(file.type)
}

const isValidUrl = computed(() => {
  try {
    const url = new URL(imageUrl.value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
})

const canLoadUrl = computed(() => {
  return imageUrl.value.trim() && isValidUrl.value
})

// Watch for file changes to create/cleanup preview URL
watch(selectedFile, (newFile, oldFile) => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  
  if (newFile) {
    previewUrl.value = URL.createObjectURL(newFile)
    showSuccessAnimation()
  }
}, { immediate: true })

// Clean up on component unmount
onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})

// Success animation
const showSuccessAnimation = () => {
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 1500)
}

// File handling
const handleFileSelect = (file) => {
  if (isValidFile(file)) {
    isAnimating.value = true
    setTimeout(() => {
      selectedFile.value = file
      emit('image-selected', file)
      isAnimating.value = false
    }, 300)
  } else {
    displayError('Please select a valid image file (JPG, PNG, GIF, WEBP, BMP)')
  }
}

// Drag and drop
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
  if (!e.currentTarget.contains(e.relatedTarget)) {
    dragActive.value = false
  }
}

// File input
const openFileDialog = () => {
  fileInput.value?.click()
}

const handleFileInputChange = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    handleFileSelect(file)
  }
}

// URL input
const loadImageFromUrl = async () => {
  if (!canLoadUrl.value) return
  
  isUrlLoading.value = true
  urlError.value = ''
  isAnimating.value = true
  
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl.value)}`
    const response = await fetch(proxyUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to load image: ${response.status} ${response.statusText}`)
    }
    
    const blob = await response.blob()
    
    if (!blob.type.startsWith('image/')) {
      throw new Error('The URL does not point to a valid image file')
    }
    
    const fileName = getFileNameFromUrl(imageUrl.value) || 'image.jpg'
    const file = new File([blob], fileName, { type: blob.type })
    
    handleFileSelect(file)
    
  } catch (error) {
    urlError.value = error.message
  } finally {
    isUrlLoading.value = false
    isAnimating.value = false
  }
}

// Handle paste in URL input
const handleUrlPaste = async (e) => {
  try {
    const pastedText = e.clipboardData?.getData('text') || ''
    if (pastedText.trim()) {
      // Let the normal paste happen first, then validate
      setTimeout(() => {
        if (isValidUrl.value) {
          // Show auto-loading indicator
          isAutoLoading.value = true
          setTimeout(() => {
            isAutoLoading.value = false
            // Auto-load if it's a valid URL
            loadImageFromUrl()
          }, 800) // Brief delay to show the indicator
        }
      }, 100)
    }
  } catch (error) {
    console.warn('Error handling URL paste:', error)
  }
}

const getFileNameFromUrl = (url) => {
  try {
    const pathname = new URL(url).pathname
    const segments = pathname.split('/')
    return segments[segments.length - 1] || null
  } catch {
    return null
  }
}

// Clipboard handling
const handlePaste = async (e) => {
  e.preventDefault()
  
  const items = Array.from(e.clipboardData?.items || [])
  const imageItem = items.find(item => item.type.startsWith('image/'))
  
  if (imageItem) {
    const file = imageItem.getAsFile()
    if (file) {
      isAnimating.value = true
      setTimeout(() => {
        lastPastedFile.value = file
        showPasteHint.value = false
        handleFileSelect(file)
        setTimeout(() => {
          showPasteHint.value = true
        }, 2000)
      }, 300)    } else {
      displayError('Failed to get image from clipboard.')
    }
  } else {
    // Only show error if we're on the clipboard tab and actively trying to paste
    if (activeMethod.value === 'clipboard') {
      displayError('No image found in clipboard. Please copy an image first.')
    }
  }
}

// Global paste listener
onMounted(() => {
  document.addEventListener('paste', handlePaste)
  
  // Check camera support
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    cameraSupported.value = true
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('paste', handlePaste)
})

// Utility functions
const clearSelection = () => {
  selectedFile.value = null
  imageUrl.value = ''
  urlError.value = ''
  showError.value = false
  errorMessage.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  // Emit reset event to parent
  emit('reset-app')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Error handling state
const errorMessage = ref('')
const showError = ref(false)

const displayError = (message) => {
  errorMessage.value = message
  showError.value = true
  setTimeout(() => {
    showError.value = false
  }, 4000)
}

const switchMethod = (method) => {
  activeMethod.value = method
  clearSelection()
}

const resetEverything = () => {
  clearSelection()
  activeMethod.value = 'upload' // Reset to default method
}
</script>

<template>  <div class="unified-input-container">
    <!-- Error Toast -->
    <Transition name="error-toast">
      <div v-if="showError" class="error-toast">
        <AlertCircle class="error-toast-icon" />
        <span>{{ errorMessage }}</span>
      </div>
    </Transition>    <!-- Method Selector -->
    <div class="method-selector">
      <div class="method-tabs">
        <button
          v-for="method in inputMethods"
          :key="method.id"
          class="method-tab"
          :class="{ 
            active: activeMethod === method.id,
            disabled: method.disabled 
          }"
          @click="!method.disabled && switchMethod(method.id)"
          :disabled="method.disabled"
        >
          <component :is="method.icon" class="method-icon" />
          <span class="method-label">{{ method.label }}</span>
          <span class="method-description">{{ method.description }}</span>
        </button>
      </div>
      
      <!-- Reset Button - Always visible -->
      <div v-if="selectedFile" class="reset-section">
        <button 
          class="reset-all-btn"
          @click="resetEverything"
          type="button"
          title="Start over - clear everything and go back to welcome"
        >
          <RotateCcw class="reset-icon" />
          <span>Start Over</span>
        </button>
      </div>
    </div><!-- Input Areas -->
    <div class="input-area" :class="{ 'has-file': selectedFile }">
      <!-- Show input methods only when no file is selected -->
      <div v-if="!selectedFile" class="input-methods">
        <!-- File Upload -->
        <div 
          v-if="activeMethod === 'upload'"
          class="upload-zone"
          :class="{ 
            'drag-active': dragActive,
            'animating': isAnimating
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
          
          <div class="upload-content">
            <div class="upload-icon-container" :class="{ 'animating': isAnimating }">
              <Upload class="upload-icon" />
              <Sparkles v-if="showSuccess" class="success-sparkles" />
            </div>
            <h3>Drop your image here</h3>
            <p>or <span class="link-text">click to browse</span></p>
            <div class="supported-formats">
              <small>JPG, PNG, GIF, WEBP, BMP</small>
            </div>
          </div>
        </div>

        <!-- Clipboard Paste -->
        <div 
          v-else-if="activeMethod === 'clipboard'"
          class="clipboard-zone"
          :class="{ 'animating': isAnimating }"
        >
          <div class="clipboard-content">
            <div class="clipboard-icon-container" :class="{ 'animating': isAnimating }">
              <Clipboard class="clipboard-icon" />
              <Sparkles v-if="showSuccess" class="success-sparkles" />
            </div>
            <h3>Press Ctrl+V to paste</h3>
            <p>Copy an image to your clipboard first</p>
            <div class="hint-keys">
              <kbd>Ctrl</kbd> + <kbd>V</kbd>
            </div>
          </div>
        </div>        <!-- URL Input -->
        <div 
          v-else-if="activeMethod === 'url'"
          class="url-zone"
          :class="{ 'animating': isAnimating, 'loading': isUrlLoading }"
        >
          <div class="url-content">
            <div class="url-icon-container" :class="{ 'animating': isAnimating }">
              <Link v-if="!isUrlLoading" class="url-icon" />
              <Loader v-else class="url-icon loading" />
              <Sparkles v-if="showSuccess" class="success-sparkles" />
            </div>
            <h3>{{ isUrlLoading ? 'Loading image...' : 'Enter image URL' }}</h3>            <div class="url-input-group">
              <input
                v-model="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg or paste with Ctrl+V"
                class="url-input"
                :disabled="isUrlLoading"
                @keyup.enter="loadImageFromUrl"
                @paste="handleUrlPaste"
              />
              <button
                class="load-url-btn"
                :disabled="!canLoadUrl || isUrlLoading"
                @click="loadImageFromUrl"
              >
                <Loader v-if="isUrlLoading" class="btn-icon loading" />
                <CheckCircle v-else class="btn-icon" />
              </button>
            </div>
            <div v-if="urlError" class="url-error">
              <AlertCircle class="error-icon" />
              {{ urlError }}
            </div>
          </div>
        </div>

        <!-- Camera (Future Implementation) -->
        <div 
          v-else-if="activeMethod === 'camera'"
          class="camera-zone disabled"
        >
          <div class="camera-content">
            <Camera class="camera-icon" />
            <h3>Camera capture</h3>
            <p>Coming soon...</p>
          </div>
        </div>
      </div>      <!-- File Selected Display -->
      <div v-if="selectedFile" class="file-selected">
        <div class="selected-info">
          <div class="file-preview">
            <img 
              v-if="previewUrl" 
              :src="previewUrl" 
              :alt="selectedFile.name"
              class="preview-thumbnail"
            />
            <FileImage v-else class="file-icon" />
          </div>
          <div class="file-details">
            <div class="file-name">{{ selectedFile.name }}</div>
            <div class="file-meta">{{ formatFileSize(selectedFile.size) }} • {{ selectedFile.type.split('/')[1].toUpperCase() }}</div>
            <div class="file-success">✓ Ready for conversion</div>
          </div>
        </div>        <button
          class="clear-btn"
          @click.stop="clearSelection"
          type="button"
          title="Remove image and start over"
        >
          <X class="clear-icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.unified-input-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

/* Error Toast */
.error-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: var(--error-color);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-medium);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: var(--shadow-large);
  z-index: 1000;
  max-width: 400px;
  font-size: 0.9rem;
}

.error-toast-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.error-toast-enter-active,
.error-toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.error-toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.error-toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.method-selector {
  margin-bottom: 1.5rem;
}

.method-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  background: var(--bg-secondary);
  padding: 0.5rem;
  border-radius: var(--radius-large);
  border: 1px solid var(--border-color);
}

.method-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0.75rem;
  border-radius: var(--radius-medium);
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.method-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--primary-color);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.method-tab:hover::before {
  opacity: 0.05;
}

.method-tab.active::before {
  opacity: 0.1;
}

.method-tab.active {
  background: var(--bg-primary);
  box-shadow: var(--shadow-small);
  transform: translateY(-1px);
}

.method-tab.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.method-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  z-index: 1;
  position: relative;
}

.method-tab.active .method-icon {
  color: var(--primary-color);
  transform: scale(1.1);
}

.method-label {
  font-weight: 500;
  color: var(--text-primary);
  margin-top: 0.5rem;
  z-index: 1;
  position: relative;
  font-size: 0.9rem;
}

.method-description {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  z-index: 1;
  position: relative;
}

.reset-section {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.reset-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-medium);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.reset-all-btn:hover {
  background: var(--error-color);
  color: white;
  border-color: var(--error-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.reset-icon {
  width: 1.125rem;
  height: 1.125rem;
  transition: transform 0.3s ease;
}

.reset-all-btn:hover .reset-icon {
  transform: rotate(-180deg);
}

.input-area {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-area.has-file {
  min-height: auto;
}

.input-methods {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Upload Zone */
.upload-zone {
  width: 100%;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-large);
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

.upload-zone::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-zone:hover {
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: var(--shadow-large);
}

.upload-zone:hover::before {
  opacity: 0.05;
}

.upload-zone.drag-active {
  border-color: var(--primary-color);
  transform: scale(1.02);
  box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
}

.upload-zone.drag-active::before {
  opacity: 0.1;
}

.upload-zone.animating {
  transform: scale(1.02);
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
  z-index: 1;
  position: relative;
}

.upload-icon-container {
  position: relative;
  margin-bottom: 0.5rem;
}

.upload-icon {
  width: 3.5rem;
  height: 3.5rem;
  color: var(--text-secondary);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-zone:hover .upload-icon {
  color: var(--primary-color);
  transform: scale(1.1) rotate(5deg);
}

.upload-icon-container.animating .upload-icon {
  animation: uploadPulse 0.6s ease-out;
}

@keyframes uploadPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Clipboard Zone */
.clipboard-zone {
  width: 100%;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-large);
  padding: 3rem 2rem;
  text-align: center;
  background: var(--bg-primary);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.clipboard-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.clipboard-icon-container {
  position: relative;
}

.clipboard-icon {
  width: 3.5rem;
  height: 3.5rem;
  color: var(--text-secondary);
  transition: all 0.4s ease;
}

.clipboard-zone:hover .clipboard-icon {
  color: var(--primary-color);
  transform: scale(1.1);
}

.hint-keys {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 1rem;
}

.hint-keys kbd {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-small);
  padding: 0.25rem 0.5rem;
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* URL Zone */
.url-zone {
  width: 100%;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-large);
  padding: 3rem 2rem;
  text-align: center;
  background: var(--bg-primary);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.url-zone.loading {
  border-color: var(--primary-color);
  background: rgba(var(--primary-rgb), 0.02);
}

.url-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.url-icon-container {
  position: relative;
}

.url-icon {
  width: 3.5rem;
  height: 3.5rem;
  color: var(--text-secondary);
  transition: all 0.4s ease;
}

.url-icon.loading {
  color: var(--primary-color);
  animation: spin 1s linear infinite;
}

.url-input-group {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  max-width: 400px;
  margin-top: 1rem;
}

.url-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.url-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.load-url-btn {
  padding: 0.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-medium);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  min-width: 44px;
}

.load-url-btn:hover:not(:disabled) {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
}

.load-url-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.btn-icon.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.url-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--error-color);
  font-size: 0.9rem;
  background: rgba(209, 52, 56, 0.1);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-medium);
  margin-top: 1rem;
}

.error-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

/* Camera Zone */
.camera-zone {
  width: 100%;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-large);
  padding: 3rem 2rem;
  text-align: center;
  background: var(--bg-primary);
  opacity: 0.6;
}

.camera-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.camera-icon {
  width: 3.5rem;
  height: 3.5rem;
  color: var(--text-muted);
}

/* Common Styles */
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

h3 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 1rem;
}

.link-text {
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
}

.supported-formats {
  color: var(--text-muted);
  margin-top: 1rem;
}

/* File Selected */
.file-selected {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-large);
  border: 2px solid var(--success-color);
  animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: var(--radius-medium);
  overflow: hidden;
  background: var(--bg-tertiary);
  border: 2px solid var(--success-color);
  flex-shrink: 0;
}

.preview-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  width: 2rem;
  height: 2rem;
  color: var(--success-color);
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
}

.file-meta {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.file-success {
  font-size: 0.8rem;
  color: var(--success-color);
  font-weight: 500;
  margin-top: 0.25rem;
}

.clear-btn {
  padding: 0.75rem;
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: var(--radius-medium);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: var(--error-color);
  transform: scale(1.05);
  box-shadow: var(--shadow-medium);
}

.clear-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .method-tabs {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .method-tab {
    padding: 0.75rem 0.5rem;
  }
  
  .method-label {
    font-size: 0.8rem;
  }
  
  .method-description {
    font-size: 0.7rem;
  }
  
  .upload-zone,
  .clipboard-zone,
  .url-zone,
  .camera-zone {
    padding: 2rem 1rem;
    min-height: 200px;
  }
  
  .upload-icon,
  .clipboard-icon,
  .url-icon,
  .camera-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  h3 {
    font-size: 1.25rem;
  }
  
  .url-input-group {
    flex-direction: column;
    gap: 0.5rem;
  }
    .file-selected {
    padding: 1rem;
  }
  
  .file-preview {
    width: 3rem;
    height: 3rem;
  }
  
  .file-icon {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .file-name {
    font-size: 0.9rem;
  }
    .file-meta {
    font-size: 0.75rem;
  }
    .error-toast {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
  
  .reset-section {
    margin-top: 0.75rem;
  }
  
  .reset-all-btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.8rem;
  }
  
  .reset-icon {
    width: 1rem;
    height: 1rem;
  }
}

@media (max-width: 480px) {
  .method-tabs {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .method-tab {
    flex-direction: row;
    text-align: left;
    padding: 0.75rem 1rem;
  }
  
  .method-icon {
    margin-right: 0.75rem;
    margin-bottom: 0;
  }
  
  .method-label {
    margin-top: 0;
    margin-bottom: 0.25rem;
  }
}
</style>
