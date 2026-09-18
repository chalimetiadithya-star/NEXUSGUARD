# AccessLens — Secure Enterprise Research Agent

## 1. Team Details

**Team Name / ID:** NexusGuard

**Team Lead:** CH.ADITHYA PRAJWAL

**Team Members:**

<!--
One line per person, including the team lead. Role is optional.
Pick one, combine two, write your own, or leave it blank:
  Agent Whisperer (agents, prompts, LLMs)
  Backend Developer
  Frontend Developer
  UI/UX Designer
  Integrations Engineer (APIs, tools, connecting services)
  Data Engineer (data, databases, retrieval)
  Product & Pitch Lead (idea, presentation, demo)
  Cool Team Member (a bit of everything)
-->


- M.VARSHITH
- N.AKHIL
- S.KALYAN RAM
- P.DEEKSHITH

**Repo Link (Optional):** https://github.com/chalimetiadithya-star/NEXUSGUARD.git

**Demo Link (Optional):** https://nexusguard-21ncwq0nl-chalimetiadithya-2113s-projects.vercel.app

---

## 2. Problem Statement

<!-- Paste the full problem statement exactly as it was given to you. Don't shorten, fix, or reword anything. No character limit here. -->

Build a secure enterprise research agent that answers employee questions over internal documents while enforcing authorization. Documents have classifications and access rules. Relevant information that the requesting employee is not authorized to access must never be provided to the language model or revealed in the final answer.

---

## 3. TL;DR

<!-- One line each. A judge should get your idea in 10 seconds. -->

**Problem:** Employees need AI search over internal documents without exposing data they are not authorized to access.

**Solution:** An agent researches only authorized evidence, resolves versions/conflicts, and returns cited, auditable answers.

**Who benefits:** Employees get useful answers; security teams get enforceable access control and an audit trail.

---

## 4. Scope of the Project

**What are you building?**

A secure enterprise research assistant inside a fictional company intranet. It authenticates employees, retrieves relevant internal documents, blocks unauthorized evidence before LLM context, resolves authorized versions/conflicts, returns cited answers, and records an auditable authorization trace.

**How does it solve the problem statement?**

It separates relevance from permission: retrieval can find candidate documents, but a deterministic policy engine filters them before any content reaches the LLM. Only authorized evidence can influence the answer, citations, version selection, and final response.

**Key features you're building for this hackathon:**

<!-- Up to 5 features. -->

- Permission-aware research over internal documents using authenticated employee context.
- Pre-LLM authorization gate for classification, department, role, and document access rules.
- Version and conflict resolver that selects current authorized evidence or reports conflicts.
- Cited answers plus a security inspector showing allow/deny decisions and evidence used.
- Audit trail for every query, candidate, authorization decision, citation, and response.

**What are you deliberately NOT doing? (Optional)**

No multi-company SaaS, enterprise SSO, public web crawler, autonomous permission granting, custom-model training, or multi-agent swarm. The hackathon focuses on proving the secure research boundary.

---

## 5. Why an Agentic Approach?

<!-- This is an Agentic AI hackathon, so this is one of the most important answers in the file. Be specific. "It uses an LLM" is not an answer. -->

**What does your agent decide or do on its own?**

<!-- e.g. plans its steps, picks which tool to call, handles unexpected input, retries when something fails, hands work to another agent. -->

The Research Orchestrator interprets the question, decides what evidence to retrieve, requests secure tools, checks whether enough authorized evidence exists, handles version/conflict states, and chooses whether to answer, report conflict, or return insufficient accessible evidence.

**Why wouldn't a fixed script, if-else rules, or a simple chatbot be enough?**

Rules are ideal for authorization, but fixed scripts cannot reliably interpret varied research questions, combine multiple sources, or synthesize grounded answers. A simple chatbot is unsafe because it may see restricted text. We combine agentic reasoning with deterministic security controls.

---

## 6. Who It's For & What Changes

**Who or what is this for?**

<!-- Doesn't have to be end users. It could be people, a team, a business, developers, or an internal system or process. -->

Employees who need internal knowledge, and security/compliance teams responsible for protecting sensitive company data.

**The world today, without your solution:**

<!-- What happens right now? Who struggles, and what does it cost them in time, money, effort, errors, or missed opportunities? -->

Enterprise search can retrieve highly relevant documents without guaranteeing the requester may read them. Teams either restrict AI heavily, risk oversharing, or spend time manually checking permissions, versions, and conflicting sources before trusting an answer.

**The world with your solution, fully built and scaled to production:**

<!-- Imagine your whole idea is built properly and used by everyone it's meant for. What's different? -->

Employees can ask natural-language questions across company knowledge while access rules are enforced before model context is built. Answers are faster, permission-aware, version-aware, cited, and auditable; security teams can prove what evidence was allowed, denied, and used.

**What your hackathon build actually delivers today:**

