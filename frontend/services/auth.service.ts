// import { fetchWrapper } from "@/lib/api";

// export const Register = (data: {
//   name: string;
//   email: string;
//   password: string;
// }) => {
//   return fetchWrapper("/auth/register", "POST", data);
// };

// export const login = (data: { email: string; password: string }) => {
//   return fetchWrapper("/auth/login", "POST", data);
// };

// export const logout = () => {
//   return fetchWrapper("/auth/logout", "GET");
// };
// export const forgotPassword = (data: { email: string }) => {
//   return fetchWrapper("/auth/forgot-password", "POST", data);
// };

// export const resetPassword = (token: string, password: string) => {
//   return fetchWrapper("/auth/reset-password", "POST", { token, password });
// };

// export const validateResetToken = (token: string) => {
//   return fetchWrapper(`/auth/validate-reset-token/${token}`, "GET");
// };

// export const getMe = (token: string) => {
//   return fetchWrapper("/auth/me", "GET", undefined);
// };

// export const updateProfile = (token: string, data: any) => {
//   return fetchWrapper("/auth/profile", "PUT", data);
// };

// // Instructor routes
// export const becomeInstructor = (token: string) => {
//   return fetchWrapper("/auth/become-instructor", "POST", undefined);
// };

// export const getInstructorApplications = (token: string) => {
//   return fetchWrapper("/auth/instructor-applications", "GET", undefined);
// };

// export const processInstructorApplication = (
//   token: string,
//   userId: string,
//   data: any
// ) => {
//   return fetchWrapper(`/auth/instructor-applications/${userId}`, "PUT", data);
// };

// export const uploadAvatar = (file: File) => {
//   const formData = new FormData();
//   formData.append("avatar", file);
//   return fetchWrapper("/auth/upload-avatar", "POST", formData);
// };

// export const deleteAvatar = () => {
//   return fetchWrapper("/auth/avatar", "DELETE");
// };

import { fetchWrapper } from "@/lib/api";


export interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    courseUpdates: boolean;
    newMessages: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "connections";
    showEmail: boolean;
    showEnrollments: boolean;
  };
  communication: {
    newsletter: boolean;
    productUpdates: boolean;
    courseRecommendations: boolean;
  };
  language: string;
  timezone: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteAccountData {
  confirmation: string;
}

export const Register = (data: {
  name: string;
  email: string;
  password: string;
}) => {
  return fetchWrapper("/auth/register", "POST", data);
};

export const login = (data: { email: string; password: string }) => {
  return fetchWrapper("/auth/login", "POST", data);
};

export const logout = () => {
  return fetchWrapper("/auth/logout", "GET");
};
export const forgotPassword = (data: { email: string }) => {
  return fetchWrapper("/auth/forgot-password", "POST", data);
};

export const resetPassword = (token: string, password: string) => {
  return fetchWrapper("/auth/reset-password", "POST", { token, password });
};

export const validateResetToken = (token: string) => {
  return fetchWrapper(`/auth/validate-reset-token/${token}`, "GET");
};

export const getMe = (token: string) => {
  return fetchWrapper("/auth/me", "GET", undefined);
};

export const updateProfile = (data: any) => {
  return fetchWrapper("/auth/profile", "PUT", data);
};

// Instructor routes
export const becomeInstructor = (token: string, message: string) => {
  return fetchWrapper("/auth/become-instructor", "POST", { message });
};

export const getInstructorApplications = (token: string) => {
  return fetchWrapper("/auth/instructor-applications", "GET", undefined);
};

export const processInstructorApplication = (
  token: string,
  userId: string,
  data: any
) => {
  return fetchWrapper(`/auth/instructor-applications/${userId}`, "PUT", data);
};

export const uploadAvatar = (token: string, file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return fetchWrapper("/auth/upload-avatar", "POST", formData, {
    isFormData: true,
  });
};

export const deleteAvatar = (token: string) => {
  return fetchWrapper("/auth/avatar", "DELETE");
};

export const changePassword = (
  token: string,
  currentPassword: string,
  newPassword: string
) => {
  return fetchWrapper("/auth/change-password", "POST", {
    currentPassword,
    newPassword,
  });
};

export const getSettings = (): Promise<{
  success: boolean;
  data: Settings;
}> => {
  return fetchWrapper("/auth/settings", "GET");
};

export const updateSettings = (
  data: Partial<Settings>
): Promise<{ success: boolean; data: Settings }> => {
  return fetchWrapper("/auth/settings", "PUT", data);
};

export const changePasswordSetting = (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> => {
  return fetchWrapper("/auth/settings/change-password", "PUT", data);
};

export const deleteAccount = (
  data: DeleteAccountData
): Promise<{ success: boolean; message: string }> => {
  return fetchWrapper("/auth/settings/account", "DELETE", data);
};

// Session management
export const signOutAllDevices = (): Promise<{
  success: boolean;
  message: string;
}> => {
  return fetchWrapper("/auth/signout-all", "POST");
};

// Export data
export const exportUserData = (): Promise<{
  success: boolean;
  data: string;
}> => {
  return fetchWrapper("/auth/export-data", "GET");
};
