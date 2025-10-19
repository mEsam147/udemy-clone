import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/api-client"
import { AccountSettings } from "@/components/settings/account-settings"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-background">
      <AccountSettings user={user} />
    </div>
  )
}
