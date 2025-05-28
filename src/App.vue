<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import UnifiedImageInput from './components/UnifiedImageInput.vue'
import PreviewArea from './components/PreviewArea.vue'
import ControlsPanel from './components/ControlsPanel.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import MobileActionBar from './components/MobileActionBar.vue'
import { useImageConversion } from './composables/useImageConversion.js'
import { Download, Palette, Sparkles, Image, Zap, Smartphone, Box, Wifi, WifiOff } from 'lucide-vue-next'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { debounce, throttle, getOptimalProcessingSettings, PerformanceMonitor } from './utils/performance.js'

// Application state
const currentImage = ref(null)
const imageQueue = ref([]) // New: Array to hold multiple images
const currentImageIndex = ref(0) // New: Current image being viewed/processed
const showWelcome = ref(true)

// Performance optimization
const perfSettings = getOptimalProcessingSettings()
const isProcessingOptimized = ref(false)
const isBatchProcessing = ref(false) // Track if we're doing batch vs single image processing
let currentOperation = null

const settings = reactive({
  removeBorder: true,
  svgColor: '#000000',
  backgroundColor: '#ffffff',
  quality: 'medium',
  size: 'auto'
})

// Use composables
const {
  svgResult,
  livePreviewSvg,
  isProcessing,
  processingProgress,
  isBackendConnected,
  convertImageToSvg,
  updateLivePreview,
  changeSvgColor,
  downloadSvg,
  checkBackendConnection,
  getCurrentBackendUrl,
  error: conversionError
} = useImageConversion()

// Computed properties
const hasImage = computed(() => imageQueue.value.length > 0)
const hasSvgResult = computed(() => svgResult.value !== '')
const currentPreviewSvg = computed(() => livePreviewSvg.value || svgResult.value)
const hasMultipleImages = computed(() => imageQueue.value.length > 1)
const currentImageFile = computed(() => {
  if (imageQueue.value.length > 0 && currentImageIndex.value < imageQueue.value.length) {
    return imageQueue.value[currentImageIndex.value].file
  }
  return null
})
const currentImageData = computed(() => {
  if (imageQueue.value.length > 0 && currentImageIndex.value < imageQueue.value.length) {
    return imageQueue.value[currentImageIndex.value]
  }
  return null
})

// Watch for settings changes to update live preview (but don't update for color changes if we have SVG result)
// Debounced version for better performance on mobile
const debouncedUpdateLivePreview = debounce((imageFile, settings) => {
  if (currentOperation) {
    currentOperation.cancel()
  }
  
  const monitor = new PerformanceMonitor('live-preview-update')
  monitor.start()
  
  updateLivePreview(imageFile, settings).finally(() => {
    monitor.end()
  })
}, perfSettings.debounceDelay)

watch([() => settings.removeBorder, () => settings.size], () => {
  if (currentImageFile.value && !isProcessingOptimized.value) {
    isProcessingOptimized.value = true
    debouncedUpdateLivePreview(currentImageFile.value, settings)
    // Reset flag after debounce delay + buffer
    setTimeout(() => {
      isProcessingOptimized.value = false
    }, perfSettings.debounceDelay + 100)
  }
}, { flush: 'post' }) // Use post flush for better performance

// Throttled color change handler for better performance
const throttledColorChange = throttle((newColor) => {
  if (svgResult.value && newColor !== '#000000') {
    // Update existing SVG color without re-processing
    const updatedSvg = changeSvgColor(svgResult.value, newColor)
    // Note: we don't update svgResult here to avoid infinite loops
    // The preview will show the updated color
  } else if (currentImageFile.value && !svgResult.value && !isProcessingOptimized.value) {
    // Only update live preview if we don't have a final result yet
    isProcessingOptimized.value = true
    debouncedUpdateLivePreview(currentImageFile.value, settings)
    setTimeout(() => {
      isProcessingOptimized.value = false
    }, perfSettings.debounceDelay + 100)
  }
}, perfSettings.throttleLimit)

