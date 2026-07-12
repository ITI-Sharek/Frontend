> Status: Superseded
>
> This brief has been superseded by the current phase brief.
> It remains available for historical context only and must not
> be used as the implementation source of truth.
>
> Superseded on 2026-07-12 (decision DEC-018, see `docs/governance/decision-log.md`).
> In particular: the Figma file is **no longer** the visual source of truth — the approved
> visual direction is **Registry** (DEC-008, `docs/design/visual-directions.md`), and the
> UX foundation lives in `docs/design/`.

I kept the useful Share-k context, the attached Figma as the visual source of truth, the provided logo, and the frontend repository—while removing the design-system compiler instructions that are unrelated to building the actual website. 

You are a Senior Product Designer, UI/UX Designer, Motion Designer, and React Frontend Engineer working inside Claude Design.

Your task is to design and implement a complete, polished, high-fidelity website for **Share-k**.

Do not create only a design system, isolated components, or a basic landing-page mockup. Create a cohesive website experience with real pages, responsive layouts, realistic content, reusable components, meaningful interactions, and carefully selected motion effects.

---

# 1. Product Context

## Product Name

Share-k

## Product Description

Share-k is an AI-powered open-source collaboration platform that connects developers with real-world projects.

The platform analyzes GitHub activity, validates technical skills, and matches contributors with suitable projects and tasks.

Share-k helps:

* Developers gain practical open-source experience.
* Contributors build trusted skill profiles and reputations.
* Project owners discover qualified contributors.
* Administrators review AI-generated skill assessments before accounts become fully active.
* Open-source teams find contributors based on verified experience rather than self-reported skills alone.

The visual experience should communicate:

* Trust
* Technical credibility
* Collaboration
* Open-source culture
* Career growth
* AI-assisted intelligence
* Transparency
* Community

The website must look like a serious developer platform—not a generic AI landing-page template.

---

# 2. Available Sources

Use the following sources before designing anything:

## Figma

An attached Figma file named:

`Sharek.fig`

The Figma file is the primary visual source of truth.

Inspect:

* Pages
* Frames
* Existing screens
* Components
* Color variables
* Typography
* Spacing
* Border radii
* Shadows
* Icons
* Illustrations
* Existing layouts
* Responsive variants
* Component states

Do not invent replacement styles when the Figma file already defines them.

Do not blindly copy generated Figma JSX. Study the design, extract its visual rules, and create clean production-quality React components.

## Logo

Use the provided logo:

`/mnt/data/ITI-OpenSourceDevelopment/Graduation/sharek-frontend/public/logo-1.png`

Do not recreate, redraw, recolor, distort, or replace the logo unless a specific existing variation is provided.

## Existing Frontend Repository

Inspect the attached GitHub repository:

`ITI-Sharek/Frontend`

Before implementing, identify:

* Framework and routing solution
* Existing folder structure
* Styling system
* Existing components
* Installed animation libraries
* Existing icons
* Existing design tokens
* State-management approach
* Data-fetching architecture
* Existing pages
* Existing authentication flow
* Existing responsive conventions

Respect the current architecture instead of replacing it unnecessarily.

If the Figma file or frontend repository cannot be accessed, clearly report the missing resource instead of inventing its content.

---

# 3. Main Objective

Create a modern, distinctive, responsive website that combines:

1. The existing Share-k visual identity.
2. A trustworthy developer-focused product experience.
3. Carefully chosen React Bits components.
4. Purposeful motion effects.
5. Strong information hierarchy.
6. Production-quality React architecture.
7. Excellent desktop and mobile usability.

The website should feel alive and interactive, but motion must support the content rather than distract from it.

---

# 4. Visual Direction

Use the attached Figma file as the source of truth for colors, typography, spacing, radii, shadows, and visual motifs.

The final design should feel:

* Technical but approachable
* Modern but not trendy for its own sake
* Professional
* Developer-oriented
* Community-driven
* Clean and structured
* Visually rich without becoming noisy
* Confident rather than overly futuristic

Avoid the common appearance of generic AI-generated websites.

Do not default to:

* Large purple-blue gradients
* Excessive glassmorphism
* Random glowing blobs
* Decorative gradients behind every section
* Huge text that consumes the entire viewport
* Excessively rounded cards
* Floating cards without structural meaning
* Emoji as product icons
* Generic dashboard illustrations
* Unnecessary 3D objects
* Animation on every element
* Identical card grids throughout the page

