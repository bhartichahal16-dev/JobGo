import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://29883ffa5491a136159cfa3b9884e20c@o4511383072276480.ingest.us.sentry.io/4511383078567936",
  integrations: [
    nodeProfilingIntegration(),
    Sentry.mongooseIntegration()
  ],
//   tracesSampleRate: 1.0,
});

Sentry.profiler.startProfiler();