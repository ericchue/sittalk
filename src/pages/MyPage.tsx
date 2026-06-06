import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { MobileLayout } from '@/components/MobileLayout'
import { BottomNav } from '@/components/BottomNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/context/AppContext'

export default function MyPage() {
  const { profile, logout, setNickname, getUserStories, getCompletedStories, stories, user } = useApp()
  const navigate = useNavigate()
  const [editingNick, setEditingNick] = useState(false)
  const [nickInput, setNickInput] = useState(profile?.nickname ?? '')

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleSaveNick = async () => {
    if (!nickInput.trim()) return
    try {
      await setNickname(nickInput.trim())
      toast.success('닉네임이 변경되었습니다')
      setEditingNick(false)
    } catch {
      toast.error('닉네임 변경에 실패했습니다')
    }
  }

  const userStories = getUserStories()
  const completedContributions = userStories.filter((s) => s.status === 'completed').length
  const totalLikesReceived = stories
    .filter((s) => s.story_entries?.some((e) => e.user_id === user?.id))
    .reduce((sum, s) => sum + s.like_count, 0)

  const stats = [
    { label: '총 작성 문장', value: stories.flatMap((s) => s.story_entries ?? []).filter((e) => e.user_id === user?.id).length },
    { label: '완성 기여', value: completedContributions },
    { label: '받은 좋아요', value: totalLikesReceived },
  ]

  return (
    <MobileLayout withNav>
      <div className="flex flex-col min-h-full p-6">
        <div className="mb-8 pt-2">
          <h1 className="text-2xl font-bold">마이페이지</h1>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border p-5 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-black text-primary">
              {profile?.nickname?.[0] ?? '?'}
            </div>
            <div className="flex-1">
              {editingNick ? (
                <div className="flex gap-2">
                  <Input
                    value={nickInput}
                    onChange={(e) => setNickInput(e.target.value)}
                    className="h-9 text-sm"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNick() }}
                  />
                  <button onClick={handleSaveNick} className="text-primary"><Check size={18} /></button>
                  <button onClick={() => setEditingNick(false)} className="text-muted-foreground"><X size={18} /></button>
                </div>
              ) : (
                <button
                  onClick={() => { setNickInput(profile?.nickname ?? ''); setEditingNick(true) }}
                  className="flex items-center gap-2 group"
                >
                  <span className="font-semibold text-lg">{profile?.nickname ?? '닉네임 없음'}</span>
                  <Pencil size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">{profile?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {stats.map(({ label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl bg-card border border-border p-4 text-center"
            >
              <p className="text-2xl font-black text-primary">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* My Stories */}
        {userStories.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">내가 참여한 이야기</h3>
            <div className="flex flex-col gap-2">
              {userStories.slice(0, 3).map((story) => (
                <button
                  key={story.id}
                  onClick={() => navigate(`/story/${story.id}`)}
                  className="flex items-center justify-between p-3 rounded-xl bg-card border border-border text-left hover:border-primary/30 transition-colors"
                >
                  <p className="text-sm text-foreground line-clamp-1 flex-1">
                    {story.story_entries?.[0]?.content ?? ''}
                  </p>
                  <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${story.status === 'completed' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-primary/20 text-primary'}`}>
                    {story.status === 'completed' ? '완성' : `${story.story_entries?.length ?? 0}/5`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto">
          <Button variant="outline" onClick={handleLogout} className="w-full text-destructive border-destructive/30 hover:bg-destructive/10">
            <LogOut size={16} className="mr-2" />
            로그아웃
          </Button>
        </div>
      </div>
      <BottomNav />
    </MobileLayout>
  )
}
