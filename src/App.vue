<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import ImageUpload from './components/ImageUpload.vue'
import ClipboardPaste from './components/ClipboardPaste.vue'
import UrlInput from './components/UrlInput.vue'
import PreviewArea from './components/PreviewArea.vue'
import ControlsPanel from './components/ControlsPanel.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import { useImageConversion } from './composables/useImageConversion.js'
import { useClipboard } from './composables/useClipboard.js'
import { Settings, Download, Palette, Maximize2 } from 'lucide-vue-next'

// Application state
const currentImage = ref(null)
const activeTab = ref('upload')

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
  error: conversionError
} = useImageConversion()

const { setupGlobalPasteHandler } = useClipboard()

// Setup global paste handler for clipboard functionality
setupGlobalPasteHandler((imageFile) => {
  handleImageSelected(imageFile)
})

// Computed properties
const hasImage = computed(() => currentImage.value !== null)
const hasSvgResult = computed(() => svgResult.value !== '')
const currentPreviewSvg = computed(() => livePreviewSvg.value || svgResult.value)

// Watch for settings changes to update live preview (but don't update for color changes if we have SVG result)
watch([() => settings.removeBorder, () => settings.size], () => {
  if (currentImage.value) {
    updateLivePreview(currentImage.value, settings)
  }
})

// Watch for color changes to update existing SVG
watch(() => settings.svgColor, (newColor) => {
  if (svgResult.value && newColor !== '#000000') {
    // Update existing SVG color without re-processing
    const updatedSvg = changeSvgColor(svgResult.value, newColor)
    // Note: we don't update svgResult here to avoid infinite loops
    // The preview will show the updated color
  } else if (currentImage.value && !svgResult.value) {
    // Only update live preview if we don't have a final result yet
    updateLivePreview(currentImage.value, settings)
  }
})

// Methods
const handleImageSelected = (imageFile) => {
  currentImage.value = imageFile
  // Start live preview immediately
  updateLivePreview(imageFile, settings)
}

const convertToSvg = async () => {
  if (!currentImage.value) return
  
  try {
    await convertImageToSvg(currentImage.value, {
      removeBorder: settings.removeBorder,
      svgColor: settings.svgColor === '#000000' ? null : settings.svgColor,
      quality: settings.quality,
      size: settings.size
    })
  } catch (error) {
    console.error('Error converting to SVG:', error)
  }
}

// Check backend connection on app startup
onMounted(() => {
  checkBackendConnection()
})
</script>

<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <Palette class="logo-icon" />
          <h1>Image to SVG Converter</h1>
          <span class="subtitle">Optimized for Power Apps</span>
        </div>
        <div class="header-controls">
          <!-- Backend Status Indicator -->
          <div class="backend-status" :class="{ connected: isBackendConnected, disconnected: !isBackendConnected }">
            <div class="status-dot"></div>
            <span class="status-text">
              {{ isBackendConnected ? 'Backend Connected' : 'Backend Disconnected' }}
            </span>
            <button v-if="!isBackendConnected" @click="checkBackendConnection" class="retry-btn">
              Retry
            </button>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Input Methods -->
        <section class="input-section">
          <div class="tabs">
            <button 
              class="tab" 
              :class="{ active: activeTab === 'upload' }"
              @click="activeTab = 'upload'"
            >
              Upload File
            </button>
            <button 
              class="tab" 
              :class="{ active: activeTab === 'clipboard' }"
              @click="activeTab = 'clipboard'"
            >
              Paste from Clipboard
            </button>
            <button 
              class="tab" 
              :class="{ active: activeTab === 'url' }"
              @click="activeTab = 'url'"
            >
              Image URL
            </button>
          </div>

          <div class="tab-content">
            <ImageUpload 
              v-if="activeTab === 'upload'"
              @image-selected="handleImageSelected"
            />
            <ClipboardPaste 
              v-if="activeTab === 'clipboard'"
              @image-selected="handleImageSelected"
            />
            <UrlInput 
              v-if="activeTab === 'url'"
              @image-selected="handleImageSelected"
            />
          </div>
        </section>

        <!-- Processing Indicator -->
        <div v-if="isProcessing" class="processing">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: processingProgress + '%' }"></div>
          </div>
          <p>Converting to SVG... {{ processingProgress }}%</p>
        </div>

        <!-- Main Workspace -->
        <div class="workspace" v-if="hasImage">
          <div class="workspace-grid">
            <!-- Preview Area -->
            <div class="preview-section">
              <PreviewArea 
                :image="currentImage"
                :svg-result="currentPreviewSvg"
                :background-color="settings.backgroundColor"
                :is-live-preview="!!livePreviewSvg"
                :remove-border="settings.removeBorder"
              />
            </div>

            <!-- Controls Panel -->
            <div class="controls-section">
              <ControlsPanel 
                :settings="settings"
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
          </div>
        </div>

        <!-- Welcome Message -->
        <div v-if="!hasImage" class="welcome">
          <div class="welcome-content">
            <Maximize2 class="welcome-icon" />
            <h2>Welcome to Image to SVG Converter</h2>
            <p>Convert your images to SVG format optimized for Microsoft Power Apps. Choose an input method above to get started.</p>
            <div class="features">
              <div class="feature">
                <Settings class="feature-icon" />
                <span>Customizable Settings</span>
              </div>
              <div class="feature">
                <Palette class="feature-icon" />
                <span>Color Adjustments</span>
              </div>
              <div class="feature">
                <Download class="feature-icon" />
                <span>Instant Download</span>
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
  gap: 0.75rem;
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  color: var(--primary-color);
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.backend-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.backend-status.connected {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.backend-status.disconnected {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

.retry-btn {
  padding: 0.25rem 0.5rem;
  background: rgba(239, 68, 68, 0.2);
  color: rgb(239, 68, 68);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-left: 0.5rem;
}

.main-content {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.input-section {
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.processing {
  text-align: center;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: var(--border-color);
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
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

.welcome {
  text-align: center;
  padding: 4rem 2rem;
}

.welcome-content {
  max-width: 600px;
  margin: 0 auto;
}

.welcome-icon {
  width: 4rem;
  height: 4rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.welcome h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.welcome p {
  color: var(--text-secondary);
  font-size: 1.125rem;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.feature-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .app {
    min-height: 100vh;
    padding: 0;
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
    padding: 0.25rem 0.5rem;
  }

  .status-text {
    display: none;
  }

  .main-content {
    padding: 1rem 0;
  }

  .container {
    padding: 0 1rem;
    max-width: 100%;
  }

  .workspace-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .input-section, .preview-section, .controls-section {
    margin-bottom: 1rem;
  }

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
    text-overflow: ellipsis;
  }

  .features {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
  }

  .feature {
    width: 100%;
    max-width: 300px;
    text-align: center;
  }

  /* Mobile-specific utility classes */
  .mobile-full-width {
    width: 100%;
  }

  .mobile-center {
    text-align: center;
  }

  .mobile-hidden {
    display: none;
  }

  /* Touch-friendly buttons */
  button {
    min-height: 44px;
    min-width: 44px;
  }

  /* Better spacing for mobile */
  .input-section .tab-content {
    padding: 1rem;
  }

  /* Mobile preview optimization */
  .preview-section {
    order: 2;
  }

  .controls-section {
    order: 3;
  }

  .input-section {
    order: 1;
  }
}
</style>
