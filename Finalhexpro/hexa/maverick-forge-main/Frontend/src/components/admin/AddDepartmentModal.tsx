import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface DepartmentData {
  name: string;
  description: string;
}

export function AddDepartmentModal({ isOpen, onClose, onSuccess }: AddDepartmentModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<DepartmentData>({
    name: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof DepartmentData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Department name is required",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/department', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: `Department "${formData.name}" added successfully!`,
          duration: 3000
        });
        onSuccess();
        handleClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add department');
      }
    } catch (error) {
      console.error('Error adding department:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add department",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: ""
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Add New Department
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Department Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Department Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter department name"
                required
              />
            </div>
            
            {/* Department Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter department description (optional)"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.name.trim()}
              >
                {loading ? "Adding..." : "Add Department"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 