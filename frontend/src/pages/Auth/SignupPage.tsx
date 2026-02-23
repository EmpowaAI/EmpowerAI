// pages/SignupPage.tsx

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff, CheckCircle, Loader2, Mail } from "lucide-react"
import { authAPI } from "../../lib/api"
import Logo from "../../components/Logo"

export default function SignupPage() {

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await authAPI.register(formData)
      if (response.status === "success") setIsSuccess(true)
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Registration failed"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">

      {/* Left Panel */}
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
            Start your journey to economic empowerment
          </h1>

          <ul className="space-y-4">

            {[
              "Build your Digital Economic Twin",
              "Visualize your earning potential",
              "Get personalized career guidance",
              "Access SA-specific opportunities",
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



      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">

        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8">


          {/* Success Screen */}
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
                We sent a verification link to:
              </p>

              <p className="font-semibold">
                {formData.email}
              </p>

              <p className="text-sm text-muted-foreground">
                Click the link in the email to activate your account.
              </p>

              <div className="pt-4">
                <Link
                  to="/login"
                  className="w-full inline-block py-3 bg-primary text-primary-foreground rounded-lg font-semibold"
                >
                  Go to Login
                </Link>
              </div>

            </div>

          ) : (



            <>

              {/* Mobile Logo */}
              <div className="lg:hidden mb-8">
                <Logo variant="default" size="md" linkTo="/" />
              </div>


              <h2 className="text-3xl font-bold mb-2">
                Create account
              </h2>

              <p className="text-muted-foreground mb-8">
                Already have an account?
                <Link
                  to="/login"
                  className="ml-1 text-primary font-medium"
                >
                  Sign in
                </Link>
              </p>



              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >


                {/* Name */}
                <div>

                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border rounded-lg"
                  />

                </div>



                {/* Email */}
                <div>

                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border rounded-lg"
                  />

                </div>



                {/* Password */}
                <div>

                  <label className="block text-sm font-medium mb-2">
                    Password
                  </label>

                  <div className="relative">

                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value
                        })
                      }
                      className="w-full px-4 py-3 border rounded-lg pr-12"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >

                      {showPassword
                        ? <EyeOff className="h-5 w-5" />
                        : <Eye className="h-5 w-5" />
                      }

                    </button>

                  </div>

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
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}

                </button>


              </form>

            </>

          )}

        </div>

      </div>

    </div>
  )
}