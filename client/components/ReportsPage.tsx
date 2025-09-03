import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Building2
} from "lucide-react";

interface ReportData {
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  clarificationTransactions: number;
  totalAmount: number;
  avgProcessingTime: string;
  topVendors: Array<{
    vendorName: string;
    count: number;
    totalAmount: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    count: number;
    amount: number;
  }>;
}

export default function ReportsPage() {
  const { user, token } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    societyId: user?.role === 'admin' ? 'all' : user?.societyId?._id || ''
  });

  const generateReport = async () => {
    if (!token) return;

    setLoading(true);
    try {
      // For demo purposes, generate mock report data
      // In production, this would call an API endpoint
      const mockReportData: ReportData = {
        totalTransactions: 145,
        completedTransactions: 98,
        pendingTransactions: 32,
        clarificationTransactions: 15,
        totalAmount: 2450000,
        avgProcessingTime: '2.3 days',
        topVendors: [
          { vendorName: 'ABC Maintenance Services', count: 24, totalAmount: 485000 },
          { vendorName: 'XYZ Security Agency', count: 18, totalAmount: 360000 },
          { vendorName: 'DEF Electrical Works', count: 15, totalAmount: 295000 },
          { vendorName: 'GHI Cleaning Services', count: 12, totalAmount: 180000 },
          { vendorName: 'JKL Water Supply', count: 10, totalAmount: 150000 }
        ],
        statusDistribution: [
          { status: 'Completed', count: 98, percentage: 67.6 },
          { status: 'Pending on Agent', count: 32, percentage: 22.1 },
          { status: 'Needs Clarification', count: 15, percentage: 10.3 }
        ],
        monthlyTrends: [
          { month: 'Jan', count: 18, amount: 350000 },
          { month: 'Feb', count: 22, amount: 420000 },
          { month: 'Mar', count: 19, amount: 380000 },
          { month: 'Apr', count: 25, amount: 485000 },
          { month: 'May', count: 28, amount: 520000 },
          { month: 'Jun', count: 33, amount: 295000 }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setReportData(mockReportData);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Transactions', reportData.totalTransactions],
      ['Completed Transactions', reportData.completedTransactions],
      ['Pending Transactions', reportData.pendingTransactions],
      ['Clarification Required', reportData.clarificationTransactions],
      ['Total Amount (₹)', reportData.totalAmount],
      ['Average Processing Time', reportData.avgProcessingTime],
      [''],
      ['Top Vendors'],
      ['Vendor Name', 'Transaction Count', 'Total Amount (₹)'],
      ...reportData.topVendors.map(vendor => [vendor.vendorName, vendor.count, vendor.totalAmount])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `society-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Transaction Reports</h2>
        <p className="text-muted-foreground">
          Generate comprehensive reports on transaction activities and performance
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
          <CardDescription>
            Configure the parameters for your report
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Transaction Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending_on_agent">Pending on Agent</SelectItem>
                  <SelectItem value="pending_for_clarification">Needs Clarification</SelectItem>
                  <SelectItem value="pending_on_society">Pending on Society</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {user?.role === 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="society">Society</Label>
                <Select value={filters.societyId} onValueChange={(value) => setFilters(prev => ({ ...prev, societyId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All societies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Societies</SelectItem>
                    {/* In production, populate with actual societies */}
                    <SelectItem value="society1">Green Valley Residents</SelectItem>
                    <SelectItem value="society2">Sunrise Heights Society</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button onClick={generateReport} disabled={loading}>
              <BarChart3 className="h-4 w-4 mr-2" />
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
            
            {reportData && (
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Generating your report...</p>
          </CardContent>
        </Card>
      )}

      {reportData && !loading && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalTransactions}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{reportData.completedTransactions}</div>
                <p className="text-xs text-muted-foreground">
                  {((reportData.completedTransactions / reportData.totalTransactions) * 100).toFixed(1)}% completion rate
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(reportData.totalAmount)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.avgProcessingTime}</div>
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Breakdown of transactions by current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.statusDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{item.status}</Badge>
                      <span className="text-sm">{item.count} transactions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Vendors */}
          <Card>
            <CardHeader>
              <CardTitle>Top Vendors</CardTitle>
              <CardDescription>Vendors with the highest transaction volumes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.topVendors.map((vendor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{vendor.vendorName}</p>
                      <p className="text-sm text-muted-foreground">{vendor.count} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(vendor.totalAmount)}</p>
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Transaction volume and amount trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {reportData.monthlyTrends.map((month, index) => (
                  <div key={index} className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">{month.month}</p>
                    <p className="text-lg font-bold">{month.count}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(month.amount)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