Use developer-oriented visual motifs only when appropriate, such as:

* Contribution graphs
* Git branches
* Repository cards
* Pull-request states
* Technology tags
* Code snippets
* Skill graphs
* Verification indicators
* Project activity
* Contributor reputation
* Matching scores

These motifs must be subtle and must not make the interface look like a GitHub clone.

---

# 5. Required Website Pages

Create the following core pages.

## 5.1 Marketing Home Page

The home page must include:

### Navigation

Include:

* Share-k logo
* Explore Projects
* How It Works
* For Developers
* For Project Owners
* Community
* Sign In
* Get Started

The navigation should become compact and usable on mobile.

A subtle animated navigation indicator may be used.

### Hero Section

The hero must immediately explain:

* What Share-k does
* Who it serves
* Why its skill verification and project matching are valuable

Suggested content direction:

**Build experience that can be verified.**

Connect your GitHub account, discover open-source projects matched to your skills, contribute to meaningful work, and grow a trusted developer profile.

Include:

* One strong primary CTA
* One secondary CTA
* A visual product preview
* Trust or activity indicators
* A concise explanation of GitHub-based skill profiling

Do not use an unrelated stock image.

The hero visual should represent the actual product, such as:

* A developer skill profile
* A project match
* Repository analysis
* Contribution activity
* Verified skills
* AI-generated recommendations

### Trust and Community Section

Show realistic platform indicators such as:

* Active contributors
* Open-source projects
* Verified skill profiles
* Successful contributions

Do not use fabricated claims presented as real company metrics. Mark them as sample data when necessary.

### How Share-k Works

Explain the workflow clearly:

1. Connect GitHub
2. Share-k analyzes repositories and contributions
3. Skills are generated and reviewed
4. Suitable projects and tasks are recommended
5. Contributions build reputation and experience

Use a visual process rather than five disconnected cards.

### Featured Projects

Show realistic project cards containing:

* Project name
* Description
* Repository visibility
* Main technologies
* Difficulty
* Contributors needed
* Open tasks
* Maintainer
* Activity
* Match score
* Verification status

Cards should not all have identical visual weight.

### AI Skill Profiling Section

Visualize the GitHub skill-profiling pipeline:

* Repository collection
* Language and technology analysis
* Contribution analysis
* Skill-level estimation
* Admin review
* Verified profile activation

Make it clear that AI-generated results enter a pending-review state before full activation.

### Contributor and Project-Owner Benefits

Create a balanced comparison between:

* Developers looking for experience
* Maintainers looking for contributors

Do not create two generic feature-card columns. Use a more editorial and visually differentiated layout.

### Developer Profile Preview

Show a realistic profile containing:

* Developer identity
* GitHub connection
* Verified skills
* Skill levels
* Contributions
* Reputation
* Completed tasks
* Project history
* Endorsements or reviews
* Availability
* Matching preferences

### Testimonials or Community Stories

Use realistic developer and maintainer stories.

Avoid generic quotes such as “This platform changed my life.”

Each story should mention a specific outcome, such as:

* First accepted open-source pull request
* Finding a contributor with the required stack
* Building verifiable backend experience
* Moving from beginner tasks to project ownership

### Final CTA

End with a strong action that feels like the natural conclusion of the page.

Example direction:

**Your next meaningful contribution is waiting.**

Include separate entry points for:

* Developers
* Project owners

### Footer

Include:

* Product
* Community
* Resources
* Company
* Legal
* GitHub
* Social links
* Copyright
* Language or theme controls when appropriate

---

## 5.2 Explore Projects Page

Create a project-discovery experience with:

* Search
* Technology filters
* Skill-level filters
* Project category
* Difficulty
* Activity level
* Remote or location options when relevant
* Contribution type
* Issue labels
* Match score
* Sort options

The result grid should support:

* Loading state
* Empty state
* Error state
* No-match state
* Saved projects
* Recently viewed projects

On desktop, filters may use a sidebar or expandable toolbar.

On mobile, filters must open in an accessible sheet or drawer.

---

## 5.3 Project Details Page

Include:

* Project overview
* Repository information
* Maintainer information
* Technologies
* Contribution guidelines
* Open tasks
* Difficulty
* Required skills
* Nice-to-have skills
* Activity timeline
* Existing contributors
* Project health
* Match explanation
* Save project
* Apply or request task
* External repository link

