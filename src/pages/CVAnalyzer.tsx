"use client"

import { useState } from "react"
import { Upload, FileText, CheckCircle, AlertCircle, Lightbulb, ArrowRight } from "lucide-react"
import { cn } from "../lib/utils"

export default function CVAnalyzer() {
  const [uploaded, setUploaded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const handleUpload = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setUploaded(true)
    }, 2000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">CV Analyzer</h1>
        <p className="text-muted-foreground">Get AI-powered feedback on your CV</p>
      </div>

      {!uploaded ? (
        /* Upload Section - Updated styling for light theme */
        <div
          onClick={handleUpload}
          className={cn(
            "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors bg-card",
            analyzing ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          )}
        >
          {analyzing ? (
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
              <p className="text-lg font-medium text-foreground">Analyzing your CV...</p>
              <p className="text-muted-foreground">This may take a few seconds</p>
            </div>
          ) : (
            <>
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">Drop your CV here or click to upload</p>
              <p className="text-muted-foreground">Supports PDF, DOC, DOCX (Max 5MB)</p>
            </>
          )}
        </div>
      ) : (
        /* Analysis Results */
        <div className="space-y-6">
          {/* CV Score - Updated for light theme */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">CV Score</h2>
              <span className="text-3xl font-bold text-secondary">72/100</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-[72%] bg-gradient-to-r from-primary to-secondary rounded-full" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Good! Your CV is above average but has room for improvement.
            </p>
          </div>

          {/* Skills Extracted */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Skills Extracted</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Microsoft Office",
                "Customer Service",
                "Communication",
                "Data Entry",
                "Social Media",
                "Problem Solving",
              ].map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm flex items-center gap-1 font-medium"
                >
                  <CheckCircle className="h-3 w-3" /> {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-warning" />
              <h2 className="text-lg font-semibold text-foreground">Missing Skills for Target Roles</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Web Development", "Project Management", "Data Analysis"].map((skill) => (
                <span key={skill} className="px-3 py-1 bg-warning/20 text-warning rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-secondary" />
              <h2 className="text-lg font-semibold text-foreground">Recommendations</h2>
            </div>
            <ul className="space-y-3">
              {[
                'Add quantifiable achievements (e.g., "Increased sales by 20%")',
                "Include a professional summary at the top",
                "Add relevant keywords for ATS optimization",
                "Consider adding a skills section with proficiency levels",
              ].map((rec, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Download Improved CV
            </button>
            <button
              onClick={() => setUploaded(false)}
              className="px-6 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
            >
              Upload New CV
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
