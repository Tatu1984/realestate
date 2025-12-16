'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  category?: 'images' | 'avatars' | 'properties'
  disabled?: boolean
  className?: string
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  maxSize = 5,
  category = 'properties',
  disabled = false,
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null)
      const fileArray = Array.from(files)

      // Validate file count
      if (value.length + fileArray.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`)
        return
      }

      // Validate file types and sizes
      const validFiles: File[] = []
      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image file`)
          continue
        }
        if (file.size > maxSize * 1024 * 1024) {
          setError(`${file.name} exceeds ${maxSize}MB limit`)
          continue
        }
        validFiles.push(file)
      }

      if (validFiles.length === 0) return

      setUploading(true)

      try {
        const formData = new FormData()
        validFiles.forEach((file) => {
          formData.append('files', file)
        })
        formData.append('category', category)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Upload failed')
        }

        const data = await response.json()

        if (data.urls) {
          onChange([...value, ...data.urls])
        }

        if (data.errors?.length > 0) {
          setError(`Some files failed: ${data.errors.join(', ')}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [value, onChange, maxFiles, maxSize, category]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (disabled || uploading) return

      const files = e.dataTransfer.files
      if (files?.length > 0) {
        handleFiles(files)
      }
    },
    [disabled, uploading, handleFiles]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFiles(files)
      }
      // Reset input value to allow re-uploading same file
      e.target.value = ''
    },
    [handleFiles]
  )

  const removeImage = useCallback(
    (index: number) => {
      const newUrls = [...value]
      newUrls.splice(index, 1)
      onChange(newUrls)
    },
    [value, onChange]
  )

  const reorderImages = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newUrls = [...value]
      const [removed] = newUrls.splice(fromIndex, 1)
      newUrls.splice(toIndex, 0, removed)
      onChange(newUrls)
    },
    [value, onChange]
  )

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          disabled={disabled || uploading}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
            <p className="text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-gray-600 mb-1">
              Drag and drop images here or click to upload
            </p>
            <p className="text-sm text-gray-500">
              {maxFiles - value.length} of {maxFiles} remaining (Max {maxSize}MB each)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-square rounded-lg overflow-hidden border bg-gray-100"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', index.toString())
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
                if (fromIndex !== index) {
                  reorderImages(fromIndex, index)
                }
              }}
            >
              <Image
                src={url}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />

              {/* Primary badge for first image */}
              {index === 0 && (
                <span className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                  Primary
                </span>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(index)
                }}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Drag hint */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm">Drag to reorder</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {value.length === 0 && !uploading && (
        <div className="mt-4 p-8 border rounded-lg bg-gray-50 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No images uploaded yet</p>
        </div>
      )}
    </div>
  )
}

// Single image upload for avatars
interface AvatarUploadProps {
  value?: string
  onChange: (url: string | null) => void
  disabled?: boolean
  size?: number
}

export function AvatarUpload({
  value,
  onChange,
  disabled = false,
  size = 120,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'avatars')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          relative rounded-full overflow-hidden border-2 border-dashed
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-500'}
        `}
        style={{ width: size, height: size }}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
          disabled={disabled || uploading}
          className="hidden"
        />

        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : value ? (
          <Image
            src={value}
            alt="Avatar"
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-xs text-gray-500 mt-1">Upload</span>
          </div>
        )}
      </div>

      {value && !uploading && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 text-red-600"
          onClick={() => onChange(null)}
          disabled={disabled}
        >
          Remove
        </Button>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