Show why the developer matches the project instead of displaying only a percentage.

Example:

* Strong React contribution history
* Intermediate TypeScript experience
* Previous testing contributions
* Missing Docker experience

---

## 5.4 Developer Profile Page

Include:

* Profile header
* GitHub connection status
* Verification status
* AI-generated skill summary
* Admin-reviewed skills
* Skill-level visualization
* Repositories analyzed
* Contribution activity
* Languages and technologies
* Completed platform tasks
* Reviews
* Badges
* Open-source history
* Availability
* Preferred project types

Differentiate between:

* AI-generated
* User-edited
* Admin-verified
* Community-endorsed

Do not make every skill appear equally trustworthy.

---

## 5.5 Dashboard

Create a practical developer dashboard containing:

* Recommended projects
* Assigned tasks
* Saved projects
* Pending applications
* Contribution progress
* Profile-completion status
* GitHub sync status
* Notifications
* Recent activity
* Skill-profile review status

The dashboard should prioritize actions, not just metrics.

---

## 5.6 Authentication and GitHub Onboarding

Create:

* Sign-in page
* Registration page
* GitHub connection step
* Repository permission explanation
* Profile-analysis progress
* Pending admin-review state
* Approved state
* Rejected or needs-changes state

Clearly explain what GitHub data will be accessed and why.

Do not make the OAuth permission step feel suspicious or unclear.

---

# 6. React Bits Integration

Use React Bits components selectively and intentionally.

Do not add React Bits merely to satisfy a checklist.

Use approximately **five to eight meaningful React Bits integrations across the website**, depending on what fits the design.

Before using a component:

1. Inspect its current implementation.
2. Check its dependencies.
3. Confirm that it works with the existing project.
4. Adapt its styling to Share-k’s design tokens.
5. Preserve accessibility.
6. Preserve required license or attribution.
7. Avoid adding duplicate animation libraries.

Potential components and suitable uses include:

## Hero Background

Choose only one subtle option where appropriate:

* Threads
* Aurora
* Orb
* Dot Grid
* Grid Motion
* Light Rays

The background must remain subordinate to the content.

Do not reduce text contrast or make the hero difficult to read.

## Hero Heading

Consider:

* Split Text
* Blur Text
* Decrypted Text
* Rotating Text

Use only one primary heading effect.

The hero statement must remain readable without animation.

## Navigation

Consider:

* Gooey Nav
* Pill Nav
* Dock

Use a desktop navigation effect only when it remains professional and keyboard-accessible.

Do not force a desktop effect into the mobile navigation.

## Project Cards

Consider:

* Spotlight Card
* Tilted Card
* Glare Hover
* Pixel Card

Use subtle hover movement.

Do not make project cards difficult to click, scan, or compare.

## Project Showcase

Consider:

* Circular Gallery
* Infinite Scroll
* Masonry
* Animated List

Circular Gallery should be used only if it improves project discovery or featured-project storytelling.

It must not become the only way to browse projects.

## Technology or Partner Logos

Use:

* Logo Loop

Keep logo speed slow and pause or reduce motion on interaction.

## Statistics

Consider:

* Count Up
* Rolling Text

Statistics must not repeatedly animate whenever the user scrolls slightly.

## CTA Interaction

Consider:

* Magnet
* Shiny Text
* Star Border

Keep button movement controlled.

The clickable target must not escape the pointer or harm usability.

## Profile or Skill Visualization

Consider:

* Animated List
* Stepper
* Flowing Menu
* Scroll Reveal

Use these to explain progression, not as decoration.

---

# 7. Motion Design System

Motion must be purposeful and consistent.

## Motion Principles

Use motion to:

* Direct attention
* Explain relationships
* Confirm interaction
* Reveal hierarchy
* Communicate progress
* Show system status
* Make transitions understandable

Do not use motion solely because a component supports it.

## Timing Guidance

Use approximately:

* Hover and press feedback: 120–220ms
* Menu and small component transitions: 180–300ms
* Modal or drawer transitions: 220–400ms
* Section reveals: 450–750ms
* Hero entrance sequence: 600–1000ms
* Large background loops: slow and nearly imperceptible

Use consistent easing across the product.

Prefer smooth deceleration rather than excessive bounce.

## Scroll Motion

Use scroll-triggered animation sparingly.

Rules:

