import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Star, Zap } from 'lucide-react';

export default function Upgrade() {
  const navigate = useNavigate();
  const { trialExpired, trialEndsAt, role } = useAuth();

  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for individuals getting started',
      features: [
        'Up to 5 webinars',
        '100 attendees per webinar',
        'Basic analytics',
        'Email support',
      ],
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      description: 'Best for growing businesses',
      features: [
        'Unlimited webinars',
        '500 attendees per webinar',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'API access',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      description: 'For large organizations',
      features: [
        'Everything in Professional',
        'Unlimited attendees',
        'Dedicated account manager',
        'Custom integrations',
        'SSO/SAML',
        'SLA guarantee',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/laboratory')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {trialExpired ? 'Your Trial Has Expired' : 'Upgrade Your Plan'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {trialExpired
              ? 'Upgrade now to continue using all features and unlock your full potential.'
              : 'Choose the plan that best fits your needs and unlock powerful features.'}
          </p>
          {!trialExpired && trialEndsAt && role === 'trial' && (
            <p className="mt-4 text-sm text-muted-foreground">
              Your trial ends on {trialEndsAt.toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map(plan => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include a 30-day money-back guarantee.
          </p>
        </div>
      </main>
    </div>
  );
}
