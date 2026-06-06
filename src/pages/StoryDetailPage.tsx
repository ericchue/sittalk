import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, PenLine } from 'lucide-react'
import { MobileLayout } from '@/components/MobileLayout'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { EMOTION_COLORS, EMOTION_LABELS, EMOTION_EMOJIS } from '@/lib/types'

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { stories, likedStoryIds, toggleLike, isAuthenticated, user } = useApp()

  const story = stories.find((s) => s.id === id)
  if (!story) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">이야기를 찾을 수 없어요</p>
        </div>
      </MobileLayout>
    )
  }

  const isLiked = likedStoryIds.has(story.id)
  const isCompleted = story.status === 'completed'
  const color = EMOTION_COLORS[story.emotion]
  const entryCount = story.story_entries?.length ?? 0
  const lastEntry = story.story_entries?.[entryCount - 1]
  const isLastAuthor = lastEntry?.user_id === user?.id
  const canWrite = !isCompleted && isAuthenticated && !isLastAuthor

  return (
    <MobileLayout>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div
          className="p-6 pb-4"
          style={{ background: `linear-gradient(180deg, ${color}15 0%, transparent 100%)` }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">뒤로</span>
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span>{EMOTION_EMOJIS[story.emotion]}</span>
            <span className="text-sm font-medium" style={{ color }}>
              {EMOTION_LABELS[story.emotion]}
            </span>
            {isCompleted && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 font-medium">
                완성된 이야기
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{story.location_name}</p>

          {/* Progress */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(entryCount / 5) * 100}%`, background: color }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{entryCount}/5</span>
          </div>
        </div>

        {/* Entries */}
        <div className="flex-1 p-6 pt-2 space-y-4">
          {story.story_entries?.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-3"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1"
                style={{ background: `${color}25`, color }}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">{entry.nickname}</p>
                <p className="text-sm text-foreground leading-relaxed">{entry.content}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex flex-col gap-3">
          <button
            onClick={() => isAuthenticated && toggleLike(story.id)}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${
              isLiked ? 'border-red-400/40 text-red-400' : 'border-border text-muted-foreground'
            }`}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            <span className="text-sm">{story.like_count}</span>
          </button>

          {canWrite && (
            <Button
              onClick={() => navigate(`/write/${story.id}`)}
              style={{ background: color }}
            >
              <PenLine size={16} className="mr-2" />
              이어 쓰기
            </Button>
          )}

          {isLastAuthor && !isCompleted && (
            <p className="text-xs text-center text-muted-foreground">
              다른 사람이 이어 쓴 후에 다시 참여할 수 있어요
            </p>
          )}
          {isCompleted && (
            <p className="text-xs text-center text-yellow-400">완성된 이야기예요 ✨</p>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