// Watch for color changes to update existing SVG
watch(() => settings.svgColor, throttledColorChange, { flush: 'post' })

// Methods
const handleImageSelected = (imageFileOrFiles) => {
  // Handle both single file and multiple files
  const files = Array.isArray(imageFileOrFiles) ? imageFileOrFiles : [imageFileOrFiles]
  
  // Create image data objects for each file
  const newImageData = files.map(file => ({
    file,
    id: Date.now() + Math.random(), // Unique ID for each image
    svgResult: '',
    livePreview: '',
    processed: false,
    error: null
  }))
  
  // Add to queue
  imageQueue.value.push(...newImageData)
  
  // Set current image to the first new one if we don't have one selected
  if (currentImageIndex.value >= imageQueue.value.length - newImageData.length) {
    currentImageIndex.value = imageQueue.value.length - newImageData.length
  }
  
  // Update current image reference for backwards compatibility
  currentImage.value = currentImageFile.value
  
  showWelcome.value = false
    // Start live preview for current image (optimized for mobile)
  if (currentImageFile.value) {
    // Use nextTick to ensure DOM is updated before processing
    nextTick(() => {
      debouncedUpdateLivePreview(currentImageFile.value, settings)
    })
  }
}

const removeImageFromQueue = (index) => {
  if (index >= 0 && index < imageQueue.value.length) {
    imageQueue.value.splice(index, 1)
    
    // Adjust current index if needed
    if (currentImageIndex.value >= imageQueue.value.length) {
      currentImageIndex.value = Math.max(0, imageQueue.value.length - 1)
    }
    
    // Update current image reference
    currentImage.value = currentImageFile.value
    
    // If no images left, show welcome
    if (imageQueue.value.length === 0) {
      showWelcome.value = true
      currentImage.value = null
      svgResult.value = ''
      livePreviewSvg.value = ''    } else if (currentImageFile.value) {
      // Update preview for new current image (optimized)
      nextTick(() => {
        debouncedUpdateLivePreview(currentImageFile.value, settings)
      })
    }
  }
}

const switchToImage = (index) => {
  if (index >= 0 && index < imageQueue.value.length) {
    currentImageIndex.value = index
    currentImage.value = currentImageFile.value
    
    // Load saved results for this image or update live preview
    const imageData = imageQueue.value[index]
    if (imageData.svgResult) {
      svgResult.value = imageData.svgResult
      livePreviewSvg.value = imageData.livePreview || ''    } else {
      svgResult.value = ''
      // Use debounced update for switching images
      nextTick(() => {
        debouncedUpdateLivePreview(currentImageFile.value, settings)
      })
    }
  }
}

const handleAppReset = () => {
  // Reset all application state
  currentImage.value = null
  imageQueue.value = []
  currentImageIndex.value = 0
  showWelcome.value = true
  
  // Clear SVG results
  svgResult.value = ''
  livePreviewSvg.value = ''
  
  // Reset settings to defaults
  Object.assign(settings, {
    removeBorder: true,
    svgColor: '#000000',
    backgroundColor: '#ffffff',
    quality: 'medium',
    size: 'auto'
  })
  
  // Reset mobile UI state
  mobileControlsExpanded.value = false
  mobileActionBarCollapsed.value = true
  mobilePreviewExpanded.value = true
}

const convertToSvg = async () => {
  if (!currentImageFile.value || !currentImageData.value) return
  
  try {
    // Mark as single image processing (not batch)
    isBatchProcessing.value = false
    
    // Mark current image as being processed
    currentImageData.value.processed = false
    currentImageData.value.error = null
    
    await convertImageToSvg(currentImageFile.value, {
      removeBorder: settings.removeBorder,
      svgColor: settings.svgColor === '#000000' ? null : settings.svgColor,
      quality: settings.quality,
      size: settings.size
    })
    
    // Save the result to the current image data
    currentImageData.value.svgResult = svgResult.value
    currentImageData.value.livePreview = livePreviewSvg.value
    currentImageData.value.processed = true
    
  } catch (error) {
    console.error('Error converting to SVG:', error)
    
    // Save error state to current image data
    currentImageData.value.error = error.message
    currentImageData.value.processed = false
    
    // Show a user-friendly message for backend unavailable
    if (error.message.includes('not available')) {
      alert('High-quality conversion requires the backend server. The live preview shows a simplified version of your image. To enable full conversion, run "npm run dev:full" in your terminal.')
    }  }
}

