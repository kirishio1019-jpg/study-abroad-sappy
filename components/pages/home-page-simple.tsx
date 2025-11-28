"use client"

export default function HomePageSimple() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-card via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                あなたはどこを選ぶ？
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              先輩のリアルな留学体験にアクセス。自分の条件に近い声を探して、最適な留学先を見つけよう。
            </p>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">最新レビュー</h2>
          <p className="text-muted-foreground mb-8">新しく投稿された体験談をチェック</p>
          <div className="bg-card border border-border rounded-lg p-8">
            <p className="text-muted-foreground">まだレビューがありません。</p>
            <p className="text-sm text-muted-foreground mt-2">最初のレビューを投稿してみましょう！</p>
          </div>
        </div>
      </section>
    </div>
  )
}


