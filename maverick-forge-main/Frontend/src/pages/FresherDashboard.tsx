import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ResumeUploader } from "@/components/ui/resume-uploader";

import { ArrowLeft, Clock, CheckCircle, BookOpen, Code, FileText, Award, User, LogOut, Activity, Calendar, GraduationCap, RefreshCw, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDarkMode } from "@/contexts/DarkModeContext";
import Chatbot from "@/components/Chatbot";

const FresherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [fresher, setFresher] = useState<any>(null); // Changed to any as defaultFresherData is removed
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing current user:', error);
        return null;
      }
    }
    return null;
  };

  // Load fresher data based on current user
  useEffect(() => {
    const loadFresherData = async () => {
      try {
        setLoading(true);
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to access your dashboard.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        console.log('Loading data for fresher:', currentUser);

        // Fetch fresher data from backend using the current user's ID
        const response = await fetch(`http://localhost:5000/api/fresher/realtime/${currentUser.id}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched real-time fresher data:', data);
          
          // Ensure we have all required fields from the database
          const fresherData = {
            id: data.id,
            name: data.name || currentUser.name || "Unknown User",
            email: data.email || currentUser.email,
            department: data.department || currentUser.department || "Unknown Department",
            skills: data.skills || [],
            joinDate: data.join_date || data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            overallProgress: data.overallProgress || 0,
            trainingStatus: data.trainingStatus || {
              dailyQuiz: 'pending',
              codingChallenge: 'pending',
              assignment: 'pending',
              certification: 'in-progress'
            },
            assessmentScores: data.assessmentScores || {
              quizScore: parseInt(data.quizzes) || 0,
              codingScore: parseInt(data.coding) || 0,
              assignmentScore: parseInt(data.assignments) || 0,
              certificationScore: parseInt(data.certifications) || 0
            },
            workflowProgress: data.workflowProgress || {},
            trainingSchedule: data.trainingSchedule || {}
          };
          
          console.log('Setting fresher data:', fresherData);
          setFresher(fresherData);
        } else {
          console.error('Failed to fetch fresher data:', response.status);
          toast({
            title: "Data Loading Error",
            description: "Failed to load your dashboard data from the database. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading fresher data:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the database. Please check your connection and try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadFresherData();

    // Listen for dashboard refresh events from admin updates
    const handleDashboardRefresh = async () => {
      console.log('Dashboard refresh triggered - reloading fresher data');
      setIsAutoRefreshing(true);
      try {
        await loadFresherData();
        
        // Show a brief success indicator
        toast({
          title: "Data Refreshed",
          description: "Your dashboard has been updated with the latest information.",
        });
      } finally {
        setTimeout(() => setIsAutoRefreshing(false), 3000);
      }
    };

    // Check for refresh events every 2 seconds
    const refreshInterval = setInterval(() => {
      const refreshTimestamp = localStorage.getItem('dashboardRefresh');
      const lastRefresh = localStorage.getItem('lastDashboardRefresh');
      
      console.log('Checking for refresh:', { refreshTimestamp, lastRefresh });
      
      if (refreshTimestamp && refreshTimestamp !== lastRefresh) {
        console.log('Refresh detected! Updating dashboard...');
        localStorage.setItem('lastDashboardRefresh', refreshTimestamp);
        handleDashboardRefresh();
        
        // Show notification that data was updated
        toast({
          title: "Dashboard Updated",
          description: "Your dashboard data has been refreshed with the latest information.",
        });
      }
    }, 2000);

    // Also listen for storage events (works across tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dashboardRefresh') {
        console.log('Storage event detected! Updating dashboard...');
        const refreshTimestamp = e.newValue;
        const lastRefresh = localStorage.getItem('lastDashboardRefresh');
        
        if (refreshTimestamp && refreshTimestamp !== lastRefresh) {
          localStorage.setItem('lastDashboardRefresh', refreshTimestamp);
          handleDashboardRefresh();
          
          // Show notification that data was updated
          toast({
            title: "Dashboard Updated",
            description: "Your dashboard data has been refreshed with the latest information.",
          });
        }
      }
    };

    // Listen for custom events from admin updates
    const handleFresherDataUpdate = (e: CustomEvent) => {
      console.log('Custom event detected! Updating dashboard...', e.detail);
      
      // Check if this update is for the current user
      const currentUser = getCurrentUser();
      if (currentUser && e.detail.fresherId === currentUser.id) {
        handleDashboardRefresh();
        
        // Show specific notification about what was updated
        const updatedScores = e.detail.updatedScores;
        const scoreChanges = [];
        
        if (updatedScores.quizzes !== undefined) scoreChanges.push(`Quiz: ${updatedScores.quizzes}%`);
        if (updatedScores.coding !== undefined) scoreChanges.push(`Coding: ${updatedScores.coding}%`);
        if (updatedScores.assignments !== undefined) scoreChanges.push(`Assignment: ${updatedScores.assignments}%`);
        if (updatedScores.certifications !== undefined) scoreChanges.push(`Certification: ${updatedScores.certifications}%`);
        
        toast({
          title: "Scores Updated by Admin",
          description: `Your scores have been updated: ${scoreChanges.join(', ')}. New overall progress: ${e.detail.overallProgress}%`,
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('fresherDataUpdated', handleFresherDataUpdate as EventListener);

    // Cleanup interval and event listener on component unmount
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fresherDataUpdated', handleFresherDataUpdate as EventListener);
    };
  }, [navigate, toast]);

  const handleResumeParse = async (skills: string[]) => {
    try {
      if (!fresher?.id) {
        toast({
          title: "Error",
          description: "Unable to update skills. Please refresh the page and try again.",
          variant: "destructive"
        });
        return;
      }

      // Update skills
      const response = await fetch(`http://localhost:5000/api/fresher/skills/${fresher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills }),
      });

      if (response.ok) {
        setFresher(prev => ({ ...prev, skills }));
        toast({
          title: "Skills Updated Successfully!",
          description: `Updated profile with ${skills.length} skills from your resume`,
        });
      } else {
        throw new Error('Failed to update skills');
      }
    } catch (error) {
      console.error('Error updating skills:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleManualRefresh = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to access your dashboard.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/fresher/realtime/${currentUser.id}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Use the same logic as loadFresherData
        const fresherData = {
          id: data.id,
          name: data.name || currentUser.name || "Unknown User",
          email: data.email || currentUser.email,
          department: data.department || currentUser.department || "Unknown Department",
          skills: data.skills || [],
          joinDate: data.join_date || data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          overallProgress: data.overallProgress || 0,
          trainingStatus: data.trainingStatus || {
            dailyQuiz: 'pending',
            codingChallenge: 'pending',
            assignment: 'pending',
            certification: 'in-progress'
          },
          assessmentScores: data.assessmentScores || {
            quizScore: parseInt(data.quizzes) || 0,
            codingScore: parseInt(data.coding) || 0,
            assignmentScore: parseInt(data.assignments) || 0,
            certificationScore: parseInt(data.certifications) || 0
          },
          workflowProgress: data.workflowProgress || {},
          trainingSchedule: data.trainingSchedule || {}
        };
        
        setFresher(fresherData);

        toast({
          title: "Dashboard Refreshed",
          description: "Your dashboard has been updated with the latest data.",
        });
      } else {
        throw new Error('Failed to refresh data');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // AI-powered feedback function
  const generateAIFeedback = (fresher: any) => {
    if (!fresher?.assessmentScores) {
      return {
        feedback: "Keep up the great work!",
        motivation: "You're doing well!",
        suggestions: ["Continue with your current pace"],
        quote: "Every step forward is progress!",
        overallProgress: 0
      };
    }

    const { quizScore, codingScore, assignmentScore, certificationScore } = fresher.assessmentScores;
    const overallProgress = fresher.overallProgress || 0;

    let feedback = "";
    let motivation = "";
    let suggestions = [];

    // Analyze overall performance
    if (overallProgress >= 90) {
      feedback = "🎉 Outstanding Performance! You're absolutely crushing it!";
      motivation = "You're in the top tier of performers. Keep this momentum going!";
    } else if (overallProgress >= 80) {
      feedback = "🌟 Excellent Work! You're doing really well!";
      motivation = "You're showing great potential. A few more pushes and you'll be at the top!";
    } else if (overallProgress >= 70) {
      feedback = "👍 Good Progress! You're on the right track!";
      motivation = "You're making solid progress. Focus on your weaker areas to excel!";
    } else if (overallProgress >= 50) {
      feedback = "📈 Steady Progress! Keep pushing forward!";
      motivation = "You're building a strong foundation. Every improvement counts!";
    } else {
      feedback = "💪 Getting Started! Every journey begins with a single step!";
      motivation = "Don't worry about where you are now, focus on where you're going!";
    }

    // Analyze individual scores and provide specific feedback
    if (quizScore >= 90) {
      suggestions.push("🎯 Your quiz performance is exceptional! You're a quick learner.");
    } else if (quizScore >= 70) {
      suggestions.push("📚 Your quiz scores are good! Try reviewing the material more thoroughly.");
    } else if (quizScore > 0) {
      suggestions.push("📖 Focus on understanding the core concepts. Practice makes perfect!");
    } else {
      suggestions.push("📚 Start with the basics. Every expert was once a beginner!");
    }

    if (codingScore >= 90) {
      suggestions.push("💻 Your coding skills are impressive! You're a natural problem solver.");
    } else if (codingScore >= 70) {
      suggestions.push("🔧 Your coding is solid! Try tackling more complex challenges.");
    } else if (codingScore > 0) {
      suggestions.push("⚡ Practice coding daily. Small improvements lead to big results!");
    } else {
      suggestions.push("🚀 Start with simple coding exercises. Build your confidence step by step!");
    }

    if (assignmentScore >= 90) {
      suggestions.push("📝 Your assignments are top-notch! You have excellent attention to detail.");
    } else if (assignmentScore >= 70) {
      suggestions.push("📋 Your assignment work is good! Focus on quality over speed.");
    } else if (assignmentScore > 0) {
      suggestions.push("📄 Take your time with assignments. Quality work pays off!");
    } else {
      suggestions.push("📝 Start with smaller tasks. Every completed assignment is progress!");
    }

    if (certificationScore >= 90) {
      suggestions.push("🏆 Your certification progress is outstanding! You're a dedicated learner.");
    } else if (certificationScore >= 70) {
      suggestions.push("🎓 Your certification journey is going well! Keep up the momentum.");
    } else if (certificationScore > 0) {
      suggestions.push("📜 Focus on one certification at a time. You'll get there!");
    } else {
      suggestions.push("🎯 Set small certification goals. Every step forward is progress!");
    }

    // Add motivational closing
    const motivationalQuotes = [
      "Remember: Success is not final, failure is not fatal. It's the courage to continue that counts!",
      "The only way to do great work is to love what you do. Keep pushing your boundaries!",
      "Your potential is limitless. Believe in yourself and keep growing!",
      "Every expert was once a beginner. You're on the right path!",
      "Success is the sum of small efforts repeated day in and day out. Keep going!"
    ];

    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

    return {
      feedback,
      motivation,
      suggestions,
      quote: randomQuote,
      overallProgress
    };
  };

  const handleFeedback = () => {
    if (!fresher) {
      toast({
        title: "No Data Available",
        description: "Please wait for your data to load before getting feedback.",
        variant: "destructive"
      });
      return;
    }

    const aiFeedback = generateAIFeedback(fresher);
    
    // Create a detailed feedback message
    const feedbackMessage = `
${aiFeedback.feedback}

${aiFeedback.motivation}

📊 Your Current Progress: ${aiFeedback.overallProgress}%

💡 Personalized Suggestions:
${aiFeedback.suggestions.join('\n')}

✨ ${aiFeedback.quote}
    `.trim();

    toast({
      title: "AI-Powered Feedback",
      description: feedbackMessage,
      duration: 8000, // Show for 8 seconds to allow reading
    });

    console.log('AI Feedback generated:', aiFeedback);
  };

  // Function to determine workflow completion based on training status and scores
  const getWorkflowCompletion = () => {
    // Profile is completed if skills are extracted (primary condition)
    const profileUpdated = fresher?.workflowProgress?.profileUpdated || 
                          (fresher?.skills && fresher.skills.length > 0) || false;
    
    const quizCompleted = fresher?.trainingStatus?.dailyQuiz === 'completed' && 
                         (fresher?.assessmentScores?.quizScore || 0) >= 100;
    const codingCompleted = fresher?.trainingStatus?.codingChallenge === 'completed' && 
                           (fresher?.assessmentScores?.codingScore || 0) >= 100;
    const assignmentCompleted = (fresher?.assessmentScores?.assignmentScore || 0) >= 100;
    const certificationCompleted = fresher?.trainingStatus?.certification === 'completed' && 
                                  (fresher?.assessmentScores?.certificationScore || 0) >= 100;

    return {
      profileUpdated,
      quizCompleted,
      codingCompleted,
      assignmentCompleted,
      certificationCompleted
    };
  };

  const workflowCompletion = getWorkflowCompletion();

  const workflowSteps = [
    { 
      id: 'profile', 
      label: 'Profile Updated', 
      completed: workflowCompletion.profileUpdated,
      icon: User 
    },
    { 
      id: 'quiz', 
      label: 'Daily Quiz Completed', 
      completed: workflowCompletion.quizCompleted,
      icon: BookOpen 
    },
    { 
      id: 'coding', 
      label: 'Coding Challenge Submitted', 
      completed: workflowCompletion.codingCompleted,
      icon: Code 
    },
    { 
      id: 'assignment', 
      label: 'Assignment Submitted', 
      completed: workflowCompletion.assignmentCompleted,
      icon: FileText 
    },
    { 
      id: 'certification', 
      label: 'Certification Completed', 
      completed: workflowCompletion.certificationCompleted,
      icon: Award 
    }
  ];

  const getStatusBadge = (status: string) => {
    return <StatusBadge status={status as "completed" | "pending" | "in-progress" | "not-started" | "submitted"} />;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!fresher) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="mb-4">Unable to load your dashboard data.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold dashboard-heading">Welcome, {fresher?.name}</h1>
              <p className="text-white/80 dashboard-body">{fresher?.department} • Joined {new Date(fresher?.joinDate).toLocaleDateString()}</p>
              {isAutoRefreshing && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-white/70">Auto-updating...</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-3xl font-bold dashboard-heading">{fresher?.overallProgress}%</div>
              <div className="text-white/80 text-sm dashboard-body">Overall Progress</div>
            </div>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={toggleDarkMode}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleManualRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleFeedback}
            >
              Feedback
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Training Status Dashboard */}
        <section>
          <h2 className="text-2xl font-bold mb-6 dashboard-heading">Current Training Status</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white shadow-lg training-card-hover training-card-neon-green cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  {getStatusBadge(fresher?.trainingStatus?.dailyQuiz)}
                </div>
                <CardTitle className="text-lg dashboard-card-title">Daily Quiz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">
                  {fresher?.assessmentScores?.quizScore}%
                </div>
                <p className="text-sm text-white/70">Latest Score</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-lg training-card-hover training-card-neon-blue cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Code className="w-5 h-5" />
                  </div>
                  {getStatusBadge(fresher?.trainingStatus?.codingChallenge)}
                </div>
                <CardTitle className="text-lg dashboard-card-title">Coding Challenge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">
                  {fresher?.assessmentScores?.codingScore}%
                </div>
                <p className="text-sm text-white/70">Latest Score</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 border-0 text-white shadow-lg training-card-hover training-card-neon-orange cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  {getStatusBadge(fresher?.trainingStatus?.assignment)}
                </div>
                <CardTitle className="text-lg dashboard-card-title">Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">
                  {fresher?.assessmentScores?.assignmentScore}%
                </div>
                <p className="text-sm text-white/70">Latest Score</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg training-card-hover training-card-neon-purple cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  {getStatusBadge(fresher?.trainingStatus?.certification)}
                </div>
                <CardTitle className="text-lg dashboard-card-title">Certification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {fresher?.assessmentScores?.certificationScore}%
                </div>
                <p className="text-sm text-muted-foreground">Latest Score</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Real-Time Workflow Progress */}
        <section>
          <h2 className="text-2xl font-bold mb-6 dashboard-heading">Real-Time Workflow Progress</h2>
          <Card className={`border-0 shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
                              <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : ''} dashboard-card-title`}>
                  <Activity className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  Training Workflow
                </CardTitle>
              <CardDescription className={darkMode ? 'text-gray-300' : ''}>
                Track your progress through the training pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className={`p-6 rounded-xl ${
                  darkMode 
                    ? 'bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600' 
                    : 'bg-gradient-to-r from-blue-50 to-purple-50'
                }`}>
                  <ProgressBar 
                    value={workflowSteps.filter(step => step.completed).length} 
                    max={workflowSteps.length} 
                    label={`Workflow Completion - ${Math.round((workflowSteps.filter(step => step.completed).length / workflowSteps.length) * 100)}%`}
                    color="primary"
                  />
                </div>
                
                <div className="space-y-4">
                  {workflowSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div 
                        key={step.id} 
                        className={`flex items-center gap-4 p-5 rounded-xl border transition-all duration-300 hover:shadow-md ${
                          darkMode 
                            ? 'border-gray-600 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800' 
                            : 'border-gray-200 bg-gradient-to-r from-gray-50 to-white'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          step.completed 
                            ? darkMode 
                              ? 'bg-green-900 text-green-400 shadow-sm' 
                              : 'bg-green-100 text-green-600 shadow-sm'
                            : darkMode 
                              ? 'bg-gray-700 text-gray-400' 
                              : 'bg-gray-100 text-gray-400'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <Icon className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold text-lg ${darkMode ? 'text-white' : ''} dashboard-card-title`}>
                            {step.label}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Step {index + 1} of {workflowSteps.length}
                          </div>
                          {step.id === 'quiz' && (
                            <div className={`text-xs mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              Score: {fresher?.assessmentScores?.quizScore || 0}%
                            </div>
                          )}
                          {step.id === 'coding' && (
                            <div className={`text-xs mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              Score: {fresher?.assessmentScores?.codingScore || 0}%
                            </div>
                          )}
                          {step.id === 'assignment' && (
                            <div className={`text-xs mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              Score: {fresher?.assessmentScores?.assignmentScore || 0}%
                            </div>
                          )}
                          {step.id === 'certification' && (
                            <div className={`text-xs mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              Score: {fresher?.assessmentScores?.certificationScore || 0}%
                            </div>
                          )}
                          {step.id === 'profile' && (
                            <div className={`text-xs mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              {fresher?.skills && fresher.skills.length > 0 ? (
                                <span className={darkMode ? 'text-green-400' : 'text-green-600'}>
                                  ✓ Skills extracted ({fresher.skills.length} skills)
                                </span>
                              ) : (
                                <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                                  No skills extracted yet
                                </span>
                              )}
                              {fresher?.resumeUploaded && (
                                <span className={`ml-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                  ✓ Resume uploaded
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <Badge 
                          variant={step.completed ? "default" : "secondary"} 
                          className={`px-4 py-2 text-sm ${
                            darkMode && step.completed 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : darkMode && !step.completed 
                                ? 'bg-gray-600 text-gray-300' 
                                : ''
                          }`}
                        >
                          {step.completed ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Skills & Profile */}
        <section>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : ''} dashboard-heading`}>Your Profile</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className={`border-0 shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200'}`}>
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 dashboard-heading gradient-text-blue-purple">
                      {fresher?.name}
                    </h3>
                    <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'} dashboard-body`}>{fresher?.email}</p>
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white/80 backdrop-blur-sm border border-blue-200/50'}`}>
                        <span className={`font-semibold text-sm uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>Department</span>
                        <div className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{fresher?.department}</div>
                      </div>
                      <div>
                        <span className={`font-semibold text-sm uppercase tracking-wide mb-2 block ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>Skills</span>
                        <div className="flex flex-wrap gap-2">
                          {fresher?.skills && fresher.skills.length > 0 ? (
                            fresher.skills.map((skill) => (
                              <Badge key={skill} variant="secondary" className={`px-3 py-1 ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No skills listed</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Schedules */}
            <Card className={`border-0 shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-green-800'} dashboard-card-title`}>
                  <GraduationCap className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-green-600'}`} />
                  Training Schedules
                </CardTitle>
                <CardDescription className={darkMode ? 'text-gray-300' : 'text-green-700'}>
                  Your assigned training program
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fresher?.trainingSchedule ? (
                  <div className={`p-4 rounded-xl ${
                    darkMode 
                      ? 'bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600' 
                      : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                  }`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-lg leading-tight ${darkMode ? 'text-white' : ''}`}>
                          {fresher?.trainingSchedule?.courseName}
                        </h4>
                        {fresher?.trainingSchedule?.description && (
                          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {fresher?.trainingSchedule?.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        darkMode ? 'bg-gray-600/50' : 'bg-white/50'
                      }`}>
                        <Calendar className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <div>
                          <span className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Starting Date
                          </span>
                          <div className={`font-medium ${darkMode ? 'text-white' : ''}`}>
                            {new Date(fresher?.trainingSchedule?.startingDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        darkMode ? 'bg-gray-600/50' : 'bg-white/50'
                      }`}>
                        <Clock className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <div>
                          <span className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Course Duration
                          </span>
                          <div className={`font-medium ${darkMode ? 'text-white' : ''}`}>
                            {fresher?.trainingSchedule?.courseHours} Hours
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <GraduationCap className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                      Training course assignment pending
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Your training will be assigned based on your department
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Resume Parser */}
            <ResumeUploader
              title="AI Resume Parser"
              description="Upload your resume to automatically extract skills and recommend courses"
              onParse={handleResumeParse}
              onError={(error) => console.error('Resume parsing error:', error)}
              showParseButton
              maxFileSize={10}
              allowedTypes={['.pdf', '.docx']}
              showCourseRecommendation
              className={darkMode ? '' : 'bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200'}
            />
          </div>
        </section>
      </div>
      
      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default FresherDashboard;