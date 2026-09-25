const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

/* =====================================================
   TYPES
===================================================== */

export type BookingStatus =
  | "PENDING"
  | "ASSIGNED"
  | "ON_THE_WAY"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  total_bookings?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Vehicle {
  id: number;
  customer_id?: number;

  brand: string;
  model: string;
  registration_number: string;

  year?: number | null;
  fuel_type?: string | null;

  created_at?: string;
  updated_at?: string;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
}

export interface CreateVehiclePayload {
  customer_id: number;
  registration_number: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;
}

export interface CreateMechanicPayload {
  name: string;
  phone?: string | null;
  email?: string | null;
  status: string;
  specialization?: string | null;
}

export interface UpdateMechanicPayload {
  name?: string;
  phone?: string | null;
  email?: string | null;
  status?: string;
  specialization?: string | null;
}

export interface Service {
  id: number;

  name: string;

  category?: string | null;

  description?: string | null;

  base_price: number;

  estimated_duration?: number | null;

  created_at?: string;
  updated_at?: string;
}

export interface Mechanic {
  id: number;

  name: string;

  phone?: string | null;

  email?: string | null;

  status: string;

  specialization?: string | null;

  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: number;

  booking_number: string;

  customer_id?: number;
  vehicle_id?: number;
  service_id?: number;
  mechanic_id?: number | null;

  customer: Customer;

  vehicle: Vehicle;

  service: Service;

  mechanic?: Mechanic | null;

  amount: number;

  scheduled_at: string;

  status: BookingStatus;

  created_at?: string;
  updated_at?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/* =====================================================
   DASHBOARD TYPES
===================================================== */

export interface DashboardOverview {
  total_bookings: number;
  today_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  active_mechanics: number;
  new_customers: number;

  [key: string]: number | undefined;
}

export interface ChartDataPoint {
  date?: string;
  label?: string;
  name?: string;

  bookings?: number;
  revenue?: number;
  count?: number;

  value?: number;
}

export interface StatusBreakdownItem {
  status: string;
  count: number;
}

export interface ServiceBreakdownItem {
  service?: string;
  category?: string;
  name?: string;
  count: number;
  revenue?: number;
}

export interface DashboardResponse {
  overview: DashboardOverview;

  bookings_over_time?: ChartDataPoint[];
  revenue_over_time?: ChartDataPoint[];

  booking_status?: StatusBreakdownItem[];
  status_breakdown: StatusBreakdownItem[];

  service_breakdown?: ServiceBreakdownItem[];

  [key: string]: unknown;
}

/* =====================================================
   REQUEST PARAMETERS
===================================================== */

export interface GetBookingsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface GetCustomersParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetVehiclesParams {
  customer_id?: number;
  page?: number;
  limit?: number;
}

export interface GetServicesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetMechanicsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/* =====================================================
   PAYLOADS
===================================================== */

export interface CreateBookingPayload {
  customer_id: number;
  vehicle_id: number;
  service_id: number;
  mechanic_id: number | null;
  amount: number;
  scheduled_at: string;
  status: BookingStatus;
}

export interface UpdateBookingStatusPayload {
  status: BookingStatus;
}

export interface CreateBookingResponse {
  message: string;
  id: number;
  booking_number: string;
  status: BookingStatus;
}

/* =====================================================
   INTERNAL ERROR CLASS
===================================================== */

export class ApiError extends Error {
  status: number;
  url: string;

  constructor(
    message: string,
    status: number,
    url: string
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

/* =====================================================
   HELPERS
===================================================== */

function toPositiveNumber(
  value: unknown,
  fallback: number
): number {
  const numberValue = Number(value);

  if (
    !Number.isFinite(numberValue) ||
    numberValue <= 0
  ) {
    return fallback;
  }

  return numberValue;
}

function toNonNegativeNumber(
  value: unknown,
  fallback = 0
): number {
  const numberValue = Number(value);

  if (
    !Number.isFinite(numberValue) ||
    numberValue < 0
  ) {
    return fallback;
  }

  return numberValue;
}

/* =====================================================
   QUERY STRING BUILDER
===================================================== */

function buildQueryString(
  params: Record<
    string,
    string | number | boolean | undefined | null
  >
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        searchParams.append(
          key,
          String(value)
        );
      }
    }
  );

