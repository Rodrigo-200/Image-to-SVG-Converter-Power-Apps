<script setup>
import { ref, computed } from 'vue'
import { Link, Loader, AlertCircle, CheckCircle, Sparkles } from 'lucide-vue-next'

const emit = defineEmits(['image-selected'])

const imageUrl = ref('')
const isLoading = ref(false)
const error = ref('')
const loadedImageFile = ref(null)
const showSuccess = ref(false)
const isAnimating = ref(false)

const isValidUrl = computed(() => {
  try {
    const url = new URL(imageUrl.value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
})

const canLoadImage = computed(() => {
  return imageUrl.value.trim() && isValidUrl.value
})

const loadImageFromUrl = async () => {
  if (!canLoadImage.value) return
    isLoading.value = true
  error.value = ''
  loadedImageFile.value = null
  isAnimating.value = true
  
  try {
    // Create a proxy to handle CORS issues
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl.value)}`
    
    const response = await fetch(proxyUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to load image: ${response.status} ${response.statusText}`)
    }
    
    const blob = await response.blob()
    
    // Check if it's actually an image
    if (!blob.type.startsWith('image/')) {
      throw new Error('The URL does not point to a valid image file')
    }
      // Create a File object from the blob
    const fileName = getFileNameFromUrl(imageUrl.value) || 'image.jpg'
    const file = new File([blob], fileName, { type: blob.type })
    
    loadedImageFile.value = file
    showSuccess.value = true
    emit('image-selected', file)
    
    // Hide success indicator after delay
    setTimeout(() => {
      showSuccess.value = false
    }, 2000)
    
  } catch (err) {
    console.error('Error loading image:', err)
    error.value = err.message || 'Failed to load image from URL'
    
    // Fallback: try direct loading (will work if CORS allows)
    if (err.message.includes('CORS') || err.message.includes('allorigins')) {
      try {        const directResponse = await fetch(imageUrl.value)
        if (directResponse.ok) {
          const blob = await directResponse.blob()
          if (blob.type.startsWith('image/')) {
            const fileName = getFileNameFromUrl(imageUrl.value) || 'image.jpg'
            const file = new File([blob], fileName, { type: blob.type })
            
            loadedImageFile.value = file
            showSuccess.value = true
            emit('image-selected', file)
            error.value = ''
            
            // Hide success indicator after delay
            setTimeout(() => {
              showSuccess.value = false
            }, 2000)
          }
        }
      } catch {
        error.value = 'Unable to load image. The server may not allow cross-origin requests.'
      }
    }
  } finally {
    isLoading.value = false
    isAnimating.value = false
  }
}

const getFileNameFromUrl = (url) => {
  try {
    const pathname = new URL(url).pathname
    const segments = pathname.split('/')
    const fileName = segments[segments.length - 1]
    return fileName && fileName.includes('.') ? fileName : null
  } catch {
    return null
  }
}

const clearUrl = () => {
  imageUrl.value = ''
  error.value = ''
  loadedImageFile.value = null
}

const handlePaste = async (e) => {
  const clipboardText = e.clipboardData?.getData('text')
  if (clipboardText && isUrlLike(clipboardText)) {
    imageUrl.value = clipboardText
    // Auto-load if it looks like an image URL
    if (looksLikeImageUrl(clipboardText)) {
      await loadImageFromUrl()
    }
  }
}

const isUrlLike = (text) => {
  return text.startsWith('http://') || text.startsWith('https://')
}

