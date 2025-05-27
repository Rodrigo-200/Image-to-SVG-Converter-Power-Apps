<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Clipboard, ClipboardCheck, Sparkles } from 'lucide-vue-next'

const emit = defineEmits(['image-selected'])

const pasteArea = ref(null)
const showPasteInstruction = ref(true)
const lastPastedFile = ref(null)
const isAnimating = ref(false)
const showSuccess = ref(false)
const showPulse = ref(false)

const handlePaste = async (e) => {
  e.preventDefault()
  
  const items = Array.from(e.clipboardData?.items || [])
  const imageItem = items.find(item => item.type.startsWith('image/'))
    if (imageItem) {
    const file = imageItem.getAsFile()
    if (file) {
      isAnimating.value = true
      showPulse.value = true
      
      setTimeout(() => {
        lastPastedFile.value = file
        showPasteInstruction.value = false
        showSuccess.value = true
        emit('image-selected', file)
        isAnimating.value = false
        
        // Reset pulse effect
        setTimeout(() => {
          showPulse.value = false
        }, 600)
        
        // Show success feedback briefly
        setTimeout(() => {
          showPasteInstruction.value = true
          showSuccess.value = false
        }, 2000)
      }, 300)
    }
  } else {
    // Show feedback for non-image clipboard content
    showError('No image found in clipboard. Please copy an image first.')
  }
}

const showError = (message) => {
  // Simple error feedback - in a real app you might want to use a toast system
  alert(message)
}

const focusPasteArea = () => {
  pasteArea.value?.focus()
}

// Global paste handler
const handleGlobalPaste = (e) => {
  // Only handle if the paste area is focused or no other input is focused
  const activeElement = document.activeElement
  const isInputFocused = activeElement && (
    activeElement.tagName === 'INPUT' || 
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.contentEditable === 'true'
  )
  
  if (!isInputFocused || activeElement === pasteArea.value) {
    handlePaste(e)
  }
}

onMounted(() => {
  document.addEventListener('paste', handleGlobalPaste)
})

onUnmounted(() => {
  document.removeEventListener('paste', handleGlobalPaste)
})

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<template>
  <div class="clipboard-container">    <div 
      ref="pasteArea"
      class="paste-area"
      :class="{ 
        'has-content': lastPastedFile,
        'animating': isAnimating,
        'pulse': showPulse
      }"
      tabindex="0"
      @paste="handlePaste"
      @click="focusPasteArea"
    >
      <div v-if="showPasteInstruction" class="paste-instruction" :class="{ 'fade-out': !showPasteInstruction }">
        <div class="icon-container">
          <Clipboard class="clipboard-icon" />
          <Sparkles v-if="showSuccess" class="success-sparkles" />
        </div>
        <h3>Paste image from clipboard</h3>
        <p>Copy an image and press <kbd>Ctrl</kbd> + <kbd>V</kbd></p>
        <p class="hint">Click here first, then paste your image</p>
      </div>
        <div v-else class="paste-success" :class="{ 'slide-in': !showPasteInstruction }">
        <div class="icon-container">
          <ClipboardCheck class="success-icon" />
        </div>
        <h3>Image pasted successfully!</h3>
        <p v-if="lastPastedFile">
          File size: {{ formatFileSize(lastPastedFile.size) }}
        </p>
        <p class="success-hint">You can paste another image anytime</p>
      </div>
    </div>
    
    <div class="instructions">
      <h4>How to copy images:</h4>
      <ul>
        <li><strong>From web:</strong> Right-click an image and select "Copy image"</li>
        <li><strong>From files:</strong> Right-click an image file and select "Copy"</li>
        <li><strong>Screenshot:</strong> Use <kbd>Windows</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> to capture</li>
        <li><strong>From apps:</strong> Copy images from Word, PowerPoint, etc.</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.clipboard-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.paste-area {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-large);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-primary);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.paste-area:hover {
  border-color: var(--primary-color);
  background: var(--primary-color-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.paste-area:hover .clipboard-icon {
  transform: scale(1.1);
  color: var(--primary-color);
}

.paste-area:hover h3 {
  color: var(--primary-color);
}

.paste-area:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-light);
}

.paste-area.has-content {
  border-color: var(--success-color);
  border-style: solid;
  background: var(--bg-secondary);
}

.paste-area.animating {
  transform: scale(1.02);
}

.paste-area.pulse {
  animation: pastePulse 0.6s ease-out;
}

@keyframes pastePulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.paste-instruction,
.paste-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.paste-instruction.fade-out {
  opacity: 0;
  transform: translateY(-10px);
}

.paste-success.slide-in {
  animation: slideInFromBottom 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInFromBottom {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clipboard-icon {
  width: 3rem;
  height: 3rem;
  color: var(--text-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.paste-area.animating .clipboard-icon {
  transform: scale(1.1);
  color: var(--primary-color);
}

.success-icon {
  width: 3rem;
  height: 3rem;
  color: var(--success-color);
  animation: successBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes successBounce {
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

.paste-instruction h3,
.paste-success h3 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.25rem;
}

.paste-instruction p,
.paste-success p {
  color: var(--text-secondary);
  margin: 0;
}

.hint,
.success-hint {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-style: italic;
}

kbd {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-small);
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
  color: var(--text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.instructions {
  background: var(--bg-secondary);
  border-radius: var(--radius-medium);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.instructions h4 {
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.instructions ul {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--text-secondary);
}

.instructions li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.instructions li:last-child {
  margin-bottom: 0;
}

.instructions strong {
  color: var(--text-primary);
  font-weight: 600;
}

@media (max-width: 768px) {
  .paste-area {
    padding: 1.5rem;
    min-height: 150px;
  }
  
  .clipboard-icon,
  .success-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .paste-instruction h3,
  .paste-success h3 {
    font-size: 1.125rem;
  }
  
  .instructions {
    padding: 1rem;
  }
}
</style>
