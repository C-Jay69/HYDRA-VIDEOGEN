"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, X, Sparkles, Zap, Building2 } from "lucide-react";

const plans = [
  {
    name: "Free",
    icon: Sparkles,
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Perfect for getting started",
    features: [
      { text: "5 exports/month", included: true },
      { text: "720p quality", included: true },
      { text: "Basic templates", included: true },
      { text: "Watermark", included: true },
      { text: "Limited AI features", included: true },
      { text: "All templates", included: false },
      { text: "No watermark", included: false },
      { text: "Full AI access", included: false },
      { text: "Priority support", included: false },
      { text: "4K quality", included: false },
      { text: "Team collaboration", included: false },
      { text: "Brand kit", included: false },
      { text: "API access", included: false },
      { text: "Dedicated support", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    icon: Zap,
    monthlyPrice: 25,
    annualPrice: 250,
    description: "Best for creators and professionals",
    features: [
      { text: "Unlimited exports", included: true },
      { text: "1080p quality", included: true },
      { text: "All templates", included: true },
      { text: "No watermark", included: true },
      { text: "Full AI access", included: true },
      { text: "Priority support", included: true },
      { text: "4K quality", included: false },
      { text: "Team collaboration", included: false },
      { text: "Brand kit", included: false },
      { text: "API access", included: false },
      { text: "Dedicated support", included: false },
    ],
    cta: "Get Pro",
    popular: true,
  },
  {
    name: "Business",
    icon: Building2,
    monthlyPrice: 60,
    annualPrice: 600,
    description: "For teams and enterprises",
    features: [
      { text: "Unlimited exports", included: true },
      { text: "4K quality", included: true },
      { text: "All templates", included: true },
      { text: "No watermark", included: true },
      { text: "Full AI access", included: true },
      { text: "Priority support", included: true },
      { text: "Team collaboration", included: true },
      { text: "Brand kit (5 presets)", included: true },
      { text: "API access", included: true },
      { text: "Dedicated support", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const comparisonFeatures = [
  { name: "Exports", free: "5/month", pro: "Unlimited", business: "Unlimited" },
  { name: "Video Quality", free: "720p", pro: "1080p", business: "4K" },
  { name: "Templates", free: "Basic", pro: "All", business: "All" },
  { name: "Watermark", free: true, pro: false, business: false },
  { name: "AI Features", free: "Limited", pro: "Full", business: "Full" },
  { name: "Support", free: "Community", pro: "Priority", business: "Dedicated" },
  { name: "Team Collaboration", free: false, pro: false, business: true },
  { name: "Brand Kit", free: false, pro: false, business: "5 presets" },
  { name: "API Access", free: false, pro: false, business: true },
];

const faqs = [
  {
    question: "Can I switch plans anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the difference.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor Stripe.",
  },
  {
    question: "Is there a free trial for Pro or Business?",
    answer: "Yes! We offer a 14-day free trial for both Pro and Business plans. No credit card required to start.",
  },
  {
    question: "What happens to my exports if I downgrade?",
    answer: "Your existing exports remain accessible. However, future exports will be limited by your new plan's quota.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Absolutely. You can cancel your subscription at any time. You'll retain access until the end of your current billing period.",
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Annual
            </span>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Save 2 months
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const perMonth = isAnnual ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;

            return (
              <Card
                key={plan.name}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? "border-primary/50 shadow-lg shadow-primary/10 scale-105"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-accent h-1" />
                )}
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto mb-4 p-3 rounded-full w-fit ${
                    plan.popular ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <Icon className={`w-6 h-6 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">${perMonth}</span>
                    {price > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                    {isAnnual && plan.monthlyPrice > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Billed ${price}/year
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 text-left mb-8">
                    {plan.features.filter(f => f.included).slice(0, 6).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{feature.text}</span>
                      </li>
                    ))}
                    {plan.features.filter(f => f.included).length > 6 && (
                      <li className="text-sm text-muted-foreground">
                        + {plan.features.filter(f => f.included).length - 6} more features
                      </li>
                    )}
                  </ul>

                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className={`w-full ${
                      plan.popular ? "bg-primary hover:bg-primary/90" : ""
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-primary bg-primary/5">Pro</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Business</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="py-4 px-4 text-foreground">{feature.name}</td>
                    <td className="text-center py-4 px-4">
                      {typeof feature.free === "boolean" ? (
                        feature.free ? (
                          <Check className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-muted-foreground">{feature.free}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4 bg-primary/5">
                      {typeof feature.pro === "boolean" ? (
                        feature.pro ? (
                          <Check className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-foreground font-medium">{feature.pro}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {typeof feature.business === "boolean" ? (
                        feature.business ? (
                          <Check className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-foreground">{feature.business}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact Sales CTA */}
        <div className="text-center bg-muted/50 rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Looking for enterprise features, custom integrations, or volume discounts?
            Our sales team is here to help.
          </p>
          <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}