  const queryString =
    searchParams.toString();

  return queryString
    ? `?${queryString}`
    : "";
}

/* =====================================================
   NORMALIZE LIST RESPONSE
===================================================== */

function normalizeListResponse<T>(
  response:
    | T[]
    | {
        data?: T[];
        items?: T[];
        results?: T[];
        records?: T[];
      }
    | null
    | undefined
): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    response &&
    Array.isArray(response.data)
  ) {
    return response.data;
  }

  if (
    response &&
    Array.isArray(response.items)
  ) {
    return response.items;
  }

  if (
    response &&
    Array.isArray(response.results)
  ) {
    return response.results;
  }

  if (
    response &&
    Array.isArray(response.records)
  ) {
    return response.records;
  }

  return [];
}

/* =====================================================
   NORMALIZE PAGINATED RESPONSE
===================================================== */

function normalizePaginatedResponse<T>(
  response:
    | T[]
    | PaginatedResponse<T>
    | {
        data?: T[];
        items?: T[];
        results?: T[];
        records?: T[];

        pagination?: Partial<Pagination>;

        total?: number;
        page?: number;
        limit?: number;
        total_pages?: number;
      }
    | null
    | undefined,
  requestedPage = 1,
  requestedLimit = 10
): PaginatedResponse<T> {
  const data =
    normalizeListResponse<T>(response);

  if (Array.isArray(response)) {
    return {
      data,

      pagination: {
        page: requestedPage,
        limit: requestedLimit,
        total: data.length,
        total_pages: Math.max(
          1,
          Math.ceil(
            data.length /
              Math.max(requestedLimit, 1)
          )
        ),
      },
    };
  }

  const objectResponse = (response || {}) as {
    pagination?: Partial<Pagination>;
    total?: number;
    page?: number;
    limit?: number;
    total_pages?: number;
  };

  const pagination =
    objectResponse.pagination || {};

  const total = toNonNegativeNumber(
    pagination.total ??
      objectResponse.total,
    data.length
  );

  const limit = toPositiveNumber(
    pagination.limit ??
      objectResponse.limit,
    requestedLimit
  );

  const page = toPositiveNumber(
    pagination.page ??
      objectResponse.page,
    requestedPage
  );

  const totalPages = toPositiveNumber(
    pagination.total_pages ??
      objectResponse.total_pages,
    Math.max(
      1,
      Math.ceil(
        total / Math.max(limit, 1)
      )
    )
  );

  return {
    data,

    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
    },
  };
}

/* =====================================================
   API FETCH
===================================================== */

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url =
    `${API_BASE_URL}${endpoint}`;

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,

      headers: {
        Accept: "application/json",

        ...(options.body
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),

        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(
      `Unable to connect to backend API at ${url}. ` +
        `Please make sure the backend server is running and CORS is configured correctly.`
    );
  }

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    try {
      const errorData =
        await response.json();

      if (
        typeof errorData?.detail ===
        "string"
      ) {
        message = errorData.detail;
      } else if (
        Array.isArray(
          errorData?.detail
        )
      ) {
        message =
          errorData.detail
            .map(
              (item: {
                msg?: string;
              }) =>
                item.msg ||
                "Validation error"
            )
            .join(", ");
      } else if (
        typeof errorData?.message ===
        "string"
      ) {
        message = errorData.message;
      } else if (
        typeof errorData?.error ===
        "string"
      ) {
        message = errorData.error;
      }
    } catch {
      // Response was not JSON.
    }

    throw new ApiError(
      message,
      response.status,
      url
    );
  }

  if (
    response.status === 204 ||
    response.status === 205
  ) {
    return undefined as T;
  }

  const contentType =
    response.headers.get(
      "content-type"
    );

  if (
    !contentType?.includes(
      "application/json"
    )
  ) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(
      `Backend returned an invalid JSON response from ${url}.`
    );
  }
}

