"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import HomePage from "@/components/pages/home-page"
import SearchPage from "@/components/pages/search-page"
import ReviewFormPage from "@/components/pages/review-form-page"
import QuestionsPage from "@/components/pages/questions-page"
import ComparisonPage from "@/components/pages/comparison-page"
import DetailPage from "@/components/pages/detail-page"
import MyReviewsPage from "@/components/pages/my-reviews-page"

export default function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null)
  const [editReviewId, setEditReviewId] = useState<number | null>(null)
  const [searchFilters, setSearchFilters] = useState<{ country?: string; region?: string } | null>(null)
  const [isClient, setIsClient] = useState(false)

  // クライアントサイドでのみlocalStorageから復元
  useEffect(() => {
    setIsClient(true)
    
    try {
      const savedPage = localStorage.getItem('currentPage')
      if (savedPage) {
        setCurrentPage(savedPage)
      }
      const savedReviewId = localStorage.getItem('selectedReviewId')
      if (savedReviewId) {
        setSelectedReviewId(Number.parseInt(savedReviewId))
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error)
    }
  }, [])

  // ページ状態をlocalStorageに保存
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('currentPage', currentPage)
    }
  }, [currentPage, isClient])

  useEffect(() => {
    if (isClient) {
      if (selectedReviewId !== null) {
        localStorage.setItem('selectedReviewId', selectedReviewId.toString())
      } else {
        localStorage.removeItem('selectedReviewId')
      }
    }
  }, [selectedReviewId, isClient])

  // レビュー詳細ページへの遷移イベントをリッスン
  useEffect(() => {
    if (!isClient) return

    const handleReviewDetailClick = (e: Event) => {
      const customEvent = e as CustomEvent<{ reviewId: number }>
      setSelectedReviewId(customEvent.detail.reviewId)
      setCurrentPage('detail')
    }

    const handlePageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ page: string; reviewId?: number; filters?: { country?: string; region?: string } }>
      setCurrentPage(customEvent.detail.page)
      if (customEvent.detail.page === 'search' && customEvent.detail.filters) {
        // 検索ページに遷移する際にフィルターを設定
        setSearchFilters(customEvent.detail.filters)
      } else {
        setSearchFilters(null)
      }
      if (customEvent.detail.page !== 'detail' && customEvent.detail.page !== 'edit-review') {
        setSelectedReviewId(null)
        setEditReviewId(null)
      } else if (customEvent.detail.page === 'edit-review' && customEvent.detail.reviewId) {
        setEditReviewId(customEvent.detail.reviewId)
      }
    }

    window.addEventListener('reviewDetailClick', handleReviewDetailClick as EventListener)
    window.addEventListener('pageChange', handlePageChange as EventListener)

    return () => {
      window.removeEventListener('reviewDetailClick', handleReviewDetailClick as EventListener)
      window.removeEventListener('pageChange', handlePageChange as EventListener)
    }
  }, [isClient])

  const renderPage = () => {
    switch (currentPage) {
      case "search":
        return <SearchPage initialFilters={searchFilters} />
      case "post-review":
        return <ReviewFormPage onPageChange={setCurrentPage} />
      case "edit-review":
        return <ReviewFormPage onPageChange={setCurrentPage} editReviewId={editReviewId || undefined} />
      case "questions":
        return <QuestionsPage />
      case "comparison":
        return <ComparisonPage />
      case "my-reviews":
        return <MyReviewsPage />
      case "detail":
        return selectedReviewId ? <DetailPage reviewId={selectedReviewId} /> : <HomePage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </div>
  )
}


