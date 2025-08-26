'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Settings, Image, History, User, LogOut } from 'lucide-react'
// import { UserButton } from '@clerk/nextjs' // Temporarily commented out

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Gallery', href: '/gallery', icon: Image },
  { name: 'History', href: '/history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white h-screen">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="font-bold text-xl">VeilVision</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile - Temporarily disabled */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center space-x-3">
          {/* <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              }
            }}
          /> */}
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Demo User
            </p>
            <p className="text-xs text-gray-400 truncate">
              Authentication disabled
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}