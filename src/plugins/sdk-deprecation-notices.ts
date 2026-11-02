import type { PluginCatalogEntry } from "../../packages/gateway-protocol/src/schema/plugins.js";
import { getPluginSdkDeprecationUsage } from "./sdk-deprecation-usage.js";

type DeprecatedSdkNotice = NonNullable<PluginCatalogEntry["compatibilityNotices"]>[number];

export function buildPluginSdkDeprecationNotices(pluginId: string): DeprecatedSdkNotice[] {
  const apis = getPluginSdkDeprecationUsage(pluginId);
  if (apis.length === 0) {
    return [];
  }
  const removalDate = apis
    .flatMap((api) => (api.removeAfter ? [api.removeAfter] : []))
    .toSorted()[0];
  const formattedDate = removalDate
    ? new Date(`${removalDate}T00:00:00Z`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : undefined;
  const today = new Date().toISOString().slice(0, 10);\n  const removalDateHasPassed = removalDate !== undefined && removalDate < today;
  return [
    {
      code: "deprecated-sdk-api",
      severity: "info",
      message: formattedDate
        ? removalDateHasPassed
          ? `Uses OpenClaw APIs whose compatibility window ended on ${formattedDate}. Migrate to the replacement APIs; the scheduled removal date has passed.`
          : `Uses OpenClaw APIs that retire on ${formattedDate}. It keeps working until then; check for a plugin update.`
        : "Uses older OpenClaw APIs. It keeps working for now; check for a plugin update.",
      ...(removalDate ? { removalDate } : {}),
      migrationGuideUrl: "https://docs.openclaw.ai/plugins/sdk-migration/how-to-migrate",
      apis: apis.toSorted((left, right) => left.displayName.localeCompare(right.displayName)),
    },
  ];
}
