import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, ChevronRight, QrCode, Sparkles, CalendarDays } from 'lucide-react'
import { MobileLayout } from '@/components/MobileLayout'
import { BottomNav } from '@/components/BottomNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/context/AppContext'
import { EMOTIONS, EMOTION_COLORS } from '@/lib/types'

export default function HomePage() {
  const { selectedLocation, selectLocation, profile } = useApp()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [locationInput, setLocationInput] = useState(selectedLocation)

  const handleLocationSave = () => {
    if (locationInput.trim()) selectLocation(locationInput.trim())
    setEditing(false)
  }

  return (
    <MobileLayout withNav>
      <div className="relative flex flex-col min-h-full overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'hsl(262 80% 68%)' }} />
        <div className="absolute bottom-40 left-0 w-48 h-48 rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ background: 'hsl(220 80% 60%)' }} />

        <div className="relative z-10 flex flex-col flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pt-2">
            <div>
              <h1 className="text-3xl font-black gradient-text">SITTALK</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground">
                  안녕하세요, <span className="text-foreground/80 font-medium">{profile?.nickname ?? '익명'}</span>님
                </p>
                <span className="text-muted-foreground/30">·</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays size={10} />
                  <span>{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/qr-generator')}
              className="p-2.5 rounded-xl glass border border-border text-muted-foreground hover:text-primary transition-colors"
            >
              <QrCode size={18} />
            </button>
          </div>

          {/* Location Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5 mb-5"
          >
            <div className="flex items-center gap-2 text-primary mb-3">
              <MapPin size={14} />
              <span className="text-xs font-medium uppercase tracking-wider">현재 공간</span>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <Input
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLocationSave()}
                  autoFocus className="flex-1"
                />
                <Button size="sm" onClick={handleLocationSave}>확인</Button>
              </div>
            ) : (
              <button
                onClick={() => { setLocationInput(selectedLocation); setEditing(true) }}
                className="w-full flex items-center justify-between group"
              >
                <span className="text-lg font-bold text-foreground text-left leading-tight">
                  {selectedLocation}
                </span>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
              </button>
            )}
          </motion.div>

          {/* Emotion quick-select */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="glass rounded-2xl p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-primary">지금 감정</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {EMOTIONS.map(({ value, emoji, label }) => {
                const color = EMOTION_COLORS[value]
                return (
                  <button
                    key={value}
                    onClick={() => { navigate('/emotions') }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                    style={{ background: `${color}15` }}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 text-center"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              같은 공간, 같은 감정을 가진 사람들과<br />한 문장씩 이야기를 완성해보세요
            </p>
            <Button
              className="w-full max-w-xs glow"
              size="lg"
              onClick={() => navigate('/emotions')}
            >
              <Sparkles size={16} className="mr-2" />
              감정 선택하고 시작하기
            </Button>
          </motion.div>
        </div>
      </div>
      <BottomNav />
    </MobileLayout>
  )
}
