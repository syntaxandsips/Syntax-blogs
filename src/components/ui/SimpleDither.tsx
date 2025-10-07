"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "next-themes";

import './Dither.css';

// Theme-specific color presets
const themeColors: Record<"light" | "dark", Record<"ts" | "tailwind", [number, number, number]>> = {
  light: {
    ts: [0.8, 0.5, 0.9], // Purple for light mode (TypeScript)
    tailwind: [0.6, 0.4, 0.8] // Purple for light mode (Tailwind)
  },
  dark: {
    ts: [0.3, 0.5, 0.9], // Blue for dark mode (TypeScript)
    tailwind: [0.2, 0.7, 0.9] // Blue for dark mode (Tailwind)
  }
};

// Shader for the wave effect
const waveVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const waveFragmentShader = `
  uniform float time;
  uniform vec3 color;
  uniform vec2 resolution;
  uniform float waveSpeed;
  uniform float waveFrequency;
  uniform float waveAmplitude;
  uniform vec2 mousePos;
  uniform int enableMouseInteraction;
  uniform float mouseRadius;
  varying vec2 vUv;

  // Simplex noise function
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;

    // Adjust UV for aspect ratio
    uv.x *= resolution.x / resolution.y;

    // Create wave pattern
    float n = 0.0;

    // Multiple layers of noise for more complex pattern
    n += 0.5 * snoise(uv * waveFrequency + time * waveSpeed);
    n += 0.25 * snoise(uv * waveFrequency * 2.0 + time * waveSpeed * 1.3);
    n += 0.125 * snoise(uv * waveFrequency * 4.0 + time * waveSpeed * 1.7);
    n += 0.0625 * snoise(uv * waveFrequency * 8.0 + time * waveSpeed * 2.1);

    // Apply mouse interaction
    if (enableMouseInteraction == 1) {
      vec2 mouseUV = mousePos / resolution;
      mouseUV.y = 1.0 - mouseUV.y; // Flip Y
      float dist = distance(vUv, mouseUV);
      float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);
      n += effect * 0.5;
    }

    // Apply wave amplitude
    n *= waveAmplitude;

    // Create color gradient based on the base color
    vec3 bgColor = vec3(0.05, 0.05, 0.15); // Default dark background

    // Use the color to determine if we're in light or dark mode
    // If the blue component is higher than red, we're likely in dark mode
    if (color.b > color.r) {
      // Dark mode - keep dark background
      bgColor = vec3(0.05, 0.05, 0.15);
    } else {
      // Light mode - use white/light background
      bgColor = vec3(0.95, 0.95, 1.0);
    }

    vec3 finalColor = mix(bgColor, color, n);

    // Add some dithering effect manually for texture
    float dither = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
    finalColor += (dither * 0.03 - 0.015); // More subtle dither

    // Output final color
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

interface WaveEffectProps {
  waveSpeed: number
  waveFrequency: number
  waveAmplitude: number
  waveColor: [number, number, number]
  enableMouseInteraction: boolean
  mouseRadius: number
}

function WaveEffect({
  waveSpeed,
  waveFrequency,
  waveAmplitude,
  waveColor,
  enableMouseInteraction,
  mouseRadius
}: WaveEffectProps) {
  const mesh = useRef(null);
  const [, setMousePos] = useState(new THREE.Vector2(0, 0));
  const { viewport, size } = useThree();

  const uniforms = useRef({
    time: { value: 0 },
    color: { value: new THREE.Color(waveColor[0], waveColor[1], waveColor[2]) },
    resolution: { value: new THREE.Vector2(size.width, size.height) },
    waveSpeed: { value: waveSpeed },
    waveFrequency: { value: waveFrequency },
    waveAmplitude: { value: waveAmplitude },
    mousePos: { value: new THREE.Vector2(0, 0) },
    enableMouseInteraction: { value: enableMouseInteraction ? 1 : 0 },
    mouseRadius: { value: mouseRadius }
  });

  useEffect(() => {
    uniforms.current.resolution.value.set(size.width, size.height);
  }, [size]);

  useEffect(() => {
    uniforms.current.color.value.set(waveColor[0], waveColor[1], waveColor[2]);
    uniforms.current.waveSpeed.value = waveSpeed;
    uniforms.current.waveFrequency.value = waveFrequency;
    uniforms.current.waveAmplitude.value = waveAmplitude;
    uniforms.current.enableMouseInteraction.value = enableMouseInteraction ? 1 : 0;
    uniforms.current.mouseRadius.value = mouseRadius;
  }, [waveColor, waveSpeed, waveFrequency, waveAmplitude, enableMouseInteraction, mouseRadius]);

  useFrame(({ clock }) => {
    if (uniforms.current.time) {
      uniforms.current.time.value = clock.getElapsedTime();
    }
  });

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!enableMouseInteraction) return;

    const x = e.clientX;
    const y = e.clientY;
    setMousePos(new THREE.Vector2(x, y));

    if (uniforms.current.mousePos) {
      uniforms.current.mousePos.value.set(x, y);
    }
  };

  return (
    <>
      <mesh
        ref={mesh}
        scale={[viewport.width, viewport.height, 1]}
        onPointerMove={handlePointerMove}
      >
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={waveVertexShader}
          fragmentShader={waveFragmentShader}
          uniforms={uniforms.current}
        />
      </mesh>
    </>
  );
}

// Removed unused CodingSymbols component

interface SimpleDitherProps {
  waveSpeed?: number
  waveFrequency?: number
  waveAmplitude?: number
  enableMouseInteraction?: boolean
  mouseRadius?: number
  colorTheme?: keyof (typeof themeColors)['light']
}

export default function SimpleDither({
  waveSpeed = 0.05,
  waveFrequency = 3,
  waveAmplitude = 0.3,
  enableMouseInteraction = true,
  mouseRadius = 0.3,
  colorTheme = "ts"
}: SimpleDitherProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Choose color based on theme and colorTheme prop
  const themeColor = isDark
    ? themeColors.dark[colorTheme]
    : themeColors.light[colorTheme];

  // Use the theme-specific color if available, otherwise use a default
  const finalWaveColor = themeColor || [0.5, 0.5, 0.5];

  return (
    <Canvas
      className="dither-container"
      camera={{ position: [0, 0, 5] }}
      dpr={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
    >
      <WaveEffect
        waveSpeed={waveSpeed}
        waveFrequency={waveFrequency}
        waveAmplitude={waveAmplitude}
        waveColor={finalWaveColor}
        enableMouseInteraction={enableMouseInteraction}
        mouseRadius={mouseRadius}
      />
    </Canvas>
  );
}
