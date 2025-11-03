import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, Check, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  bucket?: string
  folder?: string
  label?: string
  accept?: string
  maxSizeMB?: number
}

const ImageUpload = ({
  value,
  onChange,
  bucket = 'maps',
  folder = 'images',
  label = 'Upload Image',
  accept = 'image/*',
  maxSizeMB = 10,
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`)
      return
    }

    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        // Provide helpful error messages
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('does not exist')) {
          throw new Error(`Storage bucket "${bucket}" not found. Please create it in Supabase Storage first. See STORAGE_SETUP.md for instructions.`)
        }
        if (uploadError.message?.includes('new row violates row-level security')) {
          throw new Error(`Upload permission denied. Please check storage bucket policies in Supabase. See STORAGE_SETUP.md for instructions.`)
        }
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      if (urlData?.publicUrl) {
        setUploadProgress(100)
        onChange(urlData.publicUrl)
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 500)
      } else {
        throw new Error('Failed to get public URL')
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload image')
      setIsUploading(false)
      setUploadProgress(0)
      setPreview(null)
    }
  }, [bucket, folder, maxSizeMB, onChange])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleRemove = useCallback(() => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onChange])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-navy-700">
          {label}
        </label>
      )}

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
          ${isDragging 
            ? 'border-accent-500 bg-accent-50' 
            : preview 
            ? 'border-primary-200 hover:border-primary-300' 
            : 'border-primary-300 hover:border-primary-400 bg-primary-50'
          }
          ${isUploading ? 'pointer-events-none opacity-75' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-12 h-12 text-accent-600 animate-spin mb-4" />
            <p className="text-sm font-medium text-navy-700">Uploading...</p>
            {uploadProgress > 0 && (
              <div className="w-full max-w-xs mt-4">
                <div className="bg-primary-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-accent-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto max-h-96 object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-map.png'
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-3 py-2 rounded">
              Click to change image
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-sm font-medium text-navy-700 mb-1">
              Drag and drop an image here, or click to select
            </p>
            <p className="text-xs text-navy-500">
              Supports: JPG, PNG, WEBP (max {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 mb-1">Upload Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          {error.includes('Bucket not found') && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Quick Setup:</strong>
              </p>
              <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                <li>Go to Supabase Dashboard → Storage</li>
                <li>Click "New bucket"</li>
                <li>Name it: <code className="bg-blue-100 px-1 rounded">maps</code></li>
                <li>Toggle "Public bucket" ON</li>
                <li>Click "Create bucket"</li>
                <li>Refresh this page and try again</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* URL Display (if using URL instead of upload) */}
      {value && !preview && value.startsWith('http') && (
        <div className="flex items-center gap-2 p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <ImageIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />
          <p className="text-sm text-navy-700 flex-1 truncate">{value}</p>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 text-red-600 hover:text-red-700"
            aria-label="Clear URL"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default ImageUpload

