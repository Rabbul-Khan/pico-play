<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="not-found">
    <div class="not-found-content">
      <p class="not-found-code">404</p>
      <h1 class="not-found-title">Page not found</h1>
      <p class="not-found-text">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <RouterLink to="/" class="not-found-link">
        ← Back to home
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 56px);
  padding: var(--spacing-6);
}

.not-found-content {
  text-align: center;
}

.not-found-code {
  font-family: var(--font-mono);
  font-size: 4rem;
  font-weight: 700;
  color: var(--color-border);
  letter-spacing: -0.04em;
  line-height: 1;
}

.not-found-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-top: var(--spacing-4);
}

.not-found-text {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  margin-top: var(--spacing-3);
}

.not-found-link {
  display: inline-block;
  margin-top: var(--spacing-8);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-accent);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 150ms ease;
}

.not-found-link:hover {
  border-bottom-color: var(--color-accent);
}
</style>
