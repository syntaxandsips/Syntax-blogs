"use client"

import { useEffect, useRef, useState } from "react"

// Define coding symbols to use in the background
const codingSymbols = [
  "{", "}", "(", ")", "[", "]", "<", ">", ";", "=", "+", "-", "*", "/",
  "&&", "||", "=>", "function", "const", "let", "var", "if", "else", "for", "while",
  "return", "import", "export", "class", "interface", "type", "async", "await"
]

// Define different background themes
const backgroundThemes = [
  {
    name: "darkCoding",
    particleColor: "rgba(100, 100, 255, 0.3)",
    activeColor: "rgba(150, 150, 255, 0.5)",
    blastColor: (intensity: number) => `rgba(${intensity}, 100, 255, 0.4)`,
    backgroundColor: "rgba(10, 10, 30, 0.9)"
  },
  {
    name: "matrixGreen",
    particleColor: "rgba(0, 180, 0, 0.3)",
    activeColor: "rgba(0, 255, 0, 0.5)",
    blastColor: (intensity: number) => `rgba(0, ${intensity}, 0, 0.4)`,
    backgroundColor: "rgba(0, 20, 0, 0.9)"
  },
  {
    name: "cyberPunk",
    particleColor: "rgba(255, 50, 150, 0.3)",
    activeColor: "rgba(255, 100, 200, 0.5)",
    blastColor: (intensity: number) => `rgba(255, ${intensity}, ${Math.floor(intensity/2)}, 0.4)`,
    backgroundColor: "rgba(30, 0, 30, 0.9)"
  },
  {
    name: "blueNight",
    particleColor: "rgba(0, 100, 200, 0.3)",
    activeColor: "rgba(50, 150, 255, 0.5)",
    blastColor: (intensity: number) => `rgba(50, ${intensity}, 255, 0.4)`,
    backgroundColor: "rgba(0, 10, 30, 0.9)"
  }
]

