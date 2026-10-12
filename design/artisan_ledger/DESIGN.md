---
name: Artisan Ledger
colors:
  surface: '#f6f9ff'
  surface-dim: '#d3dbe4'
  surface-bright: '#f6f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ecf4fe'
  surface-container: '#e7eff8'
  surface-container-high: '#e1e9f3'
  surface-container-highest: '#dbe3ed'
  on-surface: '#141c23'
  on-surface-variant: '#414845'
  inverse-surface: '#293139'
  inverse-on-surface: '#eaf2fb'
  outline: '#727975'
  outline-variant: '#c1c8c4'
  surface-tint: '#48645a'
  primary: '#143128'
  on-primary: '#ffffff'
  primary-container: '#2b473e'
  on-primary-container: '#96b5a9'
  inverse-primary: '#aecdc1'
  secondary: '#785837'
  on-secondary: '#ffffff'
  secondary-container: '#fed2a9'
  on-secondary-container: '#795938'
  tertiary: '#003224'
  on-tertiary: '#ffffff'
  tertiary-container: '#004b37'
  on-tertiary-container: '#5cbf9b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#caeadd'
  primary-fixed-dim: '#aecdc1'
  on-primary-fixed: '#032019'
  on-primary-fixed-variant: '#304c43'
  secondary-fixed: '#ffdcbd'
  secondary-fixed-dim: '#e9bf97'
  on-secondary-fixed: '#2c1600'
  on-secondary-fixed-variant: '#5e4122'
  tertiary-fixed: '#93f6ce'
  tertiary-fixed-dim: '#76d9b3'
  on-tertiary-fixed: '#002116'
  on-tertiary-fixed-variant: '#00513b'
  background: '#f6f9ff'
  on-background: '#141c23'
  surface-variant: '#dbe3ed'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: '0'
  data-metric:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system serves cafe operators, roasters, and specialty beverage entrepreneurs who manage high-frequency inventory, daily cash flows, and complex supplier balances. The personality bridges warm hospitality and rigorous operational clarity—marrying the tactile, comforting aura of a specialty coffee bar with the precision of a modern fintech platform.

### Design Movements & Visual Language
The aesthetic integrates **Warm Scandinavian Minimalism** with structured **Modern Corporate/Fintech SaaS**:
- **Warm, Tactile Neutrals:** The backdrop avoids clinical, sterile cold whites in favor of warm porcelain, oat milk, and sand tones (`#FDFBF7`, `#F5F2EB`).
- **Precision Typography & Structure:** Utilitarian data grids, tabular numerals, and low-noise surface layering prevent cognitive overload during fast-paced peak hours.
- **Organic Accents:** Deep espresso slate anchoring paired with restorative forest moss (`#225E4A`) creates a calm, focused environment for daily bookkeeping.

## Colors

The palette is tuned specifically for numerical balance sheets, stock thresholds, and operational warnings, while maintaining warmth through its earthy base tones.

### Color Distribution & Semantic Usage
- **Primary (`#2B473E` Deep Spruce / Forest Moss):** Primary buttons, dominant system brand elements, active global navigation, and key KPI highlights.
- **Secondary (`#8C6A48` Roasted Mocha / Amber Sand):** Secondary actions, ingredient batch tags, bean-origin metadata, and contextual callouts.
- **Tertiary (`#1C8A69` Crisp Mint / Retail Emerald):** Positive revenue delta, optimal inventory counts, completed transactions, and safe operational status.
- **Neutral (`#1C242B` Deep Ink Slate):** Primary typographic ink. Delivers AA/AAA contrast ratios against warm sand surfaces without the visual harshness of pure black (`#000000`).