/* =====================================================
   FETCH WITH FALLBACK ENDPOINTS

   Tries the next endpoint ONLY when
   the previous endpoint returns HTTP 404.
===================================================== */

async function apiFetchWithFallback<T>(
  endpoints: string[],
  options: RequestInit = {}
): Promise<T> {
  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      return await apiFetch<T>(
        endpoint,
        options
      );
    } catch (error) {
      lastError = error;

      if (
        error instanceof ApiError &&
        error.status === 404
      ) {
        continue;
      }

      throw error;
    }
  }

  if (
    lastError instanceof ApiError
  ) {
    throw new Error(
      `Backend route not found. Tried: ${endpoints.join(
        ", "
      )}. ` +
        `Backend base URL: ${API_BASE_URL}. ` +
        `Last response: ${lastError.message}`
    );
  }

  throw new Error(
    "Unable to complete API request."
  );
}

/* =====================================================
   DASHBOARD NORMALIZATION
===================================================== */

function normalizeDashboardResponse(
  response: unknown
): DashboardResponse {
  const data =
    (
      response &&
      typeof response === "object"
        ? response
        : {}
    ) as Record<string, unknown>;

  const rawOverview =
    data.overview &&
    typeof data.overview === "object"
      ? data.overview
      : data;

  const overview =
    rawOverview as Record<
      string,
      unknown
    >;

  const getNumber = (
    ...keys: string[]
  ): number => {
    for (const key of keys) {
      const value = overview[key];

      if (
        value !== undefined &&
        value !== null
      ) {
        const numberValue =
          Number(value);

        if (
          Number.isFinite(numberValue)
        ) {
          return numberValue;
        }
      }
    }

    return 0;
  };

  return {
    ...data,

    overview: {
      total_bookings: getNumber(
        "total_bookings",
        "totalBookings"
      ),

      today_bookings: getNumber(
        "today_bookings",
        "todayBookings"
      ),

      completed_bookings: getNumber(
        "completed_bookings",
        "completedBookings"
      ),

      pending_bookings: getNumber(
        "pending_bookings",
        "pendingBookings"
      ),

      cancelled_bookings: getNumber(
        "cancelled_bookings",
        "cancelledBookings"
      ),

      total_revenue: getNumber(
        "total_revenue",
        "totalRevenue",
        "revenue"
      ),

      active_mechanics: getNumber(
        "active_mechanics",
        "activeMechanics"
      ),

      new_customers: getNumber(
        "new_customers",
        "newCustomers"
      ),
    },

    bookings_over_time:
      normalizeListResponse<ChartDataPoint>(
        data.bookings_over_time as
          | ChartDataPoint[]
          | undefined
      ),

    revenue_over_time:
      normalizeListResponse<ChartDataPoint>(
        data.revenue_over_time as
          | ChartDataPoint[]
          | undefined
      ),

      booking_status:
        normalizeListResponse<StatusBreakdownItem>(
        (
          data.booking_status ??
          data.status_breakdown
        ) as StatusBreakdownItem[] | undefined
      ),

      status_breakdown:
        normalizeListResponse<StatusBreakdownItem>(
        (
          data.status_breakdown ??
          data.booking_status
        ) as StatusBreakdownItem[] | undefined
      ),

    service_breakdown:
      normalizeListResponse<ServiceBreakdownItem>(
        data.service_breakdown as
          | ServiceBreakdownItem[]
          | undefined
      ),
  } as DashboardResponse;
}

export type DashboardData = DashboardResponse;

/* =====================================================
   API
===================================================== */

