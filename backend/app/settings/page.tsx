"use client";

import {
  useState,
} from "react";

import {
  Settings,
  User,
  Bell,
  Shield,
  Save,
  Mail,
  Building2,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

export default function SettingsPage() {
  const [name, setName] =
    useState("Operations Team");

  const [email, setEmail] =
    useState("admin@garagepro.com");

  const [company, setCompany] =
    useState("GaragePro");

  const [notifications, setNotifications] =
    useState(true);

  const [saved, setSaved] =
    useState(false);

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-6 md:p-8">
      {/* HEADER */}

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Settings
            </h1>

            <p className="mt-1 text-muted-foreground">
              Manage your account and platform preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* SETTINGS MENU */}

        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
            <User className="h-4 w-4" />

            Profile
          </div>

          <div className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground">
            <Bell className="h-4 w-4" />

            Notifications
          </div>

          <div className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />

            Security
          </div>
        </div>

        {/* SETTINGS CONTENT */}

        <div className="space-y-6">
          {/* PROFILE */}

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Profile Information
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Update your account information.
              </p>
            </div>

            <div className="space-y-5">
              {/* PROFILE AVATAR */}

              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  OP
                </div>

                <div>
                  <p className="font-medium">
                    Operations Team
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Administrator account
                  </p>
                </div>
              </div>

              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                  <input
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                  <input
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* COMPANY */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Organization
                </label>

                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                  <input
                    value={company}
                    onChange={(event) =>
                      setCompany(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* NOTIFICATIONS */}

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Notification Preferences
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Choose how you want to receive updates.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Booking Notifications
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Receive updates about booking activity.
                </p>
              </div>

              <button
                onClick={() =>
                  setNotifications(
                    !notifications
                  )
                }
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  notifications
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                    notifications
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* SAVE */}

          <div className="flex items-center justify-end gap-4">
            {saved && (
              <p className="text-sm font-medium text-green-600">
                Settings saved successfully!
              </p>
            )}

            <Button
              onClick={handleSave}
              className="gap-2"
            >
              <Save className="h-4 w-4" />

              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}