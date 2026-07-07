export const householdName = "Rivergum Household";

export const dashboardItems = {
  today: [
    { title: "Pack school forms", detail: "Assigned to Alex", status: "Due today" },
    { title: "Check pantry staples", detail: "Shopping list review", status: "Quick task" },
  ],
  overdue: [
    { title: "Book dentist appointment", detail: "Reminder from shared inbox", status: "Overdue" },
  ],
  upcoming: [
    { title: "Renew library membership", detail: "Source link saved", status: "Friday" },
    { title: "Garden service reminder", detail: "Assigned to Morgan", status: "Next week" },
  ],
};

export const inboxItems = [
  {
    title: "School excursion note",
    description: "Manual inbox item for review and follow-up.",
    status: "New",
    source: "Source link placeholder",
  },
  {
    title: "Vet appointment card",
    description: "Turn into a household reminder after confirming the date.",
    status: "Needs review",
    source: "Image reference placeholder",
  },
  {
    title: "Home service renewal notice",
    description: "Link to a renewal reminder without copying payment details.",
    status: "Linked",
    source: "Original notice reference",
  },
];

export const tasks = [
  { title: "Put bins out", due: "Tonight", assignee: "Jordan", status: "Open" },
  { title: "Prepare sports bag", due: "Tomorrow morning", assignee: "Taylor", status: "Open" },
  { title: "Confirm school pickup", due: "Today", assignee: "Alex", status: "Done" },
];

export const reminders = [
  { title: "Check smoke alarm date", due: "Saturday", assignee: "Morgan" },
  { title: "Library books due", due: "Next Tuesday", assignee: "Household" },
];

export const shoppingLists = [
  {
    name: "Groceries",
    detail: "Shared weekly list",
    items: [
      { label: "Milk", checked: false },
      { label: "Bread", checked: true },
      { label: "Lunchbox fruit", checked: false },
    ],
  },
  {
    name: "Home supplies",
    detail: "Household basics",
    items: [
      { label: "Laundry powder", checked: false },
      { label: "Kitchen cloths", checked: false },
    ],
  },
];

export const billReminders = [
  {
    title: "Council rates notice",
    provider: "Local council",
    due: "Due 18 Jul",
    status: "Upcoming",
    assignee: "Alex",
    source: "Original PDF reference",
  },
  {
    title: "Home insurance renewal",
    provider: "Insurance provider",
    due: "Renewal 28 Jul",
    status: "Needs review",
    assignee: "Morgan",
    source: "Provider portal link",
  },
  {
    title: "Car registration reminder",
    provider: "Transport service",
    due: "Due 4 Aug",
    status: "Scheduled",
    assignee: "Jordan",
    source: "Original email reference placeholder",
  },
];

export const familyMembers = [
  { name: "Alex", role: "Household admin", note: "Can manage household settings and members." },
  { name: "Morgan", role: "Household admin", note: "Can manage household settings and members." },
  { name: "Jordan", role: "Household member", note: "Can manage shared household items." },
  { name: "Taylor", role: "Household member", note: "Can manage shared household items." },
];

export const activity = [
  "Alex created a renewal reminder.",
  "Morgan checked off a shopping item.",
  "Jordan commented on a task.",
];