export const api = {
  /* =====================================================
     DASHBOARD
  ===================================================== */

  async getDashboard(): Promise<DashboardResponse> {
    const response =
      await apiFetchWithFallback<unknown>([
        "/api/dashboard",
        "/dashboard",
        "/api/v1/dashboard",
      ]);

    return normalizeDashboardResponse(
      response
    );
  },

  async getRecentBookings(): Promise<
    PaginatedResponse<Booking>
  > {
    return api.getBookings({
      page: 1,
      limit: 10,
      sort_by: "scheduled_at",
      sort_order: "desc",
    });
  },

  /* =====================================================
     BOOKINGS
  ===================================================== */

  async getBookings(
    params: GetBookingsParams = {}
  ): Promise<
    PaginatedResponse<Booking>
  > {
    const requestedPage =
      params.page ?? 1;

    const requestedLimit =
      params.limit ?? 10;

    const query = buildQueryString({
      search: params.search,
      status: params.status,
      page: requestedPage,
      limit: requestedLimit,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
    });

    const response =
      await apiFetchWithFallback<
        | Booking[]
        | PaginatedResponse<Booking>
      >([
        `/api/bookings${query}`,
        `/bookings${query}`,
        `/api/v1/bookings${query}`,
      ]);

    return normalizePaginatedResponse(
      response,
      requestedPage,
      requestedLimit
    );
  },

  async getBooking(
    bookingId: number
  ): Promise<Booking> {
    return apiFetchWithFallback<Booking>(
      [
        `/api/bookings/${bookingId}`,
        `/bookings/${bookingId}`,
        `/api/v1/bookings/${bookingId}`,
      ]
    );
  },

  async createBooking(
    payload: CreateBookingPayload
  ): Promise<CreateBookingResponse> {
    return apiFetchWithFallback<CreateBookingResponse>(
      [
        "/api/bookings",
        "/bookings",
        "/api/v1/bookings",
      ],
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  async updateBookingStatus(
    bookingId: number,
    status: BookingStatus
  ): Promise<Booking> {
    const body = JSON.stringify({
      status,
    });

    try {
      return await apiFetchWithFallback<Booking>(
        [
          `/api/bookings/${bookingId}/status`,
          `/bookings/${bookingId}/status`,
          `/api/v1/bookings/${bookingId}/status`,
        ],
        {
          method: "PATCH",
          body,
        }
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status !== 404
      ) {
        throw error;
      }

      return apiFetchWithFallback<Booking>(
        [
          `/api/bookings/${bookingId}`,
          `/bookings/${bookingId}`,
          `/api/v1/bookings/${bookingId}`,
        ],
        {
          method: "PATCH",
          body,
        }
      );
    }
  },

  /* =====================================================
     CUSTOMERS
  ===================================================== */

  async getCustomers(
    params: GetCustomersParams = {}
  ): Promise<
    PaginatedResponse<Customer>
  > {
    const requestedPage =
      params.page ?? 1;

    const requestedLimit =
      params.limit ?? 100;

    const query = buildQueryString({
      search: params.search,
      page: requestedPage,
      limit: requestedLimit,
    });

    const response =
      await apiFetchWithFallback<
        | Customer[]
        | PaginatedResponse<Customer>
      >([
        `/api/customers${query}`,
        `/customers${query}`,
        `/api/v1/customers${query}`,
      ]);

    return normalizePaginatedResponse(
      response,
      requestedPage,
      requestedLimit
    );
  },

  async getCustomer(
    customerId: number
  ): Promise<Customer> {
    return apiFetchWithFallback<Customer>(
      [
        `/api/customers/${customerId}`,
        `/customers/${customerId}`,
        `/api/v1/customers/${customerId}`,
      ]
    );
  },

  async createCustomer(
    payload: CreateCustomerData
  ): Promise<Customer> {
    const response = await apiFetchWithFallback<
      Customer | { customer: Customer }
    >(
      [
        "/api/customers",
        "/customers",
        "/api/v1/customers",
      ],
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    return "customer" in response
      ? response.customer
      : response;
  },

  async updateCustomer(
    customerId: number,
    payload: CreateCustomerData
  ): Promise<Customer> {
    const response = await apiFetchWithFallback<
      Customer | { customer: Customer }
    >(
      [
        `/api/customers/${customerId}`,
        `/customers/${customerId}`,
        `/api/v1/customers/${customerId}`,
      ],
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );

    return "customer" in response
      ? response.customer
      : response;
  },

  /* =====================================================
     VEHICLES
  ===================================================== */

  async getVehicles(
    params: GetVehiclesParams = {}
  ): Promise<Vehicle[]> {
    const query = buildQueryString({
      customer_id:
        params.customer_id,
      page: params.page,
      limit: params.limit,
    });

    const endpoints: string[] = [
      `/api/vehicles${query}`,
      `/vehicles${query}`,
      `/api/v1/vehicles${query}`,
    ];

    if (params.customer_id) {
      const paginationQuery =
        buildQueryString({
          page: params.page,
          limit: params.limit,
        });

      endpoints.push(
        `/api/customers/${params.customer_id}/vehicles${paginationQuery}`,
        `/customers/${params.customer_id}/vehicles${paginationQuery}`,
        `/api/v1/customers/${params.customer_id}/vehicles${paginationQuery}`
      );
    }

    const response =
      await apiFetchWithFallback<
        | Vehicle[]
        | {
            data?: Vehicle[];
            items?: Vehicle[];
            results?: Vehicle[];
            records?: Vehicle[];
          }
      >(endpoints);

    return normalizeListResponse<Vehicle>(
      response
    );
  },

  async getVehicle(
    vehicleId: number
  ): Promise<Vehicle> {
    return apiFetchWithFallback<Vehicle>(
      [
        `/api/vehicles/${vehicleId}`,
        `/vehicles/${vehicleId}`,
        `/api/v1/vehicles/${vehicleId}`,
      ]
    );
  },

  async createVehicle(
    payload: CreateVehiclePayload
  ): Promise<Vehicle> {
    const response = await apiFetchWithFallback<
      Vehicle | { vehicle: Vehicle }
    >([
      "/api/vehicles",
      "/vehicles",
      "/api/v1/vehicles",
    ], {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return "vehicle" in response ? response.vehicle : response;
  },

  /* =====================================================
     SERVICES
  ===================================================== */

  async getServices(
    params: GetServicesParams = {}
  ): Promise<Service[]> {
    const query = buildQueryString({
      search: params.search,
      page: params.page,
      limit: params.limit,
    });

    const response =
      await apiFetchWithFallback<
        | Service[]
        | {
            data?: Service[];
            items?: Service[];
            results?: Service[];
            records?: Service[];
          }
      >([
        `/api/services${query}`,
        `/services${query}`,
        `/api/v1/services${query}`,
      ]);

    return normalizeListResponse<Service>(
      response
    );
  },

  async getService(
    serviceId: number
  ): Promise<Service> {
    return apiFetchWithFallback<Service>(
      [
        `/api/services/${serviceId}`,
        `/services/${serviceId}`,
        `/api/v1/services/${serviceId}`,
      ]
    );
  },

  /* =====================================================
     MECHANICS
  ===================================================== */

  async getMechanics(
    params: GetMechanicsParams = {}
  ): Promise<Mechanic[]> {
    const query = buildQueryString({
      search: params.search,
      status: params.status,
      page: params.page,
      limit: params.limit,
    });

    const response =
      await apiFetchWithFallback<
        | Mechanic[]
        | {
            data?: Mechanic[];
            items?: Mechanic[];
            results?: Mechanic[];
            records?: Mechanic[];
          }
      >([
        `/api/mechanics${query}`,
        `/mechanics${query}`,
        `/api/v1/mechanics${query}`,
      ]);

    return normalizeListResponse<Mechanic>(
      response
    );
  },

  async getMechanic(
    mechanicId: number
  ): Promise<Mechanic> {
    return apiFetchWithFallback<Mechanic>(
      [
        `/api/mechanics/${mechanicId}`,
        `/mechanics/${mechanicId}`,
        `/api/v1/mechanics/${mechanicId}`,
      ]
    );
  },

  async createMechanic(
    payload: CreateMechanicPayload
  ): Promise<Mechanic> {
    return apiFetchWithFallback<Mechanic>(
      [
        "/api/mechanics",
        "/mechanics",
        "/api/v1/mechanics",
      ],
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  async updateMechanic(
    mechanicId: number,
    payload: UpdateMechanicPayload
  ): Promise<Mechanic> {
    return apiFetchWithFallback<Mechanic>(
      [
        `/api/mechanics/${mechanicId}`,
        `/mechanics/${mechanicId}`,
        `/api/v1/mechanics/${mechanicId}`,
      ],
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  },
};