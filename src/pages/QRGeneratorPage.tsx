import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { ArrowLeft, Copy, Share2, Download } from 'lucide-react'
import { MobileLayout } from '@/components/MobileLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function QRGeneratorPage() {
  const navigate = useNavigate()
  const [location, setLocation] = useState('')
  const [submitted, setSubmitted] = useState('')
  const qrRef = useRef<HTMLDivElement>(null)

  const qrUrl = submitted
    ? `${window.location.origin}/enter?loc=${encodeURIComponent(submitted)}`
    : ''

  const handleGenerate = () => {
    if (!location.trim()) {
      toast.error('장소명을 입력해주세요')
      return
    }
    setSubmitted(location.trim())
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(qrUrl)
    toast.success('링크가 복사되었습니다')
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `SITTALK - ${submitted}`, url: qrUrl })
    } else {
      handleCopy()
    }
  }

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 300
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    const svgStr = new XMLSerializer().serializeToString(svg)
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 300, 300)
      ctx.drawImage(img, 0, 0, 300, 300)
      const a = document.createElement('a')
      a.download = `sittalk-qr-${submitted}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
      toast.success('QR 이미지가 다운로드되었습니다')
    }
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`
  }

  return (
    <MobileLayout>
      <div className="flex flex-col min-h-screen p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">뒤로</span>
        </button>

        <h1 className="text-2xl font-bold mb-1">QR 생성기</h1>
        <p className="text-sm text-muted-foreground mb-8">운영자 전용 — 장소별 QR을 생성합니다</p>

        <div className="space-y-3 mb-6">
          <Label>장소명</Label>
          <Input
            placeholder="예: 성균관대학교 중앙도서관"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Button onClick={handleGenerate} className="w-full">QR 생성</Button>
        </div>

        {submitted && (
          <div className="flex flex-col items-center gap-6">
            <div ref={qrRef} className="bg-white p-4 rounded-2xl">
              <QRCodeSVG value={qrUrl} size={200} />
            </div>
            <p className="text-xs text-muted-foreground text-center break-all">{qrUrl}</p>
            <div className="grid grid-cols-3 gap-3 w-full">
              <Button variant="outline" onClick={handleCopy} className="flex-col gap-1 h-auto py-3">
                <Copy size={16} />
                <span className="text-xs">링크 복사</span>
              </Button>
              <Button variant="outline" onClick={handleShare} className="flex-col gap-1 h-auto py-3">
                <Share2 size={16} />
                <span className="text-xs">공유</span>
              </Button>
              <Button variant="outline" onClick={handleDownload} className="flex-col gap-1 h-auto py-3">
                <Download size={16} />
                <span className="text-xs">다운로드</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
