"use client"

interface NavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export default function NavigationSimple({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-baseline gap-2">
            <button
              onClick={() => onPageChange("home")}
              className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-75 transition-opacity flex items-baseline gap-1"
            >
              <span className="text-3xl">Sappy</span>
              <span className="text-base text-muted-foreground font-normal ml-2">- Study Abroad Platform -</span>
            </button>
            <span className="text-base text-muted-foreground font-normal">
              ALiveRally
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[
              { id: "home", label: "ホーム" },
              { id: "search", label: "検索" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
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
        </div>
      </div>
    </nav>
  )
}


