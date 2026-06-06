import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MobileLayout } from '@/components/MobileLayout'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { EMOTION_COLORS, EMOTION_LABELS, EMOTION_EMOJIS } from '@/lib/types'

export default function ResultPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { stories } = useApp()
  const story = stories.find((s) => s.id === id)

  if (!story) {
    navigate('/home')
    return null
  }

  const isCompleted = story.status === 'completed'
  const color = EMOTION_COLORS[story.emotion]
  const entryCount = story.story_entries?.length ?? 0

  return (
    <MobileLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="space-y-6 w-full max-w-sm"
        >
          <div className="text-7xl">{isCompleted ? '🎉' : '✍️'}</div>

          <div>
            <h2 className="text-2xl font-bold mb-2">
              {isCompleted ? '이야기가 완성되었어요!' : '문장이 추가되었어요!'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isCompleted
                ? '5개의 문장이 모여 하나의 이야기가 완성되었습니다'
                : `${entryCount}/5 — 아직 ${5 - entryCount}개의 문장이 남았어요`}
            </p>
          </div>

          {/* Emotion badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mx-auto"
            style={{ background: `${color}20`, color }}
          >
            <span>{EMOTION_EMOJIS[story.emotion]}</span>
            <span>{EMOTION_LABELS[story.emotion]}</span>
          </div>

          {/* Story preview */}
          <div className="rounded-2xl bg-card border border-border p-4 text-left space-y-3">
            {story.story_entries?.map((entry, i) => (
              <div key={entry.id} className="flex gap-2">
                <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color }}>{i + 1}</span>
                <p className="text-sm text-foreground leading-relaxed">{entry.content}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {isCompleted ? (
              <Button onClick={() => navigate('/archive')} className="w-full" style={{ background: color }}>
                아카이브에서 보기
              </Button>
            ) : (
              <Button onClick={() => navigate(`/story/${story.id}`)} className="w-full" style={{ background: color }}>
                이야기 보기
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/home')} className="w-full">
              홈으로
            </Button>
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  )
}
