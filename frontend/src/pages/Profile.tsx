// frontend/src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Save, Loader2, CheckCircle, AlertCircle, Edit2, Camera,
  Brain, FileText, Award,
} from "lucide-react";
import { useUser } from "../lib/user-context";
import { userAPI } from "../lib/api";
import { cn } from "../lib/utils";
import type { CVAnalysisData } from "../types/profile.types";

interface FormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  occupation: string;
  education: string;
  bio: string;
  skills: string[];
  experience: string[];
  achievements: string[];
  cvScore?: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    occupation: "",
    education: "",
    bio: "",
    skills: [],
    experience: [],
    achievements: [],
  });

  // Extract data from CV analysis and populate form
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        
        // 1. Try to get from user context first
        if (user) {
          setFormData(prev => ({
            ...prev,
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            location: user.location || "",
            occupation: user.occupation || "",
            education: user.education || "",
            bio: user.bio || "",
          }));
        }

        // 2. Try to get from API
        try {
          const response = await userAPI.getProfile();
          if (response.status === 'success' && response.data?.user) {
            const profileData = response.data.user;
            setFormData(prev => ({
              ...prev,
              name: profileData.name || prev.name,
              email: profileData.email || prev.email,
              phone: profileData.phone || prev.phone,
              location: profileData.location || prev.location,
              occupation: profileData.occupation || prev.occupation,
              education: profileData.education || prev.education,
              bio: profileData.bio || prev.bio,
            }));
          }
        } catch (error) {
          console.log('Using local profile data');
        }

        // 3. Extract from CV analysis
        const cvData = localStorage.getItem('cvAnalysisData');
        if (cvData) {
          const parsedCV: CVAnalysisData = JSON.parse(cvData);
          
          // Extract name from CV
          const extractedName = extractNameFromCV(parsedCV);
          
          // Extract email from CV
          const extractedEmail = extractEmailFromCV(parsedCV);
          
          // Extract phone from CV
          const extractedPhone = extractPhoneFromCV(parsedCV);
          
          // Extract location from CV
          const extractedLocation = extractLocationFromCV(parsedCV);
          
          // Extract occupation from CV
          const extractedOccupation = extractOccupationFromCV(parsedCV);
          
          // Extract education
          const extractedEducation = parsedCV.sections?.education?.[0] || "";
          
          // Extract bio
          const extractedBio = parsedCV.sections?.about || "";
          
          // Get skills
          const extractedSkills = parsedCV.sections?.skills || [];
          
          // Get experience
          const extractedExperience = parsedCV.sections?.experience || [];
          
          // Get achievements
          const extractedAchievements = parsedCV.sections?.achievements || [];

          setFormData(prev => ({
            ...prev,
            name: prev.name || extractedName,
            email: prev.email || extractedEmail,
            phone: prev.phone || extractedPhone,
            location: prev.location || extractedLocation,
            occupation: prev.occupation || extractedOccupation,
            education: prev.education || extractedEducation,
            bio: prev.bio || extractedBio,
            skills: extractedSkills,
            experience: extractedExperience,
            achievements: extractedAchievements,
            cvScore: parsedCV.score,
          }));

          // Update user context
          if (updateUser) {
            updateUser({
              ...user,
              name: extractedName,
              email: extractedEmail,
              phone: extractedPhone,
              location: extractedLocation,
              occupation: extractedOccupation,
              education: extractedEducation,
              bio: extractedBio,
            });
          }
        }

      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user, updateUser]);

  // Handle profile save
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const response = await userAPI.updateProfile(formData);
      
      if (response.status === 'success') {
        if (updateUser) {
          updateUser(formData);
        }
        
        setSaveMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
        
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      setSaveMessage({ type: "error", text: error.message || "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        occupation: user.occupation || "",
        education: user.education || "",
        bio: user.bio || "",
      }));
    }
    setSaveMessage(null);
  };

  // Calculate initials for avatar
  const initials = formData.name
    ? formData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Your information is automatically populated from your CV analysis
          </p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mb-6 p-4 rounded-xl border flex items-center gap-3",
              saveMessage.type === "success" 
                ? "bg-accent/10 border-accent/20 text-accent"
                : "bg-destructive/10 border-destructive/20 text-destructive"
            )}
          >
            {saveMessage.type === "success" ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{saveMessage.text}</p>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card & CV Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-2xl font-bold text-white">{initials}</span>
                  </div>
                  <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="text-xl font-bold mt-4">{formData.name || "Your Name"}</h2>
                <p className="text-sm text-muted-foreground">{formData.email || "email@example.com"}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Recently"}
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
                  <span className="text-sm font-medium">
                    {formData.cvScore ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">CV Score</span>
                  <span className="text-sm font-medium text-primary">
                    {formData.cvScore || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* CV Skills Summary */}
            {formData.skills && formData.skills.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Top Skills from CV
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.slice(0, 8).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-sm font-medium text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/dashboard/cv-analyzer')}
                className="p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-all text-center"
              >
                <FileText className="h-5 w-5 text-primary mx-auto mb-2" />
                <span className="text-xs font-medium">Analyze CV</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/twin-builder')}
                className="p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-all text-center"
              >
                <Brain className="h-5 w-5 text-primary mx-auto mb-2" />
                <span className="text-xs font-medium">Digital Twin</span>
              </button>
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Personal Information</h3>
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

              {/* Form Fields */}
              <div className="space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className={cn(
                      "w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
                      !isEditing && "opacity-75 cursor-not-allowed"
                    )}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className={cn(
                      "w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
                      !isEditing && "opacity-75 cursor-not-allowed"
                    )}
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className={cn(
                      "w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
                      !isEditing && "opacity-75 cursor-not-allowed"
                    )}
                    placeholder="+27 XX XXX XXXX"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!isEditing}
                    className={cn(
                      "w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
                      !isEditing && "opacity-75 cursor-not-allowed"
                    )}
                    placeholder="City, Province"
                  />
                </div>

                {/* Occupation */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Current Occupation
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    disabled={!isEditing}
                    className={cn(
                      "w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
                      !isEditing && "opacity-75 cursor-not-allowed"
                    )}
                    placeholder="Your current role"
                  />
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    Education Level
                  </label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    disabled={!isEditing}
                    className={cn(
                      "w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
                      !isEditing && "opacity-75 cursor-not-allowed"
                    )}
                    placeholder="e.g., Bachelor's Degree"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    Professional Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className={cn(
                      "w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none",
                      !isEditing && "opacity-75 cursor-not-allowed"
                    )}
                    placeholder="Your professional summary..."
                  />
                </div>

                {/* Experience Section */}
                {formData.experience && formData.experience.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      Experience from CV
                    </h4>
                    <div className="space-y-2">
                      {formData.experience.map((exp, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg text-sm">
                          {exp}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements Section */}
                {formData.achievements && formData.achievements.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Achievements from CV
                    </h4>
                    <ul className="space-y-2">
                      {formData.achievements.map((ach, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">✦</span>
                          {ach}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
              <h3 className="text-lg font-semibold mb-4">Account Security</h3>
              <div className="space-y-3">
                <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-muted hover:bg-muted/80 rounded-lg transition-colors">
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
    </div>
  );
}

// ========== Helper Functions for CV Text Extraction ==========

function extractNameFromCV(cvData: CVAnalysisData): string {
  if (cvData.sections?.about) {
    const patterns = [
      /(?:I am|I'm|My name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    ];
    
    for (const pattern of patterns) {
      const match = cvData.sections.about.match(pattern);
      if (match) return match[1] || match[0];
    }
  }
  return "";
}

function extractEmailFromCV(cvData: CVAnalysisData): string {
  if (cvData.sections?.about) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = cvData.sections.about.match(emailRegex);
    if (match) return match[0];
  }
  return "";
}

function extractPhoneFromCV(cvData: CVAnalysisData): string {
  if (cvData.sections?.about) {
    const phoneRegex = /(?:\+27|0)[1-9][0-9]{8}/;
    const match = cvData.sections.about.match(phoneRegex);
    if (match) return match[0];
  }
  return "";
}

function extractLocationFromCV(cvData: CVAnalysisData): string {
  const locations = ['Gauteng', 'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Western Cape', 'KwaZulu-Natal'];
  
  if (cvData.sections?.about) {
    for (const location of locations) {
      if (cvData.sections.about.includes(location)) {
        return location;
      }
    }
  }
  
  // Check experience section for locations
  if (cvData.sections?.experience) {
    for (const exp of cvData.sections.experience) {
      for (const location of locations) {
        if (exp.includes(location)) {
          return location;
        }
      }
    }
  }
  
  return "";
}

function extractOccupationFromCV(cvData: CVAnalysisData): string {
  if (cvData.sections?.experience && cvData.sections.experience.length > 0) {
    const firstExp = cvData.sections.experience[0];
    const patterns = [
      /(?:as a|as an|as)\s+([A-Za-z\s]+)/i,
      /^([A-Za-z\s]+)(?:\s+at|\s+with|\s+-)/i,
    ];
    
    for (const pattern of patterns) {
      const match = firstExp.match(pattern);
      if (match) return match[1].trim();
    }
    
    return firstExp.split('\n')[0].trim();
  }
  
  return "";
}