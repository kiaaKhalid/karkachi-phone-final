"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface DragDropImageUploadProps {
  readonly onImageUpload: (imageUrl: string) => void
  readonly onImageRemove?: () => void
  readonly currentImage?: string
  readonly maxSizeMB?: number
  readonly acceptedFormats?: readonly string[]
  readonly placeholder?: string
  readonly className?: string
}

export default function DragDropImageUpload({
  onImageUpload,
  onImageRemove,
  currentImage,
  maxSizeMB = 10,
  acceptedFormats = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  placeholder = "Glissez-déposez une image ici ou cliquez pour parcourir",
  className,
}: DragDropImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Format non supporté. Utilisez: ${acceptedFormats.map((f) => f.split("/")[1].toUpperCase()).join(", ")}`
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB`
    }

    return null
  }

  const handleFileUpload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setIsUploading(true)
      setError(null)

      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(`${apiUrl}/admin/upload/image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          onImageUpload(data.url)
          toast({
            title: "Success",
            description: "Image uploaded successfully",
          })
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Something went wrong")
          toast({
            title: "Upload failed",
            description: errorData.message || "Something went wrong",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("Upload error:", err)
        setError("Erreur lors du téléchargement")
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
    },
    [onImageUpload, apiUrl, toast],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )



  const handleRemoveImage = useCallback(() => {
    if (onImageRemove) {
      onImageRemove()
    }
    setError(null)
  }, [onImageRemove])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (isUploading) return
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile()
          if (file) {
            e.preventDefault()
            handleFileUpload(file)
            break
          }
        }
      }
    },
    [isUploading, handleFileUpload],
  )

  return (
    <div className={cn("space-y-4", className)}>


      {/* Current Image Preview */}
      {currentImage && (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={currentImage || "/Placeholder.png"}
                alt="Aperçu actuel"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Image téléchargée avec succès
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload */}
      {!currentImage && (
        <Card>
          <CardContent className="p-0">
            <div
              role="button"
              tabIndex={0}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500",
                isDragOver
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
                error && "border-red-500 bg-red-50 dark:bg-red-900/20",
                isUploading && "border-green-500 bg-green-50 dark:bg-green-900/20",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  openFileDialog()
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats.join(",")}
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 text-gray-400">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  ) : (
                    <ImageIcon className="w-12 h-12" />
                  )}
                </div>

                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {isUploading ? "Téléchargement en cours..." : placeholder}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Formats supportés: {acceptedFormats.map((f) => f.split("/")[1].toUpperCase()).join(", ")}
                    (Max {maxSizeMB}MB)
                  </p>
                </div>

                {!isUploading && (
                  <Button type="button" variant="outline" onClick={openFileDialog}>
                    Choisir un fichier
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}



      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
