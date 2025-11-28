// レビューの保存・取得を行う共通関数
import { createClient } from '@/lib/supabase/client'

export interface Review {
  id: number
  userId?: string
  country: string
  university: string
  universityId?: string
  title: string
  satisfaction: number
  cost: number
  language?: string
  author: string
  date: string
  excerpt?: string
  strongFields?: string[]
  region?: string
  // 詳細情報
  major?: string
  studyMajor?: string
  selectionReason?: string
  startDate?: string
  startYear?: string
  endDate?: string
  endYear?: string
  vacationPeriod?: string
  creditsEarned?: string
  creditsTransferred?: string
  credits300Level?: string
  languageCert?: string
  languageScore?: string
  classLanguage?: string
  costOfLiving?: string
  costOfLivingNote?: string
  foodCost?: string
  rent?: string
  culturalImpression?: string
  safety?: string
  climate?: string
  dailyMeals?: string
  accommodation?: string
  extracurricularActivities?: string
  extracurricularActivitiesNote?: string
  positives?: string
  challenges?: string
}

// Supabaseが設定されているかチェック
function isSupabaseAvailable(): boolean {
  if (typeof window === 'undefined') return false
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isAvailable = !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key' &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('placeholder')
  )
  
  // デバッグ情報（開発環境のみ）
  if (process.env.NODE_ENV === 'development' && !isAvailable) {
    console.warn('Supabase is not configured. Using localStorage fallback.')
  }
  
  return isAvailable
}

// SupabaseのデータをReview形式に変換
function convertSupabaseReviewToReview(item: any): Review {
  return {
    id: item.id,
    userId: item.user_id,
    country: item.country,
    university: item.university,
    universityId: item.university_id,
    title: item.title,
    satisfaction: Number.parseFloat(item.satisfaction || '5.0'),
    cost: item.cost || 0,
    language: item.language || '',
    author: item.author,
    date: item.date,
    excerpt: item.excerpt || '',
    strongFields: item.strong_fields || [],
    region: item.region,
    major: item.major,
    studyMajor: item.study_major,
    selectionReason: item.selection_reason,
    startDate: item.start_date,
    startYear: item.start_year,
    endDate: item.end_date,
    endYear: item.end_year,
    vacationPeriod: item.vacation_period,
    creditsEarned: item.credits_earned,
    creditsTransferred: item.credits_transferred,
    credits300Level: item.credits_300_level,
    languageCert: item.language_cert,
    languageScore: item.language_score,
    classLanguage: item.class_language,
    costOfLiving: item.cost_of_living,
    costOfLivingNote: item.cost_of_living_note,
    foodCost: item.food_cost,
    rent: item.rent,
    culturalImpression: item.cultural_impression,
    safety: item.safety,
    climate: item.climate,
    dailyMeals: item.daily_meals,
    accommodation: item.accommodation,
    extracurricularActivities: item.extracurricular_activities,
    extracurricularActivitiesNote: item.extracurricular_activities_note,
    positives: item.positives,
    challenges: item.challenges,
  }
}

