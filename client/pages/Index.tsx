import { LoginForm } from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  FileText,
  Shield,
  CheckCircle,
  Clock,
  TrendingUp,
  Bell,
  ArrowRight,
  Star,
} from "lucide-react";

export default function Index() {
  const features = [
    {
      icon: Users,
      title: "Multi-Role Management",
      description:
        "Admins, Society Users, and Agents with tailored permissions and workflows.",
    },
    {
      icon: FileText,
      title: "Transaction Tracking",
      description:
        "Complete lifecycle management with status updates and audit trails.",
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "JWT-based security with role-based access control.",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description:
        "Automated email alerts for status changes and important updates.",
    },
    {
      icon: TrendingUp,
      title: "Comprehensive Reporting",
      description:
        "Generate detailed reports by status, date range, and society.",
    },
    {
      icon: CheckCircle,
      title: "Workflow Management",
      description: "Clear status progression from pending to completion.",
    },
  ];

  const workflowSteps = [
    {
      step: "1",
      title: "Society Creates Transaction",
      description: "Submit vendor details, nature, and attachments",
    },
    {
      step: "2",
      title: "Agent Review",
      description: "Assigned agent reviews and processes",
    },
    {
      step: "3",
      title: "Clarification (if needed)",
      description: "Request additional information",
    },
    {
      step: "4",
      title: "Completion",
      description: "Transaction finalized and recorded",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary rounded-lg p-2">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SocietyHub</h1>
              <p className="text-xs text-muted-foreground">
                Management Platform
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="hidden sm:flex">
              <Star className="h-3 w-3 mr-1" />
              Production Ready
            </Badge>
            <Button variant="outline" size="sm">
              Learn More
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="w-fit">
                <CheckCircle className="h-3 w-3 mr-1" />
                Full-Stack Solution
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Modern Society
                <span className="text-primary block">Management</span>
                Platform
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Streamline your society operations with role-based access,
                transaction tracking, automated workflows, and comprehensive
                reporting. Built for transparency and efficiency.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="px-8">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                View Demo
              </Button>
            </div>

            <div className="flex items-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Multi-Role Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Secure & Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>

          <div className="lg:pl-8">
            <LoginForm />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="w-fit mx-auto">
              Key Features
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Everything you need to manage your society
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From user management to transaction tracking, our platform
              provides all the tools your society needs to operate efficiently
              and transparently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="bg-primary/10 rounded-lg p-2 w-fit">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="w-fit mx-auto">
              How It Works
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Streamlined Transaction Workflow
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our system guides every transaction through a clear, auditable
              process from creation to completion.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {workflowSteps.map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto">
                  {step.step}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-border transform translate-x-12" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary rounded-lg p-2">
                  <Building2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold">SocietyHub</h3>
                  <p className="text-sm text-muted-foreground">
                    Management Platform
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">
                Empowering societies with modern management tools and
                transparent workflows.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Features</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>User Management</div>
                <div>Transaction Tracking</div>
                <div>Workflow Automation</div>
                <div>Reporting & Analytics</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">User Roles</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>System Administrator</div>
                <div>Society Manager</div>
                <div>Treasurer & Secretary</div>
                <div>Processing Agent</div>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; 2024 SocietyHub. Built for transparent society management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
