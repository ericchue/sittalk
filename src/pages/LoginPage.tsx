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
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login, signup } = useApp()
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      if (isSignup) {
        await signup(data.email, data.password)
        toast.success('가입 완료! 닉네임을 설정해주세요.')
        navigate('/nickname')
      } else {
        await login(data.email, data.password)
        navigate('/home')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileLayout>
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 left-10 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'hsl(262 80% 68%)' }} />
        <div className="absolute bottom-32 right-8 w-36 h-36 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'hsl(220 80% 60%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Logo */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.4 }}
            >
              <h1 className="text-5xl font-black tracking-tight gradient-text mb-3">SITTALK</h1>
            </motion.div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              같은 공간, 같은 감정<br />
              <span className="text-foreground/70">한 문장씩 이어가는 우리의 이야기</span>
            </p>
          </div>

          {/* Card */}
          <div className="glass rounded-2xl p-6 glow">
            <h2 className="text-lg font-semibold mb-5 text-center">
              {isSignup ? '새 계정 만들기' : '다시 만나요'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-muted-foreground">이메일</Label>
                <Input id="email" type="email" placeholder="hello@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs text-muted-foreground">비밀번호</Label>
                <Input id="password" type="password" placeholder="6자 이상" {...register('password')} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full glow" size="lg" disabled={loading}>
                {loading ? '처리 중...' : isSignup ? '가입하기' : '로그인'}
              </Button>
            </form>

            <button
              onClick={() => setIsSignup(!isSignup)}
              className="w-full mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {isSignup ? '이미 계정이 있어요 → 로그인' : '처음이에요 → 가입하기'}
            </button>
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  )
}