const looksLikeImageUrl = (url) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
  const lowerUrl = url.toLowerCase()
  return imageExtensions.some(ext => lowerUrl.includes(ext))
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
  <div class="url-input-container">
    <div class="input-section">      <div class="input-group">
        <div class="input-wrapper" :class="{ 'loading': isLoading, 'success': loadedImageFile }">
          <div class="input-icon-container">
            <Link class="input-icon" />
            <Sparkles v-if="showSuccess" class="success-sparkles" />
          </div>
          <input
            v-model="imageUrl"
            type="url"
            placeholder="Enter image URL (https://example.com/image.jpg)"
            class="url-input"
            :class="{ 'animating': isAnimating }"
            @paste="handlePaste"
            @keydown.enter="loadImageFromUrl"
          />
          <button
            v-if="imageUrl"
            @click="clearUrl"
            class="clear-btn"
            type="button"
          >
            ×
          </button>
        </div>
          <button
          @click="loadImageFromUrl"
          :disabled="!canLoadImage || isLoading"
          class="load-btn"
          :class="{ 'loading': isLoading, 'success': loadedImageFile }"
          type="button"
        >
          <Loader v-if="isLoading" class="btn-icon animate-spin" />
          <CheckCircle v-else-if="loadedImageFile" class="btn-icon success-icon" />
          <span v-else>Load Image</span>
        </button>
      </div>
        <div class="url-validation">
        <div v-if="imageUrl && !isValidUrl" class="validation-message error slide-in">
          <AlertCircle class="validation-icon" />
          Please enter a valid URL starting with http:// or https://
        </div>
        
        <div v-if="error" class="validation-message error slide-in">
          <AlertCircle class="validation-icon" />
          {{ error }}
        </div>
        
        <div v-if="loadedImageFile" class="validation-message success slide-in">
          <CheckCircle class="validation-icon" />
          Image loaded successfully ({{ formatFileSize(loadedImageFile.size) }})
        </div>
      </div>
    </div>
    
    <div class="examples">
      <h4>Example URLs:</h4>
      <div class="example-urls">
        <button
          v-for="example in exampleUrls"
          :key="example.url"
          @click="imageUrl = example.url"
          class="example-btn"
          type="button"
        >
          {{ example.label }}
        </button>
      </div>
    </div>
    
    <div class="tips">
      <h4>Tips:</h4>
      <ul>
        <li>Right-click any image on the web and select "Copy image address"</li>
        <li>Make sure the URL ends with an image extension (.jpg, .png, etc.)</li>
        <li>Some websites may block direct image access due to CORS policies</li>
        <li>You can paste URLs directly into the input field</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      exampleUrls: [
        {
          url: 'https://via.placeholder.com/300x200/0078d4/ffffff?text=Sample+Image',
          label: 'Sample Blue Image'
        },
        {
          url: 'https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Demo+Image',
          label: 'Sample Red Image'
        },
        {
          url: 'https://via.placeholder.com/250x250/51cf66/ffffff?text=Square',
          label: 'Square Green Image'
        }
      ]
    }
  }
}
</script>

<style scoped>
.url-input-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  gap: 0.75rem;
}

.input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-wrapper.loading {
  transform: scale(1.01);
}

.input-wrapper.success {
  animation: successPulse 0.6s ease-out;
}

@keyframes successPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.input-icon-container {
  position: absolute;
  left: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-wrapper.loading .input-icon {
  color: var(--primary-color);
  transform: scale(1.1);
}

.success-sparkles {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 1rem;
  height: 1rem;
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

.url-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  font-size: 0.875rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.url-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-light);
  transform: translateY(-1px);
}

.url-input.animating {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-light);
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--text-muted);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  line-height: 1;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: var(--error-color);
}

.load-btn {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-medium);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.load-btn:hover:not(:disabled) {
  background: var(--primary-color-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.load-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.load-btn.loading {
  background: var(--primary-color-dark);
  transform: scale(0.98);
}

.load-btn.success {
  background: var(--success-color);
  animation: successBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes successBounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.btn-icon.success-icon {
  animation: iconSuccess 0.5s ease-out;
}

@keyframes iconSuccess {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.url-validation {
  min-height: 1.5rem;
}

.validation-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  padding: 0.5rem;
  border-radius: var(--radius-small);
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.validation-message.slide-in {
  opacity: 1;
  transform: translateY(0);
}

.validation-message.error {
  background: #fef2f2;
  color: var(--error-color);
  border: 1px solid #fecaca;
}

.validation-message.success {
  background: #f0fdf4;
  color: var(--success-color);
  border: 1px solid #bbf7d0;
}

.validation-icon {
  width: 1rem;
  height: 1rem;
}

.examples {
  background: var(--bg-secondary);
  border-radius: var(--radius-medium);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.examples h4 {
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.example-urls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.example-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.example-btn:hover {
  background: var(--primary-color-light);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.tips {
  background: var(--bg-secondary);
  border-radius: var(--radius-medium);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.tips h4 {
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.tips ul {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--text-secondary);
}

.tips li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.tips li:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .input-group {
    flex-direction: column;
  }
  
  .example-urls {
    flex-direction: column;
  }
  
  .examples,
  .tips {
    padding: 1rem;
  }
}
</style>
