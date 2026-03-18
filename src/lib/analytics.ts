import * as amplitude from "@amplitude/analytics-browser";

export function initAmplitude() {
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  if (!apiKey) return;
  amplitude.init(apiKey, {
    defaultTracking: {
      pageViews: true,
      sessions: true,
      formInteractions: false,
      fileDownloads: false,
    },
  });
}

export function identifyUser(userId: string, properties?: Record<string, string | number | boolean>) {
  amplitude.setUserId(userId);
  if (properties) {
    const identifyObj = new amplitude.Identify();
    Object.entries(properties).forEach(([key, value]) => {
      identifyObj.set(key, value);
    });
    amplitude.identify(identifyObj);
  }
}

export function trackEvent(eventName: string, properties?: Record<string, string | number | boolean | null>) {
  amplitude.track(eventName, properties ?? {});
}

// Typed event helpers
export const analytics = {
  signedUp: (properties?: { has_invitation: boolean }) =>
    trackEvent("Signed Up", properties),

  loggedIn: () =>
    trackEvent("Logged In"),

  jobCreated: (properties: { job_title: string; location?: string }) =>
    trackEvent("Job Created", properties),

  aiJobDescriptionGenerated: (properties: { job_title: string }) =>
    trackEvent("AI Job Description Generated", properties),

  candidateCreated: (properties: { job_id?: string }) =>
    trackEvent("Candidate Created", properties),

  teamMemberInvited: (properties: { role: string }) =>
    trackEvent("Team Member Invited", properties),

  pipelineStageChanged: (properties: { from_stage: string; to_stage: string }) =>
    trackEvent("Pipeline Stage Changed", properties),

  upgradeCTAClicked: (properties?: { source: string }) =>
    trackEvent("Upgrade CTA Clicked", properties),
};