// Batch processing methods
const convertAllToSvg = async () => {
  if (imageQueue.value.length === 0) return
  
  try {
    // Mark as batch processing
    isBatchProcessing.value = true
    isProcessing.value = true
    processingProgress.value = 0
    
    const totalImages = imageQueue.value.length
    let processedCount = 0
    
    for (let i = 0; i < imageQueue.value.length; i++) {
      const imageData = imageQueue.value[i]
      
      try {
        // Skip already processed images
        if (imageData.processed && imageData.svgResult) {
          processedCount++
          processingProgress.value = Math.round((processedCount / totalImages) * 100)
          continue
        }
        
        // Update current processing index for progress tracking
        currentImageIndex.value = i
        
        // Mark as being processed
        imageData.processed = false
        imageData.error = null
          // Convert this image
        await convertImageToSvg(imageData.file, {
          removeBorder: settings.removeBorder,
          svgColor: settings.svgColor === '#000000' ? null : settings.svgColor,
          quality: settings.quality,
          size: settings.size
        }, {
          isBatchOperation: true // Prevent individual conversions from closing the modal
        })
        
        // Save the result
        imageData.svgResult = svgResult.value
        imageData.livePreview = livePreviewSvg.value
        imageData.processed = true
        
        processedCount++
        processingProgress.value = Math.round((processedCount / totalImages) * 100)
        
      } catch (error) {
        console.error(`Error converting image ${i + 1}:`, error)
        imageData.error = error.message
        imageData.processed = false
        processedCount++
        processingProgress.value = Math.round((processedCount / totalImages) * 100)
      }
    }
    
    // Update current image display if needed
    if (currentImageData.value) {
      svgResult.value = currentImageData.value.svgResult || ''
      livePreviewSvg.value = currentImageData.value.livePreview || ''
    }
      } catch (error) {
    console.error('Error in batch conversion:', error)
    alert('Error during batch conversion. Please try again.')
  } finally {
    isBatchProcessing.value = false
    isProcessing.value = false
    processingProgress.value = 0
  }
}

const downloadAllSvg = () => {
  const processedImages = imageQueue.value.filter(img => img.processed && img.svgResult)
  
  if (processedImages.length === 0) {
    alert('No converted SVG files to download. Please convert your images first.')
    return
  }
  
  processedImages.forEach((imageData, index) => {
    setTimeout(() => {
      const blob = new Blob([imageData.svgResult], { type: 'image/svg+xml' })
      const fileName = `${getFileNameWithoutExtension(imageData.file.name)}.svg`
      saveAs(blob, fileName)
    }, index * 200) // Stagger downloads to avoid browser blocking
  })
}

const downloadAllAsZip = async () => {
  const processedImages = imageQueue.value.filter(img => img.processed && img.svgResult)
  
  if (processedImages.length === 0) {
    alert('No converted SVG files to download. Please convert your images first.')
    return
  }
  
  try {
    const zip = new JSZip()
    
    // Add each SVG file to the ZIP
    processedImages.forEach((imageData) => {
      const fileName = `${getFileNameWithoutExtension(imageData.file.name)}.svg`
      zip.file(fileName, imageData.svgResult)
    })
    
    // Generate the ZIP file
    const content = await zip.generateAsync({ type: 'blob' })
    
    // Download the ZIP file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    saveAs(content, `converted-svgs-${timestamp}.zip`)
    
  } catch (error) {
    console.error('Error creating ZIP:', error)
    alert('Error creating ZIP file. Files will be downloaded individually instead.')
    downloadAllSvg()
  }
}

