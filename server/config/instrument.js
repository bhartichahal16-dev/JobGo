import * as Sentry from "@sentry/node";

const integrations = [Sentry.mongooseIntegration()];

if (process.env.VERCEL !== "1") {
    try {
        const { nodeProfilingIntegration } = await import("@sentry/profiling-node");
        integrations.push(nodeProfilingIntegration());
    } catch (error) {
        console.warn("Sentry profiling disabled:", error.message);
    }
}

Sentry.init({
    dsn: "https://29883ffa5491a136159cfa3b9884e20c@o4511383072276480.ingest.us.sentry.io/4511383078567936",
    integrations,
});
