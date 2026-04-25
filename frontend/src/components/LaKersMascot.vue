<template>
  <div class="mascot-scene" @mousemove="handleMouseMove" @mouseleave="resetEyes">
    <!-- Ambient particles -->
    <div class="particles">
      <span v-for="i in 12" :key="i" class="particle" :style="particleStyle(i)" />
    </div>

    <svg
      class="mascot"
      viewBox="0 0 320 340"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mascota de Alquilio"
    >
      <defs>
        <!-- Ambient glow -->
        <radialGradient id="bgGlow" cx="50%" cy="58%" r="48%">
          <stop offset="0%" stop-color="#c96a37" stop-opacity="0.18" />
          <stop offset="58%" stop-color="#d9982c" stop-opacity="0.1" />
          <stop offset="100%" stop-color="#1f4f46" stop-opacity="0" />
        </radialGradient>

        <!-- Body gradient -->
        <linearGradient id="bodyGrad" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stop-color="#24544b" />
          <stop offset="58%" stop-color="#1f4f46" />
          <stop offset="100%" stop-color="#163d37" />
        </linearGradient>

        <!-- Roof / hat gradient -->
        <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffd9c7" />
          <stop offset="52%" stop-color="#c96a37" />
          <stop offset="100%" stop-color="#8c4d29" />
        </linearGradient>

        <!-- Rim light on body (top-right edge shimmer) -->
        <linearGradient id="rimLight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#d9982c" stop-opacity="0" />
          <stop offset="84%" stop-color="#ffecc4" stop-opacity="0.12" />
          <stop offset="100%" stop-color="#fff7df" stop-opacity="0.24" />
        </linearGradient>

        <!-- Eye gradient (whites with subtle warmth) -->
        <radialGradient id="eyeWhiteL" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fffdf9" />
          <stop offset="100%" stop-color="#e8e1d8" />
        </radialGradient>
        <radialGradient id="eyeWhiteR" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fffdf9" />
          <stop offset="100%" stop-color="#e8e1d8" />
        </radialGradient>

        <!-- Iris gradient -->
        <radialGradient id="irisGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#163d37" />
          <stop offset="60%" stop-color="#102b27" />
          <stop offset="100%" stop-color="#091715" />
        </radialGradient>

        <!-- Shadow under mascot -->
        <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#163d37" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#163d37" stop-opacity="0" />
        </radialGradient>

        <!-- Glow filter for eyes -->
        <filter id="eyeGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <!-- Soft drop shadow filter -->
        <filter id="bodyShadow" x="-15%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#163d37" flood-opacity="0.32" />
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#c96a37" flood-opacity="0.12" />
        </filter>

        <!-- Roof glow filter -->
        <filter id="roofGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <!-- Clip for body -->
        <clipPath id="bodyClip">
          <rect x="92" y="102" width="136" height="120" rx="28" />
        </clipPath>
      </defs>

      <!-- ── Background glow disc ── -->
      <circle cx="160" cy="178" r="130" fill="url(#bgGlow)" />

      <!-- ── Float + breathe group ── -->
      <g class="float-group">

        <!-- Ground shadow -->
        <ellipse cx="160" cy="270" rx="68" ry="13" fill="url(#shadowGrad)" class="shadow-ellipse" />

        <!-- ── Body + all features ── -->
        <g class="body-group" filter="url(#bodyShadow)">

          <!-- === BODY === -->
          <rect x="92" y="102" width="136" height="120" rx="28" fill="url(#bodyGrad)" />

          <!-- Inner noise / texture overlay -->
          <rect x="92" y="102" width="136" height="120" rx="28" fill="url(#rimLight)" />

          <!-- Subtle inner top-edge highlight -->
          <path
            d="M120 103 Q160 99 200 103"
            fill="none"
            stroke="#ffecc4"
            stroke-width="1.2"
            stroke-linecap="round"
            opacity="0.26"
          />

          <!-- === ROOF / CHEVRON === -->
          <path
            d="M76 130L160 60L244 130"
            fill="none"
            stroke="url(#roofGrad)"
            stroke-width="22"
            stroke-linecap="round"
            stroke-linejoin="round"
            filter="url(#roofGlow)"
          />
          <!-- Roof highlight line -->
          <path
            d="M82 126L160 65L238 126"
            fill="none"
            stroke="#fff4ea"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="0.2"
          />

          <!-- === CHEEK GLOWS === -->
          <ellipse cx="116" cy="182" rx="14" ry="10" fill="#ffd4c1" opacity="0.12" />
          <ellipse cx="204" cy="182" rx="14" ry="10" fill="#ffd4c1" opacity="0.12" />

          <!-- === EYES === -->
          <g class="eye-group">

            <!-- LEFT EYE -->
            <g transform="translate(128 158)">
              <!-- Outer glow ring -->
              <ellipse rx="23" :ry="blinkScale * 1.18" cx="0" cy="0" fill="#d9982c" opacity="0.12" />
              <!-- White -->
              <ellipse :ry="blinkScale" rx="20" cy="0" cx="0" fill="url(#eyeWhiteL)" />
              <!-- Iris + pupil -->
              <g :style="leftPupilStyle" filter="url(#eyeGlow)">
                <circle cx="0" cy="0" r="9.5" fill="url(#irisGrad)" />
                <!-- Iris rim -->
                <circle cx="0" cy="0" r="9.5" fill="none" stroke="#d9982c" stroke-width="1.5" opacity="0.45" />
                <!-- Pupil -->
                <circle cx="0" cy="0" r="5.5" fill="#030309" />
                <!-- Main specular highlight -->
                <circle cx="3.2" cy="-3.2" r="2.8" fill="#ffffff" opacity="0.92" />
                <!-- Secondary small highlight -->
                <circle cx="-2.5" cy="2" r="1.2" fill="#ffffff" opacity="0.35" />
              </g>
            </g>

            <!-- RIGHT EYE -->
            <g transform="translate(192 158)">
              <ellipse rx="23" :ry="blinkScale * 1.18" cx="0" cy="0" fill="#d9982c" opacity="0.12" />
              <ellipse :ry="blinkScale" rx="20" cy="0" cx="0" fill="url(#eyeWhiteR)" />
              <g :style="rightPupilStyle" filter="url(#eyeGlow)">
                <circle cx="0" cy="0" r="9.5" fill="url(#irisGrad)" />
                <circle cx="0" cy="0" r="9.5" fill="none" stroke="#d9982c" stroke-width="1.5" opacity="0.45" />
                <circle cx="0" cy="0" r="5.5" fill="#030309" />
                <circle cx="3.2" cy="-3.2" r="2.8" fill="#ffffff" opacity="0.92" />
                <circle cx="-2.5" cy="2" r="1.2" fill="#ffffff" opacity="0.35" />
              </g>
            </g>
          </g>

          <!-- === SMILE === -->
          <!-- Smile shadow/depth -->
          <path
            d="M142 196C147 205 154 210 160 210C166 210 173 205 178 196"
            fill="none"
            stroke="#374151"
            stroke-width="6"
            stroke-linecap="round"
          />
          <!-- Smile main -->
          <path
            d="M142 195C147 204 154 209 160 209C166 209 173 204 178 195"
            fill="none"
            stroke="#e2e8f0"
            stroke-width="4.5"
            stroke-linecap="round"
          />
          <!-- Smile highlight -->
          <path
            d="M148 197C151 203 155 206 160 206"
            fill="none"
            stroke="#ffffff"
            stroke-width="2"
            stroke-linecap="round"
            opacity="0.5"
          />

          <!-- === ARMS === -->
          <!-- Left arm -->
          <path
            d="M92 154C70 148 58 170 63 192"
            fill="none"
            stroke="url(#roofGrad)"
            stroke-width="13"
            stroke-linecap="round"
          />
          <!-- Left arm highlight -->
          <path
            d="M91 154C72 149 62 168 66 188"
            fill="none"
            stroke="#c4b5fd"
            stroke-width="3"
            stroke-linecap="round"
            opacity="0.22"
          />
          <!-- Right arm -->
          <path
            d="M228 154C250 148 262 170 257 192"
            fill="none"
            stroke="url(#roofGrad)"
            stroke-width="13"
            stroke-linecap="round"
          />
          <!-- Right arm highlight -->
          <path
            d="M229 154C248 149 258 168 254 188"
            fill="none"
            stroke="#c4b5fd"
            stroke-width="3"
            stroke-linecap="round"
            opacity="0.22"
          />

          <!-- === SMALL SPARKLE accents on body === -->
          <g class="sparkle-group" opacity="0.7">
            <!-- top-left sparkle -->
            <g transform="translate(108 118)">
              <line x1="-4" y1="0" x2="4" y2="0" stroke="#d9982c" stroke-width="1.2" stroke-linecap="round" />
              <line x1="0" y1="-4" x2="0" y2="4" stroke="#d9982c" stroke-width="1.2" stroke-linecap="round" />
            </g>
            <!-- top-right sparkle -->
            <g transform="translate(212 120)">
              <line x1="-3" y1="0" x2="3" y2="0" stroke="#c96a37" stroke-width="1" stroke-linecap="round" />
              <line x1="0" y1="-3" x2="0" y2="3" stroke="#c96a37" stroke-width="1" stroke-linecap="round" />
            </g>
          </g>

        </g><!-- end body-group -->
      </g><!-- end float-group -->
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