<!-- Of everything you proposed, which part have you built, and which part of the problem does that piece solve right now? A small piece that truly works is a great answer. -->

Fully working prototype: JWT authentication, seeded demo users and classified documents, deterministic PolicyEngine, BM25 retrieval, version/conflict resolution, secure context builder, citation validation, interactive Security Inspector, and compliance audit logging.

**Before vs. After**

<!--
2 to 4 rows. Pick things that change: time, cost, effort, accuracy, scale, reach, manual work, risk.
Max 80 characters per cell. Replace the example row with your own.
-->

| What Changes | Today | With Our Current Build | At Production Scale |
|--------------|-------|------------------------|---------------------|
| Permission checks | Manual or inconsistent | Deterministic before LLM | Synced with enterprise identity |
| Sensitive data exposure | Model may see too much | Denied evidence never enters context | Enforced across connected repositories |
| Version/conflict handling | User checks sources manually | Latest authorized version is selected | Automated lineage and policy rules |
| Auditability | Hard to prove what AI saw | Request and evidence trace recorded | Searchable compliance-grade audit trail |

---

## 7. Architecture & Agents

<!--
All the examples in this section describe ONE made-up project, a college helpdesk agent,
so you can see how the parts fit together. Aim for this level of detail, no more.
You don't need to list every library or every function.
-->

**How is your system put together?**

<!--
Example:
Students ask questions in a web chat. A Triage Agent sorts each message, an Answer Agent
replies using college policy documents, and anything needing a human becomes a helpdesk ticket.
-->

A protected web intranet sends each query with trusted server-side user context to a Research Orchestrator. It calls retrieval, authorization, version/conflict, secure-context, LLM, citation-validation, and audit services. Denied content is removed before model context exists.

### 7.1 Agents

<!--
One line per agent. For each one, say what its job is, which model it uses and why that model
fits the job, and what it talks to (other agents, APIs, databases, services).

Example:
- **Triage Agent:** Reads each message and decides if it's a policy question, a complaint, or needs a human. Uses Llama 3.1 8B locally, since sorting is simple and student data stays on our machine. Talks to the Answer Agent and Web Chat.
- **Answer Agent:** Answers policy questions from college documents and files a ticket when approval is needed. Uses Claude Sonnet because it handles long policy text and reasons well about exceptions. Talks to College Docs Store and Helpdesk Ticket API.
-->

- **Research Orchestrator:** Interprets the query, chooses research steps, and synthesizes authorized evidence. Uses the team's approved reasoning LLM because it must handle varied questions and multi-source synthesis. Talks only to constrained backend tools, never raw unauthorized content.

### 7.2 Services, APIs, Databases & Memory

<!--
One line for everything that isn't an agent: databases, APIs, external services, tools,
and your interface (web app, bot, CLI). Say what it is, what it does, and who uses it.
Mention if it's mocked.
-->

- **Retriever (search service):** Finds candidate document IDs/chunks plus metadata; used by the Research Orchestrator.
- **Policy Engine (backend service):** Deterministically ALLOW/DENY candidates using clearance, department, role, and access rules.
- **Version Resolver (backend service):** Selects current authorized versions and flags unresolved conflicts.
- **Secure Context Builder (backend service):** Builds the exact evidence package permitted to reach the LLM.
- **Citation Validator (backend service):** Rejects any citation outside the authorized evidence set.
- **Audit Store (database):** Saves request IDs, authorization decisions, evidence IDs, statuses, and timestamps.
- **Employee Intranet (web app):** Provides login, protected chat, authorized citations, and safe no-access responses.
- **Security Inspector (admin web view):** Shows authorization traces and audit events without exposing denied content to employees.

**How does your system remember things (memory & state)?**

<!--
Example:
Each chat keeps its last 10 messages in session memory so follow-up questions make sense.
Tickets are saved in SQLite so students can check their status later.
-->

Conversation state can store recent messages per authenticated user for follow-ups. SQLite/PostgreSQL stores users, document metadata, versions, permissions, request traces, and audit events. Denied document content is never copied into chat memory.

**Diagram Link (Optional):** N/A: architecture is documented in the project blueprint; add a hosted diagram link if required.

### 7.3 Example Walkthrough

<!--
Take ONE realistic input and show how it moves through your system: which agent picks it up,
what gets passed on, which tools or databases are used, and what comes out at the end.
Up to 8 steps. If the flow branches, use 3a / 3b.
-->

**Example input:** Finance user U301 asks: "What is the latest Q4 revenue forecast?"

