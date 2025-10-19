// /* eslint-disable @typescript-eslint/no-explicit-any */

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// interface FetchOptions extends RequestInit {
//   headers?: Record<string, string>;
//   isFormData?: boolean;
//   token?: string;
// }

// /**
//  * Flexible fetch wrapper for API calls
//  */
// export const fetchWrapper = async (
//   endpoint: string,
//   method: string = "GET",
//   data?: any,
//   options: FetchOptions = {},
//   token?: string
// ): Promise<any> => {
//   const url = `${API_BASE_URL}${endpoint}`;

//   const config: RequestInit = {
//     method,
//     credentials: "include", // allow cookies
//     ...options,
//   };

//   // Headers setup
//   if (!options.isFormData) {
//     config.headers = {
//       "Content-Type": "application/json",
//       ...(options.headers || {}),
//       ...(token && { Authorization: `Bearer ${token}` }),
//     };
//   } else {
//     config.headers = {
//       ...(options.headers || {}),
//       ...(token && { Authorization: `Bearer ${token}` }),
//     };
//   }

//   // Body setup
//   if (data && method !== "GET" && method !== "HEAD") {
//     config.body = options.isFormData ? data : JSON.stringify(data);
//   }

//   try {
//     const response = await fetch(url, config);

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.message || `API error: ${response.status}`);
//     }

//     // handle no-content (DELETE/204)
//     if (response.status === 204) {
//       return null;
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("❌ API call failed:", error);
//     throw error;
//   }
// };

export const fetchWrapper = async (
  url: string,
  method: string = "GET",
  body?: any,
  options: {
    isFormData?: boolean;
    credentials?: RequestCredentials;
  } = {}
) => {
  const config: RequestInit = {
    method,
    credentials: "include",
    headers: {},
  };

  if (body) {
    if (options.isFormData && body instanceof FormData) {
      config.body = body;
    } else {
      config.headers = {
        ...config.headers,
        "Content-Type": "application/json",
      };
      config.body = JSON.stringify(body);
    }
  }

  if (options.credentials) {
    config.credentials = options.credentials;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${url}`,
      config
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};
