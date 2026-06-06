import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Profile, StoryWithEntries, Emotion } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface AppContextType {
  // Auth
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  loading: boolean

  // Location & Emotion
  selectedLocation: string
  selectedEmotion: Emotion | null
  selectLocation: (loc: string) => void
  selectEmotion: (emotion: Emotion) => void

  // Stories
  stories: StoryWithEntries[]
  likedStoryIds: Set<string>
  refreshStories: () => Promise<void>

  // Actions
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setNickname: (nickname: string) => Promise<void>
  createStory: (location: string, emotion: Emotion, firstEntry: string) => Promise<string>
  addEntry: (storyId: string, content: string) => Promise<void>
  toggleLike: (storyId: string) => Promise<void>

  // Selectors
  getStoriesByEmotionAndLocation: (emotion: Emotion, location: string) => StoryWithEntries[]
  getPopularStories: () => StoryWithEntries[]
  getCompletedStories: () => StoryWithEntries[]
  getUserStories: () => StoryWithEntries[]
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stories, setStories] = useState<StoryWithEntries[]>([])
  const [likedStoryIds, setLikedStoryIds] = useState<Set<string>>(new Set())
  const [selectedLocation, setSelectedLocation] = useState('성균관대학교 중앙도서관')
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null)

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data as Profile)
  }, [])

  const fetchStories = useCallback(async () => {
    // Today's date in KST (UTC+9)
    const todayKST = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
    const todayStart = `${todayKST}T00:00:00+09:00`

    const { data } = await supabase
      .from('stories')
      .select('*, story_entries(*)')
      .or(`status.eq.completed,and(status.eq.active,created_at.gte.${todayStart})`)
      .order('created_at', { ascending: false })
    if (data) {
      const sorted = data.map((s: StoryWithEntries) => ({
        ...s,
        story_entries: [...(s.story_entries || [])].sort(
          (a, b) => a.order_index - b.order_index
        ),
      }))
      setStories(sorted as StoryWithEntries[])
    }
  }, [])

  const fetchLikes = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('story_likes')
      .select('story_id')
      .eq('user_id', userId)
    if (data) setLikedStoryIds(new Set(data.map((l) => l.story_id)))
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id)
          fetchLikes(session.user.id)
        }, 0)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id)
          fetchLikes(session.user.id)
          // Restore pending QR location
          const pending = localStorage.getItem('pending_qr_location')
          if (pending) {
            setSelectedLocation(pending)
            localStorage.removeItem('pending_qr_location')
          }
        }, 0)
      }
      if (event === 'SIGNED_OUT') {
        setProfile(null)
        setLikedStoryIds(new Set())
      }
    })

    fetchStories()

    return () => subscription.unsubscribe()
  }, [fetchProfile, fetchLikes, fetchStories])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const setNickname = async (nickname: string) => {
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('profiles')
      .update({ nickname })
      .eq('id', user.id)
    if (error) throw error
    setProfile((prev) => prev ? { ...prev, nickname } : null)
  }

  const createStory = async (location: string, emotion: Emotion, firstEntry: string): Promise<string> => {
    if (!user || !profile) throw new Error('Not authenticated')
    const { data: story, error: storyErr } = await supabase
      .from('stories')
      .insert({ location_name: location, emotion })
      .select()
      .single()
    if (storyErr) throw storyErr

    const { error: entryErr } = await supabase
      .from('story_entries')
      .insert({
        story_id: story.id,
        user_id: user.id,
        nickname: profile.nickname ?? '익명',
        content: firstEntry,
        order_index: 1,
      })
    if (entryErr) throw entryErr
    await fetchStories()
    return story.id
  }

  const addEntry = async (storyId: string, content: string) => {
    if (!user || !profile) throw new Error('Not authenticated')
    const story = stories.find((s) => s.id === storyId)
    if (!story) throw new Error('Story not found')
    const orderIndex = (story.story_entries?.length ?? 0) + 1
    const { error } = await supabase
      .from('story_entries')
      .insert({
        story_id: storyId,
        user_id: user.id,
        nickname: profile.nickname ?? '익명',
        content,
        order_index: orderIndex,
      })
    if (error) throw error
    await fetchStories()
  }

  const toggleLike = async (storyId: string) => {
    if (!user) throw new Error('Not authenticated')
    const liked = likedStoryIds.has(storyId)
    if (liked) {
      await supabase.from('story_likes').delete().eq('story_id', storyId).eq('user_id', user.id)
      setLikedStoryIds((prev) => { const n = new Set(prev); n.delete(storyId); return n })
    } else {
      await supabase.from('story_likes').insert({ story_id: storyId, user_id: user.id })
      setLikedStoryIds((prev) => new Set([...prev, storyId]))
    }
    await fetchStories()
  }

  const getStoriesByEmotionAndLocation = (emotion: Emotion, location: string) =>
    stories.filter((s) => s.emotion === emotion && s.location_name === location && s.status === 'active')

  const getPopularStories = () =>
    [...stories].sort((a, b) => b.like_count - a.like_count)

  const getCompletedStories = () =>
    stories.filter((s) => s.status === 'completed').sort(
      (a, b) => new Date(b.completed_at ?? b.created_at).getTime() - new Date(a.completed_at ?? a.created_at).getTime()
    )

  const getUserStories = () =>
    stories.filter((s) => s.story_entries?.some((e) => e.user_id === user?.id))

  return (
    <AppContext.Provider value={{
      user, profile, isAuthenticated: !!user, loading,
      selectedLocation, selectedEmotion,
      selectLocation: setSelectedLocation,
      selectEmotion: setSelectedEmotion,
      stories, likedStoryIds,
      refreshStories: fetchStories,
      login, signup, logout, setNickname,
      createStory, addEntry, toggleLike,
      getStoriesByEmotionAndLocation, getPopularStories, getCompletedStories, getUserStories,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