### Semantic Status Tokens
- **Surface Ground:** `#FBF9F5` (Warm Cream Canvas)
- **Surface Elevation 1 (Card/Container):** `#FFFFFF` (Pristine Milk)
- **Surface Elevation 2 (Table Hover/Input Fill):** `#F4F0E8` (Oat Sand)
- **Border Default:** `#E7E1D4` (Muted Linen Border)
- **Border Subdued:** `#F0ECE1`
- **Warning / Stock Alert (`#D97706` Warm Amber):** Low stock thresholds, pending invoice approvals.
- **Critical / Loss (`#E11D48` Soft Rose Carmine):** Deficit, expired batches, cost spikes, waste reports.

## Typography

The typography system pairs **Plus Jakarta Sans** for expressive, polished headers and high-impact revenue figures with **Inter** for dense, structural data presentation.

### Rules for Financial and Inventory Figures
- **Font Feature Settings:** All data-heavy components (tables, KPI cards, unit breakdowns) must enforce `font-variant-numeric: tabular-nums` or `font-feature-settings: "tnum" 1` to ensure vertical alignment of digits across balances.
- **Metric Formatting:** Metric digits are rendered in SemiBold/Bold, while measurement units (`원`, `kg`, `g`, `ml`, `EA`, `pack`) follow in `body-sm` (`12px`) or `label-md` with `font-weight: 500` and subdued color (`#64748B`) to keep core values front and center.
- **Micro-copy Hierarchy:** Table headers and status tags use `label-sm` with slight uppercase tracking (`+0.04em`) to maintain sharp readability at glance distances behind checkout counters or stock shelves.

## Layout & Spacing

The layout is built around a flexible 12-column responsive grid engineered for horizontal density and vertical clarity.

### Breakpoint Matrix & Reflow
- **Desktop (>= 1280px):** 12-column grid. Left persistent vertical rail (240px wide). Margins `2rem` (`32px`), Gutters `1.25rem` (`20px`). KPI summary blocks sit 4-across.
- **Tablet (768px – 1279px):** 8-column grid. Collapsible icon rail navigation. Margins `1.5rem` (`24px`), Gutters `1rem` (`16px`). KPI cards wrap 2x2. Data tables support horizontal scroll with fixed first columns (Item name).
- **Mobile (< 768px):** 4-column fluid layout. Bottom navigation dock. Margins `1rem` (`16px`), Gutters `0.75rem` (`12px`). KPI cards convert into a swipeable carousel or stacked vertical cards.

### Spacing Philosophy
- Use `space-xs` (4px) and `space-sm` (8px) for tightly coupled units, such as numerical counts paired with unit chips or inline stock trend badges.
- Use `space-md` (16px) for interior card padding, input element heights, and list item spacing.
- Use `space-lg` (24px) for section splits within modals and table card bodies.
- Use `space-xl` (40px) exclusively to separate distinct dashboard modules (e.g., Sales Overview vs. Depleting Ingredients vs. Vendor Payables).

## Elevation & Depth

To avoid visual fatigue during 8-to-10 hour cafe shifts, the design system avoids heavy drop shadows and high-contrast dark fills. Depth is achieved via **tonal stacking** complemented by **warm ambient rim glows**.

### Surface Hierarchy
1. **Canvas Level 0 (`#FBF9F5`):** Base canvas background.
2. **Surface Level 1 (`#FFFFFF`):** Primary content containers, dashboard cards, metric tiles. Features a subtle 1px border (`#E7E1D4`) and an ultra-diffused shadow: `box-shadow: 0 1px 3px rgba(43, 71, 62, 0.04), 0 4px 12px rgba(43, 71, 62, 0.02)`.
3. **Surface Level 2 (`#F7F4EC`):** Interactive inputs, nested table row hovers, file drop card interior wells, and secondary pill tags.
4. **Overlay / Floating Level 3 (`#FFFFFF`):** Dropdowns, Date Range Pickers, Filter Drawers, and Modal Dialogs. Supported by: `box-shadow: 0 8px 30px rgba(28, 36, 43, 0.08), 0 2px 8px rgba(28, 36, 43, 0.04)`.
5. **Backdrop Veil:** `rgba(28, 36, 43, 0.4)` paired with `backdrop-filter: blur(4px)` to mute ambient background noise during inventory reconciliation modals.

