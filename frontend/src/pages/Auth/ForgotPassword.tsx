// pages/ForgotPassword.tsx

import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail, CheckCircle } from "lucide-react";

import { accountAPI } from "../../lib/api";
import Logo from "../../components/Logo";


export default function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
    const response = await accountAPI.forgotPassword(email);
      if (response.status === "success") {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">

      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex flex-1 bg-cover bg-center p-12 flex-col justify-between relative"
        style={{ backgroundImage: "url(/images/result.jpg)" }}
      >
    
      <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10">
          <Logo variant="light" size="md" linkTo="/" />
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-6">
            Recover your account
          </h1>
          <ul className="space-y-4">
            {[
              "Reset your password securely",
              "Protect your account",
              "Quick email recovery",
              "Safe authentication process",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-white"
              >
                <CheckCircle className="h-5 w-5 text-accent" />
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

          {/* SUCCESS SCREEN */}
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold">
                Check your email
              </h2>
              <p className="text-muted-foreground">
                We sent a password reset link to:
              </p>
              <p className="font-semibold">
                {email}
              </p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to reset your password.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="w-full inline-block py-3 bg-primary text-primary-foreground rounded-lg font-semibold"
                >
                  Back to Login
                </Link>
              </div>
            </div>

          ) : (

            <>
              <div className="lg:hidden mb-8">
                <Logo variant="default" size="md" linkTo="/" />
              </div>
              <h2 className="text-3xl font-bold mb-2">
                Forgot Password
              </h2>
              <p className="text-muted-foreground mb-8">
                Enter your email and we'll send you a reset link
              </p>

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="you@example.com"
                    required
                  />

                </div>
                {error && (
                  <div className="p-3 bg-red-100 text-red-600 rounded">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-white rounded-lg font-semibold flex justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                Remember your password?
                <Link
                  to="/login"
                  className="ml-1 text-primary font-medium"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}