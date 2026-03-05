import { useState } from 'react'

// Clean Components - Using Definitive System
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Loading from '../components/ui/Loading'

export default function CleanShowcase() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null)

  const demos = [
    {
      id: 'button',
      title: 'Clean Button System',
      description: 'Consistent colors, variants, and sizes',
      component: () => (
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="outline">Outline</Button>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>
      )
    },
    {
      id: 'card',
      title: 'Clean Card System',
      description: 'Professional cards with consistent styling',
      component: () => (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Clean Card Component</h3>
          <p className="text-muted-foreground mb-4">Professional, consistent, business-ready.</p>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h4 className="font-medium text-foreground">Feature 1</h4>
              <p className="text-sm text-muted-foreground">Clean design</p>
            </Card>
            <Card>
              <h4 className="font-medium text-foreground">Feature 2</h4>
              <p className="text-sm text-muted-foreground">Consistent colors</p>
            </Card>
          </div>
        </Card>
      )
    },
    {
      id: 'avatar',
      title: 'Clean Avatar System',
      description: 'Simple, professional avatars',
      component: () => (
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Avatar size="sm" variant="default" />
            <Avatar size="md" variant="primary" />
            <Avatar size="lg" variant="secondary" />
            <Avatar size="xl" variant="accent" />
          </div>
          <div className="flex gap-4 items-center">
            <Avatar size="md" variant="processing" />
            <Loading size="md" text="Processing..." />
          </div>
        </div>
      )
    }
  ]

  const ActiveDemoComponent = activeDemo 
    ? demos.find(d => d.id === activeDemo)?.component
    : null

  if (ActiveDemoComponent) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Button onClick={() => setActiveDemo(null)} className="mb-6">
            ← Back to Showcase
          </Button>
          <ActiveDemoComponent />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Hero Section */}
        <Card className="text-center">
          <Avatar size="xl" variant="primary" className="mb-6" />
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              EmpowerAI - Clean Design System
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Professional, consistent, billion-dollar ready
            </p>
          </div>
        </Card>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demos.map((demo) => (
            <Card key={demo.id} className="hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => setActiveDemo(demo.id)}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                  {demo.id.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{demo.title}</h3>
                  <p className="text-sm text-muted-foreground">{demo.description}</p>
                </div>
              </div>
              <div className="text-right">
                <Button size="sm">Try Demo</Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Status */}
        <Card className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">🎉 Clean Implementation Complete</h3>
          <p className="text-muted-foreground mb-6">
            All components now use a single, professional color system
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { status: "✅", label: "Unified Colors" },
              { status: "✅", label: "Clean Components" },
              { status: "✅", label: "Professional Design" },
              { status: "✅", label: "Consistent Styling" },
              { status: "✅", label: "Business Ready" },
              { status: "✅", label: "Scalable System" }
            ].map((item, i) => (
              <div key={i} className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-semibold text-primary">{item.status}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/vision-showcase'}>
              Original Showcase
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
