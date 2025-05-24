<script setup>
import { computed } from 'vue'
import { Settings, Palette, Maximize2, Zap, RefreshCw } from 'lucide-vue-next'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:settings', 'convert'])

const updateSetting = (key, value) => {
  emit('update:settings', { ...props.settings, [key]: value })
}

const qualityOptions = [
  { value: 'low', label: 'Low (Fast)', description: 'Basic conversion, smaller file size' },
  { value: 'medium', label: 'Medium', description: 'Balanced quality and speed' },
  { value: 'high', label: 'High (Detailed)', description: 'Best quality, larger file size' }
]

const sizeOptions = [
  { value: 'auto', label: 'Auto', description: 'Keep original dimensions' },
  { value: 'small', label: 'Small (64x64)', description: 'For small Power Apps controls' },
  { value: 'medium', label: 'Medium (128x128)', description: 'For medium controls' },
  { value: 'large', label: 'Large (256x256)', description: 'For large controls' },
  { value: 'custom', label: 'Custom', description: 'Specify custom dimensions' }
]

const backgroundColors = [
  { value: '#ffffff', label: 'White', class: 'bg-white' },
  { value: '#f8f9fa', label: 'Light Gray', class: 'bg-light-gray' },
  { value: '#e9ecef', label: 'Gray', class: 'bg-gray' },
  { value: '#343a40', label: 'Dark Gray', class: 'bg-dark-gray' },
  { value: '#000000', label: 'Black', class: 'bg-black' },
  { value: '#0078d4', label: 'Blue', class: 'bg-blue' },
  { value: '#107c10', label: 'Green', class: 'bg-green' },
  { value: '#d13438', label: 'Red', class: 'bg-red' }
]

const svgColors = [
  { value: '#000000', label: 'Black' },
  { value: '#ffffff', label: 'White' },
  { value: '#0078d4', label: 'Blue' },
  { value: '#107c10', label: 'Green' },
  { value: '#d13438', label: 'Red' },
  { value: '#ff8c00', label: 'Orange' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#06b6d4', label: 'Cyan' }
]
</script>

<template>
  <div class="controls-panel">
    <div class="panel-header">
      <Settings class="panel-icon" />
      <h3>Conversion Settings</h3>
    </div>

    <div class="controls-content">
      <!-- Border Removal -->
      <div class="control-group">
        <div class="control-header">
          <Maximize2 class="control-icon" />
          <label class="control-label">Border Removal</label>
        </div>
        <div class="control-input">
          <label class="checkbox-label">
            <input
              type="checkbox"
              :checked="settings.removeBorder"
              @change="updateSetting('removeBorder', $event.target.checked)"
              class="checkbox"
            />
            <span class="checkbox-text">Automatically remove borders and padding</span>
          </label>
          <small class="control-description">
            Removes whitespace around the image to fit better in small controls
          </small>
        </div>
      </div>

      <!-- SVG Color -->
      <div class="control-group">
        <div class="control-header">
          <Palette class="control-icon" />
          <label class="control-label">SVG Color</label>
        </div>
        <div class="control-input">
          <div class="color-grid">
            <button
              v-for="color in svgColors"
              :key="color.value"
              @click="updateSetting('svgColor', color.value)"
              class="color-button"
              :class="{ active: settings.svgColor === color.value }"
              :style="{ backgroundColor: color.value }"
              :title="color.label"
              type="button"
            >
              <span class="sr-only">{{ color.label }}</span>
            </button>
          </div>
          <div class="custom-color">
            <input
              type="color"
              :value="settings.svgColor"
              @input="updateSetting('svgColor', $event.target.value)"
              class="color-picker"
              title="Custom color"
            />
            <input
              type="text"
              :value="settings.svgColor"
              @input="updateSetting('svgColor', $event.target.value)"
              class="color-input"
              placeholder="#000000"
            />
          </div>
          <small class="control-description">
            Convert the image to a single color (useful for icons)
          </small>
        </div>
      </div>

      <!-- Preview Background -->
      <div class="control-group">
        <div class="control-header">
          <label class="control-label">Preview Background</label>
        </div>
        <div class="control-input">
          <div class="color-grid">
            <button
              v-for="bg in backgroundColors"
              :key="bg.value"
              @click="updateSetting('backgroundColor', bg.value)"
              class="color-button"
              :class="{ active: settings.backgroundColor === bg.value, [bg.class]: true }"
              :style="{ backgroundColor: bg.value }"
              :title="bg.label"
              type="button"
            >
              <span class="sr-only">{{ bg.label }}</span>
            </button>
          </div>
          <div class="custom-color">
            <input
              type="color"
              :value="settings.backgroundColor"
              @input="updateSetting('backgroundColor', $event.target.value)"
              class="color-picker"
              title="Custom background color"
            />
            <input
              type="text"
              :value="settings.backgroundColor"
              @input="updateSetting('backgroundColor', $event.target.value)"
              class="color-input"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>

      <!-- Quality Settings -->
      <div class="control-group">
        <div class="control-header">
          <Zap class="control-icon" />
          <label class="control-label">Quality</label>
        </div>
        <div class="control-input">
          <div class="radio-group">
            <label
              v-for="option in qualityOptions"
              :key="option.value"
              class="radio-label"
            >
              <input
                type="radio"
                :value="option.value"
                :checked="settings.quality === option.value"
                @change="updateSetting('quality', option.value)"
                class="radio"
              />
              <div class="radio-content">
                <span class="radio-title">{{ option.label }}</span>
                <small class="radio-description">{{ option.description }}</small>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Size Options -->
      <div class="control-group">
        <div class="control-header">
          <label class="control-label">Output Size</label>
        </div>
        <div class="control-input">
          <select
            :value="settings.size"
            @change="updateSetting('size', $event.target.value)"
            class="select"
          >
            <option
              v-for="option in sizeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <small class="control-description">
            Choose the optimal size for your Power Apps control
          </small>
        </div>
      </div>      <!-- Convert Button -->
      <div class="control-group">
        <div class="conversion-info">
          <div class="info-header">
            <Zap class="info-icon" />
            <span>Professional Conversion</span>
          </div>
          <p class="info-text">
            Click "Convert to SVG" to process your image with our backend server using Potrace for crisp, scalable vector graphics.
          </p>
        </div>
        <button
          @click="emit('convert')"
          class="convert-btn"
          type="button"
        >
          <RefreshCw class="btn-icon" />
          Convert to SVG
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controls-panel {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-large);
  overflow: hidden;
}

