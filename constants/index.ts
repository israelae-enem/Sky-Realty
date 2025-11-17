// constants.ts

export const USER_ROLES = {
  LANDLORD: 'landlord',
  AGENT: 'agent',
  TENANT: 'tenant',
} as const;

export const LEASE_STATUSES = {
  ACTIVE: 'active',
  TERMINATED: 'terminated',
  PENDING: 'pending',
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const MAINTENANCE_STATUSES = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const MAINTENANCE_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const MESSAGE_DEFAULTS = {
  IS_READ: false,
};

export const NOTIFICATION_DEFAULTS = {
  IS_READ: false,
};

export const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  basic: 5,
  pro: 10,
  premium: Infinity,
}

export const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  Premium: "Premium",
}

// SKY REALTY CONSTANTS

export const features = [
  {
    id: "0",
    icon: "/images/features/property-analytics.png",
    caption: "Smart analytics",
    title: "Insights that drive results",
    text: "Gain real-time visibility into your property portfolio. Sky Realty gives you automated reports and smart analytics to help you maximize profitability and track performance effortlessly.",
    button: {
      icon: "/images/magictouch.svg",
      title: "See analytics in action",
    },
  },
  {
    id: "1",
    icon: "/images/features/tenant-portal.png",
    caption: "Seamless management",
    title: "Everything in one place",
    text: "Manage tenants, listings, and payments in one intuitive dashboard. Simplify your workflow and focus on growth while Sky Realty handles the rest.",
    button: {
      icon: "/images/docs.svg",
      title: "Explore the dashboard",
    },
  },
  {
    id: "2",
    icon: "/images/features/security.png",
    caption: "Trusted & secure",
    title: "Peace of mind for every transaction",
    text: "With enterprise-grade encryption and verified partner integrations, Sky Realty ensures every interaction is secure, transparent, and professional.",
    button: {
      icon: "/images/shield.svg",
      title: "Learn about security",
    },
  },
];

export const details = [
  {
    id: "0",
    icon: "/images/details/listings.png",
    title: "Automated property listings",
  },
  {
    id: "1",
    icon: "/images/details/communication.png",
    title: "Smart communication hub",
  },
  {
    id: "2",
    icon: "/images/details/invoicing.png",
    title: "Built-in invoicing system",
  },
  {
    id: "3",
    icon: "/images/details/support.png",
    title: "24/7 account support",
  },
];

export const faq = [
  {
    id: "0",
    question: "How does Sky Realty help property managers?",
    answer:
      "Sky Realty streamlines every step of property management from handling maintenance request  to lease renewal — helping you save time, stay organized, and scale efficiently.",
  },
  {
    id: "1",
    question: "Is my data secure?",
    answer:
      "Absolutely. We use bank-level encryption and secure servers to protect your property, tenant, and financial data at all times.",
  },
  {
    question: "How much does it cost?",
    answer:
      "We offer flexible subscription plans: Basic (10 properties), Pro (20 properties), and Premium (unlimited properties). You can view full details on our Pricing page.",
  },
  {
    question: "Do tenants need an account?",
    answer:
      "Yes. Tenants can sign up for free to view leases, submit maintenance requests, and get rent reminders directly from the platform.",
  },
  {
    question: "How do I get started?",
    answer:
      "Simply sign up with your email, choose a plan, and add your first property. From there, you can invite tenants and upload lease documents.",
  },
  {
    id: "2",
    question: "Can agents collaborate in teams?",
    answer:
      "Yes. Our shared dashboard allows multiple agents or managers to collaborate on properties, share updates, and track performance together.",
  },
  {
    id: "3",
    question: "Does Sky Realty integrate with other tools?",
    answer:
      "Sky Realty connects with popular CRM systems, payment gateways, and marketing platforms — ensuring seamless integration with your existing workflow.",
  },
  {
    id: "4",
    question: "Do you offer customer support?",
    answer:
      "Yes — we provide 24/7 live chat and email support to assist with onboarding, troubleshooting, and best practices.",
  },
];


