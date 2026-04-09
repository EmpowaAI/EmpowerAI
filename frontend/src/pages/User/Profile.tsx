import { useState, useEffect } from "react"
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Save, Loader2, CheckCircle, AlertCircle, Edit2, Camera, Lock, Trash2, X, Eye, EyeOff } from "lucide-react"
import { useUser } from "../../contexts/user-context"
import { userService, accountService } from "../../api/Index"
import { cn } from "../../lib/utils"

export default function Profile() {
    const { user, updateUser } = useUser()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
        occupation: "",
        education: "",
        bio: "",
    })

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

    // ─── Load profile on mount and when user changes ───────────────────
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
                // Fallback to user context if API fails
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
    }, [user]) // Re-fetch when user changes

    // Update form data when user context changes (e.g., after email change)
    useEffect(() => {
        if (user && !isEditing) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: (user as any).phone || prev.phone,
                location: (user as any).location || prev.location,
                occupation: (user as any).occupation || prev.occupation,
                education: (user as any).education || prev.education,
                bio: (user as any).bio || prev.bio,
            }))
        }
    }, [user, isEditing])

    // ─── Save profile (name + non-email fields) ──
    const handleSave = async () => {
        setIsSaving(true)
        setSaveMessage(null)
        try {
            const { email, ...updatePayload } = formData
            const response = await userService.updateProfile(updatePayload)
            
            // Update the user context with the new data
            if (updateUser) {
                const updatedUser = { ...user, ...updatePayload, email: user?.email }
                updateUser(updatedUser)
            }
            
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
        // Reset form data to current user values
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

    const initials = formData.name
        ? formData.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U"

    const memberSince = (user as any)?.createdAt 
        ? new Date((user as any).createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : "Jan 2026"

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

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
                            <h2 className="text-xl font-bold text-foreground mt-4">{formData.name || "User"}</h2>
                            <p className="text-sm text-muted-foreground">{formData.email || "email@example.com"}</p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Member Since</span>
                                <span className="text-sm font-medium text-foreground">{memberSince}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Account Status</span>
                                <span className="text-sm font-medium text-accent flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-accent"></span>Active
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">CV Analyzed</span>
                                <span className="text-sm font-medium text-foreground">{(user as any)?.cvAnalyzed ? "Yes" : "No"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
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
                            <button onClick={() => setShowPasswordModal(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                                <Lock className="h-4 w-4" />Change Password
                            </button>
                            <div className="text-sm text-muted-foreground">Last password change: Never</div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-card border border-destructive/30 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. A confirmation email will be sent before deletion.</p>
                        <button onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 rounded-lg transition-colors">
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
                                    <input type={showPasswords ? "text" : "password"} value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                        placeholder="Enter current password" />
                                    <button type="button" onClick={() => setShowPasswords(!showPasswords)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">New Password</label>
                                <input type={showPasswords ? "text" : "password"} value={passwordForm.password}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                    placeholder="Enter new password (min 8 chars)" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                                <input type={showPasswords ? "text" : "password"} value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                    placeholder="Confirm new password" />
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
                                <input type="email" value={emailForm.newEmail} onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                    placeholder="Enter new email address" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Current Password</label>
                                <input type="password" value={emailForm.password} onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                    placeholder="Enter your current password" />
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

                        <p className="text-sm text-muted-foreground">This action is permanent and cannot be undone. A confirmation email will be sent to <strong className="text-foreground">{formData.email}</strong>. Your account will only be deleted after you confirm via that email.</p>

                        {deleteMessage && (
                            <div className={cn("p-3 rounded-lg border flex items-center gap-2 text-sm",
                                deleteMessage.type === "success" ? "bg-accent/10 border-accent/20 text-accent" : "bg-destructive/10 border-destructive/20 text-destructive")}>
                                {deleteMessage.type === "success" ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                                {deleteMessage.text}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Type <span className="font-mono text-destructive">DELETE</span> to confirm</label>
                            <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
                                className="w-full px-4 py-3 bg-background border border-destructive/30 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-destructive transition-colors"
                                placeholder="DELETE" />
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