const getFileNameWithoutExtension = (fileName) => {
  return fileName.replace(/\.[^/.]+$/, '')
}

// Check backend connection on app startup
onMounted(() => {
  checkBackendConnection()
})

// Check if page is scrollable on mobile
const showScrollIndicator = ref(false)
const checkScrollable = () => {
  if (window.innerWidth <= 768) {
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight
    showScrollIndicator.value = scrollHeight > clientHeight + 50
  }
}

// Watch for content changes and window resize
onMounted(() => {
  checkScrollable()
  window.addEventListener('resize', checkScrollable)
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      showScrollIndicator.value = false
    }
  })
})
</script>

<template>  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon-container">
            <Palette class="logo-icon" />
            <Sparkles class="logo-sparkle" />
          </div>
          <div class="logo-text">
            <h1>Image to SVG Converter</h1>
            <span class="subtitle">Optimized for Power Apps</span>
          </div>
        </div>
        <div class="header-controls">          <!-- Backend Status Indicator -->
          <div class="backend-status" :class="{ connected: isBackendConnected, disconnected: !isBackendConnected }">
            <component 
              :is="isBackendConnected ? Wifi : WifiOff" 
              class="status-icon" 
            />
            <div class="status-content">
              <span class="status-text">
                {{ isBackendConnected ? 'Backend Connected' : 'Frontend Only' }}
              </span>
              <span v-if="!isBackendConnected" class="status-subtitle">
                Live preview available
              </span>
              <span v-if="isBackendConnected" class="status-subtitle">
                {{ getCurrentBackendUrl() }}
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>

    <!-- Welcome Hero Section -->
    <section v-if="!hasImage" class="welcome-hero">
      <div class="hero-content">
        <div class="hero-text">
          <h2 class="hero-title">
            Convert Images to 
            <span class="gradient-text">SVG</span>
          </h2>
          <p class="hero-description">
            Transform your images into scalable vector graphics, perfectly optimized for Microsoft Power Apps. 
            Support for multiple formats with professional-grade conversion.
          </p>          <div class="hero-features">
            <div class="feature-item">
              <div class="feature-icon">
                <Sparkles class="feature-icon-svg" />
              </div>
              <span>High-Quality Conversion</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <Palette class="feature-icon-svg" />
              </div>
              <span>Color Customization</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <Smartphone class="feature-icon-svg" />
              </div>
              <span>Power Apps Ready</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <Zap class="feature-icon-svg" />
              </div>
              <span>Instant Preview</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="visual-container">            <div class="floating-card card-1">
              <div class="card-content">
                <Image class="card-icon-svg" />
                <div class="card-text">
                  <span class="card-title">Input Images</span>
                  <span class="card-subtitle">JPG, PNG, GIF</span>
                </div>
              </div>
            </div>
            <div class="floating-card card-2">
              <div class="card-content">
                <Zap class="card-icon-svg" />
                <div class="card-text">
                  <span class="card-title">Convert</span>
                  <span class="card-subtitle">AI Processing</span>
                </div>
              </div>
            </div>
            <div class="floating-card card-3">
              <div class="card-content">
                <Box class="card-icon-svg" />
                <div class="card-text">
                  <span class="card-title">Power Apps</span>
                  <span class="card-subtitle">Ready SVG</span>
                </div>
              </div>
            </div>
            <div class="connection-line line-1"></div>
            <div class="connection-line line-2"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'processing-active': isProcessing, 'welcome-mode': !hasImage }">
      <div class="container">        <!-- Input Methods -->
        <section class="input-section">
          <UnifiedImageInput 
            @image-selected="handleImageSelected" 
            @reset-app="handleAppReset"
            @remove-image="removeImageFromQueue"
            @switch-image="switchToImage"
            @batch-convert="convertAllToSvg"
            @download-all="downloadAllSvg"
            @download-zip="downloadAllAsZip"
            :image-queue="imageQueue"
            :current-image-index="currentImageIndex"
            :has-multiple-images="hasMultipleImages"
            :batch-processing="isProcessing"
          />
        </section>        <!-- Modern Loading Modal -->
        <div v-if="isProcessing" class="loading-overlay">
          <div class="loading-modal">
            <div class="loading-content">
              <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-core"></div>
              </div>
                <h3 class="loading-title">
                {{ isBatchProcessing ? 'Converting Images to SVG' : 'Converting to SVG' }}
              </h3>
              <p class="loading-subtitle">
                {{ isBatchProcessing 
                  ? `Processing ${currentImageIndex + 1} of ${imageQueue.length} images...` 
                  : 'Please wait while we process your image...' 
                }}
              </p>
              
              <!-- Current file name for batch processing -->
              <div v-if="isBatchProcessing && currentImageFile" class="current-file-info">
                <span class="current-file-label">Current file:</span>
                <span class="current-file-name">{{ currentImageFile.name }}</span>
              </div>
                <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: processingProgress + '%' }"></div>
                </div>
                <div class="progress-text">
                  <div class="progress-main">
                    <span class="progress-percentage">{{ processingProgress }}%</span>
                  </div>                  <div v-if="isBatchProcessing" class="progress-details">
                    {{ Math.ceil((processingProgress / 100) * imageQueue.length) }} of {{ imageQueue.length }} completed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>        <!-- Main Workspace -->
        <div class="workspace" v-if="hasImage">
          <div class="workspace-grid">
            <!-- Preview Area -->
            <div class="preview-section"><PreviewArea 
                :image="currentImageFile"
                :svg-result="currentPreviewSvg"
                :background-color="settings.backgroundColor"
                :is-live-preview="!!livePreviewSvg"
                :remove-border="settings.removeBorder"
                :image-queue="imageQueue"
                :current-image-index="currentImageIndex"
                :has-multiple-images="hasMultipleImages"
                @remove-image="removeImageFromQueue"
                @switch-image="switchToImage"
              />
            </div>            <!-- Controls Panel -->
            <div class="controls-section">
              <ControlsPanel 
                :settings="settings"
                :disabled="isProcessing"
                @update:settings="Object.assign(settings, $event)"
                @convert="convertToSvg"
              />
              
              <!-- Download Section -->
              <div class="download-section" v-if="hasSvgResult">
                <button class="download-btn" @click="() => downloadSvg(svgResult, 'converted-image.svg')">
                  <Download class="btn-icon" />
                  Download SVG
                </button>
              </div>
            </div>
          </div>          <!-- Mobile Action Bar -->
          <MobileActionBar
            v-if="hasImage"
            :has-image="hasImage"
            :has-svg-result="hasSvgResult"
            :is-processing="isProcessing"
            :settings="settings"
            :is-backend-connected="isBackendConnected"
            @convert="convertToSvg"
            @download="() => downloadSvg(svgResult, 'converted-image.svg')"
            @update:settings="Object.assign(settings, $event)"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.logo-sparkle {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 1rem;
  height: 1rem;
  color: var(--accent-color, #fbbf24);
  animation: sparkleRotate 3s ease-in-out infinite;
  opacity: 0.8;
}

@keyframes sparkleRotate {
  0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.6; }
  50% { transform: rotate(180deg) scale(1.1); opacity: 1; }
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-top: 0.125rem;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.backend-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.backend-status.connected {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
  border-color: rgba(34, 197, 94, 0.2);
}

.backend-status.disconnected {
  background: rgba(156, 163, 175, 0.1);
  color: rgb(107, 114, 128);
  border-color: rgba(156, 163, 175, 0.2);
}

.status-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.backend-status.connected .status-icon {
  animation: pulse-icon 2s ease-in-out infinite;
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.status-text {
  font-weight: 500;
  line-height: 1.2;
}

.status-subtitle {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-left: 0;
  line-height: 1.1;
}

@keyframes pulse-icon {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.7;
    transform: scale(1.05);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Welcome Hero Section */
.welcome-hero {
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  padding: 4rem 0 3rem;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;
}

.welcome-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(var(--primary-rgb), 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(var(--primary-rgb), 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin: 0;
  color: var(--text-primary);
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
  max-width: 540px;
}

.hero-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  transition: all 0.3s ease;
  font-weight: 500;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
  border-color: var(--primary-color);
}

.feature-icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  border-radius: 50%;
  color: white;
  font-size: 1rem;
}

.feature-icon-svg {
  width: 1rem;
  height: 1rem;
  stroke-width: 2;
}

.hero-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 400px;
}

.visual-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-card {
  position: absolute;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-large);
  padding: 1.5rem;
  box-shadow: var(--shadow-large);
  transition: all 0.3s ease;
  animation: float 6s ease-in-out infinite;
  z-index: 10;
}

