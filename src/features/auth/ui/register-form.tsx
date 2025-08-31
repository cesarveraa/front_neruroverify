"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "../../../shared/ui/button"
import { Input } from "../../../shared/ui/input"
import { Label } from "../../../shared/ui/label"
import { useAuthStore } from "../model/store"
import { registerSchema, type RegisterFormData } from "../lib/validation"
import { useTranslation } from "react-i18next"

export const RegisterForm: React.FC = () => {
  const { t } = useTranslation("auth")
  const { registerEmail, loading, error } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    await registerEmail(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">{t("register.displayName")}</Label>
        <Input id="displayName" type="text" {...register("displayName")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("register.email")}</Label>
        <Input id="email" type="email" {...register("email")} className={errors.email ? "border-destructive" : ""} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("register.password")}</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          className={errors.password ? "border-destructive" : ""}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t("common.loading") : t("register.submit")}
      </Button>
    </form>
  )
}
