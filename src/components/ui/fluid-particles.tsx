"use client"

import { useEffect, useMemo, useRef } from "react"

interface MousePosition {
  x: number
  y: number
  prevX: number
  prevY: number
}

interface BlastState {
  active: boolean
  x: number
  y: number
  radius: number
  maxRadius: number
}

export function FluidParticles({
  particleDensity = 100,
  particleSize = 1,
  particleColor = "#555555",
  maxBlastRadius = 300,
  hoverDelay = 100,
  interactionDistance = 10,
}) {
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
        this.color = particleColor
        this.vx = 0
        this.vy = 0
        this.friction = 0.9 - 0.01 * this.density
      }

      draw() {
        const ctx = contextRef.current
        if (!ctx) return

        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 1)
        ctx.closePath()
        ctx.fill()
      }

      update() {
        const ctx = contextRef.current
        if (!ctx) return

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

          this.x -= forceDirectionX * force * this.density * 0.6
          this.y -= forceDirectionY * force * this.density * 0.6
        } else {
          if (this.x !== this.baseX) {
            const deltaX = this.x - this.baseX
            this.x -= deltaX / 20
          }
          if (this.y !== this.baseY) {
            const deltaY = this.y - this.baseY
            this.y -= deltaY / 20
          }
          this.color = particleColor
        }

        if (blastRef.current.active) {
          const blastDx = this.x - blastRef.current.x
          const blastDy = this.y - blastRef.current.y
          const blastDistance = Math.sqrt(blastDx * blastDx + blastDy * blastDy)

          if (blastDistance < blastRef.current.radius) {
            const blastForceX = blastDx / (blastDistance || 1)
            const blastForceY = blastDy / (blastDistance || 1)
            const blastForce = (blastRef.current.radius - blastDistance) / blastRef.current.radius

            this.vx += blastForceX * blastForce * 15
            this.vy += blastForceY * blastForce * 15

            const intensity = Math.min(255, Math.floor(255 - blastDistance))
            this.color = `rgba(${intensity}, 100, 255, 0.8)`
          }
        }

        this.draw()
      }
    }
  }, [interactionDistance, particleColor, particleSize])

  type ParticleInstance = InstanceType<typeof ParticleClass>

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const particlesRef = useRef<ParticleInstance[]>([])
  const mouseRef = useRef<MousePosition>({ x: 0, y: 0, prevX: 0, prevY: 0 })
  const blastRef = useRef<BlastState>({ active: false, x: 0, y: 0, radius: 0, maxRadius: maxBlastRadius })
  const animationRef = useRef<number | null>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      const duration = 300

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
          }, 100)
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
    }

    const moveThrottle = 10
    let lastMoveTime = 0

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
  }, [ParticleClass, hoverDelay, interactionDistance, maxBlastRadius, particleColor, particleDensity, particleSize])

  return (
    <div>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}