type Point = { x: number; y: number };

const leftEyeCenter: Point  = { x: 128, y: 158 };
const rightEyeCenter: Point = { x: 192, y: 158 };
const maxPupilOffset = 6;

const leftOffset  = ref<Point>({ x: 0, y: 0 });
const rightOffset = ref<Point>({ x: 0, y: 0 });
const blinkScale  = ref(20);

let blinkLoopTimeout:  ReturnType<typeof setTimeout> | null = null;
let blinkResetTimeout: ReturnType<typeof setTimeout> | null = null;

function clampPupil(eye: Point, x: number, y: number): Point {
  const dx = x - eye.x;
  const dy = y - eye.y;
  const angle    = Math.atan2(dy, dx);
  const distance = Math.min(maxPupilOffset, Math.hypot(dx, dy) * 0.06);
  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
}

function handleMouseMove(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const svgX  = ((event.clientX - rect.left)  / rect.width)  * 320;
  const svgY  = ((event.clientY - rect.top)   / rect.height) * 340;
  leftOffset.value  = clampPupil(leftEyeCenter,  svgX, svgY);
  rightOffset.value = clampPupil(rightEyeCenter, svgX, svgY);
}

function resetEyes() {
  leftOffset.value  = { x: 0, y: 0 };
  rightOffset.value = { x: 0, y: 0 };
}