.floating-card:hover {
  transform: scale(1.05) translateY(-10px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary-color);
  z-index: 20;
}

.card-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.card-2 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float-center 6s ease-in-out infinite;
  animation-delay: 2s;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  color: white;
  border-color: var(--primary-color);
  z-index: 15;
}

.card-2:hover {
  z-index: 25;
}

.card-3 {
  bottom: 20%;
  right: 10%;
  animation-delay: 4s;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
}

.card-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: inherit;
  line-height: 1.2;
}

.card-subtitle {
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.8;
  color: inherit;
  line-height: 1.1;
}

.card-icon-svg {
  width: 2rem;
  height: 2rem;
  margin-bottom: 0.5rem;
  stroke-width: 1.5;
  transition: all 0.3s ease;
}

/* Icon-specific animations */
.card-1 .card-icon-svg {
  animation: iconPulse 4s ease-in-out infinite;
  animation-delay: 0.5s;
}

.card-2 .card-icon-svg {
  animation: iconSpark 3s ease-in-out infinite;
  animation-delay: 1s;
}

.card-3 .card-icon-svg {
  animation: iconGlow 5s ease-in-out infinite;
  animation-delay: 1.5s;
}

@keyframes iconPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes iconSpark {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.05); filter: brightness(1.2); }
}

