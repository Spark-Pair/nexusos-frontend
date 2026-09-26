import { Pause, Play } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'

export function VoiceNotePlayer({ src, className = '' }: { src: string; className?: string }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const elapsed = duration ? currentTime / duration : 0
  const timeLabel = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '0:00'
    const value = Math.floor(seconds)
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`
  }
  const togglePlayback = () => {
    if (!audio.current) return
    if (audio.current.paused) void audio.current.play().catch(() => setPlaying(false))
    else audio.current.pause()
  }
  const seek = (event: ChangeEvent<HTMLInputElement>) => {
    if (!audio.current || !duration) return
    audio.current.currentTime = Number(event.target.value)
    setCurrentTime(audio.current.currentTime)
  }

  return (
    <div className={`voice-note-player ${className}`}>
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        className="sr-only"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        className="voice-note-play"
        aria-label={playing ? 'Pause voice message' : 'Play voice message'}
        onClick={togglePlayback}
      >
        {playing ? (
          <Pause className="size-4" fill="currentColor" />
        ) : (
          <Play className="size-4" fill="currentColor" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="voice-note-track">
          <div className="voice-note-waveform" aria-hidden="true">
            {Array.from({ length: 30 }, (_, index) => (
              <i
                key={index}
                data-played={duration > 0 && index / 30 <= elapsed ? 'true' : undefined}
                style={{ height: 5 + ((index * 13 + index * index * 3) % 19) }}
              />
            ))}
          </div>
          <input
            className="voice-note-seek"
            type="range"
            aria-label="Voice message position"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            disabled={!duration}
            onChange={seek}
          />
        </div>
        <span className="voice-note-time" aria-live="off">
          {timeLabel(currentTime)} / {timeLabel(duration)}
        </span>
      </div>
    </div>
  )
}
