"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Bell,
  Search,
  Menu,
  Circle,
  Settings,
  CalendarDays,
  Users,
  Wrench,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  api,
  Booking,
  Customer,
  Mechanic,
} from "@/lib/api";

type SearchResult =
  | {
      type: "booking";
      id: number;
      title: string;
      subtitle: string;
    }
  | {
      type: "customer";
      id: number;
      title: string;
      subtitle: string;
    }
  | {
      type: "mechanic";
      id: number;
      title: string;
      subtitle: string;
    };

export function Header() {
  const router = useRouter();

  const [search, setSearch] = useState("");

  const [searchResults, setSearchResults] =
    useState<SearchResult[]>([]);

  const [isSearching, setIsSearching] =
    useState(false);

  const [showSearch, setShowSearch] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notifications, setNotifications] =
    useState<Booking[]>([]);

  const [mechanics, setMechanics] =
    useState<Mechanic[]>([]);

  const searchRef =
    useRef<HTMLDivElement>(null);

  const notificationRef =
    useRef<HTMLDivElement>(null);

  const searchRequestId =
    useRef(0);

  /*
   * HELPER:
   * Always safely extract an array from
   * different possible API response formats.
   */
  const getArrayData = <T,>(data: unknown): T[] => {
    if (Array.isArray(data)) {
      return data as T[];
    }

    if (
      data &&
      typeof data === "object" &&
      "data" in data &&
      Array.isArray(
        (data as { data?: unknown }).data
      )
    ) {
      return (
        data as { data: T[] }
      ).data;
    }

    if (
      data &&
      typeof data === "object" &&
      "items" in data &&
      Array.isArray(
        (data as { items?: unknown }).items
      )
    ) {
      return (
        data as { items: T[] }
      ).items;
    }

    return [];
  };

  /*
   * CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
   */
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target = event.target as Node;

      if (
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setShowSearch(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * LOAD NOTIFICATIONS
   */
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response =
          await api.getRecentBookings();

        const data = getArrayData<Booking>(
          response?.data
        );

        setNotifications(data);
      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error
        );

        setNotifications([]);
      }
    };

    loadNotifications();
  }, []);

  /*
   * LOAD MECHANICS
   */
  useEffect(() => {
    const loadMechanics = async () => {
      try {
        const response =
          await api.getMechanics();

        console.log(
          "Mechanics API response:",
          response
        );

        const data = getArrayData<Mechanic>(
          response
        );

        setMechanics(data);
      } catch (error) {
        console.error(
          "Failed to load mechanics:",
          error
        );

        setMechanics([]);
      }
    };

    loadMechanics();
  }, []);

  /*
   * GLOBAL SEARCH
   */
  useEffect(() => {
    const trimmedSearch =
      search.trim();

    if (!trimmedSearch) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timeout = setTimeout(async () => {
      const currentRequestId =
        searchRequestId.current + 1;

      searchRequestId.current =
        currentRequestId;

      try {
        setIsSearching(true);

        const searchTerm =
          trimmedSearch.toLowerCase();

        const [
          bookingsResponse,
          customersResponse,
        ] = await Promise.all([
          api.getBookings({
            search: trimmedSearch,
            page: 1,
            limit: 5,
          }),

          api.getCustomers({
            search: trimmedSearch,
            page: 1,
            limit: 5,
          }),
        ]);

        /*
         * Ignore outdated requests.
         */
        if (
          currentRequestId !==
          searchRequestId.current
        ) {
          return;
        }

        const results: SearchResult[] = [];

        /*
         * SAFELY EXTRACT BOOKINGS
         */
        const bookings =
          getArrayData<Booking>(
            bookingsResponse?.data
          );

        bookings.forEach(
          (booking: Booking) => {
            results.push({
              type: "booking",
              id: booking.id,
              title:
                booking.booking_number ??
                `Booking #${booking.id}`,
              subtitle: `${
                booking.customer?.name ??
                "Unknown customer"
              } • ${
                booking.vehicle?.brand ?? ""
              } ${
                booking.vehicle?.model ?? ""
              }`.trim(),
            });
          }
        );

        /*
         * SAFELY EXTRACT CUSTOMERS
         */
        const customers =
          getArrayData<Customer>(
            customersResponse?.data
          );

        customers.forEach(
          (customer: Customer) => {
            results.push({
              type: "customer",
              id: customer.id,
              title:
                customer.name ??
                "Unknown customer",
              subtitle:
                customer.email ??
                "",
            });
          }
        );

        /*
         * MECHANICS
         *
         * Double safety check added here.
         * Even if something unexpected happens,
         * .filter() will never run on undefined.
         */
        const safeMechanics =
          Array.isArray(mechanics)
            ? mechanics
            : [];

        safeMechanics
          .filter((mechanic) =>
            (mechanic.name ?? "")
              .toLowerCase()
              .includes(searchTerm)
          )
          .slice(0, 5)
          .forEach((mechanic) => {
            results.push({
              type: "mechanic",
              id: mechanic.id,
              title: mechanic.name,
              subtitle:
                mechanic.status ??
                "",
            });
          });

        setSearchResults(results);
      } catch (error) {
        console.error(
          "Search failed:",
          error
        );

        setSearchResults([]);
      } finally {
        if (
          currentRequestId ===
          searchRequestId.current
        ) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
    };
  }, [search, mechanics]);

  /*
   * HANDLE SEARCH RESULT CLICK
   */
  const handleSearchResultClick = (
    result: SearchResult
  ) => {
    setShowSearch(false);
    setSearch("");
    setSearchResults([]);

    switch (result.type) {
      case "booking":
        router.push(
          `/bookings?search=${encodeURIComponent(
            result.title
          )}&selected=${result.id}`
        );
        break;

      case "customer":
        router.push(
          `/customers?search=${encodeURIComponent(
            result.title
          )}&selected=${result.id}`
        );
        break;

      case "mechanic":
        router.push(
          `/mechanics?search=${encodeURIComponent(
            result.title
          )}&selected=${result.id}`
        );
        break;
    }
  };

  /*
   * SEARCH RESULT ICON
   */
  const getResultIcon = (
    type: SearchResult["type"]
  ) => {
    switch (type) {
      case "booking":
        return (
          <CalendarDays className="h-4 w-4 text-blue-600" />
        );

      case "customer":
        return (
          <Users className="h-4 w-4 text-green-600" />
        );

      case "mechanic":
        return (
          <Wrench className="h-4 w-4 text-orange-600" />
        );
    }
  };

  /*
   * NOTIFICATION MESSAGE
   */
  const getNotificationMessage = (
    booking: Booking
  ) => {
    if (
      booking.status === "COMPLETED"
    ) {
      return `${booking.booking_number} was completed`;
    }

    if (
      booking.status === "CANCELLED"
    ) {
      return `${booking.booking_number} was cancelled`;
    }

    if (
      booking.status === "IN_PROGRESS"
    ) {
      return `${booking.booking_number} is in progress`;
    }

    return `New booking ${booking.booking_number}`;
  };

  /*
   * NOTIFICATION DATE
   */
  const getNotificationTime = (
    date: string
  ) => {
    const bookingDate =
      new Date(date);

    return bookingDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  return (
    <header className="relative z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-8">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
          <Circle className="h-2 w-2 fill-green-500 text-green-500" />

          <span>
            Live operations dashboard
          </span>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* SEARCH */}
        <div
          ref={searchRef}
          className="relative"
        >
          <div className="hidden items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 md:flex">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

            <input
              value={search}
              onFocus={() => {
                if (search.trim()) {
                  setShowSearch(true);
                }
              }}
              onChange={(event) => {
                setSearch(event.target.value);
                setShowSearch(true);
              }}
              placeholder="Search bookings, customers..."
              className="w-48 bg-transparent text-sm outline-none placeholder:text-muted-foreground lg:w-72"
            />

            {isSearching && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}

            {!isSearching && search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchResults([]);
                  setShowSearch(false);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* SEARCH RESULTS */}
          {showSearch &&
            search.trim() && (
              <div className="absolute right-0 top-12 w-[420px] overflow-hidden rounded-xl border bg-background shadow-xl">

                <div className="border-b px-4 py-3">
                  <p className="text-sm font-semibold">
                    Search Results
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Bookings, customers and mechanics
                  </p>
                </div>

                <div className="max-h-[400px] overflow-y-auto">

                  {isSearching ? (
                    <div className="flex flex-col items-center justify-center px-4 py-10 text-sm text-muted-foreground">
                      <Loader2 className="mb-3 h-5 w-5 animate-spin" />
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Search className="mx-auto h-6 w-6 text-muted-foreground" />

                      <p className="mt-3 text-sm font-medium">
                        No results found
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Try another search term
                      </p>
                    </div>
                  ) : (
                    searchResults.map(
                      (result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          type="button"
                          onClick={() =>
                            handleSearchResultClick(
                              result
                            )
                          }
                          className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/60"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                            {getResultIcon(
                              result.type
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {result.title}
                            </p>

                            <p className="truncate text-xs text-muted-foreground">
                              {result.subtitle}
                            </p>
                          </div>

                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      )
                    )
                  )}
                </div>
              </div>
            )}
        </div>

        {/* MOBILE SEARCH */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => {
            router.push("/bookings");
          }}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* NOTIFICATIONS */}
        <div
          ref={notificationRef}
          className="relative"
        >
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => {
              setShowNotifications(
                !showNotifications
              );
            }}
          >
            <Bell className="h-5 w-5" />

            {notifications.length > 0 && (
              <span className="absolute right-2 top-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-[380px] overflow-hidden rounded-xl border bg-background shadow-xl">

              <div className="flex items-center justify-between border-b px-4 py-4">
                <div>
                  <h3 className="font-semibold">
                    Notifications
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Recent booking activity
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNotifications([]);
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto">

                {notifications.length ===
                0 ? (
                  <div className="px-4 py-10 text-center">
                    <Bell className="mx-auto h-7 w-7 text-muted-foreground" />

                    <p className="mt-3 text-sm font-medium">
                      All caught up!
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      You have no new notifications.
                    </p>
                  </div>
                ) : (
                  notifications.map(
                    (booking) => (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() => {
                          router.push(
                            `/bookings?selected=${booking.id}`
                          );

                          setShowNotifications(
                            false
                          );
                        }}
                        className="flex w-full gap-3 border-b px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-muted/60"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <CalendarDays className="h-4 w-4 text-primary" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            {getNotificationMessage(
                              booking
                            )}
                          </p>

                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {booking.customer?.name ??
                              "Unknown customer"}{" "}
                            •{" "}
                            {booking.service?.name ??
                              "Unknown service"}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {getNotificationTime(
                              booking.scheduled_at
                            )}
                          </p>
                        </div>
                      </button>
                    )
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  router.push("/bookings");
                  setShowNotifications(false);
                }}
                className="flex w-full items-center justify-center gap-2 border-t px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-muted"
              >
                View all bookings

                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* SETTINGS */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            router.push("/settings");
          }}
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>

      </div>
    </header>
  );
}