@keyframes iconGlow {
  0%, 100% { filter: brightness(1) hue-rotate(0deg); }
  50% { filter: brightness(1.1) hue-rotate(10deg); }
}

.connection-line {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), transparent);
  opacity: 0.6;
  animation: pulse-line 3s ease-in-out infinite;
}

.line-1 {
  top: 35%;
  left: 25%;
  width: 25%;
  transform: rotate(25deg);
  animation-delay: 1s;
}

.line-2 {
  bottom: 35%;
  left: 45%;
  width: 25%;
  transform: rotate(-25deg);
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-15px) rotate(1deg); }
  66% { transform: translateY(-5px) rotate(-1deg); }
}

@keyframes float-center {
  0%, 100% { transform: translate(-50%, -50%) translateY(0px) rotate(0deg); }
  33% { transform: translate(-50%, -50%) translateY(-15px) rotate(1deg); }
  66% { transform: translate(-50%, -50%) translateY(-5px) rotate(-1deg); }
}

@keyframes pulse-line {
  0%, 100% { opacity: 0.3; transform: scaleX(0.8); }
  50% { opacity: 0.8; transform: scaleX(1.2); }
}

.main-content {
  padding: 2rem 0;
}

.main-content.welcome-mode {
  padding: 1rem 0 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.input-section {
  margin-bottom: 2rem;
}



.processing {
  text-align: center;
  padding: 1.5rem 2rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(8px);
  animation: slideInFromTop 0.3s ease-out;
}

/* Modern Loading Modal */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInOverlay 0.3s ease-out;
}

.loading-modal {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 2.5rem;
  max-width: 400px;
  width: calc(100vw - 2rem);
  margin: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  animation: slideInModal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-align: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background: var(--primary-color);
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.loading-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Current file info for batch processing */
.current-file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-medium);
  border: 1px solid var(--border-color);
  max-width: 100%;
}

.current-file-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.current-file-name {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 600;
  text-align: center;
  word-break: break-all;
  max-width: 280px;
  line-height: 1.4;
}

