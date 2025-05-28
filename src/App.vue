<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import UnifiedImageInput from './components/UnifiedImageInput.vue'
import PreviewArea from './components/PreviewArea.vue'
import ControlsPanel from './components/ControlsPanel.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import { useImageConversion } from './composables/useImageConversion.js'
import { Settings, Download, Palette, Maximize2, ChevronUp, ChevronDown, Minimize2, Sparkles, Image, RefreshCw, FileCode, Zap, Grid3X3, Layers, Smartphone, Sparkle, Box, Wifi, WifiOff, Globe, Scale } from 'lucide-vue-next'

// Application state
const currentImage = ref(null)
const imageQueue = ref([]) // New: Array to hold multiple images
const currentImageIndex = ref(0) // New: Current image being viewed/processed
const showWelcome = ref(true)

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
watch([() => settings.removeBorder, () => settings.size], () => {
  if (currentImageFile.value) {
    updateLivePreview(currentImageFile.value, settings)
  }
})

// Watch for color changes to update existing SVG
watch(() => settings.svgColor, (newColor) => {
  if (svgResult.value && newColor !== '#000000') {
    // Update existing SVG color without re-processing
    const updatedSvg = changeSvgColor(svgResult.value, newColor)
    // Note: we don't update svgResult here to avoid infinite loops
    // The preview will show the updated color
  } else if (currentImageFile.value && !svgResult.value) {
    // Only update live preview if we don't have a final result yet
    updateLivePreview(currentImageFile.value, settings)
  }
})

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
  
  // Start live preview for current image
  if (currentImageFile.value) {
    updateLivePreview(currentImageFile.value, settings)
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
      livePreviewSvg.value = ''
    } else if (currentImageFile.value) {
      // Update preview for new current image
      updateLivePreview(currentImageFile.value, settings)
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
      livePreviewSvg.value = imageData.livePreview || ''
    } else {
      svgResult.value = ''
      updateLivePreview(currentImageFile.value, settings)
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
    }
  }
}

// Check backend connection on app startup
onMounted(() => {
  checkBackendConnection()
})

// Mobile UI state
const mobileControlsExpanded = ref(false)
const mobileActionBarCollapsed = ref(true) // Start collapsed by default
const mobilePreviewExpanded = ref(true)
const showScrollIndicator = ref(false)

