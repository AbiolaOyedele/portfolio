'use client'

import { usePathname } from 'next/navigation'
import { BookOpen, Code2, Film, Home, Palette, User } from 'lucide-react'
import { CircleMenu, type CircleMenuItem } from '@/components/ui/circle-menu'

const NAV_LINKS: Array<Omit<CircleMenuItem, 'active'>> = [
  { label: 'Home', href: '/', icon: <Home size={22} /> },
  { label: 'Graphics', href: '/graphics', icon: <Palette size={22} /> },
  { label: 'Motion', href: '/motion', icon: <Film size={22} /> },
  { label: 'Playground', href: '/playground', icon: <Code2 size={22} /> },
  { label: 'About', href: '/about', icon: <User size={22} /> },
]

// Not part of the regular nav — surfaced only on /about, where it's contextually
// relevant, instead of permanently taking a slot in the main radial menu.
const THOUGHTS_LINK: Omit<CircleMenuItem, 'active'> = {
  label: 'Thoughts',
  href: '/thoughts',
  icon: <BookOpen size={22} />,
}

export interface SiteMenuProps {
  className?: string
}

export default function SiteMenu({ className }: SiteMenuProps = {}): React.JSX.Element {
  const pathname = usePathname()

  const links = pathname === '/about' ? [...NAV_LINKS, THOUGHTS_LINK] : NAV_LINKS

  const items: CircleMenuItem[] = links.map((link) => ({
    ...link,
    active: link.href === '/' ? pathname === '/' : pathname.startsWith(link.href),
  }))

  return (
    <CircleMenu
      items={items}
      resetKey={pathname}
      showTapHint={pathname === '/'}
      {...(className !== undefined ? { className } : {})}
    />
  )
}
