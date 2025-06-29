<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { Eye, EyeOff, RotateCcw, Zap, Diamond } from 'lucide-vue-next'

const props = defineProps({
  image: {
    type: File,
    default: null
  },
  svgResult: {
    type: String,
    default: ''
  },
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  isLivePreview: {
    type: Boolean,
    default: false
  },
  removeBorder: {
    type: Boolean,
    default: false
  },
  // New props for batch processing
  imageQueue: {
    type: Array,
    default: () => []
  },
  currentImageIndex: {
    type: Number,
    default: 0
  },
  hasMultipleImages: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['remove-image', 'switch-image'])

const showOriginal = ref(true)
const previewContainer = ref(null)
const imageUrl = ref(null)
const showInfoMobile = ref(false)

// Create and manage blob URL for the image
watch(() => props.image, (newImage, oldImage) => {
  // Clean up old URL
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value)
    imageUrl.value = null
  }
  
  // Create new URL if we have an image
  if (newImage) {
    imageUrl.value = URL.createObjectURL(newImage)
  }
}, { immediate: true })

// Clean up on component unmount
onBeforeUnmount(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value)
  }
})

const originalImageUrl = computed(() => {
  return imageUrl.value
})

const hasContent = computed(() => {
  return originalImageUrl.value || props.svgResult
})

const canToggleView = computed(() => {
  return originalImageUrl.value && (props.svgResult || props.isLivePreview)
})

const svgSize = computed(() => {
  if (!props.svgResult) return 0
  return new Blob([props.svgResult]).size
})

const toggleView = () => {
  if (canToggleView.value) {
    showOriginal.value = !showOriginal.value
  }
}

const resetView = () => {
  showOriginal.value = true
}

// Watch for changes in SVG result to auto-switch to SVG view
watch(() => props.svgResult, (newValue) => {
  if (newValue && canToggleView.value) {
    showOriginal.value = false
  }
})

// Auto-switch to SVG view when live preview has border detection enabled
watch([() => props.svgResult, () => props.removeBorder, () => props.isLivePreview], ([svgResult, removeBorder, isLivePreview]) => {
  // If we have a live preview and border removal is enabled, show SVG view to display orange borders
  if (svgResult && isLivePreview && removeBorder && canToggleView.value) {
    showOriginal.value = false
  }
})

const getImageDimensions = (file) => {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url) // Clean up the blob URL
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url) // Clean up the blob URL even on error
      resolve({ width: 0, height: 0 })
    }
    img.src = url
  })
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Add live preview indicator
const isUpdating = ref(false)

// Watch for SVG changes to show update indicator
watch(() => props.svgResult, () => {
  if (props.isLivePreview) {
    isUpdating.value = true
    setTimeout(() => {
      isUpdating.value = false
    }, 300)
  }
})

// Add border detection preview functionality
const showBorderPreview = ref(false)
const borderPreviewUrl = ref(null)

const toggleBorderPreview = () => {
  showBorderPreview.value = !showBorderPreview.value
}

// Create a visual preview of where borders will be removed
const createBorderPreview = async (imageFile) => {
  if (!imageFile) return null
  
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const url = URL.createObjectURL(imageFile)
    
    return new Promise((resolve) => {
      img.onload = () => {
        URL.revokeObjectURL(url) // Clean up the blob URL
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx.drawImage(img, 0, 0)
        
        // Draw border detection overlay
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0
        
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4
            const r = data[index], g = data[index + 1], b = data[index + 2], a = data[index + 3]
            
            if (a > 10 && (r < 250 || g < 250 || b < 250)) {
              minX = Math.min(minX, x)
              minY = Math.min(minY, y)
              maxX = Math.max(maxX, x)
              maxY = Math.max(maxY, y)
            }
          }
        }
        
        // Draw border outline
        ctx.strokeStyle = '#ff0000'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY)
        
        resolve(canvas.toDataURL())
      }
      img.onerror = () => {
        URL.revokeObjectURL(url) // Clean up the blob URL even on error
        resolve(null)
      }
      img.src = url
    })
  } catch (err) {
    return null
  }
}

// Watch for image changes to update border preview
watch(() => props.image, async (newImage) => {
  if (newImage && showBorderPreview.value) {
    borderPreviewUrl.value = await createBorderPreview(newImage)
  } else {
    borderPreviewUrl.value = null
  }
})

// Watch for border preview toggle
watch(showBorderPreview, async (show) => {
  if (show && props.image) {
    borderPreviewUrl.value = await createBorderPreview(props.image)
  } else {
    borderPreviewUrl.value = null
  }
})

// File queue management
const removeCurrentImage = () => {
  emit('remove-image', props.currentImageIndex)
}

const switchToImage = (index) => {
  emit('switch-image', index)
}

const canRemoveSingle = computed(() => {
  return props.hasMultipleImages
})
</script>

