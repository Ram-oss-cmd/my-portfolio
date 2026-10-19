You are my senior creative developer. Work autonomously: install, build, test and fix by yourself, and only ask me a question if you are truly blocked. Narrate in short single lines.

GOAL
Build and run a one-of-a-kind personal portfolio website for SHREERAM CHAUDHARY (Nepal) with Next.js. It must NOT look like a template or a generic AI-made portfolio. I use Linux.

STEP 0: ENVIRONMENT
Run node -v, npm -v and git --version. Node must be 20.9 or newer. If something is missing or too old, tell me the exact install command for my distro and stop. Stay inside the current folder; never use sudo.

STEP 1: SKILLS (best effort)
Run these in the shell one by one. If one fails, carry on and apply the same design principles yourself:
claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
claude plugin marketplace add anthropics/skills
claude plugin install example-skills@anthropic-agent-skills
claude plugin marketplace add DietrichGebert/ponytail
claude plugin install ponytail@ponytail
New skills may only load after a restart. If so, say it in one line and continue. Whenever available, use ui-ux-pro-max (lock a design system first), frontend-design (distinctive UI) and ponytail (minimal, maintainable code).

STEP 2: SCAFFOLD AND INSTALL
npx create-next-app@latest shreeram-portfolio --typescript --tailwind --eslint --app --src-dir --import-alias '@/*' --use-npm --yes
cd shreeram-portfolio
npm i gsap @gsap/react lenis three @react-three/fiber @react-three/drei @react-three/postprocessing motion zustand
If a package conflicts with React 19, choose the newest compatible versions and tell me what you chose. Load Instrument Serif, JetBrains Mono and Noto Sans Devanagari with next/font/google.

STEP 3: ARCHITECTURE
App Router. Server components by default; 'use client' only for animation, Lenis and 3D. Load every Three.js scene with next/dynamic and ssr: false. Keep ALL my content in src/data/content.ts so I can edit it without touching components. Add metadata and an Open Graph image, sitemap.ts, robots.ts, a custom app/not-found.tsx, and structured data for a Person. Use next/image.

STEP 4: DESIGN
Concept: a journey of water through a hydropower plant; the scroll bar is the river. Stages: Intake -> Penstock -> Turbine -> Workbench -> Powerhouse -> Grid. Mood: night-shift SCADA control room crossed with an engineer's blueprint. Industrial, precise, quietly poetic. Palette: slate-ink #0B1114, phosphor amber #FFB000 (data), glacial cyan #6FE3E0 (water), bone white #E8E4D8 (text). No purple or blue gradients. Instrument Serif for big display text, JetBrains Mono for labels and data, Noto Sans Devanagari for the Nepali name. Blueprint grid lines, margin ticks, SCADA tags (SHP-01, ABH-02, TMK-03, IOT-04), subtle grain, gauges and dials instead of generic icons. Motion is heavy, smooth and physical; no bouncy springs, no confetti.

Signature feature, REC / PLAY nozzle: the cursor is a small nozzle crosshair that sprays cyan water particles. A REC button (and the R key) records the cursor path for up to 6 seconds in Zustand; PLAY (and the P key) replays the exact motion as a spray of water. Caption it as the idea behind my IoT water cannon. On touch devices use tap-and-drag. Respect prefers-reduced-motion.

STEP 5: CONTENT (use only these facts; never invent numbers, metrics, testimonials, awards or client logos)
0. Preloader: a gauge climbs 0.000 -> 0.990 MW, then the site opens. Under 2.5 seconds and skippable.
1. Intake (hero): 'Shreeram Chaudhary' in huge type, 'श्रीराम चौधरी' beneath it, one human line such as 'I build the software that runs hydropower plants, loan books and robot hoses.', a live Kathmandu clock, the REC / PLAY controls.
2. Penstock (about + skills): a short honest first-person intro. Skills as control-room gauges: Computer Programming, Web & Application Development, Internet of Things (IoT), Automation & Deployment, Windows software in VBA, Linux.
3. Turbine (four pinned stations, each with a tag, a one-line problem, what I built, and skills used):
   - SHP-01 Selang Small Hydropower Project (Selang SHP), 0.990 MW: I built the hydropower management system for the plant.
   - ABH-02 Abhiyan Engineering Nepal: I built their budget calculation system and their human resource management system.
   - TMK-03 Temke Investment Pvt. Ltd. (Hong Kong): I built their audit system and their entire loan-giving system with interest calculation, so when a customer comes to collect money the system calculates everything. Add a working mini loan and interest calculator with SAMPLE numbers, labelled 'Sample data, not client data'.
   - IOT-04 Hydropower automated water cannon (team project; I contributed, I did not build it alone): turned a manual water-spray hose into an automated one that copies a human operator's motion and can replay it. Diagram: human moves hose -> motion recorded -> stored -> replayed. Credit it as team work.
   - Below the stations, a 'Smaller builds' strip with placeholder cards, including the VBA Windows software.
4. Workbench (what I'm growing into): a terminal panel 'shreeram@selang:~$' that types itself. Honest labels: Linux = I know it well and use it; Python, AI and Robotics = currently learning (mark as 'in progress'; no fake projects or certificates). Link robotics to the IOT-04 record-and-replay idea. Visitors can type commands: help, whoami, projects, learning, vba, contact, clear. Pressing '/' opens it anywhere; the 'vba' command re-skins it as a retro grey VBA Immediate Window.
5. Powerhouse (stack): a switchboard of toggles; flip one to see what I used it for. List only technologies I really have.
6. Grid (contact): a live MW meter rising to 0.990 MW with 'Power delivered. Let's talk.' Placeholder buttons for Email, LinkedIn and Download CV, with copy-email-to-clipboard.
7. app/not-found.tsx: 'Breaker tripped. Back to the grid.'

STEP 6: QUALITY BAR
Smooth scroll with Lenis synced to GSAP; pinned scrubbed scenes for Penstock and Turbine; a fixed side rail showing river progress and stage name. Mobile gets a lighter but equally strong version (no heavy 3D, tap-based nozzle). Weird but usable: every strange idea is optional or obvious, and Work and Contact are findable within 2 seconds. Performance: lazy-load 3D, cap pixel ratio, pause off-screen rendering, small initial JS. Accessibility: keyboard navigation, visible focus, real prefers-reduced-motion fallback, good contrast, semantic HTML, skip link.

DO NOT
Use stock photos, invent client results or statistics, show real client or customer data, use purple gradients, decorative glassmorphism, emoji as icons, or copy another portfolio's layout.

STEP 7: VERIFY AND HAND OVER
Run npm run lint and npm run build and fix every error. Start the dev server in the background, check with curl that / returns 200 and an unknown URL shows the custom 404, then stop the server. Run git init and commit. Write a short README with run and deploy instructions. Do not deploy and do not add analytics or any external service. Finish with: how to run it (npm run dev), what you built, and the placeholders I must fill in.