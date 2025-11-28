// コメントの保存・取得を行う共通関数
import { createClient } from '@/lib/supabase/client'

export interface Comment {
  id: number
  reviewId: number
  userId?: string | null
  authorName: string
  isAnonymous: boolean
  content: string
  createdAt: string
  updatedAt?: string
  sessionId?: string // localStorage用のセッションID（投稿者の識別用）
}

// Supabaseが設定されているかチェック
function isSupabaseAvailable(): boolean {
  if (typeof window === 'undefined') return false
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key' &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('placeholder')
  )
}

// レビューのコメントを取得
export async function getCommentsByReviewId(reviewId: number): Promise<Comment[]> {
  // まずlocalStorageから取得を試みる（フォールバック）
  const localComments = getCommentsFromLocalStorage(reviewId)
  
  if (isSupabaseAvailable()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('review_comments')
        .select('*')
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true })
      
      if (error) {
        // より詳細なエラー情報をログに出力
        const errorInfo = {
          message: error?.message || 'Unknown error',
          details: error?.details || null,
          hint: error?.hint || null,
          code: error?.code || null,
          error: error
        }
        console.warn('Failed to fetch comments from Supabase, using localStorage fallback:', errorInfo)
        // エラー時はlocalStorageから取得したコメントを返す
        return localComments
      }
      
      // dataがnullまたは空配列の場合も処理
      if (data) {
        const comments = data.map((item: any) => ({
          id: item.id,
          reviewId: item.review_id,
          userId: item.user_id,
          authorName: item.author_name,
          isAnonymous: item.is_anonymous,
          content: item.content,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          sessionId: undefined, // Supabaseの場合はセッションID不要
        }))
        
        // localStorageにキャッシュとして保存
        cacheCommentsToLocalStorage(reviewId, comments)
        
        return comments
      }
      
      // dataがnullの場合はlocalStorageから取得したコメントを返す
      return localComments
    } catch (error: any) {
      // より詳細なエラー情報をログに出力
      const errorInfo = {
        message: error?.message || 'Unknown error',
        stack: error?.stack || null,
        error: error
      }
      console.warn('Error fetching comments from Supabase, using localStorage fallback:', errorInfo)
      // エラー時はlocalStorageから取得したコメントを返す
      return localComments
    }
  }
  
  // Supabaseが利用できない場合はlocalStorageから取得
  return localComments
}

// セッションIDを取得または生成（localStorage用の投稿者識別）
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  try {
    let sessionId = localStorage.getItem('comment_session_id')
    if (!sessionId) {
      // セッションIDが存在しない場合は生成
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      localStorage.setItem('comment_session_id', sessionId)
    }
    return sessionId
  } catch (error) {
    console.error('Error getting session ID:', error)
    return ''
  }
}

// localStorageからコメントを取得
function getCommentsFromLocalStorage(reviewId: number): Comment[] {
  if (typeof window === 'undefined') return []
  
  try {
    const key = `review_comments_${reviewId}`
    const savedComments = localStorage.getItem(key)
    if (savedComments) {
      return JSON.parse(savedComments)
    }
  } catch (error) {
    console.error('Error reading comments from localStorage:', error)
  }
  
  return []
}

// コメントを保存（Supabase優先、フォールバックはlocalStorage）
export async function saveComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
  if (isSupabaseAvailable()) {
    try {
      const supabase = createClient()
      
      // 現在のユーザーを取得
      const { data: { user } } = await supabase.auth.getUser()
      
      // Supabaseに保存する形式に変換
      const commentData: any = {
        review_id: comment.reviewId,
        user_id: comment.isAnonymous ? null : (user?.id || null),
        author_name: comment.authorName,
        is_anonymous: comment.isAnonymous,
        content: comment.content,
      }
      
      // 新しいコメントを作成
      const { data, error } = await supabase
        .from('review_comments')
        .insert(commentData)
        .select()
        .single()
      
      if (error) {
        console.error('Failed to insert comment to Supabase:', error)
        throw error
      }
      
      const newComment: Comment = {
        id: data.id,
        reviewId: data.review_id,
        userId: data.user_id,
        authorName: data.author_name,
        isAnonymous: data.is_anonymous,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        sessionId: data.user_id ? undefined : getOrCreateSessionId(), // 匿名コメントの場合はセッションIDを追加
      }
      
      // localStorageにも保存（キャッシュとして）
      addCommentToLocalStorage(newComment)
      
      return newComment
    } catch (error) {
      console.error('Error saving comment to Supabase:', error)
      // エラー時はlocalStorageに保存
      return saveCommentToLocalStorage(comment)
    }
  }
  
  // Supabaseが利用できない場合はlocalStorageに保存
  return saveCommentToLocalStorage(comment)
}

