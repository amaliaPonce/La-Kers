type AnalyticsPrimitive = string | number | boolean | null;
type AnalyticsValue = AnalyticsPrimitive | AnalyticsPrimitive[];
export type AnalyticsData = Record<string, AnalyticsValue | undefined>;

type UmamiPayload = Record<string, unknown>;
type UmamiTracker = {
  track: {
    (): void;
    (payload: UmamiPayload | ((props: UmamiPayload) => UmamiPayload)): void;
    (eventName: string, data?: AnalyticsData): void;
  };
};

declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}

const UMAMI_SCRIPT_ID = 'la-kers-umami';
const umamiWebsiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID?.trim();
const umamiSrc = import.meta.env.VITE_UMAMI_SRC?.trim();

export const isUmamiConfigured = Boolean(umamiWebsiteId && umamiSrc);

const getUmami = () => (typeof window !== 'undefined' ? window.umami : undefined);

export const installUmamiScript = () => {
  if (!isUmamiConfigured || typeof document === 'undefined') {
    return false;
  }

  if (document.getElementById(UMAMI_SCRIPT_ID)) {
    return true;
  }

  const script = document.createElement('script');
  script.id = UMAMI_SCRIPT_ID;
  script.defer = true;
  script.src = umamiSrc!;
  script.setAttribute('data-website-id', umamiWebsiteId!);
  script.setAttribute('data-do-not-track', 'true');
  script.setAttribute('data-exclude-search', 'true');
  script.setAttribute('data-exclude-hash', 'true');
  document.head.appendChild(script);
  return true;
};

export const track = (eventName: string, data?: AnalyticsData) => {
  if (!eventName) return;
  getUmami()?.track(eventName, data);
};

export const pageView = () => {
  getUmami()?.track();
};
