"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "student-productivity-hub-analytics-consent";
const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
const posthogProjectKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";
const trustedPosthogHosts = new Set(["https://us.i.posthog.com", "https://eu.i.posthog.com"]);

function isValidProjectId(projectId: string | undefined): projectId is string {
  return Boolean(projectId && /^[a-z0-9_-]+$/i.test(projectId));
}

function loadScript(id: string, source: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = source;
  document.head.appendChild(script);
}

function enableClarity() {
  if (!isValidProjectId(clarityProjectId)) return;
  loadScript("microsoft-clarity", `https://www.clarity.ms/tag/${clarityProjectId}`);
}

function enablePostHog() {
  if (!isValidProjectId(posthogProjectKey) || !trustedPosthogHosts.has(posthogHost.replace(/\/$/, ""))) return;
  const host = posthogHost.replace(/\/$/, "");
  const bootstrap = document.createElement("script");
  if (document.getElementById("posthog-bootstrap")) return;
  bootstrap.id = "posthog-bootstrap";
  bootstrap.text = `(function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2===o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once reset group groups register register_once unregister opt_out_capturing opt_in_capturing has_opted_out_capturing get_property onFeatureFlags getFeatureFlag isFeatureEnabled reloadFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)})(document,window.posthog||[]);posthog.init("${posthogProjectKey}",{api_host:"${host}",autocapture:false,disable_session_recording:true,capture_pageview:true,capture_pageleave:true,person_profiles:"identified_only"});`;
  document.head.appendChild(bootstrap);
}

export function AnalyticsConsent() {
  const [consent, setConsent] = useState<"allow" | "deny" | null>(null);
  const analyticsConfigured = isValidProjectId(clarityProjectId) || isValidProjectId(posthogProjectKey);

  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_KEY);
    if (saved === "allow" || saved === "deny") setConsent(saved);
  }, []);

  useEffect(() => {
    if (consent !== "allow") return;
    enableClarity();
    enablePostHog();
  }, [consent]);

  if (!analyticsConfigured || consent) return null;

  const choose = (value: "allow" | "deny") => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  };

  return (
    <aside className="analytics-consent" aria-label="Optional analytics choice">
      <p>Help improve the app with anonymous page-level analytics. Session recording and form autocapture are disabled.</p>
      <div className="analytics-consent-actions">
        <button className="secondary" onClick={() => choose("allow")}>Allow analytics</button>
        <button className="ghost" onClick={() => choose("deny")}>No thanks</button>
      </div>
    </aside>
  );
}