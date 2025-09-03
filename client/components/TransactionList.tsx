import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User,
  Building2,
  Search,
  Filter
} from "lucide-react";

interface Transaction {
  _id: string;
  vendorName: string;
  nature: string;
  amount?: number;
  status: 'pending_on_society' | 'pending_on_agent' | 'pending_for_clarification' | 'completed';
  createdBy: string;
  societyId: string;
  assignedToAgent?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface TransactionListProps {
  onViewTransaction?: (transaction: Transaction) => void;
  onCreateNew?: () => void;
}

const statusConfig = {
  'pending_on_society': {
    label: 'Pending on Society',
    variant: 'secondary' as const,
    icon: Clock,
    color: 'text-yellow-600'
  },
  'pending_on_agent': {
    label: 'Pending on Agent',
    variant: 'default' as const,
    icon: User,
    color: 'text-blue-600'
  },
  'pending_for_clarification': {
    label: 'Needs Clarification',
    variant: 'destructive' as const,
    icon: AlertCircle,
    color: 'text-orange-600'
  },
  'completed': {
    label: 'Completed',
    variant: 'outline' as const,
    icon: CheckCircle,
    color: 'text-green-600'
  }
};

export function TransactionList({ onViewTransaction, onCreateNew }: TransactionListProps) {
  const { user, token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter]);

  const fetchTransactions = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.nature.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-muted-foreground">
            {user?.role === 'admin' ? 'All transactions across societies' :
             user?.role === 'society_user' ? 'Your society transactions' :
             'Assigned transactions'}
          </p>
        </div>
        
        {user?.role === 'society_user' && user?.permissions.canWrite && (
          <Button onClick={onCreateNew}>
            <FileText className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by vendor name or nature..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending_on_society">Pending on Society</SelectItem>
            <SelectItem value="pending_on_agent">Pending on Agent</SelectItem>
            <SelectItem value="pending_for_clarification">Needs Clarification</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No transactions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first transaction'}
              </p>
              {user?.role === 'society_user' && user?.permissions.canWrite && (
                <Button onClick={onCreateNew}>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Transaction
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => {
            const statusInfo = statusConfig[transaction.status];
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={transaction._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{transaction.vendorName}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Building2 className="h-3 w-3" />
                        {transaction.nature}
                      </CardDescription>
                    </div>
                    <Badge variant={statusInfo.variant} className="ml-2">
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="font-medium">{formatDate(transaction.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Updated</p>
                      <p className="font-medium">{formatDate(transaction.updatedAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">ID</p>
                      <p className="font-medium text-xs font-mono">#{transaction._id.slice(-6)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewTransaction?.(transaction)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