1. Employee UI: Sends the question with authenticated U301 context to the backend.
2. Research Orchestrator: Interprets "latest" and requests Q4 forecast candidates from the Retriever.
3. Policy Engine: Allows Finance-accessible candidates and blocks any denied evidence before LLM use.
4. Version Resolver: Compares authorized DOC-301 v1.0 and DOC-302 v2.0 and selects DOC-302.
5. Secure Context Builder: Sends only the approved DOC-302 excerpt and citation metadata to the LLM.
6. Research Orchestrator: Generates the grounded answer using only authorized evidence.
7. Citation Validator: Confirms DOC-302 is authorized; Audit Store records the full decision trace.
8. Employee UI: Displays "125 crore" with the permitted DOC-302 citation and version details.

**Final output:** The latest authorized forecast is 125 crore, cited to DOC-302 v2.0, with an auditable authorization trace.

**Anything special about how your workflow runs? (Optional)**

<!--
An algorithm you use, how agents decide what to do next, routing logic, loops, agents working
in parallel, scoring, self-checks. Anything you want us to notice.
-->

Security-critical decisions are deterministic and default-deny. Retrieval returns candidates, never access. Authorization runs before version resolution or LLM context. Citations are validated against the authorized evidence set. Unresolved conflicts are surfaced instead of guessed.

---

## 8. Tech Stack

<!-- Write N/A for any row that doesn't apply. Models are already listed per agent in 7.1. Max 60 characters per cell. -->

| Layer | Technology |
|-------|------------|
| Frontend / Interface | React + Vite + Tailwind CSS |
| Backend | Python + FastAPI |
| Agent Framework | Custom orchestration or LangGraph |
| Database / Storage | SQLite MVP; PostgreSQL + pgvector target |
| Hosting | Docker; local or cloud demo |
| Other | JWT/session auth, FTS/vector search, audit logging |

---

## 9. What to Expect From Our Current Build

<!--
Be honest. Unfinished, faked, or hard-coded parts are completely normal at a hackathon.
Telling us means we judge what you actually built, and that works in your favour.
Max 120 characters per bullet.
-->

**Working:**
 
- End-to-end secure research pipeline with pre-LLM authorization gate and deterministic clearance hierarchy.
- Interactive Security Inspector visual graph displaying allow/deny decisions and proof of isolation.
- Version and conflict resolution strictly on authorized evidence; citation validator ensuring integrity.
- Full automated test suite (23/23 tests passing) covering Scenarios A-C, adversarial attacks, and RBAC.
- Single-deployment production build serving both frontend UI and backend API functions seamlessly.
 
**Partly working, mocked, or hard-coded:**
 
- Demo accounts (Finance, Marketing, Executive, Admin) and internal documents are pre-seeded in SQLite for the hackathon.

**Not working or not built yet:**

- Enterprise SSO, live repository connectors, multi-company support, and production-scale deployment are out of scope.

**What we'd most like to be judged on:**

The pre-LLM security boundary: the same question can produce different safe outcomes for different authenticated users, while denied content never enters model context. Judges should inspect the authorization trace, citation integrity, and adversarial prompt behavior.

---

## 10. Future Scope

<!-- 2 or 3 things you're NOT building yet but plan to. If you clear the checkpoint, you may be asked to build one of them, so keep them concrete and doable. -->

### Idea 1

**Name:** Enterprise Identity & Repository Connectors

**What it is:** Replace seeded demo accounts and files with SSO/OIDC plus connectors to SharePoint, Google Drive, Confluence, or internal repositories while preserving source permissions.

**Why it matters:** It moves the prototype from a controlled demo to real enterprise knowledge without weakening access control.

**How we'd build it:** Add identity federation, connector-specific permission sync, background ingestion, encrypted storage, and policy mapping into the existing authorization layer.

**Done when:** A real user signs in and can query connected company content while forbidden documents remain absent from model context.

### Idea 2

**Name:** Policy-as-Code & Continuous Access Testing

**What it is:** Express access rules as versioned policies and continuously test them against synthetic users, documents, and adversarial queries.

**Why it matters:** Security teams need provable, repeatable controls as roles, documents, and rules change.

**How we'd build it:** Integrate a policy engine, test fixtures, regression suites, decision explanations, and alerts for unexpected access changes.

**Done when:** A policy change automatically runs access tests and flags any query path that would newly expose restricted evidence.

### Idea 3 (Optional)

**Name:** Risk-Aware Research Sessions

**What it is:** Add context-sensitive controls for unusually broad, sensitive, or repeated research requests without granting new permissions.

**Why it matters:** Even authorized access can be risky when usage patterns become abnormal or excessive.

**How we'd build it:** Score session behavior, require step-up approval for risky patterns, and log the decision while keeping document authorization unchanged.

**Done when:** The system detects a risky query pattern, triggers the configured safeguard, and records the reason in the audit trace.

---

## 11. Additional Notes (Optional)

This draft is grounded in the provided PS14 challenge and project blueprint. "AccessLens" is a working project name suggested for the submission and can be replaced. Team names, links, chosen LLM/provider, and verified build-status bullets must be updated by the team before final submission. The core design principle is: relevant does not mean authorized; denied content is blocked before LLM context construction.
