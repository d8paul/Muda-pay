import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
 import BavaLogo from "@/components/BavaPayLogo";
 import BavaPayLogo from "../components/BavaPayLogo"

const Header = () => {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/50 backdrop-blur">
      <div className="mx-auto max-w-5xl px-8 sm:px-16">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900">
              <BavaPayLogo className="mx-auto h-12 w-auto" />

              </div>
            <span className="text-lg font-bold text-slate-800">BavaPay</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link href="/developer" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              API Docs
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="border-slate-900/20 hover:bg-slate-900/10 hover:border-slate-900 text-slate-900"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
