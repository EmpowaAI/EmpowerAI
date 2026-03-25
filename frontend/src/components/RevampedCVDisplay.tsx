import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Download, Edit3, Save, Briefcase, GraduationCap,
  Award, Code, Globe, User, FileText
} from "lucide-react";
import jsPDF from "jspdf";
import type { RevampedCV } from "../services/aiService";

interface RevampedCVDisplayProps {
  cvData: RevampedCV;
}

// Helper function to clean degree text by removing dates
function cleanDegreeText(degree: string): { cleanDegree: string; dates: string } {
  let cleanDegree = degree;
  let dates = "";
  
  const dateMatch1 = degree.match(/(\d{4}\s*[–-]\s*\d{4})/);
  const dateMatch2 = degree.match(/\((\d{4}\s*[–-]\s*\d{4})\)/);
  const dateMatch3 = degree.match(/^(\d{4}\s*[–-]\s*\d{4})\s+/);
  
  if (dateMatch2) {
    dates = dateMatch2[1];
    cleanDegree = degree.replace(dateMatch2[0], '').trim();
  } else if (dateMatch1) {
    dates = dateMatch1[1];
    cleanDegree = degree.replace(dateMatch1[0], '').trim();
  } else if (dateMatch3) {
    dates = dateMatch3[1];
    cleanDegree = degree.replace(dateMatch3[0], '').trim();
  }
  
  cleanDegree = cleanDegree.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  
  if (dates) {
    dates = dates.replace(/-/g, '–');
  }
  
  return { cleanDegree, dates };
}

// Helper function to format education entries properly
function formatEducationForDisplay(education: Array<{ degree: string; institution: string; dates?: string; details?: string }>): Array<{ degree: string; institution: string; dates: string; details: string }> {
  const formattedEntries: Array<{ degree: string; institution: string; dates: string; details: string }> = [];
  
  for (const edu of education) {
    let degreeText = edu.degree || "";
    let institutionText = edu.institution || "";
    let datesText = edu.dates || "";
    let detailsText = edu.details || "";
    
    // Fix: Handle case where degree is empty but institution contains the program
    if (!degreeText && institutionText) {
      degreeText = institutionText;
      institutionText = "";
    }
    
    // Handle entries where institution is empty but degree contains institution name
    if (!institutionText && degreeText) {
      const institutionNames = ['ALX', 'TechBridle Foundation', 'TechBridle', 'University', 'College', 'Institute', 'Academy', 'School'];
      
      for (const name of institutionNames) {
        if (degreeText.startsWith(name)) {
          const afterName = degreeText.substring(name.length).trim();
          const dateMatch = afterName.match(/(\d{4}\s*[–-]\s*\d{4})/);
          let cleanAfterName = afterName;
          let extractedDates = "";
          
          if (dateMatch) {
            extractedDates = dateMatch[1];
            cleanAfterName = afterName.replace(dateMatch[0], '').trim();
          }
          
          degreeText = extractedDates ? `${cleanAfterName} (${extractedDates})` : cleanAfterName;
          institutionText = name;
          datesText = "";
          break;
        }
      }
    }
    
    if (datesText && !degreeText.includes(datesText)) {
      const cleaned = cleanDegreeText(degreeText);
      degreeText = cleaned.cleanDegree;
      datesText = cleaned.dates || datesText;
    } else {
      const cleaned = cleanDegreeText(degreeText);
      degreeText = cleaned.cleanDegree;
      if (cleaned.dates && !datesText) {
        datesText = cleaned.dates;
      }
    }
    
    if (datesText) {
      datesText = datesText.replace(/-/g, '–');
    }
    
    degreeText = degreeText.replace(/\s+/g, ' ').trim();
    institutionText = institutionText.replace(/\s+/g, ' ').trim();
    
    formattedEntries.push({
      degree: degreeText,
      institution: institutionText,
      dates: datesText,
      details: detailsText
    });
  }
  
  return formattedEntries;
}