export const Plans = [
  {
    id: "basic",
    title: "Basic",
    monthlyPrice: 99,
    yearlyPrice: 99 * 12 * 0.83, // ~83% discount for yearly
    properties: 10,
    caption: "Starter",
    features: [
      "Manage up to 10 properties",
      "7-DAYS FREE TRIAL",
      "Full access to online dashboard",
      "Add and edit property details",
      "View tenant info and lease dates",
      "Access to document templates",
      "Manual rent tracking",
      "In-app messaging system",
      "Schedule maintenance requests",
      "Receive notifications & reminders",
      "Basic email support",
    ],
    badge: "Starter",
    icon: "/images/plan-basic.svg",
  },
  {
    id: "pro",
    title: "Pro",
    monthlyPrice: 199,
    yearlyPrice: 169 * 12 * 0.83, // ~83% discount for yearly
    properties: 20,
    caption: "Most Popular",
    features: [
      "Manage up to 20 properties",
      "7-DAYS FREE TRIAL",
      "Full access to online dashboard",
      "Add, edit, and remove properties",
      "View tenant info, lease dates & rent due",
      "Automated rent reminders",
      "Access to document templates",
      "In-app messaging system",
      "Add Team members",
      "Schedule and track maintenance requests",
      "Receive notifications & reminders",
      "Priority email & chat support",
      "Download and upload lease documents",
    ],
    badge: "Most Popular",
    icon: "/images/plan-pro.svg",
  },
  {
    id: "premium",
    title: "Premium",
    monthlyPrice: 299,
    yearlyPrice: 299 * 12 * 0.83, // ~83% discount for yearly
    properties: null, // Unlimited
    caption: "Best Value",
    features: [
      "Unlimited properties",
      "7-DAYS FREE TRIAL",
      "Full access to online dashboard",
      "Add, edit, and remove properties",
      "View tenant info, lease dates & rent due",
      "Automated rent reminders",
      "Access to document templates",
      "In-app messaging system",
      "Add Team members",
      "Schedule and track maintenance requests",
      "Receive notifications & reminders",
      "Premium email, chat & phone support",
      "Download and upload lease documents",
      "Advanced analytics & reporting",
      "Custom branding for your dashboard",
    ],
    badge: "Best Value",
    icon: "/images/plan-premium.svg",
  },
];

export const testimonials = [
  {
    id: "0",
    name: "Rita Anderson",
    role: "Real Estate Broker",
    avatarUrl: "/assets/images/realtor3.jpg",
    comment:
      "Sky Realty completely transformed how we manage listings. It’s intuitive, modern, and made our team more efficient than ever.",
  },
  {
    id: "1",
    name: "Sarah Martinez",
    role: "Property Manager",
    avatarUrl: "/assets/images/realtor.jpg",
    comment:
      "Finally, a platform that understands property management. Everything is centralized and simple to use.",
  },
  {
    id: "2",
    name: "Muzain Ras",
    role: "Leasing Agent",
    avatarUrl: "/assets/images/realtor2.jpg",
    comment:
      "Our onboarding process for tenants is seamless now. The automation tools save me hours each week.",
  },
];

export const logos = [
  {
    id: "0",
    title: "Realtor.com",
    url: "/images/logos/realtor.svg",
    width: 156,
    height: 48,
  },
  {
    id: "1",
    title: "Zillow",
    url: "/images/logos/zillow.svg",
    width: 194,
    height: 48,
  },
  {
    id: "2",
    title: "Keller Williams",
    url: "/images/logos/kw.svg",
    width: 115,
    height: 48,
  },
  {
    id: "3",
    title: "Compass",
    url: "/images/logos/compass.svg",
    width: 142,
    height: 48,
  },
];

export const StatusIcon = {
  scheduled: "/assets/icons/logo1.jpg",
  pending: "/assets/icons/logo1.jpg",
  cancelled: "/assets/icons/logo1.jpg",
};

export const socials = [
  {
    id: "0",
    title: "LinkedIn",
    icon: "/images/socials/linkedin.svg",
    url: "#",
  },
  {
    id: "1",
    title: "Instagram",
    icon: "/images/socials/instagram.svg",
    url: "#",
  },
  {
    id: "2",
    title: "Facebook",
    icon: "/images/socials/facebook.svg",
    url: "#",
  },
  {
    id: "3",
    title: "X",
    icon: "/images/socials/x.svg",
    url: "#",
  },
];