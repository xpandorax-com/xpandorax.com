'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

export default function VideoPlayer({ src, poster, title }) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showPlaybackMenu, setShowPlaybackMenu] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    setShowControls(true)
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }, [isPlaying])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
      resetControlsTimeout()
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration
    }
    resetControlsTimeout()
  }

  // Touch-friendly seek with drag support
  const handleTouchSeek = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration
    }
    resetControlsTimeout()
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
    resetControlsTimeout()
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    resetControlsTimeout()
  }

  const handlePlaybackRateChange = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
    }
    setShowPlaybackMenu(false)
    resetControlsTimeout()
  }

  // Skip forward/backward (10 seconds)
  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
    }
    resetControlsTimeout()
  }

  // Double-tap to seek (mobile)
  const [lastTap, setLastTap] = useState({ time: 0, x: 0 })
  const handleDoubleTap = (e) => {
    const now = Date.now()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX || e.touches?.[0]?.clientX || rect.width / 2
    
    if (now - lastTap.time < 300) {
      // Double tap detected
      const isRightSide = x > rect.width / 2
      skip(isRightSide ? 10 : -10)
    }
    setLastTap({ time: now, x })
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // If no src provided, show placeholder
  if (!src) {
    return (
      <div className="video-player-container flex items-center justify-center bg-gray-900">
        <div className="text-center p-8">
          <div className="text-5xl sm:text-6xl mb-4">🎬</div>
          <p className="text-gray-400 text-sm sm:text-base">Video not available</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="video-player-container relative group bg-black"
      onMouseMove={resetControlsTimeout}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={resetControlsTimeout}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain bg-black"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onClick={isMobile ? handleDoubleTap : togglePlay}
        onTouchEnd={handleDoubleTap}
        playsInline
        webkit-playsinline="true"
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Play/Pause Overlay (shows when paused) */}
      {!isPlaying && !isBuffering && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
          aria-label="Play video"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/90 flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all active:scale-95">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      {/* Double-tap hint for mobile */}
      {isMobile && showControls && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-xs bg-black/50 px-3 py-1 rounded-full pointer-events-none">
          Double-tap to skip ±10s
        </div>
      )}

      {/* Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-8 sm:pt-12">
          {/* Progress Bar - Touch friendly */}
          <div 
            className="h-1.5 sm:h-1 bg-gray-600/80 rounded-full mb-3 sm:mb-4 cursor-pointer group/progress relative"
            onClick={handleSeek}
            onTouchMove={handleTouchSeek}
            onTouchStart={handleTouchSeek}
          >
            {/* Buffered indicator could go here */}
            <div 
              className="h-full bg-red-600 rounded-full relative transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-3 sm:h-3 bg-red-500 rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 sm:group-hover/progress:opacity-100 transition-opacity" 
                   style={{ opacity: isMobile ? 1 : undefined }} />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Skip Back (Mobile) */}
              {isMobile && (
                <button 
                  onClick={() => skip(-10)} 
                  className="text-white hover:text-red-400 transition-colors p-2 touch-target"
                  aria-label="Skip back 10 seconds"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.5 3C17.15 3 21.08 6.03 22.47 10.22L20.1 11c-1.06-3.31-4.19-5.72-7.87-5.72-1.84 0-3.53.61-4.9 1.63L10 9.5H3V2.5l2.93 2.93C7.67 3.89 9.97 3 12.5 3zM3 12c0 4.97 4.03 9 9 9 3.73 0 6.92-2.28 8.28-5.5l-2.35-.78C16.92 17.1 14.67 19 12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7c1.19 0 2.31.3 3.29.83L12.5 8.5l7.5-1-1 7.5-2.83-2.83C14.64 13.9 12.88 15 11 15c-2.48 0-4.5-2.02-4.5-4.5S8.52 6 11 6c.97 0 1.86.31 2.6.83L12.5 8.5l7.5-1" />
                  </svg>
                </button>
              )}

              {/* Play/Pause */}
              <button 
                onClick={togglePlay} 
                className="text-white hover:text-red-400 transition-colors p-2 touch-target"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Skip Forward (Mobile) */}
              {isMobile && (
                <button 
                  onClick={() => skip(10)} 
                  className="text-white hover:text-red-400 transition-colors p-2 touch-target"
                  aria-label="Skip forward 10 seconds"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.5 3C6.85 3 2.92 6.03 1.53 10.22L3.9 11c1.06-3.31 4.19-5.72 7.87-5.72 1.84 0 3.53.61 4.9 1.63L14 9.5h7V2.5l-2.93 2.93C16.33 3.89 14.03 3 11.5 3zM21 12c0 4.97-4.03 9-9 9-3.73 0-6.92-2.28-8.28-5.5l2.35-.78C7.08 17.1 9.33 19 12 19c3.87 0 7-3.13 7-7s-3.13-7-7-7c-1.19 0-2.31.3-3.29.83L11.5 8.5 4 7.5l1 7.5 2.83-2.83C9.36 13.9 11.12 15 13 15c2.48 0 4.5-2.02 4.5-4.5S15.48 6 13 6c-.97 0-1.86.31-2.6.83L11.5 8.5 4 7.5" />
                  </svg>
                </button>
              )}

              {/* Volume - Hidden on mobile, shown on desktop */}
              <div className="hidden sm:flex items-center gap-2">
                <button 
                  onClick={toggleMute} 
                  className="text-white hover:text-red-400 transition-colors p-1"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 lg:w-20 accent-red-600"
                  aria-label="Volume"
                />
              </div>

              {/* Time */}
              <span className="text-white text-xs sm:text-sm ml-1 whitespace-nowrap">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Playback Speed */}
              <div className="relative hidden sm:block">
                <button 
                  onClick={() => setShowPlaybackMenu(!showPlaybackMenu)}
                  className="text-white hover:text-red-400 transition-colors px-2 py-1 text-xs sm:text-sm"
                  aria-label="Playback speed"
                >
                  {playbackRate}x
                </button>
                {showPlaybackMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-xl overflow-hidden">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handlePlaybackRateChange(rate)}
                        className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-800 ${
                          playbackRate === rate ? 'text-red-500' : 'text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button 
                onClick={toggleFullscreen} 
                className="text-white hover:text-red-400 transition-colors p-2 touch-target"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
