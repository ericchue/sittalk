import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { MobileLayout } from '@/components/MobileLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/context/AppContext'

const schema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다')
    .max(12, '닉네임은 12자 이하여야 합니다')
    .regex(/^[가-힣a-zA-Z0-9]+$/, '한글, 영문, 숫자만 사용 가능합니다'),
})
type FormData = z.infer<typeof schema>

export default function NicknamePage() {
  const { setNickname } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await setNickname(data.nickname)
      toast.success(`${data.nickname}님, 환영합니다!`)
      navigate('/home')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">✍️</div>
            <h2 className="text-2xl font-bold mb-2">닉네임 설정</h2>
            <p className="text-sm text-muted-foreground">
              이야기에 함께할 나만의 이름을 정해주세요
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                placeholder="2~12자, 한글/영문/숫자"
                {...register('nickname')}
              />
              {errors.nickname && (
                <p className="text-xs text-destructive">{errors.nickname.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '저장 중...' : '시작하기'}
            </Button>
          </form>
        </motion.div>
      </div>
    </MobileLayout>
  )
}
