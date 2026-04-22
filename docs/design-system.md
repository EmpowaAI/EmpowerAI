# EmpowAI Design System — Complete Reference

Last updated: 2026-04-22

## 1) Color Palette (2-Color Restrained)

| Token | HSL Value | Hex (Approx) | Usage |
|---|---:|---:|---|
| Primary Navy | `hsl(218 64% 28%)` | `#1a3a6b` | Headers, buttons, text, borders |
| Secondary Orange | `hsl(22 95% 55%)` | `#f97316` | CTAs, accents, highlights, badges |
| Warm Background | `hsl(40 33% 98%)` | `#fcfbf9` | Page background |
| Card Background | `hsl(0 0% 100%)` | `#ffffff` | Cards, popovers |
| Foreground | `hsl(220 55% 18%)` | `#1e293b` | Body text |
| Muted Text | `hsl(220 20% 42%)` | `#64748b` | Secondary text |

## 2) CSS Design Tokens (from `index.css`)

```css
:root {
  /* Core Colors */
  --background: 40 33% 98%;
  --foreground: 220 55% 18%;
  --primary: 218 64% 28%;
  --primary-foreground: 40 33% 98%;
  --secondary: 22 95% 55%;
  --secondary-foreground: 0 0% 100%;

  /* Accents */
  --accent-orange: 18 92% 58%;
  --muted: 38 28% 94%;
  --muted-foreground: 220 20% 42%;

  /* Border & UI */
  --border: 30 20% 88%;
  --input: 30 20% 88%;
  --ring: 218 64% 28%;
  --radius: 0.625rem;

  /* Gradients (CRITICAL - Navy → Orange ONLY) */
  --gradient-ai: linear-gradient(135deg, hsl(218 64% 28%) 0%, hsl(22 95% 55%) 100%);
  --gradient-hero: linear-gradient(
    110deg,
    hsl(218 64% 32%) 0%,
    hsl(218 60% 45%) 45%,
    hsl(22 88% 60%) 100%
  );
  --gradient-cta: linear-gradient(180deg, hsl(22 95% 60%) 0%, hsl(18 92% 50%) 100%);

  /* Shadows */
  --shadow-glow: 0 10px 30px -12px hsl(22 95% 50% / 0.35);
  --shadow-card: 0 4px 20px -8px hsl(218 64% 28% / 0.15);
  --shadow-cta: 0 8px 24px -8px hsl(22 95% 50% / 0.45);
}
```

## 3) Advanced CSS Utilities

### AI Mesh Background — Animated blobs

```css
.ai-mesh::before {
  background: radial-gradient(circle, hsl(218 64% 32% / 0.45), transparent 65%);
  animation: floatBlob 14s ease-in-out infinite;
}
.ai-mesh::after {
  background: radial-gradient(circle, hsl(22 95% 55% / 0.45), transparent 65%);
  animation-delay: -7s;
}
@keyframes floatBlob {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(40px, -30px) scale(1.08);
  }
}
```

### Shimmer Effect for CTAs

```css
.shimmer::after {
  background: linear-gradient(
    110deg,
    transparent 30%,
    hsl(0 0% 100% / 0.35) 50%,
    transparent 70%
  );
  animation: shimmerSweep 3.2s ease-in-out infinite;
}
@keyframes shimmerSweep {
  to {
    transform: translateX(120%);
  }
}
```

### Pulsing AI Dot

```css
.ai-dot {
  background: hsl(var(--secondary));
  box-shadow: 0 0 0 0 hsl(var(--secondary) / 0.7);
  animation: aiPulse 1.8s ease-out infinite;
}
@keyframes aiPulse {
  70% {
    box-shadow: 0 0 0 12px hsl(var(--secondary) / 0);
  }
}
```

### Tech Grid Pattern

```css
.ai-grid {
  background-image: linear-gradient(hsl(0 0% 100% / 0.08) 1px, transparent 1px),
    linear-gradient(90deg, hsl(0 0% 100% / 0.08) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse at center, black 40%, transparent 75%);
}
```

### Gradient Text

