"use client"

import type React from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card"
import { Button } from "../../../shared/ui/button"
import { Badge } from "../../../shared/ui/badge"
import { UtensilsCrossed, Star, Clock, MapPin, Play, Eye, Plus } from "lucide-react"

export const RestaurantPage: React.FC = () => {
  const { t } = useTranslation("verticals")

  const templates = [
    {
      id: "fine-dining",
      name: "Fine Dining Menu",
      description: "Elegant menu showcase for upscale restaurants",
      image: "/elegant-fine-dining-restaurant-menu.png",
      category: "Menus",
      features: ["Photo Gallery", "Wine Pairing", "Reservations"],
      popular: true,
    },
    {
      id: "food-delivery",
      name: "Food Delivery",
      description: "Online ordering system for delivery services",
      image: "/food-delivery-app-interface.png",
      category: "Delivery",
      features: ["Online Ordering", "Payment Gateway", "Tracking"],
    },
    {
      id: "cafe-bistro",
      name: "Cafe & Bistro",
      description: "Cozy atmosphere for casual dining establishments",
      image: "/cozy-cafe-bistro-website.png",
      category: "Casual Dining",
      features: ["Event Booking", "Loyalty Program", "Social Media"],
    },
  ]

  const stats = [
    { label: "Average Rating", value: "4.8★", icon: Star },
    { label: "Templates", value: "28", icon: UtensilsCrossed },
    { label: "Avg. Load Time", value: "1.2s", icon: Clock },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-orange-500 text-white">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">{t("restaurant.title")}</h1>
            <p className="text-xl text-muted-foreground">{t("restaurant.description")}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardContent className="flex items-center gap-3 p-4">
                  <Icon className="h-5 w-5 text-orange-500" />
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
          <h2 className="text-2xl font-semibold">Restaurant Templates</h2>
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
            <MapPin className="h-5 w-5 text-orange-500" />
            Restaurant Features
          </CardTitle>
          <CardDescription>Everything you need to showcase your culinary business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(t("restaurant.features", { returnObjects: true }) as string[]).map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
