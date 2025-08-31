"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../../../shared/ui/button"
import { Input } from "../../../shared/ui/input"
import { Label } from "../../../shared/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card"
import { useAuthStore } from "../../auth/model/store"
import { postUpdateProfile } from "../../../shared/lib/api"
import { useTranslation } from "react-i18next"
import { User, Mail, Camera, Save } from "lucide-react"

const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(50, "Display name is too long"),
  photoURL: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
})

type ProfileFormData = z.infer<typeof profileSchema>

export const ProfileForm: React.FC = () => {
  const { t } = useTranslation("profile")
  const { user, fetchMe } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      photoURL: user?.photoURL || "",
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      await postUpdateProfile({
        displayName: data.displayName,
        photoURL: data.photoURL || undefined,
      })
      await fetchMe()
      setMessage({ type: "success", text: t("success") })
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || t("error") })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return "U"
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex items-center gap-6">
          <div className="relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL || "/placeholder.svg"}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-semibold border-2 border-border">
                {getInitials(user?.displayName, user?.email)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-background border-2 border-border">
              <Camera className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">{user?.displayName || "No name set"}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {user?.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">{t("form.email")}</Label>
              <Input id="email" type="email" value={user?.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">{t("form.displayName")}</Label>
              <Input
                id="displayName"
                {...register("displayName")}
                className={errors.displayName ? "border-destructive" : ""}
                placeholder="Enter your full name"
              />
              {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoURL">{t("form.photoURL")}</Label>
            <Input
              id="photoURL"
              {...register("photoURL")}
              className={errors.photoURL ? "border-destructive" : ""}
              placeholder="https://example.com/your-photo.jpg"
            />
            {errors.photoURL && <p className="text-sm text-destructive">{errors.photoURL.message}</p>}
            <p className="text-xs text-muted-foreground">Enter a URL to your profile picture</p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" disabled={isLoading || !isDirty} className="w-full md:w-auto">
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t("form.save")}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
