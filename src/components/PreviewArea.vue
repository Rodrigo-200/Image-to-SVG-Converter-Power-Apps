<script setup>
import { ref, computed, watch } from 'vue'
import { Eye, EyeOff, RotateCcw } from 'lucide-vue-next'

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
  }
})

const showOriginal = ref(true)
const previewContainer = ref(null)

const originalImageUrl = computed(() => {
  return props.image ? URL.createObjectURL(props.image) : null
})

const hasContent = computed(() => {
  return originalImageUrl.value || props.svgResult
})

const canToggleView = computed(() => {
  return originalImageUrl.value && props.svgResult
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

const getImageDimensions = (file) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      resolve({ width: 0, height: 0 })
    }
    img.src = URL.createObjectURL(file)
  })
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
  <div class="preview-area">
    <div class="preview-header">
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
        <button
          @click="resetView"
          class="reset-btn"
          type="button"
        >
          <RotateCcw class="btn-icon" />
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
        ></div>
      </div>
    </div>

    <!-- Image Info -->
    <div v-if="hasContent" class="image-info">
      <div class="info-section">
        <h4>{{ showOriginal ? 'Original' : 'SVG' }} Image</h4>
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
          </div>
          <div v-if="svgResult" class="info-item">
            <span class="info-label">SVG Size:</span>
            <span class="info-value">{{ formatFileSize(new Blob([svgResult]).size) }}</span>
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

.info-section h4 {
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
  font-size: 1rem;
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

@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .preview-controls {
    justify-content: center;
  }
  
  .toggle-btn {
    flex: 1;
    justify-content: center;
  }
  
  .info-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
  }
  
  .info-value {
    text-align: left;
  }
}
</style>
