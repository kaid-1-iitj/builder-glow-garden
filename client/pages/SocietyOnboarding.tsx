import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Building2,
  Users,
  Plus,
  LogOut,
  CheckCircle,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  Globe,
  UserPlus,
} from "lucide-react";

interface Society {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: string;
}

export default function SocietyOnboarding() {
  const { user, logout, token } = useAuth();
  const [activeTab, setActiveTab] = useState("create-society");

  // Society form state
  const [societyForm, setSocietyForm] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    registrationNumber: "",
    phone: "",
    email: "",
    website: "",
  });

  // User form state
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "society_user",
    societyId: "",
    canWrite: true,
  });

  const [societies, setSocieties] = useState<Society[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              Only system administrators can access society onboarding.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSocietySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/societies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: societyForm.name,
          address: {
            street: societyForm.street,
            city: societyForm.city,
            state: societyForm.state,
            zipCode: societyForm.zipCode,
            country: societyForm.country,
          },
          registrationNumber: societyForm.registrationNumber || undefined,
          contactInfo: {
            phone: societyForm.phone || undefined,
            email: societyForm.email || undefined,
            website: societyForm.website || undefined,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create society");
      }

      setSuccess("Society created successfully!");

      // Reset form
      setSocietyForm({
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
        registrationNumber: "",
        phone: "",
        email: "",
        website: "",
      });

      // Add to societies list for user creation
      setSocieties((prev) => [...prev, data.society]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create society");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/societies/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          societyId: userForm.societyId,
          permissions: {
            canRead: true,
            canWrite: userForm.canWrite,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setSuccess(
        `User created successfully! Temporary password: ${data.temporaryPassword}`,
      );

      // Reset form
      setUserForm({
        name: "",
        email: "",
        role: "society_user",
        societyId: "",
        canWrite: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadSocieties = async () => {
    try {
      const response = await fetch("/api/societies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSocieties(data.societies);
      }
    } catch (error) {
      console.error("Failed to load societies:", error);
    }
  };

  // Load societies when switching to user creation tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError("");
    setSuccess("");

    if (value === "create-user") {
      loadSocieties();
    }
  };

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
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <Badge variant="default" className="text-xs">
                  Administrator
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Society Onboarding</h2>
            <p className="text-muted-foreground">
              Create new societies and set up their initial users
            </p>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="create-society"
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Create Society
              </TabsTrigger>
              <TabsTrigger
                value="create-user"
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Create User
              </TabsTrigger>
            </TabsList>

            {/* Create Society Tab */}
            <TabsContent value="create-society">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Register New Society
                  </CardTitle>
                  <CardDescription>
                    Add a new society to the platform with all required details
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSocietySubmit} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Basic Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="societyName">Society Name *</Label>
                          <Input
                            id="societyName"
                            placeholder="e.g., Green Valley Residents Association"
                            value={societyForm.name}
                            onChange={(e) =>
                              setSocietyForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="registrationNumber">
                            Registration Number
                          </Label>
                          <Input
                            id="registrationNumber"
                            placeholder="e.g., REG001"
                            value={societyForm.registrationNumber}
                            onChange={(e) =>
                              setSocietyForm((prev) => ({
                                ...prev,
                                registrationNumber: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </h3>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="street">Street Address *</Label>
                          <Input
                            id="street"
                            placeholder="Building number, street name"
                            value={societyForm.street}
                            onChange={(e) =>
                              setSocietyForm((prev) => ({
                                ...prev,
                                street: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              placeholder="e.g., Mumbai"
                              value={societyForm.city}
                              onChange={(e) =>
                                setSocietyForm((prev) => ({
                                  ...prev,
                                  city: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="state">State *</Label>
                            <Input
                              id="state"
                              placeholder="e.g., Maharashtra"
                              value={societyForm.state}
                              onChange={(e) =>
                                setSocietyForm((prev) => ({
                                  ...prev,
                                  state: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="zipCode">ZIP Code *</Label>
                            <Input
                              id="zipCode"
                              placeholder="e.g., 400001"
                              value={societyForm.zipCode}
                              onChange={(e) =>
                                setSocietyForm((prev) => ({
                                  ...prev,
                                  zipCode: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Contact Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              id="phone"
                              placeholder="+91-9876543210"
                              value={societyForm.phone}
                              onChange={(e) =>
                                setSocietyForm((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="societyEmail">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              id="societyEmail"
                              type="email"
                              placeholder="contact@society.org"
                              value={societyForm.email}
                              onChange={(e) =>
                                setSocietyForm((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              id="website"
                              placeholder="www.society.org"
                              value={societyForm.website}
                              onChange={(e) =>
                                setSocietyForm((prev) => ({
                                  ...prev,
                                  website: e.target.value,
                                }))
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Creating Society..." : "Create Society"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Create User Tab */}
            <TabsContent value="create-user">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Create Society User
                  </CardTitle>
                  <CardDescription>
                    Add users (Managers, Treasurers, Agents) to societies
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleUserSubmit} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription className="whitespace-pre-line">
                          {success}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="userName">Full Name *</Label>
                        <Input
                          id="userName"
                          placeholder="e.g., John Smith"
                          value={userForm.name}
                          onChange={(e) =>
                            setUserForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="userEmail">Email Address *</Label>
                        <Input
                          id="userEmail"
                          type="email"
                          placeholder="john@society.org"
                          value={userForm.email}
                          onChange={(e) =>
                            setUserForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="userRole">Role *</Label>
                        <Select
                          value={userForm.role}
                          onValueChange={(value) =>
                            setUserForm((prev) => ({ ...prev, role: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="society_user">
                              Society User (Manager/Treasurer/Secretary)
                            </SelectItem>
                            <SelectItem value="agent">
                              Processing Agent
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="userSociety">Society *</Label>
                        <Select
                          value={userForm.societyId}
                          onValueChange={(value) =>
                            setUserForm((prev) => ({
                              ...prev,
                              societyId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select society" />
                          </SelectTrigger>
                          <SelectContent>
                            {societies.map((society) => (
                              <SelectItem key={society._id} value={society._id}>
                                {society.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Permissions</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="canWrite"
                          checked={userForm.canWrite}
                          onChange={(e) =>
                            setUserForm((prev) => ({
                              ...prev,
                              canWrite: e.target.checked,
                            }))
                          }
                          className="rounded"
                        />
                        <Label htmlFor="canWrite" className="text-sm">
                          Can create and edit transactions (recommended for
                          Managers)
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        All users can read data by default. Agents always have
                        write permissions for their assigned transactions.
                      </p>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        A temporary password will be generated and shown to you.
                        The user should change it on first login.
                      </AlertDescription>
                    </Alert>

                    <Button
                      type="submit"
                      disabled={isSubmitting || !userForm.societyId}
                      className="w-full"
                    >
                      {isSubmitting ? "Creating User..." : "Create User"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
