"use client"

import { useState, useEffect } from "react"
import { getCommentsByReviewId, saveComment, deleteComment, type Comment } from "@/lib/comments"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface CommentSectionProps {
  reviewId: number
}

export default function CommentSection({ reviewId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  
  // コメントフォームの状態
  const [authorName, setAuthorName] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [commentContent, setCommentContent] = useState("")

  // ユーザー認証状態を確認
  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
        if (user && !isAnonymous) {
          // ログインユーザーがいて、匿名でない場合、デフォルト値を設定
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

  // コメントを読み込む
  useEffect(() => {
    loadComments()
  }, [reviewId])

  // コメント更新イベントをリッスン
  useEffect(() => {
    const handleCommentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ reviewId: number }>
      if (customEvent.detail.reviewId === reviewId) {
        loadComments()
      }
    }

    window.addEventListener('commentUpdated', handleCommentUpdate as EventListener)

    return () => {
      window.removeEventListener('commentUpdated', handleCommentUpdate as EventListener)
    }
  }, [reviewId])

  const loadComments = async () => {
    setIsLoading(true)
    try {
      const fetchedComments = await getCommentsByReviewId(reviewId)
      setComments(fetchedComments)
    } catch (error) {
      console.error('Failed to load comments:', error)
      setComments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!commentContent.trim()) {
      alert("コメントを入力してください")
      return
    }

    if (!isAnonymous && !authorName.trim()) {
      alert("名前を入力するか、匿名で投稿することを選択してください")
      return
    }

    setIsSubmitting(true)
    try {
      const newComment = await saveComment({
        reviewId,
        userId: isAnonymous ? undefined : (user?.id || undefined),
        authorName: isAnonymous ? "匿名" : authorName.trim(),
        isAnonymous,
        content: commentContent.trim(),
      })

      // コメントリストに追加
      setComments([...comments, newComment])
      
      // フォームをリセット
      setCommentContent("")
      if (!isAnonymous && user) {
        // ログインユーザーの場合は名前を保持
        setAuthorName(user.email?.split('@')[0] || user.user_metadata?.full_name || "")
      } else if (isAnonymous) {
        setAuthorName("")
      }

      // コメント更新イベントを発火
      window.dispatchEvent(new CustomEvent('commentUpdated', { detail: { reviewId } }))
    } catch (error) {
      console.error('Failed to save comment:', error)
      alert("コメントの投稿に失敗しました。もう一度お試しください。")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: number) => {
    // 削除権限をチェック
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
      await deleteComment(commentId, reviewId)
      
      // コメント更新イベントを発火
      window.dispatchEvent(new CustomEvent('commentUpdated', { detail: { reviewId } }))
    } catch (error) {
      console.error('Failed to delete comment:', error)
      // エラーが発生した場合は、コメントを再読み込み
      loadComments()
      
      // エラーは表示しない（localStorageから削除済みなので、ユーザーには削除されたように見える）
      // ただし、Supabaseでの削除が失敗した場合は、次回読み込み時に再表示される可能性がある
    }
  }

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
        const key = `review_comments_${reviewId}`
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

  return (
    <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border">
      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6">コメント ({comments.length})</h3>

      {/* コメント投稿フォーム */}
      <form onSubmit={handleSubmit} className="mb-6 sm:mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            コメント
          </label>
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="コメントを入力してください..."
            rows={4}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">
              表示名 {!isAnonymous && <span className="text-xs text-muted-foreground">（任意）</span>}
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={isAnonymous ? "" : (user?.email?.split('@')[0] || "匿名")}
              disabled={isAnonymous}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-background cursor-pointer hover:bg-muted/50 transition-colors">
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
                className="w-4 h-4"
              />
              <span className="text-sm text-foreground">匿名で投稿</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "投稿中..." : "コメントを投稿"}
        </button>
      </form>

      {/* コメント一覧 */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">コメントを読み込んでいます...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-card border border-border rounded-lg p-4 sm:p-6 relative">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {comment.isAnonymous ? "匿名" : comment.authorName}
                  </span>
                  {comment.isAnonymous && (
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                      匿名
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </span>
                  {/* 削除ボタン */}
                  {canDeleteComment(comment) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-destructive/10"
                      title="コメントを削除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>削除</span>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-foreground whitespace-pre-wrap leading-relaxed pr-12">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground">まだコメントがありません。最初のコメントを投稿してみましょう！</p>
        </div>
      )}
    </div>
  )
}