.progress-details {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-align: center;
}

/* Update progress styles for modal */
.loading-modal .progress-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.loading-modal .progress-bar {
  width: 100%;
  height: 0.5rem;
  background: var(--border-color);
  border-radius: 0.25rem;
  overflow: hidden;
  position: relative;
}

.loading-modal .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-color-light, #4f46e5));
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border-radius: 0.25rem;
}

.loading-modal .progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

.loading-modal .progress-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.loading-modal .progress-main {
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-modal .progress-percentage {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-color);
}

/* Loading Modal Animations */
@keyframes fadeInOverlay {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInModal {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(0.8);
  }
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.workspace-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  margin-top: 2rem;
}

.preview-section {
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.controls-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.download-section {
  margin-top: auto;
}

.download-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.download-btn:hover {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

@media (max-width: 768px) {
  .app {
    min-height: 100vh;
    padding: 0;
    padding-bottom: 120px; /* Make room for mobile action bar */
  }

  .header {
    padding: 0.5rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
    background: var(--bg-primary-alpha);
  }

  .header-content {
    padding: 0 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .logo {
    gap: 0.5rem;
  }

  .logo h1 {
    font-size: 1.25rem;
  }

  .subtitle {
    display: none;
  }

  .header-controls {
    width: 100%;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .backend-status {
    font-size: 0.75rem;
    padding: 0.375rem 0.5rem;
    gap: 0.5rem;
  }

  .status-icon {
    width: 0.875rem;
    height: 0.875rem;
  }

  .status-text {
    display: none;
  }

  .status-subtitle {
    font-size: 0.625rem;
    line-height: 1;
  }

  .main-content {
    padding: 1rem 0 0 0; /* Remove bottom padding for mobile action bar */
  }

  .container {
    padding: 0 1rem;
    max-width: 100%;
  }

  .workspace-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .input-section, .preview-section {
    margin-bottom: 1rem;
  }

  /* Hide desktop controls panel on mobile */
  .controls-section {
    display: none;
  }

}

/* Responsive Design for Hero Section */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
  
  .hero-title {
    font-size: 3rem;
  }
  
  .hero-visual {
    height: 300px;
    order: -1;
  }
  
  .hero-features {
    max-width: 600px;
    margin: 1rem auto 0;
  }
}

@media (max-width: 768px) {
  .welcome-hero {
    padding: 3rem 0 2rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-description {
    font-size: 1.125rem;
  }
  
  .hero-features {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    max-width: 400px;
  }
  
  .feature-item {
    padding: 0.75rem;
  }
  
  .hero-visual {
    height: 250px;
  }
  
  .floating-card {
    padding: 1rem;
  }
  
  .card-content {
    min-width: 80px;
  }
    .card-icon-svg {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  /* Improved header responsive design */
  .header-content {
    padding: 0 1rem;
  }
  
  .logo h1 {
    font-size: 1.25rem;
  }
  
  .logo-icon {
    width: 2rem;
    height: 2rem;
  }
  
  .logo-sparkle {
    width: 0.875rem;
    height: 0.875rem;
  }
  
  .subtitle {
    font-size: 0.75rem;
  }
    .backend-status {
    flex-direction: row;
    gap: 0.5rem;
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
  }

  .status-icon {
    width: 0.875rem;
    height: 0.875rem;
  }

  .status-content {
    gap: 0.125rem;
  }
  
  .status-subtitle {
    font-size: 0.625rem;
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .hero-visual {
    height: 200px;
  }
  
  .floating-card {
    padding: 0.75rem;
  }
  
  .card-1, .card-3 {
    display: none; /* Hide side cards on very small screens */
  }
  
  .card-2 {
    position: static;
    transform: none;
    margin: 0 auto;
  }
  
  .connection-line {
    display: none;
  }
  
  .logo {
    gap: 0.5rem;
  }
  
  .logo-text {
    gap: 0.125rem;
  }
  
  .header-controls {
    gap: 0.5rem;
  }
}
</style>
