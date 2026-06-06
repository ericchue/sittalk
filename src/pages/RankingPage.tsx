import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MobileLayout } from '@/components/MobileLayout'
import { BottomNav } from '@/components/BottomNav'
import { StoryCard } from '@/components/StoryCard'
import { useApp } from '@/context/AppContext'
import { EMOTIONS, EMOTION_COLORS } from '@/lib/types'
import type { Emotion } from '@/lib/types'

export default function RankingPage() {
  const { getPopularStories } = useApp()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Emotion | 'all'>('all')

  const allStories = getPopularStories()
  const filtered = filter === 'all'
    ? allStories
    : allStories.filter((s) => s.emotion === filter)

  return (
    <MobileLayout withNav>
      <div className="flex flex-col min-h-full p-6">
        <div className="mb-6 pt-2">
          <h1 className="text-2xl font-bold">랭킹</h1>
          <p className="text-sm text-muted-foreground">좋아요 순으로 정렬된 이야기들</p>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setFilter('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground'
            }`}
          >
            전체
          </button>
          {EMOTIONS.map(({ value, label, emoji }) => {
            const color = EMOTION_COLORS[value]
            const isActive = filter === value
            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={
                  isActive
                    ? { background: color, color: '#fff' }
                    : { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }
                }
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        {/* Stories */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-4xl mb-3">🏆</p>
              <p className="text-sm">아직 이야기가 없어요</p>
            </div>
          ) : (
            filtered.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="relative">
                  {i < 3 && (
                    <span className="absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full bg-yellow-400 text-background text-xs font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                  )}
                  <StoryCard
                    story={story}
                    onClick={() => navigate(`/story/${story.id}`)}
                    showLike
                  />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </MobileLayout>
  )
}