const leftPupilStyle = computed(() => ({
  transform:  `translate(${leftOffset.value.x}px, ${leftOffset.value.y}px)`,
  transition: 'transform 100ms ease-out',
}));

const rightPupilStyle = computed(() => ({
  transform:  `translate(${rightOffset.value.x}px, ${rightOffset.value.y}px)`,
  transition: 'transform 100ms ease-out',
}));

function doBlink() {
  blinkScale.value = 1.5;
  if (blinkResetTimeout) clearTimeout(blinkResetTimeout);
  blinkResetTimeout = setTimeout(() => { blinkScale.value = 20; }, 130);
}

function scheduleBlink() {
  blinkLoopTimeout = setTimeout(() => {
    doBlink();
    // Occasionally do a double-blink
    if (Math.random() < 0.2) {
      setTimeout(doBlink, 320);
    }
    scheduleBlink();
  }, 2600 + Math.random() * 1800);
}

// Particle styles
function particleStyle(i: number): Record<string, string> {
  const angle    = (i / 12) * 360;
  const radius   = 38 + (i % 3) * 22;
  const size     = 2 + (i % 3) * 1.5;
  const delay    = (i * 0.38).toFixed(2);
  const duration = (3.2 + (i % 4) * 0.6).toFixed(2);
  const x = 50 + Math.cos((angle * Math.PI) / 180) * (radius / 2.2);
  const y = 52 + Math.sin((angle * Math.PI) / 180) * (radius / 2.8);
  return {
    left:             `${x}%`,
    top:              `${y}%`,
    width:            `${size}px`,
    height:           `${size}px`,
    animationDelay:   `${delay}s`,
    animationDuration:`${duration}s`,
    opacity:          (0.18 + (i % 4) * 0.09).toString(),
  };
}

onMounted(() => { scheduleBlink(); });
onBeforeUnmount(() => {
  if (blinkLoopTimeout)  clearTimeout(blinkLoopTimeout);
  if (blinkResetTimeout) clearTimeout(blinkResetTimeout);
});
</script>

<style scoped>
/* ── Scene wrapper ── */
.mascot-scene {
  position: relative;
  width: min(100%, 420px);
  margin: 0 auto;
  user-select: none;
  cursor: none;
}

/* ── SVG ── */
.mascot {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
  filter: drop-shadow(0 0 28px rgba(31, 79, 70, 0.14));
}

/* ── Floating animation ── */
.float-group {
  transform-origin: 160px 180px;
  animation: floaty 4s ease-in-out infinite;
}

/* ── Breathing scale ── */
.body-group {
  transform-origin: 160px 180px;
  animation: breathe 3.4s ease-in-out infinite;
}

/* ── Shadow follows float ── */
.shadow-ellipse {
  animation: shadowPulse 4s ease-in-out infinite;
}

/* ── Sparkles twinkle ── */
.sparkle-group {
  animation: twinkle 2.6s ease-in-out infinite alternate;
}

/* ── Ambient particles ── */
.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #ffecc4 0%, #d9982c 48%, #c96a37 72%, transparent 100%);
  animation: particleDrift linear infinite;
}

/* ── Keyframes ── */
@keyframes floaty {
  0%, 100% { transform: translateY(0px)  rotate(-0.5deg); }
  50%       { transform: translateY(-9px) rotate(0.5deg);  }
}

@keyframes breathe {
  0%, 100% { transform: scale(1);    }
  50%       { transform: scale(1.012); }
}

@keyframes shadowPulse {
  0%, 100% { transform: scaleX(1)   translateY(0px);  opacity: 1;    }
  50%       { transform: scaleX(0.88) translateY(9px); opacity: 0.65; }
}

@keyframes twinkle {
  0%   { opacity: 0.3;  transform: scale(0.85) rotate(0deg);  }
  100% { opacity: 0.9;  transform: scale(1.15) rotate(15deg); }
}

@keyframes particleDrift {
  0%   { transform: translateY(0px)   scale(1);    opacity: var(--op, 0.25); }
  50%  { transform: translateY(-14px) scale(1.3);  opacity: calc(var(--op, 0.25) * 1.6); }
  100% { transform: translateY(0px)   scale(1);    opacity: var(--op, 0.25); }
}

/* ── Smooth eye transitions ── */
.eye-group ellipse,
.eye-group circle,
.eye-group g {
  transition: all 0.1s ease;
}
</style>