// Check if page is scrollable on mobile
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
          />
        </section><!-- Modern Loading Modal -->
        <div v-if="isProcessing" class="loading-overlay">
          <div class="loading-modal">
            <div class="loading-content">
              <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-core"></div>
              </div>
              
              <h3 class="loading-title">Converting to SVG</h3>
              <p class="loading-subtitle">Please wait while we process your image...</p>
              
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: processingProgress + '%' }"></div>
                </div>
                <div class="progress-text">
                  <span class="progress-percentage">{{ processingProgress }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div><!-- Main Workspace -->
        <div class="workspace" v-if="hasImage">
          <div class="workspace-grid">
            <!-- Preview Area -->
            <div class="preview-section">              <PreviewArea 
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
          </div>          <!-- Mobile Action Bar - Beautiful New Design -->
          <div class="mobile-action-bar" v-if="hasImage">
            <!-- Main Action Buttons - Prominent Design -->
            <div class="primary-actions">
              <div class="action-buttons-container">
                <!-- Convert Button - Takes 2/3 of space -->
                <button 
                  @click="convertToSvg" 
                  class="convert-btn-new"
                  :disabled="isProcessing"
                  :class="{ processing: isProcessing }"
                >
                  <div class="btn-content-new">
                    <div class="btn-icon-container">
                      <component 
                        :is="isProcessing ? 'div' : Settings" 
                        class="btn-icon-new" 
                        :class="{ spinning: isProcessing }" 
                      />
                    </div>
                    <div class="btn-text-container">
                      <span class="btn-text-main">
                        {{ isProcessing ? 'Converting...' : 'Convert to SVG' }}
                      </span>
                      <span class="btn-text-sub" v-if="!isProcessing">
                        {{ isBackendConnected ? 'High Quality' : 'Preview Mode' }}
                      </span>
                    </div>
                  </div>
                </button>
                
                <!-- Download Button - Slides in after conversion -->
                <button 
                  v-if="hasSvgResult && !isProcessing"
                  @click="() => downloadSvg(svgResult, 'converted-image.svg')" 
                  class="download-btn-new"
                >
                  <div class="btn-content-new">
                    <div class="btn-icon-container">
                      <Download class="btn-icon-new" />
                    </div>
                    <div class="btn-text-container">
                      <span class="btn-text-main">Download</span>
                      <span class="btn-text-sub">SVG File</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Expandable More Options -->
            <div class="more-options-section">              <button 
                @click="mobileActionBarCollapsed = !mobileActionBarCollapsed"
                class="more-options-toggle"
                :class="{ expanded: !mobileActionBarCollapsed }"
              >
                <Settings class="toggle-icon" />
                <span class="toggle-text">{{ mobileActionBarCollapsed ? 'More options' : 'Hide options' }}</span>
                <ChevronUp v-if="mobileActionBarCollapsed" class="chevron-icon" />
                <ChevronDown v-else class="chevron-icon" />
              </button>

              <!-- Expandable Settings Panel -->
              <div class="expandable-settings" :class="{ expanded: !mobileActionBarCollapsed }">
                <div class="settings-content">
                  <!-- Quality Settings -->
                  <div class="setting-group">
                    <label class="setting-title">Quality</label>
                    <div class="quality-buttons-new">                      <button 
                        v-for="option in [
                          { value: 'low', label: 'Fast', icon: 'zap' },
                          { value: 'medium', label: 'Balanced', icon: 'scale' },
                          { value: 'high', label: 'High', icon: 'sparkles' }
                        ]"
                        :key="option.value"
                        @click="Object.assign(settings, { quality: option.value })"
                        class="quality-btn-new"
                        :class="{ active: settings.quality === option.value }"
                      >
                        <span class="quality-icon">
                          <Zap v-if="option.icon === 'zap'" class="quality-icon-svg" />
                          <Scale v-else-if="option.icon === 'scale'" class="quality-icon-svg" />
                          <Sparkles v-else-if="option.icon === 'sparkles'" class="quality-icon-svg" />
                        </span>
                        <span class="quality-label">{{ option.label }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Color Settings -->
                  <div class="setting-group">
                    <label class="setting-title">Colors</label>
                    <div class="color-controls-new">
                      <div class="color-item-new">
                        <label class="color-label">Background</label>
                        <div class="color-picker-new">
                          <input 
                            type="color" 
                            :value="settings.backgroundColor" 
                            @input="Object.assign(settings, { backgroundColor: $event.target.value })"
                            class="color-input"
                          />
                          <div class="color-preview-new" :style="{ backgroundColor: settings.backgroundColor }"></div>
                        </div>
                      </div>
                      <div class="color-item-new">
                        <label class="color-label">SVG Color</label>
                        <div class="color-picker-new">
                          <input 
                            type="color" 
                            :value="settings.svgColor" 
                            @input="Object.assign(settings, { svgColor: $event.target.value })"
                            class="color-input"
                          />
                          <div class="color-preview-new" :style="{ backgroundColor: settings.svgColor }"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Processing Options -->
                  <div class="setting-group">
                    <label class="setting-title">Processing</label>
                    <div class="toggle-options-new">
                      <label class="toggle-option-new">
                        <input 
                          type="checkbox" 
                          :checked="settings.removeBorder" 
                          @change="Object.assign(settings, { removeBorder: $event.target.checked })"
                          class="toggle-input"
                        />
                        <div class="toggle-slider-new"></div>
                        <span class="toggle-text">Remove borders</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
  justify-content: center;
  align-items: center;
}

