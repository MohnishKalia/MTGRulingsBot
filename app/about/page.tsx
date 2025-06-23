import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowRight, Zap, ShieldCheck, Brain, Clock, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

export const metadata = {
  title: 'About - rules.fyi',
  description: 'Instant Magic: The Gathering rules lookup'
};

export default function About() {
  return (
    <>
      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex justify-center">
          <div className="container mx-auto flex items-center justify-between h-16 px-4">
            <span className="text-xl font-bold text-foreground">rules.fyi</span>
            <Button variant="ghost" size="sm" asChild>
              <Link 
                href="https://github.com/MohnishKalia/MTGRulingsBot/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Github className="size-5" />
                Report an Issue
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center pt-16">
        <div className="absolute inset-0 -z-10">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-background dark:bg-background [background:radial-gradient(125%_125%_at_50%_10%,hsl(var(--background))_40%,hsl(var(--purple-800))_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,hsl(var(--background))_40%,hsl(var(--purple-900))_100%)] opacity-40" />
          {/* Accent gradient */}
          <div className="absolute inset-0 [background:radial-gradient(100%_50%_at_50%_0%,hsl(var(--purple-600))_0%,transparent_75%)] dark:[background:radial-gradient(100%_50%_at_50%_0%,hsl(var(--purple-900))_0%,transparent_75%)] opacity-80" />
          {/* Dim overlay */}
          <div className="absolute inset-0 bg-background/20 dark:bg-background/40" />
        </div>
        <div className="container px-6 py-24 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className={cn(
              "text-6xl font-extrabold tracking-tight sm:text-8xl",
              "bg-gradient-to-r from-purple-600 via-purple-800 to-purple-900 dark:from-purple-400 dark:via-purple-500 dark:to-purple-600",
              "bg-clip-text text-transparent"
            )}>
              Magic Rules at Your <span className="inline-block">Fingertips</span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-muted-foreground sm:text-2xl font-medium">
              Instant, accurate rulings powered by <span className="text-purple-600 dark:text-purple-400 font-semibold">AI</span>. 
              Never pause your game for rule debates again.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">
                <Link prefetch={false} href="/">
                  Try it now <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Instant Answers Section - Left aligned */}
      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-background [background:radial-gradient(75%_75%_at_50%_0%,hsl(var(--background))_40%,hsl(var(--purple-500))_100%)]" />
        <div className="container px-6 mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="rounded-full bg-purple-100 dark:bg-purple-950 p-3 w-fit mb-6">
                <Zap className="size-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className={cn(
                "text-5xl font-bold tracking-tight",
                "bg-gradient-to-br from-foreground via-foreground to-muted-foreground",
                "bg-clip-text text-transparent"
              )}>
                Lightning-<span className="text-purple-600 dark:text-purple-400">Fast</span> Answers
              </h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Get precise rulings in <span className="font-semibold text-foreground">seconds</span>. 
                Stop flipping through rulebooks or scrolling through forum threads. 
                Ask your question and get back to the game <span className="font-semibold text-foreground">immediately</span>.
              </p>
            </div>
            <Card className="md:translate-x-8 backdrop-blur-sm bg-background/50 dark:bg-background/50 border-border relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-950 p-3">
                    <Zap className="size-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Instant Answers</h3>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Get precise rulings in seconds. No more lengthy rule book searches or forum discussions.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Official Rules Section - Right aligned */}
      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-background [background:radial-gradient(75%_75%_at_100%_50%,hsl(var(--background))_40%,hsl(var(--indigo-600))_100%)]" />
        <div className="container px-6 mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="order-2 md:order-1 md:-translate-x-8 backdrop-blur-sm bg-background/50 dark:bg-background/50 border-border relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-950 p-3">
                    <ShieldCheck className="size-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Official Rules</h3>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Powered by comprehensive Magic: The Gathering rules database, ensuring accurate and reliable answers.
              </CardContent>
            </Card>
            <div className="order-1 md:order-2">
              <div className="rounded-full bg-purple-100 dark:bg-purple-950 p-3 w-fit mb-6">
                <ShieldCheck className="size-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                Official Rules
              </h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Powered by comprehensive Magic: The Gathering rules database, ensuring accurate and reliable answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Enhanced Section - Left aligned */}
      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-background [background:radial-gradient(75%_75%_at_0%_50%,hsl(var(--background))_40%,hsl(var(--violet-600))_100%)]" />
        <div className="container px-6 mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="rounded-full bg-purple-100 dark:bg-purple-950 p-3 w-fit mb-6">
                <Brain className="size-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                AI-Enhanced
              </h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Advanced AI understands complex card interactions and provides clear, contextual explanations.
              </p>
            </div>
            <Card className="md:translate-x-8 backdrop-blur-sm bg-background/50 dark:bg-background/50 border-border relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-950 p-3">
                    <Brain className="size-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">AI-Enhanced</h3>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Advanced AI understands complex card interactions and provides clear, contextual explanations.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Always Available Section - Right aligned */}
      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-background [background:radial-gradient(75%_75%_at_50%_100%,hsl(var(--background))_40%,hsl(var(--fuchsia-600))_100%)]" />
        <div className="container px-6 mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="order-2 md:order-1 md:-translate-x-8 backdrop-blur-sm bg-background/50 dark:bg-background/50 border-border relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-950 p-3">
                    <Clock className="size-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Always Available</h3>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                24/7 access to instant rulings, perfect for tournaments, casual games, or deck building.
              </CardContent>
            </Card>
            <div className="order-1 md:order-2">
              <div className="rounded-full bg-purple-100 dark:bg-purple-950 p-3 w-fit mb-6">
                <Clock className="size-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                Always Available
              </h2>
              <p className="mt-4 text-xl text-muted-foreground">
                24/7 access to instant rulings, perfect for tournaments, casual games, or deck building.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="relative isolate overflow-hidden bg-muted/50 dark:bg-muted/10 rounded-3xl px-6 py-24 text-center sm:px-16">
          <div className="mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Trusted by MTG Players Worldwide
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              <figure>
                <blockquote className="text-lg font-semibold text-foreground">
                  <p>
                    &quot;rules.fyi has completely changed how we handle rule questions during our weekly Commander games. No more debates, just instant, reliable answers.&quot;
                  </p>
                </blockquote>
                <figcaption className="mt-6">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="text-base font-semibold text-foreground">Carl</div>
                    <div className="text-muted-foreground">•</div>
                    <div className="text-muted-foreground">Kitchen Table Enthusiast</div>
                  </div>
                </figcaption>
              </figure>

              <figure>
                <blockquote className="text-lg font-semibold text-foreground">
                  <p>
                    &quot;Perfect for our casual EDH pod! We often brew weird combos, and rules.fyi helps us understand complex interactions instantly.&quot;
                  </p>
                </blockquote>
                <figcaption className="mt-6">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="text-base font-semibold text-foreground">Jaden</div>
                    <div className="text-muted-foreground">•</div>
                    <div className="text-muted-foreground">EDH Player</div>
                  </div>
                </figcaption>
              </figure>

              <figure>
                <blockquote className="text-lg font-semibold text-foreground">
                  <p>
                    &quot;As a competitive player, accuracy is everything. rules.fyi gives me confident answers about intricate stack interactions during tournament practice.&quot;
                  </p>
                </blockquote>
                <figcaption className="mt-6">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="text-base font-semibold text-foreground">Kyle</div>
                    <div className="text-muted-foreground">•</div>
                    <div className="text-muted-foreground">Modern Player</div>
                  </div>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="container mx-auto px-6 pb-24">
        <div className="border-t border-border pt-8">
          <p className="text-sm text-muted-foreground text-center">
            <span className="font-medium">rules.fyi</span> is unofficial Fan Content permitted under the Fan Content Policy. 
            Not approved/endorsed by Wizards. Portions of the materials used are property of 
            <span className="font-medium"> Wizards of the Coast</span>. ©Wizards of the Coast LLC.
          </p>
        </div>
      </div>
    </>
  );
}