```css
.text-gradient-ai {
  background: linear-gradient(90deg, #fff 0%, hsl(22 95% 78%) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

## 4) Typography

### Tailwind config

```js
fontFamily: {
  sans: ["Inter", "system-ui", "sans-serif"],
  display: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
}
```

## 5) Layout Patterns

### Hero section structure

```tsx
<section className="relative bg-hero-gradient ai-grid ai-mesh">
  {/* Top SA badge pill */}
  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
    <span className="ai-dot"></span>
    <span>🇿🇦 Powered by Ubuntu</span>
  </div>

  {/* Tech signal strip */}
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="w-1 h-3 rounded-full bg-white/60" />
    ))}
  </div>
</section>
```

### Featured story layout (2-column grid)

```tsx
<div className="grid lg:grid-cols-2 gap-6">
  {/* LEFT - Profile Card */}
  <Card>
    {/* Profile header with SA badge */}
    <Badge variant="outline" className="bg-white/90 text-primary border-primary/20">
      🇿🇦 Cape Town, WC
    </Badge>

    {/* Empowerment Score */}
    <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-accent-orange/5 rounded-lg">
      <div className="text-3xl font-bold text-primary">85/100</div>
      <div className="text-sm text-muted-foreground">Empowerment Score</div>
    </div>

    {/* Income Transformation */}
    <div className="flex items-center justify-between p-4">
      <div>
        <div className="text-sm text-muted-foreground">Before</div>
        <div className="text-lg font-semibold text-muted-foreground">R0</div>
      </div>
      <ArrowRight className="h-5 w-5 text-secondary" />
      <div>
        <div className="text-sm text-muted-foreground">After 8 months</div>
        <div className="text-2xl font-bold text-primary">R4,500</div>
      </div>
    </div>

    {/* 3 Stat tiles */}
    <div className="grid grid-cols-3 gap-3">
      <div className="text-center p-3 bg-secondary/5 rounded-lg">
        <div className="text-xl font-bold text-secondary">6</div>
        <div className="text-xs text-muted-foreground">Gigs</div>
      </div>
      {/* ... */}
    </div>
  </Card>

  {/* RIGHT - Journey List */}
  <div className="flex flex-col gap-4">
    <Card>
      <ol className="space-y-3">
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/10 text-secondary text-sm font-semibold flex items-center justify-center">
            1
          </span>
          <span className="text-sm">CV upload → AI skills extraction</span>
        </li>
        {/* ... steps 2-5 */}
      </ol>
    </Card>

    {/* Quote Block */}
    <div className="p-4 border-l-4 border-secondary bg-secondary/5 rounded-r-lg">
      <p className="italic text-primary font-medium">
        "EmpowAI taught me that ubuntu is a business strategy."
      </p>
    </div>
  </div>
</div>
```

### Testimonial cards

```tsx
<Card className="bg-primary text-primary-foreground overflow-hidden relative">
  {/* SA flag corner accent */}
  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-secondary/20 to-transparent" />

  <Quote className="h-8 w-8 text-secondary/40" />
  <p className="italic">"...empowered me to become self-sustaining..."</p>

  <div className="flex items-center gap-3">
    <Avatar />
    <div>
      <p className="font-semibold">Nasiphi B.</p>
      <p className="text-sm opacity-90">🇿🇦 Eastern Cape</p>
    </div>
  </div>
</Card>
```

## 6) South African Branding Elements

### Localization text

- “Amandla e-Ubuntu” → Power of Ubuntu (hero eyebrow)
- “Izinsiza Zethu” → Our Tools (section header)
- “Indlela” → The Path (featured story label)
- “Izindaba Zempumelelo” → Success Stories (testimonials header)
- “Mahala” → Free (badge on pricing/features)
- “Siyaqala!” → Let’s Begin! (CTA)

### Regional tags

- Cape Town, WC
- Durban, KZN
- Johannesburg, GP
- Eastern Cape

## 7) Button Variants (from `button.tsx`)

```
cta: "bg-cta-gradient text-white shadow-cta hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-smooth font-semibold",
outlineLight: "border-2 border-white/90 bg-white/0 text-white hover:bg-white/10 backdrop-blur-sm font-semibold transition-smooth",
```

## Implementation Prompt (for other assistants)

Paste this entire specification to Gemini/Claude with your original codebase and request:

> Apply this exact design system with navy/orange 2-color palette, the gradient definitions, the Featured Story 2-column layout, and all SA branding elements.

