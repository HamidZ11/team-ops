/**
 * PROTOTYPE ONLY — fictional people, company and requests for the design
 * exploration. Nothing in src/domain or src/components may import this file.
 */
import type {
  ActivityEvent,
  ActivityPayload,
  Comment,
  Member,
  Priority,
  Request,
  RequestStatus,
  RequestType,
  Workspace,
} from "@/domain/types";

/** Fixed clock so relative times and screenshots are stable. 10:30 London. */
export const PROTOTYPE_NOW = "2026-10-13T10:30:00+01:00";
export const PROTOTYPE_TODAY = "2026-10-13";

export const WORKSPACE: Workspace = { id: "ws_meridian", name: "Meridian", keyPrefix: "OPS" };

export const MEMBERS: Member[] = [
  { id: "priya", name: "Priya Nair", email: "priya@meridian.co", title: "Head of Operations", role: "admin" },
  { id: "daniel", name: "Daniel Okafor", email: "daniel@meridian.co", title: "IT & Systems", role: "member" },
  { id: "lena", name: "Lena Fischer", email: "lena@meridian.co", title: "Finance Manager", role: "member" },
  { id: "tomas", name: "Tomás Lindqvist", email: "tomas@meridian.co", title: "Facilities Lead", role: "member" },
  { id: "chloe", name: "Chloe Martin", email: "chloe@meridian.co", title: "Office Coordinator", role: "member" },
  { id: "sam", name: "Sam Whitfield", email: "sam@meridian.co", title: "Procurement", role: "member" },
  { id: "noah", name: "Noah Adeyemi", email: "noah@meridian.co", title: "Security Engineer", role: "member" },
  { id: "aiko", name: "Aiko Tanaka", email: "aiko@meridian.co", title: "People Operations", role: "member" },
  { id: "marcus", name: "Marcus Bell", email: "marcus@meridian.co", title: "Design Lead", role: "member" },
  { id: "ines", name: "Inès Moreau", email: "ines@meridian.co", title: "Sales Director", role: "member" },
  { id: "ravi", name: "Ravi Shah", email: "ravi@meridian.co", title: "Engineering Manager", role: "member" },
  { id: "hannah", name: "Hannah Cole", email: "hannah@meridian.co", title: "Marketing Lead", role: "member" },
];

/** The operations team; other members only submit requests. */
export const OPS_TEAM = ["priya", "daniel", "lena", "tomas", "chloe", "sam", "noah"];

export const REQUEST_TYPES: RequestType[] = [
  { id: "access", name: "Access & accounts", icon: "key" },
  { id: "equipment", name: "Equipment", icon: "laptop" },
  { id: "purchasing", name: "Purchasing", icon: "receipt" },
  { id: "facilities", name: "Facilities", icon: "building" },
  { id: "vendors", name: "Vendors & contracts", icon: "signature" },
  { id: "finance", name: "Finance", icon: "landmark" },
];

