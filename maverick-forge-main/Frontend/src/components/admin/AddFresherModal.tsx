import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddFresherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FresherData {
  name: string;
  email: string;
  department: string;
  skills: string[];
}

export function AddFresherModal({ isOpen, onClose, onSuccess }: AddFresherModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FresherData>({
    name: "",
    email: "",
    department: "",
    skills: []
  });
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);

  const departments = [
    "Software Engineering",
    "Data Science",
    "UI/UX Design",
    "DevOps",
    "Cybersecurity",
    "Mobile Development",
    "Quality Assurance",
    "Product Management"
  ];

  const handleInputChange = (field: keyof FresherData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/fresher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          department: formData.department,
          skills: formData.skills,
          trainingSchedule: {
            courseName: "Full Stack Web Development Bootcamp",
            startingDate: new Date().toISOString().split('T')[0],
            courseHours: 80,
            description: "Comprehensive training in modern web development technologies"
          },
          workflowProgress: {
            profileUpdated: false,
            quizCompleted: false,
            codingSubmitted: false,
            assignmentSubmitted: false,
            certificationCompleted: false
          }
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Fresher added successfully!",
        });
        onSuccess();
        handleClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add fresher');
      }
    } catch (error) {
      console.error('Error adding fresher:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add fresher",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      department: "",
      skills: []
    });
    setNewSkill("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Add New Fresher
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={!newSkill.trim()}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSkill(skill)}
                        className="h-4 w-4 p-0 hover:bg-transparent"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
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
                disabled={loading || !formData.name || !formData.email || !formData.department}
              >
                {loading ? "Adding..." : "Add Fresher"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 