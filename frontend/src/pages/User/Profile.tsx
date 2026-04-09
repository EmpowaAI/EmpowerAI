import { useState, useEffect } from "react"
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Save, Loader2, CheckCircle, AlertCircle, Edit2, Camera, Lock, Trash2, X, Eye, EyeOff, Sparkles } from "lucide-react"
import { useUser } from "../../contexts/user-context"
import { userService, accountService } from "../../api/Index"
import { cn } from "../../lib/utils"

export default function Profile() {
    const { user, updateUser } = useUser()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [hasCVData, setHasCVData] = useState(false)
    const [showProfileConfirm, setShowProfileConfirm] = useState(false)
    const [detectedProfileType, setDetectedProfileType] = useState<"tech" | "retail" | "general">("general")

    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        location: user?.location || "",
        occupation: user?.occupation || "",
        education: user?.education || "",
        bio: user?.bio || "",
    })

    // Check if CV data exists in localStorage
    useEffect(() => {
        const cvData = localStorage.getItem('comprehensiveCVAnalysis')
        setHasCVData(!!cvData)
    }, [])

    // ─── Change Password Modal ───────────────────
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", password: "", confirmPassword: "" })
    const [showPasswords, setShowPasswords] = useState(false)
    const [passwordSaving, setPasswordSaving] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    // ─── Change Email Modal ───────────────────────
    const [showEmailModal, setShowEmailModal] = useState(false)
    const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" })
    const [emailSaving, setEmailSaving] = useState(false)
    const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    // ─── Delete Account Modal ────────────────────
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState("")
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [deleteMessage, setDeleteMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    // ─── Load profile on mount ───────────────────
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoading(true)
                const profileUser = await userService.getProfile()
                setFormData({
                    name: profileUser.name || "",
                    email: profileUser.email || "",
                    phone: (profileUser as any).phone || "",
                    location: (profileUser as any).location || "",
                    occupation: (profileUser as any).occupation || "",
                    education: (profileUser as any).education || "",
                    bio: (profileUser as any).bio || "",
                })
            } catch (error) {
                console.error('Failed to load profile:', error)
                if (user) {
                    setFormData({
                        name: user.name || "",
                        email: user.email || "",
                        phone: (user as any).phone || "",
                        location: (user as any).location || "",
                        occupation: (user as any).occupation || "",
                        education: (user as any).education || "",
                        bio: (user as any).bio || "",
                })
            }
            } finally {
                setIsLoading(false)
            }
        }
        loadProfile()
    }, [])

    // ─── Improved Extraction Helpers ─────────────────────────

    // Extract name - looks for capital letters pattern
    const extractName = (cvData: any): string => {
        const about = cvData?.sections?.about || ""
        // Look for name at start of about section (two capital words)
        const nameMatch = about.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/)
        if (nameMatch && nameMatch[1].length < 40) return nameMatch[1]
        
        // Try to find from any section
        const allText = JSON.stringify(cvData)
        const commonMatch = allText.match(/([A-Z][a-z]+)\s+([A-Z][a-z]+)(?=\s+(?:is|a|an|with|has|works|studied|graduated))/)
        return commonMatch ? `${commonMatch[1]} ${commonMatch[2]}` : ""
    }

    // Extract phone - filters out date patterns
    const extractPhone = (cvData: any): string => {
        const allText = JSON.stringify(cvData)
        // Match South African phone patterns: +27, 0XX, with spaces/hyphens
        const phonePatterns = [
            /(?:\+27|0)[0-9]{9}\b/,                    // +27123456789 or 0123456789
            /(?:\+27|0)[0-9\s\-]{10,15}\b/,            // With spaces/hyphens
            /\(?0[0-9]{2}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/ // (012) 345 6789
        ]
        
        for (const pattern of phonePatterns) {
            const match = allText.match(pattern)
            if (match) {
                const phone = match[0].trim()
                // Filter out date patterns (2022-2023, 2024, etc)
                const isDatePattern = /^\d{4}[-–]\d{4}$|^\d{4}$|^\d{2}\/\d{2}\/\d{4}/.test(phone)
                if (!isDatePattern && phone.length >= 9 && phone.length <= 15) {
                    return phone
                }
            }
        }
        return ""
    }

    // Extract location - South African cities only
    const extractLocation = (cvData: any): string => {
        const about = cvData?.sections?.about || ""
        const allText = JSON.stringify(cvData)
        
        const saCities = [
            "Johannesburg", "Cape Town", "Durban", "Pretoria", 
            "Port Elizabeth", "Gqeberha", "Bloemfontein", "East London", 
            "Polokwane", "Nelspruit", "Mbombela", "Kimberley", 
            "Rustenburg", "Pietermaritzburg", "Soweto", "Sandton"
        ]
        
        for (const city of saCities) {
            if (about.includes(city) || allText.includes(city)) {
                return city
            }
        }
        
        // Look for province mentions
        const provinces = ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape"]
        for (const province of provinces) {
            if (about.includes(province) || allText.includes(province)) {
                return province
            }
        }
        
        return ""
    }

    // Detect if user is in tech based on skills
    const detectProfileType = (cvData: any): "tech" | "retail" | "general" => {
        const skills = cvData?.sections?.skills || []
        const techSkills = ["Python", "Java", "JavaScript", "React", "C#", "C++", "TypeScript", "Node.js", "HTML", "CSS", "SQL", "MongoDB", "Git", "Azure", "AWS", "Docker", "Kubernetes", "REST API", ".NET", "Spring Boot"]
        const retailSkills = ["POS", "Merchandising", "Stock Control", "Inventory", "Cashier", "Sales", "Customer Service", "Till", "Retail"]
        
        const techCount = skills.filter((s: string) => 
            techSkills.some(tech => s.toLowerCase().includes(tech.toLowerCase()))
        ).length
        
        const retailCount = skills.filter((s: string) => 
            retailSkills.some(retail => s.toLowerCase().includes(retail.toLowerCase()))
        ).length
        
        if (techCount > retailCount && techCount >= 3) return "tech"
        if (retailCount > techCount && retailCount >= 2) return "retail"
        return "general"
    }

    // Extract occupation based on detected type
    const extractOccupation = (cvData: any, type: "tech" | "retail" | "general"): string => {
        const skills = cvData?.sections?.skills || []
        
        if (type === "tech") {
            const hasFrontend = skills.some(s => s.toLowerCase().includes("react") || s.toLowerCase().includes("angular") || s.toLowerCase().includes("vue"))
            const hasBackend = skills.some(s => s.toLowerCase().includes("c#") || s.toLowerCase().includes(".net") || s.toLowerCase().includes("python") || s.toLowerCase().includes("java"))
            const hasFullStack = hasFrontend && hasBackend
            
            if (hasFullStack) return "Full Stack Developer"
            if (hasFrontend) return "Frontend Developer"
            if (hasBackend) return "Backend Developer"
            return "Software Developer"
        }
        
        if (type === "retail") {
            return "Retail Associate"
        }
        
        return ""
    }

    // Extract education level
    const extractEducation = (cvData: any): string => {
        const education = cvData?.sections?.education || []
        if (education.length === 0) return ""
        
        const eduText = education.join(" ").toLowerCase()
        
        if (eduText.includes("phd") || eduText.includes("doctorate")) return "PhD"
        if (eduText.includes("master") || eduText.includes("masters") || eduText.includes("msc") || eduText.includes("ma")) return "Master's Degree"
        if (eduText.includes("bachelor") || eduText.includes("bsc") || eduText.includes("ba") || eduText.includes("bcom")) return "Bachelor's Degree"
        if (eduText.includes("diploma") || eduText.includes("higher certificate")) return "Diploma"
        if (eduText.includes("matric") || eduText.includes("grade 12") || eduText.includes("high school")) return "Matric / Grade 12"
        
        return "Other"
    }

    // Extract bio - clean and truncate
    const extractBio = (cvData: any): string => {
        const about = cvData?.sections?.about || ""
        const strengths = cvData?.strengths || []
        
        if (about.length > 20) {
            // Clean up the about text
            let cleanedBio = about
                .replace(/\s+/g, " ")  // Remove extra spaces
                .replace(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\s+/, "") // Remove name if at start
                .trim()
            
            return cleanedBio.length > 300 ? cleanedBio.substring(0, 300) + "..." : cleanedBio
        }
        
        if (strengths.length > 0) {
            return `Professional with strengths in ${strengths.slice(0, 3).join(", ")}.`
        }
        
        return ""
    }

    // ─── AI Fill from CV with Type Detection ─────────────────────────
    const autoFillFromCV = async (forcedType?: "tech" | "retail" | "general") => {
        try {
            const storedCV = localStorage.getItem('comprehensiveCVAnalysis')
            if (!storedCV) {
                setSaveMessage({ 
                    type: "error", 
                    text: "Please analyze your CV first in the CV Analyzer" 
                })
                setTimeout(() => setSaveMessage(null), 3000)
                return
            }

            const cvData = JSON.parse(storedCV)
            
            // Detect profile type if not forced
            let profileType = forcedType || detectProfileType(cvData)
            
            // If no forced type and it's ambiguous, show confirmation dialog
            if (!forcedType && profileType === "general") {
                setDetectedProfileType(profileType)
                setShowProfileConfirm(true)
                return
            }
            
            const extractedInfo = {
                name: extractName(cvData),
                phone: extractPhone(cvData),
                location: extractLocation(cvData),
                occupation: extractOccupation(cvData, profileType),
                education: extractEducation(cvData),
                bio: extractBio(cvData),
            }
            
            // Only update non-empty fields
            const finalInfo: any = {}
            if (extractedInfo.name) finalInfo.name = extractedInfo.name
            if (extractedInfo.phone) finalInfo.phone = extractedInfo.phone
            if (extractedInfo.location) finalInfo.location = extractedInfo.location
            if (extractedInfo.occupation) finalInfo.occupation = extractedInfo.occupation
            if (extractedInfo.education) finalInfo.education = extractedInfo.education
            if (extractedInfo.bio) finalInfo.bio = extractedInfo.bio
            
            setFormData(prev => ({ ...prev, ...finalInfo }))
            
            // Auto-save to backend
            await userService.updateProfile(finalInfo)
            if (updateUser) {
                updateUser({
                    ...user,
                    ...finalInfo,
                    name: finalInfo.name || user?.name,
                })
            }
            
            setSaveMessage({ 
                type: "success", 
                text: `✨ Profile auto-filled as ${profileType === "tech" ? "Developer" : profileType === "retail" ? "Retail Professional" : "General"}!` 
            })
            setTimeout(() => setSaveMessage(null), 3000)
            
            setShowProfileConfirm(false)
            
        } catch (error) {
            console.error('Auto-fill failed:', error)
            setSaveMessage({ 
                type: "error", 
                text: "Failed to extract info from CV" 
            })
            setTimeout(() => setSaveMessage(null), 3000)
        }
    }

    // ─── Save profile (name + non-email fields) ──
    const handleSave = async () => {
        setIsSaving(true)
        setSaveMessage(null)
        try {
            const { email, ...updatePayload } = formData
            const response = await userService.updateProfile(updatePayload)
            if (updateUser) updateUser(response.user ?? formData)
            setSaveMessage({ type: "success", text: "Profile updated successfully!" })
            setIsEditing(false)
            setTimeout(() => setSaveMessage(null), 3000)
        } catch (error: any) {
            setSaveMessage({ type: "error", text: error.message || "Failed to update profile" })
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setFormData({
            name: user?.name || "",
            email: user?.email || "",
            phone: (user as any)?.phone || "",
            location: (user as any)?.location || "",
            occupation: (user as any)?.occupation || "",
            education: (user as any)?.education || "",
            bio: (user as any)?.bio || "",
        })
        setSaveMessage(null)
    }

    // ─── Change password ─────────────────────────
    const handleChangePassword = async () => {
        setPasswordMessage(null)
        if (passwordForm.password !== passwordForm.confirmPassword) {
            setPasswordMessage({ type: "error", text: "Passwords don't match" })
            return
        }
        if (passwordForm.password.length < 8) {
            setPasswordMessage({ type: "error", text: "Password must be at least 8 characters" })
            return
        }
        setPasswordSaving(true)
        try {
            await userService.changePassword(passwordForm)
            setPasswordMessage({ type: "success", text: "Password changed successfully!" })
            setPasswordForm({ currentPassword: "", password: "", confirmPassword: "" })
            setTimeout(() => { setShowPasswordModal(false); setPasswordMessage(null) }, 2000)
        } catch (error: any) {
            setPasswordMessage({ type: "error", text: error.message || "Failed to change password" })
        } finally {
            setPasswordSaving(false)
        }
    }

    // ─── Request email change ────────────────────
    const handleEmailChange = async () => {
        setEmailMessage(null)
        if (!emailForm.newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) {
            setEmailMessage({ type: "error", text: "Please enter a valid email address" })
            return
        }
        if (!emailForm.password) {
            setEmailMessage({ type: "error", text: "Please enter your current password" })
            return
        }
        setEmailSaving(true)
        try {
            await accountService.requestEmailChange({ newEmail: emailForm.newEmail, password: emailForm.password })
            setEmailMessage({ type: "success", text: "Verification link sent to your new email. Click it to confirm the change." })
            setEmailForm({ newEmail: "", password: "" })
            setTimeout(() => { setShowEmailModal(false); setEmailMessage(null) }, 4000)
        } catch (error: any) {
            setEmailMessage({ type: "error", text: error.message || "Failed to request email change" })
        } finally {
            setEmailSaving(false)
        }
    }

    // ─── Request account deletion ────────────────
    const handleDeleteAccount = async () => {
        setDeleteMessage(null)
        setDeleteLoading(true)
        try {
            await accountService.requestAccountDeletion()
            setDeleteMessage({ type: "success", text: "Confirmation email sent. Check your inbox to confirm deletion." })
            setDeleteConfirm("")
            setTimeout(() => { setShowDeleteModal(false); setDeleteMessage(null) }, 4000)
        } catch (error: any) {
            setDeleteMessage({ type: "error", text: error.message || "Failed to request account deletion" })
        } finally {
            setDeleteLoading(false)
        }
    }

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U"

    // Check if profile is mostly empty
    const isProfileEmpty = !formData.occupation && !formData.bio && !formData.location

    return (
        <div className="space-y-6 -mx-3 sm:mx-0">

            {/* Header */}
            <div className="px-3 sm:px-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Profile</h1>
                <p className="text-base text-muted-foreground mt-1">Manage your account information</p>
            </div>

            {/* Save Message */}
            {saveMessage && (
                <div className={cn(
                    "mx-3 sm:mx-0 p-4 rounded-xl border flex items-center gap-3 animate-fade-in",
                    saveMessage.type === "success"
                        ? "bg-accent/10 border-accent/20 text-accent"
                        : "bg-destructive/10 border-destructive/20 text-destructive"
                )}>
                    {saveMessage.type === "success" ? <CheckCircle className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
                    <p className="text-sm font-medium">{saveMessage.text}</p>
                </div>
            )}

            {/* Profile Type Confirmation Dialog */}
            {showProfileConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-slide-up">
                        <div className="text-center">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Confirm Your Profile Type</h3>
                            <p className="text-sm text-muted-foreground">
                                We detected mixed signals in your CV. Which profile best describes you?
                            </p>
                        </div>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => autoFillFromCV("tech")}
                                className="w-full p-4 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-left flex items-center gap-3"
                            >
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Software Developer / Tech</p>
                                    <p className="text-xs text-muted-foreground">Full-stack, frontend, backend, or software engineering</p>
                                </div>
                            </button>
                            
                            <button
                                onClick={() => autoFillFromCV("retail")}
                                className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left flex items-center gap-3"
                            >
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Retail / Customer Service</p>
                                    <p className="text-xs text-muted-foreground">Sales associate, cashier, stock controller, or store manager</p>
                                </div>
                            </button>
                            
                            <button
                                onClick={() => setShowProfileConfirm(false)}
                                className="w-full p-3 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cancel, I'll fill manually
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Fill Banner - shows when CV exists and profile is empty */}
            {hasCVData && isProfileEmpty && !isEditing && !showProfileConfirm && (
                <div className="mx-3 sm:mx-0 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">✨ AI detected your CV information</p>
                            <p className="text-xs text-muted-foreground">Import your name, occupation, education & more with one click</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => autoFillFromCV()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        <Sparkles className="h-4 w-4" />
                        Import from CV
                    </button>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6 px-3 sm:px-0">

                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 sticky top-24">
                        <div className="text-center">
                            <div className="relative inline-block">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-lg">
                                    <span className="text-2xl font-bold text-white">{initials}</span>
                                </div>
                                <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                                    <Camera className="h-4 w-4" />
                                </button>
                            </div>
                            <h2 className="text-xl font-bold text-foreground mt-4">{user?.name || "User"}</h2>
                            <p className="text-sm text-muted-foreground">{user?.email || "email@example.com"}</p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Member Since</span>
                                <span className="text-sm font-medium text-foreground">
                                    {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Jan 2026"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Account Status</span>
                                <span className="text-sm font-medium text-accent flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-accent"></span>Active
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">CV Analyzed</span>
                                <span className="text-sm font-medium text-foreground">{(user as any)?.cvAnalyzed ? "Yes" : hasCVData ? "Yes" : "No"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                            <div className="flex items-center gap-2">
                                {/* AI Fill Button - always visible when CV exists */}
                                {hasCVData && !isEditing && (
                                    <button 
                                        onClick={() => autoFillFromCV()}
                                        className="flex items-center gap-2 px-4 py-2 text-accent hover:bg-accent/10 rounded-lg transition-colors font-medium text-sm"
                                        title="Auto-fill from your analyzed CV"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        AI Fill from CV
                                    </button>
                                )}
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium text-sm">
                                        <Edit2 className="h-4 w-4" />Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleCancel} disabled={isSaving} className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm disabled:opacity-50">Cancel</button>
                                        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50">
                                            {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />Save Changes</>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <User className="h-4 w-4 text-muted-foreground" />Full Name
                                </label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                    disabled={!isEditing}
                                    className={cn("w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors", !isEditing && "opacity-75 cursor-not-allowed")}
                                    placeholder="Enter your full name" 
                                />
                            </div>

                            {/* Email — read-only, change via modal */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <Mail className="h-4 w-4 text-muted-foreground" />Email Address
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="email" 
                                        value={formData.email} 
                                        disabled
                                        className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground opacity-75 cursor-not-allowed focus:outline-none"
                                        placeholder="your.email@example.com" 
                                    />
                                    <button 
                                        onClick={() => setShowEmailModal(true)}
                                        className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 border border-primary/30 rounded-lg transition-colors whitespace-nowrap"
                                    >
                                        Change Email
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">Email changes require verification via a confirmation link.</p>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <Phone className="h-4 w-4 text-muted-foreground" />Phone Number
                                </label>
                                <input 
                                    type="tel" 
                                    value={formData.phone} 
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                                    disabled={!isEditing}
                                    className={cn("w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors", !isEditing && "opacity-75 cursor-not-allowed")}
                                    placeholder="+27 XX XXX XXXX" 
                                />
                                {formData.phone && /^\d{4}[-–]\d{4}$/.test(formData.phone) && (
                                    <p className="text-xs text-amber-500 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        This looks like a date range, not a phone number
                                    </p>
                                )}
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />Location
                                </label>
                                <input 
                                    type="text" 
                                    value={formData.location} 
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                                    disabled={!isEditing}
                                    className={cn("w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors", !isEditing && "opacity-75 cursor-not-allowed")}
                                    placeholder="City, Province" 
                                />
                            </div>

                            {/* Occupation */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />Current Occupation
                                </label>
                                <input 
                                    type="text" 
                                    value={formData.occupation} 
                                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} 
                                    disabled={!isEditing}
                                    className={cn("w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors", !isEditing && "opacity-75 cursor-not-allowed")}
                                    placeholder="Your job title or 'Student' or 'Unemployed'" 
                                />
                            </div>

                            {/* Education */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />Education Level
                                </label>
                                <input 
                                    type="text" 
                                    value={formData.education} 
                                    onChange={(e) => setFormData({ ...formData, education: e.target.value })} 
                                    disabled={!isEditing}
                                    className={cn("w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors", !isEditing && "opacity-75 cursor-not-allowed")}
                                    placeholder="e.g., Bachelor's Degree, Diploma, Matric" 
                                />
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground block">Bio</label>
                                <textarea 
                                    value={formData.bio} 
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })} 
                                    disabled={!isEditing} 
                                    rows={4}
                                    className={cn("w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none", !isEditing && "opacity-75 cursor-not-allowed")}
                                    placeholder="Tell us a bit about yourself..." 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Security */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Account Security</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => setShowPasswordModal(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                            >
                                <Lock className="h-4 w-4" />Change Password
                            </button>
                            <div className="text-sm text-muted-foreground">Last password change: Never</div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-card border border-destructive/30 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. A confirmation email will be sent before deletion.</p>
                        <button 
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 rounded-lg transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Change Password Modal ─────────────────────── */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-slide-up">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
                            <button onClick={() => { setShowPasswordModal(false); setPasswordMessage(null); setPasswordForm({ currentPassword: "", password: "", confirmPassword: "" }) }}
                                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {passwordMessage && (
                            <div className={cn("p-3 rounded-lg border flex items-center gap-2 text-sm",
                                passwordMessage.type === "success" ? "bg-accent/10 border-accent/20 text-accent" : "bg-destructive/10 border-destructive/20 text-destructive")}>
                                {passwordMessage.type === "success" ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                                {passwordMessage.text}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Current Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPasswords ? "text" : "password"} 
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                        placeholder="Enter current password" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">New Password</label>
                                <input 
                                    type={showPasswords ? "text" : "password"} 
                                    value={passwordForm.password}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                    placeholder="Enter new password (min 8 chars)" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                                <input 
                                    type={showPasswords ? "text" : "password"} 
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                    placeholder="Confirm new password" 
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={() => { setShowPasswordModal(false); setPasswordMessage(null); setPasswordForm({ currentPassword: "", password: "", confirmPassword: "" }) }}
                                className="flex-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                            <button onClick={handleChangePassword} disabled={passwordSaving}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50">
                                {passwordSaving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Update Password"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Change Email Modal ────────────────────────── */}
            {showEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-slide-up">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Change Email Address</h3>
                            <button onClick={() => { setShowEmailModal(false); setEmailMessage(null); setEmailForm({ newEmail: "", password: "" }) }}
                                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {emailMessage && (
                            <div className={cn("p-3 rounded-lg border flex items-center gap-2 text-sm",
                                emailMessage.type === "success" ? "bg-accent/10 border-accent/20 text-accent" : "bg-destructive/10 border-destructive/20 text-destructive")}>
                                {emailMessage.type === "success" ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                                {emailMessage.text}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">New Email Address</label>
                                <input 
                                    type="email" 
                                    value={emailForm.newEmail} 
                                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                    placeholder="Enter new email address" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Current Password</label>
                                <input 
                                    type="password" 
                                    value={emailForm.password} 
                                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                    placeholder="Enter your current password" 
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">A verification link will be sent to the new address. Your email won't change until you click it.</p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={() => { setShowEmailModal(false); setEmailMessage(null); setEmailForm({ newEmail: "", password: "" }) }}
                                className="flex-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                            <button onClick={handleEmailChange} disabled={emailSaving}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50">
                                {emailSaving ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : "Send Verification"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Account Modal ──────────────────────── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-destructive/30 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-slide-up">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-destructive">Delete Account</h3>
                            <button onClick={() => { setShowDeleteModal(false); setDeleteMessage(null); setDeleteConfirm("") }}
                                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-sm text-muted-foreground">This action is permanent and cannot be undone. A confirmation email will be sent to <strong className="text-foreground">{user?.email}</strong>. Your account will only be deleted after you confirm via that email.</p>

                        {deleteMessage && (
                            <div className={cn("p-3 rounded-lg border flex items-center gap-2 text-sm",
                                deleteMessage.type === "success" ? "bg-accent/10 border-accent/20 text-accent" : "bg-destructive/10 border-destructive/20 text-destructive")}>
                                {deleteMessage.type === "success" ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                                {deleteMessage.text}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Type <span className="font-mono text-destructive">DELETE</span> to confirm</label>
                            <input 
                                type="text" 
                                value={deleteConfirm} 
                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                className="w-full px-4 py-3 bg-background border border-destructive/30 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-destructive transition-colors"
                                placeholder="DELETE" 
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={() => { setShowDeleteModal(false); setDeleteMessage(null); setDeleteConfirm("") }}
                                className="flex-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                            <button onClick={handleDeleteAccount} disabled={deleteLoading || deleteConfirm !== "DELETE"}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors font-medium text-sm disabled:opacity-50">
                                {deleteLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : <><Trash2 className="h-4 w-4" />Delete Account</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}