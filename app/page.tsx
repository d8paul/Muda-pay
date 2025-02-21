import { ArrowRight, Wallet, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-80 via-slate-200 to-slate-80 text-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/50 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900">
              <Wallet className="size-5 text-white" />
            </div>
            <span className="text-lg font-bold">BavaPay</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/developer" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              API Docs
            </Link>
            <Link href="/login" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container relative pt-32 pb-20">
        {/* Gradient Backgrounds */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>

        {/* Hero Section */}
        <div className="relative mx-auto max-w-[800px] text-center mb-24">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
            Financial Solutions for
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              East Africa
            </span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 mx-auto max-w-[600px]">
            Integrate once, access multiple currencies and payment methods. Build better financial experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
              Get Started <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-900/20 hover:bg-slate-900/10 hover:border-slate-900 text-slate-900"
            >
              Documentation
            </Button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-24">
          <div className="group p-6 rounded-lg border border-slate-900/10 bg-white/50 hover:border-slate-900/20 hover:bg-white/80 transition-all">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              Push Payments
              <ArrowUpRight className="size-4 opacity-50 group-hover:opacity-80 transition-opacity text-slate-900" />
            </h3>
            <p className="text-slate-600">Send money to bank accounts and mobile wallets instantly.</p>
          </div>
          <div className="group p-6 rounded-lg border border-slate-900/10 bg-white/50 hover:border-slate-900/20 hover:bg-white/80 transition-all">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              Pull Payments
              <ArrowUpRight className="size-4 opacity-50 group-hover:opacity-80 transition-opacity text-slate-900" />
            </h3>
            <p className="text-slate-600">Collect payments from customers across multiple methods.</p>
          </div>
        </div>

        {/* Currencies */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-24">
          {[
            { code: "KES", name: "Kenyan Shilling" },
            { code: "UGX", name: "Ugandan Shilling" },
            { code: "TZS", name: "Tanzanian Shilling" },
          ].map((currency) => (
            <div
              key={currency.code}
              className="p-6 rounded-lg border border-slate-900/10 bg-white/50 hover:border-slate-900/20 hover:bg-white/80 transition-all text-center"
            >
              <div className="text-xl font-bold mb-1">{currency.code}</div>
              <p className="text-sm text-slate-600">{currency.name}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/5 to-purple-900/5 rounded-lg"></div>
          <div className="relative text-center p-12 rounded-lg border border-slate-900/10 bg-white/50">
            <h2 className="text-2xl font-bold mb-8">Ready to get started?</h2>
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
              Create Account
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-white/50">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900">
              <Wallet className="size-4 text-white" />
            </div>
            <span className="text-sm font-medium">BavaPay</span>
          </div>
          <p className="text-sm text-slate-600">© 2024 BavaPay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

