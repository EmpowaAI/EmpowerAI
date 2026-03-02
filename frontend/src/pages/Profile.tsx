import React, { useState, useEffect } from "react"
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Save, Loader2, CheckCircle, AlertCircle, Edit2, Camera } from "lucide-react"
import { useUser } from "../lib/user-context"
import { cn } from "../lib/utils"

export default function Profile() {
  const { user, updateUser } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    occupation: user?.occupation || "",
    education: user?.education || "",
    bio: user?.bio || "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        occupation: user.occupation || "",
        education: user.education || "",
        bio: user.bio || "",
      })
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update user context (you'll need to implement updateUser in user-context)
      if (updateUser) {
        updateUser(formData)
      }
      
      setSaveMessage({ type: "success", text: "Profile updated successfully!" })
      setIsEditing(false)
      
      // Clear success message after 3 seconds
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
      phone: user?.phone || "",
      location: user?.location || "",
      occupation: user?.occupation || "",
      education: user?.education || "",
      bio: user?.bio || "",
    })
    setSaveMessage(null)
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

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
          {saveMessage.type === "success" ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{saveMessage.text}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 px-3 sm:px-0">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 sticky top-24">
            {/* Avatar */}
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

            {/* Stats */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm font-medium text-foreground">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Jan 2026"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Account Status</span>
                <span className="text-sm font-medium text-accent flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-accent"></span>
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">CV Analyzed</span>
                <span className="text-sm font-medium text-foreground">
                  {user?.cvAnalyzed ? "Yes" : "No"}
                </span>
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
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium text-sm"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className={cn(
                    "w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
                    !isEditing && "opacity-75 cursor-not-allowed"
                  )}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className={cn(
                    "w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
                    !isEditing && "opacity-75 cursor-not-allowed"
                  )}
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  className={cn(
                    "w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
                    !isEditing && "opacity-75 cursor-not-allowed"
                  )}
                  placeholder="+27 XX XXX XXXX"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={!isEditing}
                  className={cn(
                    "w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
                    !isEditing && "opacity-75 cursor-not-allowed"
                  )}
                  placeholder="City, Province"
                />
              </div>

              {/* Occupation */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  Current Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  disabled={!isEditing}
                  className={cn(
                    "w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
                    !isEditing && "opacity-75 cursor-not-allowed"
                  )}
                  placeholder="Your job title or 'Student' or 'Unemployed'"
                />
              </div>

              {/* Education */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  Education Level
                </label>
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  disabled={!isEditing}
                  className={cn(
                    "w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
                    !isEditing && "opacity-75 cursor-not-allowed"
                  )}
                  placeholder="e.g., Bachelor's Degree, Diploma, Matric"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className={cn(
                    "w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none",
                    !isEditing && "opacity-75 cursor-not-allowed"
                  )}
                  placeholder="Tell us a bit about yourself..."
                />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Account Security</h3>
            <div className="space-y-3">
              <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                Change Password
              </button>
              <div className="text-sm text-muted-foreground">
                Last password change: Never
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
