import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock } from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { MobileLayout } from '@/components/MobileLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useApp } from '@/context/AppContext'
import { EMOTION_COLORS, EMOTION_LABELS, EMOTION_EMOJIS } from '@/lib/types'

const MAX_CHARS = 300
const TIMER_SECONDS = 300 // 5분

function useCountdown(seconds: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          onExpire()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [onExpire])

  return remaining
}

function TimerRing({ remaining, total }: { remaining: number; total: number }) {
  const progress = remaining / total
  const r = 22
  const circ = 2 * Math.PI * r
  const strokeDash = circ * progress
  const isUrgent = remaining <= 60
  const isCritical = remaining <= 30

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={r} fill="none" stroke="hsl(228 18% 18%)" strokeWidth="3" />
          <circle
            cx="28" cy="28" r={r} fill="none"
            stroke={isCritical ? 'hsl(0 72% 60%)' : isUrgent ? 'hsl(45 95% 60%)' : 'hsl(262 80% 68%)'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circ}`}
            style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-mono font-bold ${isCritical ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-foreground'}`}>
            {mm}:{ss}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Clock size={10} className="text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">남은 시간</span>
      </div>
    </div>
  )
}

export default function WritePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { stories, addEntry, refreshStories } = useApp()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expired, setExpired] = useState(false)

  const story = stories.find((s) => s.id === id)

  useEffect(() => {
    if (!story) navigate('/home')
  }, [story, navigate])

  const handleExpire = () => {
    setExpired(true)
    toast.error('시간이 초과되었습니다. 다음 기회에 이어주세요!', { duration: 4000 })
    setTimeout(() => navigate(`/story/${id}`), 2000)
  }

  const remaining = useCountdown(TIMER_SECONDS, handleExpire)

  if (!story) return null

  const entryCount = story.story_entries?.length ?? 0
  const orderIndex = entryCount + 1
  const isLast = orderIndex === 5
  const color = EMOTION_COLORS[story.emotion]
  const charsLeft = MAX_CHARS - content.length

  const handleSubmit = async () => {
    if (!content.trim()) { toast.error('문장을 입력해주세요'); return }
    setSubmitting(true)
    try {
      await addEntry(story.id, content.trim())
      await refreshStories()
      if (isLast) {
        confetti({
          particleCount: 120, spread: 80, origin: { y: 0.6 },
          colors: ['#a855f7', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'],
        })
      }
      navigate(`/result/${story.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MobileLayout>
      <div className="relative flex flex-col min-h-screen overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: color }} />

        <div className="relative z-10 flex flex-col flex-1 p-6">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">뒤로</span>
            </button>
            <TimerRing remaining={remaining} total={TIMER_SECONDS} />
          </div>

          {/* Story header */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span>{EMOTION_EMOJIS[story.emotion]}</span>
              <span className="text-sm font-medium" style={{ color }}>
                {EMOTION_LABELS[story.emotion]}
              </span>
              {isLast && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${color}25`, color }}>
                  마지막 문장 ✨
                </span>
              )}
            </div>
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex-1 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      background: i <= entryCount
                        ? color
                        : i === orderIndex
                        ? `${color}50`
                        : 'hsl(228 18% 18%)',
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-mono">{orderIndex}/5</span>
            </div>
          </div>

          {/* Previous entries */}
          <div className="flex-1 mb-5">
            {entryCount > 0 && (
              <div className="glass rounded-2xl p-4 mb-4 space-y-3"
                style={{ borderColor: `${color}20` }}>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">앞선 이야기</p>
                {story.story_entries.map((entry, i) => (
                  <div key={entry.id} className="flex gap-2.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={{ background: `${color}25`, color }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-0.5">{entry.nickname}</p>
                      <p className="text-sm text-foreground leading-relaxed">{entry.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Write area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{orderIndex}번째 문장</p>
                <span className={`text-xs font-mono ${charsLeft < 30 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {charsLeft}
                </span>
              </div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Textarea
                  placeholder="한 문장으로 이야기를 이어가보세요..."
                  value={content}
                  onChange={(e) => { if (e.target.value.length <= MAX_CHARS) setContent(e.target.value) }}
                  className="min-h-[140px]"
                  autoFocus
                  disabled={expired}
                  style={{ borderColor: `${color}30` }}
                />
              </motion.div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || !content.trim() || expired}
            className="w-full glow"
            style={{ background: color }}
            size="lg"
          >
            {submitting ? '제출 중...' : isLast ? '✨ 이야기 완성하기' : '문장 제출'}
          </Button>
        </div>
      </div>
    </MobileLayout>
  )
}
