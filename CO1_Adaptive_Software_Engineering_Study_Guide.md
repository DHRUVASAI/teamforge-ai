# 📘 Adaptive Software Engineering — CO1 Study Guide
### Sessions 1–12 | Course Code: 24CI3201 / 23CI2001

> **How to use this in Notion:** Import this file via `Import → Markdown`. Each `##` heading becomes a toggle-friendly section — turn them into Toggle Lists in Notion for a clean revision experience. Tables, checklists, and Q&A blocks are already formatted.

---

## 🗂️ Table of Contents — CO1

| # | Session | Core Topic |
|---|---------|-----------|
| 1 | [Session 1](#session-1--introduction-to-software-engineering) | Introduction to Software Engineering |
| 2 | [Session 2](#session-2--software-development-life-cycle-sdlc) | Software Development Life Cycle (SDLC) |
| 3 | [Session 3](#session-3--waterfall--iterative-models) | Waterfall, Incremental & Prototyping Models |
| 4 | [Session 4](#session-4--spiral-model--risk-management) | RAD Model, Spiral Model & Risk Management |
| 5 | [Session 5](#session-5--agile-methodology) | Agile Methodology & Manifesto |
| 6 | [Session 6](#session-6--scrum-framework) | Scrum Framework |
| 7 | [Session 7](#session-7--user-stories) | User Stories, Backlogs & Prioritization |
| 8 | [Session 8](#session-8--agile-estimation--team-velocity) | Agile Estimation & Team Velocity |
| 9 | [Session 9](#session-9--agile-project-management-tools) | Agile PM Tools — Jira & Trello |
| 10 | [Session 10](#session-10--communication--collaboration-in-agile-teams) | Communication & Collaboration in Agile Teams |
| 11 | [Session 11](#session-11--reviews--walkthrough--srs-vs-user-stories) | Reviews & Walkthroughs, SRS vs User Stories |
| 12 | [Session 12](#session-12--agile-modeling--extreme-programming-xp) | Agile Modeling & Extreme Programming (XP) |

📎 Jump to: [🔑 Master Cheat Sheet](#-master-cheat-sheet-quick-revision) · [❓ Full Self-Assessment Bank](#-compiled-self-assessment-question-bank)

---

## Session 1 — Introduction to Software Engineering

### 🎯 Learning Outcomes
- Understand what Software Engineering is
- Understand Characteristics of Software
- Explain the Need & Role of Software Engineering
- Differentiate Software vs Hardware

### 📖 Key Concepts

**What is Software?**
- Software = a program or set of programs containing instructions.
- Hardware = the physical, tangible infrastructure of a device.
- Software is **intangible** — a collection of programs/code; Hardware is tangible.
- Software & Hardware are **interdependent** — useless without each other (e.g., gaming software needs a graphics card, and the card is useless without the software).

**Software Evolution — Six Major Eras**
| Era | Period | Highlights |
|---|---|---|
| 1. Foundation Era | 1950s | Binary/machine language, punch cards, manual switches |
| 2. Programming Era | 1960–1970 | Assembly, COBOL, FORTRAN — human-readable code |
| 3. Personal Computing Era | 1970–1980 | Microprocessors, UNIX, MS-DOS, C++ (OOP), floppy disks |
| 4. Internet Era | 1980–early 2000s | WWW, HTML, JavaScript, networked applications |
| 5. Cloud & Mobile Era | 2000–2010 | Cloud computing, mobile app stores, APIs, SaaS |
| 6. Intelligent Era | 2010–Present | AI, ML, Big Data — autonomous reasoning & self-optimization |

**Characteristics of Software**
- Software is **developed/engineered**, not manufactured in the classical sense.
- Software does **not "wear out"** like hardware (not affected by physical conditions) — but it does become obsolete/degrade in a different sense.
- Software continues to be **custom-built** (though component-based reuse is growing).

**Definition of Software Engineering**
> **IEEE definition:** The application of a systematic, disciplined, quantifiable approach to the development, operation, and maintenance of software.

- Also defined as: the establishment and use of sound engineering principles to obtain economical software that is reliable and efficient.
- Key contributors: **Roger Pressman** and **Ian Sommerville**.

**Dual Role of Software**
1. **As a Product** — enables hardware to deliver functionality; acts as an information transformer (produces, manages, acquires, modifies, displays information).
2. **As a Vehicle for delivering a product** — provides system functionality (e.g., payroll system), controls other software (e.g., OS), or helps build other software (e.g., software tools).

**Why is Software Development Complex?**
- Numerous project constraints: **cost, schedule, quality, scale/size, complexity**.
- Must be developed at reasonable cost, within budget/time, with good quality.

**Need & Importance of Software Engineering**
- Handle huge projects
- Manage cost & minimize time
- Develop reliable software
- Reduce complexity
- Improve productivity & efficiency
- Ensures structured approach, proven methodologies, quality assurance, multi-directional testing, good project management/collaboration, and long-term maintainability.

**Applications of Software Engineering**
1. Web & Mobile App Development (E-commerce, Social/Communication)
2. Finance & Banking (Core systems, trading, investments)
3. Entertainment, Gaming & Embedded Systems (Media)
4. AI & Machine Learning (Data analysis, automation)
5. Automotive & Aerospace (Embedded systems, autonomous driving/flight)
6. Science, Engineering & Government (Simulations, e-governance)

**Adaptive Software Engineering (ASE)**
- A flexible, **Agile methodology** designed to embrace changing requirements and uncertainty.
- Tailored for environments where market/user needs demand constant evolution.
- Traditional SE ensures a system is built reliably; **ASE prioritizes adaptability to changing user needs.**

### 💡 Exam-Focus Points
- Be ready to **define SE** (IEEE definition — memorize word-for-word).
- Differentiate **Software vs Hardware** with the interdependence example.
- List the **6 software evolution eras** in order.
- Explain **dual role of software** with examples.
- SE vs ASE — the key distinguishing idea is **adaptability to change**.

---

## Session 2 — Software Development Life Cycle (SDLC)

### 🎯 Learning Outcomes
- Understand the Software Engineering Process
- Understand SDLC and its phases
- Understand Analysis, Design, Development, Testing, Deployment & Maintenance phases

### 📖 Key Concepts

**Software Engineering Process**
- The set of activities used to develop software = **Software Process** (a.k.a. Software Development Process / Software Engineering Process — same thing).
- Many **Process Models** exist to organize these activities: Waterfall, Prototyping, Incremental, RAD, Spiral, Concurrent Development, Component-based, Agile, V-Model, Scrum, XP, DSDM.

**Factors influencing choice of process model:**
- Organization's structure & process maturity
- Organization's domain experience
- Project type, nature & complexity
- Skilled personnel availability
- Reusability possibility
- Customer's knowledge & availability
- Financial & time constraints

**What is SDLC?**
> The Software Development Life Cycle (SDLC) is a structured process used to plan, design, develop, test, deploy, and maintain software.

- Ensures a systematic workflow aligned with business goals & user requirements.
- Software Process Models are also called **SDLC Models**.
- Benefits: gives a clear/organized framework, detects defects early (reduces cost/time), ensures high-quality delivery meeting user expectations.

### 🔢 The 7 SDLC Phases

| Phase | Name | Key Activities | Outcome |
|---|---|---|---|
| 1 | **Planning & Analysis** | Scope definition, feasibility analysis, cost estimation, scheduling, resource planning | Project cost estimation, project plan, feasibility report |
| 2 | **Requirement Gathering** | Requirement gathering, validation, documentation | Software Requirements Specification (SRS) |
| 3 | **System Design** | HLD (architecture, tech stack, DB design, major modules) + LLD (component logic, APIs, data structures, workflows) | Design Document Specification (DDS) |
| 4 | **Coding/Development** | Coding, code reviews, unit testing | Source code |
| 5 | **Testing** | Unit, Integration, System, UAT | Test cases, defect reports, quality metrics |
| 6 | **Deployment** | Production setup, deployment, smoke testing | Live application |
| 7 | **Maintenance** | Bug fixes, performance tuning, updates, feature enhancements | Software updates/patches, new versions |

**Types of Testing (Phase 5 detail):**
- **Unit Testing** — verifies individual components
- **Integration Testing** — ensures modules work together
- **System Testing** — validates the complete system
- **User Acceptance Testing (UAT)** — confirms business requirements are met

### 💡 Exam-Focus Points
- Be able to **draw/describe the SDLC diagram** and list all 7 phases in order with outcomes.
- Know HLD vs LLD distinction.
- Memorize the 4 types of testing and what each verifies.
- List factors influencing choice of SDLC model.

---

## Session 3 — Waterfall & Iterative Models

### 🎯 Learning Outcomes
- Define the Waterfall Model, its advantages & limitations
- Explain how the Incremental Model reduces project risk
- Differentiate Waterfall, Iterative, and Prototyping Models

### 📖 Waterfall Model

> A **linear and sequential** SDLC model where each phase must be completed before the next begins.

**Key Characteristics:** Sequential flow · Documentation-driven · Clear milestones/deliverables · Minimal overlap between phases

**Phases:**
1. **Requirements Gathering & Analysis** → produces SRS
2. **System Design** → architecture, modules, interfaces, DB, UI/UX
3. **Implementation/Coding** → converts design into source code
4. **Testing** → Unit, Integration, System, UAT; fix defects & re-test
5. **Deployment** → install, configure, user training, go-live
6. **Maintenance** → monitor, fix defects, improve performance, adapt to changing requirements

**Advantages** ✅ | **Limitations** ❌
:---|:---
Simple & easy to understand | Difficult to accommodate requirement changes
Well-structured process | Limited customer involvement
Easy project management | Testing occurs late
Clear documentation | Higher risk if requirements are incorrect
Suitable for small projects | Not suitable for large/complex projects
Easy progress tracking | Working software available only at the end
Defined milestones & deadlines |

### 📖 Incremental Model

> Software is developed, tested, and delivered in small, manageable parts called **increments**. Each increment adds new functionality until the complete product is developed. Divided into multiple releases, each a working version.

**Main Features:**
- Developed in small increments; each independently tested
- Functional software available early
- Continuous customer feedback incorporated
- Reduces development risk; easier defect detection

**Advantages** ✅ | **Limitations** ❌
:---|:---
Early delivery of software | Requires detailed planning
Easier testing & debugging | Complex architecture design
Flexibility to accommodate changes | Integration difficulties
Better risk management | Increased management overhead
Improved customer feedback | Dependency among increments
Reduced development cost | Higher initial design effort
Better resource utilization | Not suitable when requirements unclear
Faster time-to-market | Difficult for highly coupled systems

### ⚖️ Waterfall vs Iterative Model — Full Comparison

| Feature | Waterfall Model | Iterative Model |
|---|---|---|
| Approach | Linear and sequential | Repetitive and cyclic |
| Development Process | One phase completed before the next begins | Developed through multiple iterations |
| Requirements | Must be clearly defined at the start | Can evolve and be refined during development |
| Customer Involvement | Limited, after requirements gathering | Continuous feedback throughout |
| Flexibility | Low | High |
| Testing | After implementation is completed | During every iteration |
| Risk Management | Higher risk (late detection) | Lower risk (early detection) |
| Delivery | Final product delivered at the end | Partial working versions each iteration |
| Cost of Changes | High if changes needed later | Lower — changes incorporated early |
| Project Visibility | Limited until late stages | Better, via frequent releases |
| Documentation | Extensive | Moderate |
| Suitable For | Small projects, stable requirements | Complex projects, changing requirements |

### 📖 Prototyping Model

> An SDLC approach where a preliminary version of the software (**prototype**) is built to understand and refine user requirements before building the final system.

**Key Idea:** Build working model first → gather feedback → refine requirements → develop final software.

**Phases:**
1. Requirements Gathering — collect initial requirements, understand expectations, define scope
2. Quick Design — rough design, screen layouts, major functionalities, navigation flow
3. Build Prototype — working model, basic functionalities, demonstrate behavior
4. User Evaluation — present to users, gather feedback, identify missing requirements
5. Feedback & Refinement — modify prototype, add features, improve UI, correct issues
6. Final System Development — develop complete software, integrate all modules
7. Testing (Unit, Integration, System), Deployment, Maintenance

**Advantages** ✅ | **Limitations** ❌
:---|:---
Better understanding of requirements | Increased development cost
Continuous user involvement | Time-consuming (multiple revisions)
Early error detection | Scope creep may occur
Improved software quality | Poor documentation
Reduced development risk | Unrealistic user expectations
Better UI design | Complex project management
Higher customer satisfaction | Not suitable for very large systems
Faster user acceptance |

### 💡 Exam-Focus Points
- The **full Waterfall vs Iterative comparison table** is a classic exam question — memorize all rows.
- Know all 6 phases of Waterfall **in order**.
- Be able to explain **why prototyping reduces requirement ambiguity**.
- Common short-answer: "How does Incremental Model reduce project risk?" → early delivery, independent testing per increment, continuous feedback, defects caught early.

---

## Session 4 — Spiral Model & Risk Management

### 🎯 Learning Outcomes
- Define RAD Model & its phases
- Define risk analysis, risk identification, risk mitigation
- Explain the Spiral Model and its phases

### 📖 Rapid Application Development (RAD) Model

> An SDLC model emphasizing **rapid prototyping, iterative development, and continuous user feedback** to produce high-quality software quickly, using reusable components.

**Objectives:** Reduce development time · Increase user involvement · Deliver working software quickly · Improve quality via feedback · Reduce cost through component reuse

**Phases:**
1. **Business Modeling** — designed based on flow/distribution of information between business channels
2. **Data Modeling** — business info refined into significant data objects
3. **Process Modeling** — data objects transformed to implement a business function
4. **Application Generation** — automated tools convert process/data models into prototypes
5. **Testing and Turnover** — prototypes tested individually each iteration → reduces overall testing time

**Advantages** ✅ | **Limitations** ❌
:---|:---
Faster development | Requires skilled developers
High user involvement | High user commitment needed
Early delivery | Not suitable for large projects
Better quality | Integration challenges
Reduced development cost | High initial cost
Flexibility | Dependency on modularization
Improved productivity | Unsuitable for high-risk systems

### 📖 Spiral Model

> A **risk-driven** SDLC model combining features of Waterfall and Prototyping. Proposed by **Barry Boehm in 1986** to address limitations of traditional approaches in large/complex projects. Development proceeds through repeated cycles ("spirals"), each producing an improved version.

**Four Main Activities in Each Spiral:**
1. **Planning** — define objectives, gather requirements, estimate cost/schedule
2. **Risk Analysis** — identify risks, evaluate alternatives, develop prototypes to reduce risk
3. **Engineering** — design system, develop components, perform testing
4. **Customer Evaluation** — review product, gather feedback, plan next cycle

**Advantages** ✅ | **Limitations** ❌
:---|:---
Excellent risk management | Complex to manage
Supports requirement changes | Higher development cost
Continuous customer feedback | Requires risk management expertise
Suitable for large projects | Not suitable for small projects
Early detection of problems | Documentation can become extensive
Improved software quality |

### ⚠️ Risk Analysis, Identification & Mitigation

**What is Risk?** An uncertain event that may negatively affect a software project — can impact **cost, schedule, quality, scope, performance**.

**Risk Management** = process of identifying, analyzing, mitigating, and monitoring risks throughout the project lifecycle.

**Importance of Risk Management:** Identifies problems early · Reduces project failures · Improves planning/decision-making · Controls costs · Enhances quality · Increases customer satisfaction

### 🔄 The Risk Management Process (5 Steps)

**Step 1 — Risk Identification**
- Identify potential risks (technical, financial, operational, organizational)
- Examples: requirement changes, staff turnover, technology failure, budget constraints
- Techniques: Brainstorming, Expert Judgment, Checklists, **SWOT Analysis**, Interviews, Surveys, Historical Data Analysis

**Step 2 — Risk Analysis**
- Evaluates: probability of occurrence, impact on objectives, severity, priority
- **Qualitative** — expert judgment/experience
- **Quantitative** — numerical/statistical methods (Expected Monetary Value/EMV, Decision Tree Analysis, Monte Carlo Simulation)

**Step 3 — Risk Prioritization**
- Ranked by: probability, impact, urgency
- Priority levels: **Critical, High, Medium, Low**
- Focus on high-impact + high-probability risks first

**Step 4 — Risk Mitigation**
- Reduces: risk probability, risk impact, overall project uncertainty

**Step 5 — Risk Monitoring & Control**
- Continuously track risks; update mitigation plans
- Activities: regular risk reviews, status reporting, corrective actions, updating risk register, identifying new risks

### 🏷️ Categories of Software Risks

| Category | Description | Examples | Impact |
|---|---|---|---|
| **Project Risks** | Affect project execution | Unrealistic deadlines, budget constraints, resource shortages, poor planning, communication gaps | Schedule delays, increased cost |
| **Technical Risks** | Related to technology/quality | New tech adoption, integration failures, complex architecture, security vulnerabilities, performance issues | System failure, poor quality |
| **Business Risks** | Affect organizational objectives | Market competition, product cancellation, funding issues, customer dissatisfaction | Revenue loss, reduced growth |
| **External Risks** | Beyond organizational control | Government regulations, natural disasters, vendor failures, economic instability | Project disruption, higher costs |

### 🛡️ Risk Mitigation Strategies (4 Types)

1. **Risk Avoidance** — eliminate the cause so risk no longer exists (e.g., choose stable language over new one, remove risky features, avoid unreliable third-party tools)
2. **Risk Reduction** — decrease probability/impact (e.g., regular testing, code reviews, training, preventive measures)
3. **Risk Transfer** — shift responsibility to another party (e.g., outsourcing, insurance, SLAs, specialized vendor partnerships)
4. **Risk Acceptance** — acknowledge the risk and proceed, often with a contingency plan

### 💡 Exam-Focus Points
- **Spiral Model** — always mention **Barry Boehm, 1986**, and the 4 activities per spiral.
- Difference between **Risk Analysis vs Risk Identification** is a common short-answer.
- Memorize all 4 **risk categories** with examples.
- Memorize all 4 **mitigation strategies** with a real example each.
- RAD Model's 5 phases in order.

---

## Session 5 — Agile Methodology

### 🎯 Learning Outcomes
- Understand fundamentals of Agile Development
- Understand Agile Manifesto values and 12 principles
- Describe Agile Lifecycle & compare Agile vs Traditional

### 📖 Key Concepts

**Agility** = the ability to move quickly, easily, and efficiently while adapting to changing situations.

**Agile Model** — software developed in small, manageable parts (**iterations/sprints**); teams build, test, and improve continuously based on customer feedback.

**Agile Modeling** — using modeling techniques to understand, design, and communicate requirements/solutions while embracing agility principles (simplicity, feedback, continuous improvement).

**Why Agile was introduced:** to overcome limitations of traditional models that struggled to adapt to changing customer requirements.

**A Sprint** = a short, time-boxed period (typically **2 weeks to 1 month**) during which a team completes a defined set of work.

**Agile Process Steps:** Requirements → Design → Code → Test → Release → (Continuous Improvement via feedback)

### 📜 The Agile Manifesto — 4 Core Values

| # | Value |
|---|---|
| 1 | **Individuals and Interactions** over Processes and Tools |
| 2 | **Working Software** over Comprehensive Documentation |
| 3 | **Customer Collaboration** over Contract Negotiation |
| 4 | **Responding to Change** over Following a Plan |

### 📋 The 12 Agile Principles

1. Customer satisfaction via early and continuous delivery of valuable software
2. Welcome changing requirements, even late in development
3. Deliver working software frequently (weeks to months, shorter preferred)
4. Business people and developers must work together daily
5. Build projects around motivated individuals; trust them
6. Face-to-face conversation is the most efficient communication method
7. Working software is the primary measure of progress
8. Sustainable development — maintain a constant pace
9. Continuous attention to technical excellence and good design
10. Simplicity — maximizing work *not* done
11. Best architectures/requirements/designs emerge from **self-organizing teams**
12. Regular reflection — team tunes and adjusts behavior at intervals

### 🔁 Agile Lifecycle

1. **Product Backlog** — prioritized list of requirements/features
2. **Sprint Planning** — team selects tasks, plans the sprint
3. **Development** — developers build selected features
4. **Testing** — ensure quality and correctness
5. **Review (Demo)** — show completed work to customers, collect feedback
6. **Retrospective** — team analyses process, identifies improvements
7. **Release/Increment** — features delivered; next sprint begins

### 🌟 Benefits of Agile
Faster delivery · Flexibility to changes · Customer satisfaction · Better quality (regular testing) · Reduced risk · Better team collaboration

### ⚖️ Agile vs Traditional Models

| Agile Model | Traditional Model |
|---|---|
| Development in small cycles (sprints) | Step-by-step in fixed phases |
| Requirements can change during development | Requirements fixed at the beginning |
| Continuous customer feedback | Involvement mostly at start & end |
| Working software delivered frequently | Final product delivered after entire project |
| Testing done continuously with development | Testing after development phase completes |
| More flexible and adaptable | Less flexible when changes occur |
| Suitable for changing requirements | Suitable for clear, stable requirements |

**Simple flow comparison:**
- Agile: Plan → Develop → Test → Get Feedback → Improve *(repeated)*
- Traditional: Requirements → Design → Development → Testing → Deployment *(one-time)*

### 💡 Exam-Focus Points
- Memorize all **4 Manifesto values** (word-perfect: "X over Y" format).
- Memorize the **12 principles** — at least be able to list 8–10 and explain any 3 in detail.
- The **Agile vs Traditional table** is a very common 7–10 mark question.
- Know the **Agile Lifecycle steps in order** with one line each.

---

## Session 6 — Scrum Framework

### 🎯 Learning Outcomes
- Understand Scrum and how it supports Agile
- Explain Product Owner & Scrum Master roles
- Describe Scrum Events and Artifacts
- Explain Sprint Planning, Review & Retrospective

### 📖 Introduction to Scrum

> **Scrum** is an Agile framework for managing and developing complex projects, especially software products. It divides work into small cycles called **Sprints** and focuses on collaboration, flexibility, continuous improvement, and customer satisfaction.

**Product Backlog** — list of all requirements, features, improvements, and tasks needed for the product (everything the team needs to complete).

**Sprint (1–4 weeks)** — short development cycle; team selects tasks from Product Backlog and works to complete them; goal is a usable part of the product.

**Increment** — the completed, working part of the product delivered at the end of every Sprint; demonstrable to stakeholders.

> **Scrum Goal:** *"Deliver a potentially shippable product increment at the end of every Sprint."*

**Simple Flow:** Product Backlog → Sprint (1–4 weeks) → Iteration → Working Product Increment

### 👥 Scrum Roles

| Role | Responsibility |
|---|---|
| **Product Owner** | Represents customer's needs; manages product requirements; creates & prioritizes Product Backlog; ensures max value delivered |
| **Scrum Master** | Guides team in following Scrum practices; facilitates Scrum events; removes obstacles; helps team improve |
| **Development Team** | Designs, develops, tests, and delivers the product increment each Sprint |

**Simple summary:** Product Owner → *decides what to build*; Scrum Master → *ensures process is followed*; Development Team → *builds and delivers*.

### 📅 Scrum Events

| Event | When | Purpose |
|---|---|---|
| **Sprint Planning** | Start of Sprint | Decide work to complete; create plan to achieve Sprint Goal |
| **Daily Scrum** | Daily | Short meeting — discuss progress, tasks, challenges |
| **Sprint Review** | End of Sprint | Demonstrate completed increment to stakeholders; collect feedback |
| **Sprint Retrospective** | End of Sprint | Reflect on what went well/needs improvement; plan better future Sprints |

### 📦 Scrum Artifacts

| Artifact | Description |
|---|---|
| **Product Backlog** | Prioritized list of all requirements/features/tasks; managed by Product Owner |
| **Sprint Backlog** | Tasks selected from Product Backlog for the current Sprint |
| **Increment** | Completed, usable product output at the end of a Sprint, meeting quality standards |

### 🌟 Scrum Benefits
- Faster product delivery (short Sprints)
- Adaptability to changes
- Improved team collaboration (regular meetings)
- Continuous improvement (via Retrospectives)

### 🔍 Sprint Planning vs Review vs Retrospective

| Event | Focus |
|---|---|
| **Sprint Planning** | Decides *what* work to do in the Sprint |
| **Sprint Review** | Shows *completed* work and collects feedback |
| **Sprint Retrospective** | Reflects on *how* the team worked and improves the process |

### 💡 Exam-Focus Points
- The **3 Scrum roles + 4 Events + 3 Artifacts** is the backbone of this session — draw it as a mind map for revision.
- Be able to distinguish **Sprint Review (product-focused)** from **Sprint Retrospective (process-focused)**.
- Know the Scrum Goal statement verbatim.

---

## Session 7 — User Stories

### 🎯 Learning Outcomes
- Understand User Story format and Acceptance Criteria
- Understand Product Backlog vs Sprint Backlog
- Understand Backlog Grooming and Prioritization Techniques

### 📖 1. User Story Format

A **User Story** is a modular way of capturing user requirements broken into **Role, Goal, Benefit**:

> **As a** [Role] **I want** [Goal] **so that** [Benefit]

- **As a...** (Role) — the user persona (e.g., Administrator, Guest)
- **I want...** (Goal) — the action/capability needed
- **So that...** (Value/Benefit) — the reason/value it provides

**Examples:**
- As a **customer**, I want a **shopping cart feature** so that **I can easily purchase items online**.
- As a **manager**, I want to **generate a report** so that **I can understand which departments need more resources**.
- As a **customer**, I want to **receive an SMS when the item arrives** so that **I can go pick it up right away**.
- As a **bank customer**, I want to **withdraw cash with a button press** so that **I can quickly conclude my session**.

### 📖 2. Acceptance Criteria (BDD Format)

Once a User Story is defined, boundaries/conditions for "done" are specified using **Given-When-Then**:
- **GIVEN** (context) — the initial state/precondition
- **WHEN** (action) — the user action or event
- **THEN** (result) — the expected outcome/observable behavior

*All criteria must be met for the story to be considered complete.*

### 📖 3. Product Backlog

- The comprehensive, **master list of all future features, fixes, and technical debt**, ordered by priority.
- Managed/influenced by the **Product Owner and Stakeholders** to align with product vision.
- Uses a **prioritization funnel** (High → Low).

### 📖 4. Sprint Backlog

> A highly focused, actionable list of tasks a team commits to completing during a Sprint (1–4 weeks). A tactical roadmap.

**Key Components (per Scrum Guide):**
1. **Sprint Goal** — the overarching objective for the sprint
2. **Selected Product Backlog Items (PBIs)** — high-priority features/stories/bugs pulled from the Product Backlog
3. **Actionable Plan** — step-by-step tasks to turn selected items into a shippable increment

### 📖 5. Backlog Grooming (Refinement)

A cyclical, collaborative practice to keep the backlog healthy, detailed, and estimated:
1. **Review** — validate current priorities
2. **Split Stories** — break large items into smaller tasks
3. **Estimate (Size)** — assign relative effort (Story Points)
4. **Clarify (Questions)** — resolve ambiguity, add detail

*(Continuous cyclical flow — not a one-time activity)*

### 📖 6. Prioritization Techniques

| Technique | Formula/Method |
|---|---|
| **RICE Scoring** | (Reach × Impact × Confidence) / Effort |
| **WSJF (Weighted Shortest Job First)** | Cost of Delay / Job Size |
| **MoSCoW** | **M**ust-have, **S**hould-have, **C**ould-have, **W**on't-have |

*All three give the Product Owner structured ways to quantify value and order backlog items for maximum value delivered soonest.*

### 💡 Exam-Focus Points
- Memorize the **User Story template** and be able to write 2 original examples.
- **Given-When-Then** = classic short answer.
- Distinguish **Product Backlog (whole project)** vs **Sprint Backlog (current sprint only)**.
- Memorize **RICE, WSJF, MoSCoW** formulas/expansions — very likely to be asked directly.

---

## Session 8 — Agile Estimation & Team Velocity

### 🎯 Learning Outcomes
- Understand Agile estimation techniques
- Understand Story Points & Planning Poker
- Understand Velocity and its role in Sprint Planning

### 📖 1. Estimation Techniques

| Technique | Description |
|---|---|
| **Planning Poker** | Team members use cards (0,1,2,3,5,8...) to estimate stories collaboratively |
| **T-Shirt Sizing** | Tasks sized as XS, S, M, L, XL based on complexity |
| **Wideband Delphi** | Experts estimate independently → discuss → re-estimate → reach consensus |
| **Three-Point Estimation** | Uses Optimistic (O), Most Likely (M), Pessimistic (P) → **Final estimate = (O + 4M + P) / 6** |

### 📖 2. Agile Estimation Basics

- Agile estimation is **relative, not absolute**.
- Focus on **effort, complexity, and uncertainty** — not exact hours.
- Compare tasks instead of assigning exact time.
- Encourages team discussion & collaboration.
> **Principle:** *"Estimate to understand, not to be perfect."*

### 📖 3. Story Points & Planning Poker

**Story Points** — relative, abstract units measuring the overall effort, complexity, and risk of a task/user story (not exact hours/days) — teams compare against a baseline.

**Planning Poker** — consensus-based, gamified estimation technique:
- Members privately select numbered cards, reveal simultaneously (avoids cognitive/anchoring bias)
- Based on: **Complexity, Risk, Effort**
- Uses the **Fibonacci Scale**: 1, 2, 3, 5, 8, 13, 21...

**Planning Poker Steps:**
1. Read user story
2. Discuss requirements
3. Each member selects a card
4. Reveal simultaneously
5. Discuss differences & re-vote

### 📖 4. Velocity Concept

> **Velocity** = the amount of work completed in a sprint, measured in **story points**.

- Measures **team capacity**, NOT individual performance
- Helps in future sprint planning
- Example: If a team completes 30 story points → velocity = 30

### 📖 5. Velocity Calculation

**Formula:** Velocity = Sum of completed story points in a sprint

| Story | Points |
|---|---|
| Login | 5 |
| Payment | 8 |
| Dashboard | 13 |
| **Total Velocity** | **26** |

**Average Velocity** = (Sprint1 + Sprint2 + Sprint3) / 3

### 📖 6. Sprint Planning Using Velocity

**Steps:**
1. Check past velocity (e.g., 30 points)
2. Consider team availability
3. Select user stories from backlog
4. Ensure total points ≈ velocity
5. Finalize sprint backlog

*Example: Velocity = 30 → select stories totaling ~30 points*

### ✅ Final Summary (from deck)
- **Estimation** = Relative sizing
- **Story Points** = Effort measurement
- **Velocity** = Team output per sprint
- **Sprint Planning** = Use velocity to commit work

### 💡 Exam-Focus Points
- Memorize the **Three-Point Estimation formula**: (O + 4M + P) / 6 — numericals may be asked.
- Know the **Fibonacci scale** used in Planning Poker.
- Practice a **Velocity calculation numerical** (sum of story points across a sprint/multiple sprints).
- Distinguish **Story Points (relative)** vs **traditional hour-based estimation (absolute)**.

---

## Session 9 — Agile Project Management Tools

### 🎯 Learning Outcomes
- Understand fundamentals of Agile tools
- Explain features of Jira (boards, workflows, sprint management)
- Explain Trello (boards, lists, cards)
- Compare Jira and Trello

### 📖 9.1 Introduction to Agile Tools

> Agile tools are software applications that help teams **plan, track, manage, and deliver** projects using methodologies like Scrum and Kanban — supporting iterative development, continuous feedback, and collaboration.

**Why Agile Tools Matter:** Real-time collaboration · Progress tracking (boards/charts/reports) · Flexibility for changing requirements · Improved productivity & transparency · Faster delivery

**Key Features of Agile Tools:**
- Task Management (create, assign, track)
- Boards (Scrum/Kanban) — visual workflow
- Sprint Planning — organize into iterations
- Backlog Management — prioritized task list
- Reporting & Analytics — burndown charts, velocity tracking
- Collaboration Tools — comments, notifications, file sharing

**Popular Agile Tools:** Jira (sprint planning, bug tracking, reporting) · Trello (simple board-based) · Asana (timelines/workflows) · ClickUp (all-in-one)

### 📖 9.2 Jira Overview

> **Jira**, developed by **Atlassian**, is a popular project management and issue-tracking tool widely used to implement Scrum and Kanban.

**Key Features:**
- **Issue Tracking** — tracks bugs, tasks, improvements (each task = "issue")
- **Agile Boards** — Scrum & Kanban boards, visualize workflow
- **Sprint Management** — plan, start, manage sprints; assign tasks
- **Backlog Management** — prioritize/organize before execution
- **Reports & Analytics** — burndown charts, velocity charts, sprint reports
- **Customization** — custom workflows, fields, issue types

**Advantages:** Highly flexible/customizable · Strong Agile support · Excellent reporting · Integrates with Git, Slack, CI/CD pipelines

### 📖 9.3 Jira Boards & Workflows

**Types of Jira Boards:**
| Board | Use Case |
|---|---|
| **Scrum Board** | Sprint-based projects; includes backlog, sprint planning, active sprint view — iterative development |
| **Kanban Board** | Continuous workflow; no fixed sprints; focuses on limiting Work-In-Progress (WIP) |

**Key Elements of Boards:**
- **Columns** — stages (To Do, In Progress, Done)
- **Cards (Issues)** — individual tasks/bugs
- **Swimlanes** — group tasks by priority, story, or assignee
- **Backlog** — list of pending tasks

**Workflow Components:**
- **Statuses** — To Do, In Progress, Testing, Done
- **Transitions** — movement between statuses
- **Assignees** — person responsible at each stage
- **Conditions & Validators** — rules controlling transitions

**How Boards & Workflows Work Together:** Workflow defines *how* work progresses → Board visually *displays* that workflow → each column corresponds to a workflow status.

### 📖 9.4 Sprint Management in Jira

> Planning, executing, and monitoring work in fixed time periods (Sprints, 1–4 weeks) — a core Scrum practice.

**Important Features:**
- **Backlog View** — prioritize/prepare tasks before sprint
- **Active Sprint Board** — shows ongoing work
- **Burndown Chart** — tracks remaining work over time
- **Velocity Chart** — measures team performance across sprints
- **Reports** — sprint report, cumulative flow diagram

**Benefits:** Structured/time-bound development · Improved productivity/focus · Continuous feedback · Faster delivery

### 📖 9.5–9.6 Trello Overview

> **Trello**, developed by **Atlassian**, uses a **Kanban-style board system** to organize tasks visually — simple and user-friendly.

**Key Features:**
- **Drag-and-Drop** — move cards between lists to show progress
- **Collaboration** — team members, comments, notifications
- **Labels & Tags** — categorize by color/priority
- **Boards** — represent a project/workflow (e.g., "Mini Project")
- **Lists** — columns within a board (To Do, In Progress, Completed)
- **Cards** — individual tasks (descriptions, checklists, attachments, due dates)

**How Trello Works:** Create board → Add lists (workflow stages) → Create cards (tasks) → Move cards across lists as work progresses.

**Advantages:** Very easy to use · Ideal for small teams/students · Clear visual organization · Real-time collaboration

### ⚖️ 9.7 Jira vs Trello Comparison

| Feature | Jira | Trello |
|---|---|---|
| Complexity | Advanced and feature-rich | Simple and easy to use |
| Best For | Software development teams | Small teams, students, simple projects |
| Interface | Detailed dashboards and reports | Visual boards with drag-and-drop |
| Agile Support | Full Scrum & Kanban support | Mainly Kanban-style |
| Customization | Highly customizable workflows | Limited customization |
| Reporting | Advanced reports (burndown, velocity) | Minimal reporting |
| Learning Curve | Steeper | Very easy for beginners |

### 💡 Exam-Focus Points
- The **Jira vs Trello comparison table** is a likely direct question.
- Know Scrum Board vs Kanban Board distinction.
- Both Jira and Trello are developed by **Atlassian** — common trick question point.
- Understand how Board and Workflow relate to each other.

---

## Session 10 — Communication & Collaboration in Agile Teams

### 🎯 Learning Outcomes
- Understand importance of team communication
- Understand Agile team collaboration & stakeholder communication
- Understand communication channels, distributed teams, and conflict resolution

### 📖 10.1 Importance of Team Communication

> Team communication in Agile = continuous, transparent exchange of information among **Product Owner, Scrum Master, Development Team, and Stakeholders**.

**Key Importance:**
1. **Enhances Collaboration** — builds trust and teamwork across roles
2. **Ensures Clarity of Goals** — daily stand-ups, sprint planning clarify tasks/priorities
3. **Faster Problem Resolution** — quick communication identifies blockers early
4. **Improves Transparency** — team stays informed, reduces confusion
5. **Supports Continuous Feedback** — via retrospectives and reviews
6. **Increases Productivity** — clear instructions reduce rework

### 📖 10.2 Agile Team Collaboration

> The process where cross-functional team members work together continuously to deliver high-quality software in iterative sprints.

**Emphasizes:** Teamwork over individual work · Continuous communication · Shared responsibility

**How Collaboration Happens:**
1. Product Owner → Team
2. Team → Scrum Master
3. Team ↔ Team Members
4. Team → Stakeholders

### 📖 10.3 Stakeholder Communication

**Who are Stakeholders?** Customers/End users · Product Owner · Business managers · Sponsors/Clients · External partners

**Common Communication Methods:**
- **Sprint Reviews/Demos** — show completed work, collect feedback
- **Daily Stand-ups** (limited stakeholder presence) — share progress
- **Product Backlog Discussions** — clarify requirements/priorities
- **Reports & Dashboards** — visual progress updates

### 📖 10.4 Communication Channels (4 Types)

| Type | Examples |
|---|---|
| **1. Verbal** | Face-to-face discussions, daily stand-ups, sprint planning & reviews |
| **2. Written** | Emails, documentation, reports |
| **3. Digital** | Chat tools (Slack, MS Teams), project tools (Jira, Trello), video calls (Zoom, Google Meet) |
| **4. Visual** | Kanban boards, Scrum boards, dashboards |

### 📖 10.5 Distributed Agile Teams

> Teams where members work from different geographical locations but collaborate using Agile principles — connecting via internet-based tools, virtual meetings, and collaboration platforms.

### 📖 10.6 Conflict Resolution

**Types of Conflicts:**
| Type | Description | Example |
|---|---|---|
| **Task Conflict** | Disagreement about work/solutions | Different technical approaches |
| **Process Conflict** | Disagreement about how work should be done | Sprint planning issues |
| **Relationship Conflict** | Personal issues between members | Most harmful if unresolved |

**Causes of Conflict:** Unclear requirements/goals · Poor communication · Role ambiguity · Work pressure/deadlines · Differences in opinions/skills

**Conflict Resolution Techniques:**
1. Open Communication
2. Active Listening
3. Collaboration & Problem Solving
4. Facilitation by Scrum Master
5. Retrospectives
6. Focus on Goals

### 📖 10.7 Best Practices for Effective Communication

1. Daily Stand-up Meetings
2. Clear and Transparent Communication
3. Use of Agile Tools
4. Active Listening
5. Encourage Collaboration
6. Regular Feedback (Continuous Feedback Loop)
7. Choose the Right Communication Channels
8. Foster a Safe and Open Environment

### 💡 Exam-Focus Points
- Memorize the **4 types of communication channels** with examples each.
- Know the **3 types of conflict** and which is most harmful (Relationship Conflict).
- The Scrum Master's role as **mediator/facilitator** in conflict resolution is often tested.

---

## Session 11 — Reviews & Walkthrough / SRS vs User Stories

### 🎯 Learning Outcomes
- Define review; describe walkthrough
- Define SRS and User Stories
- Summarize comparison of SRS and User Stories

### 📖 Part A: Peer Reviews (Inspections & Walkthroughs)

**Formal Design Reviews (FDRs) vs Peer Reviews:**
- FDRs: most participants hold **superior positions** to project leaders/customer reps; **authorized to approve** the design doc so work can continue.
- Peer Reviews: participants are **equals** (same/other departments); **not** granted approval authority; main objective is **detecting errors and deviations from standards**.

**Participants:**
| Inspection | Walkthrough |
|---|---|
| Review leader | Review leader |
| The author | The author |
| Designer | Standards enforcer |
| Coder/implementer | Maintenance expert |
| Tester | User representative |

- **Standards enforcer** — locates deviations from coding/design standards (indentation, naming, coupling/cohesion)
- **Maintenance expert** — focuses on maintainability/testability & documentation completeness
- **User representative** — brings the user-customer point of view

**Inspection vs Walkthrough — Key Differences:**
- Inspections are **more formal**; emphasize **corrective action** and improving methods; contribute more to overall SQA.
- Walkthroughs are **limited to comments** on the document reviewed; **less formal**; **author is the presenter** (note: in inspections, the author is *not* the presenter).
- Research: walkthroughs discover **far fewer defects** at the same cost (likely due to reduced formalism).

**Preparation:**
- **Inspections** — thorough; participants read the document and list comments beforehand; overview meeting gives background; use a **checklist**.
- **Walkthroughs** — brief; team reads materials for general overview only; participants generally not required to prepare advance comments.

**Comparison Table — Review Methodologies:**

| Property | Design Review | Inspection | Walkthrough |
|---|---|---|---|
| Overview meeting | No | Yes | No |
| Participant preparation | Thorough | Thorough | Brief |
| Review session | Yes | Yes | Yes |
| Follow-up of corrections | Yes | Yes | No |
| Formal training of participants | No | Yes | No |
| Use of checklists | No | Yes | No |
| Error-related data collection | Not formally required | Formally required | Not formally required |
| Review documentation | Formal design review report | Inspection findings + summary report | — |

**Inspections' Comprehensive Infrastructure:**
- Development of inspection checklists (per document type/coding language), periodically updated
- Typical defect-type frequency tables to direct inspectors to "defect concentration areas"
- Training of competent professionals as inspection leaders/moderators
- Periodic analysis of past inspection effectiveness
- Scheduled inspections built into the project activity plan with allocated resources

### 📖 Part B: Software Requirements & SRS

**Requirement Engineering Process:**
Feasibility Study → Requirement Gathering → Software Requirement Specification → Software Requirement Validation

**What is SRS?**
> A document created by a **system analyst** after requirements are collected from stakeholders — translates client's natural-language requirements into **technical language** usable by the development team.

**Characteristics of a Good SRS:**
Complete · Consistent · Unambiguous · Traceable · Verifiable · Modifiable · Prioritized · Testable · High-level & low-level · Relevant · Human-readable · Aligned with business goals

**Features of SRS:**
- User requirements in natural language
- Technical requirements in structured (organizational) language
- Design description in pseudo-code
- Format of forms and GUI screen prints
- Conditional/mathematical notations for DFDs etc.

**Problems with SRS:**
- Completing SRS before implementation delays first feedback on whether the design is good
- Customers often can't fully reveal actual requirements — SRS may reflect developer assumptions more than customer wants
- Easy to miss an important stakeholder (e.g., sales) and lose requirements
- Hardest thing to spot in an SRS review: a **missing requirement**

### 📖 Part C: User Stories

> Short descriptions focused on a specific user and what they want to achieve; placed in the SRS to define product features. Part of the Agile approach — shifts focus from *writing about* requirements to *talking about* them.

**Format:** As a [type of user], I want [some goal], so that [some reason]

### ⚖️ SRS vs User Stories — Major Distinctions

| Dimension | User Stories | Requirements/SRS |
|---|---|---|
| **Focus** | Experience — what the user wants to *do* | Functionality — what the product *should do* |
| **Length/Style** | 1–2 sentences | Detailed, technical, longer to write |
| **When Written** | Throughout product building; updated anytime; live in the product backlog | Can be crafted anytime, but best defined after user-story-level needs first |
| **Who Writes It** | Anyone close to the software — devs, QA testers — as long as it represents the end-user's perspective | Product manager, product owner, or business analyst (with technical leads/engineers) |

### 💡 Exam-Focus Points
- The **Inspection vs Walkthrough comparison table** — a favorite full-mark question.
- Know **who is the presenter** in each (author presents in walkthrough; NOT in inspection).
- Memorize all **SRS characteristics** — likely to be asked as a list.
- The **SRS vs User Stories comparison** (Focus / How written / When written / Who writes) is a guaranteed high-value question — memorize the 4-dimension table.

---

## Session 12 — Agile Modeling & Extreme Programming (XP)

### 🎯 Learning Outcomes
- Define Agile Modeling (Scott Ambler's definition)
- Summarize the Principles for Agile Software Development
- Define Extreme Programming, describe XP Model, Practices & Process

### 📖 Part A: Agile Modeling (AM)

**Why modeling is needed:** For large, business-critical systems, scope/complexity must be modeled so that:
1. All stakeholders can better understand what needs to be accomplished
2. The problem can be partitioned effectively among the people solving it
3. Quality can be assessed as the system is engineered and built

> Traditional modeling methods/notations (30+ years of them) have merit but proved **difficult to apply and hard to sustain** across projects.

**What is Agile Modeling?**
> AM is a **practices-based process** describing how to be an effective modeler. It helps find the **"modeling sweet spot"** — modeled enough to explore/document the system effectively, but not so much it becomes a burden that slows the project.

**Scott Ambler's Definition (Official):**
> "Agile Modeling (AM) is a practice-based methodology for effective modeling and documentation of software-based systems. AM is a collection of values, principles, and practices for modeling software that can be applied in an effective and light-weight manner. Agile models are more effective than traditional models because they are **just barely good** — they don't have to be perfect."

### 📋 The Principles for Agile Software Development (12 Principles)
*(same 12 principles as the Agile Manifesto — restated here in the AM context)*

1. Highest priority: satisfy the customer via early & continuous delivery
2. Welcome changing requirements, even late in development
3. Deliver working software frequently (weeks, preference for shorter)
4. Business people and developers work together daily
5. Build around motivated individuals; trust them
6. Face-to-face conversation is most efficient
7. Working software is the primary measure of progress
8. Sustainable development at a constant pace
9. Continuous attention to technical excellence and good design
10. Simplicity — maximizing work not done
11. Best architectures/requirements/designs emerge from self-organizing teams
12. Regular reflection and behavior tuning

### 🌟 Core Practices That Make AM Unique

1. **Model with a Purpose** — have a specific goal before creating a model (e.g., communicate to customer, understand an aspect of the software); the goal determines notation/detail level.
2. **Travel Light** — keep only models with long-term value; discard the rest (every kept work product must be maintained through changes).
3. **Content is More Important than Representation** — a model with flawed notation but valuable content beats a syntactically perfect model with little useful content.
4. **Know the Models and Tools You Use** — understand the strengths/weaknesses of each model/tool.
5. **Adapt Locally** — the modeling approach should be adapted to the needs of the specific agile team.

### 📖 Part B: Extreme Programming (XP)

> XP is a **lightweight (agile) methodology** for small-to-medium teams developing software facing **vague or rapidly changing requirements**. It brings the whole team together around simple practices, with enough feedback to tune the practices to their unique situation.

**Why XP is "lightweight":**
- Instead of heavy up-front documentation, XP emphasizes **plenty of feedback**
- **Embrace change** — iterate often, design/redesign, code/test frequently, keep customer involved
- Deliver software in **short (2-week) iterations**
- **Eliminate defects early**, reducing cost

**XP's Four Framework Activities** (object-oriented approach): **Planning → Design → Coding → Testing**

### 🔄 The XP Process — Detailed

**1. Planning**
- Begins with **listening** — a requirements-gathering activity that helps the technical team understand business context and get a broad feel for required output/features.
- Leads to creation of **"stories"** (user stories) describing required output, features, functionality.

**2. Design**
- Rigorously follows **KIS (Keep It Simple)** — simple design always preferred over complex representation.
- Encourages **CRC (Class-Responsibility-Collaborator) cards** — a mechanism for thinking about software in an object-oriented context.

**3. Coding**
- After stories & preliminary design, the team does **NOT** move straight to code — first develops a series of **unit tests** exercising each story to be included in the current release.
- Unit test created first → developer focuses on what must be implemented to pass it (**Test-First**).
- Once code is complete, it's unit-tested immediately → instantaneous feedback.

**4. Testing**
- Unit tests implemented in a framework enabling **automation** (easily/repeatedly executed).
- Encourages a **regression testing strategy** whenever code is modified (frequent, given XP's refactoring philosophy).
- **Acceptance tests** (a.k.a. "customer tests") — specified by the customer; focus on overall system features/functionality visible/reviewable by the customer.

### ⚡ XP Practices (8 Core Practices)

| # | Practice | Description | Advantages | Disadvantages |
|---|---|---|---|---|
| 1 | **Small Releases** | Small in functionality → releases happen frequently; supports the "planning game" | Frequent feedback, better tracking, reduces overall slippage | Not easy/needed for all projects; versioning issues |
| 2 | **Simple Design** | Keep it simple; do only what's needed | Saves time, easier to understand, enables refactoring/collective ownership | "Simple" is subjective; simple isn't always best |
| 3 | **Testing** | Unit testing, test-first design, all automated | Promotes completeness; gives developers a goal; regression suite | Not all testing can be automated; test quality matters |
| 4 | **Refactoring** | Change *how* the system works, not *what* it does; improves quality | Proactive improvement; increases developer system knowledge | Not everyone can refactor well; not always appropriate |
| 5 | **Pair Programming** | Two developers, one monitor, one keyboard; one "drives," other thinks; roles switch | Two heads better than one; sharper focus, better test-case thinking | Not all tasks need 2 programmers; hard sell to customers (cost) |
| 6 | **Collective Ownership** | All developers own all the code; enables refactoring | Mitigates loss of a team member; promotes system-wide responsibility | Loss of individual accountability; hard to "own" very large systems |
| 7 | **Continuous Integration** | New features/changes integrated immediately (code not held back >1 day) | Reduces lengthy integration process; enables Small Releases | 1-day limit not always practical; can reduce architectural forethought |
| 8 | **On-Site Customer** | Customer present to "steer" project; gives quick, continuous feedback | Quick knowledgeable answers; ensures right thing is built; correct prioritization | Hard to secure; customer rep may lack full authority/knowledge; costs the customer's company staff time |

### 💡 Exam-Focus Points
- Memorize **Scott Ambler's AM definition** — likely a direct "define" question.
- Know the **5 unique AM practices** (Model with a Purpose, Travel Light, Content > Representation, Know Your Tools, Adapt Locally).
- The **XP Process** (Planning → Design → Coding → Testing) with what happens in each — very likely essay question.
- **All 8 XP Practices** with at least 1 advantage + 1 disadvantage each — this is the single most exam-heavy table in Session 12.
- Remember: in XP, **tests are written before code** (test-first) — a key differentiator from traditional coding.

---

## 🔑 Master Cheat Sheet (Quick Revision)

### SDLC Models at a Glance
| Model | Core Idea | Best For | Key Risk |
|---|---|---|---|
| **Waterfall** | Strict sequential phases | Small, stable-requirement projects | Late defect discovery |
| **Incremental** | Build in independently-tested chunks | Projects needing early partial delivery | Integration complexity |
| **Prototyping** | Build a mock-up first, refine via feedback | Unclear/evolving requirements | Scope creep |
| **RAD** | Rapid prototyping + reusable components | Time-boxed, modular projects | Not for large/high-risk systems |
| **Spiral** (Boehm, 1986) | Risk-driven repeated cycles | Large, complex, high-risk projects | High management complexity |
| **Agile** | Iterative sprints, customer collaboration | Changing requirements | Needs disciplined team |

### Formulas to Remember
- **Three-Point Estimation:** Final Estimate = (O + 4M + P) / 6
- **Velocity:** Sum of completed story points in a sprint
- **RICE Score:** (Reach × Impact × Confidence) / Effort
- **WSJF:** Cost of Delay / Job Size

### Definitions Bank (one-liners)
- **SE (IEEE):** Systematic, disciplined, quantifiable approach to development, operation & maintenance of software.
- **SDLC:** Structured process to plan, design, develop, test, deploy, and maintain software.
- **Agile Model:** Software developed in small iterations/sprints with continuous customer feedback.
- **Sprint:** Time-boxed period (2 weeks–1 month) to complete a defined set of work.
- **Scrum:** Agile framework for managing complex projects via Sprints.
- **Velocity:** Amount of work (story points) completed per sprint — measures team capacity.
- **Story Points:** Relative, abstract measure of effort/complexity/risk.
- **User Story:** As a [role], I want [goal], so that [benefit].
- **Acceptance Criteria:** Given [context], When [action], Then [result].
- **SRS:** Technical document translating stakeholder requirements into a form usable by developers.
- **Risk:** An uncertain event that may negatively affect a project (cost, schedule, quality, scope, performance).
- **Agile Modeling (Scott Ambler):** Practice-based methodology for effective, light-weight modeling/documentation — models are "just barely good."
- **Extreme Programming (XP):** Lightweight agile methodology for small/medium teams facing vague or rapidly changing requirements; short 2-week iterations.

### Role/Framework Quick Map
- **Scrum roles:** Product Owner (what to build) · Scrum Master (process/facilitation) · Dev Team (builds it)
- **Scrum events:** Sprint Planning → Daily Scrum → Sprint Review → Sprint Retrospective
- **Scrum artifacts:** Product Backlog → Sprint Backlog → Increment
- **XP's 4 framework activities:** Planning → Design → Coding → Testing
- **Risk management steps:** Identification → Analysis → Prioritization → Mitigation → Monitoring & Control
- **4 risk mitigation strategies:** Avoidance, Reduction, Transfer, Acceptance
- **4 risk categories:** Project, Technical, Business, External

### High-Yield Comparison Tables to Re-Memorize
1. Waterfall vs Iterative Model (Session 3)
2. Agile vs Traditional Model (Session 5)
3. Jira vs Trello (Session 9)
4. Inspection vs Walkthrough (Session 11)
5. SRS vs User Stories (Session 11)
6. Design Review vs Inspection vs Walkthrough process table (Session 11)

---

## ❓ Compiled Self-Assessment Question Bank

### Session 1
- What is Software Engineering? (IEEE definition)
- Differentiate Software vs Hardware.
- List and briefly explain the 6 eras of software evolution.
- Explain the dual role of software with examples.
- What is Adaptive Software Engineering? How does it differ from traditional SE?

### Session 2
- What is SDLC? Why is it important?
- List and explain all 7 phases of SDLC with their outcomes.
- Differentiate HLD and LLD.
- What are the four types of testing in the Testing phase?

### Session 3
- Define the Waterfall Model. Discuss its advantages and limitations.
- What is the Iterative Model?
- Define a Prototype and explain why user feedback is important in the Prototyping Model.
- Compare Waterfall and Iterative Models.
- Explain the phases of the Prototyping Model.

### Session 4
- What is Rapid Application Development (RAD)? List its phases.
- What is the Spiral Model? Explain with its 4 phases (and who proposed it).
- Define Risk Analysis, Risk Identification, and Risk Mitigation. How do they differ?
- List the 4 categories of software risk with examples.
- Explain the 4 risk mitigation strategies with examples.

### Session 5
- What is Agile Development? Explain its importance.
- Why is Agile preferred over traditional models?
- Explain the values and 12 principles of the Agile Manifesto.
- Describe the Agile lifecycle with its phases.
- Compare Agile and Traditional (Waterfall) models.

### Session 6
- What is Scrum and how does it support Agile development?
- Explain the roles of Product Owner and Scrum Master.
- Describe the Scrum Events and their importance.
- Explain Scrum Artifacts and the benefits of Scrum.
- What is Sprint Planning and Sprint Retrospective? Explain their role in continuous improvement.

### Session 7
- Explain the User Story format with an example.
- What is Acceptance Criteria (GIVEN-WHEN-THEN)?
- Differentiate Product Backlog and Sprint Backlog.
- Explain Backlog Grooming/Refinement.
- Describe RICE, WSJF, and MoSCoW prioritization techniques.

### Session 8
- Explain any three Agile estimation techniques.
- What are Story Points? How is Planning Poker conducted?
- What is Velocity? How is it calculated?
- Explain how Velocity is used in Sprint Planning.
- Solve: Given Optimistic, Most Likely, Pessimistic estimates, calculate the Three-Point Estimate.

### Session 9
- What are Agile tools and why are they important?
- Explain the key features of Jira (boards, workflows, sprint management).
- Explain Trello's boards, lists, and cards.
- Compare Jira and Trello based on complexity, features, and use cases.

### Session 10
- What is team communication in Agile? Why is it important?
- What is Agile team collaboration?
- Who are stakeholders in Agile projects? Name two stakeholder communication methods.
- What are the four types of communication channels in Agile?
- Explain the types of conflict in Agile teams and resolution techniques.

### Session 11
- Define review. Describe walkthrough and inspection with their differences.
- Compare Design Review, Inspection, and Walkthrough (process table).
- Define SRS. What are its characteristics?
- What are User Stories? Give the format.
- Compare SRS and User Stories (focus, style, when written, who writes).

### Session 12
- Define Agile Modeling (Scott Ambler's definition).
- List the Principles for Agile Software Development.
- Define Extreme Programming (XP). Why is it called "lightweight"?
- Describe the XP Process (Planning, Design, Coding, Testing).
- List and explain the 8 XP Practices with advantages/disadvantages.

---

*Study guide compiled from Sessions 1–12 (CO1) of Adaptive Software Engineering (24CI3201 / 23CI2001). Good luck with your exams! 🎓*
