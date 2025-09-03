import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  FileText,
  Plus,
  Settings,
  LogOut,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";

export default function Dashboard() {
  const { user, logout, token } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [token]);

  const fetchDashboardStats = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // This should be handled by route protection
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'System Administrator';
      case 'society_user':
        return 'Society Manager';
      case 'agent':
        return 'Processing Agent';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'society_user':
        return 'secondary';
      case 'agent':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const currentStats = dashboardStats || {};

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
              <p className="text-xs text-muted-foreground">Management Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {getRoleDisplayName(user.role)}
                </Badge>
                {user.societyId && (
                  <Badge variant="outline">
                    <Building2 className="h-3 w-3 mr-1" />
                    {user.societyId.name}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {user?.role === 'admin' && (
                <Button onClick={() => window.location.href = '/admin/societies'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Societies
                </Button>
              )}
              <Button onClick={() => window.location.href = '/transactions'}>
                <FileText className="h-4 w-4 mr-2" />
                {user?.role === 'society_user' ? 'My Transactions' : 'Transactions'}
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user.role === 'admin' && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Societies</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentStats.totalSocieties || 0}</div>
                  <p className="text-xs text-muted-foreground">Active societies</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentStats.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">Across all societies</p>
                </CardContent>
              </Card>
            </>
          )}

          {user.role === 'society_user' && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Transactions</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentStats.myTransactions || 0}</div>
                  <p className="text-xs text-muted-foreground">Total submitted</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentStats.pendingTransactions || 0}</div>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </CardContent>
              </Card>
            </>
          )}

          {user.role === 'agent' && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assigned</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentStats.assignedTransactions || 0}</div>
                  <p className="text-xs text-muted-foreground">Total assigned</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentStats.pendingReview || 0}</div>
                  <p className="text-xs text-muted-foreground">Require action</p>
                </CardContent>
              </Card>
            </>
          )}
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.role === 'admin' && ((currentStats.totalTransactions || 0) - (currentStats.pendingTransactions || 0))}
                {user.role === 'society_user' && (currentStats.completedTransactions || 0)}
                {user.role === 'agent' && (currentStats.completedToday || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {user.role === 'agent' ? 'Today' : 'All time'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.role === 'agent' ? (currentStats.avgProcessingTime || 'N/A') : '98%'}
              </div>
              <p className="text-xs text-muted-foreground">
                {user.role === 'agent' ? 'Avg processing time' : 'Success rate'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest transactions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <div className="bg-primary/10 rounded-full p-2">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New transaction submitted</p>
                  <p className="text-xs text-muted-foreground">Transaction #12345 by Society A - 2 hours ago</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <div className="bg-green-100 rounded-full p-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Transaction completed</p>
                  <p className="text-xs text-muted-foreground">Transaction #12340 marked as completed - 4 hours ago</p>
                </div>
                <Badge variant="default">Completed</Badge>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <div className="bg-yellow-100 rounded-full p-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Clarification requested</p>
                  <p className="text-xs text-muted-foreground">Transaction #12338 needs additional info - 6 hours ago</p>
                </div>
                <Badge variant="secondary">Action Required</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
