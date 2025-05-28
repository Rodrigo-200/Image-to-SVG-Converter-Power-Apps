<script setup>
import { ref, computed } from 'vue'
import { Settings, ChevronUp, ChevronDown, Download, Zap, Scale, Sparkles } from 'lucide-vue-next'

const props = defineProps({
  hasImage: {
    type: Boolean,
    required: true
  },
  hasSvgResult: {
    type: Boolean,
    required: true
  },
  isProcessing: {
    type: Boolean,
    required: true
  },
  settings: {
    type: Object,
    required: true
  },
  isBackendConnected: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['convert', 'download', 'update:settings'])

// Mobile UI state
const mobileActionBarCollapsed = ref(true)

const updateSetting = (key, value) => {
  emit('update:settings', { ...props.settings, [key]: value })
}

const handleConvert = () => {
  emit('convert')
}

const handleDownload = () => {
  emit('download')
}
</script>

<template>
  <!-- Mobile Action Bar - Beautiful New Design -->
  <div class="mobile-action-bar" v-if="hasImage">
    <!-- Main Action Buttons - Prominent Design -->
    <div class="primary-actions">
      <div class="action-buttons-container">
        <!-- Convert Button - Takes 2/3 of space -->
        <button 
          @click="handleConvert" 
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
          @click="handleDownload" 
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
    <div class="more-options-section">
      <button 
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
            <div class="quality-buttons-new">
              <button 
                v-for="option in [
                  { value: 'low', label: 'Fast', icon: 'zap' },
                  { value: 'medium', label: 'Balanced', icon: 'scale' },
                  { value: 'high', label: 'High', icon: 'sparkles' }
                ]"
                :key="option.value"
                @click="updateSetting('quality', option.value)"
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
                    @input="updateSetting('backgroundColor', $event.target.value)"
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
                    @input="updateSetting('svgColor', $event.target.value)"
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
                  @change="updateSetting('removeBorder', $event.target.checked)"
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
</template>

<style scoped>
/* Hide on desktop - Mobile only component */
@media (min-width: 769px) {
  .mobile-action-bar {
    display: none !important;
  }
}

/* Beautiful New Mobile Action Bar */
.mobile-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(var(--bg-primary-rgb, 255, 255, 255), 0.95);
  border-top: 1px solid var(--border-color);
  backdrop-filter: blur(20px);
  z-index: 150;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-large);
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
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark, #1d4ed8) 100%);
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(var(--primary-color-rgb, 59, 130, 246), 0.3);
}

.convert-btn-new:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(var(--primary-color-rgb, 59, 130, 246), 0.4);
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
  background: linear-gradient(135deg, var(--text-secondary, #6b7280) 0%, var(--text-primary, #4b5563) 100%);
}

/* Download Button - Conditional Green Design */
.download-btn-new {
  flex: 1.5;
  background: linear-gradient(135deg, var(--success-color, #10b981) 0%, var(--success-color-dark, #059669) 100%);
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInRight 0.4s ease-out;
  box-shadow: 0 4px 20px rgba(var(--success-rgb, 16, 185, 129), 0.3);
}

.download-btn-new:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(var(--success-rgb, 16, 185, 129), 0.4);
}

.download-btn-new:active {
  transform: translateY(0);
}

/* Button Content Layout */
.btn-content-new {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  height: 100%;
  padding: 0.5rem;
}

.btn-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-new {
  width: 1.5rem;
  height: 1.5rem;
  stroke-width: 2;
}

.btn-icon-new.spinning {
  animation: spin 1s linear infinite;
}

.btn-text-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.btn-text-main {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
}

.btn-text-sub {
  font-size: 0.625rem;
  opacity: 0.8;
  line-height: 1;
}

/* More Options Section */
.more-options-section {
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.more-options-toggle {
  width: 100%;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  color: var(--text-secondary);
}

.more-options-toggle:hover {
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
}

.chevron-icon {
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
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
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
  background: var(--bg-primary);
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 64px;
  color: var(--text-primary);
}

.quality-btn-new:hover {
  border-color: var(--primary-color);
  background: rgba(var(--primary-color-rgb, 59, 130, 246), 0.05);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.quality-btn-new.active {
  border-color: var(--primary-color);
  background: rgba(var(--primary-color-rgb, 59, 130, 246), 0.1);
  color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb, 59, 130, 246), 0.2);
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
  border: 3px solid var(--bg-primary);
  box-shadow: var(--shadow-medium);
  pointer-events: none;
  transition: all 0.3s ease;
}

.color-picker-new:hover .color-preview-new {
  transform: scale(1.1);
  box-shadow: var(--shadow-large);
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
  background: var(--bg-tertiary);
  border-radius: 14px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.toggle-slider-new::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: var(--bg-primary);
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-small);
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
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

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
</style>
