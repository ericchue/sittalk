import { NavLink } from 'react-router-dom'
import { Home, Trophy, Archive, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/home', icon: Home, label: '홈' },
  { to: '/ranking', icon: Trophy, label: '랭킹' },
  { to: '/archive', icon: Archive, label: '아카이브' },
  { to: '/mypage', icon: User, label: '마이' },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card border-t border-border z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