.panel-header {
  background: var(--bg-secondary);
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--primary-color);
}

.panel-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.controls-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.control-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-secondary);
}

.control-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.control-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-description {
  color: var(--text-secondary);
  font-size: 0.75rem;
  line-height: 1.4;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox {
  margin: 0;
  accent-color: var(--primary-color);
}

.checkbox-text {
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.4;
}

/* Color Grid */
.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.color-button {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-small);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.color-button:hover {
  transform: scale(1.1);
  border-color: var(--border-hover);
}

.color-button.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-light);
}

.color-button.active::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
}

/* Color buttons for light backgrounds */
.color-button.bg-white.active::after,
.color-button.bg-light-gray.active::after,
.color-button.bg-gray.active::after {
  color: var(--text-primary);
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
}

/* Custom Color */
.custom-color {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-picker {
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-small);
  cursor: pointer;
  background: none;
}

.color-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-small);
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
}

/* Radio Group */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  transition: all 0.2s ease;
}

.radio-label:hover {
  border-color: var(--border-hover);
  background: var(--bg-secondary);
}

.radio {
  margin: 0;
  accent-color: var(--primary-color);
}

.radio-content {
  flex: 1;
}

.radio-title {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.875rem;
}

.radio-description {
  color: var(--text-secondary);
  font-size: 0.75rem;
  display: block;
  margin-top: 0.25rem;
}

/* Select */
.select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-light);
}

/* Convert Info */
.conversion-info {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-medium);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: rgb(59, 130, 246);
}

.info-icon {
  width: 1rem;
  height: 1rem;
}

.info-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* Convert Button */
.convert-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-medium);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.convert-btn:hover {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 768px) {
  .controls-panel {
    margin: 0;
  }

  .controls-content {
    padding: 1rem;
    gap: 1.25rem;
  }
  
  .control-group {
    gap: 0.75rem;
  }
  
  .control-group h3 {
    font-size: 1rem;
  }
  
  .controls-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .control-item {
    padding: 1rem;
  }
  
  .control-item label {
    font-size: 0.875rem;
  }
  
  .color-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
  }
  
  .color-option {
    width: 36px;
    height: 36px;
    min-height: 44px; /* Touch-friendly size */
  }
  
  .custom-color {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .custom-color label {
    text-align: left;
  }
  
  .color-input-wrapper {
    width: 100%;
  }
  
  .color-input {
    width: 100%;
    height: 44px;
  }
  
  .slider-container {
    margin-top: 0.5rem;
  }
  
  .range-input {
    width: 100%;
    height: 44px;
  }
  
  .select-input {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    min-height: 44px;
  }
  
  .convert-btn {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1rem;
    min-height: 48px;
    justify-content: center;
  }
}
</style>
