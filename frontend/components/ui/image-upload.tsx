"use client"

import React, { useState, useRef, useEffect } from "react"
import { ImagePlus, X, Loader2, UploadCloud } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  readonly value?: string
  readonly onChange: (url: string) => void
  readonly onRemove?: () => void
  readonly className?: string
}

export function ImageUpload({ value, onChange, onRemove, className }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`${apiUrl}/admin/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onChange(data.url)
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Upload failed",
          description: errorData.message || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "Could not connect to the server",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isUploading || !isHovering) return
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of Array.from(items)) {
        if (item.type.includes("image")) {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            handleFileUpload(file)
            break
          }
        }
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => {
      document.removeEventListener("paste", handlePaste)
    }
  }, [isUploading, isHovering])

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    if (onRemove) onRemove()
  }

  return (
    <div 
      className={cn("space-y-4 w-full", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            if (!isUploading) fileInputRef.current?.click()
          }
        }}
        className={cn(
          "relative flex items-center justify-center w-full min-h-[100px] border border-dashed rounded-xl transition-all duration-200 ease-in-out overflow-hidden cursor-pointer",
          isDragging ? "border-gray-400 bg-gray-50" : "border-gray-300 bg-white hover:bg-gray-50",
          isUploading && "opacity-50 cursor-not-allowed",
          value && "border-solid border-gray-200 p-0"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />

        {value ? (
          <div className="relative w-full h-full group">
            <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-medium flex items-center gap-2">
                <UploadCloud className="w-5 h-5" />
                Change Image
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center p-6 text-center text-gray-400">
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin text-gray-500" />
                <span className="text-sm font-medium text-gray-500">
                  Uploading...
                </span>
              </>
            ) : (
              <div className="flex items-center gap-2 group-hover:text-gray-500 transition-colors">
                <ImagePlus className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Select Image (.jpeg, .jpg, .png with max size 5MB)
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
