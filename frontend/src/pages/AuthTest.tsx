import { useState } from "react"
import { authAPI, cvAPI } from "../lib/api"

export default function AuthTest() {
  const [results, setResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  const runTests = async () => {
    setResults([])
    setIsLoading(true)

    try {
      // Test 1: Check localStorage token
      addResult("📝 Test 1: Checking localStorage...")
      const token = localStorage.getItem('empowerai-token')
      if (token) {
        addResult(`✅ Token exists in localStorage: ${token.substring(0, 30)}...`)
      } else {
        addResult("❌ NO TOKEN in localStorage!")
        setIsLoading(false)
        return
      }

      // Test 2: Validate token with backend
      addResult("📝 Test 2: Validating token with backend...")
      try {
        const validateResponse = await authAPI.validate()
        addResult(`✅ Token is valid! User: ${JSON.stringify(validateResponse)}`)
      } catch (error: any) {
        addResult(`❌ Token validation failed: ${error.message}`)
        setIsLoading(false)
        return
      }

      // Test 3: Test CV API endpoint
      addResult("📝 Test 3: Testing CV API endpoint...")
      try {
        const testResponse = await cvAPI.analyze("Test CV content", "Test job requirements")
        addResult(`✅ CV API works! Response: ${JSON.stringify(testResponse).substring(0, 100)}`)
      } catch (error: any) {
        addResult(`❌ CV API failed: ${error.message}`)
      }

      addResult("🎉 All tests complete!")
    } catch (error: any) {
      addResult(`❌ Unexpected error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearToken = () => {
    localStorage.removeItem('empowerai-token')
    addResult("🗑️ Token cleared from localStorage")
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">🔍 Authentication Diagnostic Tool</h1>
        <p className="text-muted-foreground mb-6">
          This tool will help identify why you're getting "Please log in to access this resource" errors.
        </p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={runTests}
            disabled={isLoading}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Running Tests..." : "🚀 Run Diagnostic Tests"}
          </button>

          <button
            onClick={clearToken}
            className="bg-destructive text-white px-6 py-3 rounded-lg font-semibold hover:bg-destructive/90"
          >
            🗑️ Clear Token
          </button>

          <button
            onClick={() => setResults([])}
            className="bg-secondary text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90"
          >
            🧹 Clear Results
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">📊 Test Results:</h2>
          {results.length === 0 ? (
            <p className="text-muted-foreground">Click "Run Diagnostic Tests" to start...</p>
          ) : (
            <div className="space-y-2 font-mono text-sm">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded ${
                    result.includes("✅")
                      ? "bg-success/10 text-success"
                      : result.includes("❌")
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-3">💡 Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Make sure you're logged in first (go to /login if needed)</li>
            <li>Come back to this page and click "Run Diagnostic Tests"</li>
            <li>Read the results to see which test fails</li>
            <li>Copy the results and share them for debugging</li>
          </ol>
        </div>

        <div className="mt-6 bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-3">🔧 Quick Fixes:</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>If Test 1 fails:</strong> You need to log in again</li>
            <li><strong>If Test 2 fails:</strong> Your token is invalid or expired - log in again</li>
            <li><strong>If Test 3 fails:</strong> There's an issue with the CV API or backend</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
