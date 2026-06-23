<script setup lang="ts">
</script>

<template>
  <main class="about">
    <article class="about-content">
      <h1 class="about-title">About PicoPlay</h1>

      <section class="about-section">
        <p class="about-text">
          PicoPlay is a collection of minimal, beautifully designed browser games.
          Built as a portfolio piece, it demonstrates clean architecture, thoughtful
          design, and attention to detail.
        </p>
      </section>

      <section class="about-section">
        <h2 class="about-heading">Design Philosophy</h2>
        <p class="about-text">
          Every pixel earns its place. PicoPlay draws from
          <strong>Linear</strong>, <strong>Raycast</strong>, and
          <strong>Apple HIG</strong> principles — strong typography hierarchy,
          clean spacing, fast interactions, and absolute consistency.
        </p>
      </section>

      <section class="about-section">
        <h2 class="about-heading">Architecture</h2>
        <p class="about-text">
          Each game is a self-contained module conforming to the
          <code>GameModule</code> interface. Adding a new game is as simple as
          creating a folder, implementing the contract, and registering it — no
          routing changes, no conditional logic, no special cases.
        </p>
      </section>

      <section class="about-section">
        <h2 class="about-heading">Tech Stack</h2>
        <ul class="about-list">
          <li>Vue 3 — Composition API + <code>&lt;script setup&gt;</code></li>
          <li>TypeScript</li>
          <li>Vite</li>
          <li>Tailwind CSS v4</li>
          <li>Pinia</li>
          <li>Vue Router</li>
          <li>Vitest</li>
        </ul>
      </section>

      <section class="about-section">
        <h2 class="about-heading">Source</h2>
        <p class="about-text">
          View the source code on
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="about-link"
          >GitHub</a>.
        </p>
      </section>
    </article>
  </main>
</template>

<style scoped>
.about {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--spacing-12) var(--spacing-6);
}

.about-title {
  font-family: var(--font-ui);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-8);
}

.about-section {
  margin-bottom: var(--spacing-8);
}

.about-heading {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
}

.about-text {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.about-text strong {
  color: var(--color-text-primary);
  font-weight: 500;
}

.about-text code {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  padding: 2px 6px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
}

.about-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.about-list li {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  padding-left: var(--spacing-4);
  position: relative;
}

.about-list li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--color-text-secondary);
}

.about-list code {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  padding: 2px 6px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
}

.about-link {
  color: var(--color-accent);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 150ms ease;
}

.about-link:hover {
  border-bottom-color: var(--color-accent);
}
</style>
