import { Image, Upload, X } from 'lucide-react'
import { useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { FieldFrame, FieldMessageButton } from './Field'
import { IconButton } from './IconButton'

export interface LocalMediaFile {
  id: string
  file: File
}

interface MediaPickerProps {
  label: string
  optional?: boolean
  accept?: string
  maxFiles?: number
  maxSizeMb?: number
  onChange?: (files: readonly File[]) => void
}

const fileId = (file: File) => `${file.name}-${file.size}-${file.lastModified}`

export function MediaPicker({
  accept = 'image/jpeg,image/png,image/webp',
  label,
  maxFiles = 4,
  maxSizeMb = 8,
  onChange,
  optional
}: MediaPickerProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<LocalMediaFile[]>([])
  const [error, setError] = useState<string>()

  const updateFiles = (incoming: readonly File[]) => {
    const oversized = incoming.find((file) => file.size > maxSizeMb * 1024 * 1024)
    if (oversized) {
      setError(`${oversized.name} is larger than ${maxSizeMb} MB.`)
      return
    }
    const merged = [...files, ...incoming.map((file) => ({ id: fileId(file), file }))]
      .filter(
        (item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index
      )
      .slice(0, maxFiles)
    setFiles(merged)
    setError(
      incoming.length + files.length > maxFiles ? `Choose up to ${maxFiles} images.` : undefined
    )
    onChange?.(merged.map((item) => item.file))
  }

  const remove = (targetId: string) => {
    const next = files.filter((item) => item.id !== targetId)
    setFiles(next)
    setError(undefined)
    onChange?.(next.map((item) => item.file))
  }

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    updateFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    updateFiles(Array.from(event.dataTransfer.files))
  }

  return (
    <FieldFrame inputId={id} label={label} optional={optional}>
      <div
        className={`media-picker ${error ? 'border-rose-400 dark:border-rose-800' : ''}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          className="sr-only"
          onChange={handleInput}
        />
        <button
          type="button"
          className="media-picker-trigger"
          onClick={() => inputRef.current?.click()}
        >
          <span className="grid size-11 place-items-center rounded-[var(--radius-control)] border border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <Upload className="size-5" aria-hidden="true" />
          </span>
          <span className="text-left">
            <span className="block text-sm font-semibold">Choose images</span>
            <span className="block text-xs text-slate-500">
              JPEG, PNG or WebP · {maxSizeMb} MB each · {maxFiles} maximum
            </span>
          </span>
        </button>
        {error ? (
          <div className="absolute right-3 top-3">
            <FieldMessageButton
              id={`${id}-message`}
              label={label}
              message={{ tone: 'error', message: error }}
            />
          </div>
        ) : null}
      </div>
      {files.length ? (
        <ul className="grid gap-2" aria-label={`${label} selected locally`}>
          {files.map((item) => (
            <li key={item.id} className="media-picker-file">
              <Image className="size-4 shrink-0 text-blue-600" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                {item.file.name}
              </span>
              <span className="text-[10px] text-slate-500">Selected locally</span>
              <IconButton
                label={`Remove ${item.file.name}`}
                icon={<X className="size-4" aria-hidden="true" />}
                onClick={() => remove(item.id)}
                size="sm"
                variant="quiet"
              />
            </li>
          ))}
        </ul>
      ) : null}
    </FieldFrame>
  )
}
