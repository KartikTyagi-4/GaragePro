"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  Edit,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  UserCog,
  Wrench,
  X,
} from "lucide-react";

import {
  api,
  Booking,
  Mechanic,
} from "@/lib/api";

const PAGE_SIZE = 100;

type MechanicFormData = {
  name: string;
  phone: string;
  email: string;
  specialization: string;
  status: string;
};

const initialFormData: MechanicFormData = {
  name: "",
  phone: "",
  email: "",
  specialization: "",
  status: "AVAILABLE",
};

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function getStatusStyle(status: string) {
  const normalizedStatus = status
    .toUpperCase()
    .replace(/ /g, "_");

  if (
    normalizedStatus === "AVAILABLE" ||
    normalizedStatus === "ACTIVE"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalizedStatus === "ON_JOB" ||
    normalizedStatus === "BUSY" ||
    normalizedStatus === "WORKING" ||
    normalizedStatus === "IN_PROGRESS"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (
    normalizedStatus === "INACTIVE" ||
    normalizedStatus === "OFFLINE"
  ) {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
}

export default function MechanicsPage() {
  const [mechanics, setMechanics] = useState<
    Mechanic[]
  >([]);

  const [bookings, setBookings] = useState<
    Booking[]
  >([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingMechanic, setEditingMechanic] =
    useState<Mechanic | null>(null);

  const [formData, setFormData] =
    useState<MechanicFormData>(
      initialFormData
    );

  const loadData = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [
        mechanicsResponse,
        bookingsResponse,
      ] = await Promise.all([
        api.getMechanics({
          page: 1,
          limit: PAGE_SIZE,
        }),

        api.getBookings({
          page: 1,
          limit: PAGE_SIZE,
        }),
      ]);

      setMechanics(mechanicsResponse);
      setBookings(bookingsResponse.data);
    } catch (error) {
      console.error(
        "Failed to load mechanics:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load mechanics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const mechanicBookingStats = useMemo(() => {
    const stats = new Map<
      number,
      {
        active: number;
        completed: number;
      }
    >();

    bookings.forEach((booking) => {
      if (!booking.mechanic_id) {
        return;
      }

      const current =
        stats.get(booking.mechanic_id) || {
          active: 0,
          completed: 0,
        };

      if (booking.status === "COMPLETED") {
        current.completed += 1;
      }

      if (
        booking.status === "ASSIGNED" ||
        booking.status === "ON_THE_WAY" ||
        booking.status === "IN_PROGRESS"
      ) {
        current.active += 1;
      }

      stats.set(
        booking.mechanic_id,
        current
      );
    });

    return stats;
  }, [bookings]);

  const filteredMechanics = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return mechanics.filter((mechanic) => {
      const matchesSearch =
        !normalizedSearch ||
        mechanic.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        mechanic.phone
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        mechanic.email
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        mechanic.specialization
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        mechanic.status
          .toUpperCase()
          .replace(/ /g, "_") ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    mechanics,
    search,
    statusFilter,
  ]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(
      new Set(
        mechanics.map((mechanic) =>
          mechanic.status
            .toUpperCase()
            .replace(/ /g, "_")
        )
      )
    );
  }, [mechanics]);

  const activeMechanics = useMemo(() => {
    return mechanics.filter((mechanic) => {
      const status = mechanic.status
        .toUpperCase()
        .replace(/ /g, "_");

      return (
        status === "ACTIVE" ||
        status === "AVAILABLE" ||
        status === "BUSY" ||
        status === "ON_JOB" ||
        status === "WORKING"
      );
    }).length;
  }, [mechanics]);

  const totalActiveJobs = useMemo(() => {
    return Array.from(
      mechanicBookingStats.values()
    ).reduce(
      (total, item) =>
        total + item.active,
      0
    );
  }, [mechanicBookingStats]);

  const totalCompletedJobs = useMemo(() => {
    return Array.from(
      mechanicBookingStats.values()
    ).reduce(
      (total, item) =>
        total + item.completed,
      0
    );
  }, [mechanicBookingStats]);

  const openAddModal = () => {
    setEditingMechanic(null);

    setFormData(initialFormData);

    setError(null);

    setIsModalOpen(true);
  };

  const openEditModal = (
    mechanic: Mechanic
  ) => {
    setEditingMechanic(mechanic);

    setFormData({
      name: mechanic.name || "",
      phone: mechanic.phone || "",
      email: mechanic.email || "",
      specialization:
        mechanic.specialization || "",
      status:
        (mechanic.status || "AVAILABLE").toUpperCase().replace(/ /g, "_"),
    });

    setError(null);

    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);

    setEditingMechanic(null);

    setFormData(initialFormData);
  };

  const handleInputChange = (
    field: keyof MechanicFormData,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError(
        "Mechanic name is required."
      );

      return;
    }

    try {
      setSaving(true);

      setError(null);

      const payload = {
        name: formData.name.trim(),

        phone:
          formData.phone.trim() || null,

        email:
          formData.email.trim() || null,

        specialization:
          formData.specialization.trim() ||
          null,

        status: formData.status.toUpperCase().replace(/ /g, "_"),
      };

      if (editingMechanic) {
        await api.updateMechanic(
          editingMechanic.id,
          payload
        );
      } else {
        await api.createMechanic(
          payload
        );
      }

      setIsModalOpen(false);

      setEditingMechanic(null);

      setFormData(initialFormData);

      await loadData(true);
    } catch (error) {
      console.error(
        "Failed to save mechanic:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save mechanic."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

          <p className="text-sm text-slate-500">
            Loading mechanics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Mechanics
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your mechanics and their
            current workload.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />

            Add Mechanic
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && !isModalOpen && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="font-medium">
              Something went wrong
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Mechanics"
          value={mechanics.length}
          icon={<UserCog className="h-5 w-5" />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Active Mechanics"
          value={activeMechanics}
          icon={<Wrench className="h-5 w-5" />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Active Jobs"
          value={totalActiveJobs}
          icon={
            <BriefcaseBusiness className="h-5 w-5" />
          }
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Completed Jobs"
          value={totalCompletedJobs}
          icon={
            <BriefcaseBusiness className="h-5 w-5" />
          }
          iconClass="bg-purple-50 text-purple-600"
        />
      </div>

      {/* SEARCH AND FILTER */}

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name, phone, email or specialization..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="ALL">
            All Statuses
          </option>

          {uniqueStatuses.map((status) => (
            <option
              key={status}
              value={status}
            >
              {formatStatus(status)}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Mechanic
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Contact
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Specialization
                </th>

                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active Jobs
                </th>

                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Completed
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredMechanics.map(
                (mechanic) => {
                  const stats =
                    mechanicBookingStats.get(
                      mechanic.id
                    ) || {
                      active: 0,
                      completed: 0,
                    };

                  return (
                    <tr
                      key={mechanic.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                            {mechanic.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-medium text-slate-900">
                              {mechanic.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              ID #{mechanic.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          {mechanic.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />

                              {mechanic.phone}
                            </div>
                          )}

                          {mechanic.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />

                              {mechanic.email}
                            </div>
                          )}

                          {!mechanic.phone &&
                            !mechanic.email && (
                              <span className="text-sm text-slate-400">
                                No contact details
                              </span>
                            )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {mechanic.specialization ||
                          "Not specified"}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
                          {stats.active}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                          {stats.completed}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(
                            mechanic.status
                          )}`}
                        >
                          {formatStatus(
                            mechanic.status
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(
                              mechanic
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <Edit className="h-4 w-4" />

                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {filteredMechanics.length === 0 && (
          <div className="py-16 text-center">
            <UserCog className="mx-auto mb-3 h-10 w-10 text-slate-300" />

            <h3 className="font-medium text-slate-900">
              No mechanics found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or
              filters.
            </p>
          </div>
        )}
      </div>

      {/* MODAL */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingMechanic
                    ? "Edit Mechanic"
                    : "Add New Mechanic"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingMechanic
                    ? "Update mechanic details and availability."
                    : "Enter the details for the new mechanic."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >
              <div className="space-y-5">
                {error && (
                  <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="h-5 w-5 shrink-0" />

                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Full Name *
                  </label>

                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(event) =>
                      handleInputChange(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Enter mechanic name"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Phone Number
                    </label>

                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(event) =>
                        handleInputChange(
                          "phone",
                          event.target.value
                        )
                      }
                      placeholder="Phone number"
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={formData.email}
                      onChange={(event) =>
                        handleInputChange(
                          "email",
                          event.target.value
                        )
                      }
                      placeholder="Email address"
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Specialization
                  </label>

                  <input
                    type="text"
                    value={
                      formData.specialization
                    }
                    onChange={(event) =>
                      handleInputChange(
                        "specialization",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Engine Repair"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Current Status *
                  </label>

                  <select
                    value={formData.status}
                    onChange={(event) =>
                      handleInputChange(
                        "status",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="AVAILABLE">
                      Available
                    </option>

                    <option value="ON_JOB">
                      On Job
                    </option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {editingMechanic
                    ? "Save Changes"
                    : "Add Mechanic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`rounded-lg p-3 ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}