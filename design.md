# Businessgarh V1 — Design System

## 1. Design Vision

Businessgarh is a professional community platform for entrepreneurs, professionals, and members who want to connect, collaborate, and share ideas.

The interface should feel:

- Professional
- Modern
- Approachable
- Trustworthy
- Community-focused
- Simple and intuitive

Avoid generic AI-generated dashboard aesthetics. Every visual element should serve a clear usability purpose.

## 2. Brand Identity

**Product name:** Businessgarh

**Brand personality:** Professional, collaborative, ambitious, and welcoming.

**Visual direction:** A refined dark interface with restrained blue accents, clear typography, and strong content hierarchy.

## 3. Color System

Use these as the initial design tokens. Keep colors consistent across pages.

| Token            | Color     | Purpose                     |
| ---------------- | --------- | --------------------------- |
| Background       | `#0B1120` | Main application background |
| Surface          | `#111827` | Cards and panels            |
| Elevated Surface | `#1F2937` | Secondary panels and menus  |
| Primary          | `#2563EB` | Primary actions and links   |
| Primary Hover    | `#1D4ED8` | Hover state                 |
| Text Primary     | `#F9FAFB` | Main headings and content   |
| Text Secondary   | `#9CA3AF` | Supporting information      |
| Border           | `#374151` | Dividers and card borders   |
| Success          | `#16A34A` | Successful actions          |
| Warning          | `#D97706` | Warnings                    |
| Danger           | `#DC2626` | Destructive actions         |

Do not use every color everywhere. Use primary blue selectively to guide attention.

## 4. Typography

Use a clean sans-serif typeface.

Preferred font:

- Inter

Typography hierarchy:

- Page title: 28–36px, semibold or bold
- Section title: 20–24px, semibold
- Card title: 16–18px, semibold
- Body text: 14–16px, regular
- Supporting text: 12–14px, regular
- Button text: 14–16px, medium

Maintain readable line heights and consistent text contrast.

## 5. Layout and Spacing

Use a consistent spacing scale:

- 4px — Small inline gaps
- 8px — Compact spacing
- 12px — Small component spacing
- 16px — Standard spacing
- 24px — Section spacing
- 32px — Large section spacing
- 48px — Major layout spacing

Layout principles:

- Maintain consistent page margins.
- Use a clear content width.
- Avoid unnecessary empty space.
- Keep related information grouped.
- Ensure cards align consistently.
- Make the interface responsive.

## 6. Navigation

The application should have consistent navigation across authenticated pages.

Main navigation:

- Dashboard
- Members
- Community Chat
- Events
- My Profile

Guidelines:

- Keep navigation labels clear.
- Indicate the active page.
- Maintain a consistent header.
- Make navigation usable on mobile.
- Avoid duplicate navigation bars.

## 7. Components

### Buttons

Primary buttons:

- Blue background
- White text
- Clear action labels

Secondary buttons:

- Subtle surface or transparent background
- Visible border where appropriate

Destructive buttons:

- Red styling
- Use confirmation for important destructive actions

All buttons should have hover, focus, disabled, and loading states where applicable.

### Cards

- Use consistent padding.
- Use subtle borders.
- Keep shadows restrained.
- Avoid excessive gradients.
- Make clickable cards visually identifiable.

### Forms

- Always show clear labels.
- Use helpful placeholders.
- Display validation errors near the relevant fields.
- Provide clear success and failure feedback.
- Keep form layouts simple.

### Avatars

- Use consistent avatar dimensions.
- Show a fallback when no profile image exists.
- Preserve image proportions.
- Use a consistent rounded style.

### Badges

Use badges for meaningful statuses such as:

- Scheduled
- Cancelled
- Online
- Member
- Administrator

Avoid decorative badges that add no information.

## 8. Page-Specific Guidelines

### Dashboard

The dashboard should provide:

- A clear welcome section
- Useful community activity information
- Quick links to major features
- Upcoming events
- Relevant member or community information

Avoid filling the page with unnecessary statistics.

### Members

The member directory should provide:

- Member avatars
- Names
- Short biographies or interests
- Easy access to member profiles
- Clear empty and loading states

### Community Chat

The chat interface should provide:

- A visible channel list
- Clear message grouping
- Readable timestamps
- Distinct sender names
- A prominent message input
- Responsive behavior

Keep messages readable and avoid excessive visual decoration.

### Events

The events pages should provide:

- Clear event titles
- Date and time
- Venue or online details
- Host information
- RSVP status and attendee count
- Clear event actions

Use consistent layouts for event cards, event details, and event forms.

### Profile

The profile page should provide:

- Profile photo
- Full name
- Biography
- Interests
- Clear edit functionality

Make profile information easy to scan.

## 9. Interaction and Accessibility

- Provide visible keyboard focus states.
- Use accessible labels for form controls.
- Maintain sufficient color contrast.
- Use semantic HTML elements.
- Make interactive elements easy to identify.
- Provide feedback after important actions.
- Avoid relying only on color to communicate status.

## 10. Responsive Design

Support:

- Desktop
- Tablet
- Mobile

Guidelines:

- Use flexible layouts.
- Avoid horizontal overflow.
- Stack columns on smaller screens.
- Make buttons and controls touch-friendly.
- Ensure navigation works on narrow screens.
- Keep text readable at all viewport sizes.

## 11. Animation and Effects

Use subtle transitions only when they improve interaction.

Preferred:

- Short hover transitions
- Small opacity changes
- Subtle button feedback
- Smooth menu interactions

Avoid:

- Excessive animated gradients
- Unnecessary floating elements
- Large decorative glows
- Constant motion
- Animation that delays interaction

## 12. Design Quality Checklist

Before completing a UI change, verify:

- [ ] The page follows the shared color system.
- [ ] Typography is consistent.
- [ ] Spacing and alignment are consistent.
- [ ] The page works on mobile.
- [ ] Loading and empty states are handled.
- [ ] Buttons have clear actions.
- [ ] Forms provide useful validation feedback.
- [ ] Contrast and accessibility are considered.
- [ ] Existing functionality still works.
- [ ] The interface feels consistent with the rest of Businessgarh.

---

**Project:** Businessgarh V1
**Design direction:** Professional dark community platform
**Primary accent:** Blue
**Reference guidelines:** AGENTS.md
