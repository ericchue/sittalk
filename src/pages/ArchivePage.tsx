import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MobileLayout } from '@/components/MobileLayout'
import { BottomNav } from '@/components/BottomNav'
import { StoryCard } from '@/components/StoryCard'
import { useApp } from '@/context/AppContext'

export default function ArchivePage() {
  const { getCompletedStories } = useApp()
  const navigate = useNavigate()
  const stories = getCompletedStories()

  return (
    <MobileLayout withNav>
      <div className="flex flex-col min-h-full p-6">
        <div className="mb-6 pt-2">
          <h1 className="text-2xl font-bold">아카이브</h1>
          <p className="text-sm text-muted-foreground">완성된 이야기들이 모이는 곳</p>
        </div>

        <div className="flex flex-col gap-3">
          {stories.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-5xl mb-4">📚</p>
              <p className="font-medium mb-1">아직 완성된 이야기가 없어요</p>
              <p className="text-sm">5개의 문장이 모이면 이야기가 완성돼요!</p>
            </div>
          ) : (
            stories.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <StoryCard
                  story={story}
                  onClick={() => navigate(`/story/${story.id}`)}
                  showLike
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </MobileLayout>
  )
}
