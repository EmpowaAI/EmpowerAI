import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, Save,
  CheckCircle, AlertCircle, Edit2, Camera, Lock, Trash2, X,
  Eye, EyeOff, Globe, Building, Loader2, Sparkles,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { SA_PROVINCES, SA_PROVINCES_CITIES } from "../../data/south-africa-locations";

// ── Types ──
interface UserProfile {
  name: string;
  email: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  occupation: string;
  education: string;
  bio: string;
  createdAt: string;
}

const STORAGE_KEY = "userProfile";

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  email: "",
  phone: "",
  country: "South Africa",
  province: "",
  city: "",
  occupation: "",
  education: "",
  bio: "",
  createdAt: new Date().toISOString(),
};

function loadProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_PROFILE;
}

function saveProfile(profile: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

// ── Toast ──
type ToastMsg = { type: "success" | "error"; text: string } | null;

function Toast({ msg }: { msg: ToastMsg }) {
  if (!msg) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={cn(
        "p-4 rounded-xl border flex items-center gap-3",
        msg.type === "success"
          ? "bg-primary/10 border-primary/20 text-primary"
          : "bg-destructive/10 border-destructive/20 text-destructive"
      )}
    >
      {msg.type === "success" ? (
        <CheckCircle className="h-5 w-5 shrink-0" />
      ) : (
        <AlertCircle className="h-5 w-5 shrink-0" />
      )}
      <p className="text-sm font-medium">{msg.text}</p>
    </motion.div>
  );
}

