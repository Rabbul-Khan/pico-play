<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  open: boolean
  maxWidth?: string
  ariaLabel?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const dialogRef = ref<HTMLDialogElement | null>(null)

// Track internal visibility for CSS transition
const isVisible = ref(false)

watch(() => props.open, (newVal) => {
  if (newVal) {
    dialogRef.value?.showModal()
    // Trigger transition after dialog is shown
    requestAnimationFrame(() => {
      isVisible.value = true
    })
  } else {
    isVisible.value = false
    // Wait for CSS transition to finish before closing
    setTimeout(() => {
      dialogRef.value?.close()
    }, 150)
  }
})

onMounted(() => {
  if (props.open) {
    dialogRef.value?.showModal()
    requestAnimationFrame(() => {
      isVisible.value = true
    })
  }
})

function onCancel(e: Event) {
  e.preventDefault()
  emit('close')
}

function onBackdropClick(e: MouseEvent) {
  // Only close if clicking the backdrop (dialog element itself)
  if (e.target === dialogRef.value) {
    emit('close')
  }
}
</script>

<template>
  <dialog
    ref="dialogRef"
    class="modal"
    :class="{ 'modal--visible': isVisible }"
    :style="{ '--modal-max-width': maxWidth || '420px' }"
    :aria-label="ariaLabel"
    @cancel="onCancel"
    @click="onBackdropClick"
  >
    <div class="modal-content" @click.stop>
      <slot />
    </div>
  </dialog>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  max-width: var(--modal-max-width, 420px);
  width: calc(100% - var(--spacing-8));
  max-height: calc(100dvh - var(--spacing-16));
  margin: auto;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
  overflow-y: auto;
  overscroll-behavior: contain;

  /* Initial state for transition */
  opacity: 0;
  transform: scale(0.96);
  transition: opacity 150ms ease, transform 150ms ease;
}

.modal--visible {
  opacity: 1;
  transform: scale(1);
}

.modal::backdrop {
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.modal-content {
  padding: var(--spacing-6);
}

/* Scrollbar inside modal */
.modal::-webkit-scrollbar {
  width: 4px;
}

.modal::-webkit-scrollbar-track {
  background: transparent;
}

.modal::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}
</style>
