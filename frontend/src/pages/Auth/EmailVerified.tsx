/**
 * EmailVerified Page
 */

import { Link } from "react-router-dom"
import { CheckCircle } from "lucide-react"
import Logo from "../../components/Logo"

export default function EmailVerified() {
  return (
    <div className="min-h-screen bg-background flex">

    {/* LEFT PANEL */}
      <div
        className="hidden lg:flex flex-1 bg-cover bg-center p-12 flex-col justify-between relative"
        style={{ backgroundImage: "url(/images/result.jpg)" }}
      >
        <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10">
            <Logo
            variant="light"
            size="md"
            linkTo="/"
          />
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-6">
            Email Verified
          </h1>

          <ul className="space-y-4">
            {[
              "Your account is now active",
              "Secure authentication enabled",
              "Access your dashboard",
              "Start your journey",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-white"
              >
                <CheckCircle
                  className="h-5 w-5 text-accent"
                />
                  {item}
              </li>
      ))}
            </ul>
        </div>

        <p className="text-sm text-white relative z-10">
          Youth Economic Digital Twin Platform
        </p>
    </div>

    {/* RIGHT PANEL */}
    <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8">
        <div className="text-center space-y-6">
          {/* ICON */}
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle
                className="h-8 w-8 text-green-600"
              />
            </div>
          </div>

          {/* TITLE */}
          <h2 className="text-2xl font-bold">
            Email Verified Successfully
          </h2>

          {/* MESSAGE */}
          <p className="text-muted-foreground">
            Your email address has been verified.
          </p>

          <p className="text-muted-foreground">
            You can now log in to your account.
          </p>

          {/* LOGIN BUTTON */}
          <div className="pt-4">
            <Link
              to="/login"
              className="w-full inline-block py-3 bg-primary text-primary-foreground rounded-lg font-semibold"
            >
              Go to Login
            </Link>
          </div>

          {/* EXTRA LINK */}
            <p className="text-sm text-muted-foreground">
              Ready to start using the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}