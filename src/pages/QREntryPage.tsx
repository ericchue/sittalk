import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { MobileLayout } from '@/components/MobileLayout'

export default function QREntryPage() {
  const [searchParams] = useSearchParams()
  const { isAuthenticated, selectLocation } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    const loc = searchParams.get('loc')
    if (loc) {
      if (isAuthenticated) {
        selectLocation(loc)
        navigate('/home')
      } else {
        localStorage.setItem('pending_qr_location', loc)
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }, [searchParams, isAuthenticated, selectLocation, navigate])

  return (
    <MobileLayout>
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">공간에 접속하는 중...</p>
      </div>
    </MobileLayout>
  )
}
