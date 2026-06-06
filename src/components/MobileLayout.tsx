import { cn } from '@/lib/utils'

interface MobileLayoutProps {
  children: React.ReactNode
  className?: string
  withNav?: boolean
}

export function MobileLayout({ children, className, withNav = false }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div
        className={cn(
          'relative w-full max-w-[390px] min-h-screen flex flex-col bg-background',
          withNav && 'pb-20',
          className
        )}
        style={{ paddingBottom: withNav ? 'calc(5rem + env(safe-area-inset-bottom))' : undefined }}
      >
        {children}
      </div>
    </div>
  )
}