<template>
  <div class="preview-area">    <div class="preview-header">
      <h3>Preview</h3>
      
      <div v-if="canToggleView" class="preview-controls">
        <button
          @click="toggleView"
          class="toggle-btn"
          :class="{ active: showOriginal }"
          type="button"
        >
          <Eye class="btn-icon" />
          Original
        </button>
        <button
          @click="toggleView"
          class="toggle-btn"
          :class="{ active: !showOriginal }"
          type="button"
        >
          <EyeOff class="btn-icon" />
          SVG
        </button>
        
        <!-- Live Preview Indicator -->
        <div v-if="isUpdating" class="live-indicator">
          <Zap class="indicator-icon" />
          <span>Live Preview</span>
        </div>
        
        <button
          @click="resetView"
          class="reset-btn"
          type="button"
        >
          <RotateCcw class="btn-icon" />
          Reset
        </button>
      </div>
    </div>

    <div v-if="!hasContent" class="no-content">
      <div class="no-content-message">
        <Eye class="no-content-icon" />
        <p>No image selected</p>
        <small>Upload, paste, or enter a URL to see the preview</small>
      </div>
    </div>

    <div v-else class="preview-container" ref="previewContainer">
      <div 
        class="preview-background"
        :style="{ backgroundColor: backgroundColor }"
      >
        <!-- Original Image -->
        <div 
          v-if="showOriginal && originalImageUrl"
          class="image-preview"
        >
          <img
            :src="originalImageUrl"
            :alt="image?.name || 'Uploaded image'"
            class="preview-image"
          />
        </div>

        <!-- SVG Result -->
        <div 
          v-if="!showOriginal && svgResult"
          class="svg-preview"
          v-html="svgResult"
        ></div>        <!-- Live Preview Updating Indicator -->
        <div v-if="isUpdating" class="updating-indicator">
          <Zap class="updating-icon" />
          <span>Updating...</span>
        </div>
      </div>
    </div>    <!-- Image Info -->
    <div v-if="hasContent" class="image-info">
      <!-- Mobile Collapsible Header -->
      <div class="mobile-info-header" @click="showInfoMobile = !showInfoMobile">
        <h4>{{ showOriginal ? 'Original' : 'SVG' }} Image Details</h4>
        <component :is="showInfoMobile ? ChevronUp : ChevronDown" class="mobile-chevron" />
      </div>
      
      <!-- Info Content -->
      <div class="info-content" :class="{ 'mobile-collapsed': !showInfoMobile }">
        <div class="info-section">          <h4 class="desktop-title">{{ showOriginal ? 'Original' : 'SVG' }} Image</h4>
          <!-- Border removal info -->
          <div v-if="removeBorder && !showOriginal && (svgResult || isLivePreview)" class="border-info-message">
            <Diamond class="border-icon-svg" />
            <span class="border-message-text">
              {{ isLivePreview ? 'Live preview: Orange areas show borders that will be removed' : 'Orange highlighted areas show detected borders that were removed' }}
            </span>
          </div>
        
        <div class="info-details">
          <div v-if="image" class="info-item">
            <span class="info-label">File:</span>
            <span class="info-value">{{ image.name }}</span>
          </div>
          <div v-if="image" class="info-item">
            <span class="info-label">Size:</span>
            <span class="info-value">{{ formatFileSize(image.size) }}</span>
          </div>
          <div v-if="image" class="info-item">
            <span class="info-label">Type:</span>
            <span class="info-value">{{ image.type }}</span>
          </div>          <div v-if="svgResult" class="info-item">
            <span class="info-label">SVG Size:</span>
            <span class="info-value">{{ formatFileSize(svgSize) }}</span>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Background Color Info -->
    <div class="background-info">
      <small>Preview background: {{ backgroundColor }}</small>
    </div>
  </div>
</template>

<style scoped>
.preview-area {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.preview-controls {
  display: flex;
  gap: 0.5rem;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-small);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-btn:hover {
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.toggle-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.reset-btn {
  padding: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-small);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.reset-btn:hover {
  background: rgba(108, 117, 125, 0.1);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.no-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-large);
  min-height: 300px;
}

.no-content-message {
  text-align: center;
  color: var(--text-secondary);
}

.no-content-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  color: var(--text-muted);
}

.preview-container {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-large);
  overflow: hidden;
  min-height: 300px;
}

.preview-background {
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
}

.image-preview,
.svg-preview {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-medium);
}

.svg-preview {
  max-width: 100%;
  max-height: 100%;
}

.svg-preview :deep(svg) {
  max-width: 100%;
  max-height: 100%;
  height: auto;
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-medium);
}

.image-info {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  padding: 1rem;
}

.mobile-info-header {
  display: none;
}

.desktop-title {
  display: block;
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
}