// すべてのレビューを取得（Supabase優先、フォールバックはlocalStorage）
export async function getAllReviews(): Promise<Review[]> {
  if (isSupabaseAvailable()) {
    try {
      const supabase = createClient()
      
      // Supabase接続をテスト
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        // より詳細なエラー情報をログに出力
        console.error('❌ Failed to fetch reviews from Supabase:', {
          message: error.message || 'Unknown error',
          details: error.details || 'No details',
          hint: error.hint || 'No hint',
          code: error.code || 'No code',
        })
        console.log('📦 Falling back to localStorage...')
        // エラー時はlocalStorageにフォールバック
        const localReviews = getReviewsFromLocalStorage()
        console.log(`📦 Found ${localReviews.length} reviews in localStorage`)
        return localReviews
      }
      
      // dataがnullまたは空配列の場合も処理
      if (data && Array.isArray(data)) {
        if (data.length > 0) {
          // SupabaseのデータをReview形式に変換
          const reviews = data.map(convertSupabaseReviewToReview)
          
          // デバッグログ（本番環境でも出力）
          console.log(`✅ Loaded ${reviews.length} reviews from Supabase`)
          
          // localStorageの古いキャッシュをクリアしてから新しいデータを保存
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('reviews') // 古いキャッシュをクリア
              localStorage.setItem('reviews', JSON.stringify(reviews))
              localStorage.setItem('reviews_last_loaded', Date.now().toString()) // 読み込み時刻を記録
              console.log(`✅ Cached ${reviews.length} reviews to localStorage`)
            } catch (localStorageError) {
              console.warn('Failed to save reviews to localStorage:', localStorageError)
              // localStorageへの保存が失敗しても、データは返す
            }
          }
          
          return reviews
        } else {
          // dataが空配列の場合
          console.warn('⚠️ Supabase returned empty array (no reviews found)')
        }
      } else {
        // dataがnullまたはundefinedの場合
        console.warn('⚠️ Supabase returned null or undefined data:', data)
      }
      
      // dataが空の場合は、localStorageから取得を試みる（フォールバック）
      console.log('📦 Checking localStorage for cached reviews...')
      const localReviews = getReviewsFromLocalStorage()
      if (localReviews.length > 0) {
        console.log(`⚠️ Using ${localReviews.length} reviews from localStorage (fallback)`)
        return localReviews
      }
      
      // どちらも空の場合は空配列を返す
      console.warn('❌ No reviews found in Supabase or localStorage')
      return []
    } catch (error: any) {
      // より詳細なエラー情報をログに出力
      console.warn('Exception while fetching reviews from Supabase, falling back to localStorage:', {
        message: error?.message || 'Unknown error',
        name: error?.name || 'Unknown',
        stack: error?.stack || 'No stack trace',
        errorType: typeof error,
        errorString: String(error),
        errorObject: error,
      })
      // エラー時はlocalStorageにフォールバック
      return getReviewsFromLocalStorage()
    }
  }
  
  // Supabaseが利用できない場合はlocalStorageから取得
  return getReviewsFromLocalStorage()
}

// IDでレビューを取得
export async function getReviewById(reviewId: number): Promise<Review | null> {
  if (isSupabaseAvailable()) {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single()
      
      if (error) {
        console.warn('Failed to fetch review by ID from Supabase, falling back to getAllReviews:', {
          message: error.message || 'Unknown error',
          details: error.details || 'No details',
          hint: error.hint || 'No hint',
          code: error.code || 'No code',
        })
        // エラー時はgetAllReviewsから検索
        const reviews = await getAllReviews()
        return reviews.find(r => r.id === reviewId) || null
      }
      
      if (data) {
        return convertSupabaseReviewToReview(data)
      }
      
      return null
    } catch (error: any) {
      console.warn('Exception while fetching review by ID from Supabase, falling back to getAllReviews:', {
        message: error?.message || 'Unknown error',
      })
      // エラー時はgetAllReviewsから検索
      const reviews = await getAllReviews()
      return reviews.find(r => r.id === reviewId) || null
    }
  }
  
  // Supabaseが利用できない場合はlocalStorageから検索
  const reviews = getReviewsFromLocalStorage()
  return reviews.find(r => r.id === reviewId) || null
}

// localStorageからレビューを取得
function getReviewsFromLocalStorage(): Review[] {
  if (typeof window === 'undefined') return []
  
  try {
    const savedReviews = localStorage.getItem('reviews')
    if (savedReviews) {
      return JSON.parse(savedReviews)
    }
  } catch (error) {
    console.error('Error reading reviews from localStorage:', error)
  }
  
  return []
}

