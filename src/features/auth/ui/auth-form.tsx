"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card"
import { Button } from "../../../shared/ui/button"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"
import { GoogleButton } from "./google-button"
import { useTranslation } from "react-i18next"

type AuthMode = "login" | "register"

export const AuthForm: React.FC = () => {
  const { t } = useTranslation("auth")
  const [mode, setMode] = useState<AuthMode>("login")

  const isLogin = mode === "login"

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{isLogin ? t("login.title") : t("register.title")}</CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Enter your credentials to access your account" : "Create a new account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}

          <div className="text-center">
            <Button variant="link" onClick={() => setMode(isLogin ? "register" : "login")} className="text-sm">
              {isLogin ? t("login.switchToRegister") : t("register.switchToLogin")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
