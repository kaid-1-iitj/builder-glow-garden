import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Building2, 
  DollarSign, 
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Upload
} from "lucide-react";

interface CreateTransactionFormProps {
  onSuccess?: (transaction: any) => void;
  onCancel?: () => void;
}

export function CreateTransactionForm({ onSuccess, onCancel }: CreateTransactionFormProps) {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    vendorName: '',
    nature: '',
    amount: '',
    remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vendorName.trim() || !formData.nature.trim()) {
      setError('Vendor name and nature of transaction are required');
      return;
    }

    if (!token) {
      setError('Authentication required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const submitData = {
        vendorName: formData.vendorName.trim(),
        nature: formData.nature.trim(),
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        remarks: formData.remarks.trim() || undefined
      };

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create transaction');
      }

      setSuccess(true);
      
      // Reset form
      setFormData({
        vendorName: '',
        nature: '',
        amount: '',
        remarks: ''
      });

      // Call success callback after a brief delay
      setTimeout(() => {
        onSuccess?.(data.transaction);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-8 text-center">
          <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Transaction Created Successfully!</h3>
          <p className="text-muted-foreground mb-4">
            Your transaction has been submitted and is now pending review.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => {
              setSuccess(false);
              onSuccess?.(null);
            }}>
              Create Another
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Back to List
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Create New Transaction</h2>
        <p className="text-muted-foreground">
          Submit a new transaction for processing by your society
        </p>
        
        {user?.societyId && (
          <Badge variant="outline" className="w-fit">
            <Building2 className="h-3 w-3 mr-1" />
            {user.societyId.name}
          </Badge>
        )}
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transaction Details
          </CardTitle>
          <CardDescription>
            Provide the details of the transaction you want to submit
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vendor Name */}
              <div className="space-y-2">
                <Label htmlFor="vendorName">Vendor Name *</Label>
                <Input
                  id="vendorName"
                  placeholder="e.g., ABC Maintenance Services"
                  value={formData.vendorName}
                  onChange={(e) => handleInputChange('vendorName', e.target.value)}
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Nature of Transaction */}
            <div className="space-y-2">
              <Label htmlFor="nature">Nature of Transaction *</Label>
              <Input
                id="nature"
                placeholder="e.g., Monthly maintenance, Security services, Electrical repairs"
                value={formData.nature}
                onChange={(e) => handleInputChange('nature', e.target.value)}
                required
              />
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks">Additional Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Provide any additional details about this transaction..."
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                rows={4}
              />
            </div>

            {/* File Upload Placeholder */}
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  File upload functionality coming soon
                </p>
                <p className="text-xs text-muted-foreground">
                  For now, you can attach files via email or other means
                </p>
              </div>
            </div>

            {/* Workflow Info */}
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                <strong>What happens next:</strong> Your transaction will be submitted with status "Pending on Society" 
                and will then be assigned to an agent for review and processing.
              </AlertDescription>
            </Alert>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Creating...' : 'Create Transaction'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
