import { getSession } from "@/server/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, BarChart2, Zap, Code2, CheckCircle2, Copy, Eye } from "lucide-react";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect("/backtests");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
              v1.0 Public Beta
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Backtestez vos stratégies <br className="hidden md:block" />
              <span className="text-primary">Python</span> en quelques minutes
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Une infrastructure puissante pour vos algorithmes de trading. 
              Codez en local, déployez en un clic, et analysez vos performances avec des outils institutionnels.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                <Link href="/auth/sign-up">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                <Link href="https://github.com/ArthurHtr" target="_blank">
                  Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 opacity-40 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-multiply animate-blob" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
        </div>
      </section>

      {/* Code Showcase Section */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col gap-12 items-center">
            <div className="space-y-8 w-full max-w-5xl">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-3xl font-bold tracking-tight">Simple</h2>
                <p className="text-muted-foreground text-lg">
                  Notre librairie open-source est conçue pour être intuitive. Importez la, définissez votre logique, et lancez votre backtest.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Installation rapide</h3>
                    <p className="text-sm text-muted-foreground mb-3">Installez le package via pip</p>
                    <div className="flex items-center justify-between bg-black/90 text-white p-3 rounded-md font-mono text-sm border border-white/10 shadow-sm">
                      <span>pip install trade-tp</span>
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-white cursor-pointer transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">API Intuitive</h3>
                    <p className="text-sm text-muted-foreground">
                      Accédez aux données OHLCV pour une variété de symboles. Placez vos ordres en quelques lignes de code sans vous soucier de l'infrastructure. Le broker virtuel s'occupe de tout.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Editor Mockups */}
            <div className="flex flex-col gap-12 w-full max-w-5xl">
              {/* Step 1: Strategy Code */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">1</div>
                  <h3 className="text-xl font-semibold">Codez votre stratégie</h3>
                </div>
                <div className="relative rounded-xl overflow-hidden bg-[#1e1e1e] shadow-2xl border border-white/10 flex flex-col">
                <div className="flex items-center px-4 py-3 bg-[#252526] border-b border-white/5 justify-between shrink-0">
                  <div className="flex items-center">
                    <div className="flex space-x-2 mr-4">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    </div>
                    <div className="text-xs text-gray-400 font-mono">strategy/sma_strategy.py</div>
                  </div>
                </div>
                <div className="p-6 overflow-x-auto flex-1">
                  <pre className="font-mono text-xs leading-relaxed">
                    <code className="text-gray-300">
                      <span className="text-[#c586c0]">from</span> typing <span className="text-[#c586c0]">import</span> List, Dict{'\n'}
                      <span className="text-[#c586c0]">from</span> trade_tp.backtest_engine.strategy.base <span className="text-[#c586c0]">import</span> BaseStrategy{'\n'}
                      <span className="text-[#c586c0]">from</span> trade_tp.backtest_engine.strategy.context <span className="text-[#c586c0]">import</span> StrategyContext{'\n'}
                      <span className="text-[#c586c0]">from</span> trade_tp.backtest_engine.entities.order_intent <span className="text-[#c586c0]">import</span> OrderIntent{'\n'}
                      <span className="text-[#c586c0]">from</span> trade_tp.backtest_engine.entities.enums <span className="text-[#c586c0]">import</span> Side, PositionSide{'\n'}
                      {'\n'}
                      <span className="text-[#569cd6]">class</span> <span className="text-[#4ec9b0]">SmaStrategy</span>(BaseStrategy):{'\n'}
                      {'    '}<span className="text-[#ce9178]">"""{'\n'}
                      {'    '}Stratégie de croisement de moyennes mobiles simples (SMA).{'\n'}
                      {'    '}"""</span>{'\n'}
                      {'\n'}
                      {'    '}<span className="text-[#569cd6]">def</span> <span className="text-[#dcdcaa]">__init__</span>({'\n'}
                      {'        '}<span className="text-[#9cdcfe]">self</span>,{'\n'}
                      {'        '}<span className="text-[#9cdcfe]">short_period</span>: <span className="text-[#4ec9b0]">int</span> = <span className="text-[#b5cea8]">20</span>,{'\n'}
                      {'        '}<span className="text-[#9cdcfe]">long_period</span>: <span className="text-[#4ec9b0]">int</span> = <span className="text-[#b5cea8]">50</span>,{'\n'}
                      {'        '}<span className="text-[#9cdcfe]">quantity</span>: <span className="text-[#4ec9b0]">float</span> = <span className="text-[#b5cea8]">1.0</span>{'\n'}
                      {'    '}):{'\n'}
                      {'        '}<span className="text-[#9cdcfe]">self</span>.short_period = short_period{'\n'}
                      {'        '}<span className="text-[#9cdcfe]">self</span>.long_period = long_period{'\n'}
                      {'        '}<span className="text-[#9cdcfe]">self</span>.quantity = quantity{'\n'}
                      {'\n'}
                      {'    '}<span className="text-[#569cd6]">def</span> <span className="text-[#dcdcaa]">_calculate_sma</span>(<span className="text-[#9cdcfe]">self</span>, <span className="text-[#9cdcfe]">data</span>: List[<span className="text-[#4ec9b0]">float</span>], <span className="text-[#9cdcfe]">period</span>: <span className="text-[#4ec9b0]">int</span>) -{'>'} <span className="text-[#4ec9b0]">float</span>:{'\n'}
                      {'        '}<span className="text-[#c586c0]">if</span> <span className="text-[#dcdcaa]">len</span>(data) {'<'} period:{'\n'}
                      {'            '}<span className="text-[#c586c0]">return</span> <span className="text-[#569cd6]">None</span>{'\n'}
                      {'        '}<span className="text-[#c586c0]">return</span> <span className="text-[#dcdcaa]">sum</span>(data[-period:]) / period{'\n'}
                      {'\n'}
                      {'    '}<span className="text-[#569cd6]">def</span> <span className="text-[#dcdcaa]">on_bar</span>(<span className="text-[#9cdcfe]">self</span>, <span className="text-[#9cdcfe]">context</span>: StrategyContext) -{'>'} List[OrderIntent]:{'\n'}
                      {'        '}order_intents = []{'\n'}
                      {'        '}<span className="text-[#c586c0]">for</span> symbol <span className="text-[#c586c0]">in</span> context.candle.keys():{'\n'}
                      {'            '}<span className="text-[#6a9955]"># Récupération des données historiques</span>{'\n'}
                      {'            '}lookback = <span className="text-[#9cdcfe]">self</span>.long_period + <span className="text-[#b5cea8]">5</span>{'\n'}
                      {'            '}closes = context.<span className="text-[#dcdcaa]">get_series</span>(symbol, <span className="text-[#ce9178]">"close"</span>, limit=lookback){'\n'}
                      {'\n'}
                      {'            '}<span className="text-[#c586c0]">if</span> <span className="text-[#dcdcaa]">len</span>(closes) {'<'} lookback:{'\n'}
                      {'                '}<span className="text-[#c586c0]">continue</span>{'\n'}
                      {'\n'}
                      {'            '}<span className="text-[#6a9955]"># SMA actuelles (t)</span>{'\n'}
                      {'            '}sma_short = <span className="text-[#9cdcfe]">self</span>.<span className="text-[#dcdcaa]">_calculate_sma</span>(closes, <span className="text-[#9cdcfe]">self</span>.short_period){'\n'}
                      {'            '}sma_long = <span className="text-[#9cdcfe]">self</span>.<span className="text-[#dcdcaa]">_calculate_sma</span>(closes, <span className="text-[#9cdcfe]">self</span>.long_period){'\n'}
                      {'\n'}
                      {'            '}<span className="text-[#c586c0]">if</span> sma_short <span className="text-[#c586c0]">is</span> <span className="text-[#569cd6]">None</span> <span className="text-[#c586c0]">or</span> sma_long <span className="text-[#c586c0]">is</span> <span className="text-[#569cd6]">None</span>:{'\n'}
                      {'                '}<span className="text-[#c586c0]">continue</span>{'\n'}
                      {'\n'}
                      {'            '}<span className="text-[#6a9955]"># SMA précédentes (t-1)</span>{'\n'}
                      {'            '}sma_short_prev = <span className="text-[#9cdcfe]">self</span>.<span className="text-[#dcdcaa]">_calculate_sma</span>(closes[:-<span className="text-[#b5cea8]">1</span>], <span className="text-[#9cdcfe]">self</span>.short_period){'\n'}
                      {'            '}sma_long_prev = <span className="text-[#9cdcfe]">self</span>.<span className="text-[#dcdcaa]">_calculate_sma</span>(closes[:-<span className="text-[#b5cea8]">1</span>], <span className="text-[#9cdcfe]">self</span>.long_period){'\n'}
                      {'\n'}
                      {'            '}<span className="text-[#6a9955]"># Enregistrement pour visualisation</span>{'\n'}
                      {'            '}context.<span className="text-[#dcdcaa]">record</span>(<span className="text-[#ce9178]">f"SMA {'{'}<span className="text-[#9cdcfe]">self</span>.short_period{'}'}"</span>, sma_short, symbol=symbol){'\n'}
                      {'            '}context.<span className="text-[#dcdcaa]">record</span>(<span className="text-[#ce9178]">f"SMA {'{'}<span className="text-[#9cdcfe]">self</span>.long_period{'}'}"</span>, sma_long, symbol=symbol){'\n'}
                      {'\n'}
                      {'            '}<span className="text-[#6a9955]"># Logique de trading</span>{'\n'}
                      {'            '}position = context.<span className="text-[#dcdcaa]">get_position</span>(symbol){'\n'}
                      {'            '}current_qty = <span className="text-[#b5cea8]">0.0</span>{'\n'}
                      {'            '}<span className="text-[#c586c0]">if</span> position:{'\n'}
                      {'                '}<span className="text-[#c586c0]">if</span> position.side == PositionSide.LONG:{'\n'}
                      {'                    '}current_qty = position.quantity{'\n'}
                      {'                '}<span className="text-[#c586c0]">elif</span> position.side == PositionSide.SHORT:{'\n'}
                      {'                    '}current_qty = -position.quantity{'\n'}
                      {'\n'}
                      {'            '}<span className="text-[#6a9955]"># Golden Cross (Achat)</span>{'\n'}
                      {'            '}<span className="text-[#c586c0]">if</span> sma_short_prev {'<='} sma_long_prev <span className="text-[#c586c0]">and</span> sma_short {'>'} sma_long:{'\n'}
                      {'                '}qty_to_trade = <span className="text-[#9cdcfe]">self</span>.quantity - current_qty{'\n'}
                      {'                '}<span className="text-[#c586c0]">if</span> qty_to_trade {'>'} <span className="text-[#b5cea8]">0</span>:{'\n'}
                      {'                    '}order_intents.<span className="text-[#dcdcaa]">append</span>(OrderIntent(symbol, Side.BUY, <span className="text-[#dcdcaa]">abs</span>(qty_to_trade))){'\n'}
                      {'\n'}
                      {'            '}<span className="text-[#6a9955]"># Death Cross (Vente)</span>{'\n'}
                      {'            '}<span className="text-[#c586c0]">elif</span> sma_short_prev {'>='} sma_long_prev <span className="text-[#c586c0]">and</span> sma_short {'<'} sma_long:{'\n'}
                      {'                '}target = -<span className="text-[#9cdcfe]">self</span>.quantity{'\n'}
                      {'                '}qty_to_trade = target - current_qty{'\n'}
                      {'                '}<span className="text-[#c586c0]">if</span> qty_to_trade {'<'} <span className="text-[#b5cea8]">0</span>:{'\n'}
                      {'                    '}order_intents.<span className="text-[#dcdcaa]">append</span>(OrderIntent(symbol, Side.SELL, <span className="text-[#dcdcaa]">abs</span>(qty_to_trade))){'\n'}
                      {'\n'}
                      {'        '}<span className="text-[#c586c0]">return</span> order_intents
                    </code>
                  </pre>
                </div>
              </div>

              </div>

              {/* Step 2: Main Code */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">2</div>
                  <h3 className="text-xl font-semibold">Lancez le backtest</h3>
                </div>
                <div className="relative rounded-xl overflow-hidden bg-[#1e1e1e] shadow-2xl border border-white/10 flex flex-col">
                <div className="flex items-center px-4 py-3 bg-[#252526] border-b border-white/5 shrink-0">
                  <div className="flex space-x-2 mr-4">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="text-xs text-gray-400 font-mono">main.py</div>
                </div>
                <div className="p-6 overflow-x-auto flex-1">
                  <pre className="font-mono text-xs leading-relaxed">
                    <code className="text-gray-300">
                      <span className="text-[#c586c0]">from</span> trade_tp <span className="text-[#c586c0]">import</span> run_backtest{'\n'}
                      <span className="text-[#c586c0]">from</span> strategy.sma_strategy <span className="text-[#c586c0]">import</span> SmaStrategy{'\n'}
                      {'\n'}
                      <span className="text-[#6a9955]"># ID généré depuis la plateforme</span>{'\n'}
                      RUN_ID = <span className="text-[#ce9178]">"cmjiivqaq000hk96jacpkt27j"</span>{'\n'}
                      {'\n'}
                      <span className="text-[#c586c0]">if</span> __name__ == <span className="text-[#ce9178]">"__main__"</span>:{'\n'}
                      {'    '}strategy = <span className="text-[#4ec9b0]">SmaStrategy</span>(short=<span className="text-[#b5cea8]">20</span>, long=<span className="text-[#b5cea8]">50</span>){'\n'}
                      {'\n'}
                      {'    '}<span className="text-[#dcdcaa]">run_backtest</span>({'\n'}
                      {'        '}run_id=RUN_ID,{'\n'}
                      {'        '}api_key=<span className="text-[#ce9178]">"YOUR_API_KEY"</span>,{'\n'}
                      {'        '}strategy=strategy,{'\n'}
                      {'        '}save_local=<span className="text-[#569cd6]">True</span>,{'\n'}
                      {'        '}export_to_server=<span className="text-[#569cd6]">True</span>{'\n'}
                      {'    '})
                    </code>
                  </pre>
                </div>
              </div>
              </div>

              {/* Step 3: Visualize */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">3</div>
                  <h3 className="text-xl font-semibold">Visualisez les résultats</h3>
                </div>
                <div className="bg-muted/30 border border-border/50 rounded-xl p-8 text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Eye className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-medium">Accédez au compte de démonstration</h4>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Connectez-vous avec ces identifiants pour voir les résultats complets de la stratégie SMA ci-dessus.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="flex items-center gap-3 bg-background p-3 rounded-lg border shadow-sm">
                      <span className="text-sm text-muted-foreground font-medium">Email</span>
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono select-all">demo@simtrading.fr</code>
                    </div>
                    <div className="flex items-center gap-3 bg-background p-3 rounded-lg border shadow-sm">
                      <span className="text-sm text-muted-foreground font-medium">Mot de passe</span>
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono select-all">Demo1234</code>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button asChild>
                      <Link href="/auth/sign-in">
                        Se connecter au compte démo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-muted-foreground text-lg">
              Une suite complète d'outils pour passer de l'idée à la stratégie rentable sans gérer l'infrastructure.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Fidélité Institutionnelle",
                description: "Moteur de backtest capable de gérer les positions longues et courtes, les renversements et les frais complexes."
              },
              {
                icon: BarChart2,
                title: "Analyses Détaillées",
                description: "Visualisez vos entrées/sorties sur des graphiques interactifs. Analysez le Sharpe Ratio, Drawdown, et plus encore."
              },
              {
                icon: CheckCircle2,
                title: "Données de Qualité",
                description: "Accès inclus à des données historiques nettoyées et ajustées pour une variété de symboles."
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à lancer votre première stratégie ?</h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-10">
            Rejoignez les développeurs qui utilisent notre plateforme pour construire des algorithmes de trading performants.
          </p>
          <Button asChild size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold">
            <Link href="/auth/sign-up">
              Créer un compte gratuit
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

