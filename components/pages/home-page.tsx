"use client"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ReviewCard from "@/components/review-card"
import CountryStatsGrid from "@/components/country-stats-grid"
import { getAllReviews, migrateReviewsFromLocalStorage } from "@/lib/reviews"
import type { Review } from "@/lib/reviews"

export default function HomePage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // URLパラメータから認証エラーを読み取る
  const authError = searchParams.get('auth_error')
  const errorMessage = searchParams.get('error_message')

  // レビューを読み込む
  useEffect(() => {
    setIsClient(true)
    loadReviews()
  }, [])

  const loadReviews = async () => {
    setIsLoading(true)
    try {
      // localStorageからSupabaseへの移行を試みる（初回のみ）
      if (typeof window !== 'undefined') {
        const hasMigrated = localStorage.getItem('reviews_migrated_to_supabase')
        if (!hasMigrated) {
          try {
            await migrateReviewsFromLocalStorage()
            localStorage.setItem('reviews_migrated_to_supabase', 'true')
          } catch (error) {
            console.warn('Failed to migrate reviews from localStorage:', error)
          }
        }
      }
      
      // URLパラメータでキャッシュクリアが指定されている場合
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('clear_cache') === 'true') {
          localStorage.removeItem('reviews')
          localStorage.removeItem('reviews_migrated_to_supabase')
          // URLパラメータを削除
          urlParams.delete('clear_cache')
          const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '')
          window.history.replaceState({}, '', newUrl)
        }
      }
      
      // レビューを取得（Supabase優先、フォールバックはlocalStorage）
      const fetchedReviews = await getAllReviews()
      // 最新順（IDの降順）でソート
      fetchedReviews.sort((a, b) => b.id - a.id)
      setReviews(fetchedReviews)
    } catch (error) {
      console.error('Failed to load reviews:', error)
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }

  // レビューが更新されたときのリスナー
  useEffect(() => {
    if (!isClient) return
    
    const handleReviewUpdate = async () => {
      await loadReviews()
    }

    // localStorageの変更を検知（後方互換性のため）
    const handleStorageChange = () => {
      loadReviews()
    }

    window.addEventListener('storage', handleStorageChange)
    // 同じウィンドウ内での更新も検知（カスタムイベント）
    window.addEventListener('reviewUpdated', handleReviewUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('reviewUpdated', handleReviewUpdate)
    }
  }, [isClient])

  // 認証エラーメッセージを表示し、URLパラメータをクリア
  useEffect(() => {
    if (authError && isClient) {
      // エラーを表示した後、URLパラメータをクリア
      const timer = setTimeout(() => {
        router.replace('/', { scroll: false })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [authError, isClient, router])

  return (
    <div className="min-h-screen bg-background">
      {/* 認証エラーメッセージ */}
      {authError && (
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-8">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-6 py-4 mb-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-1">ログインエラー</h3>
                <p className="text-sm text-destructive/80 mb-2">
                  {errorMessage || 'ログインに失敗しました。もう一度お試しください。'}
                </p>
                {authError === 'redirect_uri_mismatch' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 解決方法: デプロイ先のURLをGoogle Cloud Consoleの「承認済みのリダイレクト URI」に追加してください。
                    <br />
                    詳しくは <code className="text-xs bg-muted px-1 py-0.5 rounded">DEPLOY_GOOGLE_LOGIN_SETUP.md</code> を参照してください。
                  </p>
                )}
              </div>
              <button
                onClick={() => router.replace('/', { scroll: false })}
                className="text-destructive/60 hover:text-destructive transition-colors"
                aria-label="エラーメッセージを閉じる"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="bg-gradient-to-br from-card via-background to-background min-h-[80vh] sm:min-h-0">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-40 sm:pt-24 lg:pt-32 pb-16 sm:pb-16 lg:pb-20 flex items-center min-h-[80vh] sm:min-h-0">
          <div className="text-center w-full">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('pageChange', { 
                  detail: { page: 'search' } 
                }))
              }}
              className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/20 hover:border-primary/30 transition-colors cursor-pointer"
            >
              <p className="text-xs sm:text-sm font-medium text-primary">世界中の留学体験にアクセス</p>
            </button>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 text-balance leading-tight px-2">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">あなたはどこを選ぶ？</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto text-balance leading-relaxed px-4">
                先輩のリアルな留学体験にアクセス。自分の条件に近い声を探して、最適な留学先を見つけよう。
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-16 sm:pt-4 pb-8">
        <div className="bg-muted/50 border border-border/50 rounded-lg px-4 sm:px-5 py-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">ご注意：</span>
                本サイトに掲載されている情報は、学生の個人体験談に基づく非公式な情報です。正確な留学情報や最新の情報については、必ず
                <span className="font-medium text-foreground">大学の公式ホームページ</span>
                や
                <span className="font-medium text-foreground">留学担当部署</span>
                にてご確認ください。正式な手続きや要件については、公式の情報源をご参照ください。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Countries Section */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-32 pb-10 sm:pb-12 lg:pb-16">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">人気の留学先</h2>
          <p className="text-sm sm:text-base text-muted-foreground">多くの学生が注目している国をチェック</p>
        </div>
        <div className="mt-4 sm:mt-6 lg:mt-8">
          <CountryStatsGrid />
        </div>
      </section>

      {/* Recent Reviews Section */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">最新レビュー</h2>
          <p className="text-sm sm:text-base text-muted-foreground">新しく投稿された体験談をチェック</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-6 lg:gap-8">
          {isLoading ? (
            <div className="col-span-1 lg:col-span-2 text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground mb-2">レビューを読み込んでいます...</p>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review as any} />
            ))
          ) : (
            <div className="col-span-1 lg:col-span-2 text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground mb-2">まだレビューがありません。</p>
              <p className="text-sm text-muted-foreground">最初のレビューを投稿してみましょう！</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer Section */}
      <section className="bg-muted/40 border-t border-border/50 mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">© 2025 ALiveRally. すべての権利を保有しています。</p>
          </div>
        </div>
      </section>
    </div>
  )
}