## Shapes

The design system adopts a **Rounded (Level 2)** shape profile. This approach softens strict financial charts into friendly operational views while preserving geometric rigor.

### Shape Geometry Rules
- **Micro Elements (Badges, Buttons, Inputs):** `8px` (`0.5rem`) border radius. This radius provides an approachable touch target that fits modern POS touch interfaces.
- **Card Containers & Modal Windows:** `16px` (`1rem`, `rounded-lg`). Gives structure to revenue summaries and dialog boxes without feeling boxy.
- **Sheet Drawers & Large Feature Panels:** `24px` (`1.5rem`, `rounded-xl`). Used for bottom sheets on mobile/tablet tablet views.
- **Status Pills & Avatar Counts:** Fully rounded (`9999px`) to immediately distinguish contextual operational status tags from interactive form fields.

## Components

### Buttons
- **Primary:** Background `#2B473E`, text `#FFFFFF`, radius `8px`. Hover: `#223831`. Active: subtle downward scale (`transform: scale(0.98)`).
- **Secondary / Ghost:** Transparent background with border `1px solid #E7E1D4`, text `#1C242B`. Hover: `#F5F2EB`.
- **Destructive:** Background `#FFF1F2`, text `#E11D48`, border `1px solid #FECDD3`. Hover: `#FFE4E6`.

### Stat / KPI Metric Cards
- **Structure:** Level 1 White container, `16px` internal padding, border `1px solid #E7E1D4`.
- **Layout:** Top row holds the Metric Label (`label-md`, `#64748B`) and contextual date badge (e.g., "vs 어제"). Middle contains the prominent metric value (`data-metric`, `tabular-nums`) with trailing unit. Bottom row displays comparison delta (+12.4% with upward arrow in `#1C8A69`, or -4.2% in `#E11D48`).

### Data Tables
- **Header:** Sticky header with background `#F5F2EB`, text `label-sm`, color `#475569`, border bottom `1px solid #E7E1D4`. Height `40px`.
- **Row:** Height `48px` default (or `56px` for dense ingredient tables with sub-labels). Row hover state transitions smoothly to `#FBF9F5`.
- **Numeric Columns:** Right-aligned, monospace/tabular-nums enabled. Include contextual micro-bars for stock levels (e.g., remaining coffee bean weight vs. min safety threshold).

### Filters & Date Range Pickers
- **Bar Styling:** Horizontal flex container with segmented controls for fast presets ("오늘", "어제", "이번 주", "이번 달", "직접 설정").
- **Inputs:** Height `38px`, background `#FFFFFF`, border `1px solid #E7E1D4`, text `body-md`. Focus state uses `#2B473E` outline ring with `2px` spread at `15%` opacity.

### Alert Badges & Stock Chips
- **Normal / Safe:** Background `#ECFDF5`, text `#1C8A69`, dot indicator `#10B981`.
- **Low Stock / Reorder Warning:** Background `#FFFBEB`, text `#B45309`, dot indicator `#F59E0B`.
- **Critical / Out of Stock:** Background `#FFF1F2`, text `#E11D48`, dot indicator `#EF4444`.

### Excel / Data File Upload Zone
- **Surface:** Border `2px dashed #D6CEBE`, background `#FDFBF7`, padding `32px 24px`, radius `12px`.
- **Interaction:** On drag hover, background shifts to `#F4F0E8` and border changes to `#2B473E`. Displays file icon in `#8C6A48`, dynamic file-type pills (`.XLSX`, `.CSV`), and single-click file selector fallback.

### Modal Dialogs
- **Specs:** Centered viewport modal with max-width `540px` (standard) or `780px` (multi-item stock entry). Header includes an unambiguous title (`headline-md`) with a close button (`20px` touch area). Footers anchor primary confirmation and secondary cancel buttons aligned to the right.