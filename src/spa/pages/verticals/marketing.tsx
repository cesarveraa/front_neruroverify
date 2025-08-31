"use client"

import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card"
import { Button } from "../../../shared/ui/button"
import { Badge } from "../../../shared/ui/badge"
import { TrendingUp, BarChart3, Target, Zap, Play, Eye, Plus } from "lucide-react"

export const MarketingPage: React.FC = () => {
  const { t } = useTranslation("verticals")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const templates = [
    {
      id: "landing-page",
      name: "Product Landing Page",
      description: "Convert visitors with a high-impact product showcase",
      image: "/modern-product-landing-page.png",
      category: "Landing Pages",
      features: ["A/B Testing", "Analytics", "Lead Capture"],
      popular: true,
    },
    {
      id: "email-campaign",
      name: "Email Campaign",
      description: "Engage your audience with beautiful email templates",
      image: "/email-marketing-template.png",
      category: "Email Marketing",
      features: ["Responsive Design", "Personalization", "Automation"],
      popular: false,
    },
    {
      id: "social-media",
      name: "Social Media Kit",
      description: "Consistent branding across all social platforms",
      image: "/social-media-marketing-kit.png",
      category: "Social Media",
      features: ["Multi-Platform", "Brand Guidelines", "Content Calendar"],
      popular: true,
    },
    {
      id: "webinar-page",
      name: "Webinar Registration",
      description: "Drive registrations for your next webinar",
      image: "/webinar-registration.png",
      category: "Events",
      features: ["Registration Forms", "Countdown Timer", "Email Reminders"],
      popular: false,
    },
  ]

  const stats = [
    { label: "Conversion Rate", value: "12.5%", icon: Target },
    { label: "Templates", value: "24", icon: BarChart3 },
    { label: "Active Users", value: "2.3k", icon: TrendingUp },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500 text-white">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">{t("marketing.title")}</h1>
            <p className="text-xl text-muted-foreground">{t("marketing.description")}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardContent className="flex items-center gap-3 p-4">
                  <Icon className="h-5 w-5 text-blue-500" />
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
          <h2 className="text-2xl font-semibold">Marketing Templates</h2>
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
                {template.popular && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-yellow-900">Popular</Badge>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button size="sm" variant="secondary" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
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
            <Zap className="h-5 w-5 text-yellow-500" />
            Marketing Features
          </CardTitle>
          <CardDescription>Everything you need to create successful marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(t("marketing.features", { returnObjects: true }) as string[]).map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
