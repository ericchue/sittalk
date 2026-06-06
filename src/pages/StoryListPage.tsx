import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Loader2, RefreshCw, Sparkles, ChevronRight, Users, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { MobileLayout } from '@/components/MobileLayout'
import { StoryCard } from '@/components/StoryCard'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { EMOTION_LABELS, EMOTION_EMOJIS, EMOTION_COLORS } from '@/lib/types'

export default function StoryListPage() {
  const { selectedLocation, selectedEmotion, getStoriesByEmotionAndLocation, createStory, refreshStories, user } = useApp()
  const navigate = useNavigate()

  const [showAICard, setShowAICard] = useState(false)
  const [aiSentence, setAiSentence] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [onlineCount, setOnlineCount] = useState(1)

  // Realtime Presence — track concurrent users in same space+emotion
  useEffect(() => {
    if (!selectedEmotion || !user) return
    const channelKey = `presence:${selectedLocation}:${selectedEmotion}`
    const channel = supabase.channel(channelKey, { config: { presence: { key: user.id } } })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, joined_at: new Date().toISOString() })
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [selectedLocation, selectedEmotion, user])

  if (!selectedEmotion) {
    navigate('/emotions')
    return null
  }

  const stories = getStoriesByEmotionAndLocation(selectedEmotion, selectedLocation)
  const color = EMOTION_COLORS[selectedEmotion]

  const fetchAISentence = useCallback(async () => {
    setAiLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-story-starter', {
        body: { emotion: selectedEmotion, location: selectedLocation },
      })
      if (!error && data?.sentence) {
        setAiSentence(data.sentence)
      } else {
        // Fallback sentences by emotion
        const fallbacks: Record<string, string[]> = {
          happy: [
            '오늘따라 하늘이 유독 맑아서, 그냥 멈춰서 올려다봤다.',
            '이유 없이 발걸음이 가벼운 날이 있다. 오늘이 그런 날이었다.',
            '작은 것 하나가 온종일 마음을 따뜻하게 해줄 수 있다는 걸 알았다.',
          ],
          sad: [
            '창밖의 빗소리가 꼭 누군가의 발소리 같아서 자꾸 돌아보게 됐다.',
            '아무것도 하고 싶지 않은 날, 그냥 여기 앉아 있기로 했다.',
            '괜찮다고 말했지만, 사실 그 말을 내뱉는 순간이 제일 힘들었다.',
          ],
          tired: [
            '커피 한 잔도 지금 이 피로를 이기기엔 역부족인 것 같다.',
            '눈꺼풀이 무거워지는 속도보다 시계바늘이 더 느리게 간다.',
            '몸이 먼저 솔직해진다. 마음보다 항상 빠르게.',
          ],
          stressed: [
            '숨을 크게 한 번 들이켰다. 그래도 아직 숨통은 막히지 않았다.',
            '머릿속이 탁해진 날엔 가만히 앉아서 아무 생각도 하지 않으려 했다.',
            '손이 조금 떨렸다. 아무도 눈치채지 못했으면 했다.',
          ],
          hopeful: [
            '오늘 이 순간이, 언젠가 그리워할 날이 오겠지.',
            '뭔가 좋은 일이 생길 것 같은 기분이 드는 날이 있다.',
            '작은 시작이라도 괜찮다. 그것만으로도 이미 충분하다.',
          ],
        }
        const options = fallbacks[selectedEmotion] ?? fallbacks.happy
        setAiSentence(options[Math.floor(Math.random() * options.length)])
      }
    } catch {
      const options = [
        '오늘 이 공간에서, 우리의 이야기가 시작된다.',
        '같은 감정을 가진 누군가가 이 문장을 이어받을 것이다.',
      ]
      setAiSentence(options[Math.floor(Math.random() * options.length)])
    } finally {
      setAiLoading(false)
    }
  }, [selectedEmotion, selectedLocation])

  const handleOpenAICard = async () => {
    setShowAICard(true)
    await fetchAISentence()
  }

  const handleStartStory = async () => {
    if (!aiSentence) return
    setCreating(true)
    try {
      const storyId = await createStory(selectedLocation, selectedEmotion, aiSentence)
      await refreshStories()
      navigate(`/write/${storyId}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다'
      toast.error(message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <MobileLayout>
      <div className="relative flex flex-col min-h-screen overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: color }} />

        <div className="relative z-10 flex flex-col flex-1 p-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">뒤로</span>
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ background: `${color}20`, color }}
              >
                <span>{EMOTION_EMOJIS[selectedEmotion]}</span>
                <span>{EMOTION_LABELS[selectedEmotion]}</span>
              </div>
              {/* Concurrent users badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full glass text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <Users size={11} />
                <span>{onlineCount}명 함께</span>
              </div>
            </div>
            <h2 className="text-xl font-bold">{selectedLocation}</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">
                진행 중 <span style={{ color }}>{stories.length}</span>개
              </p>
              <span className="text-muted-foreground/30">·</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays size={10} />
                <span>{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 이야기</span>
              </div>
            </div>
          </div>

          {/* AI Sentence Card */}
          <AnimatePresence>
            {showAICard && (
              <motion.div
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.96 }}
                className="glass rounded-2xl p-5 mb-5"
                style={{ borderColor: `${color}30` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} style={{ color }} />
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color }}>
                    AI 첫 문장 제안
                  </span>
                </div>

                {aiLoading ? (
                  <div className="flex items-center gap-3 py-3">
                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">문장을 생성하는 중...</span>
                  </div>
                ) : (
                  <motion.p
                    key={aiSentence}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-foreground leading-relaxed mb-4"
                  >
                    "{aiSentence}"
                  </motion.p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={fetchAISentence}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground glass transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={aiLoading ? 'animate-spin' : ''} />
                    다른 문장
                  </button>
                  <Button
                    onClick={handleStartStory}
                    disabled={creating || aiLoading || !aiSentence}
                    className="flex-1 text-sm"
                    style={{ background: color }}
                  >
                    {creating ? <Loader2 size={14} className="mr-2 animate-spin" /> : <ChevronRight size={14} className="mr-1" />}
                    이 문장으로 시작
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stories */}
          <div className="flex flex-col gap-3 flex-1 mb-6">
            {stories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-3">✏️</p>
                <p className="text-sm">아직 이야기가 없어요<br />첫 번째 이야기를 시작해보세요!</p>
              </div>
            ) : (
              stories.map((story, i) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <StoryCard story={story} onClick={() => navigate(`/story/${story.id}`)} />
                </motion.div>
              ))
            )}
          </div>

          {/* New Story Button */}
          {!showAICard && (
            <Button
              onClick={handleOpenAICard}
              className="w-full"
              style={{ background: color }}
            >
              <Plus size={16} className="mr-2" />
              새 이야기 시작
            </Button>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
