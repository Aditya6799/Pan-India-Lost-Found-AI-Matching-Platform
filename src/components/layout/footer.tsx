import * as React from "react";
import Link from "next/link";
import { MapPin, Heart, Shield, HelpCircle, FileText, Phone, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-neutral-200/80 bg-neutral-50/50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-500/20">
                <MapPin className="h-5 w-5 fill-white/20 stroke-[2.5]" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Found<span className="text-primary-600">It</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              India&apos;s intelligent Lost & Found civic platform powered by AI.
              Connecting citizens across all 36 States & Union Territories to
              reunite lost belongings safely and transparently.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 pt-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 dark:bg-neutral-900 px-2.5 py-1 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800">
                🇮🇳 Built for India
              </span>
              <span>•</span>
              <span>Multilingual Civic Portal</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/search"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Search Database
                </Link>
              </li>
              <li>
                <Link
                  href="/report/lost"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Report Lost Item
                </Link>
              </li>
              <li>
                <Link
                  href="/report/found"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Report Found Item
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/matches"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  AI Match System
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Safety */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  About the Initiative
                </Link>
              </li>
              <li>
                <Link
                  href="/about#safety"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/about#faq"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link
                  href="/about#contact"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Support & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Legal & Privacy
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/moderation"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Moderation Rules
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-neutral-200/80 pt-8 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-500 text-center sm:text-left">
            &copy; {currentYear} FoundIt India Platform. Open civic community initiative.
          </p>

          <div className="flex items-center gap-4 text-neutral-400">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
