import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { TransactionList } from "@/components/TransactionList";
import { CreateTransactionForm } from "@/components/CreateTransactionForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Building2, 
  LogOut,
  ArrowLeft,
  Plus
} from "lucide-react";

type ViewMode = 'list' | 'create' | 'view';

export default function Transactions() {
  const { user, logout } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleCreateNew = () => {
    setViewMode('create');
  };

  const handleTransactionCreated = (transaction: any) => {
    setViewMode('list');
    // Could refresh the list here or show a success message
  };

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setViewMode('view');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedTransaction(null);
  };

  if (!user) {
    return null; // This should be handled by route protection
  }

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
        {/* Navigation */}
        {viewMode !== 'list' && (
          <div className="mb-6">
            <Button variant="ghost" onClick={handleBackToList} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transactions
            </Button>
          </div>
        )}

        {/* Content based on view mode */}
        {viewMode === 'list' && (
          <TransactionList 
            onViewTransaction={handleViewTransaction}
            onCreateNew={handleCreateNew}
          />
        )}

        {viewMode === 'create' && (
          <CreateTransactionForm 
            onSuccess={handleTransactionCreated}
            onCancel={handleBackToList}
          />
        )}

        {viewMode === 'view' && selectedTransaction && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Transaction Details</h2>
              <p className="text-muted-foreground">
                Detailed transaction view coming soon
              </p>
              <div className="mt-6">
                <pre className="bg-muted p-4 rounded-lg text-left text-sm overflow-auto">
                  {JSON.stringify(selectedTransaction, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
