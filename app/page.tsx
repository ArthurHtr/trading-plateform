// app/page.tsx

export default function HomePage() {
  return (
    <main className="w-full py-10 px-6 sm:px-10">
      <section className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Trading Platform
        </h1>
        <p className="text-sm text-muted-foreground">
          Plateforme de trading avec API et SDK. Connecte-toi pour gérer tes
          clés API et visualiser tes données.
        </p>
        <p className="text-sm text-muted-foreground">
          Utilise la navigation en haut pour te connecter ou créer un compte.
        </p>
      </section>
    </main>
  )
}

