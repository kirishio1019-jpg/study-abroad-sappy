"use client"

import { useState } from "react"
import UserMenu from "@/components/auth/user-menu"

interface NavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    { id: "home", label: "ホーム" },
    { id: "search", label: "検索" },
    { id: "comparison", label: "比較" },
    { id: "questions", label: "質問" },
    { id: "my-reviews", label: "マイレビュー" },
  ]

  const handlePageChange = (page: string) => {
    onPageChange(page)
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => handlePageChange("home")}
              className="font-semibold group transition-all duration-300 hover:opacity-75"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {/* App Logo Icon - Simple Connected Design */}
                <div className="relative flex-shrink-0 flex items-center">
                  <svg
                    className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <defs>
                      <linearGradient id="logoGradientNav" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--secondary)" />
                      </linearGradient>
                    </defs>
                    
                    {/* Outer circle - Globe */}
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="url(#logoGradientNav)"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    
                    {/* Simple meridian lines */}
                    <path
                      d="M2 12h20M12 2v20"
                      stroke="url(#logoGradientNav)"
                      strokeWidth="1"
                      strokeOpacity="0.3"
                    />
                    
                    {/* Simple latitude lines */}
                    <ellipse
                      cx="12"
                      cy="8"
                      rx="7"
                      ry="2"
                      stroke="url(#logoGradientNav)"
                      strokeWidth="1"
                      fill="none"
                      strokeOpacity="0.4"
                    />
                    <ellipse
                      cx="12"
                      cy="16"
                      rx="7"
                      ry="2"
                      stroke="url(#logoGradientNav)"
                      strokeWidth="1"
                      fill="none"
                      strokeOpacity="0.4"
                    />
                    
                    {/* Center point */}
                    <circle
                      cx="12"
                      cy="12"
                      r="2.5"
                      fill="url(#logoGradientNav)"
                      opacity="0.9"
                    />
                    
                    {/* Simple connection points */}
                    <circle cx="5" cy="7" r="1.2" fill="url(#logoGradientNav)" opacity="0.6" />
                    <circle cx="19" cy="9" r="1.2" fill="url(#logoGradientNav)" opacity="0.6" />
                    <circle cx="6" cy="17" r="1.2" fill="url(#logoGradientNav)" opacity="0.6" />
                    
                    {/* Simple connection lines */}
                    <g className="opacity-30 group-hover:opacity-50 transition-opacity duration-300">
                      <line x1="12" y1="12" x2="5" y2="7" stroke="url(#logoGradientNav)" strokeWidth="0.8" strokeLinecap="round" />
                      <line x1="12" y1="12" x2="19" y2="9" stroke="url(#logoGradientNav)" strokeWidth="0.8" strokeLinecap="round" />
                      <line x1="12" y1="12" x2="6" y2="17" stroke="url(#logoGradientNav)" strokeWidth="0.8" strokeLinecap="round" />
                    </g>
                  </svg>
                </div>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight leading-none">
                  Sappy
                </span>
                <span className="hidden sm:inline text-[10px] sm:text-xs lg:text-sm text-muted-foreground font-normal">
                  - Study Abroad Platform -
                </span>
                <span className="hidden md:inline text-[10px] sm:text-xs lg:text-sm text-muted-foreground font-normal">
                  ALiveRally
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                  currentPage === item.id
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop Right side: User Menu and CTA Button */}
          <div className="hidden lg:flex items-center gap-3">
            <UserMenu />
            <button
              onClick={() => handlePageChange("post-review")}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 font-medium text-sm"
            >
              レビュー投稿
            </button>
          </div>

          {/* Mobile: User Menu and Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <UserMenu />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="メニューを開く"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card">
            <div className="px-4 py-3 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`w-full text-left px-4 py-3 text-base font-medium transition-all duration-200 rounded-md ${
                    currentPage === item.id
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => handlePageChange("post-review")}
                className="w-full mt-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 font-medium text-base"
              >
                レビュー投稿
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}


