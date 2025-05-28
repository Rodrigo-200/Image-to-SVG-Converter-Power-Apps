<script setup>
import { computed } from 'vue'
import { Zap, CheckCircle, XCircle, Clock, Loader } from 'lucide-vue-next'

const props = defineProps({
  imageQueue: {
    type: Array,
    default: () => []
  },
  isProcessing: {
    type: Boolean,
    default: false
  },
  processingProgress: {
    type: Number,
    default: 0
  },
  currentImageIndex: {
    type: Number,
    default: 0
  }
})

// Calculate progress statistics
const totalImages = computed(() => props.imageQueue.length)
const processedImages = computed(() => props.imageQueue.filter(img => img.processed && img.svgResult).length)
const errorImages = computed(() => props.imageQueue.filter(img => img.error).length)
const pendingImages = computed(() => totalImages.value - processedImages.value - errorImages.value)

// Current processing state
const currentFileName = computed(() => {
  if (props.isProcessing && props.currentImageIndex < props.imageQueue.length) {
    return props.imageQueue[props.currentImageIndex]?.file?.name || 'Unknown file'
  }
  return ''
})

const overallProgress = computed(() => {
  if (!props.isProcessing && totalImages.value > 0) {
    return Math.round((processedImages.value / totalImages.value) * 100)
  }
  return props.processingProgress
})

const progressState = computed(() => {
  if (props.isProcessing) return 'processing'
  if (errorImages.value > 0 && processedImages.value === 0) return 'error'
  if (processedImages.value === totalImages.value && totalImages.value > 0) return 'complete'
  if (processedImages.value > 0) return 'partial'
  return 'pending'
})

const progressIcon = computed(() => {
  switch (progressState.value) {
    case 'processing': return Loader
    case 'complete': return CheckCircle
    case 'error': return XCircle
    case 'partial': return Zap
    default: return Clock
  }
})

const progressColor = computed(() => {
  switch (progressState.value) {
    case 'processing': return 'var(--primary-color)'
    case 'complete': return 'var(--success-color)'
    case 'error': return 'var(--error-color)'
    case 'partial': return 'var(--warning-color)'
    default: return 'var(--text-muted)'
  }
})
</script>

<template>
  <div class="batch-progress-bar" v-if="totalImages > 1">
    <div class="progress-header">
      <div class="progress-info">
        <component 
          :is="progressIcon" 
          class="progress-icon" 
          :class="{ 'spinning': progressState === 'processing' }"
        />
        <div class="progress-text">
          <h4 class="progress-title">
            <span v-if="progressState === 'processing'">Converting Images</span>
            <span v-else-if="progressState === 'complete'">All Images Converted</span>
            <span v-else-if="progressState === 'error'">Conversion Failed</span>
            <span v-else-if="progressState === 'partial'">Partially Converted</span>
            <span v-else>Ready to Convert</span>
          </h4>
          <p class="progress-subtitle" v-if="isProcessing && currentFileName">
            Processing: {{ currentFileName }}
          </p>
          <p class="progress-subtitle" v-else>
            {{ processedImages }}/{{ totalImages }} images converted
            <span v-if="errorImages > 0" class="error-count">
              ({{ errorImages }} {{ errorImages === 1 ? 'error' : 'errors' }})
            </span>
          </p>
        </div>
      </div>
      
      <div class="progress-percentage">
        {{ overallProgress }}%
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div class="progress-track">
      <div 
        class="progress-fill" 
        :style="{ 
          width: overallProgress + '%',
          backgroundColor: progressColor
        }"
      ></div>
    </div>
    
    <!-- Detailed Progress Indicators -->
    <div class="progress-details" v-if="!isProcessing">
      <div class="detail-item success" v-if="processedImages > 0">
        <CheckCircle class="detail-icon" />
        <span>{{ processedImages }} Converted</span>
      </div>
      <div class="detail-item error" v-if="errorImages > 0">
        <XCircle class="detail-icon" />
        <span>{{ errorImages }} {{ errorImages === 1 ? 'Error' : 'Errors' }}</span>
      </div>
      <div class="detail-item pending" v-if="pendingImages > 0">
        <Clock class="detail-icon" />
        <span>{{ pendingImages }} Pending</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.batch-progress-bar {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-large);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-small);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.progress-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--primary-color);
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.progress-icon.spinning {
  animation: spin 1s linear infinite;
}

.progress-text {
  flex: 1;
  min-width: 0;
}

.progress-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.progress-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.error-count {
  color: var(--error-color);
  font-weight: 500;
}

.progress-percentage {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  background: var(--bg-primary);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-medium);
  border: 1px solid var(--border-color);
  min-width: 4rem;
  text-align: center;
}

.progress-track {
  width: 100%;
  height: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 1rem;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--radius-full);
  position: relative;
  box-shadow: 0 0 8px rgba(0, 120, 212, 0.3);
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 2s ease-in-out infinite;
}

.progress-details {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-medium);
  font-size: 0.875rem;
  font-weight: 500;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
}

.detail-item.success {
  color: var(--success-color);
  border-color: var(--success-color);
  background: rgba(34, 197, 94, 0.1);
}

.detail-item.error {
  color: var(--error-color);
  border-color: var(--error-color);
  background: rgba(239, 68, 68, 0.1);
}

.detail-item.pending {
  color: var(--text-secondary);
  border-color: var(--border-color);
  background: var(--bg-tertiary);
}

.detail-icon {
  width: 1rem;
  height: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .batch-progress-bar {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .progress-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }
  
  .progress-info {
    gap: 0.5rem;
  }
  
  .progress-title {
    font-size: 0.9rem;
  }
  
  .progress-subtitle {
    font-size: 0.8rem;
  }
  
  .progress-percentage {
    font-size: 1rem;
    align-self: center;
    min-width: 3.5rem;
  }
  
  .progress-details {
    gap: 0.5rem;
  }
  
  .detail-item {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
  
  .detail-icon {
    width: 0.875rem;
    height: 0.875rem;
  }
}
</style>