export default function RevampedCVDisplay({ cvData }: RevampedCVDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<RevampedCV>(cvData);
  const [customFileName, setCustomFileName] = useState("ATS-Optimized-CV");
  const cvRef = useRef<HTMLDivElement>(null);

  const updateField = useCallback((path: string, value: string) => {
    setEditedData((prev: RevampedCV) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = isNaN(Number(keys[i])) ? keys[i] : Number(keys[i]);
        obj = obj[key];
      }
      const lastKey = isNaN(Number(keys[keys.length - 1])) ? keys[keys.length - 1] : Number(keys[keys.length - 1]);
      obj[lastKey] = value;
      return updated;
    });
  }, []);

  const data = editedData;
  const formattedEducation = data.education ? formatEducationForDisplay(data.education) : [];

  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = 18;

    const addPage = () => { doc.addPage(); y = 18; };
    const checkPageBreak = (needed: number) => { if (y + needed > 280) addPage(); };

    const LINE_HEIGHT = 4.5;
    const BLOCK_SPACING = 2.5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(data.name || "Your Name", pageWidth / 2, y, { align: "center" });
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    if (data.contactInfo) {
      doc.text(data.contactInfo, pageWidth / 2, y, { align: "center" });
      y += LINE_HEIGHT;
    }
    if (data.links) {
      doc.text(data.links, pageWidth / 2, y, { align: "center" });
      y += LINE_HEIGHT;
    }
    if (data.credentials) {
      doc.text(data.credentials, pageWidth / 2, y, { align: "center" });
      y += LINE_HEIGHT;
    }

    y += 2;
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    const addSectionHeader = (title: string) => {
      checkPageBreak(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(title.toUpperCase(), margin, y);
      y += LINE_HEIGHT - 1;
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 3;
    };

    const addWrappedText = (text: string, x: number, maxW: number, fontSize = 9, font = "normal") => {
      doc.setFont("helvetica", font);
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxW);
      for (const line of lines) {
        checkPageBreak(LINE_HEIGHT);
        doc.text(line, x, y);
        y += LINE_HEIGHT;
      }
    };

    if (data.professionalSummary) {
      addSectionHeader("Professional Summary");
      addWrappedText(data.professionalSummary, margin, contentWidth);
      y += 3;
    }

    if (data.technicalSkills && Object.keys(data.technicalSkills).length > 0) {
      addSectionHeader("Technical Skills");
      for (const [category, skills] of Object.entries(data.technicalSkills)) {
        checkPageBreak(LINE_HEIGHT);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        const catText = `${category}: `;
        doc.text(catText, margin, y);
        const catWidth = doc.getTextWidth(catText);
        doc.setFont("helvetica", "normal");
        const skillLines = doc.splitTextToSize(skills, contentWidth - catWidth);
        doc.text(skillLines[0], margin + catWidth, y);
        y += LINE_HEIGHT;
        for (let i = 1; i < skillLines.length; i++) {
          checkPageBreak(LINE_HEIGHT);
          doc.text(skillLines[i], margin, y);
          y += LINE_HEIGHT;
        }
      }
      y += 3;
    }

    if (data.experience && data.experience.length > 0) {
      addSectionHeader("Professional Experience");
      for (const exp of data.experience) {
        checkPageBreak(LINE_HEIGHT * 2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text(`${exp.title} | ${exp.company}`, margin, y);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text(exp.dates || "", pageWidth - margin, y, { align: "right" });
        y += LINE_HEIGHT;
        for (const bullet of exp.bullets) {
          checkPageBreak(LINE_HEIGHT);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const bulletLines = doc.splitTextToSize(`• ${bullet}`, contentWidth - 2);
          for (const line of bulletLines) {
            checkPageBreak(LINE_HEIGHT);
            doc.text(line, margin + 2, y);
            y += LINE_HEIGHT;
          }
        }
        y += BLOCK_SPACING;
      }
    }

    if (data.projects && data.projects.length > 0) {
      addSectionHeader("Projects");
      for (const proj of data.projects) {
        checkPageBreak(LINE_HEIGHT * 2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text(proj.name, margin, y);
        y += LINE_HEIGHT;
        if (proj.technologies) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8.5);
          doc.text(`Technologies: ${proj.technologies}`, margin, y);
          y += LINE_HEIGHT;
        }
        for (const bullet of proj.bullets) {
          checkPageBreak(LINE_HEIGHT);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const bulletLines = doc.splitTextToSize(`• ${bullet}`, contentWidth - 2);
          for (const line of bulletLines) {
            checkPageBreak(LINE_HEIGHT);
            doc.text(line, margin + 2, y);
            y += LINE_HEIGHT;
          }
        }
        y += BLOCK_SPACING;
      }
    }

    // Education
    if (formattedEducation.length > 0) {
      addSectionHeader("Education");

      for (let i = 0; i < formattedEducation.length; i++) {
        const edu = formattedEducation[i];
        checkPageBreak(12);

        const primaryLine = edu.dates ? `${edu.degree} (${edu.dates})` : edu.degree;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text(primaryLine, margin, y);
        y += LINE_HEIGHT;

        if (edu.institution && edu.institution.trim() !== "") {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(edu.institution, margin, y);
          y += LINE_HEIGHT;
        } else {
          y += LINE_HEIGHT;
        }

        if (edu.details) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          const lines = doc.splitTextToSize(edu.details, contentWidth);
          for (const line of lines) {
            checkPageBreak(LINE_HEIGHT);
            doc.text(line, margin, y);
            y += LINE_HEIGHT;
          }
        }

        if (i < formattedEducation.length - 1) {
          y += BLOCK_SPACING;
        }
      }

      y += 2;
    }

    // Languages - FIXED: No dashes, clean format
    if (data.languages && data.languages.length > 0) {
      addSectionHeader("Languages");
      for (let i = 0; i < data.languages.length; i++) {
        const lang = data.languages[i];
        checkPageBreak(LINE_HEIGHT);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        // Plain text without bullet points
        doc.text(lang, margin, y);
        y += LINE_HEIGHT;
      }
    }

    doc.save(`${customFileName}.pdf`);
  };

  const downloadTXT = () => {
    let text = `${data.name}\n`;
    if (data.contactInfo) text += `${data.contactInfo}\n`;
    if (data.links) text += `${data.links}\n`;
    if (data.credentials) text += `${data.credentials}\n`;
    text += `\n${"=".repeat(60)}\n\n`;
    
    if (data.professionalSummary) {
      text += `PROFESSIONAL SUMMARY\n${"-".repeat(40)}\n${data.professionalSummary}\n\n`;
    }
    
    if (data.technicalSkills) {
      text += `TECHNICAL SKILLS\n${"-".repeat(40)}\n`;
      for (const [cat, skills] of Object.entries(data.technicalSkills)) {
        text += `${cat}: ${skills}\n`;
      }
      text += "\n";
    }
    
    if (data.experience?.length) {
      text += `PROFESSIONAL EXPERIENCE\n${"-".repeat(40)}\n`;
      for (const exp of data.experience) {
        text += `\n${exp.title} | ${exp.company}\n${exp.dates || ""}\n`;
        for (const b of exp.bullets) text += `• ${b}\n`;
      }
      text += "\n";
    }
    
    if (data.projects?.length) {
      text += `PROJECTS\n${"-".repeat(40)}\n`;
      for (const p of data.projects) {
        text += `\n${p.name}\nTechnologies: ${p.technologies || "N/A"}\n`;
        for (const b of p.bullets) text += `• ${b}\n`;
      }
      text += "\n";
    }
    
    if (formattedEducation.length) {
      text += `EDUCATION\n${"-".repeat(40)}\n`;
      for (let i = 0; i < formattedEducation.length; i++) {
        const e = formattedEducation[i];
        const degreeText = e.dates ? `${e.degree} (${e.dates})` : e.degree;
        text += `${degreeText}\n`;
        if (e.institution && e.institution.trim() !== "") {
          text += `${e.institution}\n`;
        }
        if (e.details) text += `${e.details}\n`;
        if (i < formattedEducation.length - 1) {
          text += "\n";
        }
      }
      text += "\n";
    }
    
    // Languages - FIXED: No dashes, clean format
    if (data.languages?.length) {
      text += `LANGUAGES\n${"-".repeat(40)}\n`;
      for (let i = 0; i < data.languages.length; i++) {
        text += `${data.languages[i]}\n`;
      }
    }

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${customFileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const EditableText = ({ value, path, as: Tag = "span", className = "" }: {
    value: string; path: string; as?: any; className?: string;
  }) => {
    if (!isEditing) return <Tag className={className}>{value}</Tag>;
    return (
      <Tag
        contentEditable
        suppressContentEditableWarning
        className={`${className} outline-none focus:ring-1 focus:ring-primary/30 rounded px-1 inline-block`}
        onBlur={(e: React.FocusEvent<HTMLElement>) => updateField(path, e.currentTarget.textContent || "")}
      >
        {value}
      </Tag>
    );
  };

  // Education component with consistent styling
  const EducationEntry = ({ edu, index }: { edu: any; index: number }) => {
    let primaryLine = edu.degree || "";
    let secondaryLine = edu.institution || "";
    let datesDisplay = edu.dates || "";
    
    // Handle institution detection for ALX and TechBridle
    if (!secondaryLine && primaryLine) {
      const institutionNames = ['ALX', 'TechBridle Foundation', 'TechBridle', 'University', 'College', 'Institute', 'Academy', 'School'];
      
      for (const name of institutionNames) {
        if (primaryLine.startsWith(name)) {
          const afterName = primaryLine.substring(name.length).trim();
          const dateMatch = afterName.match(/(\d{4}\s*[–-]\s*\d{4})/);
          let cleanAfterName = afterName;
          let extractedDates = "";
          
          if (dateMatch) {
            extractedDates = dateMatch[1];
            cleanAfterName = afterName.replace(dateMatch[0], '').trim();
          }
          
          primaryLine = extractedDates ? `${cleanAfterName} (${extractedDates})` : cleanAfterName;
          secondaryLine = name;
          datesDisplay = "";
          break;
        }
      }
    }
    
    if (datesDisplay && !primaryLine.includes(datesDisplay) && !primaryLine.includes('(')) {
      primaryLine = `${primaryLine} (${datesDisplay})`;
    }
    
    if (!isEditing) {
      return (
        <div>
          {/* Primary line - BOLD */}
          <div className="text-sm font-semibold">
            {primaryLine}
          </div>
          {/* Secondary line - NORMAL */}
          {secondaryLine && secondaryLine.trim() !== "" && (
            <div className="text-sm text-muted-foreground">
              {secondaryLine}
            </div>
          )}
          {edu.details && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {edu.details}
            </div>
          )}
        </div>
      );
    }
    
    // Edit mode
    return (
      <div className="p-2 border border-dashed border-primary/30 rounded-lg mb-2">
        <div className="flex flex-col gap-2">
          <div>
            <span className="text-xs text-muted-foreground mr-2 font-medium">Degree/Program:</span>
            <EditableText 
              value={primaryLine} 
              path={`education.${index}.degree`} 
              className="text-sm font-semibold inline-block"
            />
          </div>
          <div>
            <span className="text-xs text-muted-foreground mr-2 font-medium">Institution:</span>
            <EditableText 
              value={secondaryLine} 
              path={`education.${index}.institution`} 
              className="text-sm text-muted-foreground inline-block"
            />
          </div>
          {edu.details && (
            <div>
              <span className="text-xs text-muted-foreground mr-2 font-medium">Details:</span>
              <EditableText 
                value={edu.details} 
                path={`education.${index}.details`} 
                className="text-xs text-muted-foreground inline-block"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!data || Object.keys(data).length === 0) {
    return <div className="text-center p-8">No CV data available</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-neon-green/20 flex items-center justify-center">
            <Award className="h-4 w-4 text-neon-green" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold">ATS-Optimized CV</h3>
            <p className="text-[10px] text-muted-foreground">Click Edit to modify before downloading</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={customFileName}
            onChange={(e) => setCustomFileName(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs w-40 focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="File name..."
          />
          <button
            onClick={() => { setIsEditing(!isEditing); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              isEditing
                ? "bg-neon-green/10 text-neon-green border border-neon-green/30"
                : "bg-secondary text-secondary-foreground border border-border hover:bg-muted"
            }`}
          >
            {isEditing ? <><Save className="h-3 w-3" /> Done</> : <><Edit3 className="h-3 w-3" /> Edit</>}
          </button>
          <button
            onClick={generatePDF}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <Download className="h-3 w-3" /> PDF
          </button>
          <button
            onClick={downloadTXT}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-all"
          >
            <FileText className="h-3 w-3" /> TXT
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mb-3 px-4 py-2 rounded-lg bg-neon-orange/10 border border-neon-orange/20 text-xs text-neon-orange flex items-center gap-2">
          <Edit3 className="h-3 w-3" />
          Click any text to edit. Education and language entries can be edited individually below.
        </div>
      )}

      {/* CV Preview */}
      <div ref={cvRef} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Header - 4 LINES */}
        <div className="px-6 sm:px-8 pt-8 pb-4 text-center border-b border-border">
          <EditableText 
            value={data.name || "Your Name"} 
            path="name" 
            as="h1" 
            className="text-xl sm:text-2xl font-display font-bold tracking-tight" 
          />
          {data.contactInfo && data.contactInfo.trim() !== "" && (
            <EditableText 
              value={data.contactInfo} 
              path="contactInfo" 
              as="p" 
              className="text-xs text-muted-foreground mt-2" 
            />
          )}
          {data.links && data.links.trim() !== "" && (
            <EditableText 
              value={data.links} 
              path="links" 
              as="p" 
              className="text-xs text-muted-foreground mt-1" 
            />
          )}
          {data.credentials && data.credentials.trim() !== "" && (
            <EditableText 
              value={data.credentials} 
              path="credentials" 
              as="p" 
              className="text-xs text-muted-foreground mt-1" 
            />
          )}
        </div>

        <div className="px-6 sm:px-8 py-6 space-y-6">
          {/* Professional Summary */}
          {data.professionalSummary && (
            <CVSection title="Professional Summary" icon={<User className="h-3.5 w-3.5" />}>
              <EditableText value={data.professionalSummary} path="professionalSummary" as="p" className="text-sm leading-relaxed text-muted-foreground" />
            </CVSection>
          )}

          {/* Technical Skills */}
          {data.technicalSkills && Object.keys(data.technicalSkills).length > 0 && (
            <CVSection title="Technical Skills" icon={<Code className="h-3.5 w-3.5" />}>
              <div className="space-y-1.5">
                {Object.entries(data.technicalSkills).map(([category, skills], index: number) => (
                  <div key={index} className="flex flex-wrap text-sm">
                    <span className="font-semibold mr-1">{category}:</span>
                    <EditableText value={skills as string} path={`technicalSkills.${category}`} className="text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CVSection>
          )}

          {/* Professional Experience */}
          {data.experience && data.experience.length > 0 && (
            <CVSection title="Professional Experience" icon={<Briefcase className="h-3.5 w-3.5" />}>
              <div className="space-y-5">
                {data.experience.map((exp: any, expIndex: number) => (
                  <div key={expIndex}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1 flex-wrap">
                        <EditableText value={exp.title} path={`experience.${expIndex}.title`} className="text-sm font-semibold" />
                        <span className="text-muted-foreground text-sm">|</span>
                        <EditableText value={exp.company} path={`experience.${expIndex}.company`} className="text-sm text-muted-foreground" />
                      </div>
                      <EditableText value={exp.dates || ""} path={`experience.${expIndex}.dates`} className="text-xs text-muted-foreground italic" />
                    </div>
                    <ul className="space-y-1 ml-1">
                      {exp.bullets.map((bullet: string, bulletIndex: number) => (
                        <li key={bulletIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                          <EditableText value={bullet} path={`experience.${expIndex}.bullets.${bulletIndex}`} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CVSection>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <CVSection title="Projects" icon={<Globe className="h-3.5 w-3.5" />}>
              <div className="space-y-4">
                {data.projects.map((proj: any, projIndex: number) => (
                  <div key={projIndex}>
                    <EditableText value={proj.name} path={`projects.${projIndex}.name`} className="text-sm font-semibold block" />
                    {proj.technologies && (
                      <p className="text-xs text-muted-foreground italic mt-0.5">
                        Technologies: <EditableText value={proj.technologies} path={`projects.${projIndex}.technologies`} />
                      </p>
                    )}
                    <ul className="space-y-1 mt-1 ml-1">
                      {proj.bullets.map((bullet: string, bulletIndex: number) => (
                        <li key={bulletIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                          <EditableText value={bullet} path={`projects.${projIndex}.bullets.${bulletIndex}`} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CVSection>
          )}

          {/* Education */}
          {formattedEducation.length > 0 && (
            <CVSection title="Education" icon={<GraduationCap className="h-3.5 w-3.5" />}>
              <div className="space-y-3">
                {formattedEducation.map((edu: any, eduIndex: number) => (
                  <EducationEntry key={eduIndex} edu={edu} index={eduIndex} />
                ))}
              </div>
            </CVSection>
          )}

          {/* Languages - FIXED: Editable, no dashes */}
          {data.languages && data.languages.length > 0 && (
            <CVSection title="Languages" icon={<Globe className="h-3.5 w-3.5" />}>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {data.languages.map((lang: string, langIndex: number) => (
                  <EditableText 
                    key={langIndex} 
                    value={lang} 
                    path={`languages.${langIndex}`} 
                    className="text-sm text-muted-foreground inline-block bg-muted/30 px-2 py-0.5 rounded-md"
                  />
                ))}
              </div>
            </CVSection>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CVSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-border">
        <span className="text-primary">{icon}</span>
        <h2 className="text-xs font-display font-bold uppercase tracking-widest text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}