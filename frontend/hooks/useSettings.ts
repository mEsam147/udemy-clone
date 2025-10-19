import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  type Settings,
  type PasswordChangeData,
  type DeleteAccountData,
} from "@/lib/types";
import * as settingsApi from "@/services/auth.service";
export const useSettings = () => {
  const t = useTranslations("settings");
  const queryClient = useQueryClient();

  // Get settings
  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    error: settingsError,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const settings = settingsData?.data;

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: settingsApi.updateSettings,
    onMutate: async (newSettings) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["settings"] });

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData(["settings"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["settings"], (old: any) => ({
        ...old,
        data: { ...old?.data, ...newSettings },
      }));

      return { previousSettings };
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousSettings) {
        queryClient.setQueryData(["settings"], context.previousSettings);
      }
      toast.error(error?.message || t("updateError"));
    },
    onSuccess: (data) => {
      toast.success(t("settingsUpdated"));
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: settingsApi.changePasswordSetting,
    onSuccess: (data) => {
      toast.success(t("passwordUpdated"));
    },
    onError: (error: any) => {
      toast.error(error?.message || t("updateError"));
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: settingsApi.deleteAccount,
    onSuccess: (data) => {
      toast.success(t("accountDeleted"));
      // Redirect will be handled in the component
    },
    onError: (error: any) => {
      toast.error(error?.message || t("deleteError"));
    },
  });

  // Sign out all devices mutation
  const signOutAllMutation = useMutation({
    mutationFn: settingsApi.signOutAllDevices,
    onSuccess: (data) => {
      toast.success(t("signedOutAll"));
    },
    onError: (error: any) => {
      toast.error(error?.message || t("updateError"));
    },
  });

  // Export data mutation
  const exportDataMutation = useMutation({
    mutationFn: settingsApi.exportUserData,
    onSuccess: (data) => {
      if (data.data) {
        // Create and download the file
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `user-data-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(t("dataExported"));
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || t("exportError"));
    },
  });

  return {
    settings,
    isLoadingSettings,
    settingsError,
    refetchSettings,

    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdatingSettings: updateSettingsMutation.isPending,

    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,

    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeletingAccount: deleteAccountMutation.isPending,

    signOutAll: signOutAllMutation.mutateAsync,
    isSigningOut: signOutAllMutation.isPending,

    exportData: exportDataMutation.mutateAsync,
    isExporting: exportDataMutation.isPending,
  };
};
