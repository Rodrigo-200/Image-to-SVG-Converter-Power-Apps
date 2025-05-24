import { ref, onMounted, onUnmounted } from 'vue'

export function useClipboard() {
  const isSupported = ref(false)
  const error = ref('')

  const checkSupport = () => {
    isSupported.value = !!(navigator.clipboard && navigator.clipboard.readText)
  }

  const pasteImage = async () => {
    error.value = ''
    
    if (!isSupported.value) {
      error.value = 'Clipboard API not supported in this browser'
      return null
    }

    try {
      const clipboardItems = await navigator.clipboard.read()
      
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getAsFile(type)
            if (blob) {
              // Convert blob to File
              const file = new File([blob], `clipboard-image.${getExtensionFromMimeType(type)}`, {
                type: type
              })
              return file
            }
          }
        }
      }
      
      error.value = 'No image found in clipboard'
      return null
    } catch (err) {
      console.error('Error reading clipboard:', err)
      error.value = 'Failed to read clipboard. Make sure you have copied an image.'
      return null
    }
  }

  const copyText = async (text) => {
    error.value = ''
    
    if (!navigator.clipboard) {
      // Fallback for older browsers
      return copyTextFallback(text)
    }

    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('Error copying text:', err)
      error.value = 'Failed to copy text to clipboard'
      return false
    }
  }

  const copyTextFallback = (text) => {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      textArea.style.pointerEvents = 'none'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (!successful) {
        error.value = 'Failed to copy text to clipboard'
      }
      
      return successful
    } catch (err) {
      console.error('Fallback copy failed:', err)
      error.value = 'Failed to copy text to clipboard'
      return false
    }
  }

  const getExtensionFromMimeType = (mimeType) => {
    const extensions = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/bmp': 'bmp',
      'image/svg+xml': 'svg'
    }
    return extensions[mimeType] || 'png'
  }
  // Global paste event handler
  let globalPasteCallback = null

  const handleGlobalPaste = async (event) => {
    // Only handle paste events when no input is focused
    const activeElement = document.activeElement
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    )

    if (!isInputFocused) {
      event.preventDefault()
      const imageFile = await handlePasteEvent(event)
      if (imageFile && globalPasteCallback) {
        globalPasteCallback(imageFile)
      }
    }
  }

  const handlePasteEvent = async (event) => {
    const items = Array.from(event.clipboardData?.items || [])
    const imageItem = items.find(item => item.type.startsWith('image/'))
    
    if (imageItem) {
      const file = imageItem.getAsFile()
      if (file) {
        return file
      }
    }
    
    return null
  }

  const setupGlobalPasteHandler = (callback) => {
    globalPasteCallback = callback
  }

  onMounted(() => {
    checkSupport()
    document.addEventListener('paste', handleGlobalPaste)
  })

  onUnmounted(() => {
    document.removeEventListener('paste', handleGlobalPaste)
  })

  return {
    isSupported,
    error,
    pasteImage,
    copyText,
    handlePasteEvent,
    setupGlobalPasteHandler
  }
}