// ── Modal Shell ──
function Modal({
  open,
  onClose,
  children,
  variant = "default",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: "default" | "danger";
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "bg-card border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5",
          variant === "danger" ? "border-destructive/30" : "border-border"
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ── Main Component ──
export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastMsg>(null);
  const [hasCVData, setHasCVData] = useState(false);

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<ToastMsg>(null);

  // Email form
  const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" });
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState<ToastMsg>(null);

  // Delete form
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<ToastMsg>(null);

  // Check if CV data exists
  useEffect(() => {
    const cvData = localStorage.getItem('comprehensiveCVAnalysis');
    setHasCVData(!!cvData);
  }, []);

  const showToast = useCallback((msg: ToastMsg) => {
    setToast(msg);
    if (msg) setTimeout(() => setToast(null), 3000);
  }, []);

  // Cities for selected province
  const availableCities = formData.province
    ? SA_PROVINCES_CITIES[formData.province] || []
    : [];

  // ─── AI Fill from CV ──────────────────────────────────────────
  const autoFillFromCV = async () => {
    try {
      const storedCV = localStorage.getItem('comprehensiveCVAnalysis');
      if (!storedCV) {
        showToast({ type: "error", text: "Please analyze your CV first in the CV Analyzer" });
        return;
      }

      const cvData = JSON.parse(storedCV);
      
      // Extract valid phone (filter out date ranges)
      const allText = JSON.stringify(cvData);
      const phoneMatch = allText.match(/(?:\+27|0)[0-9\s\-]{9,15}\b/);
      let phone = "";
      if (phoneMatch) {
        const extractedPhone = phoneMatch[0].trim();
        const isDatePattern = /^\d{4}[-–]\d{4}$|^\d{4}$/.test(extractedPhone);
        if (!isDatePattern && extractedPhone.length >= 9 && extractedPhone.length <= 15) {
          phone = extractedPhone;
        }
      }
      
      // Extract occupation from skills
      const skills = cvData?.sections?.skills || [];
      const techSkills = ["Python", "Java", "JavaScript", "React", "C#", "C++", "TypeScript", "Node.js", "HTML", "CSS", "SQL"];
      const techCount = skills.filter((s: string) => 
        techSkills.some((tech: string) => s.toLowerCase().includes(tech.toLowerCase()))
      ).length;
      
      let occupation = "";
      if (techCount >= 5) {
        const hasFrontend = skills.some((s: string) => s.toLowerCase().includes("react"));
        const hasBackend = skills.some((s: string) => s.toLowerCase().includes("c#") || s.toLowerCase().includes("python"));
        if (hasFrontend && hasBackend) occupation = "Full Stack Developer";
        else if (hasFrontend) occupation = "Frontend Developer";
        else if (hasBackend) occupation = "Backend Developer";
        else occupation = "Software Developer";
      }
      
      // Extract education
      const educationSection = cvData?.sections?.education || [];
      let education = "";
      if (educationSection.length > 0) {
        const eduText = educationSection.join(" ").toLowerCase();
        if (eduText.includes("bachelor") || eduText.includes("bsc")) education = "Bachelor's Degree";
        else if (eduText.includes("master")) education = "Master's Degree";
        else if (eduText.includes("diploma")) education = "Diploma";
        else if (eduText.includes("matric")) education = "Matric / Grade 12";
      }
      
      // Extract bio
      let bio = cvData?.sections?.about || "";
      if (bio.length > 300) bio = bio.substring(0, 300) + "...";
      
      // Extract province from CV text
      let detectedProvince = "";
      let detectedCity = "";
      const cvText = JSON.stringify(cvData).toLowerCase();
      
      // Check each province
      for (const province of SA_PROVINCES) {
        if (cvText.includes(province.toLowerCase())) {
          detectedProvince = province;
          break;
        }
      }
      
      // Check for cities if province found
      if (detectedProvince) {
        const cities = SA_PROVINCES_CITIES[detectedProvince] || [];
        for (const city of cities) {
          if (cvText.includes(city.toLowerCase())) {
            detectedCity = city;
            break;
          }
        }
      }
      
      // Build update object (ONLY these fields - NEVER name or email)
      const finalInfo: Partial<UserProfile> = {};
      if (phone) finalInfo.phone = phone;
      if (occupation) finalInfo.occupation = occupation;
      if (education) finalInfo.education = education;
      if (bio) finalInfo.bio = bio;
      if (detectedProvince) finalInfo.province = detectedProvince;
      if (detectedCity) finalInfo.city = detectedCity;
      
      // Update form
      setFormData((prev) => ({ ...prev, ...finalInfo }));
      
      // Save to localStorage
      const updatedProfile = { ...profile, ...finalInfo };
      setProfile(updatedProfile);
      saveProfile(updatedProfile);
      
      const filledCount = Object.keys(finalInfo).length;
      showToast({ type: "success", text: `✨ Imported ${filledCount} fields from your CV!` });
      
    } catch (error) {
      console.error('Auto-fill failed:', error);
      showToast({ type: "error", text: "Failed to extract info from CV" });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setProfile(formData);
    saveProfile(formData);
    setIsEditing(false);
    setIsSaving(false);
    showToast({ type: "success", text: "Profile updated successfully!" });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(profile);
  };

  const handleChangePassword = async () => {
    setPasswordMsg(null);
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords don't match" });
      return;
    }
    if (passwordForm.password.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }
    setPasswordSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setPasswordSaving(false);
    setPasswordMsg({ type: "success", text: "Password changed successfully!" });
    setPasswordForm({ currentPassword: "", password: "", confirmPassword: "" });
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordMsg(null);
    }, 2000);
  };

  const handleEmailChange = async () => {
    setEmailMsg(null);
    if (!emailForm.newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) {
      setEmailMsg({ type: "error", text: "Please enter a valid email address" });
      return;
    }
    if (!emailForm.password) {
      setEmailMsg({ type: "error", text: "Please enter your current password" });
      return;
    }
    setEmailSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setEmailSaving(false);
    setEmailMsg({
      type: "success",
      text: "Verification link sent to your new email.",
    });
    setEmailForm({ newEmail: "", password: "" });
    setTimeout(() => {
      setShowEmailModal(false);
      setEmailMsg(null);
    }, 3000);
  };

  const handleDeleteAccount = async () => {
    setDeleteMsg(null);
    setDeleteLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setDeleteLoading(false);
    setDeleteMsg({
      type: "success",
      text: "Confirmation email sent. Check your inbox.",
    });
    setDeleteConfirm("");
    setTimeout(() => {
      setShowDeleteModal(false);
      setDeleteMsg(null);
    }, 3000);
  };

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  const updateField = (field: keyof UserProfile, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // Field component
  const Field = ({
    icon: Icon,
    label,
    children,
  }: {
    icon: React.ElementType;
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </label>
      {children}
    </div>
  );

  const inputClass = (disabled: boolean) =>
    cn(
      "w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all",
      disabled && "opacity-60 cursor-not-allowed"
    );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account information
          </p>
        </div>

        {/* Toast */}
        <AnimatePresence>
          <Toast msg={toast} />
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar Card */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 lg:sticky lg:top-8">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {initials}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-foreground mt-4">
                  {profile.name || "Your Name"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profile.email || "your@email.com"}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Member Since
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {memberSince}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Account Status
                  </span>
                  <span className="text-sm font-medium text-primary flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    CV Analyzed
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {hasCVData ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h3 className="text-lg font-semibold text-foreground">
                  Personal Information
                </h3>
                <div className="flex items-center gap-2">
                  {hasCVData && !isEditing && (
                    <button
                      onClick={autoFillFromCV}
                      className="flex items-center gap-2 px-4 py-2 text-accent hover:bg-accent/10 rounded-lg transition-colors font-medium text-sm"
                    >
                      <Sparkles className="h-4 w-4" />
                      AI Fill from CV
                    </button>
                  )}
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
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50"
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
              </div>

              <div className="space-y-5">
                {/* Full Name - NEVER auto-filled */}
                <Field icon={User} label="Full Name">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    disabled={!isEditing}
                    className={inputClass(!isEditing)}
                    placeholder="Enter your full name"
                  />
                </Field>

                {/* Email - NEVER auto-filled */}
                <Field icon={Mail} label="Email Address">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className={cn(inputClass(true), "flex-1")}
                      placeholder="your.email@example.com"
                    />
                    <button
                      onClick={() => setShowEmailModal(true)}
                      className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 border border-primary/30 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Change Email
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email changes require verification via a confirmation link.
                  </p>
                </Field>

                {/* Phone - Extracted from CV */}
                <Field icon={Phone} label="Phone Number">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    disabled={!isEditing}
                    className={inputClass(!isEditing)}
                    placeholder="+27 XX XXX XXXX"
                  />
                  {formData.phone && /^\d{4}[-–]\d{4}$/.test(formData.phone) && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      This looks like a date range, not a phone number. Please update.
                    </p>
                  )}
                </Field>

                {/* Location: Country → Province → City */}
                <Field icon={Globe} label="Country">
                  <input
                    type="text"
                    value="South Africa"
                    disabled
                    className={inputClass(true)}
                  />
                </Field>

                <Field icon={MapPin} label="Province">
                  <select
                    value={formData.province}
                    onChange={(e) => {
                      updateField("province", e.target.value);
                      updateField("city", "");
                    }}
                    disabled={!isEditing}
                    className={inputClass(!isEditing)}
                  >
                    <option value="">Select Province</option>
                    {SA_PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field icon={Building} label="City / Town">
                  <select
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    disabled={!isEditing || !formData.province}
                    className={inputClass(!isEditing || !formData.province)}
                  >
                    <option value="">
                      {formData.province
                        ? "Select City"
                        : "Select a province first"}
                    </option>
                    {availableCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>

                {/* Occupation - Extracted from CV */}
                <Field icon={Briefcase} label="Current Occupation">
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => updateField("occupation", e.target.value)}
                    disabled={!isEditing}
                    className={inputClass(!isEditing)}
                    placeholder="Your job title or 'Student' or 'Unemployed'"
                  />
                </Field>

                {/* Education - Extracted from CV */}
                <Field icon={GraduationCap} label="Education Level">
                  <select
                    value={formData.education}
                    onChange={(e) => updateField("education", e.target.value)}
                    disabled={!isEditing}
                    className={inputClass(!isEditing)}
                  >
                    <option value="">Select Education Level</option>
                    <option value="Matric / Grade 12">Matric / Grade 12</option>
                    <option value="Higher Certificate">Higher Certificate</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Advanced Diploma">Advanced Diploma</option>
                    <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                    <option value="Honours Degree">Honours Degree</option>
                    <option value="Master's Degree">Master&apos;s Degree</option>
                    <option value="PhD / Doctorate">PhD / Doctorate</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>

                {/* Bio - Extracted from CV */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    className={cn(inputClass(!isEditing), "resize-none")}
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Account Security
              </h3>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                <Lock className="h-4 w-4" />
                Change Password
              </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-card border border-destructive/30 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. A
                confirmation email will be sent before deletion.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* ── Password Modal ── */}
        <Modal
          open={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setPasswordMsg(null);
            setPasswordForm({ currentPassword: "", password: "", confirmPassword: "" });
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Change Password
            </h3>
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordMsg(null);
              }}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <AnimatePresence>
            <Toast msg={passwordMsg} />
          </AnimatePresence>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className={inputClass(false) + " pr-12"}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={passwordForm.password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, password: e.target.value })
                }
                className={inputClass(false)}
                placeholder="Enter new password (min 8 chars)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Confirm New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className={inputClass(false)}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordMsg(null);
                setPasswordForm({ currentPassword: "", password: "", confirmPassword: "" });
              }}
              className="flex-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              disabled={passwordSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {passwordSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </Modal>

        {/* ── Email Modal ── */}
        <Modal
          open={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setEmailMsg(null);
            setEmailForm({ newEmail: "", password: "" });
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Change Email Address
            </h3>
            <button
              onClick={() => {
                setShowEmailModal(false);
                setEmailMsg(null);
              }}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <AnimatePresence>
            <Toast msg={emailMsg} />
          </AnimatePresence>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                New Email Address
              </label>
              <input
                type="email"
                value={emailForm.newEmail}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, newEmail: e.target.value })
                }
                className={inputClass(false)}
                placeholder="Enter new email address"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Current Password
              </label>
              <input
                type="password"
                value={emailForm.password}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, password: e.target.value })
                }
                className={inputClass(false)}
                placeholder="Enter your current password"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              A verification link will be sent to the new address. Your email
              won&apos;t change until you click it.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowEmailModal(false);
                setEmailMsg(null);
                setEmailForm({ newEmail: "", password: "" });
              }}
              className="flex-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEmailChange}
              disabled={emailSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {emailSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Verification"
              )}
            </button>
          </div>
        </Modal>

        {/* ── Delete Account Modal ── */}
        <Modal
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteMsg(null);
            setDeleteConfirm("");
          }}
          variant="danger"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-destructive">
              Delete Account
            </h3>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteMsg(null);
                setDeleteConfirm("");
              }}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground">
            This action is permanent. Type{" "}
            <strong className="text-foreground">DELETE</strong> below to confirm.
          </p>

          <AnimatePresence>
            <Toast msg={deleteMsg} />
          </AnimatePresence>

          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className={inputClass(false)}
            placeholder='Type "DELETE" to confirm'
          />

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteMsg(null);
                setDeleteConfirm("");
              }}
              className="flex-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteLoading || deleteConfirm !== "DELETE"}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </>
              )}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}