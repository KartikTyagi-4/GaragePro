"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Database,
  Monitor,
  Moon,
  Save,
  Settings,
  Sun,
} from "lucide-react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("30");
  const [theme, setTheme] = useState("system");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem(
      "garagepro-settings-v1"
    );

    if (savedSettings) {
      const settings = JSON.parse(savedSettings);

      setNotifications(
        settings.notifications ?? true
      );

      setAutoRefresh(
        settings.autoRefresh ?? true
      );

      setRefreshInterval(
        settings.refreshInterval ?? "30"
      );

      setTheme(
        settings.theme ?? "system"
      );
    }
  }, []);

  const handleSave = () => {
    const settings = {
      notifications,
      autoRefresh,
      refreshInterval,
      theme,
    };

    localStorage.setItem(
      "garagepro-settings-v1",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">

      {/* PAGE HEADER */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Settings
              </h1>

              <p className="text-sm text-muted-foreground">
                Manage your GaragePro dashboard preferences.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Save className="h-4 w-4" />

          {saved
            ? "Settings Saved!"
            : "Save Changes"}
        </button>

      </div>

      <div className="grid max-w-5xl gap-6">

        {/* NOTIFICATIONS */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">

            <div className="rounded-lg bg-blue-500/10 p-2">
              <Bell className="h-5 w-5 text-blue-500" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Notifications
              </h2>

              <p className="text-sm text-muted-foreground">
                Control dashboard notifications and alerts.
              </p>
            </div>

          </div>

          <div className="flex items-center justify-between border-t pt-5">

            <div>
              <h3 className="font-medium">
                Enable Notifications
              </h3>

              <p className="text-sm text-muted-foreground">
                Receive important operational alerts.
              </p>
            </div>

            <button
              onClick={() =>
                setNotifications(!notifications)
              }
              className={`relative h-7 w-12 rounded-full transition ${
                notifications
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  notifications
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>

          </div>

        </section>

        {/* DASHBOARD */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">

            <div className="rounded-lg bg-purple-500/10 p-2">
              <Monitor className="h-5 w-5 text-purple-500" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Dashboard Preferences
              </h2>

              <p className="text-sm text-muted-foreground">
                Configure how your operations dashboard behaves.
              </p>
            </div>

          </div>

          <div className="space-y-6 border-t pt-5">

            {/* AUTO REFRESH */}
            <div className="flex items-center justify-between">

              <div>
                <h3 className="font-medium">
                  Auto Refresh
                </h3>

                <p className="text-sm text-muted-foreground">
                  Automatically refresh dashboard data.
                </p>
              </div>

              <button
                onClick={() =>
                  setAutoRefresh(!autoRefresh)
                }
                className={`relative h-7 w-12 rounded-full transition ${
                  autoRefresh
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    autoRefresh
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>

            </div>

            {/* REFRESH INTERVAL */}
            <div className="space-y-2">

              <label className="text-sm font-medium">
                Refresh Interval
              </label>

              <select
                value={refreshInterval}
                onChange={(e) =>
                  setRefreshInterval(e.target.value)
                }
                disabled={!autoRefresh}
                className="w-full max-w-sm rounded-lg border bg-background px-3 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="15">
                  Every 15 seconds
                </option>

                <option value="30">
                  Every 30 seconds
                </option>

                <option value="60">
                  Every 1 minute
                </option>

                <option value="300">
                  Every 5 minutes
                </option>
              </select>

            </div>

          </div>

        </section>

        {/* APPEARANCE */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">

            <div className="rounded-lg bg-orange-500/10 p-2">
              <Sun className="h-5 w-5 text-orange-500" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Appearance
              </h2>

              <p className="text-sm text-muted-foreground">
                Choose your preferred dashboard appearance.
              </p>
            </div>

          </div>

          <div className="grid gap-3 border-t pt-5 sm:grid-cols-3">

            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                theme === "light"
                  ? "border-primary ring-1 ring-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              <Sun className="h-5 w-5" />

              <div>
                <p className="font-medium">
                  Light
                </p>

                <p className="text-xs text-muted-foreground">
                  Light interface
                </p>
              </div>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                theme === "dark"
                  ? "border-primary ring-1 ring-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              <Moon className="h-5 w-5" />

              <div>
                <p className="font-medium">
                  Dark
                </p>

                <p className="text-xs text-muted-foreground">
                  Dark interface
                </p>
              </div>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                theme === "system"
                  ? "border-primary ring-1 ring-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              <Monitor className="h-5 w-5" />

              <div>
                <p className="font-medium">
                  System
                </p>

                <p className="text-xs text-muted-foreground">
                  Use device preference
                </p>
              </div>
            </button>

          </div>

        </section>

        {/* SYSTEM INFORMATION */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">

            <div className="rounded-lg bg-green-500/10 p-2">
              <Database className="h-5 w-5 text-green-500" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                System Information
              </h2>

              <p className="text-sm text-muted-foreground">
                Information about your GaragePro application.
              </p>
            </div>

          </div>

          <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">

            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">
                Application
              </p>

              <p className="mt-1 font-medium">
                GaragePro
              </p>
            </div>

            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">
                Version
              </p>

              <p className="mt-1 font-medium">
                1.0.0
              </p>
            </div>

            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">
                Frontend
              </p>

              <p className="mt-1 font-medium">
                Next.js
              </p>
            </div>

            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">
                Backend
              </p>

              <p className="mt-1 font-medium">
                FastAPI
              </p>
            </div>

          </div>

        </section>

      </div>

    </div>
  );
}