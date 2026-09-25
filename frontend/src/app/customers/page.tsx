"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import {
  api,
  Customer,
  CreateCustomerData,
} from "@/lib/api";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


type ModalMode = "create" | "edit" | "view" | null;


export default function CustomersPage() {
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [modalMode, setModalMode] =
    useState<ModalMode>(null);

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [formData, setFormData] =
    useState<CreateCustomerData>({
      name: "",
      email: "",
      phone: "",
    });

  const [formError, setFormError] =
    useState("");

  const limit = 20;


  /* =====================================================
     FETCH CUSTOMERS
  ===================================================== */

  const customersQuery = useQuery({
    queryKey: ["customers", search, page],

    queryFn: () =>
      api.getCustomers({
        search: search || undefined,
        page,
        limit,
      }),

    placeholderData: (previousData) =>
      previousData,
  });


  /* =====================================================
     CREATE CUSTOMER
  ===================================================== */

  const createCustomerMutation = useMutation({
    mutationFn: (data: CreateCustomerData) =>
      api.createCustomer(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      closeModal();
    },

    onError: (error: Error) => {
      setFormError(error.message);
    },
  });


  /* =====================================================
     UPDATE CUSTOMER
  ===================================================== */

  const updateCustomerMutation = useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: number;
      data: CreateCustomerData;
    }) =>
      api.updateCustomer(
        customerId,
        data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      closeModal();
    },

    onError: (error: Error) => {
      setFormError(error.message);
    },
  });


  /* =====================================================
     HANDLERS
  ===================================================== */

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }


  function refreshData() {
    customersQuery.refetch();
  }


  function openCreateModal() {
    setFormError("");

    setFormData({
      name: "",
      email: "",
      phone: "",
    });

    setSelectedCustomer(null);

    setModalMode("create");
  }


  function openEditModal(
    customer: Customer
  ) {
    setFormError("");

    setSelectedCustomer(customer);

    setFormData({
      name: customer.name,
      email: customer.email ?? "",
      phone: customer.phone,
    });

    setModalMode("edit");
  }


  function openViewModal(
    customer: Customer
  ) {
    setSelectedCustomer(customer);

    setModalMode("view");
  }


  function closeModal() {
    setModalMode(null);

    setSelectedCustomer(null);

    setFormError("");

    setFormData({
      name: "",
      email: "",
      phone: "",
    });
  }


  function handleFormChange(
    field: keyof CreateCustomerData,
    value: string
  ) {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  }


  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setFormError("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      setFormError(
        "Please fill in all customer details."
      );

      return;
    }

    if (modalMode === "create") {
      createCustomerMutation.mutate({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });
    }

    if (
      modalMode === "edit" &&
      selectedCustomer
    ) {
      updateCustomerMutation.mutate({
        customerId: selectedCustomer.id,

        data: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        },
      });
    }
  }


  /* =====================================================
     LOADING
  ===================================================== */

  if (customersQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">

          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />

          <p className="mt-4 text-sm text-muted-foreground">
            Loading customers...
          </p>

        </div>
      </div>
    );
  }


  /* =====================================================
     ERROR
  ===================================================== */

  if (
    customersQuery.isError ||
    !customersQuery.data
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">

        <div className="text-center">

          <h2 className="text-2xl font-bold">
            Unable to load customers
          </h2>

          <p className="mt-2 text-muted-foreground">
            Make sure the FastAPI backend is running.
          </p>

          <Button
            className="mt-5"
            onClick={refreshData}
          >
            Try Again
          </Button>

        </div>

      </div>
    );
  }


  const {
    data: customers,
    pagination,
  } = customersQuery.data;


  const isSubmitting =
    createCustomerMutation.isPending ||
    updateCustomerMutation.isPending;


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="flex min-h-screen bg-muted/30">

      <Sidebar />

      <div className="min-w-0 flex-1">

        <Header />

        <main className="mx-auto max-w-[1800px] space-y-6 p-4 md:p-8">


          {/* PAGE HEADER */}

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-primary/10 p-3">

                  <Users className="h-6 w-6 text-primary" />

                </div>

                <div>

                  <h1 className="text-3xl font-bold tracking-tight">
                    Customers
                  </h1>

                  <p className="mt-1 text-muted-foreground">
                    Manage and view your customer database.
                  </p>

                </div>

              </div>

            </div>


            <div className="flex gap-3">

              <Button
                variant="outline"
                onClick={refreshData}
                disabled={customersQuery.isFetching}
              >

                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    customersQuery.isFetching
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh

              </Button>


              <Button
                onClick={openCreateModal}
              >

                <Plus className="mr-2 h-4 w-4" />

                Add Customer

              </Button>

            </div>

          </div>


          {/* SEARCH */}

          <div className="rounded-xl border bg-card p-4 shadow-sm">

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="relative flex-1">

                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={searchInput}

                  onChange={(event) =>
                    setSearchInput(
                      event.target.value
                    )
                  }

                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      handleSearch();
                    }
                  }}

                  placeholder="Search by name, email or phone..."

                  className="pl-10"
                />

              </div>


              <Button
                onClick={handleSearch}
              >

                <Search className="mr-2 h-4 w-4" />

                Search

              </Button>

            </div>

          </div>


          {/* CUSTOMERS TABLE */}

          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">

            <div className="flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-center">

              <div>

                <h2 className="text-lg font-semibold">
                  All Customers
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">

                  {pagination.total.toLocaleString()} total customers

                </p>

              </div>


              <span className="text-sm text-muted-foreground">

                Page {pagination.page} of{" "}
                {pagination.total_pages}

              </span>

            </div>


            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="border-b bg-muted/40">

                  <tr className="text-left text-muted-foreground">

                    <th className="px-5 py-4 font-medium">
                      Customer
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Email
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Phone
                    </th>

                    <th className="px-5 py-4 text-center font-medium">
                      Total Bookings
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Customer Since
                    </th>

                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {customers.length > 0 ? (

                    customers.map(
                      (customer) => (

                        <tr
                          key={customer.id}

                          className="border-b transition-colors hover:bg-muted/30"
                        >

                          {/* CUSTOMER */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">

                                {customer.name
                                  .split(" ")
                                  .map(
                                    (part) =>
                                      part[0]
                                  )
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}

                              </div>


                              <div>

                                <p className="font-medium">
                                  {customer.name}
                                </p>

                                <p className="text-xs text-muted-foreground">

                                  Customer #
                                  {customer.id}

                                </p>

                              </div>

                            </div>

                          </td>


                          {/* EMAIL */}

                          <td className="px-5 py-4 text-muted-foreground">

                            {customer.email}

                          </td>


                          {/* PHONE */}

                          <td className="px-5 py-4">

                            {customer.phone}

                          </td>


                          {/* BOOKINGS */}

                          <td className="px-5 py-4 text-center">

                            <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">

                              {customer.total_bookings ?? 0}

                            </span>

                          </td>


                          {/* CREATED */}

                          <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">

                            {customer.created_at
                              ? new Date(customer.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                              : "—"}

                          </td>


                          {/* ACTIONS */}

                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              <Button
                                variant="outline"
                                size="icon"

                                onClick={() =>
                                  openViewModal(
                                    customer
                                  )
                                }
                              >

                                <Eye className="h-4 w-4" />

                              </Button>


                              <Button
                                variant="outline"
                                size="icon"

                                onClick={() =>
                                  openEditModal(
                                    customer
                                  )
                                }
                              >

                                <Pencil className="h-4 w-4" />

                              </Button>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan={6}

                        className="px-5 py-16 text-center text-muted-foreground"
                      >

                        <Users className="mx-auto mb-4 h-10 w-10 opacity-30" />

                        <p className="font-medium">
                          No customers found
                        </p>

                        <p className="mt-1 text-sm">
                          Try changing your search criteria.
                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>


            {/* PAGINATION */}

            <div className="flex flex-col items-center justify-between gap-4 border-t p-4 sm:flex-row">

              <p className="text-sm text-muted-foreground">

                Showing{" "}

                {pagination.total === 0
                  ? 0
                  : (pagination.page - 1) *
                      pagination.limit +
                    1}

                {" - "}

                {Math.min(
                  pagination.page *
                    pagination.limit,
                  pagination.total
                )}

                {" of "}

                {pagination.total.toLocaleString()}

              </p>


              <div className="flex items-center gap-2">

                <Button
                  variant="outline"
                  size="sm"

                  disabled={
                    pagination.page === 1 ||
                    customersQuery.isFetching
                  }

                  onClick={() =>
                    setPage(
                      (currentPage) =>
                        currentPage - 1
                    )
                  }
                >

                  <ChevronLeft className="mr-1 h-4 w-4" />

                  Previous

                </Button>


                <Button
                  variant="outline"
                  size="sm"

                  disabled={
                    pagination.page >=
                      pagination.total_pages ||
                    customersQuery.isFetching
                  }

                  onClick={() =>
                    setPage(
                      (currentPage) =>
                        currentPage + 1
                    )
                  }
                >

                  Next

                  <ChevronRight className="ml-1 h-4 w-4" />

                </Button>

              </div>

            </div>

          </div>

        </main>

      </div>


      {/* =================================================
          MODAL
      ================================================= */}

      {modalMode && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="relative w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl">

            <Button
              variant="ghost"
              size="icon"

              className="absolute right-3 top-3"

              onClick={closeModal}
            >

              <X className="h-4 w-4" />

            </Button>


            {/* VIEW CUSTOMER */}

            {modalMode === "view" &&
              selectedCustomer && (

                <div>

                  <h2 className="text-xl font-bold">
                    Customer Details
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Complete customer information.
                  </p>


                  <div className="mt-6 space-y-4">

                    <CustomerDetail
                      label="Name"
                      value={
                        selectedCustomer.name
                      }
                    />

                    <CustomerDetail
                      label="Email"
                      value={
                        selectedCustomer.email ?? "—"
                      }
                    />

                    <CustomerDetail
                      label="Phone"
                      value={
                        selectedCustomer.phone
                      }
                    />

                    <CustomerDetail
                      label="Total Bookings"
                      value={String(
                        selectedCustomer.total_bookings ?? 0
                      )}
                    />

                    <CustomerDetail
                      label="Customer Since"
                      value={
                        selectedCustomer.created_at
                          ? new Date(
                              selectedCustomer.created_at
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "—"
                      }
                    />

                  </div>


                  <Button
                    className="mt-6 w-full"
                    onClick={closeModal}
                  >
                    Close
                  </Button>

                </div>

              )}


            {/* CREATE / EDIT FORM */}

            {(modalMode === "create" ||
              modalMode === "edit") && (

              <form onSubmit={handleSubmit}>

                <h2 className="text-xl font-bold">

                  {modalMode === "create"
                    ? "Add Customer"
                    : "Edit Customer"}

                </h2>


                <p className="mt-1 text-sm text-muted-foreground">

                  {modalMode === "create"
                    ? "Enter the details for the new customer."
                    : "Update the customer information."}

                </p>


                <div className="mt-6 space-y-4">

                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Full Name
                    </label>

                    <Input
                      value={formData.name}

                      onChange={(event) =>
                        handleFormChange(
                          "name",
                          event.target.value
                        )
                      }

                      placeholder="Enter customer name"
                    />

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Email Address
                    </label>

                    <Input
                      type="email"

                      value={formData.email}

                      onChange={(event) =>
                        handleFormChange(
                          "email",
                          event.target.value
                        )
                      }

                      placeholder="customer@example.com"
                    />

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Phone Number
                    </label>

                    <Input
                      value={formData.phone}

                      onChange={(event) =>
                        handleFormChange(
                          "phone",
                          event.target.value
                        )
                      }

                      placeholder="Enter phone number"
                    />

                  </div>


                  {formError && (

                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">

                      {formError}

                    </div>

                  )}

                </div>


                <div className="mt-6 flex justify-end gap-3">

                  <Button
                    type="button"
                    variant="outline"

                    onClick={closeModal}

                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>


                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >

                    {isSubmitting
                      ? "Saving..."
                      : modalMode === "create"
                        ? "Create Customer"
                        : "Save Changes"}

                  </Button>

                </div>

              </form>

            )}

          </div>

        </div>

      )}

    </div>
  );
}


/* =====================================================
   CUSTOMER DETAIL COMPONENT
===================================================== */

function CustomerDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">

      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">

        {label}

      </p>

      <p className="mt-1 font-medium">

        {value}

      </p>

    </div>
  );
}