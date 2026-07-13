export const legalConfig = {
  businessName: process.env.NEXT_PUBLIC_LEGAL_BUSINESS_NAME || "AspirantOS",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "ritank@triage-ops.com",
  grievanceOfficer: process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER || "Grievance Officer (name pending)",
  businessAddress: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "Registered business address pending",
  jurisdictionCity: process.env.NEXT_PUBLIC_JURISDICTION_CITY || "the city of the registered business office",
  effectiveDate: "14 July 2026",
};

export const legalContactConfigured = ![
  legalConfig.supportEmail,
  legalConfig.grievanceOfficer,
  legalConfig.businessAddress,
].some((value) => value.includes("pending") || value.includes("your-domain.example"));
