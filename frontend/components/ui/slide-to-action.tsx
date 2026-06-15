"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { ChevronsRight } from "lucide-react"

interface SlideToActionProps {
  onAction: () => void
  actionText?: string
  successText?: string
  isDestructive?: boolean
  className?: string
}

export function SlideToAction({
  onAction,
  actionText = "Slide to action",
  successText = "Success!",
  isDestructive = false,
  className,
}: Readonly<SlideToActionProps>) {
  const [isSliding, setIsSliding] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isSuccess, setIsSuccess] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isSuccess) return
    setIsSliding(true)
    startXRef.current = e.clientX - dragOffset
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isSliding || !containerRef.current) return

    const containerWidth = containerRef.current.offsetWidth
    const maxOffset = containerWidth - 48 // 48 is thumb width

    let newOffset = e.clientX - startXRef.current
    newOffset = Math.max(0, Math.min(newOffset, maxOffset))
    setDragOffset(newOffset)

    if (newOffset >= maxOffset * 0.95 && !isSuccess) {
      setIsSuccess(true)
      setIsSliding(false)
      setDragOffset(maxOffset)
      onAction()
    }
  }

  const handlePointerUp = () => {
    if (isSuccess) return
    setIsSliding(false)
    setDragOffset(0)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-12 w-full rounded-full flex items-center p-1 select-none overflow-hidden border",
        isDestructive 
          ? "bg-red-100 border-red-200" 
          : "bg-muted border-border",
        className
      )}
      aria-label={actionText}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-sm font-medium text-muted-foreground">
          {isSuccess ? successText : actionText}
        </span>
      </div>

      <button
        type="button"
        className={cn(
          "absolute left-0 top-0 bottom-0 w-12 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform touch-none shadow-sm z-10",
          isDestructive ? "bg-red-500 text-white" : "bg-white text-primary",
          isSuccess && "opacity-0 transition-opacity duration-300",
        )}
        style={{ transform: `translateX(${dragOffset}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <ChevronsRight className="w-5 h-5" />
      </button>
    </div>
  )
}
