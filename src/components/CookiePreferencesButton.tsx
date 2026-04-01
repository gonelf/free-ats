"use client";

import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    _iub?: { cs?: { api?: { openPreferences: () => void } } };
  }
}

export function CookiePreferencesButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window._iub?.cs?.api?.openPreferences()}
    >
      Manage Preferences
    </Button>
  );
}
