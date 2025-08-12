import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Chatbot from "@/components/Chatbot";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Training Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Welcome to your training management platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Fresher Dashboard */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/fresher-dashboard')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Fresher Dashboard</CardTitle>
                  <CardDescription>
                    Training dashboard for freshers and trainees
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access your training modules, track progress, view assignments, and manage your learning journey.
              </p>
              <Button className="w-full" onClick={() => navigate('/fresher-dashboard')}>
                Open Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Admin Dashboard */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Admin Dashboard</CardTitle>
                  <CardDescription>
                    Administrative dashboard for managing trainees
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage trainees, view progress reports, and oversee the training program.
              </p>
              <Button className="w-full" onClick={() => navigate('/admin/dashboard')}>
                Open Admin Panel
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your training progress and achievements
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Module Management</h3>
              <p className="text-sm text-muted-foreground">
                Access training modules and assignments
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Easy Navigation</h3>
              <p className="text-sm text-muted-foreground">
                Intuitive interface designed for smooth user experience
              </p>
            </div>
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default Index;
