export type Emotion = 'happy' | 'sad' | 'tired' | 'stressed' | 'hopeful'

export const EMOTIONS: { value: Emotion; label: string; emoji: string }[] = [
  { value: 'happy', label: '행복', emoji: '😊' },
  { value: 'sad', label: '슬픔', emoji: '😢' },
  { value: 'tired', label: '피곤', emoji: '😴' },
  { value: 'stressed', label: '스트레스', emoji: '😤' },
  { value: 'hopeful', label: '희망', emoji: '🌟' },
]

export const EMOTION_COLORS: Record<Emotion, string> = {
  happy: 'hsl(45 95% 60%)',
  sad: 'hsl(220 60% 55%)',
  tired: 'hsl(270 40% 65%)',
  stressed: 'hsl(0 70% 58%)',
  hopeful: 'hsl(145 55% 50%)',
}

export const EMOTION_LABELS: Record<Emotion, string> = {
  happy: '행복',
  sad: '슬픔',
  tired: '피곤',
  stressed: '스트레스',
  hopeful: '희망',
}

export const EMOTION_EMOJIS: Record<Emotion, string> = {
  happy: '😊',
  sad: '😢',
  tired: '😴',
  stressed: '😤',
  hopeful: '🌟',
}

export interface Profile {
  id: string
  email: string
  nickname: string | null
  created_at: string
}

export interface Story {
  id: string
  location_name: string
  emotion: Emotion
  status: 'active' | 'completed'
  like_count: number
  created_at: string
  completed_at: string | null
}

export interface StoryEntry {
  id: string
  story_id: string
  user_id: string
  nickname: string
  content: string
  order_index: number
  created_at: string
}

export interface StoryWithEntries extends Story {
  story_entries: StoryEntry[]
}

export interface StoryLike {
  id: string
  story_id: string
  user_id: string
  created_at: string
}
