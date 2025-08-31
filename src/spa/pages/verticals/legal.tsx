"use client"

import type React from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card"
import { Button } from "../../../shared/ui/button"
import { Badge } from "../../../shared/ui/badge"
import { Scale, FileText, Shield, Users, Play, Eye, Plus } from "lucide-react"

export const LegalPage: React.FC = () => {
  const { t } = useTranslation("verticals")

  const templates = [
    {
      id: "law-firm",
      name: "Law Firm Website",
      description: "Professional website for legal practices",
      image: "/professional-law-firm-website.png",
      category: "Websites",
      features: ["Attorney Profiles", "Case Studies", "Contact Forms"],
    },
    {
      id: "legal-documents",
      name: "Document Portal",
      description: "Secure client document management system",
      image: "/legal-document-portal.png",
      category: "Portals",
      features: ["Secure Access", "Document Sharing", "E-Signatures"],
    },
    {
      id: "consultation",
      name: "Consultation Booking",
      description: "Schedule legal consultations online",
      image: "/legal-consultation-booking.png",
      category: "Booking",
      features: ["Calendar Integration", "Payment Processing", "Reminders"],
    },
  ]

  const stats = [
    { label: "Client Satisfaction", value: "98%", icon: Users },
    { label: "Templates", value: "18", icon: FileText },
    { label: "Security Rating", value: "A+", icon: Shield },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-purple-500 text-white">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">{t("legal.title")}</h1>
            <p className="text-xl text-muted-foreground">{t("legal.description")}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardContent className="flex items-center gap-3 p-4">
                  <Icon className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Legal Templates</h2>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Custom Template
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-all overflow-hidden">
              <div className="relative">
                <img
                  src={template.image || "/placeholder.svg"}
                  alt={template.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button size="sm" variant="secondary" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </div>
              <CardHeader className="pb-3">
                <Badge variant="outline" className="text-xs w-fit">
                  {template.category}
                </Badge>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Use Template
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            Legal Features
          </CardTitle>
          <CardDescription>Professional tools designed for legal professionals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(t("legal.features", { returnObjects: true }) as string[]).map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