* Animate sections only on their first meaningful entrance.
* Do not animate every paragraph independently.
* Group related elements.
* Avoid long opacity delays.
* Do not hide important content until JavaScript runs.
* Never trap scrolling.
* Avoid aggressive parallax.
* Disable or simplify parallax on mobile.

## Hover Motion

Recommended limits:

* Translation: approximately 2–6px
* Scale: approximately 1.01–1.03
* Rotation: extremely subtle
* Shadow transitions: controlled
* Border or glow changes: low intensity

Cards must not swing, rotate heavily, or move away from the pointer.

## Page Transitions

Use subtle transitions between major pages when supported by the existing routing system.

Do not delay navigation for decorative animation.

## Reduced Motion

Fully respect:

`prefers-reduced-motion`

When reduced motion is enabled:

* Remove continuous background movement
* Remove parallax
* Replace complex entrances with simple fades
* Stop auto-moving galleries
* Avoid animated number rolling
* Keep all content immediately accessible

## Performance

* Pause continuous animations when outside the viewport.
* Avoid animating layout properties when transforms can be used.
* Avoid multiple full-screen canvas effects.
* Do not load several heavy WebGL effects on the same page.
* Lazy-load expensive visual sections.
* Test performance on mobile.
* Avoid animation memory leaks.
* Clean up observers, timelines, and event listeners.

---

# 8. Responsive Design

Design and verify at minimum:

* 1440px desktop
* 1280px laptop
* 1024px tablet landscape
* 768px tablet
* 390px mobile
* 360px narrow mobile

Do not simply stack desktop cards vertically.

Redesign interactions for mobile:

* Replace large navigation with an accessible menu.
* Replace desktop filter panels with drawers or sheets.
* Reduce background animation.
* Reduce card tilt.
* Reduce section density.
* Keep CTA buttons reachable.
* Preserve readable line lengths.
* Ensure project details remain scannable.
* Avoid horizontal overflow.

Minimum interactive target size should remain comfortable for touch input.

---

# 9. Accessibility

The website must include:

* Semantic HTML
* Logical heading order
* Keyboard navigation
* Visible focus styles
* Accessible dialogs and drawers
* Proper labels
* Meaningful alt text
* Sufficient color contrast
* Screen-reader-friendly status messages
* Accessible loading and error states
* Reduced-motion support
* No hover-only essential information

React Bits effects must never reduce accessibility.

Decorative visual elements should be hidden from assistive technologies where appropriate.

---

# 10. Content Requirements

Use realistic Share-k content rather than lorem ipsum.

Create realistic examples for:

* Open-source projects
* Maintainers
* Developer profiles
* GitHub repositories
* Technologies
* Skill levels
* Project tasks
* Match explanations
* Reviews
* Contribution histories
* Notifications
* Approval states

The copy should be:

* Direct
* Credible
* Helpful
* Technical when necessary
* Free from exaggerated marketing claims
* Easy for non-native English speakers to understand

Avoid overusing terms such as:

* Revolutionary
* Next-generation
* Game-changing
* Unleash
* Supercharge
* Transform your journey

---

# 11. Technical Architecture

Follow the architecture already used in the frontend repository.

General requirements:

* Use React and TypeScript when supported by the existing project.
* Use reusable components.
* Keep pages small and composable.
* Separate presentation from data access.
* Do not place API calls directly inside deeply nested UI components.
* Use realistic mock data through a dedicated data layer until APIs are connected.
* Create typed models.
* Create reusable loading, empty, and error states.
* Reuse existing components before adding replacements.
* Avoid adding unnecessary dependencies.
* Avoid duplicating utilities already present in the repository.
* Preserve the existing routing and authentication patterns.
* Keep animations in reusable wrappers or feature-specific motion modules.
* Keep React Bits adaptations separate from business logic.

Suggested organization—only when compatible with the current repository:

```text
src/
  components/
    ui/
    motion/
    react-bits/
  features/
    auth/
    onboarding/
    projects/
    profiles/
    dashboard/
  layouts/
  pages/
  routes/
  data/
  hooks/
  lib/
  styles/
```

Do not restructure the entire repository solely to match this example.

---

# 12. Component Requirements

Create reusable components for recurring patterns such as:

* Main navigation
* Mobile navigation
* Page container
* Section heading
* Project card
* Featured project card
* Skill badge
* Verified badge
* Match indicator
* Match explanation
* Contributor card
* Maintainer card
* GitHub repository card
* Activity timeline
* Empty state
* Error state
* Skeleton state
* Filter controls
* Search field
* Pagination
* Profile header
* Skill chart
* Review card
* Notification item
* Status banner
* CTA section
* Footer

