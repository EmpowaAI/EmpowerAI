import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle, ChevronRight, ChevronLeft, Sparkles, Loader2 } from "lucide-react"
import { cn } from "../lib/utils"
import { twinAPI } from "../lib/api"

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

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Last step - create twin
      setError("")
      setIsLoading(true)
      
      try {
        const response = await twinAPI.create({
          skills: formData.skills,
          education: formData.education,
          interests: formData.goals,
        })
        
        if (response.status === 'success') {
          navigate("/dashboard")
        }
      } catch (err: any) {
        setError(err.message || "Failed to create twin. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
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
        <h2 className="text-2xl font-bold text-foreground">{steps[currentStep]}</h2>
        <p className="text-muted-foreground mt-1">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>

      {/* Form Content */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your age"
                min="16"
                max="35"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Province</label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select province</option>
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
            <label className="block text-sm font-medium text-foreground mb-4">Highest Education Level</label>
            <div className="grid grid-cols-2 gap-3">
              {educationLevels.map((level) => (
                <button
                  key={level}
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
            <label className="block text-sm font-medium text-foreground mb-4">Select your skills (multiple)</label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
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
            <label className="block text-sm font-medium text-foreground mb-4">Career Goals (select up to 3)</label>
            <div className="grid grid-cols-2 gap-3">
              {careerGoals.map((goal) => (
                <button
                  key={goal}
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
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
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
    </div>
  )
}
