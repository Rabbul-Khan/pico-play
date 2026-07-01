<template>
  <div class="instructions-content">
    <section class="instructions-section">
      <h3>Objective</h3>
      <p>Guide the snake to eat food blocks, growing as long as possible while avoiding crashes with walls or your own body.</p>
    </section>

    <section class="instructions-section">
      <h3>Controls</h3>
      <ul>
        <li><strong>Keyboard:</strong> Use **Arrow Keys** or **W, A, S, D** to steer the snake.</li>
        <li><strong>Touch:</strong> Swipe up, down, left, or right on the screen.</li>
        <li><strong>Pause / Resume:</strong> Press **Spacebar** or click the Pause button.</li>
      </ul>
    </section>

    <section class="instructions-section">
      <h3>Rules</h3>
      <ul>
        <li>Each food item eaten increases your score by 1 and grows the snake by 1 segment.</li>
        <li>Steering directly backwards (180 degrees) is blocked to prevent accidental self-collision.</li>
        <li>Hitting a wall or your own body results in Game Over.</li>
      </ul>
    </section>
  </div>
</template>