Use variants instead of duplicating near-identical components.

---

# 13. Interaction States

Every interactive component must include the appropriate states:

* Default
* Hover
* Focus
* Active
* Disabled
* Loading
* Success
* Error
* Selected
* Empty
* Pending
* Verified
* Rejected

Important flows must be demonstrable with static or mocked interactions.

Examples:

* Save and unsave a project
* Open filters
* Apply to a project task
* View match details
* Connect GitHub
* Show analysis progress
* Display admin-review pending state
* Switch dashboard views
* Open notifications
* Navigate to project details

---

# 14. Implementation Workflow

Follow this order.

## Phase 1: Exploration

Before writing major UI code:

1. Inspect the Figma structure.
2. Inspect design tokens.
3. Inspect existing components.
4. Inspect the frontend repository.
5. Identify the current technology stack.
6. Identify available assets.
7. Identify existing page coverage.
8. Identify existing animation dependencies.
9. Identify which React Bits components can be integrated safely.

Do not begin by generating a generic hero section.

## Phase 2: Design Direction

Define internally:

* Visual hierarchy
* Page structure
* Motion language
* Component strategy
* Responsive behavior
* React Bits component mapping

Use the Figma source rather than public-library defaults.

## Phase 3: Foundations

Implement or reuse:

* Colors
* Typography
* Spacing
* Containers
* Breakpoints
* Radii
* Shadows
* Motion tokens
* Focus styles
* Global reduced-motion behavior

## Phase 4: Reusable Components

Build the shared application components and adapted React Bits components.

## Phase 5: Pages

Implement the required pages in priority order:

1. Home
2. Explore Projects
3. Project Details
4. Developer Profile
5. Dashboard
6. Authentication and GitHub onboarding

Do not stop after the hero or home page.

## Phase 6: Visual Validation

Run the project and inspect it visually.

When browser automation is available, use Playwright to verify:

* Desktop layout
* Tablet layout
* Mobile layout
* Navigation
* Filters
* Dialogs
* Drawers
* Hover states
* Focus states
* Animation behavior
* Reduced-motion behavior
* Page transitions
* Console errors
* Horizontal overflow

Capture screenshots of the primary pages at desktop and mobile sizes.

## Phase 7: Iteration

Perform at least two visual-review passes.

During each pass, check:

* Alignment
* Spacing consistency
* Typography
* Contrast
* Visual density
* Motion timing
* Component repetition
* Mobile usability
* Design fidelity
* Product credibility

Fix visible issues rather than merely documenting them.

---

# 15. Important Restrictions

Do not:

* Generate a generic SaaS template.
* Build only a hero section.
* Build only static design-system cards.
* Ignore the attached Figma file.
* Replace existing brand colors with arbitrary gradients.
* Invent a new logo.
* use random React Bits effects in every section.
* Add several competing background effects.
* Animate every heading.
* Use motion that blocks interaction.
* Make content dependent on animation.
* Use placeholder lorem ipsum.
* Mix business logic with visual animation code.
* Rewrite the entire frontend architecture unnecessarily.
* Install several overlapping animation libraries.
* leave major pages as empty placeholders.
* claim that mock statistics are real.
* sacrifice accessibility for visual effects.

---

# 16. Expected Final Result

The finished result should include:

* A cohesive Share-k website
* High-fidelity responsive pages
* Reusable React components
* Carefully adapted React Bits components
* A consistent motion system
* Realistic product content
* Accessible interactions
* Loading, empty, and error states
* Desktop and mobile layouts
* Clean architecture
* No critical console errors
* No obvious horizontal overflow
* Documentation of any new dependency
* Documentation of each React Bits component used
* Required React Bits license or attribution
* Screenshots or visual previews of the completed pages

At completion, provide a concise report containing:

1. Pages implemented
2. React Bits components used
3. Purpose of each animation
4. New dependencies added
5. Accessibility measures
6. Responsive breakpoints tested
7. Remaining caveats
8. Files or architecture changed

The final product should feel like a trustworthy open-source collaboration platform created specifically for developers—not a collection of disconnected animated sections.

A useful addition before sending it to Claude Design is attaching two or three screenshots of the most important existing Figma screens, especially the home page, project cards, and developer profile.