// レビューを保存（Supabase優先、フォールバックはlocalStorage）
export async function saveReview(review: Review): Promise<Review> {
  if (isSupabaseAvailable()) {
    try {
      const supabase = createClient()
      
      // 現在のユーザーを取得
      const { data: { user } } = await supabase.auth.getUser()
      
      // Supabaseに保存する形式に変換
      const reviewData: any = {
        user_id: user?.id || null,
        author: review.author,
        country: review.country,
        university: review.university,
        university_id: review.universityId || null,
        region: review.region || null,
        title: review.title,
        satisfaction: review.satisfaction,
        cost: review.cost || 0,
        language: review.language || null,
        date: review.date,
        excerpt: review.excerpt || '',
        strong_fields: review.strongFields || [],
        major: review.major || null,
        study_major: review.studyMajor || null,
        selection_reason: review.selectionReason || null,
        start_date: review.startDate || null,
        start_year: review.startYear || null,
        end_date: review.endDate || null,
        end_year: review.endYear || null,
        vacation_period: review.vacationPeriod || null,
        credits_earned: review.creditsEarned || null,
        credits_transferred: review.creditsTransferred || null,
        credits_300_level: review.credits300Level || null,
        language_cert: review.languageCert || null,
        language_score: review.languageScore || null,
        class_language: review.classLanguage || null,
        cost_of_living: review.costOfLiving || null,
        cost_of_living_note: review.costOfLivingNote || null,
        food_cost: review.foodCost || null,
        rent: review.rent || null,
        cultural_impression: review.culturalImpression || null,
        safety: review.safety || null,
        climate: review.climate || null,
        daily_meals: review.dailyMeals || null,
        accommodation: review.accommodation || null,
        extracurricular_activities: review.extracurricularActivities || null,
        extracurricular_activities_note: review.extracurricularActivitiesNote || null,
        positives: review.positives || null,
        challenges: review.challenges || null,
      }
      
      // 既存のレビューを更新する場合
      if (review.id && review.id > 0) {
        const { data, error } = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', review.id)
          .select()
          .single()
        
        if (error) {
          console.error('Failed to update review in Supabase:', error)
          throw error
        }
        
        const updatedReview = {
          ...review,
          id: data.id,
          userId: data.user_id,
        }
        
        // localStorageも更新
        updateLocalStorageReview(updatedReview)
        
        return updatedReview
      } else {
        // 新しいレビューを作成
        const { data, error } = await supabase
          .from('reviews')
          .insert(reviewData)
          .select()
          .single()
        
        if (error) {
          console.error('Failed to insert review to Supabase:', error)
          throw error
        }
        
        const newReview = {
          ...review,
          id: data.id,
          userId: data.user_id,
        }
        
        // localStorageにも保存
        addReviewToLocalStorage(newReview)
        
        return newReview
      }
    } catch (error) {
      console.error('Error saving review to Supabase:', error)
      // エラー時はlocalStorageに保存
      return saveReviewToLocalStorage(review)
    }
  }
  
  // Supabaseが利用できない場合はlocalStorageに保存
  return saveReviewToLocalStorage(review)
}

// localStorageにレビューを保存
function saveReviewToLocalStorage(review: Review): Review {
  if (typeof window === 'undefined') return review
  
  try {
    const existingReviews = getReviewsFromLocalStorage()
    
    if (review.id && review.id > 0) {
      // 既存のレビューを更新
      updateLocalStorageReview(review)
    } else {
      // 新しいレビューを作成
      const newReview = {
        ...review,
        id: review.id || Date.now(),
      }
      addReviewToLocalStorage(newReview)
      return newReview
    }
  } catch (error) {
    console.error('Error saving review to localStorage:', error)
  }
  
  return review
}

// localStorageにレビューを追加
function addReviewToLocalStorage(review: Review): void {
  if (typeof window === 'undefined') return
  
  try {
    const existingReviews = getReviewsFromLocalStorage()
    const newReviews = [review, ...existingReviews]
    localStorage.setItem('reviews', JSON.stringify(newReviews))
  } catch (error) {
    console.error('Error adding review to localStorage:', error)
  }
}

