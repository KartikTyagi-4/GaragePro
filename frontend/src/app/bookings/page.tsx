"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarClock, CarFront, CheckCircle2, CirclePlus, Clock3, Search, Sparkles, UserPlus, Wrench, X, Zap } from "lucide-react";
import { api, Booking, BookingStatus, Customer, Mechanic, Service, Vehicle } from "@/lib/api";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const STATUSES: BookingStatus[] = ["PENDING", "ASSIGNED", "ON_THE_WAY", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const statusLabel = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value));
const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const dateTime = (value: string) => { const d = new Date(value); return `${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} · ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`; };
const statusTone = (status: string) => ({ COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-600/10", PENDING: "bg-amber-50 text-amber-700 ring-amber-600/10", ASSIGNED: "bg-sky-50 text-sky-700 ring-sky-600/10", ON_THE_WAY: "bg-orange-50 text-orange-700 ring-orange-600/10", IN_PROGRESS: "bg-violet-50 text-violet-700 ring-violet-600/10", CANCELLED: "bg-rose-50 text-rose-700 ring-rose-600/10" }[status] ?? "bg-slate-100 text-slate-700 ring-slate-600/10");
const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [customerMode, setCustomerMode] = useState<"existing" | "new">("new");
  const [vehicleMode, setVehicleMode] = useState<"existing" | "new">("new");
  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [mechanicId, setMechanicId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [createStatus, setCreateStatus] = useState<BookingStatus>("PENDING");
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });
  const [newVehicle, setNewVehicle] = useState({ registration_number: "", brand: "", model: "", year: "2024", fuel_type: "Petrol" });

  const filteredVehicles = useMemo(() => vehicles.filter((v) => Number(v.customer_id) === Number(customerId)), [vehicles, customerId]);
  const stats = useMemo(() => ({ pending: bookings.filter((b) => b.status === "PENDING").length, active: bookings.filter((b) => ["ASSIGNED", "ON_THE_WAY", "IN_PROGRESS"].includes(b.status)).length, completed: bookings.filter((b) => b.status === "COMPLETED").length, value: bookings.reduce((sum, b) => sum + Number(b.amount || 0), 0) }), [bookings]);

  async function loadBookings() {
    try {
      setLoading(true);
      const response = await api.getBookings({ search: search || undefined, status: statusFilter || undefined, page, limit: 10, sort_by: "scheduled_at", sort_order: "desc" });
      setBookings(response.data ?? []);
      setTotalPages(Math.max(1, response.pagination?.total_pages ?? 1));
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load bookings"); }
    finally { setLoading(false); }
  }

  async function loadLookups() {
    const [c, s, m, v] = await Promise.all([api.getCustomers({ page: 1, limit: 100 }), api.getServices(), api.getMechanics(), api.getVehicles()]);
    setCustomers(c.data ?? []); setServices(s ?? []); setMechanics(m ?? []); setVehicles(v ?? []);
  }

  useEffect(() => { void loadBookings(); }, [page, search, statusFilter]);

  async function openCreate() {
    setError(""); setSuccess(""); setCustomerMode("new"); setVehicleMode("new"); setCustomerId(""); setVehicleId(""); setServiceId(""); setMechanicId(""); setAmount(""); setDate(localDate()); setTime("10:00"); setCreateStatus("PENDING"); setNewCustomer({ name: "", email: "", phone: "" }); setNewVehicle({ registration_number: "", brand: "", model: "", year: "2024", fuel_type: "Petrol" }); setShowCreate(true);
    try { await loadLookups(); } catch (e) { setError(e instanceof Error ? e.message : "Unable to load booking options"); }
  }

  function handleService(value: string) { setServiceId(value); const service = services.find((item) => Number(item.id) === Number(value)); if (service) setAmount(String(service.base_price)); }

  async function createBooking(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      let finalCustomerId = Number(customerId);
      if (customerMode === "new") {
        if (!newCustomer.name.trim() || !newCustomer.email.trim() || !newCustomer.phone.trim()) throw new Error("Enter the new customer's name, email and phone.");
        const customer = await api.createCustomer({ name: newCustomer.name.trim(), email: newCustomer.email.trim(), phone: newCustomer.phone.trim() });
        finalCustomerId = Number(customer.id);
      }

      let finalVehicleId = Number(vehicleId);
      if (vehicleMode === "new") {
        if (!finalCustomerId || !newVehicle.registration_number.trim() || !newVehicle.brand.trim() || !newVehicle.model.trim()) throw new Error("Enter all required vehicle details before creating the booking.");
        const vehicle = await api.createVehicle({ customer_id: finalCustomerId, registration_number: newVehicle.registration_number.trim(), brand: newVehicle.brand.trim(), model: newVehicle.model.trim(), year: Number(newVehicle.year), fuel_type: newVehicle.fuel_type });
        finalVehicleId = Number(vehicle.id);
      }

      if (!finalCustomerId || !finalVehicleId || !Number(serviceId) || Number(amount) <= 0 || !date || !time) throw new Error("Complete customer, vehicle, service, amount and schedule fields.");

      const created = await api.createBooking({ customer_id: finalCustomerId, vehicle_id: finalVehicleId, service_id: Number(serviceId), mechanic_id: mechanicId ? Number(mechanicId) : null, amount: Number(amount), scheduled_at: `${date}T${time}:00`, status: createStatus });
      if (!created?.id) throw new Error("The server did not return a booking ID. The booking was not confirmed.");

      setShowCreate(false);
      setSuccess(`Booking ${created.booking_number} was saved successfully.`);
      setPage(1);
      const refreshed = await api.getBookings({ page: 1, limit: 10, sort_by: "scheduled_at", sort_order: "desc" });
      setBookings(refreshed.data ?? []); setTotalPages(Math.max(1, refreshed.pagination?.total_pages ?? 1));
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to create booking"); }
    finally { setSaving(false); }
  }

  async function changeStatus(id: number, status: BookingStatus) {
    try { await api.updateBookingStatus(id, status); await loadBookings(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to update booking"); }
  }

  return (
    <div className="flex min-h-screen bg-[#f5f6f8] text-slate-950">
      <Sidebar />
      <div className="min-w-0 flex-1"><Header />
        <main className="mx-auto max-w-[1700px] space-y-6 p-4 md:p-7">
          <section className="relative overflow-hidden rounded-[30px] bg-[#0d131c] p-6 text-white shadow-xl md:p-8">
            <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" /><div className="absolute bottom-[-130px] left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-300/15 bg-orange-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300"><Sparkles className="h-3.5 w-3.5" /> Booking Studio</div><h1 className="text-3xl font-black tracking-tight md:text-4xl">Run every service job from one place.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Create customers, register vehicles and schedule workshop jobs without leaving the operations desk.</p></div><button onClick={openCreate} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-400"><CirclePlus className="h-5 w-5" /> New booking <ArrowRight className="h-4 w-4" /></button></div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pending</p><p className="mt-2 text-2xl font-black">{stats.pending}</p><p className="mt-1 text-xs text-slate-400">Needs attention</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active jobs</p><p className="mt-2 text-2xl font-black">{stats.active}</p><p className="mt-1 text-xs text-slate-400">In the service flow</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Completed</p><p className="mt-2 text-2xl font-black">{stats.completed}</p><p className="mt-1 text-xs text-slate-400">On this page</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Visible value</p><p className="mt-2 text-2xl font-black">{money(stats.value)}</p><p className="mt-1 text-xs text-slate-400">Current queue</p></div></div>

          <section className="grid gap-3 md:grid-cols-[1fr_190px]"><div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="Search booking number or customer..." className={`${inputClass} pl-11 shadow-sm`} /></div><select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }} className={`${inputClass} shadow-sm`}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}</select></section>

          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}
          {success && <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> {success}</div>}

          <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-black">Live service queue</h2><p className="text-xs text-slate-400">Saved bookings appear here immediately.</p></div><div className="flex items-center gap-2 text-xs font-bold text-emerald-600"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> API connected</div></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead className="bg-slate-50/80 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400"><tr><th className="px-5 py-4">Booking</th><th className="px-5 py-4">Customer / Vehicle</th><th className="px-5 py-4">Service</th><th className="px-5 py-4">Schedule</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-400">Loading live service queue…</td></tr> : bookings.length === 0 ? <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-400">No bookings match your search.</td></tr> : bookings.map((b) => <tr key={b.id} className="transition hover:bg-orange-50/30"><td className="px-5 py-4"><div className="font-black">{b.booking_number}</div><div className="text-[11px] text-slate-400">Job #{b.id}</div></td><td className="px-5 py-4"><div className="font-bold">{b.customer?.name}</div><div className="text-xs text-slate-500">{b.vehicle?.brand} {b.vehicle?.model} · {b.vehicle?.registration_number}</div></td><td className="px-5 py-4"><div className="font-semibold">{b.service?.name}</div><div className="text-xs text-slate-400">{b.service?.category}</div></td><td className="px-5 py-4"><div className="flex items-center gap-1.5 font-semibold"><CalendarClock className="h-3.5 w-3.5 text-orange-500" />{dateTime(b.scheduled_at)}</div></td><td className="px-5 py-4 font-black">{money(b.amount)}</td><td className="px-5 py-4"><select value={b.status} onChange={(e) => void changeStatus(b.id, e.target.value as BookingStatus)} className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${statusTone(b.status)}`}><option value={b.status}>{statusLabel(b.status)}</option>{STATUSES.filter((s) => s !== b.status).map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}</select></td></tr>)}</tbody></table></div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-500"><span>Page {page} of {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-200 px-3 py-2 font-semibold disabled:opacity-40">Previous</button><button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-200 px-3 py-2 font-semibold disabled:opacity-40">Next</button></div></div>
          </section>
        </main>
      </div>

      {showCreate && <div className="fixed inset-0 z-50 bg-slate-950/70 p-3 backdrop-blur-md md:p-7" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) setShowCreate(false); }}><div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[30px] bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 md:px-8"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">GaragePro · Booking Studio</p><h2 className="mt-1 text-2xl font-black tracking-tight">Create a service job</h2><p className="mt-1 text-xs text-slate-400">The booking is saved only after customer, vehicle and job IDs are linked successfully.</p></div><button disabled={saving} onClick={() => setShowCreate(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X /></button></div>
        <form onSubmit={createBooking} className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1fr_340px]">
          <div className="space-y-7 p-6 md:p-8">
            <div><div className="mb-3 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-500"><UserPlus className="h-4 w-4" /></span><div><h3 className="font-black">Customer</h3><p className="text-[11px] text-slate-400">Who is bringing the vehicle?</p></div></div><div className="mb-4 flex rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setCustomerMode("new")} className={`flex-1 rounded-lg py-2 text-xs font-bold ${customerMode === "new" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>New customer</button><button type="button" onClick={() => setCustomerMode("existing")} className={`flex-1 rounded-lg py-2 text-xs font-bold ${customerMode === "existing" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Existing customer</button></div>{customerMode === "new" ? <div className="grid gap-3 md:grid-cols-3"><input required value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} placeholder="Full name" className={inputClass} /><input required type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} placeholder="Email" className={inputClass} /><input required value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} placeholder="Phone" className={inputClass} /></div> : <select required value={customerId} onChange={async (e) => { const value = e.target.value; setCustomerId(value); setVehicleId(""); setVehicles(value ? await api.getVehicles({ customer_id: Number(value) }) : []); }} className={inputClass}><option value="">Choose an existing customer</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}</select>}</div>

            <div><div className="mb-3 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-500"><CarFront className="h-4 w-4" /></span><div><h3 className="font-black">Vehicle</h3><p className="text-[11px] text-slate-400">Register a vehicle or choose an existing one.</p></div></div><div className="mb-4 flex rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setVehicleMode("new")} className={`flex-1 rounded-lg py-2 text-xs font-bold ${vehicleMode === "new" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Register new</button><button type="button" onClick={() => setVehicleMode("existing")} className={`flex-1 rounded-lg py-2 text-xs font-bold ${vehicleMode === "existing" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Existing vehicle</button></div>{vehicleMode === "new" ? <div className="grid gap-3 md:grid-cols-2"><input required value={newVehicle.registration_number} onChange={(e) => setNewVehicle({ ...newVehicle, registration_number: e.target.value })} placeholder="Registration · UP14AB1234" className={inputClass} /><input required value={newVehicle.brand} onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })} placeholder="Brand · Hyundai" className={inputClass} /><input required value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} placeholder="Model · Creta" className={inputClass} /><input required type="number" min="1950" max="2100" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })} placeholder="Year" className={inputClass} /><select value={newVehicle.fuel_type} onChange={(e) => setNewVehicle({ ...newVehicle, fuel_type: e.target.value })} className={inputClass}><option>Petrol</option><option>Diesel</option><option>Electric</option><option>CNG</option><option>Hybrid</option></select></div> : <select required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} disabled={!customerId} className={inputClass}><option value="">{customerId ? "Choose customer's vehicle" : "Choose a customer first"}</option>{filteredVehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number} · {v.brand} {v.model}</option>)}</select>}</div>

            <div><div className="mb-3 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-500"><Wrench className="h-4 w-4" /></span><div><h3 className="font-black">Service & technician</h3><p className="text-[11px] text-slate-400">Pick the job and optionally assign a mechanic.</p></div></div><div className="grid gap-3 md:grid-cols-2"><select required value={serviceId} onChange={(e) => handleService(e.target.value)} className={inputClass}><option value="">Select service</option>{services.map((s) => <option key={s.id} value={s.id}>{s.name} · {money(s.base_price)}</option>)}</select><select value={mechanicId} onChange={(e) => setMechanicId(e.target.value)} className={inputClass}><option value="">Assign later</option>{mechanics.filter((m) => m.status === "AVAILABLE" || m.status === "ON_JOB").map((m) => <option key={m.id} value={m.id}>{m.name} · {statusLabel(m.status)}</option>)}</select></div></div>
          </div>

          <aside className="border-t bg-slate-50 p-6 lg:border-l lg:border-t-0 md:p-7"><div className="sticky top-0"><div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Job summary</p><Zap className="h-4 w-4 text-orange-500" /></div><div className="mt-5 space-y-4"><label className="block text-xs font-bold text-slate-500">Booking date<input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} mt-1`} /></label><label className="block text-xs font-bold text-slate-500">Arrival time<input required type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`${inputClass} mt-1`} /></label><label className="block text-xs font-bold text-slate-500">Amount<input required type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${inputClass} mt-1 text-lg font-black`} /></label><label className="block text-xs font-bold text-slate-500">Initial status<select value={createStatus} onChange={(e) => setCreateStatus(e.target.value as BookingStatus)} className={`${inputClass} mt-1`}>{STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}</select></label></div><div className="mt-6 rounded-2xl bg-[#0d131c] p-4 text-white"><div className="flex items-center gap-2 text-xs font-bold text-orange-300"><Clock3 className="h-4 w-4" /> Save flow</div><p className="mt-2 text-xs leading-5 text-slate-400">Customer → vehicle → booking. If any step fails, the exact API error stays visible instead of silently closing the form.</p></div><button disabled={saving} type="submit" className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving booking…" : <><CheckCircle2 className="h-5 w-5" /> Save booking</>}</button></div></aside>
        </form>
      </div></div>}
    </div>
  );
}
