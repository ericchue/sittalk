import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { MobileLayout } from '@/components/MobileLayout'
import { useApp } from '@/context/AppContext'
import { EMOTIONS, EMOTION_COLORS } from '@/lib/types'
import type { Emotion } from '@/lib/types'

const EMOTION_DESC: Record<Emotion, string> = {
  happy: '오늘 좋은 일이 있었나요?',
  sad: '마음이 조금 무거운 날이네요',
  tired: '충분히 쉬어가야 할 때',
  stressed: '많이 힘드셨겠어요',
  hopeful: '빛나는 내일을 기다리며',
}

export default function EmotionPage() {
  const { selectEmotion, selectedLocation } = useApp()
  const navigate = useNavigate()

  const handleSelect = (emotion: Emotion) => {
    selectEmotion(emotion)
    navigate('/story-list')
  }

  return (
    <MobileLayout>
      <div className="relative flex flex-col min-h-screen overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'hsl(262 80% 68%)' }} />

        <div className="relative z-10 flex flex-col flex-1 p-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">뒤로</span>
          </button>

          <div className="mb-8">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{selectedLocation}</p>
            <h2 className="text-2xl font-bold">지금 어떤<br /><span className="gradient-text">감정</span>인가요?</h2>
          </div>

          <div className="flex flex-col gap-3">
            {EMOTIONS.map(({ value, label, emoji }, i) => {
              const color = EMOTION_COLORS[value]
              return (
                <motion.button
                  key={value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(value)}
                  className="relative flex items-center gap-4 p-5 rounded-2xl glass overflow-hidden text-left transition-all hover:border-opacity-60 group"
                  style={{ borderColor: `${color}30` }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                    style={{ background: `radial-gradient(circle at left center, ${color}10, transparent 70%)` }}
                  />

                  <div
                    className="relative w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: `${color}20` }}
                  >
                    {emoji}
                  </div>

                  <div className="relative flex-1">
                    <p className="font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{EMOTION_DESC[value]}</p>
                  </div>

                  <div
                    className="relative w-1.5 h-8 rounded-full flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ background: color }}
                  />
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