.loading-modal .progress-percentage {
  font-size: 0.875rem;
  font-weight: 600;
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

/* Mobile Action Bar - Hidden by default */
.mobile-action-bar {
  display: none;
}

@media (max-width: 768px) {.app {
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
  }  /* Beautiful New Mobile Action Bar */
  .mobile-action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(20px);
    z-index: 150;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
  }

  /* Primary Actions Section */
  .primary-actions {
    padding: 1rem;
    padding-bottom: 0.75rem;
  }

  .action-buttons-container {
    display: flex;
    gap: 0.75rem;
    height: 64px;
  }

  /* Convert Button - Prominent Design */
  .convert-btn-new {
    flex: 2.5;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  }

  .convert-btn-new:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
  }

  .convert-btn-new:active:not(:disabled) {
    transform: translateY(0);
  }

  .convert-btn-new:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .convert-btn-new.processing {
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  }

  /* Download Button - Conditional Green Design */
  .download-btn-new {
    flex: 1.5;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: slideInRight 0.4s ease-out;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
  }

  .download-btn-new:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
  }

  .download-btn-new:active {
    transform: translateY(0);
  }

  /* Button Content Layout */
  .btn-content-new {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    height: 100%;
    padding: 0 1rem;
  }

  .btn-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }

  .btn-icon-new {
    width: 20px;
    height: 20px;
  }

  .btn-text-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
  }

  .btn-text-main {
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .btn-text-sub {
    font-size: 0.75rem;
    opacity: 0.9;
    font-weight: 500;
    line-height: 1;
  }

  /* More Options Section */
  .more-options-section {
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  .more-options-toggle {
    width: 100%;
    background: transparent;
    border: none;
    padding: 0.875rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .more-options-toggle:hover {
    background: rgba(0, 0, 0, 0.03);
    color: var(--primary-color);
  }

  .more-options-toggle.expanded {
    color: var(--primary-color);
    background: rgba(var(--primary-color-rgb), 0.05);
  }

  .toggle-icon {
    width: 1rem;
    height: 1rem;
  }

  .toggle-text {
    font-weight: 500;
  }  .chevron-icon {
    width: 1rem;
    height: 1rem;
    transition: opacity 0.3s ease;
  }

  /* Expandable Settings */
  .expandable-settings {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .expandable-settings.expanded {
    max-height: 500px;
  }

  .settings-content {
    padding: 0 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Setting Groups */
  .setting-group {
    background: rgba(248, 250, 252, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 12px;
    padding: 1rem;
  }

  .setting-title {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
  }

  /* Quality Buttons - New Design */
  .quality-buttons-new {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .quality-btn-new {
    background: white;
    border: 1.5px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 0.75rem 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 64px;
  }

  .quality-btn-new:hover {
    border-color: var(--primary-color);
    background: rgba(var(--primary-color-rgb), 0.05);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .quality-btn-new.active {
    border-color: var(--primary-color);
    background: rgba(var(--primary-color-rgb), 0.1);
    color: var(--primary-color);
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.2);
  }
  .quality-icon {
    font-size: 1.25rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .quality-icon-svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }

  .quality-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
  }

  /* Color Controls - New Design */
  .color-controls-new {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .color-item-new {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.625rem;
  }

  .color-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .color-picker-new {
    position: relative;
    width: 48px;
    height: 48px;
  }

  .color-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
  }

  .color-preview-new {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    pointer-events: none;
    transition: all 0.3s ease;
  }

  .color-picker-new:hover .color-preview-new {
    transform: scale(1.1);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
  }

  /* Toggle Options - New Design */
  .toggle-options-new {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .toggle-option-new {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
  }

  .toggle-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .toggle-slider-new {
    position: relative;
    width: 48px;
    height: 28px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 14px;
    transition: all 0.3s ease;
  }

  .toggle-slider-new::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }

  .toggle-input:checked + .toggle-slider-new {
    background: var(--primary-color);
  }

  .toggle-input:checked + .toggle-slider-new::after {
    transform: translateX(20px);
  }
  .toggle-text {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  /* Animations */
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

}
  /* Dark theme for mobile action bar */
  [data-theme="dark"] .mobile-action-bar {
    background: rgba(17, 24, 39, 0.98);
    border-top-color: rgba(255, 255, 255, 0.1);
  }

/* Dark theme overrides for mobile */
@media (max-width: 768px) {
  [data-theme="dark"] .mobile-action-bar {
    background: rgba(15, 23, 42, 0.95);
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  [data-theme="dark"] .setting-group {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.1);
  }

  [data-theme="dark"] .quality-btn-new {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
  }

  [data-theme="dark"] .quality-btn-new:hover {
    background: rgba(59, 130, 246, 0.1);
    border-color: #3b82f6;
  }

  [data-theme="dark"] .quality-btn-new.active {
    background: rgba(59, 130, 246, 0.15);
    border-color: #3b82f6;
    color: #3b82f6;
  }
  [data-theme="dark"] .more-options-toggle:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  [data-theme="dark"] .more-options-toggle.expanded {
    background: rgba(59, 130, 246, 0.1);
  }

  /* Mobile tab adjustments */
  .tabs {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.25rem;
    margin-bottom: 1rem;
  }

  .tab {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;  }

  /* Mobile processing indicator - sticky and always visible */
  .processing {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 200;
    margin: 0;
    padding: 1rem;
    border-radius: 0;
    border: none;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-primary);
    backdrop-filter: blur(12px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    animation: slideInFromTop 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .progress-container {
    max-width: calc(100vw - 2rem);
    margin: 0 auto;
    gap: 0.75rem;
  }

  .progress-bar {
    height: 0.375rem;
  }

  .progress-text {
    font-size: 0.8rem;
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
  }

  .progress-label {
    color: var(--text-primary);
  }

  .progress-percentage {
    font-size: 0.875rem;
    font-weight: 700;
  }

  /* Add top padding to main content when processing to prevent overlap */
  .main-content.processing-active {
    padding-top: 7rem;
  }

  /* Touch-friendly buttons */
  button {
    min-height: 44px;
    min-width: 44px;
  }

  /* Better spacing for mobile */
  .input-section .tab-content {
    padding: 0.75rem;
    background: var(--bg-secondary);
    border-radius: var(--radius-medium);
    border: 1px solid var(--border-color);
  }

  .input-section {
    margin-bottom: 0.75rem;
  }

  .tabs {
    margin-bottom: 0.75rem;
  }

  /* Mobile preview optimization */
  .preview-section {
    order: 1;
  }

  .input-section {
    order: 2;
  }

  /* Hide mobile action bar when no image */
  .mobile-action-bar {
    display: block;
  }

  /* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  top: -8px;
  right: 50%;
  transform: translateX(50%);
  display: flex;
  gap: 4px;
  pointer-events: none;
}

.scroll-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  animation: bounce 0.6s infinite alternate;
}

@keyframes bounce {
  to {
    transform: translateY(-4px);
  }
}

/* Touch feedback for better mobile UX */
.mobile-action-bar button:active {
  transform: scale(0.98) translateY(0);
}

.color-picker-wrapper:active {
  transform: scale(0.95);
}

/* Mobile Action Bar Styles - Ultra Compact */
.mobile-actions {
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quick-settings {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  padding: 0.375rem 0.5rem;
  background: var(--bg-secondary);
  border-radius: 0.25rem;
  border: 1px solid var(--border-color);
  opacity: 0.9;
}

.setting-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  flex: 1;
  min-width: 60px;
}

.setting-label {
  font-size: 0.625rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-align: center;
  line-height: 1;
  opacity: 0.8;
}

.setting-toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  font-size: 0.625rem;
  color: var(--text-secondary);
  cursor: pointer;
  line-height: 1;
  opacity: 0.8;
}

.color-picker-wrapper {
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid var(--border-color);
  transition: all 0.2s ease;
}

.color-picker-wrapper:hover {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.mobile-color-input {
  width: 100%;
  height: 100%;
  border: none;
  background: none;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.mobile-color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.mobile-color-input::-webkit-color-swatch {
  border: none;
  border-radius: 50%;
}

.mobile-checkbox {
  width: 14px;
  height: 14px;
  margin: 0;
  cursor: pointer;
  accent-color: var(--primary-color);
}

.main-actions {
  display: flex;
  gap: 0.375rem;
}

.mobile-convert-btn, .mobile-download-btn {
  flex: 1;
  padding: 0.625rem 0.75rem;
  border: none;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-height: 38px;
}

.mobile-convert-btn {
  background: var(--primary-color);
  color: white;
}

.mobile-convert-btn:hover:not(:disabled) {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
}

.mobile-convert-btn:disabled {
  background: var(--border-color);
  color: var(--text-secondary);
  cursor: not-allowed;
}

.mobile-download-btn {
  background: var(--success-color, #22c55e);
  color: white;
}

.mobile-download-btn:hover {
  background: var(--success-color-dark, #16a34a);
  transform: translateY(-1px);
}

.btn-icon {
  width: 0.9rem;
  height: 0.9rem;
  flex-shrink: 0;
}

/* Quality Settings for Mobile - Ultra Compact */
.mobile-quality-selector {
  display: flex;
  gap: 0.25rem;
  margin: 0.125rem 0;
}

.mobile-quality-btn {
  flex: 1;
  padding: 0.25rem 0.375rem;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 0.1875rem;
  font-size: 0.625rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.mobile-quality-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.mobile-quality-btn:hover:not(.active) {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
}

/* Collapsible Mobile Action Bar */
.action-bar-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.action-bar-handle:hover {
  background: var(--bg-tertiary);
}

.action-bar-handle:active {
  transform: scale(0.98);
}

.handle-indicator {
  width: 32px;
  height: 3px;
  background: var(--text-secondary);
  border-radius: 1.5px;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.action-bar-handle:hover .handle-indicator {
  opacity: 1;
  background: var(--primary-color);
}

.handle-icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.action-bar-handle:hover .handle-icon {
  color: var(--primary-color);
}

.handle-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-bar-handle:hover .handle-text {
  color: var(--primary-color);
}

.mobile-actions {
  max-height: 200px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
  transform: translateY(0);
}

.mobile-actions.hidden {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.mobile-action-bar.collapsed {
  transform: translateY(0);
}

.mobile-action-bar.collapsed .action-bar-handle {
  border-bottom: none;
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
}
</style>
