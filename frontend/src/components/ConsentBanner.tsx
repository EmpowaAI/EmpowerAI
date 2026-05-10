// src/components/ConsentBicketPicker.tsx
import { useState, useEffect } from "react";
import { Shield, FileText, Cookie, X, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ConsentData {
  given: boolean;
  timestamp: string;
  version: string;
  acceptedPolicies: string[];
}

const CONSENT_KEY = "empowai_user_consent";
const CONSENT_VERSION = "1.0.0";

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consents, setConsents] = useState({
    privacyPolicy: false,
    termsOfService: false,
    cookiesPolicy: false,
    dataProcessing: false,
  });
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showCookies, setShowCookies] = useState(false);

  // Check if consent already given
  useEffect(() => {
    const savedConsent = localStorage.getItem(CONSENT_KEY);
    if (savedConsent) {
      try {
        const consentData: ConsentData = JSON.parse(savedConsent);
        // Check if consent is still valid (not expired)
        const consentDate = new Date(consentData.timestamp);
        const now = new Date();
        const daysSinceConsent = (now.getTime() - consentDate.getTime()) / (1000 * 3600 * 24);
        
        // If consent is older than 365 days, ask again
        if (daysSinceConsent > 365 || consentData.version !== CONSENT_VERSION) {
          setShowBanner(true);
        } else {
          setShowBanner(false);
        }
      } catch {
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const allChecked = () => {
    return consents.privacyPolicy && consents.termsOfService && consents.cookiesPolicy && consents.dataProcessing;
  };

  const handleAcceptAll = () => {
    const newConsents = {
      privacyPolicy: true,
      termsOfService: true,
      cookiesPolicy: true,
      dataProcessing: true,
    };
    setConsents(newConsents);
    saveConsent(newConsents);
  };

  const handleAcceptSelected = () => {
    if (allChecked()) {
      saveConsent(consents);
    }
  };

  const saveConsent = (selectedConsents: typeof consents) => {
    const consentData: ConsentData = {
      given: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
      acceptedPolicies: Object.keys(selectedConsents).filter(key => selectedConsents[key as keyof typeof selectedConsents]),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
    setShowBanner(false);
    setShowDetails(false);
    
    // Dispatch event for other components to know consent was given
    window.dispatchEvent(new CustomEvent('consent-updated', { detail: consentData }));
  };

  const handleDecline = () => {
    const consentData: ConsentData = {
      given: false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
      acceptedPolicies: [],
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
    setShowBanner(false);
    setShowDetails(false);
  };

  if (!showBanner) return null;

  // Modal for policy preview (simple version, or reuse existing modal)
  const PolicyModal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="relative max-w-lg w-full max-h-[80vh] bg-card rounded-2xl border border-border overflow-hidden">
          <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <h3 className="font-display font-semibold text-primary">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
          </div>
          <div className="overflow-y-auto p-6 max-h-[calc(80vh-60px)] text-sm text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg animate-slide-up">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {!showDetails ? (
            // Compact View
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="h-5 w-5 text-secondary shrink-0" />
                <span>
                  We use cookies and process your data to provide you with the best experience.
                  <button 
                    onClick={() => setShowDetails(true)}
                    className="ml-2 text-primary hover:underline font-medium"
                  >
                    Customize
                  </button>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleDecline}>
                  Decline
                </Button>
                <Button variant="cta" size="sm" onClick={handleAcceptAll} className="shimmer">
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            // Detailed View with Checkboxes
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-primary">Privacy Preferences</h3>
                <button onClick={() => setShowDetails(false)} className="p-1 rounded-lg hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {/* Privacy Policy Checkbox */}
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    id="consent-privacy"
                    checked={consents.privacyPolicy}
                    onChange={(e) => setConsents({ ...consents, privacyPolicy: e.target.checked })}
                    className="mt-0.5 rounded border-border/60 text-secondary focus:ring-secondary/30 w-4 h-4"
                  />
                  <div className="flex-1">
                    <label htmlFor="consent-privacy" className="font-medium text-foreground cursor-pointer">
                      Privacy Policy
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      I agree to the collection and processing of my personal data as described in the 
                      <button 
                        onClick={() => setShowPrivacy(true)} 
                        className="ml-1 text-primary hover:underline"
                      >
                        Privacy Policy
                      </button>
                    </p>
                  </div>
                </div>

                {/* Terms of Service Checkbox */}
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    id="consent-terms"
                    checked={consents.termsOfService}
                    onChange={(e) => setConsents({ ...consents, termsOfService: e.target.checked })}
                    className="mt-0.5 rounded border-border/60 text-secondary focus:ring-secondary/30 w-4 h-4"
                  />
                  <div className="flex-1">
                    <label htmlFor="consent-terms" className="font-medium text-foreground cursor-pointer">
                      Terms of Service
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      I agree to the 
                      <button 
                        onClick={() => setShowTerms(true)} 
                        className="ml-1 text-primary hover:underline"
                      >
                        Terms of Service
                      </button>
                      and confirm that I am at least 18 years old.
                    </p>
                  </div>
                </div>

                {/* Cookies Policy Checkbox */}
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    id="consent-cookies"
                    checked={consents.cookiesPolicy}
                    onChange={(e) => setConsents({ ...consents, cookiesPolicy: e.target.checked })}
                    className="mt-0.5 rounded border-border/60 text-secondary focus:ring-secondary/30 w-4 h-4"
                  />
                  <div className="flex-1">
                    <label htmlFor="consent-cookies" className="font-medium text-foreground cursor-pointer">
                      Cookies Policy
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      I agree to the use of cookies as described in the 
                      <button 
                        onClick={() => setShowCookies(true)} 
                        className="ml-1 text-primary hover:underline"
                      >
                        Cookies Policy
                      </button>
                    </p>
                  </div>
                </div>

                {/* Data Processing Checkbox */}
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    id="consent-data"
                    checked={consents.dataProcessing}
                    onChange={(e) => setConsents({ ...consents, dataProcessing: e.target.checked })}
                    className="mt-0.5 rounded border-border/60 text-secondary focus:ring-secondary/30 w-4 h-4"
                  />
                  <div className="flex-1">
                    <label htmlFor="consent-data" className="font-medium text-foreground cursor-pointer">
                      Data Processing
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      I consent to my data being used for AI-powered career guidance and matching purposes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={handleDecline}>
                  Decline All
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => setShowDetails(false)}>
                    Back
                  </Button>
                  <Button 
                    variant="cta" 
                    size="sm" 
                    onClick={handleAcceptSelected}
                    disabled={!allChecked()}
                    className={cn(!allChecked() && "opacity-50 cursor-not-allowed")}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept Selected
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Policy Modals */}
      <PolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h4 className="font-semibold text-foreground mt-4 mb-2">1. Information We Collect</h4>
        <p>We collect information you provide directly to us, including your name, email address, phone number, CV/resume data, career preferences, and usage information.</p>
        <h4 className="font-semibold text-foreground mt-4 mb-2">2. How We Use Your Information</h4>
        <p>We use your information to provide AI-powered career guidance, analyze your CV for opportunities, match you with potential employers, personalize your experience, and improve our services.</p>
        <h4 className="font-semibold text-foreground mt-4 mb-2">3. Data Security</h4>
        <p>We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information.</p>
        <h4 className="font-semibold text-foreground mt-4 mb-2">4. Your Rights</h4>
        <p>You have the right to access, correct, or delete your personal data. Contact us at privacy@empowa-ai.co.za for any privacy concerns.</p>
      </PolicyModal>

      <PolicyModal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms of Service">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h4 className="font-semibold text-foreground mt-4 mb-2">1. Acceptance of Terms</h4>
        <p>By accessing or using EmpowAI, you agree to be bound by these Terms of Service.</p>
        <h4 className="font-semibold text-foreground mt-4 mb-2">2. User Accounts</h4>
        <p>You must be at least 18 years old to use this service. You are responsible for maintaining account security and all activities under your account.</p>
        <h4 className="font-semibold text-foreground mt-4 mb-2">3. AI Services</h4>
        <p>Our AI provides recommendations based on your data. These are suggestions only - final career decisions are yours alone.</p>
      </PolicyModal>

      <PolicyModal isOpen={showCookies} onClose={() => setShowCookies(false)} title="Cookies Policy">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h4 className="font-semibold text-foreground mt-4 mb-2">What Are Cookies?</h4>
        <p>Cookies are small text files stored on your device that help us provide and improve our services.</p>
        <h4 className="font-semibold text-foreground mt-4 mb-2">Types of Cookies We Use</h4>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
          <li><strong>Preference Cookies:</strong> Remember your settings like language and theme</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
        </ul>
      </PolicyModal>
    </>
  );
}