"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "../../../shared/ui/button"
import { Input } from "../../../shared/ui/input"
import { Label } from "../../../shared/ui/label"
import { useAuthStore } from "../model/store"
import { loginSchema, type LoginFormData } from "../lib/validation"
import { useTranslation } from "react-i18next"

export const LoginForm: React.FC = () => {
  const { t } = useTranslation("auth")
  const { loginEmail, loading, error } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    await loginEmail(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t("login.email")}</Label>
        <Input id="email" type="email" {...register("email")} className={errors.email ? "border-destructive" : ""} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("login.password")}</Label>
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
        {loading ? t("common.loading") : t("login.submit")}
      </Button>
    </form>
  )
}
