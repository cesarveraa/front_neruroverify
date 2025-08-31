"use client"

import type React from "react"
import { useTranslation } from "react-i18next"
import { ProfileForm } from "../../../features/profile/ui/profile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card"
import { Shield, Key, Bell, Trash2 } from "lucide-react"
import { Button } from "../../../shared/ui/button"

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation("profile")

  const securityOptions = [
    {
      title: "Password",
      description: "Change your account password",
      icon: Key,
      action: "Change Password",
    },
    {
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security",
      icon: Shield,
      action: "Enable 2FA",
    },
    {
      title: "Notifications",
      description: "Manage your notification preferences",
      icon: Bell,
      action: "Manage",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfileForm />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Security</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {securityOptions.map((option, index) => {
                const Icon = option.icon
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{option.title}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {option.action}
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div className="flex items-center gap-3 mb-2">
                    <Trash2 className="h-5 w-5 text-destructive" />
                    <p className="font-medium text-sm">Delete Account</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Permanently delete your account and all associated data
                  </p>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
