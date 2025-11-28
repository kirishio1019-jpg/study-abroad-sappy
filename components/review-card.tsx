"use client"

import { useState, useEffect } from "react"
import { getCommentsByReviewId, saveComment, deleteComment, type Comment } from "@/lib/comments"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { costOfLivingLabels } from "@/lib/cost-of-living"

interface ReviewCardProps {
  review: {
    id: number
    country: string
    university: string
    title: string
    satisfaction: number
    cost: number
    language: string
    author: string
    date: string
    excerpt: string
    strongFields?: string[]
    costOfLiving?: string
  }
}

// 後方互換性のため、古いラベルも残す
const legacyCostOfLivingLabels: Record<string, string> = {
  low: "低い（月15万円以下）",
  average: "平均的（月15～25万円）",
  high: "高い（月25～35万円）",
  "very-high": "非常に高い（月35万円以上）",
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [showAllFields, setShowAllFields] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [commentContent, setCommentContent] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)

  // コメントを読み込む
  useEffect(() => {
    loadComments()
  }, [review.id])

  // ユーザー認証状態を確認
  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
        if (user && !isAnonymous) {
          const defaultName = user.email?.split('@')[0] || user.user_metadata?.full_name || ""
          if (defaultName && !authorName) {
            setAuthorName(defaultName)
          }
        }
      }).catch((error) => {
        console.error('Failed to get user:', error)
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user && !isAnonymous) {
          const defaultName = session.user.email?.split('@')[0] || session.user.user_metadata?.full_name || ""
          if (defaultName && !authorName) {
            setAuthorName(defaultName)
          }
        }
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
    }
  }, [])

  // コメント更新イベントをリッスン
  useEffect(() => {
    const handleCommentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ reviewId: number }>
      if (customEvent.detail.reviewId === review.id) {
        loadComments()
      }
    }

    window.addEventListener('commentUpdated', handleCommentUpdate as EventListener)

    return () => {
      window.removeEventListener('commentUpdated', handleCommentUpdate as EventListener)
    }
  }, [review.id])

  const loadComments = async () => {
    setIsLoadingComments(true)
    try {
      const fetchedComments = await getCommentsByReviewId(review.id)
      // 最新のコメント順（降順）にソート
      fetchedComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setComments(fetchedComments)
    } catch (error) {
      console.error('Failed to load comments:', error)
      setComments([])
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!commentContent.trim()) {
      alert("コメントを入力してください")
      return
    }

    if (!isAnonymous && !authorName.trim()) {
      alert("名前を入力するか、匿名で投稿することを選択してください")
      return
    }

    setIsSubmittingComment(true)
    try {
      const newComment = await saveComment({
        reviewId: review.id,
        userId: isAnonymous ? undefined : (user?.id || undefined),
        authorName: isAnonymous ? "匿名" : authorName.trim(),
        isAnonymous,
        content: commentContent.trim(),
      })

      // コメントリストに追加（最新順にソート）
      const updatedComments = [newComment, ...comments].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setComments(updatedComments)
      
      // フォームをリセット
      setCommentContent("")
      if (!isAnonymous && user) {
        setAuthorName(user.email?.split('@')[0] || user.user_metadata?.full_name || "")
      } else {
        setAuthorName("")
      }
      setShowCommentForm(false)
      
      // コメント更新イベントを発火
      window.dispatchEvent(new CustomEvent('commentUpdated', { detail: { reviewId: review.id } }))
    } catch (error) {
      console.error('Failed to submit comment:', error)
      alert("コメントの投稿に失敗しました。もう一度お試しください。")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "たった今"
    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    if (days < 7) return `${days}日前`
    
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const latestComment = comments.length > 0 ? comments[0] : null

  // コメントを削除できるかどうかを判定
  const canDeleteComment = (comment: Comment): boolean => {
    if (typeof window === 'undefined') return false
    
    // Supabaseに保存されたコメントで、ユーザーIDが一致する場合
    if (user && comment.userId && comment.userId === user.id) {
      return true
    }
    
    // 匿名コメントまたはuserIdがないコメントの場合
    if (!comment.userId) {
      try {
        // セッションIDで判定
        if (comment.sessionId) {
          const mySessionId = localStorage.getItem('comment_session_id')
          if (mySessionId && mySessionId === comment.sessionId) {
            return true
          }
        }
        
        // セッションIDがない場合でも、localStorageにそのコメントが存在する場合は
        // 同じブラウザから投稿されたと判断して削除可能にする
        const key = `review_comments_${review.id}`
        const savedComments = localStorage.getItem(key)
        if (savedComments) {
          try {
            const parsedComments = JSON.parse(savedComments)
            const foundComment = parsedComments.find((c: Comment) => c.id === comment.id)
            if (foundComment) {
              // localStorageに存在する場合、削除可能
              return true
            }
          } catch (e) {
            // パースエラー時は削除不可
            console.error('Error parsing comments from localStorage:', e)
          }
        }
        
        // Supabaseの匿名コメントの場合、ログインユーザーなら削除可能とする
        // （実際の削除権限はサーバーサイドでチェックされる）
        if (user && !comment.sessionId) {
          return true
        }
      } catch (error) {
        console.error('Error checking session ID:', error)
        return false
      }
    }
    
    return false
  }

  const handleDeleteComment = async (commentId: number) => {
    const comment = comments.find(c => c.id === commentId)
    if (!comment) {
      alert("コメントが見つかりません")
      return
    }
    
    if (!canDeleteComment(comment)) {
      alert("このコメントを削除する権限がありません。")
      return
    }
    
    if (!confirm("このコメントを削除しますか？\n削除したコメントは復元できません。")) return

    // 即座にUIから削除（楽観的更新）
    setComments(comments.filter(c => c.id !== commentId))
    
    try {
      await deleteComment(commentId, review.id)
      
      // コメント更新イベントを発火
      window.dispatchEvent(new CustomEvent('commentUpdated', { detail: { reviewId: review.id } }))
    } catch (error) {
      console.error('Failed to delete comment:', error)
      // エラーが発生した場合は、コメントを再読み込み
      loadComments()
    }
  }

  const handleClick = () => {
    // カスタムイベントを発火して詳細ページに遷移
    window.dispatchEvent(new CustomEvent('reviewDetailClick', { detail: { reviewId: review.id } }))
  }
  const getStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push("★")
      } else if (i === fullStars && hasHalfStar) {
        stars.push("½")
      } else {
        stars.push("☆")
      }
    }
    return stars.join("")
  }

  return (
    <div 
      className="group bg-card border border-border rounded-xl p-5 sm:p-7 hover:shadow-xl hover:border-primary/40 transition-all duration-300 cursor-pointer active:scale-[0.98]"
      onClick={handleClick}
    >
      {/* ヘッダー: 大学名・国名 */}
      <div className="mb-4 sm:mb-5 pb-4 border-b border-border/60">
        <div className="flex items-baseline gap-2 sm:gap-3 mb-2 flex-wrap">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground break-words">
            {review.university}
          </span>
          <span className="text-lg sm:text-xl font-semibold text-muted-foreground">
            {review.country}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight break-words mt-2">{review.title}</h3>
      </div>

      {/* 評価とレビュー本文 */}
      <div className="mb-4 sm:mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl sm:text-2xl text-accent">{getStars(review.satisfaction)}</span>
          <span className="text-sm sm:text-base font-semibold text-foreground">{review.satisfaction}/5.0</span>
        </div>
        <p className="text-sm sm:text-base text-foreground leading-relaxed line-clamp-3">{review.excerpt}</p>
      </div>

      {/* 強い分野 */}
      {review.strongFields && review.strongFields.length > 0 && (
        <div className="mb-4 sm:mb-5 pb-4 border-b border-border/60">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">強い分野</p>
          <div className="flex flex-wrap gap-2">
            {(showAllFields ? review.strongFields : review.strongFields.slice(0, 3)).map((field: string) => (
              <span
                key={field}
                className="inline-flex items-center px-3 py-1.5 bg-accent/15 text-accent text-xs font-semibold rounded-md border border-accent/30"
              >
                {field}
              </span>
            ))}
            {review.strongFields.length > 3 && !showAllFields && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAllFields(true)
                }}
                className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-md border border-primary/30 hover:bg-primary/20 transition-colors cursor-pointer"
              >
                +{review.strongFields.length - 3}
              </button>
            )}
            {showAllFields && review.strongFields.length > 3 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAllFields(false)
                }}
                className="inline-flex items-center px-3 py-1.5 bg-muted text-muted-foreground text-xs font-semibold rounded-md hover:bg-muted/80 transition-colors cursor-pointer"
              >
                折りたたむ
              </button>
            )}
          </div>
        </div>
      )}

      {/* 情報カード */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5 py-4 sm:py-5 border border-border/60 bg-gradient-to-br from-muted/40 to-muted/20 px-4 sm:px-5 rounded-lg">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">物価レベル</p>
          <p className="text-sm sm:text-base font-bold text-foreground break-words">
            {review.costOfLiving ? (costOfLivingLabels[review.costOfLiving] || legacyCostOfLivingLabels[review.costOfLiving] || review.costOfLiving) : "-"}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">投稿者</p>
          <p className="text-sm sm:text-base font-bold text-foreground break-words">{review.author}</p>
        </div>
      </div>

      {/* コメントセクション */}
      {(latestComment || showCommentForm) && (
        <div className="mt-5 pt-5 border-t-2 border-border/60" onClick={(e) => e.stopPropagation()}>
          {latestComment && (
            <div className="mb-4">
              <div className="bg-muted/60 rounded-lg p-4 mb-3 relative border border-border/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {latestComment.isAnonymous ? "匿名" : latestComment.authorName}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {formatDate(latestComment.createdAt)}
                    </span>
                  </div>
                  {canDeleteComment(latestComment) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteComment(latestComment.id)
                      }}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-destructive/10"
                      title="コメントを削除"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-sm text-foreground leading-relaxed line-clamp-2">{latestComment.content}</p>
              </div>
              {comments.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClick()
                  }}
                  className="text-xs text-primary hover:text-secondary transition-colors font-semibold"
                >
                  もっと見る ({comments.length}件) →
                </button>
              )}
            </div>
          )}

          {/* コメント投稿フォーム */}
          {showCommentForm ? (
            <form onSubmit={handleSubmitComment} className="space-y-2">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="コメントを入力..."
                rows={2}
                className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                required
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex items-center gap-2">
                {!isAnonymous && (
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="名前"
                    className="flex-1 px-3 py-2 text-xs border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked)
                      if (e.target.checked) {
                        setAuthorName("")
                      } else if (user) {
                        setAuthorName(user.email?.split('@')[0] || user.user_metadata?.full_name || "")
                      }
                    }}
                    className="w-3 h-3"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-xs text-muted-foreground">匿名</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isSubmittingComment ? "投稿中..." : "投稿"}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowCommentForm(false)
                    setCommentContent("")
                  }}
                  className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowCommentForm(true)
              }}
              className="text-xs text-primary hover:text-secondary transition-colors font-medium"
            >
              + コメントを追加
            </button>
          )}
        </div>
      )}

      {/* コメントがない場合のコメント追加ボタン */}
      {!latestComment && !showCommentForm && (
        <div className="mt-5 pt-5 border-t-2 border-border/60" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowCommentForm(true)
            }}
            className="text-xs text-primary hover:text-secondary transition-colors font-semibold"
          >
            + コメントを追加
          </button>
        </div>
      )}

      {/* フッター */}
      <div className="flex items-center justify-between gap-3 mt-5 pt-5 border-t-2 border-border/60">
        <p className="text-xs text-muted-foreground font-medium flex-shrink-0">{review.date}</p>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            handleClick()
          }}
          className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-primary hover:text-secondary transition-colors active:opacity-70 touch-manipulation bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/30"
        >
          <span className="hidden sm:inline">詳細を見る →</span>
          <span className="sm:hidden">詳細 →</span>
        </button>
      </div>
    </div>
  )
}