// localStorageのレビューを更新
function updateLocalStorageReview(review: Review): void {
  if (typeof window === 'undefined') return
  
  try {
    const existingReviews = getReviewsFromLocalStorage()
    const updatedReviews = existingReviews.map((r: Review) => 
      r.id === review.id ? review : r
    )
    localStorage.setItem('reviews', JSON.stringify(updatedReviews))
  } catch (error) {
    console.error('Error updating review in localStorage:', error)
  }
}

// レビューを削除
export async function deleteReview(reviewId: number): Promise<void> {
  if (isSupabaseAvailable()) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
      
      if (error) {
        console.error('Failed to delete review from Supabase:', error)
        throw error
      }
    } catch (error) {
      console.error('Error deleting review from Supabase:', error)
      // エラー時はlocalStorageから削除
      deleteReviewFromLocalStorage(reviewId)
      return
    }
  }
  
  // Supabaseが利用できない場合はlocalStorageから削除
  deleteReviewFromLocalStorage(reviewId)
}

// localStorageからレビューを削除
function deleteReviewFromLocalStorage(reviewId: number): void {
  if (typeof window === 'undefined') return
  
  try {
    const existingReviews = getReviewsFromLocalStorage()
    const filteredReviews = existingReviews.filter((r: Review) => r.id !== reviewId)
    localStorage.setItem('reviews', JSON.stringify(filteredReviews))
  } catch (error) {
    console.error('Error deleting review from localStorage:', error)
  }
}

// localStorageのレビューをSupabaseに移行
export async function migrateReviewsFromLocalStorage(): Promise<void> {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase is not available, cannot migrate reviews')
    return
  }
  
  if (typeof window === 'undefined') return
  
  try {
    const localReviews = getReviewsFromLocalStorage()
    if (localReviews.length === 0) return
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // 既存のレビューをチェック（重複を避けるため）
    const { data: existingReviews } = await supabase
      .from('reviews')
      .select('id')
    
    const existingIds = new Set(existingReviews?.map((r: any) => r.id) || [])
    
    // localStorageのレビューをSupabaseに移行
    for (const review of localReviews) {
      // 既にSupabaseにある場合はスキップ
      if (existingIds.has(review.id)) continue
      
      // Supabaseに保存
      const reviewData: any = {
        user_id: user?.id || review.userId || null,
        author: review.author,
        country: review.country,
        university: review.university,
        university_id: review.universityId || null,
        region: review.region || null,
        title: review.title,
        satisfaction: review.satisfaction,
        cost: review.cost || 0,
        language: review.language || null,
        date: review.date,
        excerpt: review.excerpt || '',
        strong_fields: review.strongFields || [],
        major: review.major || null,
        study_major: review.studyMajor || null,
        selection_reason: review.selectionReason || null,
        start_date: review.startDate || null,
        start_year: review.startYear || null,
        end_date: review.endDate || null,
        end_year: review.endYear || null,
        vacation_period: review.vacationPeriod || null,
        credits_earned: review.creditsEarned || null,
        credits_transferred: review.creditsTransferred || null,
        credits_300_level: review.credits300Level || null,
        language_cert: review.languageCert || null,
        language_score: review.languageScore || null,
        class_language: review.classLanguage || null,
        cost_of_living: review.costOfLiving || null,
        cost_of_living_note: review.costOfLivingNote || null,
        food_cost: review.foodCost || null,
        rent: review.rent || null,
        cultural_impression: review.culturalImpression || null,
        safety: review.safety || null,
        climate: review.climate || null,
        daily_meals: review.dailyMeals || null,
        accommodation: review.accommodation || null,
        extracurricular_activities: review.extracurricularActivities || null,
        extracurricular_activities_note: review.extracurricularActivitiesNote || null,
        positives: review.positives || null,
        challenges: review.challenges || null,
      }
      
      await supabase
        .from('reviews')
        .insert(reviewData)
    }
    
    console.log(`Migrated ${localReviews.length} reviews from localStorage to Supabase`)
  } catch (error) {
    console.error('Error migrating reviews from localStorage:', error)
  }
}
