"use client"
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Lock,
  Bell,
  Shield,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  LogOut,
  Download,
  Eye,
  EyeOff,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import type { User as UserType } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE MY ACCOUNT"),
});

interface AccountSettingsProps {
  user: UserType;
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState("security");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    settings,
    isLoadingSettings,
    settingsError,
    refetchSettings,
    updateSettings,
    isUpdatingSettings,
    changePassword,
    isChangingPassword,
    deleteAccount,
    isDeletingAccount,
    signOutAll,
    isSigningOut,
    exportData,
    isExporting,
  } = useSettings();

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const deleteAccountForm = useForm({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmation: "",
    },
  });

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      passwordForm.reset();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const onDeleteAccount = async (data: z.infer<typeof deleteAccountSchema>) => {
    try {
      await deleteAccount(data);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleSignOutAllDevices = async () => {
    try {
      await signOutAll();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleExportData = async () => {
    try {
      await exportData();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    if (!settings) return;
    
    const newNotifications = { ...settings.notifications, [key]: value };
    updateSettings({ notifications: newNotifications });
  };

  const handlePrivacyChange = (key: string, value: any) => {
    if (!settings) return;
    
    const newPrivacy = { ...settings.privacy, [key]: value };
    updateSettings({ privacy: newPrivacy });
  };

  const handleCommunicationChange = (key: string, value: boolean) => {
    if (!settings) return;
    
    const newCommunication = { ...settings.communication, [key]: value };
    updateSettings({ communication: newCommunication });
  };

  const handleLanguageChange = (value: string) => {
    updateSettings({ language: value });
  };

  const handleTimezoneChange = (value: string) => {
    updateSettings({ timezone: value });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoadingSettings) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading Settings</p>
        </div>
      </div>
    );
  }

  if (settingsError || !settings) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
          <p className="text-destructive">Fetch Error</p>
          <Button onClick={() => refetchSettings()} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-4xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Account Settings
            </h1>
            <p className="text-muted-foreground">Manage Account</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {user.role}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchSettings()}
              disabled={isUpdatingSettings}
              className="gap-2"
            >
              {isUpdatingSettings ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger
              value="danger"
              className="flex items-center gap-2 text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Danger Zone
            </TabsTrigger>
          </TabsList>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Password Change Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Change Password
                </CardTitle>
                <CardDescription>Password Description</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        {...passwordForm.register("currentPassword")}
                        className="pr-10"
                        disabled={isChangingPassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        disabled={isChangingPassword}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        {...passwordForm.register("newPassword")}
                        className="pr-10"
                        disabled={isChangingPassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={isChangingPassword}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        {...passwordForm.register("confirmPassword")}
                        className="pr-10"
                        disabled={isChangingPassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isChangingPassword}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isChangingPassword} 
                    className="gap-2"
                  >
                    {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isChangingPassword ? "Updating" : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Two Factor Auth
                </CardTitle>
                <CardDescription>Two Factor Description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Authenticator App</p>
                      <p className="text-sm text-muted-foreground">
                        Authenticator Description
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Not Enabled
                  </Badge>
                </div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2 w-full">
                      <CheckCircle className="w-4 h-4" />
                      Enable 2FA
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Setup 2FA</SheetTitle>
                      <SheetDescription>
                        Setup 2FA Description
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      <div className="p-4 border rounded-lg text-center">
                        <div className="w-32 h-32 bg-muted mx-auto mb-4 flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">
                            QR Code
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Scan QR Code
                        </p>
                      </div>
                      <Input
                        placeholder="Enter Verification Code"
                        className="text-center"
                      />
                      <Button className="w-full">Verify And Enable</Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </CardContent>
            </Card>

            {/* Session Management Card */}
            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
                <CardDescription>Session Description</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-muted-foreground">
                          Active now • This device
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Current
                    </Badge>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full gap-2">
                        <LogOut className="w-4 h-4" />
                        Sign Out All Devices
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sign Out All Confirm</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sign Out All Description
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleSignOutAllDevices}
                          className="gap-2"
                          disabled={isSigningOut}
                        >
                          {isSigningOut && <Loader2 className="w-4 h-4 animate-spin" />}
                          Confirm Sign Out
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Notification Description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">
                            {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {key.charAt(0).toUpperCase() + key.slice(1)} Notifications Description
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) =>
                            handleNotificationChange(key, checked)
                          }
                          disabled={isUpdatingSettings}
                        />
                      </div>
                      {isUpdatingSettings && (
                        <Loader2 className="w-4 h-4 animate-spin ml-1 mt-2" />
                      )}
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={handleLanguageChange}
                      disabled={isUpdatingSettings}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={handleTimezoneChange}
                      disabled={isUpdatingSettings}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">
                          Eastern Time (ET)
                        </SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          Pacific Time (PT)
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          London (GMT)
                        </SelectItem>
                        <SelectItem value="Europe/Paris">
                          Paris (CET)
                        </SelectItem>
                        <SelectItem value="Asia/Dubai">
                          Dubai (GST)
                        </SelectItem>
                        <SelectItem value="Asia/Tokyo">
                          Tokyo (JST)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Privacy Description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profileVisibility">
                      Profile Visibility
                    </Label>
                    <Select
                      value={settings.privacy.profileVisibility}
                      onValueChange={(value: "public" | "private" | "connections") =>
                        handlePrivacyChange("profileVisibility", value)
                      }
                      disabled={isUpdatingSettings}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="connections">
                          Connections Only
                        </SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {settings.privacy.profileVisibility === "public" &&
                        "Public Description"}
                      {settings.privacy.profileVisibility === "connections" &&
                        "Connections Description"}
                      {settings.privacy.profileVisibility === "private" &&
                        "Private Description"}
                    </p>
                  </div>

                  <Separator />

                  {Object.entries(settings.privacy)
                    .filter(([key]) => key !== "profileVisibility")
                    .map(([key, value]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                            <p className="text-sm text-muted-foreground">
                              {key.charAt(0).toUpperCase() + key.slice(1)} Description
                            </p>
                          </div>
                          <Switch
                            checked={value as boolean}
                            onCheckedChange={(checked) =>
                              handlePrivacyChange(key, checked)
                            }
                            disabled={isUpdatingSettings}
                          />
                        </div>
                        {isUpdatingSettings && (
                          <Loader2 className="w-4 h-4 animate-spin ml-1 mt-2" />
                        )}
                        <Separator className="mt-4" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
                <CardDescription>
                  Communication Description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.communication).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                        <p className="text-sm text-muted-foreground">
                          {key.charAt(0).toUpperCase() + key.slice(1)} Description
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) =>
                          handleCommunicationChange(key, checked)
                        }
                        disabled={isUpdatingSettings}
                      />
                    </div>
                    {isUpdatingSettings && (
                      <Loader2 className="w-4 h-4 animate-spin ml-1 mt-2" />
                    )}
                    <Separator className="mt-4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <Trash2 className="w-5 h-5 mr-2" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Danger Zone Description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data Export */}
                <div className="p-4 border border-yellow-500/50 rounded-lg bg-yellow-500/5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-yellow-700 mb-2">
                        Export Data
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Export Data Description
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-yellow-500 text-yellow-700 gap-2"
                        onClick={handleExportData}
                        disabled={isExporting}
                      >
                        {isExporting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Export Data
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Account Deletion */}
                <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-destructive mb-2">
                        Delete Account
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Delete Account Description
                      </p>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-destructive">
                              Delete Account Confirmation
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete Account Warning
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <form
                            onSubmit={deleteAccountForm.handleSubmit(
                              onDeleteAccount
                            )}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <Label
                                htmlFor="confirmation"
                                className="text-sm font-medium"
                              >
                                Type Confirmation
                              </Label>
                              <Input
                                id="confirmation"
                                placeholder="DELETE MY ACCOUNT"
                                {...deleteAccountForm.register("confirmation")}
                                disabled={isDeletingAccount}
                              />
                              {deleteAccountForm.formState.errors
                                .confirmation && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                  <AlertCircle className="w-4 h-4" />
                                  {
                                    deleteAccountForm.formState.errors
                                      .confirmation.message
                                  }
                                </p>
                              )}
                            </div>

                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isDeletingAccount}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  type="submit"
                                  variant="destructive"
                                  disabled={isDeletingAccount}
                                  className="gap-2"
                                >
                                  {isDeletingAccount && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  )}
                                  Confirm Delete
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </form>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}