export function EnhancedFluidParticles({
  particleDensity = 150,
  particleSize = 1,
  maxBlastRadius = 200,
  hoverDelay = 50,
  interactionDistance = 60,
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const symbolsRef = useRef<CodeSymbol[]>([])
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 })
  const blastRef = useRef({ active: false, x: 0, y: 0, radius: 0, maxRadius: maxBlastRadius })
  const animationRef = useRef<number>(0)
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Get a random theme on initial load
  const [theme] = useState(() => {
    // Get a random theme index
    const randomIndex = Math.floor(Math.random() * backgroundThemes.length)
    return backgroundThemes[randomIndex]
  })

  // Code symbol class for text elements
  class CodeSymbol {
    x: number
    y: number
    symbol: string
    size: number
    opacity: number
    color: string
    velocity: number

    constructor(x: number, y: number) {
      this.x = x
      this.y = y
      this.symbol = codingSymbols[Math.floor(Math.random() * codingSymbols.length)]
      this.size = Math.random() * 10 + 8 // Font size between 8-18px
      this.opacity = Math.random() * 0.3 + 0.1 // Low opacity between 0.1-0.4
      this.color = theme.particleColor
      this.velocity = Math.random() * 0.2 + 0.1 // Slow downward movement
    }

    draw() {
      if (!contextRef.current) return

      contextRef.current.font = `${this.size}px monospace`
      contextRef.current.fillStyle = this.color
      contextRef.current.globalAlpha = this.opacity
      contextRef.current.fillText(this.symbol, this.x, this.y)
      contextRef.current.globalAlpha = 1
    }

    update() {
      // Move symbol downward slowly
      this.y += this.velocity

      // Reset position if it goes off screen
      if (this.y > window.innerHeight) {
        this.y = 0
        this.x = Math.random() * window.innerWidth
        this.symbol = codingSymbols[Math.floor(Math.random() * codingSymbols.length)]
      }

      // Handle blast effect
      if (blastRef.current.active) {
        const blastDx = this.x - blastRef.current.x
        const blastDy = this.y - blastRef.current.y
        const blastDistance = Math.sqrt(blastDx * blastDx + blastDy * blastDy)

        if (blastDistance < blastRef.current.radius) {
          // Temporarily increase opacity based on blast
          const blastEffect = (blastRef.current.radius - blastDistance) / blastRef.current.radius
          this.opacity = Math.min(0.8, this.opacity + blastEffect * 0.5)
        }
      } else {
        // Gradually return to normal opacity
        if (this.opacity > 0.4) {
          this.opacity -= 0.01
        }
      }

      this.draw()
    }
  }

  // Particle class with velocity for more fluid movement
  class Particle {
    x: number
    y: number
    size: number
    baseX: number
    baseY: number
    density: number
    color: string
    vx: number
    vy: number
    friction: number

    constructor(x: number, y: number) {
      this.x = x
      this.y = y
      this.baseX = x
      this.baseY = y
      this.size = Math.random() * particleSize + 0.5
      this.density = Math.random() * 3 + 1
      this.color = theme.particleColor
      this.vx = 0
      this.vy = 0
      this.friction = 0.92 - 0.01 * this.density // Slightly higher friction for smoother movement
    }

    draw() {
      if (!contextRef.current) return

      contextRef.current.fillStyle = this.color
      contextRef.current.beginPath()
      contextRef.current.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      contextRef.current.closePath()
      contextRef.current.fill()
    }

    update() {
      if (!contextRef.current) return

      // Apply velocity with friction
      this.x += this.vx
      this.y += this.vy
      this.vx *= this.friction
      this.vy *= this.friction

      // Calculate distance between mouse and particle
      const dx = mouseRef.current.x - this.x
      const dy = mouseRef.current.y - this.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Only calculate force if within interaction distance
      if (distance < interactionDistance) {
        const forceDirectionX = dx / distance
        const forceDirectionY = dy / distance
        const force = (interactionDistance - distance) / interactionDistance

        this.x -= forceDirectionX * force * this.density * 0.3 // Reduced force for subtler effect
        this.y -= forceDirectionY * force * this.density * 0.3
        this.color = theme.activeColor
      } else {
        // If particle is far from mouse, return to original position with easing
        if (this.x !== this.baseX) {
          const dx = this.x - this.baseX
          this.x -= dx / 30 // Slower return for smoother effect
        }
        if (this.y !== this.baseY) {
          const dy = this.y - this.baseY
          this.y -= dy / 30
        }
        this.color = theme.particleColor
      }

      // Handle blast effect
      if (blastRef.current.active) {
        const blastDx = this.x - blastRef.current.x
        const blastDy = this.y - blastRef.current.y
        const blastDistance = Math.sqrt(blastDx * blastDx + blastDy * blastDy)

        if (blastDistance < blastRef.current.radius) {
          // Calculate normalized direction vector
          const blastForceX = blastDx / (blastDistance || 1) // Avoid division by zero
          const blastForceY = blastDy / (blastDistance || 1)

          // Calculate force based on distance from blast center
          const blastForce = (blastRef.current.radius - blastDistance) / blastRef.current.radius

          // Apply force as velocity with smoother acceleration
          this.vx += blastForceX * blastForce * 8 // Reduced force for subtler effect
          this.vy += blastForceY * blastForce * 8

          // Change color based on blast with smoother transition
          const intensity = Math.min(255, Math.floor(255 - blastDistance))
          this.color = theme.blastColor(intensity)
        }
      }

      this.draw()
    }
  }

  // Initialize canvas and particles
  const init = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    contextRef.current = canvas.getContext("2d", { alpha: true })

    // Enable alpha blending for smoother rendering
    if (contextRef.current) {
      contextRef.current.globalCompositeOperation = "lighter"
    }

    // Set canvas to full width/height with device pixel ratio for sharper rendering
    const handleResize = () => {
      const pixelRatio = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * pixelRatio
      canvas.height = window.innerHeight * pixelRatio
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`

      if (contextRef.current) {
        contextRef.current.scale(pixelRatio, pixelRatio)
      }

      initParticles()
      initCodeSymbols()
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    // Track mouse position and detect hover with throttling for performance
    let lastMoveTime = 0
    const moveThrottle = 10 // ms

    window.addEventListener("mousemove", (e) => {
      const now = performance.now()
      if (now - lastMoveTime < moveThrottle) return
      lastMoveTime = now

      const prevX = mouseRef.current.x
      const prevY = mouseRef.current.y
      mouseRef.current = { x: e.x, y: e.y, prevX, prevY }

      // Calculate mouse movement distance
      const dx = mouseRef.current.x - mouseRef.current.prevX
      const dy = mouseRef.current.y - mouseRef.current.prevY
      const distance = Math.sqrt(dx * dx + dy * dy)

      // If mouse is moving very little, start hover timer
      if (distance < 5) {
        if (hoverTimerRef.current === null) {
          hoverTimerRef.current = setTimeout(() => {
            triggerBlast(e.x, e.y)
          }, hoverDelay)
        }
      } else {
        // If mouse moves significantly, clear hover timer
        if (hoverTimerRef.current) {
          clearTimeout(hoverTimerRef.current)
          hoverTimerRef.current = null
        }
      }
    })

    // Handle touch for mobile
    window.addEventListener("touchmove", (e) => {
      if (e.touches[0]) {
        const prevX = mouseRef.current.x
        const prevY = mouseRef.current.y
        mouseRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          prevX,
          prevY,
        }
      }
    })

    // Handle touch start for blast effect on mobile
    window.addEventListener("touchstart", (e) => {
      if (e.touches[0]) {
        const x = e.touches[0].clientX
        const y = e.touches[0].clientY

        // Start hover timer for touch
        hoverTimerRef.current = setTimeout(() => {
          triggerBlast(x, y)
        }, hoverDelay)
      }
    })

    // Handle touch end to clear hover timer
    window.addEventListener("touchend", () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = null
      }
    })

    // Handle click for immediate blast
    window.addEventListener("click", (e) => {
      triggerBlast(e.x, e.y)
    })

    // Start animation
    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", () => {})
      window.removeEventListener("touchmove", () => {})
      window.removeEventListener("touchstart", () => {})
      window.removeEventListener("touchend", () => {})
      window.removeEventListener("click", () => {})
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      cancelAnimationFrame(animationRef.current)
    }
  }

  // Trigger blast effect
  const triggerBlast = (x: number, y: number) => {
    blastRef.current = {
      active: true,
      x,
      y,
      radius: 0,
      maxRadius: maxBlastRadius,
    }

    // Animate the blast radius with smoother expansion
    const startTime = performance.now()
    const duration = 400 // ms for full expansion (slightly longer for smoother effect)

    const expandBlast = (timestamp: number) => {
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Use easing function for smoother expansion
      const easedProgress = easeOutQuad(progress)
      blastRef.current.radius = easedProgress * blastRef.current.maxRadius

      if (progress < 1) {
        requestAnimationFrame(expandBlast)
      } else {
        // Reset blast after reaching max radius
        setTimeout(() => {
          blastRef.current.active = false
        }, 200)
      }
    }

    requestAnimationFrame(expandBlast)

    // Clear hover timer
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }

  // Easing function for smoother animations
  const easeOutQuad = (t: number) => t * (2 - t)

  // Create particles in a grid with higher density
  const initParticles = () => {
    particlesRef.current = []
    const canvas = canvasRef.current
    if (!canvas) return

    // Increase particle density (lower divisor = more particles)
    const particleCount = Math.floor((window.innerWidth * window.innerHeight) / particleDensity)

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * window.innerWidth
      const y = Math.random() * window.innerHeight
      particlesRef.current.push(new Particle(x, y))
    }
  }

  // Create code symbols
  const initCodeSymbols = () => {
    symbolsRef.current = []
    const canvas = canvasRef.current
    if (!canvas) return

    // Add fewer code symbols than particles
    const symbolCount = Math.floor((window.innerWidth * window.innerHeight) / (particleDensity * 5))

    for (let i = 0; i < symbolCount; i++) {
      const x = Math.random() * window.innerWidth
      const y = Math.random() * window.innerHeight
      symbolsRef.current.push(new CodeSymbol(x, y))
    }
  }

  // Animation loop with timing optimization
  const animate = () => {
    const canvas = canvasRef.current
    const ctx = contextRef.current
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    // Draw background with theme color
    ctx.fillStyle = theme.backgroundColor
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

    // Update and draw code symbols
    symbolsRef.current.forEach((symbol) => {
      symbol.update()
    })

    // Update and draw particles
    particlesRef.current.forEach((particle) => {
      particle.update()
    })

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const cleanup = init()
    return cleanup
  }, [init])

  return (
    <div className="">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
