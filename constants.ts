
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@naseni\.gov\.ng$/;

export const APP_NAME = "MAC Studio";

export const HERO_SLIDES = [
  "https://naseni.gov.ng/wp-content/uploads/2026/01/DSC00010-300x216.jpg",
  "https://naseni.gov.ng/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-11-at-6.17.15-PM-300x200.jpeg",
  "https://naseni.gov.ng/wp-content/uploads/2025/11/DSC08592-300x148.jpg",
  "https://naseni.gov.ng/wp-content/uploads/2026/01/Naseni-Townhall-3-300x200.jpg"
];

export const NASENI_2026_STRATEGY = `
DOCUMENT: NASENI MEDIA COMMUNICATIONS STRATEGY & IMPLEMENTATION PLAN 2026
PREPARED BY: Segun Ayeoyenikan (Director, Information, New Media & Protocol)

CORE VISION: Establish NASENI as Africa's leading hub for tech transfer, manufacturing innovation, and sovereign industrial advancement.
MISSION: Communicate NASENI’s leadership and measurable national impact through coordinated media.

STRATEGIC CONTEXT (2026):
- Pre-election year: Heightened scrutiny of govt performance.
- Economic pressure: Need for empathetic, solution-oriented messaging.
- Strategic Imperative: Reach beyond youth to older Nigerians, civil servants, and decision-makers.

CORE NARRATIVE PILLARS:
1. Industrial Innovation for National Prosperity.
2. Home-grown Solutions for Nigeria’s Development.
3. Creation, Collaboration & Commercialization (3Cs).
4. Youth, Jobs & The Future of Work.
5. Green Technology & Energy Transition.
6. Import Substitution and Local Manufacturing.

PRIORITY PRODUCTS (2026):
1. Home Solar Solutions.
2. NASENI Keke.
3. Solar Irrigation Pumps.
4. Power Stoves.
5. Laptops.
6. Electric Vehicles (EVs).

PHASED ROADMAP:
- PHASE I (JAN-JUN): Project/Product-Led Impact Campaign. Theme: Execution capacity through visible, scalable products.
- PHASE II (JUL-DEC): Consolidation & Election-Year Narrative. Theme: NASENI as a stable, non-political, institutional authority.

STRATEGIC OPERATING PRINCIPLES (NON-NEGOTIABLES):
i. Action Before Announcement: No content without visible work.
ii. Product Over Process: Outcomes matter more than meetings.
iii. People Over Policy: Human impact first, policy second.
iv. Speed with Proof: Fast storytelling backed by evidence.
v. One NASENI Voice: Central coordination, decentralized execution.

GOVERNANCE:
- MAC Team: Media Activity Calendar Implementation.
- Virtual Media War Room (WhatsApp): Real-time coordination and crisis response.
- Monthly Think Tank review meetings.

EXECUTION RULE: If an activity does not strengthen belief in NASENI’s execution capacity, it does not run.
`;

export const PRODUCTS = [
  { 
    id: 'tshirt', 
    name: 'Premium T-Shirt', 
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'hoodie', 
    name: 'Classic Hoodie', 
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'mug', 
    name: 'Ceramic Mug', 
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'cap', 
    name: 'Dad Hat', 
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=400' 
  },
];

export const PROJECT_TEMPLATES = [
  {
    id: 'marketing',
    title: 'Marketing Campaign',
    icon: '🚀',
    desc: 'Full-scale strategy for new tech innovations.',
    tone: 'Energetic Marketing',
    content: `[CAMPAIGN NAME]: 
[GOAL]: To showcase NASENI's new [PRODUCT/SERVICE].
[TARGET AUDIENCE]: Engineering firms, Govt. agencies, and tech-driven SMEs.

[KEY MESSAGING]:
1. Innovation: How this solves local problems.
2. Reliability: Built by NASENI engineers.
3. Accessibility: Ease of adoption.

[CHANNELS]:
- LinkedIn: Professional focus.
- Radio: Wide local reach.
- Physical Launch: Live demo details.`
  },
  {
    id: 'social',
    title: 'Social Media Post',
    icon: '📱',
    desc: 'Engaging updates for LinkedIn and X.',
    tone: 'Social Media Casual',
    content: `[PLATFORM]: LinkedIn / X
[TOPIC]: Progress update on [PROJECT NAME].

[THE HOOK]: Did you know that [STATISTIC/FACT]?

[THE BODY]: We are excited to announce...

[CALL TO ACTION]: Learn more at naseni.gov.ng

[HASHTAGS]: #NASENI #Innovation #NigeriaTech`
  },
  {
    id: 'presentation',
    title: 'Executive Summary',
    icon: '📊',
    desc: 'Structured report for committee review.',
    tone: 'Formal Executive',
    content: `TITLE: Executive Progress Briefing - [PROJECT NAME]
PRESENTER: [YOUR NAME]

1. EXECUTIVE SUMMARY:
   Brief overview of the last 30 days...

2. CURRENT MILESTONES:
   - Milestone A: Completed.
   - Milestone B: In Progress.

3. STRATEGIC CHALLENGES:
   Detailed list of hurdles and requested support...

4. NEXT STEPS & BUDGETARY REQUIREMENTS:
   What we need to move to Phase 2.`
  },
  {
    id: 'press',
    title: 'Press Release',
    icon: '📰',
    desc: 'Official announcement for media outlets.',
    tone: 'Corporate Professional',
    content: `FOR IMMEDIATE RELEASE

[HEADLINE: NASENI UNVEILS NEW INITIATIVE IN ABUJA]

[DATELINE: ABUJA, NIGERIA] — NASENI today announced...

[LEAD PARAGRAPH]: The Management of NASENI, led by the Executive Vice Chairman...

[KEY QUOTE]: "This initiative represents a major leap for local manufacturing," said [NAME].

[BOILERPLATE]: NASENI is the only purpose-built agency of the Federal Government...

CONTACT:
Public Relations Department, NASENI HQ.`
  }
];
