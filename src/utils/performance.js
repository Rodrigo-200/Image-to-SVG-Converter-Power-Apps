/**
 * Performance utilities for mobile optimization
 */

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} Debounced function
 */
export function debounce(func, wait, immediate = false) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

/**
 * Throttle function to limit function calls to once per interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Create a cancellable operation with AbortController
 * @returns {Object} Object with signal and cancel method
 */
export function createCancellableOperation() {
  const controller = new AbortController()
  return {
    signal: controller.signal,
    cancel: () => controller.abort()
  }
}

/**
 * Request animation frame with fallback
 * @param {Function} callback - Function to execute
 * @returns {number} Request ID
 */
export function requestFrame(callback) {
  return requestAnimationFrame(callback)
}

/**
 * Idle callback with fallback for better performance
 * @param {Function} callback - Function to execute when idle
 * @param {Object} options - Options object
 * @returns {number} Request ID
 */
export function requestIdleCallback(callback, options = {}) {
  if (window.requestIdleCallback) {
    return window.requestIdleCallback(callback, options)
  } else {
    // Fallback for browsers without requestIdleCallback
    return setTimeout(callback, 1)
  }
}

/**
 * Optimize image for processing based on device capabilities
 * @param {File} imageFile - Image file to optimize
 * @param {Object} options - Optimization options
 * @returns {Promise<Canvas>} Optimized canvas
 */
export async function optimizeImageForProcessing(imageFile, options = {}) {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    forMobile = window.innerWidth <= 768
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const url = URL.createObjectURL(imageFile)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Calculate optimal dimensions for mobile
      const mobileFactor = forMobile ? 0.5 : 1
      const finalMaxWidth = maxWidth * mobileFactor
      const finalMaxHeight = maxHeight * mobileFactor

      const scale = Math.min(
        finalMaxWidth / img.naturalWidth,
        finalMaxHeight / img.naturalHeight,
        1 // Don't upscale
      )

      canvas.width = img.naturalWidth * scale
      canvas.height = img.naturalHeight * scale

      // Use better image rendering for quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = forMobile ? 'low' : 'high'

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Check if device is mobile based on various factors
 * @returns {boolean} True if mobile device
 */
export function isMobileDevice() {
  return (
    window.innerWidth <= 768 ||
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0)
  )
}

/**
 * Get optimal processing settings based on device
 * @returns {Object} Optimized settings
 */
export function getOptimalProcessingSettings() {
  const isMobile = isMobileDevice()
  const isLowEndDevice = navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 4

  return {
    maxImageSize: isMobile || isLowEndDevice ? 400 : 800,
    debounceDelay: isMobile ? 800 : 500,
    throttleLimit: isMobile ? 1000 : 500,
    useWebWorkers: !isMobile && navigator.hardwareConcurrency > 2,
    reducedAnimations: isMobile || window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    batchSize: isMobile ? 1 : 3,
    imageQuality: isMobile || isLowEndDevice ? 0.6 : 0.8
  }
}

/**
 * Memory cleanup utility
 */
export function cleanupResources(resources = []) {
  resources.forEach(resource => {
    if (resource && typeof resource.revoke === 'function') {
      resource.revoke()
    } else if (typeof resource === 'string' && resource.startsWith('blob:')) {
      URL.revokeObjectURL(resource)
    }
  })
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  constructor(name) {
    this.name = name
    this.startTime = null
    this.marks = []
  }

  start() {
    this.startTime = performance.now()
    if (performance.mark) {
      performance.mark(`${this.name}-start`)
    }
    return this
  }

  mark(label) {
    const now = performance.now()
    this.marks.push({
      label,
      time: now,
      elapsed: this.startTime ? now - this.startTime : 0
    })
    if (performance.mark) {
      performance.mark(`${this.name}-${label}`)
    }
    return this
  }

  end() {
    const endTime = performance.now()
    const totalTime = this.startTime ? endTime - this.startTime : 0
    
    if (performance.mark && performance.measure) {
      performance.mark(`${this.name}-end`)
      performance.measure(this.name, `${this.name}-start`, `${this.name}-end`)
    }

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && totalTime > 100) {
      console.warn(`Slow operation detected: ${this.name} took ${totalTime.toFixed(2)}ms`)
      this.marks.forEach(mark => {
        console.log(`  ${mark.label}: ${mark.elapsed.toFixed(2)}ms`)
      })
    }

    return {
      name: this.name,
      totalTime,
      marks: this.marks
    }
  }
}
