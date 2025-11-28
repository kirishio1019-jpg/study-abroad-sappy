"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface Question {
  id: number
  author: string
  isAnonymous: boolean
  country: string
  university: string
  question: string
  answers: number
  date: string
  comments: Comment[]
  isResolved?: boolean // 解決済みかどうか
  sessionId?: string // 投稿者識別用（localStorage用）
  userId?: string // Supabase用のユーザーID
}

interface Comment {
  id: number
  author: string
  isAnonymous: boolean
  content: string
  date: string
  sessionId?: string // 投稿者識別用（localStorage用）
  userId?: string // Supabase用のユーザーID
}

const initialQuestions: Question[] = []

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null)
  const [newQuestion, setNewQuestion] = useState("")
  const [newComment, setNewComment] = useState<Record<number, string>>({})
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const [isClient, setIsClient] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  
  // 質問フォームの状態
  const [questionAuthorName, setQuestionAuthorName] = useState("")
  const [isQuestionAnonymous, setIsQuestionAnonymous] = useState(false)
  
  // 回答フォームの状態（各質問ごと）
  const [answerAuthorNames, setAnswerAuthorNames] = useState<Record<number, string>>({})
  const [isAnswerAnonymous, setIsAnswerAnonymous] = useState<Record<number, boolean>>({})
  
  // セッションIDを取得または生成（投稿者識別用）
  const getOrCreateSessionId = (): string => {
    if (typeof window === 'undefined') return ''
    try {
      let sessionId = localStorage.getItem('question_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
        localStorage.setItem('question_session_id', sessionId)
      }
      return sessionId
    } catch (error) {
      console.error('Error getting session ID:', error)
      return ''
    }
  }
  
  // 回答用のセッションIDを取得または生成（投稿者識別用）
  const getOrCreateAnswerSessionId = (): string => {
    if (typeof window === 'undefined') return ''
    try {
      let sessionId = localStorage.getItem('answer_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
        localStorage.setItem('answer_session_id', sessionId)
      }
      return sessionId
    } catch (error) {
      console.error('Error getting answer session ID:', error)
      return ''
    }
  }

  // ユーザー認証状態を確認
  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
        if (user && !isQuestionAnonymous) {
          const defaultName = user.email?.split('@')[0] || user.user_metadata?.full_name || ""
          if (defaultName && !questionAuthorName) {
            setQuestionAuthorName(defaultName)
          }
        }
      }).catch((error) => {
        console.error('Failed to get user:', error)
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user && !isQuestionAnonymous) {
          const defaultName = session.user.email?.split('@')[0] || session.user.user_metadata?.full_name || ""
          if (defaultName && !questionAuthorName) {
            setQuestionAuthorName(defaultName)
          }
        }
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
    }
  }, [])

  // クライアントサイドでのみlocalStorageから復元
  useEffect(() => {
    setIsClient(true)
    const savedQuestions = localStorage.getItem('questions')
    if (savedQuestions) {
      try {
        const parsed = JSON.parse(savedQuestions)
        // 後方互換性: 既存フィールドの初期化
        const questionsWithAnonymous = parsed.map((q: any) => ({
          ...q,
          isAnonymous: q.isAnonymous !== undefined ? q.isAnonymous : (q.author === "匿名"),
          isResolved: q.isResolved !== undefined ? q.isResolved : false,
          sessionId: q.sessionId || undefined,
          userId: q.userId || undefined,
          comments: (q.comments || []).map((c: any) => ({
            ...c,
            isAnonymous: c.isAnonymous !== undefined ? c.isAnonymous : (c.author === "匿名"),
            sessionId: c.sessionId || undefined,
            userId: c.userId || undefined,
          })),
        }))
        setQuestions(questionsWithAnonymous)
      } catch (e) {
        // パースエラー時は初期値を使用
      }
    }
    const savedNewQuestion = localStorage.getItem('newQuestion')
    if (savedNewQuestion) {
      setNewQuestion(savedNewQuestion)
    }
    const savedComments = localStorage.getItem('newComments')
    if (savedComments) {
      try {
        setNewComment(JSON.parse(savedComments))
      } catch (e) {
        // パースエラー時は初期値を使用
      }
    }
    const savedExpanded = localStorage.getItem('expandedQuestions')
    if (savedExpanded) {
      try {
        const ids = JSON.parse(savedExpanded)
        setExpandedQuestions(new Set(ids))
      } catch (e) {
        // パースエラー時は初期値を使用
      }
    }
  }, [])

  // 質問データをlocalStorageに保存
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('questions', JSON.stringify(questions))
    }
  }, [questions, isClient])

  // 新規質問入力をlocalStorageに保存
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('newQuestion', newQuestion)
    }
  }, [newQuestion, isClient])

  // コメント入力をlocalStorageに保存
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('newComments', JSON.stringify(newComment))
    }
  }, [newComment, isClient])

  // 展開状態をlocalStorageに保存
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('expandedQuestions', JSON.stringify(Array.from(expandedQuestions)))
    }
  }, [expandedQuestions, isClient])

  // 質問を投稿する
  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return

    if (!isQuestionAnonymous && !questionAuthorName.trim()) {
      alert("名前を入力するか、匿名で投稿することを選択してください")
      return
    }

    const newQuestionData: Question = {
      id: Date.now(),
      author: isQuestionAnonymous ? "匿名" : questionAuthorName.trim(),
      isAnonymous: isQuestionAnonymous,
      country: "",
      university: "",
      question: newQuestion.trim(),
      answers: 0,
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
      comments: [],
      isResolved: false,
      sessionId: getOrCreateSessionId(),
      userId: user?.id || undefined,
    }

    // 最新のものが上に来るように先頭に追加
    setQuestions((prev) => [newQuestionData, ...prev])
    setNewQuestion("")
    if (!isQuestionAnonymous && user) {
      setQuestionAuthorName(user.email?.split('@')[0] || user.user_metadata?.full_name || "")
    } else {
      setQuestionAuthorName("")
    }
    // localStorageもクリア（useEffectで自動的にクリアされる）
    setExpandedQuestions((prev) => new Set([...prev, newQuestionData.id]))
  }

  // コメントを投稿する
  const handlePostComment = (questionId: number, e: React.FormEvent) => {
    e.preventDefault()
    const commentText = newComment[questionId]
    if (!commentText?.trim()) return

    const isAnonymous = isAnswerAnonymous[questionId] || false
    const authorName = answerAuthorNames[questionId] || ""

    if (!isAnonymous && !authorName.trim()) {
      alert("名前を入力するか、匿名で投稿することを選択してください")
      return
    }

    const newCommentData: Comment = {
      id: Date.now(),
      author: isAnonymous ? "匿名" : authorName.trim(),
      isAnonymous: isAnonymous,
      content: commentText.trim(),
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
      sessionId: getOrCreateAnswerSessionId(),
      userId: user?.id || undefined,
    }

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            comments: [...q.comments, newCommentData],
            answers: q.comments.length + 1,
          }
        }
        return q
      })
    )

    setNewComment((prev) => ({
      ...prev,
      [questionId]: "",
    }))

    // 回答フォームをリセット
    if (!isAnonymous && user) {
      setAnswerAuthorNames((prev) => ({
        ...prev,
        [questionId]: user.email?.split('@')[0] || user.user_metadata?.full_name || "",
      }))
    } else {
      setAnswerAuthorNames((prev) => ({
        ...prev,
        [questionId]: "",
      }))
    }
  }

  // 質問の展開/折りたたみ
  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  // 質問の投稿者かどうかを判定（削除や解決済みマークに使用）
  const canResolveQuestion = (question: Question): boolean => {
    if (typeof window === 'undefined') return false
    
    // SupabaseのユーザーIDで判定
    if (user && question.userId && question.userId === user.id) {
      return true
    }
    
    // セッションIDで判定（最も信頼性が高い）
    if (question.sessionId) {
      const mySessionId = localStorage.getItem('question_session_id')
      if (mySessionId && mySessionId === question.sessionId) {
        return true
      }
    }
    
    // localStorageから判定（後方互換性とフォールバック）
    try {
      const savedQuestions = localStorage.getItem('questions')
      if (savedQuestions) {
        const parsed = JSON.parse(savedQuestions)
        const foundQuestion = parsed.find((q: Question) => q.id === question.id)
        if (foundQuestion) {
          // localStorageに存在する場合、同じブラウザから投稿されたと判断
          // sessionIdがある場合は比較
          if (foundQuestion.sessionId) {
            const mySessionId = localStorage.getItem('question_session_id')
            if (mySessionId && mySessionId === foundQuestion.sessionId) {
              return true
            }
          }
          
          // sessionIdがない場合でも、同じブラウザから投稿された可能性が高い
          // 匿名でない場合は、投稿者名も一致するかチェック
          if (!foundQuestion.sessionId) {
            const mySessionId = localStorage.getItem('question_session_id')
            // セッションIDが存在する場合、同じブラウザと判断
            if (mySessionId) {
              return true
            }
            // セッションIDがない場合は、質問がlocalStorageに存在するだけで判断
            // （同じブラウザから投稿された可能性が高い）
            return true
          }
        }
      }
      
      // 現在の質問リストからも判定（メモリ上の質問）
      const currentQuestion = questions.find((q) => q.id === question.id)
      if (currentQuestion) {
        // 現在の質問がセッションIDを持っている場合
        if (currentQuestion.sessionId) {
          const mySessionId = localStorage.getItem('question_session_id')
          if (mySessionId && mySessionId === currentQuestion.sessionId) {
            return true
          }
        }
      }
    } catch (error) {
      console.error('Error checking question ownership:', error)
    }
    
    return false
  }

  // 質問を解決済みにする
  const handleResolveQuestion = (questionId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm("この質問を解決済みとしてマークしますか？")) return

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            isResolved: true,
          }
        }
        return q
      })
    )
  }

  // 質問を削除する
  const handleDeleteQuestion = (questionId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm("この質問を削除しますか？\n削除した質問は復元できません。")) return

    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev)
      newSet.delete(questionId)
      return newSet
    })
  }

  // 回答を削除する
  const handleDeleteComment = (questionId: number, commentId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm("この回答を削除しますか？\n削除した回答は復元できません。")) return

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const filteredComments = q.comments.filter((c) => c.id !== commentId)
          return {
            ...q,
            comments: filteredComments,
            answers: filteredComments.length,
          }
        }
        return q
      })
    )
  }

  // 回答を削除できるかどうかを判定
  const canDeleteComment = (comment: Comment): boolean => {
    if (typeof window === 'undefined') return false
    
    // SupabaseのユーザーIDで判定
    if (user && comment.userId && comment.userId === user.id) {
      return true
    }
    
    // セッションIDで判定
    if (comment.sessionId) {
      const mySessionId = localStorage.getItem('answer_session_id')
      if (mySessionId === comment.sessionId) {
        return true
      }
    }
    
    // localStorageから判定（後方互換性）
    try {
      const savedQuestions = localStorage.getItem('questions')
      if (savedQuestions) {
        const parsed = JSON.parse(savedQuestions)
        for (const q of parsed) {
          const foundComment = (q.comments || []).find((c: Comment) => c.id === comment.id)
          if (foundComment) {
            // localStorageに存在する場合、削除可能
            return true
          }
        }
      }
    } catch (error) {
      console.error('Error checking comment in localStorage:', error)
    }
    
    return false
  }

  // 質問を未回答と回答済みに分類
  const unresolvedQuestions = questions.filter((q) => !q.isResolved)
  const resolvedQuestions = questions.filter((q) => q.isResolved)

  // 質問カードを表示するコンポーネント
  const QuestionCard = ({ q, isResolvedSection }: { q: Question; isResolvedSection: boolean }) => {
    const isExpanded = expandedQuestions.has(q.id)

    return (
      <div
        className={`bg-card border border-border rounded-lg overflow-hidden ${isResolvedSection ? 'opacity-75' : ''}`}
      >
        {/* Question Header */}
        <div
          className="p-6 hover:bg-muted/30 transition-colors cursor-pointer"
          onClick={() => toggleQuestion(q.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {q.country && q.university && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                    {q.country}
                  </span>
                  <span className="text-xs text-muted-foreground">{q.university}</span>
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-foreground">{q.question}</h3>
                {q.isResolved && (
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded">
                    解決済み
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>質問者: {q.author}</span>
                {q.isAnonymous && (
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                    匿名
                  </span>
                )}
                <span>{q.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-lg font-bold text-accent mb-1">{q.answers}</p>
                <p className="text-xs text-muted-foreground">回答</p>
              </div>
              {/* 削除ボタン（投稿者のみ表示） */}
              {canResolveQuestion(q) && (
                <button
                  onClick={(e) => handleDeleteQuestion(q.id, e)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-destructive/10"
                  title="質問を削除"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>削除</span>
                </button>
              )}
            </div>
          </div>

          {/* Expand/Collapse Indicator */}
          <div className="flex items-center justify-center mt-4">
            <svg
              className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Expanded Comments Section */}
        {isExpanded && (
          <div className="border-t border-border bg-background">
            <div className="p-6 space-y-4">
              {/* 解決済みボタン（投稿者のみ表示、未回答セクションのみ） */}
              {!isResolvedSection && canResolveQuestion(q) && !q.isResolved && (
                <div className="mb-4 pb-4 border-b border-border">
                  <button
                    onClick={(e) => handleResolveQuestion(q.id, e)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    解決済みとしてマーク
                  </button>
                </div>
              )}
              
              {q.comments.length > 0 ? (
                <>
                  <h4 className="font-semibold text-foreground mb-4">回答 ({q.comments.length}件)</h4>
                  {q.comments.map((comment) => (
                    <div key={comment.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{comment.author}</span>
                          {comment.isAnonymous && (
                            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                              匿名
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">{comment.date}</span>
                        </div>
                        {/* 削除ボタン（投稿者のみ表示） */}
                        {canDeleteComment(comment) && (
                          <button
                            onClick={(e) => handleDeleteComment(q.id, comment.id, e)}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-destructive/10"
                            title="回答を削除"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>削除</span>
                          </button>
                        )}
                      </div>
                      <p className="text-foreground/80 text-sm">{comment.content}</p>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">まだ回答がありません。最初の回答者になりましょう！</p>
              )}

              {/* Comment Form（解決済みセクションでは非表示） */}
              {!isResolvedSection && (
                <div className="border-t border-border pt-4 mt-4">
                  <h4 className="font-semibold text-foreground mb-3">回答を投稿する</h4>
                  <form onSubmit={(e) => handlePostComment(q.id, e)} className="space-y-3">
                    <textarea
                      value={newComment[q.id] || ""}
                      onChange={(e) =>
                        setNewComment((prev) => ({
                          ...prev,
                          [q.id]: e.target.value,
                        }))
                      }
                      placeholder="この質問への回答を入力してください..."
                      rows={3}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                      required
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-foreground mb-1">
                          表示名 {!isAnswerAnonymous[q.id] && <span className="text-xs text-muted-foreground">（任意）</span>}
                        </label>
                        <input
                          type="text"
                          value={answerAuthorNames[q.id] || ""}
                          onChange={(e) =>
                            setAnswerAuthorNames((prev) => ({
                              ...prev,
                              [q.id]: e.target.value,
                            }))
                          }
                          placeholder={isAnswerAnonymous[q.id] ? "" : (user?.email?.split('@')[0] || "匿名")}
                          disabled={isAnswerAnonymous[q.id]}
                          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background cursor-pointer hover:bg-muted/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={isAnswerAnonymous[q.id] || false}
                            onChange={(e) => {
                              setIsAnswerAnonymous((prev) => ({
                                ...prev,
                                [q.id]: e.target.checked,
                              }))
                              if (e.target.checked) {
                                setAnswerAuthorNames((prev) => ({
                                  ...prev,
                                  [q.id]: "",
                                }))
                              } else if (user) {
                                setAnswerAuthorNames((prev) => ({
                                  ...prev,
                                  [q.id]: user.email?.split('@')[0] || user.user_metadata?.full_name || "",
                                }))
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-xs text-foreground">匿名で投稿</span>
                        </label>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                    >
                      回答を投稿
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">質問・回答コーナー</h1>

      {/* New Question Form */}
      <section className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">質問を投稿する</h2>
        <form onSubmit={handlePostQuestion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">質問の内容</label>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="留学先の選択や、体験についての質問をしてください。"
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                表示名 {!isQuestionAnonymous && <span className="text-xs text-muted-foreground">（任意）</span>}
              </label>
              <input
                type="text"
                value={questionAuthorName}
                onChange={(e) => setQuestionAuthorName(e.target.value)}
                placeholder={isQuestionAnonymous ? "" : (user?.email?.split('@')[0] || "匿名")}
                disabled={isQuestionAnonymous}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-background cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  checked={isQuestionAnonymous}
                  onChange={(e) => {
                    setIsQuestionAnonymous(e.target.checked)
                    if (e.target.checked) {
                      setQuestionAuthorName("")
                    } else if (user) {
                      setQuestionAuthorName(user.email?.split('@')[0] || user.user_metadata?.full_name || "")
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
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            質問を投稿
          </button>
        </form>
      </section>

      {/* Questions List */}
      <div className="space-y-6">
        {/* 未回答の質問 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">未回答の質問</h2>
          {unresolvedQuestions.length > 0 ? (
            unresolvedQuestions.map((q) => (
              <QuestionCard key={q.id} q={q} isResolvedSection={false} />
            ))
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-muted-foreground">未回答の質問はありません。</p>
            </div>
          )}
        </div>

        {/* 回答済みの質問 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">回答済みの質問</h2>
          {resolvedQuestions.length > 0 ? (
            resolvedQuestions.map((q) => (
              <QuestionCard key={q.id} q={q} isResolvedSection={true} />
            ))
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-muted-foreground">回答済みの質問はありません。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
