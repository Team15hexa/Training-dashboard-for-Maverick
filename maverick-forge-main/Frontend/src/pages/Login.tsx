import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, User, Shield, Brain, GraduationCap, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authAPI, healthCheck } from "@/services/api";

// Enhanced user interface
interface User {
  id: string;
  email: string;
  role: 'admin' | 'fresher';
  name?: string;
  department?: string;
}

interface Credentials {
  email: string;
  password: string;
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const isHealthy = await healthCheck();
        setBackendStatus(isHealthy ? 'connected' : 'disconnected');
        
        if (!isHealthy) {
          toast({
            title: "Backend Connection Issue",
            description: "Unable to connect to the server. Some features may not work properly.",
            variant: "destructive"
          });
        }
      } catch (error) {
        setBackendStatus('disconnected');
        console.error('Backend health check failed:', error);
      }
    };

    checkBackendHealth();
  }, [toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login with:', { email, password });
      
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        const user = response.user;
        
        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authToken', response.token);
        
        toast({ 
          title: `Welcome back, ${user.name || user.email}!`, 
          description: `Redirecting to ${user.role} dashboard...` 
        });
        
        console.log('✅ Login successful:', user);
        
        // Navigate based on role
        if (user.role === 'admin') {
          setTimeout(() => navigate("/admin/dashboard"), 1000);
        } else {
          setTimeout(() => navigate("/fresher-dashboard"), 1000);
        }
      } else {
        toast({ 
          title: "Login Failed", 
          description: response.message || "Invalid email or password. Please try again.",
          variant: "destructive"
        });
        console.error('❌ Login failed:', response.message);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast({ 
        title: "Login Error", 
        description: "An error occurred during login. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse delay-1000"></div>
      
      <div className="relative z-10 w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Features */}
          <div className="text-white space-y-8">
            {/* Branding Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold">Maverick Forge</h1>
                  <p className="text-xl text-white/80">AI-Powered Training Management</p>
                </div>
              </div>
              
              <p className="text-lg text-white/90 leading-relaxed">
                Experience the future of training management with our advanced AI-powered platform. 
                Streamline onboarding, track progress, and empower your team with intelligent insights.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Brain className="w-8 h-8 text-blue-300 mb-2" />
                <h3 className="font-semibold text-white mb-1">AI Resume Parser</h3>
                <p className="text-sm text-white/70">Automatically extract skills from resumes</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <GraduationCap className="w-8 h-8 text-purple-300 mb-2" />
                <h3 className="font-semibold text-white mb-1">Smart Training</h3>
                <p className="text-sm text-white/70">Personalized learning paths</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Shield className="w-8 h-8 text-green-300 mb-2" />
                <h3 className="font-semibold text-white mb-1">Secure Access</h3>
                <p className="text-sm text-white/70">Role-based authentication</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <User className="w-8 h-8 text-pink-300 mb-2" />
                <h3 className="font-semibold text-white mb-1">Real-time Tracking</h3>
                <p className="text-sm text-white/70">Live progress monitoring</p>
              </div>
            </div>

            {/* Backend Status Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                backendStatus === 'connected' ? 'bg-green-400' : 
                backendStatus === 'checking' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className="text-sm text-white/70">
                {backendStatus === 'connected' ? 'Connected to backend' :
                 backendStatus === 'checking' ? 'Checking connection...' : 'Backend disconnected'}
              </span>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl shadow-2xl border border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-white text-2xl">
                  <LogIn className="w-6 h-6" />
                  Sign In
                </CardTitle>
                <CardDescription className="text-white/70">
                  Enter your credentials to access the training platform
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90 font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@mavericks.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:bg-white/20 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:bg-white/20 transition-all duration-200 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-white/10 text-white/70 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105" 
                    disabled={isLoading || backendStatus === 'disconnected'}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                        Signing in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
                
                {/* Admin Credentials */}
                <div className="mt-8 space-y-4">
                  <div className="text-center">
                    <h4 className="font-medium text-sm mb-3 text-white/80">Admin Credentials</h4>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                         onClick={() => {
                           setEmail('admin@mavericks.com');
                           setPassword('admin123');
                         }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-xs">
                            Admin
                          </Badge>
                          <span className="text-xs text-white/70">Admin User</span>
                        </div>
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        admin@mavericks.com / admin123
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;