/** London wall-clock time `daysAgo` days before the prototype's today. BST applies throughout. */
function ago(daysAgo: number, time: string) {
  const d = new Date(`${PROTOTYPE_TODAY}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  const date = d.toISOString().slice(0, 10);
  return new Date(`${date}T${time}:00+01:00`).toISOString();
}

interface Spec {
  n: number;
  title: string;
  description: string;
  type: string;
  status: RequestStatus;
  priority: Priority;
  requester: string;
  owner?: string;
  approver?: string;
  due?: string;
  created: string;
  accepted?: string;
  acceptedBy?: string;
  started?: string;
  submitted?: string;
  completed?: string;
  declined?: { at: string; by: string; reason: string };
  blocked?: { at: string; by: string; reason: string };
  comments?: Array<{ by: string; at: string; body: string }>;
}

const SPECS: Spec[] = [
  // Triage
  {
    n: 1068,
    title: "Revoke access for departing contractor (James Pike)",
    description:
      "James's contract ends this Friday (17 Oct). Please remove access to Google Workspace, GitHub, AWS, 1Password and Linear at 18:00 that day, and arrange collection of the loaner MacBook (asset ML-0412).",
    type: "access",
    status: "triage",
    priority: "urgent",
    requester: "ravi",
    due: "2026-10-17",
    created: ago(0, "10:05"),
    comments: [
      {
        by: "ravi",
        at: ago(0, "10:12"),
        body: "He also has admin on the billing-service and infra-terraform repos. Those should go first.",
      },
    ],
  },
  {
    n: 1067,
    title: "Laptop and accessories for new hire starting 20 Oct",
    description:
      "Ana Ruiz joins Marketing on Monday 20 Oct. Standard kit please: 14\" MacBook Pro, 27\" display, keyboard, mouse and a headset. She'll be based in the London office.",
    type: "equipment",
    status: "triage",
    priority: "high",
    requester: "hannah",
    due: "2026-10-17",
    created: ago(0, "08:40"),
  },
  {
    n: 1066,
    title: "Quotes for replacing 3rd floor meeting room displays",
    description:
      "Two of the three displays in Atlas and Orchard have dead pixel lines. Could we get quotes for 65\" replacements with USB-C input? Design holds the budget.",
    type: "purchasing",
    status: "triage",
    priority: "none",
    requester: "marcus",
    created: ago(1, "16:20"),
  },
  {
    n: 1065,
    title: "Shared mailbox for partnerships@",
    description:
      "We launch the partner programme on 3 Nov and need partnerships@meridian.co routed to Inès, Jordan and Hannah, with send-as permission for all three.",
    type: "access",
    status: "triage",
    priority: "low",
    requester: "ines",
    due: "2026-10-31",
    created: ago(1, "11:02"),
  },
  {
    n: 1064,
    title: "Wi-Fi keeps dropping in Orchard and Atlas rooms",
    description:
      "Calls drop every 10–15 minutes in both rooms since the access point firmware update last week. Other rooms on the floor seem fine.",
    type: "facilities",
    status: "triage",
    priority: "medium",
    requester: "ravi",
    created: ago(1, "09:10"),
    comments: [
      {
        by: "tomas",
        at: ago(0, "09:40"),
        body: "The Bristol team said the same on Friday. Could be the firmware rollout rather than the rooms.",
      },
    ],
  },
  {
    n: 1063,
    title: "Temporary card limit increase for Web Summit trip",
    description:
      "Four of us travel to Lisbon 3–6 Nov. Hotel and flights take my card over its £5,000 monthly limit. Requesting a temporary increase to £9,000 for November.",
    type: "finance",
    status: "triage",
    priority: "none",
    requester: "ines",
    due: "2026-10-20",
    created: ago(3, "11:20"),
    comments: [
      {
        by: "lena",
        at: ago(2, "10:00"),
        body: "Happy to approve a temporary increase as long as it reverts on 30 Nov.",
      },
    ],
  },

  // To do
  {
    n: 1062,
    title: "Draft vendor onboarding checklist",
    description:
      "One checklist for new suppliers: due diligence, DPA, security review threshold, finance setup, and who signs off at each spend level.",
    type: "vendors",
    status: "todo",
    priority: "medium",
    requester: "priya",
    owner: "priya",
    due: "2026-10-24",
    created: ago(4, "15:00"),
    accepted: ago(4, "15:01"),
  },
  {
    n: 1061,
    title: "Renew Datadog contract before 1 Nov",
    description:
      "The current term ends 31 Oct and log volume is up ~30%. Negotiate a 12-month renewal; finance sign-off is needed above £40k.",
    type: "vendors",
    status: "todo",
    priority: "high",
    requester: "daniel",
    owner: "sam",
    approver: "lena",
    due: "2026-10-24",
    created: ago(4, "09:00"),
    accepted: ago(4, "10:00"),
    comments: [
      {
        by: "sam",
        at: ago(3, "11:00"),
        body: "Datadog's first offer is +18%. Pushing back with our committed-use numbers before I start formally.",
      },
    ],
  },
  {
    n: 1058,
    title: "Order 6 standing desks for the design studio",
    description:
      "Six electric sit-stand desks (160×80) for the studio refit. Marcus has a preferred model; check the framework supplier first.",
    type: "purchasing",
    status: "todo",
    priority: "medium",
    requester: "marcus",
    owner: "sam",
    approver: "priya",
    due: "2026-10-31",
    created: ago(6, "16:20"),
    accepted: ago(5, "09:10"),
  },
  {
    n: 1056,
    title: "Parking permits for Q1 2027",
    description:
      "Collect names and registrations for the 14 permit spaces and submit them to the landlord by mid-November.",
    type: "facilities",
    status: "todo",
    priority: "low",
    requester: "tomas",
    owner: "chloe",
    due: "2026-11-14",
    created: ago(6, "09:30"),
    accepted: ago(6, "11:00"),
  },
  {
    n: 1054,
    title: "Rotate shared AWS root credentials",
    description:
      "Root credentials were last rotated in March. Rotate them, move the MFA device to the security safe, and update the break-glass runbook.",
    type: "access",
    status: "todo",
    priority: "urgent",
    requester: "daniel",
    owner: "noah",
    due: "2026-10-14",
    created: ago(7, "11:00"),
    accepted: ago(7, "12:00"),
  },
  {
    n: 1052,
    title: "Insurance certificate for Acme Health site visit",
    description:
      "Acme Health need our public liability certificate before the on-site workshop on 23 Oct.",
    type: "vendors",
    status: "todo",
    priority: "low",
    requester: "ines",
    owner: "lena",
    due: "2026-10-21",
    created: ago(8, "14:00"),
    accepted: ago(8, "15:30"),
  },

  // In progress
  {
    n: 1060,
    title: "Provision Figma seats for 3 new designers",
    description:
      "Jo, Kemi and Arun start on 20 Oct. They need Professional seats in the Product team space and access to the Design System library.",
    type: "access",
    status: "in_progress",
    priority: "medium",
    requester: "marcus",
    owner: "daniel",
    approver: "lena",
    due: "2026-10-15",
    created: ago(5, "10:00"),
    accepted: ago(5, "11:30"),
    started: ago(4, "10:15"),
    comments: [
      {
        by: "daniel",
        at: ago(5, "14:20"),
        body: "Seats are £45 per editor per month on annual billing. I'll add them to the existing plan rather than open a new team.",
      },
      { by: "lena", at: ago(4, "09:05"), body: "Fine by me, it's within the design tooling budget." },
      {
        by: "daniel",
        at: ago(0, "09:50"),
        body: "Two seats provisioned. Waiting on Arun's email account before I can invite him.",
      },
    ],
  },
  {
    n: 1059,
    title: "Security questionnaire for Northwind Health deal",
    description:
      "Northwind Health sent a 212-question vendor security questionnaire. Contract signature is gated on it, and their procurement deadline is 16 Oct.",
    type: "vendors",
    status: "in_progress",
    priority: "high",
    requester: "ines",
    owner: "noah",
    approver: "priya",
    due: "2026-10-16",
    created: ago(6, "17:00"),
    accepted: ago(5, "08:45"),
    started: ago(5, "09:00"),
    blocked: {
      at: ago(1, "09:20"),
      by: "noah",
      reason: "Waiting on the updated SOC 2 Type II report from the auditor (expected 17 Oct).",
    },
    comments: [
      {
        by: "noah",
        at: ago(5, "09:30"),
        body: "About 80% comes straight from our trust pack. The rest needs the new SOC 2 report.",
      },
      {
        by: "ines",
        at: ago(0, "08:55"),
        body: "Could we send the bridge letter in the meantime? I'll ask whether they'll accept it for the deadline.",
      },
    ],
  },
  {
    n: 1057,
    title: "Book movers for Bristol office relocation",
    description:
      "The Bristol team moves to Temple Quay on 7 Nov. We need movers for 22 desks, the server cabinet and archive boxes, plus a weekend slot.",
    type: "facilities",
    status: "in_progress",
    priority: "high",
    requester: "aiko",
    owner: "tomas",
    approver: "priya",
    due: "2026-10-20",
    created: ago(6, "13:00"),
    accepted: ago(6, "14:00"),
    started: ago(4, "09:00"),
    comments: [
      {
        by: "tomas",
        at: ago(1, "16:00"),
        body: "Two quotes in: £3,850 and £4,400. The third from Bristol Removals is due tomorrow.",
      },
    ],
  },
  {
    n: 1055,
    title: "Migrate printer fleet to new lease",
    description:
      "Move the 9 office printers to the new lease agreement and return the old units. The new lessor collects on site.",
    type: "vendors",
    status: "in_progress",
    priority: "low",
    requester: "chloe",
    owner: "tomas",
    due: "2026-11-03",
    created: ago(7, "15:00"),
    accepted: ago(7, "16:00"),
    started: ago(6, "10:00"),
    blocked: {
      at: ago(5, "14:30"),
      by: "tomas",
      reason: "The lessor hasn't sent the asset transfer schedule. Chased twice.",
    },
    comments: [
      { by: "chloe", at: ago(2, "11:00"), body: "I've asked our account manager to escalate it." },
    ],
  },
  {
    n: 1053,
    title: "Enforce SSO for Notion",
    description:
      "Move Notion login to Okta SAML and remove password logins. Keep one break-glass admin outside SSO.",
    type: "access",
    status: "in_progress",
    priority: "high",
    requester: "noah",
    owner: "daniel",
    approver: "noah",
    due: "2026-10-10",
    created: ago(8, "16:00"),
    accepted: ago(8, "16:30"),
    started: ago(6, "10:00"),
    comments: [
      {
        by: "daniel",
        at: ago(1, "14:10"),
        body: "SAML is configured and tested with the IT group. I need a 30-minute window to enforce it for everyone. Proposing Thursday 07:30.",
      },
      { by: "noah", at: ago(1, "15:02"), body: "Thursday works. Keep the break-glass admin outside SSO." },
    ],
  },
  {
    n: 1051,
    title: "Quarterly software spend audit",
    description:
      "List every paid SaaS subscription, its owner, renewal date and usage. Flag anything without an owner or under 50% utilisation.",
    type: "finance",
    status: "in_progress",
    priority: "medium",
    requester: "lena",
    owner: "priya",
    approver: "lena",
    due: "2026-10-18",
    created: ago(8, "09:00"),
    accepted: ago(8, "09:30"),
    started: ago(3, "10:00"),
    comments: [
      {
        by: "priya",
        at: ago(2, "16:30"),
        body: "Pulled 41 subscriptions from Ramp. Six have no owner; chasing those this week.",
      },
    ],
  },
  {
    n: 1049,
    title: "Update travel per-diem rates in expense policy",
    description:
      "HMRC benchmark rates changed in September. Update the policy table and the Ramp category limits to match.",
    type: "finance",
    status: "in_progress",
    priority: "medium",
    requester: "aiko",
    owner: "lena",
    approver: "priya",
    due: "2026-10-22",
    created: ago(10, "10:00"),
    accepted: ago(10, "11:00"),
    started: ago(4, "09:00"),
  },
  {
    n: 1047,
    title: "Fix VPN split tunnelling for London office",
    description:
      "Video calls from the London office are routed through the VPN tunnel, adding ~120ms. Exclude Zoom and Google Meet ranges.",
    type: "access",
    status: "in_progress",
    priority: "high",
    requester: "ravi",
    owner: "daniel",
    due: "2026-10-09",
    created: ago(11, "09:20"),
    accepted: ago(11, "10:00"),
    started: ago(9, "10:00"),
    comments: [
      { by: "ravi", at: ago(2, "09:30"), body: "Still seeing Zoom routed through the tunnel from the London office." },
      {
        by: "daniel",
        at: ago(2, "10:05"),
        body: "The config change is ready; it needs a restart window for the office firewall.",
      },
    ],
  },

  // In review
  {
    n: 1050,
    title: "Approve Q4 offsite venue deposit (£8,400)",
    description:
      "30% deposit to hold Cowley Manor for the company offsite, 19–21 Nov, 38 people. Balance of £19,600 due 30 days before arrival.",
    type: "purchasing",
    status: "in_review",
    priority: "high",
    requester: "aiko",
    owner: "chloe",
    approver: "priya",
    due: "2026-10-15",
    created: ago(9, "11:00"),
    accepted: ago(9, "12:05"),
    started: ago(5, "10:00"),
    submitted: ago(1, "15:10"),
    comments: [
      {
        by: "aiko",
        at: ago(9, "11:02"),
        body: "We've shortlisted Cowley Manor for 19–21 Nov. They'll hold the dates until Thursday and need a 30% deposit to confirm.",
      },
      {
        by: "chloe",
        at: ago(5, "10:30"),
        body: "Headcount confirmed at 38. Deposit is £8,400 incl. VAT; the £19,600 balance is due 30 days before arrival. Free cancellation until 20 Oct.",
      },
      {
        by: "chloe",
        at: ago(1, "15:12"),
        body: "@Priya this sits within the Q4 offsite budget line (£32k). I need sign-off by Wednesday so we don't lose the hold.",
      },
      {
        by: "lena",
        at: ago(0, "09:14"),
        body: "Finance is fine with it. Please make sure the invoice goes to accounts@ with the PO number.",
      },
    ],
  },
  {
    n: 1048,
    title: "Switch payroll provider to Deel from January",
    description:
      "Move UK and Portugal payroll from Remote to Deel. Saves ~£11k a year and consolidates contractor payments.",
    type: "finance",
    status: "in_review",
    priority: "high",
    requester: "aiko",
    owner: "lena",
    approver: "priya",
    due: "2026-10-20",
    created: ago(11, "15:00"),
    accepted: ago(11, "16:00"),
    started: ago(9, "09:30"),
    submitted: ago(0, "09:05"),
    comments: [
      {
        by: "lena",
        at: ago(0, "09:06"),
        body: "Contract, DPA and migration plan are in the shared folder. Parallel run in December, cut-over on 1 Jan.",
      },
    ],
  },
  {
    n: 1046,
    title: "12 conference headsets for sales pods",
    description: "Noise-cancelling headsets for the new sales pods on the 2nd floor.",
    type: "purchasing",
    status: "in_review",
    priority: "medium",
    requester: "ines",
    owner: "sam",
    approver: "priya",
    due: "2026-10-23",
    created: ago(12, "14:00"),
    accepted: ago(12, "15:00"),
    started: ago(6, "10:00"),
    submitted: ago(4, "16:45"),
    comments: [
      {
        by: "sam",
        at: ago(4, "16:46"),
        body: "Jabra Evolve2 65 at £189 each from our usual reseller. £2,268 ex VAT in total.",
      },
    ],
  },
  {
    n: 1045,
    title: "Annual DPA review with Stripe",
    description: "Review Stripe's updated data processing addendum and sub-processor list.",
    type: "vendors",
    status: "in_review",
    priority: "medium",
    requester: "lena",
    owner: "sam",
    approver: "noah",
    due: "2026-10-30",
    created: ago(13, "09:00"),
    accepted: ago(13, "10:00"),
    started: ago(7, "10:00"),
    submitted: ago(1, "11:40"),
  },
  {
    n: 1044,
    title: "Weekend badge access for fit-out contractors",
    description: "Six contractors need weekend access to floors 2 and 3 during the studio fit-out.",
    type: "access",
    status: "in_review",
    priority: "high",
    requester: "tomas",
    owner: "daniel",
    approver: "noah",
    due: "2026-10-17",
    created: ago(14, "10:30"),
    accepted: ago(14, "12:00"),
    started: ago(3, "10:00"),
    submitted: ago(0, "08:15"),
    comments: [
      {
        by: "daniel",
        at: ago(0, "08:16"),
        body: "Temporary badges set to expire on 26 Oct. @Noah can you confirm the zones?",
      },
    ],
  },
  {
    n: 1043,
    title: "Q4 office budget reforecast",
    description: "Reforecast Q4 office costs after the Bristol move and studio fit-out.",
    type: "finance",
    status: "in_review",
    priority: "medium",
    requester: "lena",
    owner: "priya",
    approver: "lena",
    due: "2026-10-16",
    created: ago(15, "11:00"),
    accepted: ago(15, "11:20"),
    started: ago(6, "09:00"),
    submitted: ago(1, "18:20"),
    comments: [
      {
        by: "priya",
        at: ago(1, "18:21"),
        body: "The reforecast is £14k under the original Q4 budget, mostly from the delayed fit-out. Notes are in the sheet.",
      },
    ],
  },

  // Closed
  {
    n: 1042,
    title: "Replace 4th floor badge reader",
    description: "The reader by the east stairwell fails about one in five taps.",
    type: "facilities",
    status: "done",
    priority: "high",
    requester: "chloe",
    owner: "tomas",
    created: ago(16, "08:55"),
    accepted: ago(16, "09:30"),
    started: ago(15, "10:00"),
    completed: ago(4, "17:05"),
  },
  {
    n: 1041,
    title: "Reimburse Web Summit travel for Hannah",
    description: "Flights and two nights' hotel for Web Summit, receipts attached in Ramp.",
    type: "finance",
    status: "done",
    priority: "low",
    requester: "hannah",
    owner: "lena",
    approver: "priya",
    created: ago(17, "10:00"),
    accepted: ago(17, "11:30"),
    started: ago(15, "10:00"),
    submitted: ago(8, "14:00"),
    completed: ago(6, "09:45"),
  },
  {
    n: 1040,
    title: "Create Linear workspace for support team",
    description: "Separate Linear team for support escalations with an intake form.",
    type: "access",
    status: "done",
    priority: "medium",
    requester: "ravi",
    owner: "daniel",
    created: ago(18, "15:10"),
    accepted: ago(18, "16:00"),
    started: ago(16, "09:30"),
    completed: ago(5, "11:00"),
  },
  {
    n: 1039,
    title: "Renew office cleaning contract",
    description: "Annual renewal with Brightway; they've proposed a 4% increase.",
    type: "vendors",
    status: "done",
    priority: "medium",
    requester: "tomas",
    owner: "sam",
    approver: "priya",
    created: ago(19, "09:30"),
    accepted: ago(19, "12:00"),
    started: ago(17, "10:00"),
    submitted: ago(9, "15:00"),
    completed: ago(7, "10:20"),
  },
  {
    n: 1038,
    title: "Ergonomic assessments for the People team",
    description: "Book DSE assessments for the six people who moved desks in September.",
    type: "facilities",
    status: "done",
    priority: "low",
    requester: "aiko",
    owner: "chloe",
    created: ago(20, "11:00"),
    accepted: ago(20, "13:10"),
    started: ago(18, "09:00"),
    completed: ago(11, "16:40"),
  },
  {
    n: 1036,
    title: "Replacement MacBook chargers ×4",
    description: "Four 96W USB-C chargers for the hot-desk pool.",
    type: "equipment",
    status: "done",
    priority: "low",
    requester: "daniel",
    owner: "sam",
    created: ago(22, "14:20"),
    accepted: ago(22, "16:00"),
    started: ago(21, "10:00"),
    completed: ago(20, "15:30"),
  },
  {
    n: 1037,
    title: "Upgrade Slack to Enterprise Grid",
    description: "Enterprise Grid for data residency and better admin controls.",
    type: "access",
    status: "declined",
    priority: "none",
    requester: "ravi",
    created: ago(21, "10:05"),
    declined: {
      at: ago(20, "09:30"),
      by: "priya",
      reason: "Not in this year's budget. Added to Q1 planning alongside the SSO consolidation work.",
    },
  },
  {
    n: 1035,
    title: "Second coffee machine for the 2nd floor",
    description: "The queue at 9:30 is 10 minutes long most days.",
    type: "facilities",
    status: "declined",
    priority: "none",
    requester: "hannah",
    created: ago(23, "09:40"),
    declined: {
      at: ago(22, "11:15"),
      by: "priya",
      reason: "The lease covers one machine per floor. Raised with the landlord instead.",
    },
  },
];

function build() {
  const requests: Request[] = [];
  const events: ActivityEvent[] = [];
  const comments: Comment[] = [];
  let seq = 0;

  for (const s of SPECS) {
    const id = `req_${s.n}`;
    const push = (at: string, actorId: string, payload: ActivityPayload) =>
      events.push({ id: `evt_${++seq}`, requestId: id, actorId, at, payload });

    push(s.created, s.requester, { type: "created" });
    if (s.accepted && s.owner) {
      push(s.accepted, s.acceptedBy ?? "priya", {
        type: "accepted",
        assigneeId: s.owner,
        approverId: s.approver ?? null,
        priority: s.priority,
      });
    }
    if (s.started) push(s.started, s.owner!, { type: "status_changed", from: "todo", to: "in_progress" });
    if (s.blocked) push(s.blocked.at, s.blocked.by, { type: "blocked", reason: s.blocked.reason });
    if (s.submitted)
      push(s.submitted, s.owner!, { type: "status_changed", from: "in_progress", to: "in_review" });
    if (s.completed) {
      if (s.approver) push(s.completed, s.approver, { type: "approved", note: null });
      else push(s.completed, s.owner!, { type: "status_changed", from: "in_progress", to: "done" });
    }
    if (s.declined) push(s.declined.at, s.declined.by, { type: "declined", reason: s.declined.reason });

    for (const c of s.comments ?? []) {
      comments.push({ id: `cmt_${++seq}`, requestId: id, authorId: c.by, body: c.body, createdAt: c.at });
    }

    const times = [
      s.created,
      s.accepted,
      s.started,
      s.blocked?.at,
      s.submitted,
      s.completed,
      s.declined?.at,
      ...(s.comments ?? []).map((c) => c.at),
    ].filter((t): t is string => Boolean(t));

    requests.push({
      id,
      number: s.n,
      title: s.title,
      description: s.description,
      status: s.status,
      priority: s.priority,
      typeId: s.type,
      requesterId: s.requester,
      assigneeId: s.owner ?? null,
      approverId: s.approver ?? null,
      dueDate: s.due ?? null,
      blocked: s.blocked ? { reason: s.blocked.reason, since: s.blocked.at, byId: s.blocked.by } : null,
      createdAt: s.created,
      updatedAt: times.sort().at(-1)!,
      completedAt: s.completed ?? s.declined?.at ?? null,
    });
  }

  return { requests, events, comments, nextSeq: seq + 1 };
}

export const SEED = build();

/** Requests with activity the default user hasn't seen. Drives unread dots in Concept B. */
export const INITIAL_UNREAD = ["req_1068", "req_1064", "req_1050", "req_1059", "req_1048", "req_1060"];
