import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { EMOTION_COLORS, EMOTION_LABELS, EMOTION_EMOJIS } from '@/lib/types'
import type { StoryWithEntries } from '@/lib/types'
import { useApp } from '@/context/AppContext'

interface StoryCardProps {
  story: StoryWithEntries
  onClick?: () => void
  showLike?: boolean
}

export function StoryCard({ story, onClick, showLike = false }: StoryCardProps) {
  const { likedStoryIds, toggleLike, isAuthenticated } = useApp()
  const isLiked = likedStoryIds.has(story.id)
  const isCompleted = story.status === 'completed'
  const entryCount = story.story_entries?.length ?? 0
  const color = EMOTION_COLORS[story.emotion]
  const preview = story.story_entries?.[0]?.content ?? '이야기를 시작해보세요...'

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) return
    await toggleLike(story.id)
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative rounded-2xl p-4 cursor-pointer glass overflow-hidden transition-all group',
        isCompleted ? 'border-yellow-400/30' : ''
      )}
      style={{ borderColor: isCompleted ? undefined : `${color}20` }}
    >
      {/* Top color bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />

      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at top left, ${color}08, transparent 60%)` }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
              style={{ background: `${color}20` }}
            >
              {EMOTION_EMOJIS[story.emotion]}
            </div>
            <span className="text-xs font-medium" style={{ color }}>
              {EMOTION_LABELS[story.emotion]}
            </span>
            {isCompleted && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 font-medium">
                완성 ✨
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {entryCount}<span className="opacity-40">/5</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 rounded-full bg-border mb-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(entryCount / 5) * 100}%`, background: color }}
          />
        </div>

        {/* Preview */}
        <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
          {preview}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-muted-foreground/60 truncate flex-1">{story.location_name}</span>
          {showLike && (
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1 text-xs transition-all ml-2',
                isLiked ? 'text-red-400 scale-110' : 'text-muted-foreground hover:text-red-400'
              )}
            >
              <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{story.like_count}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
