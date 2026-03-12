import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Briefcase, Clock, ExternalLink } from "lucide-react"
import { applicationsAPI } from "../../lib/api"
import LoadingState from "../../components/shared/LoadingState"
import EmptyState from "../../components/EmptyState"
import ErrorAlert from "../../components/shared/ErrorAlert"
import LoadingButton from "../../components/LoadingButton"

interface ApplicationItem {
  id: string
  appliedAt: string
  opportunity: {
    id: string
    title: string
    company: string
    location: string
    type: string
    applicationUrl?: string
  }
}

export default function Applications() {
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [openingId, setOpeningId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const response = await applicationsAPI.getMy()
        if (response.status === "success") {
          const items = (response.data?.applications || []).map((app: any) => ({
            id: app._id || app.id,
            appliedAt: app.createdAt,
            opportunity: {
              id: app.opportunityId?._id || app.opportunityId?.id || app.opportunityId,
              title: app.opportunityId?.title || "Opportunity",
              company: app.opportunityId?.company || "Company",
              location: app.opportunityId?.location || app.opportunityId?.province?.join(", ") || "Location TBD",
              type: app.opportunityId?.type || "job",
              applicationUrl: app.applicationUrl || app.opportunityId?.applicationUrl
            }
          }))
          setApplications(items)
        }
      } catch (e: any) {
        setError(e.message || "Failed to load applications.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleOpen = async (app: ApplicationItem) => {
    if (!app.opportunity.applicationUrl) return
    setOpeningId(app.id)
    const url = app.opportunity.applicationUrl.startsWith("http")
      ? app.opportunity.applicationUrl
      : `https://${app.opportunity.applicationUrl}`
    window.open(url, "_blank", "noopener,noreferrer")
    setOpeningId(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
          <p className="text-muted-foreground">Track jobs you've applied to</p>
        </div>
        <LoadingState message="Loading applications..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
        <p className="text-muted-foreground">Track jobs you've applied to</p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

      {applications.length === 0 && !error ? (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="Apply to opportunities and they will appear here."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground break-words">{app.opportunity.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">{app.opportunity.company}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" /> {app.opportunity.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" /> Applied {new Date(app.appliedAt).toLocaleDateString("en-ZA")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <Link
                    to={`/dashboard/opportunities#${app.opportunity.id}`}
                    className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground bg-card"
                  >
                    View details
                  </Link>
                  {app.opportunity.applicationUrl && (
                    <LoadingButton
                      onClick={() => handleOpen(app)}
                      isLoading={openingId === app.id}
                      loadingText="Opening..."
                      icon={<ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Open link
                    </LoadingButton>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