/* Ensure desktop title is visible on larger screens */
@media (min-width: 769px) {
  .desktop-title {
    display: block !important;
  }
  
  .mobile-info-header {
    display: none !important;
  }
  
  .info-content {
    max-height: none !important;
    opacity: 1 !important;
    margin-top: 0.5rem !important;
    display: block !important;
  }
  
  .info-content.mobile-collapsed {
    max-height: none !important;
    opacity: 1 !important;
    margin-top: 0.5rem !important;
    display: block !important;
  }
}

.info-content {
  transition: all 0.3s ease;
}

.mobile-collapsed {
  display: none;
}

.info-section h4 {
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.border-info-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: var(--radius-small);
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.border-icon {
  font-size: 1rem;
}

.border-icon-svg {
  width: 1rem;
  height: 1rem;
  color: #ff9800;
  stroke-width: 2;
}

.border-message-text {
  color: #ff9800;
  font-weight: 500;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.info-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  background: var(--bg-secondary);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-small);
  font-size: 0.75rem;
}

.background-info {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.75rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-small);
}

.updating-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-small);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  box-shadow: var(--shadow-medium);
}

.updating-icon {
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  border-radius: var(--radius-small);
  font-size: 0.875rem;
  font-weight: 500;
  animation: pulse 1.5s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(0, 120, 212, 0.3);
}

.indicator-icon {
  width: 1rem;
  height: 1rem;
  animation: zap 0.8s ease-in-out infinite;
}

.preview-content {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: var(--bg-secondary);
  border-radius: var(--radius-medium);
  border: 2px dashed var(--border-color);
  transition: all 0.3s ease;
}

.border-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.border-preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.8;
  border-radius: var(--radius-medium);
}

.preview-content:hover .border-preview-image {
  opacity: 1;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

@keyframes zap {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-5deg) scale(1.1); }
  75% { transform: rotate(5deg) scale(1.1); }
}

@media (max-width: 768px) {
  .preview-area {
    margin: 0;
    gap: 0.75rem;
  }

  .preview-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
  }
  
  .preview-header h3 {
    font-size: 1.125rem;
    margin: 0;
  }
  
  .preview-controls {
    justify-content: center;
    gap: 0.375rem;
  }
  
  .toggle-btn, .reset-btn {
    flex: 1;
    justify-content: center;
    padding: 0.625rem 0.75rem;
    font-size: 0.8rem;
    min-height: 42px;
  }
  
  .btn-icon {
    width: 0.875rem;
    height: 0.875rem;
  }
  
  .live-indicator {
    padding: 0.375rem 0.625rem;
    font-size: 0.75rem;
    margin: 0 auto;
  }
  
  .indicator-icon {
    width: 0.875rem;
    height: 0.875rem;
  }
  
  .preview-container {
    min-height: 200px;
    margin: 0;
  }
  
  .preview-background {
    min-height: 200px;
    padding: 0.75rem;
  }
  
  .no-content {
    min-height: 200px;
  }
  
  .no-content-icon {
    width: 2rem;
    height: 2rem;
    margin-bottom: 0.75rem;
  }
  
  .no-content-message p {
    font-size: 0.875rem;
    margin: 0.5rem 0;
  }
  
  .no-content-message small {
    font-size: 0.75rem;
  }
    .image-info {
    padding: 0;
    border: none;
    background: transparent;
  }
  
  .mobile-info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-medium);
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
  }
  
  .mobile-info-header:hover {
    background: var(--bg-secondary);
  }
  
  .mobile-info-header h4 {
    font-size: 0.875rem;
    margin: 0;
    color: var(--text-primary);
  }
  
  .mobile-chevron {
    width: 1rem;
    height: 1rem;
    color: var(--text-secondary);
    transition: transform 0.2s ease;
  }
  
  .desktop-title {
    display: none !important;
  }
  
  .info-content {
    overflow: hidden;
    margin-top: 0.5rem;
  }
  
  .info-content:not(.mobile-collapsed) .info-section {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-medium);
    padding: 0.75rem;
  }  .mobile-collapsed {
    max-height: 0;
    margin-top: 0;
    opacity: 0;
  }
  
  .info-section h4 {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .border-info-message {
    padding: 0.375rem 0.625rem;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
  }
  
  .info-details {
    gap: 0.375rem;
  }
  
  .info-item {
    font-size: 0.75rem;
    padding: 0.25rem 0;
  }
  
  .info-value {
    font-size: 0.7rem;
    padding: 0.1rem 0.25rem;
  }
  
  .background-info {
    font-size: 0.7rem;
    padding: 0.375rem;
    margin: 0;
  }
  
  .updating-indicator {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.375rem 0.625rem;
    font-size: 0.75rem;
  }
  
  .updating-icon {
    width: 0.875rem;
    height: 0.875rem;  }
}
</style>
