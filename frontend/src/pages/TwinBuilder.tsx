// TwinBuilder.tsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle, ChevronRight, ChevronLeft, Sparkles, Loader2 } from "lucide-react"
import { cn } from "../lib/utils"
import { twinAPI, progressAPI, twinAPIDemo } from "../lib/api"
import ProgressTracker from "../../../../../EmpowerAI/EmpowerAI/frontend/src/components/ProgressTracker"
import { useUser } from "../lib/user-context"

const steps = ["Personal Info", "Education", "Skills", "Goals"]
const provinces = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
]
const educationLevels = ["Matric", "Certificate", "Diploma", "Degree", "Postgraduate", "Other"]
const skillOptions = [
  "Microsoft Office",
  "Social Media",
  "Customer Service",
  "Data Entry",
  "Web Development",
  "Graphic Design",
  "Sales",
  "Writing",
  "Marketing",
  "Accounting",
  "Project Management",
  "Communication",
]
const careerGoals = [
  "Tech Career",
  "Freelancing",
  "Corporate Job",
  "Entrepreneurship",
  "Creative Industry",
  "Finance",
  "Healthcare",
  "Education",
]

export default function TwinBuilder() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    age: "",
    province: "",
    education: "",
    skills: [] as string[],
    goals: [] as string[],
  })
  const navigate = useNavigate()
  const { user, updateProgress } = useUser()

  // Check if twin is already created on component mount
  useEffect(() => {
    const twinCreated = localStorage.getItem('twinCreated')
    if (twinCreated === 'true') {
      console.log("Twin already created, redirecting to dashboard")
      navigate("/dashboard", { replace: true })
    }
    
    // Load saved form data if exists
    const savedFormData = localStorage.getItem('twinFormData')
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData)
        setFormData(parsedData)
        console.log("Loaded saved form data:", parsedData)
      } catch (error) {
        console.error("Error loading saved form data:", error)
      }
    }
  }, [navigate])

  // Save form data to localStorage on change
  useEffect(() => {
    localStorage.setItem('twinFormData', JSON.stringify(formData))
  }, [formData])

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }))
  }

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal) ? prev.goals.filter((g) => g !== goal) : [...prev.goals, goal],
    }))
  }

  const calculateEmpowermentScore = () => {
    let score = 50 // Base score
    
    // Add points for skills (max 30 points)
    score += Math.min(formData.skills.length * 5, 30)
    
    // Add points for education
    const educationScores: Record<string, number> = {
      'Matric': 10,
      'Certificate': 15,
      'Diploma': 20,
      'Degree': 25,
      'Postgraduate': 30,
      'Other': 5
    }
    score += educationScores[formData.education] || 0
    
    // Add points for goals (max 15 points)
    score += Math.min(formData.goals.length * 3, 15)
    
    // Add points for age (younger gets more points for growth potential)
    const age = parseInt(formData.age) || 25
    if (age >= 16 && age <= 25) score += 10
    else if (age >= 26 && age <= 30) score += 5
    
    return Math.min(Math.max(score, 0), 100)
  }

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.age || parseInt(formData.age) < 16 || parseInt(formData.age) > 35) {
          setError("Please enter a valid age between 16 and 35")
          return false
        }
        if (!formData.province) {
          setError("Please select your province")
          return false
        }
        return true
      case 1:
        if (!formData.education) {
          setError("Please select your education level")
          return false
        }
        return true
      case 2:
        if (formData.skills.length === 0) {
          setError("Please select at least one skill")
          return false
        }
        return true
      case 3:
        if (formData.goals.length === 0) {
          setError("Please select at least one career goal")
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNext = async () => {
    console.log("HandleNext called, currentStep:", currentStep)
    setError("")
    
    if (!validateStep()) {
      console.log("Validation failed")
      return
    }
    
    console.log("Validation passed, proceeding...")
    
    if (currentStep < steps.length - 1) {
      console.log("Moving to next step:", currentStep + 1)
      setCurrentStep(currentStep + 1)
    } else {
      console.log("Last step - creating twin")
      setIsLoading(true)
      setError("") // Clear any previous errors
      
      try {
        // Create twin data
        const twinData = {
          name: user?.name || "User",
          email: user?.email || "",
          skills: formData.skills,
          education: formData.education,
          interests: formData.goals,
          age: parseInt(formData.age) || 25,
          province: formData.province,
          careerGoals: formData.goals,
          userId: user?.id || `user_${Date.now()}`
        }
        
        console.log("Sending twin data:", twinData)
        
        // Try to save to API, fallback to demo
        let response;
        try {
          response = await twinAPI.create(twinData)
          console.log("API Response:", response)
        } catch (apiError) {
          console.log("API failed, trying demo fallback")
          response = await twinAPIDemo.create(twinData)
        }
        
        if (response && (response.status === 'success' || response.data?.twin)) {
          // Calculate empowerment score
          const empowermentScore = calculateEmpowermentScore()
          console.log("Empowerment Score:", empowermentScore)
          
          // Get twin ID from response or generate one
          const twinId = response.data?.twin?.id || `twin_${Date.now()}`
          
          // Create twin object with all data
          const twinWithScore = {
            ...twinData,
            id: twinId,
            empowermentScore,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          // Update user context
          updateProgress('twinCompleted', true)
          updateProgress('empowermentScore', empowermentScore)
          
          // Save twin data to localStorage for other components
          localStorage.setItem('twinData', JSON.stringify(twinWithScore))
          localStorage.setItem('twinCreated', 'true')
          
          // Clear saved form data
          localStorage.removeItem('twinFormData')
          
          // Save user data with twin info
          if (user) {
            const updatedUser = {
              ...user,
              twinCreated: true,
              empowermentScore,
              twinId
            }
            localStorage.setItem('user', JSON.stringify(updatedUser))
          }
          
          // Try to save progress to API (non-blocking)
          try {
            await progressAPI.saveTwinCompletion(twinId)
            console.log("Progress saved to API")
          } catch (progressError) {
            console.log("Local progress saved only:", progressError)
            // Continue even if API progress save fails
          }
          
          // Show success message and redirect to dashboard index
          setTimeout(() => {
            console.log("Redirecting to dashboard...")
            navigate("/dashboard", { 
              replace: true,
              state: { 
                twinCreated: true,
                empowermentScore,
                twinId,
                showWelcome: true
              } 
            })
          }, 1500)
        } else {
          throw new Error("Failed to create twin: Invalid response")
        }
      } catch (err: any) {
        console.error("Twin creation error:", err)
        setError(err.message || "Failed to create twin. Please try again.")
        setIsLoading(false)
      }
    }
  }

  const handleBack = () => {
    setError("")
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Tracker */}
      <ProgressTracker currentStep="twin" />
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Step 2: Build Your Digital Twin</h1>
        <p className="text-muted-foreground">Tell us about yourself to personalize your experience</p>
      </div>

      {/* Internal Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center">
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center font-medium transition-colors",
                i < currentStep
                  ? "bg-accent text-white"
                  : i === currentStep
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {i < currentStep ? <CheckCircle className="h-5 w-5" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={cn("w-12 md:w-24 h-1 mx-2", i < currentStep ? "bg-accent" : "bg-muted")} />
            )}
          </div>
        ))}
      </div>

      {/* Step Title */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-foreground">{steps[currentStep]}</h2>
        <p className="text-muted-foreground mt-1">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>

      {/* Form Content */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Age *</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your age"
                min="16"
                max="35"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Must be between 16 and 35</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Province *</label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select your province</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-4">Highest Education Level *</label>
            <div className="grid grid-cols-2 gap-3">
              {educationLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, education: level })}
                  className={cn(
                    "px-4 py-3 rounded-lg border text-left transition-colors",
                    formData.education === level
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-4">Select your skills *</label>
            <p className="text-sm text-muted-foreground mb-3">Select all that apply (at least one required)</p>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={cn(
                    "px-4 py-2 rounded-full border text-sm transition-colors",
                    formData.skills.includes(skill)
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">Selected: {formData.skills.length} skills</p>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-4">Career Goals *</label>
            <p className="text-sm text-muted-foreground mb-3">Select up to 3 goals (at least one required)</p>
            <div className="grid grid-cols-2 gap-3">
              {careerGoals.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  disabled={!formData.goals.includes(goal) && formData.goals.length >= 3}
                  className={cn(
                    "px-4 py-3 rounded-lg border text-left transition-colors",
                    formData.goals.includes(goal)
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50 disabled:opacity-50",
                  )}
                >
                  {goal}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">Selected: {formData.goals.length} of 3 goals</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Success Message (when twin is being created) */}
      {isLoading && (
        <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-lg text-sm text-accent">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 animate-pulse" />
            Creating your Digital Twin and calculating your Empowerment Score...
          </div>
          <div className="mt-2 text-xs">
            You will be redirected to the dashboard shortly...
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0 || isLoading}
          className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-5 w-5" /> Back
        </button>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
        
        <button
          onClick={handleNext}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Creating Twin...
            </>
          ) : currentStep === steps.length - 1 ? (
            <>
              <Sparkles className="h-5 w-5" /> Generate Twin
            </>
          ) : (
            <>
              Next <ChevronRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>

      {/* Preview of empowerment score (on last step) */}
      {currentStep === steps.length - 1 && !isLoading && (
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Estimated Empowerment Score</p>
              <p className="text-xs text-muted-foreground">Based on your inputs</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{calculateEmpowermentScore()}<span className="text-lg">/100</span></p>
              <p className="text-xs text-muted-foreground">Will be calculated upon completion</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}