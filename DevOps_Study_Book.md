# 📘 DevOps & Adaptive Software Engineering — Complete Study Notes

> Compiled from all 11 course decks (DevOps Overview, DevOps Intro, DevOps Culture & Practices, CI/CD, Git, Docker, Kubernetes, OWASP Top 10 Parts I & II, Prometheus & Grafana, Cloud Computing) for exam revision.
> Import this file into Notion via **Import → Markdown** to get a fully structured, navigable study page.

---

## 🗂️ Table of Contents

1. [Introduction to DevOps](#1-introduction-to-devops)
2. [DevOps Culture, Mindset & Practices](#2-devops-culture-mindset--practices)
3. [The Agile Model & Agile + DevOps](#3-the-agile-model--agile--devops)
4. [CI/CD — Continuous Integration & Delivery](#4-cicd--continuous-integration--delivery)
5. [Git & Version Control](#5-git--version-control)
6. [Docker & Containerization](#6-docker--containerization)
7. [Kubernetes Fundamentals](#7-kubernetes-fundamentals)
8. [Monitoring: Prometheus & Grafana](#8-monitoring-prometheus--grafana)
9. [Cloud Computing (AWS / GCP / Azure)](#9-cloud-computing-aws--gcp--azure)
10. [OWASP Top 10 — Application Security](#10-owasp-top-10--application-security)
11. [DevOps Advanced Practices (IaC, GitOps, DevSecOps, SRE)](#11-devops-advanced-practices)
12. [Case Study: FinTech Corp DevOps Transformation](#12-case-study-fintech-corp-devops-transformation)
13. [Glossary — Key Terms at a Glance](#13-glossary--key-terms-at-a-glance)
14. [Self-Assessment / Exam Question Bank](#14-self-assessment--exam-question-bank)

---

## 1. Introduction to DevOps

### 1.1 What is DevOps?
- **DevOps = Development + Operations.** It is **not a tool or technology** — it is a **culture, philosophy, and set of practices** that unites software development and IT operations into one continuous, collaborative cycle instead of two siloed teams handing work back and forth.
- Goal: **build, test, and release software faster, more reliably**, with better collaboration between the people who write code and the people who run it.
- DevOps aims to remove the **communication barrier** between Developers and Operations and build trust between them.

> 🍽️ **Restaurant analogy:** If chefs (developers) cook food but never talk to waitstaff (operations) about how it's served, dishes arrive late and confused. DevOps is chefs and waitstaff coordinating closely — testing together, fixing issues on the spot — so the food (software) reaches customers faster and better.

### 1.2 Overview / Structure of DevOps
- DevOps is an **agile relationship** between development and IT operations.
- **Development** side includes: **Plan, Create, Verify, Package**
- **Operations** side includes: **Release, Configure, Monitor**

### 1.3 Why DevOps Exists — The Problem It Solves

| Old Way (Silos) | DevOps Way |
|---|---|
| Dev writes code, throws it over the wall | Dev and Ops collaborate from day one |
| Releases every few months | Releases daily/weekly, sometimes hourly |
| Manual testing and deployment | Automated testing and deployment |
| "It works on my machine" issues | Consistent environments via containers/IaC |
| Slow bug fixes after release | Continuous monitoring catches issues fast |

### 1.4 The DevOps Lifecycle (Infinity Loop)
A **continuous loop, not a straight line** — monitoring feeds back into planning.

**DEV side:** Plan → Code → Build & Test → Release
**OPS side:** Deploy → Operate → Monitor → (feeds back into Plan)

| Stage | # | Tool Examples | What Happens |
|---|---|---|---|
| Plan | 1 | Jira, Backlog tools | Define what to build (e.g., "add to cart" feature) |
| Code | 2 | GitHub, Git | Write & version code across feature branches |
| Build & Test | 3 | Jenkins, GitHub Actions | Compile code, run automated tests on every commit |
| Release | 4 | Docker registry | Package tested build, tag it, prep for deployment |
| Deploy | 5 | Kubernetes | Roll new version out to production gradually |
| Operate | 6 | Ansible / Terraform | Keep app running; manage server config automatically |
| Monitor | 7 | Grafana, Prometheus | Track performance/errors in real time; alert team |

### 1.5 End-to-End Example: E-commerce Checkout Bug Fix
1. Developer fixes bug, pushes code to GitHub.
2. GitHub Actions automatically builds and runs tests (**~20 minutes**).
3. If tests pass, code deploys to staging then production — often **within minutes** (vs. weeks in traditional release models).
4. Monitoring tools immediately track for new errors/slowdowns.
5. If something breaks → **automated rollback** happens instantly and the team is alerted.

### 1.6 Key Terms to Know

| Term | Meaning |
|---|---|
| **CI/CD** | Continuous Integration / Continuous Delivery (or Deployment) |
| **IaC** | Infrastructure as Code — managing servers via scripts, not manual setup |
| **Containerization** | Packaging an app with its dependencies, e.g., Docker |
| **Orchestration** | Managing many containers at once, e.g., Kubernetes |
| **Pipeline** | The automated sequence from code commit to production |
| **Rollback** | Automatically reverting to the last working version on failure |

### 1.7 Understanding the DevOps Movement (Traditional Flow)
Sequence of events when a feature/bug fix is implemented (pre-DevOps / siloed model):
1. Dev team writes code → deploys to **development environment**, tests it.
2. Code deployed to **QA environment**, verified by testing team.
3. Code handed to **Ops team** for deployment to **production**.
4. Ops team manages and maintains the code.

### 1.8 Issues With the Siloed (Old) Approach
- Transition of a build can take **weeks or months**.
- Dev, QA, and Ops teams have **different priorities**, making coordination hard.
- Dev focuses on latest release; Ops cares about **production stability**.
- Dev and Ops teams are **unaware of each other's work culture**.
- Both teams may use **different automation techniques**.
- Neither team understands the other's challenges — no shared "ideal scenario" view.

**Challenges for the Development Team**
- Competitive market → on-time delivery pressure.
- Must manage production-ready code + new feature implementation simultaneously.
- Long release cycles force assumptions before deployment → issues take longer to fix once found in staging/production.

**Challenges for the Operations Team**
- **Resource contention** — handling increasing resource demands is difficult.
- **Redesigning/tweaking** needed to run the app in production.
- **Diagnosing and rectifying** issues after deployment, often in isolation.

### 1.9 Collaboration
- DevOps fills silo gaps by building a **partnership** between Dev and Ops.
- Emphasizes **communication, collaboration, integration**.
- Collaboration is facilitated by **automation and orchestration**.

### 1.10 Major Benefits of DevOps
- **Faster Software Delivery** — daily/multiple-times-a-day releases instead of every six months.
- **Improved Collaboration** — faster problem-solving, better teamwork.
- **Higher Software Quality** — more stable, reliable applications.
- **CI/CD** — faster, error-free releases.
- **Increased Deployment Frequency** — customers get features/fixes faster.
- **Faster Bug Detection & Resolution** — reduced downtime, quicker recovery.
- **Enhanced Security (DevSecOps)** — fewer vulnerabilities.

### 1.11 DevOps Services → Tools Mapping (classic table)

| # | DevOps Service | Tools |
|---|---|---|
| 1 | Source code management | Git, Mercurial |
| 2 | Continuous Integration | Jenkins, TeamCity, GitLab, Travis CI |
| 3 | Continuous management (config) | Puppet, Chef, SaltStack |
| 4 | Continuous deployment | Puppet, Docker |
| 5 | Continuous monitoring | Nagios, Zabbix, PRTG Network Monitor |
| 6 | Automation scripting | Perl/Python, Ruby, Ansible |

---

## 2. DevOps Culture, Mindset & Practices

### 2.1 What is DevOps? (Expanded Definition)
DevOps is **a set of practices, cultural philosophies, and tools** that increases an organization's ability to deliver applications and services at high velocity. It bridges Dev and Ops through five pillars — **CALMS**:

| Pillar | Meaning |
|---|---|
| **C**ulture | Shared responsibility, transparency, continuous learning across teams |
| **A**utomation | Eliminate repetitive manual work in build/test/deploy pipelines |
| **L**ean | Reduce waste, optimize flow, deliver small incremental improvements |
| **M**easurement | Track metrics like deployment frequency, MTTR, lead time |
| **S**haring | Open communication, knowledge sharing, collaborative tooling |

### 2.2 The DevOps Mindset (4 Pillars)
1. **Collaboration Over Silos** — Dev and Ops work as one unified team, sharing goals/risks/rewards; **blame culture replaced with blameless post-mortems**.
2. **Continuous Improvement** — **Kaizen (改善)** philosophy: every sprint/deployment is a chance to learn and improve.
3. **Fail Fast, Learn Faster** — small, frequent releases reduce blast radius; failures = learning experiments, not catastrophes.
4. **Data-Driven Decisions** — metrics/observability guide decisions; **DORA metrics** (deployment frequency, lead time, MTTR, change failure rate) are the gold standard.

### 2.3 DORA Metrics (important for exams)
| Metric | What it measures |
|---|---|
| Deployment Frequency | How often code is deployed to production |
| Lead Time for Changes | Time from commit to production |
| Change Failure Rate | % of deployments causing a failure |
| Mean Time to Recovery (MTTR) | Time to recover from a failure |

### 2.4 Continuous Feedback
The practice of **gathering, analyzing, and acting on information** at every stage of the software delivery lifecycle.

| Feedback Type | Description |
|---|---|
| Code Review Feedback | Pull requests, peer reviews, static analysis — instant quality feedback before merge |
| CI/CD Pipeline Feedback | Automated tests/builds report pass/fail in minutes; broken builds alert team immediately |
| User Feedback | A/B testing, feature flags, user analytics reveal real usage patterns |
| Monitoring & Alerting | App/infra metrics, error rates, logs give real-time operational feedback 24/7 |

> **Rule of thumb:** The shorter the feedback loop, the faster teams learn, adapt, and deliver value.

**Feedback Tools:** Prometheus + Grafana (metrics/dashboards), ELK Stack (log analysis), PagerDuty (incident alerting), SonarQube (code quality gates), Datadog (full-stack observability).

### 2.5 Automation in DevOps
Automation eliminates repetitive manual tasks, reduces human error, and enables faster/reliable deployment. *"Every manual step is a bug waiting to happen."*

| Automation Area | Tools |
|---|---|
| CI/CD Automation | Jenkins, GitHub Actions, GitLab CI, CircleCI |
| Test Automation | Selenium, JUnit, pytest, Postman, K6 |
| Infrastructure Automation | Terraform, Ansible, Pulumi, CloudFormation |
| Security Automation | Snyk, Trivy, OWASP ZAP, Vault |
| Monitoring Automation | Prometheus, Alertmanager, PagerDuty |
| Container Automation | Docker, Kubernetes, Helm, ArgoCD |

### 2.6 CI/CD Pipeline Deep-Dive (6 Stages)
**Source Control → Build → Unit Tests → Security Scan → Staging Deploy → Production**

- Source Control: Git commit triggers pipeline.
- Build: Compile, package artifacts.
- Unit Tests: Fast, isolated test suite.
- Security Scan: SAST, dependency vulnerability check.
- Staging Deploy: Deploy to test environment.
- Production: Blue-green or canary release.

**Key Benefits:** ✓ 80% faster delivery ✓ 99% fewer manual errors ✓ Deploy 200x more frequently ✓ 50% less time on failed deploys.

### 2.7 Collaboration Tools in DevOps

| Category | Tools |
|---|---|
| Version Control | GitHub, GitLab, Bitbucket |
| Communication | Slack, Microsoft Teams, Mattermost |
| Project Tracking | Jira, Azure Boards, Linear |

### 2.8 ChatOps
The practice of using chat platforms (Slack/Teams) as the **central hub for operations** — engineers trigger deployments, get alerts, manage incidents from chat, creating a transparent, auditable record.
```
$ /deploy app:production version:2.4.1
$ /rollback app:production
$ /status app:production
$ /incident create priority:P1
```

### 2.9 Infrastructure as Code (IaC) — see also [Section 11](#11-devops-advanced-practices)

### 2.10 Configuration Management
Systematically handling system configuration to maintain consistency — *"Is every server configured exactly as intended?"*

| Tool | Model | Highlights | Best Use |
|---|---|---|---|
| **Ansible** | Agentless (SSH/WinRM) | Simple YAML playbooks, no agent, great for ad-hoc tasks | Server hardening, app deployment |
| **Chef** | Agent-based (Chef Client) | Ruby-based recipes, mature ecosystem, InSpec compliance | Complex enterprise CM, compliance |
| **Puppet** | Agent-based (Puppet Agent) | Declarative manifests, large module library, enterprise features | Large-scale server fleets |

### 2.11 Containers & Kubernetes Snapshot
**Docker**
- Packages app + dependencies into portable container image.
- Runs identically anywhere Docker is installed.
- Lightweight — shares host OS kernel (unlike VMs).
- Images stored in registries: Docker Hub, ECR, GCR.
- Workflow: **Write Dockerfile → docker build → docker push → Kubernetes deploys image → auto-scales**

**Kubernetes (⎈)**
- Orchestrates containers across a cluster of nodes.
- Auto-healing: restarts failed containers automatically.
- Horizontal Pod Autoscaling based on CPU/memory.
- Rolling updates with zero-downtime deployments.
- Built-in service discovery & load balancing.
- Declarative config via YAML manifests.

### 2.12 DevOps Best Practices (Module 8)
1. **Shift Left on Security** — Integrate security testing early (DevSecOps): run SAST, DAST, dependency scans on every PR.
2. **Use Feature Flags** — Decouple deployment from release; control visibility (e.g., LaunchDarkly).
3. **Practice GitOps** — Git is the single source of truth for app code AND infra; all changes via PRs.
4. **Implement Observability** — 3 pillars: **Metrics (what), Logs (why), Traces (where)**.
5. **Blameless Post-Mortems** — focus on systemic failures, not individuals; document timeline, root cause, action items.
6. **Small, Frequent Releases** — reduces blast radius, easy rollbacks, faster feedback.

### 2.13 Monitoring & Observability — Reliability Concepts

| Concept | Meaning |
|---|---|
| **SLI** (Service Level Indicator) | A specific metric, e.g., % of requests < 200ms |
| **SLO** (Service Level Objective) | Target value for SLI, e.g., 99.9% availability |
| **SLA** (Service Level Agreement) | Legal contract with penalty if SLO breached |
| **Error Budget** | Allowed failure time — SLO determines acceptable downtime/month |

**Observability's 3 Pillars:**
| Pillar | Description | Tools |
|---|---|---|
| 📊 Metrics | Numerical measurements over time (CPU, memory, request/error rate) | Prometheus, CloudWatch, Datadog |
| 📋 Logs | Timestamped records of events | ELK Stack, Loki, Splunk, Fluentd |
| 🔗 Traces | End-to-end request tracking across microservices; shows latency bottlenecks | Jaeger, Zipkin, AWS X-Ray, OpenTelemetry |

### 2.14 Course Summary — 6 Key Takeaways
1. **Culture is #1** — mindset, not toolset.
2. **Continuous Everything** — CI/CD, testing, monitoring, feedback loops.
3. **Automate Toil Away** — "if you do it twice, script it; if three times, build a pipeline."
4. **Everything as Code** — version control infra, config, pipelines.
5. **Measure & Improve** — track DORA metrics.
6. **Security is Shared** — DevSecOps means every developer owns security.

---

## 3. The Agile Model & Agile + DevOps

### 3.1 Why Agile?
Inefficient estimation, long time-to-market, and other Waterfall issues led to the **Agile model**. Agile empowers individuals, encourages interaction, values working software, customer collaboration, and rapid response to change.

### 3.2 Agile Characteristics
- Emphasizes **customer satisfaction** through continuous delivery in **short sprints**.
- After each sprint, a version of the app with some features is ready to demo → **multiple deployments**, not one-time.
- Communication & collaboration across cross-functional teams is essential.
- Traditional **manual deployment** becomes a speed barrier for incremental/agile delivery → hence the need to change deployment processes too (→ leads into DevOps).

### 3.3 The Shoe Factory Analogy (bottleneck illustration)
- Imagine a shoe factory: one department makes shoes, another packages them.
- If packaging is slow, shoes pile up (a **bottleneck**).
- If shoemaking speeds up (new machines) but packaging doesn't, the backlog gets *worse*.
- **Lesson:** Speeding up development (Agile) without speeding up deployment/operations creates a Dev↔Ops gap — this is exactly the gap DevOps closes.

### 3.4 Agile vs DevOps vs Both

| AGILE | DEVOPS | BOTH |
|---|---|---|
| Iterative development (sprints) | Continuous Integration & Delivery | — |
| Customer collaboration over contracts | Automated testing & deployment | — |
| Respond to change over following a plan | Dev + Ops + Security collaboration | — |
| Working software over documentation | Monitoring and observability | — |
| Cross-functional dev teams | Infrastructure automation | — |
| Daily standups & retrospectives | — | Blameless culture & feedback loops |

**Key Insight:** **Agile manages WHAT to build** (requirements & priorities). **DevOps manages HOW to build, test, and deliver it** reliably and rapidly. Together = a powerful delivery engine.

### 3.5 Agile Scrum + DevOps Integration
**Scrum flow:** Product Backlog → Sprint Planning → Sprint (2 weeks) → Daily Standup → Sprint Review → Retrospective
**Parallel DevOps pipeline:** Commit → CI Build → Unit Test → Staging → Prod Deploy → Monitor

---

## 4. CI/CD — Continuous Integration & Delivery

### 4.1 Definitions

| Term | Definition |
|---|---|
| **Continuous Integration (CI)** | Developers merge code changes into a shared repo often (many times/day); automated tests check for breakages |
| **Continuous Delivery (CD)** | Code that passes tests is automatically prepared for release; a **human decides** when to release to production |
| **Continuous Deployment (CD)** | Every change that passes tests goes **live automatically** — no human approval needed |

### 4.2 Why CI/CD? (Old vs New)
- **Old Way (Waterfall):** Code written for months, tested in huge batches → long delays, many bugs.
- **New Way (CI/CD):** Code built & tested in tiny, easy-to-fix steps → faster delivery, fewer mistakes, less stress.

### 4.3 The CI/CD Pipeline (Assembly-Line Analogy)
1. **Source** — developer commits code to Version Control (e.g., GitHub).
2. **Build** — system compiles code into a usable program.
3. **Test** — automated scripts run safety/quality checks; line stops if a bug is found.
4. **Deploy** — working code sent to users.

### 4.4 Full CI/CD Pipeline Stages (7 stages — high-yield for exams)

| # | Stage | What Happens |
|---|---|---|
| 1 | **Source** | Devs commit to Git; pipeline auto-triggers on push |
| 2 | **Build** | Source compiled, dependencies downloaded, artifacts created |
| 3 | **Test** | Unit, integration, functional, security tests run; pipeline stops on failure |
| 4 | **Package** | App packaged into deployable artifacts (Docker images, ZIP, JAR) |
| 5 | **Release** | Artifacts stored in a repository; versioning & release management |
| 6 | **Deploy** | Deployed to dev → test → staging → production environments |
| 7 | **Verify/Monitor** | Health checks, log/performance monitoring; rollback if issues detected |

> 📝 **Exam one-liner:** *"The main stages of a CI/CD pipeline are Source, Build, Test, Package, Release, Deploy, and Monitor. These stages automate software integration, testing, and deployment to deliver applications quickly and reliably."*

### 4.5 Build Automation in CI/CD
**Definition:** Automatically compiling source code, running tests, packaging applications, and preparing deployment artifacts whenever code changes.

**How it works:**
1. Developer pushes code (GitHub/GitLab/Bitbucket).
2. CI server detects the change.
3. Automated steps run: download dependencies → compile/build → run unit tests → code quality checks → package app (JAR/WAR/Docker image).
4. If successful, artifacts are stored and passed to the CD pipeline.

**Common Build Automation Tools:** Jenkins, GitHub Actions, GitLab CI/CD, Maven, Gradle, Apache Ant.

### 4.6 Testing Automation in CI/CD
Automatically executing tests whenever code is committed.
- Developer commits → CI pipeline triggered → app built → tests run: **Unit, Integration, API, UI/Functional, Security & Performance tests**.
- Pass → pipeline continues to deployment. Fail → pipeline stops, developers notified.

### 4.7 Deployment Automation in CI/CD
Automatically releasing software to test/staging/production **without manual intervention**.

| Continuous Delivery | Continuous Deployment |
|---|---|
| Automated up to staging; **production requires manual approval** | Every successful change **auto-deployed to production** |

### 4.8 Real-World Analogy
Without CI/CD → manual upload, might forget to test. With CI/CD → as soon as you save, an automated pipeline tests and deploys your code.

**Common CI/CD Tools:**
- **GitHub Actions** — runs workflows inside GitHub.
- **GitLab CI/CD** — built-in build/deploy tool.
- **Jenkins** — popular free open-source automation server.
- **Docker** — packages apps to run consistently anywhere.

### 4.9 Best Practices
- Keep build/test steps **fast**.
- Test code on **every change**.
- Fix errors **immediately** — don't let them pile up.
- **Automate everything**.

### 4.10 Benefits of CI/CD
Faster software delivery • Improved software quality • Reduced manual effort • Early bug detection • Lower risk of deployment failures • Better collaboration • Consistent deployment process • Faster feedback • Increased reliability • Cost savings.

---

## 5. Git & Version Control

### 5.1 What is Git?
Git is a **distributed version control system (DVCS)** used to track source-code changes during development.

**Key Features:**
- **Version Control** — tracks file changes over time.
- **Distributed System** — every developer has a **complete copy** of the repository.
- **Branching & Merging** — work on features independently, merge later.
- **Collaboration** — multiple devs work on the same project simultaneously.
- **Fast & Efficient** — handles projects of all sizes with high performance.

### 5.2 Essential Git Commands

| Command | Purpose |
|---|---|
| `git init` | Create a new Git repository |
| `git clone <url>` | Copy an existing repository |
| `git status` | Check repository status |
| `git add <file>` | Stage changes for commit |
| `git commit -m "message"` | Save changes to repository |
| `git push` | Upload changes to a remote repository |
| `git pull` | Download and merge remote changes |
| `git branch` | List or create branches |
| `git merge` | Merge branches |

### 5.3 Standard Git Workflow
1. Create or clone a repository.
2. Make changes to files.
3. Stage changes with `git add`.
4. Commit changes with `git commit`.
5. Push changes to a remote repository.
6. Collaborate and merge changes as needed.

### 5.4 Topics covered in the Git module (per agenda — know these terms)
Introduction to Git • Version Control Concepts • Git Architecture • Repositories and Branches • Merging and Rebasing • Pull Requests • GitHub and GitLab • Feature Branch Workflow • GitFlow Workflow • Best Practices.

---

## 6. Docker & Containerization

### 6.1 What is a Container?
A **container** is a lightweight, portable software package containing an application **plus all libraries, dependencies, runtimes, and configuration files** required to run it. Containers ensure the app behaves consistently across dev/test/prod. Since containers **share the host OS kernel**, they use fewer resources and start much faster than VMs.

### 6.2 Why Containerization? — "Works on My Machine" Problem
Before containers, apps often failed when moved between systems due to OS/library/version differences ("works on my machine"). Containerization packages everything the app needs into one portable unit, so it runs reliably anywhere.

### 6.3 Containerization Process
1. Start with source code + a **Dockerfile** specifying packaging instructions.
2. Docker **builds an image** containing app + dependencies.
3. Image stored in a **registry** (e.g., Docker Hub).
4. A **container** is instantiated from the image and run on a host.

### 6.4 Key Components of Containers
- Application code, required libraries, runtime environment.
- **Namespaces** — provide process isolation.
- **cgroups** — control CPU and memory allocation.
- Together → lightweight, isolated execution environment.

### 6.5 Virtual Machines vs Containers

| Feature | Virtual Machines | Containers |
|---|---|---|
| OS | Separate Guest OS per VM | Shared Host OS |
| Size | Large (GBs) | Small (MBs) |
| Boot Time | Minutes | Seconds |
| Performance | Moderate overhead | Near-native |
| Use Case | Running multiple OSes | Microservices |

- VMs = highly isolated but resource-intensive (each has a full guest OS).
- Containers share the host kernel → fewer resources, faster start, better scalability.

### 6.6 Introduction to Docker
Docker is an **open platform** to develop, ship, and run applications easily, packaged as standardized units called **containers**.

### 6.7 Docker Architecture — 3 Core Components

**1. Docker Daemon (`dockerd`)** — "the brain." Builds containers, runs containers, manages images, handles networks & volumes.

**2. Docker Client** — the CLI tool you use to send commands; client → daemon → action performed.

**3. Docker Registries** — storage for Docker images. Default = **Docker Hub**. Private options: AWS ECR, GitHub Container Registry, Google GCR, Azure ACR.

**4. Docker Images** — read-only templates specifying OS, app, libraries, and startup command. Used to create containers.

**Workflow when you run `docker run nginx`:**
1. Client reads your command.
2. Daemon checks: "Do I have the nginx image locally?"
3. If NO → contacts Docker Hub, downloads the image.
4. Creates and runs a container from that image.
5. Sends output back to the client.

### 6.8 Docker Installation
- Windows/macOS → **Docker Desktop** (includes Engine + GUI). Windows needs **WSL2**; macOS needs **Hypervisor Framework**.
- Linux → install **Docker Engine** directly via package manager.
- Verify: `docker --version`, `docker info`, `docker run hello-world` (downloads a test image and confirms Docker works).

### 6.9 Docker Images, Containers & Dockerfiles
- **Docker Image** — static package with everything needed to run an app (code, libraries, deps, runtime); a "snapshot."
- **Docker Container** — a running instance created from an image.
- **Dockerfile** — text file with instructions to build a Docker image.

### 6.10 Common Dockerfile Instructions

| Instruction | Purpose |
|---|---|
| `FROM` | Sets the base image; every Dockerfile must start with it |
| `COPY` / `ADD` | Copies files from host into container (prefer `COPY`; `ADD` only for URLs/auto-extracting archives) |
| `WORKDIR` | Sets working directory for subsequent commands (creates if missing) |
| `RUN` | Executes commands during image build (e.g., installing packages) |
| `CMD` / `ENTRYPOINT` | Defines what runs when the container starts |

> ⚠️ File must be named exactly **`Dockerfile`** — no extension, capital **D**, placed in the project root.

### 6.11 Dockerfile Instructions → Image Layers
- **Every instruction creates a layer**; layers stack, each representing a change from the previous.
- Docker **caches layers** → faster subsequent builds.
- **Filesystem-changing instructions** (`FROM`, `RUN`, `COPY`, `ADD`) → create a **new layer**.
- **Configuration-only instructions** (`WORKDIR`, `ENV`, `ENTRYPOINT`, `CMD`) → add **metadata layers** (near-zero size).

**Example layer breakdown:**
```
FROM   → base layer (starting OS + language)
COPY   → new layer (copies app files)
RUN    → new layer (executes a build command)
CMD    → final layer (what runs at container start)
```

### 6.12 Worked Example — Python Flask App
**Task:** Dockerfile using Python 3.10, copy `app.py`, install Flask, run the app.
```dockerfile
FROM python:3.10
COPY app.py .
RUN pip install flask
CMD ["python", "app.py"]
```
**Build & Run:**
```bash
docker build -t my-python-app .
docker run -d -p 5000:5000 --name my-container my-python-app
docker ps                     # check running containers
docker stop my-container      # stop container
```
- `-d` → detached (background) • `-p hostPort:containerPort` → port mapping • `--name` → container name

**Build process explanation (applies to any Dockerfile):** Docker downloads the base image → runs an intermediate container → executes each instruction, committing a new intermediate image and removing the intermediate container each time → the last committed image becomes the **final image**, tagged by the daemon.

### 6.13 Docker Hub
- A **container registry** — place where Docker images are stored and shared.
- Centralized repository: build locally → upload to Docker Hub → download/run anywhere without rebuilding.
- Contains **public** (free) and **private** (secure, org-only) repositories.

**Why a Registry?** To save images, share with others, download on other systems, and deploy easily to servers/cloud. Without a registry, images stay on one computer only.

**Registry Workflow:**
```bash
docker build -t myapp .     # 1. build an image
docker push myapp           # 2. push image to registry
docker pull myapp           # 3. pull image on another system
```

| Registry | Description |
|---|---|
| Docker Hub | Public registry (most popular) |
| AWS ECR | Amazon's private registry |
| Azure ACR | Microsoft Azure registry |
| Google GCR | Google Cloud registry |
| Private Registry | Company's own registry |

### 6.14 Docker Networking
Enables communication **between containers** and **between containers and the outside world**.

**Container Networking Model (CNM) objects — analogy table:**

| Object | Analogy | Role |
|---|---|---|
| **Container** | — | The application itself (e.g., nginx, node app) |
| **Network Sandbox** | "Each container lives in its own room" | Isolation + own IP address |
| **Endpoint** | "The door of the room" | Connects container to the network |
| **Network** | "The road outside the rooms" | Containers on the same road can talk; different roads cannot |
| **Docker Engine** | "The building manager" | Creates rooms, doors; connects doors to roads |
| **Network Driver** | "Decides road type" | Bridge (small road), Overlay (big road), Host (direct road) |
| **IPAM** | "Gives house numbers" | Assigns IP addresses to containers |
| **Network Infrastructure** | "The real world outside" | Internet, router, switch |

**Network Drivers:** **bridge** (default, single host), **overlay** (multi-host, e.g., Swarm/K8s), **host** (shares host's network directly).

### 6.15 Docker Volumes
Volumes store container data **permanently** — data survives container stop/delete/recreate. This is called **decoupling data from the container lifecycle**.

**Why needed:** Containers are temporary; data must be permanent.
**Storage location:** Linux → `/var/lib/docker/volumes/`. Windows/macOS → inside the Docker Desktop VM.

**Advantages:**
1. **Persistent Data** — e.g., MySQL data survives container deletion/recreation.
2. **Data Sharing** — multiple containers can read/write the same volume (useful in microservices).
3. **Separation of Concerns** — app code and data kept separate; replace containers without losing data.
4. **Backup & Recovery** — easy to back up/restore volumes for disaster recovery.

**Volume Commands:**
```bash
docker volume create my_volume                 # 1. create volume
docker volume ls                                # 2. list volumes
docker run -d --name my_container -v my_volume:/app/data nginx   # 3. attach volume
docker volume inspect my_volume                 # 4. inspect volume metadata
docker volume rm my_volume                      # 5. remove volume (after stopping/removing container)
```

---

## 7. Kubernetes Fundamentals

### 7.1 What is Kubernetes?
**Kubernetes (K8s)** is an open-source **container orchestration platform**, originally developed by Google. It automates deployment, scaling, networking, and management of containerized applications across clusters of machines.

### 7.2 Why Kubernetes?
- Managing hundreds of Docker containers manually is difficult and error-prone.
- K8s automates **scheduling, scaling, load balancing, and recovery**.
- Ensures apps stay available even if individual containers/servers fail.
- Used by **Netflix, Spotify, Airbnb, Google**.

### 7.3 Container Orchestration
The **automated process** of deploying, managing, scaling, networking, and monitoring containerized apps across multiple servers — essential as organizations adopt microservices/cloud-native architectures.

**Example — E-commerce during a sale:**
Normal traffic → 5 containers | Peak traffic → 50 containers | Container failure → auto-recreated | Traffic drops → extra containers removed.

### 7.4 Kubernetes Cluster Architecture
A cluster has **two main parts**:

**A. Control Plane (Master Node)** — "The Brain": makes decisions, schedules apps, monitors the system.

| Component | Role |
|---|---|
| **API Server** (`kube-apiserver`) | Central communication point; receives all requests (e.g., `kubectl apply`), processes them, stores state in etcd |
| **etcd** | Distributed key-value store holding all cluster config/state (deployments, services, volumes) |
| **Scheduler** (`kube-scheduler`) | Assigns new Pods to nodes based on available resources (CPU/memory) |
| **Controller Manager** (`kube-controller-manager`) | Watches cluster state, reconciles to desired state (e.g., restarts a failed Pod) |
| **Cloud Controller Manager** (optional) | Integrates with cloud provider APIs |

**B. Worker Nodes** — where application containers actually run:

| Component | Role |
|---|---|
| **Kubelet** | Agent on each node; ensures containers in a Pod are running; reports status to API Server |
| **Container Runtime** | Runs the containers (e.g., Docker) inside Pods |
| **Kube-proxy** | Manages node networking; routes traffic to correct Pods; enables load balancing & service discovery |

### 7.5 Workflow Example — `kubectl create deployment nginx --image=nginx`
1. **User** issues command via `kubectl`.
2. **API Server** validates the request, stores it in **etcd**.
3. **Scheduler** picks a node with available resources.
4. **Kubelet** on that node starts the nginx container.
5. **Kube-proxy** manages networking so the Pod is reachable, with load balancing.

### 7.6 Pods
- The **smallest deployable unit** in Kubernetes — a *virtual construct*, not a physical entity.
- Usually contains **one container** (can contain more, sharing network/storage).

**Pod Lifecycle Phases:**

| Phase | Meaning |
|---|---|
| **Pending** | Accepted by K8s, but container(s) not yet ready (image pulling, scheduling) |
| **Running** | Bound to a node, containers created, at least one running/starting |
| **Succeeded** | All containers terminated successfully (exit code 0), no restart |
| **Failed** | All containers terminated, at least one failed (non-zero exit / killed) |
| **Unknown** | Pod state can't be obtained (communication error with node) |

**Multi-container vs single-container Pod:** Multi-container Pods share storage/network and communicate via `localhost` with a single shared IP. Single-container Pods have their own IP, communicating over the K8s network.

**Create a Pod without YAML:**
```bash
kubectl create pod nginx --image=nginx
```

**Create a Pod with YAML** — basic structure fields:
- `apiVersion` — K8s API version (e.g., v1)
- `kind` — object type (Pod)
- `metadata` — identifying data (name)
- `spec` — desired state (containers to run)
- `containers` — list with `name`, `image`, `ports`

```bash
kubectl create -f example-pod.yaml     # create pod
kubectl get pods                        # check pod status
kubectl describe nodes                  # check node status
kubectl delete pod example-pod          # delete pod
```

### 7.7 Kubernetes Deployments
A **Deployment** is a higher-level object managing ReplicaSets and Pods — makes management **easier, safer, automated**.

**Features:**
- **Declarative Updates** — manage Pod/ReplicaSet updates declaratively.
- **Simplifies Management** — wraps Pods + ReplicaSets into one object.
- **Automatic Scaling** — easy autoscale.
- **Pod Management** — handles create/update/delete automatically.
- **Rolling Updates & Rollbacks** — update image; roll back on failure.
- **Deployment Control** — pause, resume, undo deployments.

```bash
kubectl create deployment nginx-deployment --image=nginx     # create deployment
kubectl scale deployment nginx-deployment --replicas=3       # scale to 3 replicas
kubectl apply -f example-deployment.yaml                     # apply YAML deployment
kubectl get deployments
kubectl get pods
```

**Key Difference:** Pods are individual execution units (no auto replica management). **Deployments manage Pods** at a higher level — availability, scaling, updates, rollbacks.

### 7.8 Kubernetes Services
Pods are **temporary** — they die/restart/get recreated, changing IP each time. A **Service** gives a **fixed IP and DNS name** so clients can always reach the application.

```bash
kubectl apply -f example-service.yaml
kubectl get services
```
- **ClusterIP** — accessible only within the cluster (default).
- **NodePort** — exposes a port on each node's IP for external access.
- **LoadBalancer** — provisions an external load balancer (cloud environments).

*(Note: the Service's label selector, e.g., `app: example-app`, must match the Deployment's Pod labels.)*

### 7.9 ReplicaSet
Ensures the **specified number of replicas** of a Pod are running.

**Three key fields:**
- `replicas` — how many Pods you want (e.g., 3)
- `selector` — how to find the Pods it owns (by labels)
- `template` — Pod template to use when creating new Pods

**Logic:** Desired replicas = 3, Actual running = 2 → RS creates 1 new Pod.

```bash
kubectl apply -f nginx-replicaset.yaml
kubectl get replicasets
kubectl get pods
```

### 7.10 ConfigMaps
A **ConfigMap** stores **non-sensitive configuration data** as key-value pairs, separating config from app code (e.g., DB URL, app mode, log level, API endpoint).

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database_url: mysql-service
  log_level: INFO
  environment: Production
```

### 7.11 Secrets
Kubernetes **Secrets** securely store confidential data (passwords, API keys, tokens, TLS certs). Data is **Base64-encoded** and protected via **RBAC**.

**Types of Secrets:**
| Type | Purpose |
|---|---|
| **Opaque Secret** | General key-value data (usernames/passwords) |
| **TLS Secret** | SSL/TLS certificates and private keys |
| **Docker Registry Secret** | Credentials to pull images from private registries |

**Access methods:** Environment Variables (simple) or Mounted Files/Volumes (more secure/flexible).

**Common Secret Management Mistakes:**
- Hardcoding secrets in source code.
- Committing secrets to Git repos.
- Reusing the same secret across dev/test/prod.
- Overly broad ServiceAccount permissions.

**Sealed Secrets:** Encrypt Secrets before storing them in Git repositories — prevents accidental exposure, improves security for GitOps deployments.

### 7.12 Horizontal Pod Autoscaler (HPA)
- User demand isn't constant → too few Pods = slow/crashes; too many = wasted resources.
- **HPA** automatically scales the number of Pod replicas based on observed metrics (CPU utilization by default, or custom metrics).
- Called **"Horizontal"** because it adds **more Pods** (not bigger Pods).

| Scaling Type | Meaning |
|---|---|
| **Horizontal scaling** | Add more Pods (what HPA does) |
| **Vertical scaling** | Increase CPU/Memory of an existing Pod |

**How HPA Works:**
1. **Configuration** — define scaling rules via YAML or `kubectl autoscale`; set min/max Pod limits and target metrics (e.g., CPU 70%).
2. **Metric Collection** — via Kubernetes Metrics API / Metrics Server (or Prometheus for custom metrics).
3. **Target Metric Definition** — HPA controller checks actual vs target values regularly.
4. **HPA Controller** — part of the control plane; continuously monitors and compares metrics.
5. **Scaling Decision** — usage > target → **scale up**; usage < target → **scale down**.
6. **Pod Scaling** — HPA adjusts replicas via Deployment/ReplicaSet/StatefulSet (not instant).

**HPA Use Cases:** Resilience to demand spikes • scaling on complex/external metrics (e.g., LB traffic) • reducing utilization in quiet periods • improved overall efficiency.

---

## 8. Monitoring: Prometheus & Grafana

### 8.1 Introduction to Prometheus
**Prometheus** is an open-source **systems monitoring and alerting toolkit** built for reliability and scalability. It gathers numeric metrics from apps/infrastructure at intervals, stores them in a **time-series database**, and enables real-time querying and alerting.

### 8.2 Key Features
- **Multi-dimensional data model** — time series identified by metric name + key/value pairs (labels).
- **PromQL** — flexible query language.
- **No reliance on distributed storage** — single server nodes are autonomous.
- Metric collection via a **pull model over HTTP** (Prometheus scrapes targets).
- **Push Gateway** — intermediary for short-lived jobs that can't be scraped.
- **Service discovery** or static configuration to find targets.
- Multiple graphing/dashboarding integrations (e.g., Grafana).

### 8.3 Prometheus Architecture
Prometheus **scrapes metrics** from instrumented jobs directly, or via a **push gateway** for short-lived jobs. It stores samples locally and runs rules to (a) aggregate/record new time series, or (b) generate alerts. Grafana or other API consumers visualize the data.

### 8.4 Metrics Collection — 4 Core Metric Types

| Type | Description | Example / Note |
|---|---|---|
| **Counter** | Cumulative, **monotonically increasing** value (only ↑ or resets to 0 on restart) | Requests served, tasks completed, errors — **never use for values that can decrease** (use gauge instead) |
| **Gauge** | Single numerical value that can go **up or down** | Temperature, current memory usage, concurrent requests |
| **Histogram** | Records observations in **configurable buckets**, plus sum of values; essentially a bucketed counter | Request durations, response sizes. Two versions: **native histograms** (composite samples, dynamic buckets) vs **classic histograms** (multiple float time series) |
| **Summary** | Similar to histogram (samples request durations/sizes), gives total count + sum, and calculates **configurable quantiles** over a sliding time window | — |

### 8.5 Exporters
Standalone programs/scripts that translate third-party app/system metrics into a Prometheus-ingestible format.

| Exporter | Purpose |
|---|---|
| **Node Exporter** | Industry standard for hardware/OS metrics (CPU, memory, disk, network) on Linux/UNIX |
| **Blackbox Exporter** | Probes endpoints over HTTP/HTTPS/TCP/DNS/ICMP for availability & response time |
| **Database Exporters** | Query PostgreSQL, MySQL, Redis for throughput/locks |
| **Cloud & Middleware Exporters** | AWS CloudWatch, GCP, Kafka, RabbitMQ, container runtimes |

### 8.6 PromQL — Querying Prometheus

**1. Basic Data Types**
| Type | Meaning |
|---|---|
| **Instant Vector** | Time series with a single sample at one timestamp (e.g., current CPU usage) — graphable |
| **Range Vector** | Time series with samples over a time window (e.g., CPU usage over last 5m) |
| **Scalar** | A single numeric floating-point value |

**2. Basic Filtering (label matching with `{}`)**
```promql
http_requests_total{job="api-server", status="200"}      # exact match
http_requests_total{job=~"api-.*"}                        # regex match (=~ / !~)
http_requests_total{status!="200"}                        # negative match
```

**3. Range Vectors & Rates** (apply a `[duration]` + wrap in a rate function)
| Function | Purpose |
|---|---|
| `rate()` | Per-second average rate of increase over the range, e.g. `rate(http_requests_total{status="200"}[5m])` |
| `irate()` | Instantaneous rate from the last two data points — good for detecting sudden spikes |
| `increase()` | Total increase over the specified range |

**4. Aggregations** — grouped `by` labels:
```promql
sum(rate(http_requests_total[5m])) by (job)
avg(node_memory_Active_bytes) by (instance)
```
Other operators: `max`, `min`, `count`, `stddev`, `topk`.

**5. Modifiers**
```promql
http_requests_total offset 1h              # value exactly 1 hour ago
rate(http_requests_total[5m])[30m:1m]       # subquery: 5m rate over last 30m, evaluated every 1m
```

### 8.7 Grafana Overview
**Grafana** is an open-source **data visualization and analytics** web application — query, visualize, and set alerts on metrics/logs from many sources; turns raw data into customizable real-time dashboards.

### 8.8 Grafana Key Features
- **Multi-Source Support** — Prometheus, InfluxDB, MySQL, PostgreSQL, AWS CloudWatch, etc.
- **Customizable Visualizations** — panels, graphs, heatmaps, single stats — "like a car's dashboard."
- **Real-Time Alerting** — notifications via Slack, PagerDuty, Webhooks when thresholds are crossed.
- **The LGTM Stack** — Grafana Labs' observability stack: **L**oki (logs), **G**rafana (visuals), **T**empo (traces), **M**imir (metrics).

### 8.9 Dashboard Creation — Step by Step
1. Log in → click **Dashboards** in the sidebar.
2. Click **New** → **New dashboard**.
3. Click **Add visualization**.
4. Choose a **Data source** (e.g., Prometheus).
5. Write a **Query** (e.g., PromQL) → click Refresh to preview.
6. Customize the panel — title, axes, units, thresholds.
7. Click **Apply**, then **Save** the dashboard.

### 8.10 Core Visualization Panels

| Panel | Best For |
|---|---|
| **Time Series** | Default/most versatile — trends over time (lines/points/bars) |
| **Geomaps** | Geospatial data via lat/long, geohash, or country/state codes |
| **Heatmaps** | Magnitude/density of a value distribution over time |
| **Status History / State Timeline** | State changes over time — uptime monitoring |
| **Singlestat / Gauge / Bar Gauge** | Quick view of one critical metric vs thresholds |
| **Logs Panel** | Chronological logs from Loki/Elasticsearch/CloudWatch |
| **Bar Charts & Histograms** | Categorical data / value distribution |
| **Pie Charts & Candlesticks** | Proportionality (pie) / financial price movement (candlestick) |

### 8.11 Advanced Visualization Techniques
- **Data Transformations** — reshape, rename, filter, or do math on data before display.
- **Field Overrides & Thresholds** — custom colors/units/dynamic thresholds when metrics cross limits.
- **Mixed Data Sources** — combine data from different sources in one visualization.
- **Annotations** — overlay events/deployments/alerts on charts to pinpoint root causes.

### 8.12 Alert Management
Grafana Alerting monitors metrics/logs for defined conditions, eliminating manual monitoring and providing a first line of defense against outages. Alerts can combine multiple data sources and be managed from a single consolidated view.

---

## 9. Cloud Computing (AWS / GCP / Azure)

### 9.1 What is Cloud Computing?
The **on-demand delivery of computing services** (servers, storage, databases, networking, software) over the internet, on a **pay-as-you-go** basis — eliminating upfront hardware costs.

**5 Essential Characteristics:** On-demand self-service, broad network access, resource pooling, rapid elasticity, measured/usage-based service.

**3 Service Models:**
| Model | Description | Example |
|---|---|---|
| **IaaS** | Renting raw compute/storage/networking | AWS EC2, Google Compute Engine |
| **PaaS** | Development/deployment platform | Heroku, Google App Engine |
| **SaaS** | Fully managed applications | Microsoft 365, Google Workspace |

**4 Deployment Models:** Public (third-party), Private (exclusive use), Hybrid (mixed), Multi-cloud (multiple providers).

### 9.2 AWS Free Tier
- Up to **$200 in credits** ($100 immediately + $100 upon completing tutorials) + **30+ "Always Free" services** for up to 6 months.

**Core Offerings:**
| Category | Details |
|---|---|
| Free Plan / Credits | 6-month plan, up to $200 credits |
| Always Free | 30+ services with limits that never expire (e.g., 750 hrs EC2 t2.micro, 5GB S3, 1M Lambda requests/mo) |
| 12-Months Free | Certain DBs/ML tools free for first year |

**Credit-Earning Tutorials:** Launch an EC2 instance • Set up a Cost Budget • Create a Lambda web app • Explore Amazon Bedrock playground • Spin up an RDS database.

### 9.3 GCP Free Tier
Two programs:
- **90-Day Free Trial** — **$300 credit**, applies to all GCP services (even beyond Always Free limits); requires a billing account for verification; **not auto-charged** when trial ends.
- **Always Free Tier** — limited monthly usage of 20+ core products, indefinitely, as long as within limits.

### 9.4 Cloud Services for DevOps (by Category)

| Category | AWS | Azure | GCP |
|---|---|---|---|
| **CI/CD** | CodePipeline, CodeBuild | Azure Pipelines | Cloud Build, Cloud Deploy |
| **IaC** | CloudFormation, Systems Manager | ARM / Bicep | (Terraform is multi-cloud standard) |
| **Container Orchestration** | EKS (managed K8s) | AKS | GKE (pioneered by K8s creators) |
| **Monitoring** | CloudWatch | Azure Monitor | Cloud Operations Suite (ex-Stackdriver) |

*(HashiCorp Terraform = industry-standard multi-cloud IaC tool.)*

### 9.5 Deploying Containers on the Cloud
1. **Build and Package** — write a Dockerfile, build the image locally.
2. **Push to a Registry** — Artifact Registry / Docker Hub (GCP), Amazon ECR (AWS), Azure ACR.
3. **Choose a Compute Target:**

| Target | Description | GCP | AWS | Azure |
|---|---|---|---|---|
| **Serverless Containers** (simplest) | Abstracts infra, auto-scales | Cloud Run | AWS Fargate | Azure Container Apps |
| **Container Orchestration** (large scale) | Kubernetes clusters | GKE | EKS | AKS |
| **Virtual Machines** (max control) | Manual container hosting | Compute Engine | Amazon EC2 | — |

### 9.6 Cloud Storage Services

| Type | Description | Best For | Examples |
|---|---|---|---|
| **Object Storage** | Data + metadata + unique ID, flat structure | Unstructured data (images, videos, backups) | Amazon S3, Google Cloud Storage |
| **Block Storage** | Fixed-size blocks, like a traditional HDD | High-performance apps, VMs, databases | Amazon EBS, Google Persistent Disk |
| **File Storage (NAS)** | Hierarchical folder structure | File-system-style access | Azure File Storage |

**Core Characteristics:** Scalability • Redundancy & Reliability (replicated across data centers) • Cost-Effectiveness (pay-as-you-go).

### 9.7 Virtual Machines (VMs)
Software emulations of physical computers, managed by a **hypervisor** that divides physical hardware into isolated virtual environments.

**Core Components:** **Host Machine** (physical server) • **Guest Machine** (the VM) • **Hypervisor** (virtualization software).

**Types of Cloud VMs:**
- **General-purpose** — balanced compute/memory/network.
- **Compute-optimized** — HPC, compute-intensive workloads.
- **Memory-optimized** — high memory-to-vCPU ratio (large DBs).
- **Accelerated/Specialized** — GPUs for AI/ML.
- **Confidential** — protects sensitive data in-memory during processing.

**Key Benefits:** Cost efficiency (workload consolidation) • Scalability (dynamic resource adjustment) • Isolation & Security (VM issues don't affect others).

### 9.8 Cloud Monitoring
Automated observation of cloud infrastructure health, security, and performance (CPU, response times, latency) to ensure uptime and optimize cost.

**3 Pillars of Cloud Telemetry:** Metrics (quantitative real-time data) • Logs (timestamped event records) • Traces (map of a request across microservices).

**Common Monitoring Types:**
- **APM (Application Performance Monitoring)** — availability, execution speed, UX.
- **Network & Infrastructure Monitoring** — VMs, load balancers, storage health.
- **Security & Compliance Monitoring** — vulnerabilities, unauthorized access, compliance violations.

### 9.9 Cloud Security Basics

**1. The Shared Responsibility Model**
| Responsibility | Owner |
|---|---|
| **Security OF the Cloud** — physical infra, hardware, data centers, hypervisors | Cloud Service Provider (AWS/Azure/GCP) |
| **Security IN the Cloud** — access controls, OS hardening, data encryption, application workloads | Customer |

**2. Core Security Pillars**
- **IAM** — authentication/authorization, MFA, principle of least privilege.
- **Data Encryption** — at rest (disks/buckets) and in transit (network).
- **Network Security** — firewalls, WAF, network segmentation.
- **Compliance & Governance** — GDPR, HIPAA, PCI-DSS.
- **Incident Response & Recovery** — isolate compromised assets, minimize damage, backup/restore.

**3. Classification of Security Controls**

| Control Type | Purpose | Example |
|---|---|---|
| **Preventive** | Stop threats before they occur | Firewalls, IAM roles |
| **Detective** | Alert on abnormal behavior | Threat hunting, log analysis |
| **Corrective** | Fix vulnerabilities, recover after breach | Patch management, incident recovery |
| **Deterrent** | Discourage malicious acts | Warning banners, legal policies |

### 9.10 End-to-End DevOps Deployment (6 Stages, Cloud Context)

| # | Stage | Goal | Tools |
|---|---|---|---|
| 1 | Source Control Management | Track code changes, enable collaboration | GitHub, GitLab, Bitbucket |
| 2 | Infrastructure as Code | Define/provision cloud resources reproducibly | Terraform, CloudFormation, Ansible |
| 3 | Continuous Integration | Merge/build/test automatically | Jenkins, GitHub Actions, CircleCI |
| 4 | Containerization & Orchestration | Package app for consistent execution | Docker, Kubernetes, Amazon ECS |
| 5 | Continuous Deployment | Push safely to staging/production (GitOps) | ArgoCD, Spinnaker, AWS CodePipeline |
| 6 | Continuous Monitoring & Observability | Track performance, catch errors, ensure availability | Prometheus, Grafana, Datadog |

---

## 10. OWASP Top 10 — Application Security

### 10.0 What is OWASP?
**OWASP (Open Worldwide/Web Application Security Project)** is an international, open-source, not-for-profit foundation. **Mission:** make software security visible so individuals/orgs can make informed decisions about software risk.

**Why OWASP matters in Adaptive/Agile Software Engineering:**
- **Security by Design** — security must adapt continuously alongside rapid sprints, not be an afterthought.
- **Shift-Left Approach** — empowers developers to detect/fix flaws **early** in the pipeline (**DevSecOps**), rather than testing security only at the end.

---

### PART I — OWASP Top 10 Risks (Set 1)

### 10.1 Broken Access Control
- **Overview:** Users can act outside their intended permissions. **Most critical risk** in the OWASP Top 10. Leads to unauthorized data/function access.
- **Causes:** Missing authorization checks • Improper role management • URL manipulation • Privilege escalation vulnerabilities.
- **Example:** User A visits `.../account?id=101`, changes URL to `?id=102` → gains access to User B's account. **Impact:** data theft, privacy violations.
- **Prevention:** Enforce **server-side authorization** • Implement **RBAC** • Apply **least privilege principle** • Log & monitor access attempts.

### 10.2 Cryptographic Failures
- **Overview:** (Formerly "Sensitive Data Exposure") — failure to protect sensitive info; weak encryption or improper implementation.
- **Causes:** Weak encryption algorithms • Hard-coded keys • Insecure password storage • Lack of HTTPS.
- **Example:** Password `admin123` stored in **plaintext** as `admin123` instead of hashed. **Consequences:** credential theft, identity compromise.
- **Prevention:** Use **strong encryption (AES-256)** • Implement **TLS 1.3** • Store passwords with **bcrypt/Argon2** • Encrypt data **at rest and in transit**.

### 10.3 Injection
- **Overview:** Untrusted input interpreted as commands. Common types: **SQL Injection, Command Injection, LDAP Injection**.
- **SQL Injection example:**
```sql
SELECT * FROM users WHERE username='admin' AND password='1234';
```
Attacker input: `' OR '1'='1` → **authentication bypass**.
- **Attack Lifecycle:** Malicious input entered → app fails to validate → database executes malicious query → data compromised.
- **Prevention:** **Parameterized queries** • **Prepared statements** • **Input validation** • Stored procedures • **Web Application Firewall (WAF)**.

### 10.4 Insecure Design
- **Overview:** Security weaknesses introduced during the **design phase** — cannot be fixed only by coding practices. Caused by lack of **threat modeling**.
- **Causes:** Missing security requirements • Poor architecture decisions • No abuse-case analysis • Lack of secure development lifecycle.
- **Example:** Online banking system with **no limit on password reset attempts** → attackers repeatedly guess OTPs → account takeover, financial loss.
- **Prevention:** **Threat modeling** • **Secure SDLC** • Security-by-design principles • Risk assessment during planning.

### 10.5 Security Misconfiguration
- **Overview:** Incorrectly configured security settings — one of the **most common** vulnerabilities.
- **Example:** Default server credentials `admin`/`admin` → attacker gains administrative access, system compromise.

### 10.6 Part I Conclusion
- OWASP Top 10 highlights major web security risks.
- **Secure coding alone is not sufficient.**
- Security must be integrated **throughout the SDLC**.
- Regular testing and monitoring are essential; **awareness and training** reduce vulnerabilities.

---

### PART II — OWASP Top 10 (Advanced Risks)

### 10.7 Vulnerable and Outdated Components
- Applications depend on open-source libraries, frameworks, plugins, APIs, containers.
- **Why components become vulnerable:** old unpatched versions • ignored security updates • unknown dependencies • unsupported software.
- **Dependency chain:** Web App → Framework → Libraries → Third-Party Packages — a vulnerability at *any* layer compromises the system.
- **Real-world example: Log4Shell (2021)** — affected millions of Java apps → remote code execution, data theft, server takeover.
- **Attack Lifecycle:** identify vulnerable component → search public exploit DB → launch exploit → gain unauthorized access → escalate privileges.
- **Prevention:** software inventory management • automated vulnerability scanning • timely patch management • secure dependency updates.

### 10.8 Authentication Failures
- Authentication verifies **who** the user is and **whether access should be granted**; failure = identity compromise.
- **Common weaknesses:** weak passwords • password reuse • missing MFA • session fixation • credential stuffing.
- **Password Attack Types:** Brute Force • Dictionary Attack • Credential Stuffing • Password Spraying.
- **Example:** password `Password123` cracked by automated tools → data leakage, financial fraud.
- **Session Management Vulnerabilities:** session IDs exposed in URLs • predictable session tokens • sessions not invalidated after logout.
- **MFA (Multi-Factor Authentication) — 3 factors:**
  1. Something you **know** (password)
  2. Something you **have** (device/token)
  3. Something you **are** (biometrics)
- **Best Practices:** strong password policies • MFA implementation • CAPTCHA • account lockout controls.

### 10.9 Software & Data Integrity Failures
- Integrity ensures software is **authentic** and data has **not been altered**.
- **Causes:** untrusted plugins • insecure CI/CD pipelines • unsigned updates • unsafe deserialization.
- **Software Supply Chain Attack flow:** Developer → Package Repository → Compromised Package → Application Deployment → malicious code enters production.
- **Real-world example: SolarWinds Attack** — affected government agencies, thousands of organizations.
- **Insecure Deserialization:** Serialized Object → modified by attacker → app executes malicious payload → **remote code execution, privilege escalation**.
- **Prevention:** code signing • dependency verification • secure CI/CD pipelines • integrity monitoring.

### 10.10 Security Logging & Monitoring Failures
- Logs needed for: **Detection, Investigation, Compliance, Incident response**.
- **What should be logged:** login attempts • access control failures • database changes • admin actions • system errors.
- **Consequences of poor logging:** delayed detection, longer attacker dwell time, difficult forensics.
- **Example:** 1000+ failed logins, zero logs recorded → account compromise goes unnoticed.

### 10.11 Server-Side Request Forgery (SSRF)
- Occurs when an attacker tricks a server into making **unintended requests**.
- **Attack Flow:** Attacker → Malicious URL → Web Server → Internal Network Resource.

### 10.12 Comprehensive Prevention Techniques
- **Secure Development Lifecycle (SDLC):** Requirements → Design → Coding → Testing → Deployment → Monitoring — security integrated at **every** stage.
- **Security Testing Techniques:** **SAST** (Static AST), **DAST** (Dynamic AST), Penetration Testing, Vulnerability Assessment, Threat Modeling.

### 10.13 Quick Reference — OWASP Risks Covered

| # | Risk | One-line Summary |
|---|---|---|
| 1 | Broken Access Control | Users act beyond intended permissions |
| 2 | Cryptographic Failures | Weak/missing encryption exposes sensitive data |
| 3 | Injection | Untrusted input executed as commands (e.g., SQLi) |
| 4 | Insecure Design | Security flaws baked in at the design stage |
| 5 | Security Misconfiguration | Incorrect/default security settings |
| 6 | Vulnerable & Outdated Components | Unpatched dependencies introduce risk |
| 7 | Authentication Failures | Weak auth mechanisms → identity compromise |
| 8 | Software & Data Integrity Failures | Unverified code/data — supply chain attacks |
| 9 | Security Logging & Monitoring Failures | Attacks go undetected due to poor logging |
| 10 | SSRF | Server tricked into unintended internal requests |

---

## 11. DevOps Advanced Practices

### 11.1 Infrastructure as Code (IaC)
IaC treats servers, networks, and cloud resources like **application code** — written in files, version-controlled in Git, reviewed in PRs, deployed via pipelines.

| ❌ Before IaC | ✅ After IaC |
|---|---|
| Manual server configuration via SSH | Declarative config in Git repos |
| Undocumented "snowflake" servers | Identical, reproducible environments |
| Impossible to reproduce environments | Full change history with blame/diff |
| Config drift between dev/staging/prod | Instant environment provisioning |
| Hours or days to provision new infra | Peer-reviewed infrastructure changes |

**Terraform Example (`main.tf`):**
```hcl
provider "aws" {
  region = "us-east-1"
}
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  tags = {
    Name = "DevOps-WebServer"
    Env  = "production"
  }
}
```
**Terraform Commands:**
```bash
terraform init      # initialize working directory
terraform plan       # preview changes
terraform apply      # apply changes to cloud
terraform destroy    # tear down resources
```

**IaC Tools Landscape:**

| Tool | Vendor | Type | Cloud Support | Language | Key Strength |
|---|---|---|---|---|---|
| **Terraform** | HashiCorp | Declarative | Multi-cloud | HCL | Cloud-agnostic, huge provider ecosystem |
| **AWS CloudFormation** | Amazon | Declarative | AWS only | YAML/JSON | Native AWS integration, free |
| **Pulumi** | Pulumi Corp | Declarative | Multi-cloud | Python/TS/Go | Real programming languages, strong typing |
| **Ansible** | Red Hat | Procedural | Any | YAML/Jinja2 | Agentless, excellent for config management |

### 11.2 GitOps — Git as the Single Source of Truth
GitOps uses Git repos as the authoritative source for **both application code AND infrastructure config**. Every change flows through a PR, automatically applied by a **GitOps operator**.

**Flow:** Developer commits code → Pull Request opened → CI pipeline runs tests → PR approved & merged → GitOps operator detects drift → auto-syncs to cluster.

| Tool | Description |
|---|---|
| **ArgoCD** | Declarative GitOps CD for Kubernetes; visualizes live vs desired Git state; real-time sync UI |
| **Flux CD** | CNCF graduated GitOps project; multi-tenancy, image automation, works with Kustomize/Helm |

### 11.3 DevSecOps — Security at Every Stage
Traditional security review at the **end** of development is too late. DevSecOps integrates security tools/processes/culture **throughout the SDLC** — security becomes everyone's responsibility.

| Stage | Security Practice | Tools |
|---|---|---|
| Plan | Threat modeling, security requirements | OWASP, STRIDE |
| Code | Secure coding, peer review | SonarQube, Semgrep |
| Build | Dependency scanning, SAST | Snyk, Trivy, Checkmarx |
| Test | DAST, penetration testing | OWASP ZAP, Burp Suite |
| Deploy | Image signing, secrets management | Cosign, HashiCorp Vault |
| Monitor | Runtime security, anomaly detection | Falco, AWS GuardDuty |

### 11.4 Cloud Platforms' Native DevOps Toolchains

| Category | AWS | Azure | GCP |
|---|---|---|---|
| CI/CD | CodePipeline | Azure DevOps | Cloud Build |
| Managed Kubernetes | EKS | AKS | GKE |
| Monitoring | CloudWatch | Azure Monitor | Cloud Ops |
| IaC | CloudFormation | Bicep/ARM | Deployment Manager |

---

## 12. Case Study: FinTech Corp DevOps Transformation

A mid-size fintech company (**800 engineers, 12M users**) — an **18-month** DevOps transformation.

### 12.1 Starting Challenges
- Quarterly releases with **72-hour deployment windows**.
- Dev and Ops teams in separate buildings with different goals.
- **40%** of deployments required manual hotfixes post-release.
- MTTR: **6+ hours**.
- No automated testing — QA manually tested for **3 weeks**.

### 12.2 Transformation Phases

| Phase | Timeframe | Theme | Key Actions |
|---|---|---|---|
| **Phase 1** | Months 1–4 | Foundation | Unified Dev+Ops into 6 cross-functional squads; adopted Git flow & mandatory code reviews; set up Jenkins CI with automated unit tests; established Slack-based incident channels |
| **Phase 2** | Months 5–10 | Automation | Migrated to Kubernetes on AWS EKS; implemented Terraform for all AWS infra; built complete CD pipeline with staging gates; introduced Ansible for config management |
| **Phase 3** | Months 11–18 | Excellence | Full GitOps with ArgoCD for all services; implemented full observability (Prometheus/Grafana); shifted security left with DevSecOps practices; started publishing DORA metrics monthly |

### 12.3 Transformation Results (Before → After)

| Metric | Before | After |
|---|---|---|
| Deployment Frequency | Quarterly | Daily (50x/day) |
| Deployment Duration | 72 hours | 45 minutes |
| Change Failure Rate | 40% | 4% |
| Mean Time to Recovery | 6+ hours | 12 minutes |

**Business Impact:** 30% reduction in infrastructure costs • 60% fewer production incidents • 2x faster feature delivery to market.

### 12.4 Lessons Learned
1. **Culture Before Tools** — technology is only 20% of the challenge; invest in training and psychological safety first.
2. **Start Small, Then Scale** — pilot one team/app, build success, then evangelize. Big-bang transformations fail.
3. **Measure Everything Early** — establish baseline DORA metrics on day 1.
4. **Get Executive Buy-In** — senior sponsorship is essential to sustain culture change under pressure.
5. **Automate the Boring Stuff** — automate the 5 most painful manual processes first for quick wins.
6. **Security Can't Be Bolted On** — retrofitting security is 5x harder than building it in from the start; adopt DevSecOps from sprint one.

---

## 13. Glossary — Key Terms at a Glance

| Term | Definition |
|---|---|
| **DevOps** | Culture/practice uniting Dev and Ops for faster, reliable software delivery |
| **CALMS** | Culture, Automation, Lean, Measurement, Sharing — the 5 pillars of DevOps |
| **CI (Continuous Integration)** | Frequent merging of code with automated testing |
| **CD (Continuous Delivery)** | Auto-prepared releases; human approves production push |
| **CD (Continuous Deployment)** | Every passing change auto-deployed to production |
| **IaC** | Managing infrastructure through version-controlled code |
| **Containerization** | Packaging an app + dependencies into a portable unit (Docker) |
| **Orchestration** | Managing many containers/clusters at scale (Kubernetes) |
| **Pipeline** | Automated sequence from commit to production |
| **Rollback** | Auto-reverting to the last working version on failure |
| **DORA Metrics** | Deployment frequency, lead time, change failure rate, MTTR |
| **SLI / SLO / SLA** | Indicator / Objective / Agreement for service reliability |
| **Error Budget** | Allowed downtime derived from the SLO |
| **GitOps** | Git as the single source of truth for code AND infrastructure |
| **DevSecOps** | Security integrated throughout the SDLC, not bolted on at the end |
| **Shift Left** | Moving testing/security earlier in the development process |
| **Blameless Post-Mortem** | Incident review focused on systemic causes, not individual blame |
| **Blast Radius** | The scope of impact of a failure/change |
| **Docker Image** | Read-only template used to create containers |
| **Docker Container** | A running instance of a Docker image |
| **Dockerfile** | Text file with instructions to build a Docker image |
| **Docker Volume** | Persistent storage decoupled from container lifecycle |
| **Kubernetes (K8s)** | Open-source container orchestration platform |
| **Pod** | Smallest deployable unit in Kubernetes |
| **Deployment (K8s)** | Manages ReplicaSets/Pods declaratively with rolling updates |
| **Service (K8s)** | Stable IP/DNS name for a set of Pods |
| **ReplicaSet** | Ensures a specified number of Pod replicas are running |
| **ConfigMap** | Stores non-sensitive config data as key-value pairs |
| **Secret (K8s)** | Securely stores sensitive data (Base64-encoded, RBAC-protected) |
| **HPA** | Horizontal Pod Autoscaler — auto-scales Pod count based on metrics |
| **Prometheus** | Open-source metrics monitoring & alerting toolkit (pull-based, time-series) |
| **PromQL** | Prometheus's query language |
| **Grafana** | Open-source visualization tool for metrics/logs (dashboards) |
| **Exporter** | Translates third-party metrics into Prometheus format |
| **OWASP** | Open Worldwide Application Security Project — web app security standard body |
| **SAST / DAST** | Static / Dynamic Application Security Testing |
| **RBAC** | Role-Based Access Control |
| **MFA** | Multi-Factor Authentication |
| **SSRF** | Server-Side Request Forgery |
| **IaaS / PaaS / SaaS** | Infrastructure / Platform / Software as a Service |
| **Hypervisor** | Software that creates and manages Virtual Machines |
| **Object/Block/File Storage** | Cloud storage types (flat/unstructured, block-level, hierarchical) |
| **Shared Responsibility Model** | Cloud security split between provider (of the cloud) and customer (in the cloud) |

---

## 14. Self-Assessment / Exam Question Bank

### From DevOps Fundamentals
- Define DevOps and explain its importance in modern software development.
- List the challenges of Development and Operations teams.
- Discuss the benefits and challenges of adopting DevOps in an organization.
- List the major DevOps tools used at different stages of the SDLC.

### From CI/CD
- Define CI/CD pipeline stages.
- Describe the benefits of CI/CD.
- Differentiate between Continuous Delivery and Continuous Deployment.
- Summarize industry examples of CI/CD in practice.

### From Docker / Containerization
- What is containerization and why is it important?
- Differentiate between virtual machines and containers.
- Explain the architecture of Docker.
- What are Docker images and how are they used?
- What is a Docker container?
- Explain the purpose of a Dockerfile.
- What is Docker Hub and why is it used?
- Explain Bridge and Host networking modes.
- What is an Overlay network and where is it used?
- Why are Docker volumes important in containerized applications?

### From Kubernetes
- What is Kubernetes and why is it used?
- What is container orchestration?
- Explain the architecture of a Kubernetes cluster.
- What is the role of the API Server?
- What is a Pod in Kubernetes?
- Differentiate between Pods and Deployments.
- What is a Kubernetes Service?
- Explain the purpose of ReplicaSets.
- What is a ConfigMap and why is it used?
- Differentiate between ConfigMaps and Secrets.
- What is Horizontal Pod Autoscaling (HPA)?
- How does Kubernetes provide self-healing?

### From OWASP Security (Parts I & II)
- Why are outdated components dangerous?
- How does MFA reduce authentication risks?
- What is a software supply chain attack?
- Why is logging important in incident response?
- How can SSRF compromise cloud environments?
- Explain Broken Access Control with an example.
- What is the difference between SAST and DAST?

### From Prometheus & Grafana / Cloud
- What are the four core Prometheus metric types? Give an example of each.
- Explain the difference between an Instant Vector and a Range Vector in PromQL.
- What is the Shared Responsibility Model in cloud security?
- Differentiate Object, Block, and File storage.
- What are the three pillars of observability?

---

*End of study notes — organized for quick revision and deep understanding. Good luck with your exams! 🎓*
