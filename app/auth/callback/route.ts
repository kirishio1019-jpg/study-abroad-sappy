import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // エラーパラメータがある場合
  if (error) {
    console.error('❌ OAuth エラー:', error)
    console.error('エラー説明:', errorDescription)
    
    // エラーページにリダイレクト（またはホームにエラーメッセージ付きでリダイレクト）
    const redirectUrl = new URL('/', requestUrl.origin)
    redirectUrl.searchParams.set('auth_error', error)
    if (errorDescription) {
      redirectUrl.searchParams.set('error_message', errorDescription)
    }
    return NextResponse.redirect(redirectUrl)
  }

  // コードがある場合（正常なOAuthフロー）
  if (code) {
    try {
      console.log('✅ OAuth コールバックを受信しました')
      const supabase = await createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('❌ セッション交換エラー:', exchangeError)
        console.error('エラー詳細:', JSON.stringify(exchangeError, null, 2))
        
        // エラー情報をURLパラメータに含めてリダイレクト
        const redirectUrl = new URL('/', requestUrl.origin)
        redirectUrl.searchParams.set('auth_error', 'exchange_failed')
        redirectUrl.searchParams.set('error_message', exchangeError.message || 'セッションの交換に失敗しました')
        return NextResponse.redirect(redirectUrl)
      }
      
      if (data?.session) {
        console.log('✅ セッションが正常に作成されました')
        console.log('👤 ユーザーID:', data.session.user.id)
      }
    } catch (error) {
      console.error('❌ 予期しないエラー:', error)
      console.error('エラー詳細:', JSON.stringify(error, null, 2))
      
      // エラーが発生した場合もリダイレクト（環境変数未設定の場合など）
      const redirectUrl = new URL('/', requestUrl.origin)
      redirectUrl.searchParams.set('auth_error', 'unexpected_error')
      redirectUrl.searchParams.set('error_message', error instanceof Error ? error.message : '予期しないエラーが発生しました')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // 正常に認証が完了した場合、ホームページにリダイレクト
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}

