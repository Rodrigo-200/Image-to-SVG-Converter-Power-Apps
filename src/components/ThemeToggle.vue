<script setup>
import { ref, onMounted } from 'vue'
import { Sun, Moon, Monitor } from 'lucide-vue-next'

const currentTheme = ref('system')

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor }
]

const setTheme = (theme) => {
  currentTheme.value = theme
  
  if (theme === 'system') {
    localStorage.removeItem('theme')
    document.documentElement.removeAttribute('data-theme')
  } else {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }
}

const initTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  if (savedTheme) {
    currentTheme.value = savedTheme
    document.documentElement.setAttribute('data-theme', savedTheme)
  } else {
    currentTheme.value = 'system'
    // Let CSS handle system theme detection
  }
}

const handleSystemThemeChange = (e) => {
  if (currentTheme.value === 'system') {
    // Theme will be handled by CSS media query
    // Force a re-render to update any theme-dependent components
    document.documentElement.style.colorScheme = e.matches ? 'dark' : 'light'
    setTimeout(() => {
      document.documentElement.style.colorScheme = ''
    }, 0)
  }
}

onMounted(() => {
  initTheme()
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', handleSystemThemeChange)
  
  // Cleanup listener when component unmounts
  return () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }
})
</script>

<template>
  <div class="theme-toggle">
    <button
      v-for="theme in themes"
      :key="theme.value"
      @click="setTheme(theme.value)"
      class="theme-btn"
      :class="{ active: currentTheme === theme.value }"
      :title="`Switch to ${theme.label.toLowerCase()} theme`"
      type="button"
    >
      <component :is="theme.icon" class="theme-icon" />
      <span class="theme-label">{{ theme.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  overflow: hidden;
  box-shadow: var(--shadow-small);
}

.theme-btn {
  padding: 0.5rem 0.75rem;
  background: transparent;
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
  white-space: nowrap;
}

.theme-btn:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 25%;
  bottom: 25%;
  width: 1px;
  background: var(--border-color);
}

.theme-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.theme-btn.active {
  background: var(--primary-color);
  color: white;
}

.theme-btn.active::after {
  display: none;
}

.theme-icon {
  width: 1rem;
  height: 1rem;
}

.theme-label {
  font-size: 0.875rem;
}

/* Compact version for mobile */
@media (max-width: 768px) {
  .theme-btn {
    padding: 0.5rem;
  }
  
  .theme-label {
    display: none;
  }
  
  .theme-icon {
    width: 1.125rem;
    height: 1.125rem;
  }
}

/* Animation for theme transitions */
:root {
  transition: background-color 0.3s ease, color 0.3s ease;
}

* {
  transition: border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  :root,
  * {
    transition: none !important;
  }
}
</style>