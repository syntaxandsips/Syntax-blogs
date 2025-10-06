"use client"

import { useEffect, useMemo, useRef, useState } from "react"

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
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 })
  const blastRef = useRef({ active: false, x: 0, y: 0, radius: 0, maxRadius: maxBlastRadius })
  const animationRef = useRef<number | null>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Get a random theme on initial load
  const [theme] = useState(() => {
    // Get a random theme index
    const randomIndex = Math.floor(Math.random() * backgroundThemes.length)
    return backgroundThemes[randomIndex]
  })

  const CodeSymbolClass = useMemo(() => {
    return class CodeSymbol {
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
        this.size = Math.random() * 10 + 8
        this.opacity = Math.random() * 0.3 + 0.1
        this.color = theme.particleColor
        this.velocity = Math.random() * 0.2 + 0.1
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
        this.y += this.velocity

        if (this.y > window.innerHeight) {
          this.y = 0
          this.x = Math.random() * window.innerWidth
          this.symbol = codingSymbols[Math.floor(Math.random() * codingSymbols.length)]
        }

        if (blastRef.current.active) {
          const blastDx = this.x - blastRef.current.x
          const blastDy = this.y - blastRef.current.y
          const blastDistance = Math.sqrt(blastDx * blastDx + blastDy * blastDy)

          if (blastDistance < blastRef.current.radius) {
            const blastEffect = (blastRef.current.radius - blastDistance) / blastRef.current.radius
            this.opacity = Math.min(0.8, this.opacity + blastEffect * 0.5)
          }
        } else if (this.opacity > 0.4) {
          this.opacity -= 0.01
        }

        this.draw()
      }
    }
  }, [theme])

  const ParticleClass = useMemo(() => {
    return class Particle {
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
        this.friction = 0.92 - 0.01 * this.density
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

        this.x += this.vx
        this.y += this.vy
        this.vx *= this.friction
        this.vy *= this.friction

        const dx = mouseRef.current.x - this.x
        const dy = mouseRef.current.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < interactionDistance) {
          const forceDirectionX = dx / (distance || 1)
          const forceDirectionY = dy / (distance || 1)
          const force = (interactionDistance - distance) / interactionDistance

          this.x -= forceDirectionX * force * this.density * 0.3
          this.y -= forceDirectionY * force * this.density * 0.3
          this.color = theme.activeColor
        } else {
          if (this.x !== this.baseX) {
            const deltaX = this.x - this.baseX
            this.x -= deltaX / 30
          }
          if (this.y !== this.baseY) {
            const deltaY = this.y - this.baseY
            this.y -= deltaY / 30
          }
          this.color = theme.particleColor
        }

        if (blastRef.current.active) {
          const blastDx = this.x - blastRef.current.x
          const blastDy = this.y - blastRef.current.y
          const blastDistance = Math.sqrt(blastDx * blastDx + blastDy * blastDy)

          if (blastDistance < blastRef.current.radius) {
            const blastForceX = blastDx / (blastDistance || 1)
            const blastForceY = blastDy / (blastDistance || 1)
            const blastForce = (blastRef.current.radius - blastDistance) / blastRef.current.radius

            this.vx += blastForceX * blastForce * 8
            this.vy += blastForceY * blastForce * 8

            const intensity = Math.min(255, Math.floor(255 - blastDistance))
            this.color = theme.blastColor(intensity)
          }
        }

        this.draw()
      }
    }
  }, [interactionDistance, particleSize, theme])

  type ParticleInstance = InstanceType<typeof ParticleClass>
  type CodeSymbolInstance = InstanceType<typeof CodeSymbolClass>

  const particlesRef = useRef<ParticleInstance[]>([])
  const symbolsRef = useRef<CodeSymbolInstance[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    blastRef.current.maxRadius = maxBlastRadius

    contextRef.current = canvas.getContext("2d", { alpha: true })

    if (contextRef.current) {
      contextRef.current.globalCompositeOperation = "lighter"
    }

    const passiveOptions: AddEventListenerOptions = { passive: true }
    const moveThrottle = 10
    let lastMoveTime = 0

    const easeOutQuad = (t: number) => t * (2 - t)

    const triggerBlast = (x: number, y: number) => {
      blastRef.current = {
        active: true,
        x,
        y,
        radius: 0,
        maxRadius: maxBlastRadius,
      }

      const startTime = performance.now()
      const duration = 400

      const expandBlast = (timestamp: number) => {
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easeOutQuad(progress)

        blastRef.current.radius = easedProgress * blastRef.current.maxRadius

        if (progress < 1) {
          requestAnimationFrame(expandBlast)
        } else {
          setTimeout(() => {
            blastRef.current.active = false
          }, 200)
        }
      }

      requestAnimationFrame(expandBlast)

      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = null
      }
    }

    const initParticles = () => {
      particlesRef.current = []
      const width = window.innerWidth
      const height = window.innerHeight
      const particleCount = Math.floor((width * height) / particleDensity)

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        particlesRef.current.push(new ParticleClass(x, y))
      }
    }

    const initCodeSymbols = () => {
      symbolsRef.current = []
      const width = window.innerWidth
      const height = window.innerHeight
      const symbolCount = Math.floor((width * height) / (particleDensity * 5))

      for (let i = 0; i < symbolCount; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        symbolsRef.current.push(new CodeSymbolClass(x, y))
      }
    }

    const handleResize = () => {
      const pixelRatio = window.devicePixelRatio || 1
      const ctx = contextRef.current

      canvas.width = window.innerWidth * pixelRatio
      canvas.height = window.innerHeight * pixelRatio
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`

      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.scale(pixelRatio, pixelRatio)
      }

      initParticles()
      initCodeSymbols()
    }

    const handleMouseMove = (event: MouseEvent) => {
      const now = performance.now()
      if (now - lastMoveTime < moveThrottle) return
      lastMoveTime = now

      const prevX = mouseRef.current.x
      const prevY = mouseRef.current.y
      mouseRef.current = { x: event.clientX, y: event.clientY, prevX, prevY }

      const deltaX = mouseRef.current.x - mouseRef.current.prevX
      const deltaY = mouseRef.current.y - mouseRef.current.prevY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (distance < 5) {
        if (!hoverTimerRef.current) {
          hoverTimerRef.current = setTimeout(() => {
            triggerBlast(event.clientX, event.clientY)
          }, hoverDelay)
        }
      } else if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = null
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (!event.touches[0]) return
      const prevX = mouseRef.current.x
      const prevY = mouseRef.current.y
      mouseRef.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
        prevX,
        prevY,
      }
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (!event.touches[0]) return
      const { clientX, clientY } = event.touches[0]

      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }

      hoverTimerRef.current = setTimeout(() => {
        triggerBlast(clientX, clientY)
      }, hoverDelay)
    }

    const handleTouchEnd = () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = null
      }
    }

    const handleClick = (event: MouseEvent) => {
      triggerBlast(event.clientX, event.clientY)
    }

    const animate = () => {
      const ctx = contextRef.current
      if (!ctx) return

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.fillStyle = theme.backgroundColor
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      symbolsRef.current.forEach((symbol) => symbol.update())
      particlesRef.current.forEach((particle) => particle.update())

      animationRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove, passiveOptions)
    window.addEventListener("touchstart", handleTouchStart, passiveOptions)
    window.addEventListener("touchend", handleTouchEnd)
    window.addEventListener("click", handleClick)

    handleResize()
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove, passiveOptions)
      window.removeEventListener("touchstart", handleTouchStart, passiveOptions)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("click", handleClick)

      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = null
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [CodeSymbolClass, ParticleClass, hoverDelay, interactionDistance, maxBlastRadius, particleDensity, particleSize, theme])

  return (
    <div className="">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