// localStorageにコメントを保存
function saveCommentToLocalStorage(comment: Omit<Comment, 'id' | 'createdAt'>): Comment {
  if (typeof window === 'undefined') {
    return {
      ...comment,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    }
  }
  
  try {
    // localStorageの場合はセッションIDを追加
    const sessionId = getOrCreateSessionId()
    const newComment: Comment = {
      ...comment,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      sessionId: sessionId, // localStorage用のセッションIDを追加
    }
    
    addCommentToLocalStorage(newComment)
    return newComment
  } catch (error) {
    console.error('Error saving comment to localStorage:', error)
    const sessionId = getOrCreateSessionId()
    return {
      ...comment,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      sessionId: sessionId,
    }
  }
}

// localStorageにコメントを追加
function addCommentToLocalStorage(comment: Comment): void {
  if (typeof window === 'undefined') return
  
  try {
    const key = `review_comments_${comment.reviewId}`
    const existingComments = getCommentsFromLocalStorage(comment.reviewId)
    const newComments = [...existingComments, comment]
    localStorage.setItem(key, JSON.stringify(newComments))
  } catch (error) {
    console.error('Error adding comment to localStorage:', error)
  }
}

// コメントをlocalStorageにキャッシュ
function cacheCommentsToLocalStorage(reviewId: number, comments: Comment[]): void {
  if (typeof window === 'undefined') return
  
  try {
    const key = `review_comments_${reviewId}`
    localStorage.setItem(key, JSON.stringify(comments))
  } catch (error) {
    console.error('Error caching comments to localStorage:', error)
  }
}

// コメントを削除
export async function deleteComment(commentId: number, reviewId: number): Promise<void> {
  // まずlocalStorageから削除（常に実行）
  deleteCommentFromLocalStorage(commentId, reviewId)
  
  if (isSupabaseAvailable()) {
    try {
      const supabase = createClient()
      
      // 現在のユーザーを取得して、削除権限を確認
      const { data: { user } } = await supabase.auth.getUser()
      
      // コメントを取得して、削除権限を確認
      const { data: commentData, error: fetchError } = await supabase
        .from('review_comments')
        .select('user_id')
        .eq('id', commentId)
        .single()
      
      if (fetchError) {
        console.warn('Could not fetch comment for permission check:', fetchError)
        // コメントが見つからない場合でも、localStorageからは削除済みなので成功とする
        return
      }
      
      // 削除権限チェック
      const canDelete = commentData && (
        (user && commentData.user_id === user.id) || // 自分のコメント
        commentData.user_id === null // 匿名コメント
      )
      
      if (!canDelete) {
        console.warn('No permission to delete comment, but removed from localStorage cache')
        // 権限がない場合でも、localStorageからは削除済みなので成功とする
        return
      }
      
      // Supabaseから削除
      const { error } = await supabase
        .from('review_comments')
        .delete()
        .eq('id', commentId)
      
      if (error) {
        console.error('Failed to delete comment from Supabase:', error)
        // Supabaseでの削除に失敗しても、localStorageからは削除済みなので成功とする
        // ただし、権限エラーの場合は警告を出す
        if (error.code === 'PGRST116' || error.message?.includes('permission') || error.message?.includes('policy') || error.message?.includes('row-level')) {
          console.warn('Permission denied for deleting comment, but removed from localStorage cache')
        }
        return
      }
    } catch (error: any) {
      console.error('Error deleting comment from Supabase:', error)
      // エラーが発生しても、localStorageからは削除済みなので成功とする
      // ユーザーには表示されない（UI上は削除済み）
      return
    }
  }
}

// localStorageからコメントを削除
function deleteCommentFromLocalStorage(commentId: number, reviewId: number): void {
  if (typeof window === 'undefined') return
  
  try {
    const key = `review_comments_${reviewId}`
    const existingComments = getCommentsFromLocalStorage(reviewId)
    const filteredComments = existingComments.filter((c: Comment) => c.id !== commentId)
    localStorage.setItem(key, JSON.stringify(filteredComments))
  } catch (error) {
    console.error('Error deleting comment from localStorage:', error)
  }
}
