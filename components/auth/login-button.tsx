"use client"

import { useState, useEffect } from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"

export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // 環境変数が設定されているかチェック
    setIsConfigured(isSupabaseConfigured())
  }, [])

  const handleGoogleLogin = async () => {
    if (!isConfigured) {
      alert('Supabase環境変数が設定されていません。管理者にお問い合わせください。')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      
      // リダイレクトURIを動的に生成（デプロイ環境に対応）
      const redirectTo = `${window.location.origin}/auth/callback`
      
      console.log('🔐 Googleログインを開始します...')
      console.log('📍 リダイレクトURI:', redirectTo)
      console.log('🌐 現在のURL:', window.location.href)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      
      if (error) {
        console.error('❌ ログインエラー:', error)
        console.error('エラー詳細:', JSON.stringify(error, null, 2))
        
        // エラーメッセージをより分かりやすく
        let errorMessage = 'ログインに失敗しました。'
        
        if (error.message?.includes('redirect_uri_mismatch')) {
          errorMessage = 'リダイレクトURIの設定が間違っています。\n\n' +
            '以下のURLをGoogle Cloud Consoleの「承認済みのリダイレクト URI」に追加してください：\n' +
            redirectTo + '\n\n' +
            '詳しくは、DEPLOY_GOOGLE_LOGIN_SETUP.mdを参照してください。'
        } else if (error.message?.includes('provider is not enabled')) {
          errorMessage = 'Google認証プロバイダーが有効になっていません。\n\n' +
            'SupabaseダッシュボードでGoogle認証を有効にしてください。'
        } else {
          errorMessage = 'ログインに失敗しました: ' + error.message
        }
        
        alert(errorMessage)
      } else if (data?.url) {
        // OAuthフローが開始された場合、リダイレクトは自動的に行われる
        console.log('✅ OAuthフローが開始されました')
        // リダイレクトは自動的に行われるため、ここでは何もしない
      }
    } catch (error: any) {
      console.error('❌ 予期しないエラー:', error)
      console.error('エラー詳細:', JSON.stringify(error, null, 2))
      
      let errorMessage = 'ログイン中にエラーが発生しました。'
      
      if (error?.message?.includes('環境変数')) {
        errorMessage = 'Supabase環境変数が設定されていません。管理者にお問い合わせください。'
      } else if (error?.message) {
        errorMessage = 'エラー: ' + error.message
      }
      
      alert(errorMessage)
    } finally {
      // OAuthフローが開始された場合、リダイレクトされるため、ローディング状態を維持
      // ただし、エラーの場合はローディングを解除
      // 注意: 成功時はリダイレクトされるため、このfinallyブロックは実行されない可能性がある
    }
  }

  // 環境変数が設定されていない場合はボタンを非表示にする
  // （ログイン機能を使わない場合は、このボタンは不要）
  if (!isConfigured) {
    return null
  }

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white text-gray-900 rounded-lg hover:opacity-90 transition-opacity font-medium text-xs sm:text-sm border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="hidden sm:inline">ログイン中...</span>
        </>
      ) : (
        <>
          <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="whitespace-nowrap">Googleでログイン</span>
        </>
      )}
    </button>
  )
}

