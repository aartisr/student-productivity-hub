import { useMemo, type Dispatch, type SetStateAction } from "react";
import {
  DEFAULT_VIEW_ORDER,
  MODULE_PROFILES,
  normalizeUserSettings,
  uid,
  type AppData,
  type ProfileImportAction,
  type ProfileImportPlan,
  type UserModuleProfile,
  type UserSettings,
  type ViewKey,
} from "../domain";

type UseModuleProfileManagerArgs = {
  ensureSignedIn: () => boolean;
  currentUser: string;
  settings: UserSettings;
  setStore: Dispatch<SetStateAction<AppData>>;
  setView: (value: ViewKey) => void;
  setModuleStatus: (value: string) => void;
  customProfileName: string;
  setCustomProfileName: (value: string) => void;
  customProfilesTransferText: string;
  setCustomProfilesTransferText: (value: string) => void;
  customProfilesImportMode: "replace" | "merge";
  customProfileConflictMode: "rename" | "overwrite" | "skip";
};

export function useModuleProfileManager(args: UseModuleProfileManagerArgs) {
  const {
    ensureSignedIn,
    currentUser,
    settings,
    setStore,
    setView,
    setModuleStatus,
    customProfileName,
    setCustomProfileName,
    customProfilesTransferText,
    setCustomProfilesTransferText,
    customProfilesImportMode,
    customProfileConflictMode,
  } = args;

  const updateModuleSettings = (updater: (current: UserSettings) => UserSettings) => {
    if (!ensureSignedIn()) return;
    const next = normalizeUserSettings(updater(settings), settings.displayName);
    setStore((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [currentUser]: next,
      },
    }));
  };

  const toggleModule = (module: ViewKey) => {
    const enabled = settings.enabledViews.includes(module);
    if (enabled && settings.enabledViews.length <= 1) {
      setModuleStatus("At least one module must remain enabled.");
      return;
    }

    updateModuleSettings((current) => {
      const nextEnabled = enabled ? current.enabledViews.filter((key) => key !== module) : [...current.enabledViews, module];
      const nextDefault = nextEnabled.includes(current.defaultView) ? current.defaultView : nextEnabled[0];
      return {
        ...current,
        enabledViews: nextEnabled,
        defaultView: nextDefault,
      };
    });
    setModuleStatus(`Module ${module} ${enabled ? "hidden" : "enabled"}.`);
  };

  const moveModule = (module: ViewKey, direction: -1 | 1) => {
    const order = [...settings.viewOrder];
    const idx = order.indexOf(module);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= order.length) return;

    [order[idx], order[target]] = [order[target], order[idx]];
    updateModuleSettings((current) => ({ ...current, viewOrder: order }));
    setModuleStatus(`Moved ${module} ${direction < 0 ? "up" : "down"}.`);
  };

  const setDefaultModule = (module: ViewKey) => {
    if (!settings.enabledViews.includes(module)) {
      setModuleStatus("Enable a module before setting it as default.");
      return;
    }
    updateModuleSettings((current) => ({ ...current, defaultView: module }));
    setView(module);
    setModuleStatus(`Default module set to ${module}.`);
  };

  const resetModuleLayout = () => {
    updateModuleSettings((current) => ({
      ...current,
      enabledViews: [...DEFAULT_VIEW_ORDER],
      viewOrder: [...DEFAULT_VIEW_ORDER],
      defaultView: "home",
    }));
    setView("home");
    setModuleStatus("Module layout reset to defaults.");
  };

  const applyModuleProfile = (profileId: string) => {
    const profile = MODULE_PROFILES.find((item) => item.id === profileId);
    if (!profile) return;

    updateModuleSettings((current) => ({
      ...current,
      enabledViews: [...profile.enabledViews],
      viewOrder: [...profile.viewOrder],
      defaultView: profile.defaultView,
    }));
    setView(profile.defaultView);
    setModuleStatus(`Applied ${profile.name} profile.`);
  };

  const saveCurrentAsCustomProfile = () => {
    const name = customProfileName.trim();
    if (!name) {
      setModuleStatus("Enter a custom profile name.");
      return;
    }

    updateModuleSettings((current) => {
      const profile: UserModuleProfile = {
        id: uid(),
        name: name.slice(0, 50),
        enabledViews: [...current.enabledViews],
        viewOrder: [...current.viewOrder],
        defaultView: current.defaultView,
      };

      return {
        ...current,
        customProfiles: [profile, ...current.customProfiles].slice(0, 20),
      };
    });
    setCustomProfileName("");
    setModuleStatus(`Saved custom profile: ${name}.`);
  };

  const applyCustomProfile = (profileId: string) => {
    const profile = settings.customProfiles.find((item) => item.id === profileId);
    if (!profile) return;

    updateModuleSettings((current) => ({
      ...current,
      enabledViews: [...profile.enabledViews],
      viewOrder: [...profile.viewOrder],
      defaultView: profile.defaultView,
    }));
    setView(profile.defaultView);
    setModuleStatus(`Applied custom profile: ${profile.name}.`);
  };

  const deleteCustomProfile = (profileId: string) => {
    const target = settings.customProfiles.find((item) => item.id === profileId);
    if (!target) return;

    updateModuleSettings((current) => ({
      ...current,
      customProfiles: current.customProfiles.filter((item) => item.id !== profileId),
    }));
    setModuleStatus(`Deleted custom profile: ${target.name}.`);
  };

  const exportCustomProfiles = () => {
    if (!settings.customProfiles.length) {
      setModuleStatus("No custom profiles available to export.");
      return;
    }

    const payload = {
      version: 1,
      createdAt: Date.now(),
      profiles: settings.customProfiles,
    };
    setCustomProfilesTransferText(JSON.stringify(payload, null, 2));
    setModuleStatus(`Prepared ${settings.customProfiles.length} custom profile(s) for export.`);
  };

  const buildCustomProfileImportPlan = (rawText: string): ProfileImportPlan => {
    const initialSummary = { add: 0, rename: 0, overwrite: 0, skip: 0 };
    const trimmed = rawText.trim();
    if (!trimmed) {
      return {
        valid: false,
        message: "Paste custom profile JSON to preview import changes.",
        incomingCount: 0,
        resolvedProfiles: customProfilesImportMode === "replace" ? [] : settings.customProfiles,
        actions: [],
        summary: initialSummary,
      };
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      const incoming = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && Array.isArray((parsed as { profiles?: unknown[] }).profiles)
          ? (parsed as { profiles: unknown[] }).profiles
          : null;

      if (!incoming) {
        return {
          valid: false,
          message: "Invalid profile payload. Expected an array or { profiles: [...] }.",
          incomingCount: 0,
          resolvedProfiles: customProfilesImportMode === "replace" ? [] : settings.customProfiles,
          actions: [],
          summary: initialSummary,
        };
      }

      const normalizedIncoming = normalizeUserSettings(
        {
          ...settings,
          customProfiles: incoming as UserModuleProfile[],
        },
        settings.displayName,
      ).customProfiles;

      const createUniqueName = (baseName: string, used: Set<string>) => {
        const base = baseName.trim() || "Imported Profile";
        let candidate = base;
        let index = 2;
        while (used.has(candidate.toLowerCase())) {
          candidate = `${base} (${index})`;
          index += 1;
        }
        return candidate;
      };

      const source = customProfilesImportMode === "replace" ? [] : [...settings.customProfiles];
      const usedNames = new Set(source.map((profile) => profile.name.toLowerCase()));
      const result = [...source];
      const actions: Array<{ sourceName: string; targetName: string; action: ProfileImportAction }> = [];
      const summary = { add: 0, rename: 0, overwrite: 0, skip: 0 };

      for (const profile of normalizedIncoming) {
        const baseName = (profile.name || "Imported Profile").trim() || "Imported Profile";
        const lower = baseName.toLowerCase();
        const conflictIndex = result.findIndex((item) => item.name.toLowerCase() === lower);

        if (conflictIndex < 0) {
          const uniqueName = createUniqueName(baseName, usedNames);
          usedNames.add(uniqueName.toLowerCase());
          result.push({ ...profile, id: uid(), name: uniqueName });
          actions.push({ sourceName: baseName, targetName: uniqueName, action: uniqueName === baseName ? "add" : "rename" });
          if (uniqueName === baseName) summary.add += 1;
          else summary.rename += 1;
          continue;
        }

        if (customProfileConflictMode === "skip") {
          actions.push({ sourceName: baseName, targetName: result[conflictIndex].name, action: "skip" });
          summary.skip += 1;
          continue;
        }

        if (customProfileConflictMode === "overwrite") {
          const existingId = result[conflictIndex].id;
          const keepName = result[conflictIndex].name;
          result[conflictIndex] = { ...profile, id: existingId, name: keepName };
          actions.push({ sourceName: baseName, targetName: keepName, action: "overwrite" });
          summary.overwrite += 1;
          continue;
        }

        const uniqueName = createUniqueName(baseName, usedNames);
        usedNames.add(uniqueName.toLowerCase());
        result.push({ ...profile, id: uid(), name: uniqueName });
        actions.push({ sourceName: baseName, targetName: uniqueName, action: "rename" });
        summary.rename += 1;
      }

      return {
        valid: true,
        message: `Preview ready: ${normalizedIncoming.length} incoming profile(s).`,
        incomingCount: normalizedIncoming.length,
        resolvedProfiles: result.slice(0, 20),
        actions,
        summary,
      };
    } catch {
      return {
        valid: false,
        message: "Failed to parse custom profile JSON.",
        incomingCount: 0,
        resolvedProfiles: customProfilesImportMode === "replace" ? [] : settings.customProfiles,
        actions: [],
        summary: initialSummary,
      };
    }
  };

  const customProfileImportPreview = useMemo(
    () => buildCustomProfileImportPlan(customProfilesTransferText),
    [customProfilesTransferText, customProfilesImportMode, customProfileConflictMode, settings.customProfiles, settings.displayName],
  );

  const importCustomProfiles = () => {
    if (!customProfileImportPreview.valid) {
      setModuleStatus(customProfileImportPreview.message);
      return;
    }
    if (!customProfileImportPreview.incomingCount) {
      setModuleStatus("No importable profiles were found in the payload.");
      return;
    }

    updateModuleSettings((current) => ({
      ...current,
      customProfiles: customProfileImportPreview.resolvedProfiles,
    }));
    setModuleStatus(
      `Imported ${customProfileImportPreview.incomingCount} profile(s): +${customProfileImportPreview.summary.add}, renamed ${customProfileImportPreview.summary.rename}, overwritten ${customProfileImportPreview.summary.overwrite}, skipped ${customProfileImportPreview.summary.skip}.`,
    );
  };

  return {
    customProfileImportPreview,
    toggleModule,
    moveModule,
    setDefaultModule,
    resetModuleLayout,
    applyModuleProfile,
    saveCurrentAsCustomProfile,
    applyCustomProfile,
    deleteCustomProfile,
    exportCustomProfiles,
    importCustomProfiles,
  };
}
