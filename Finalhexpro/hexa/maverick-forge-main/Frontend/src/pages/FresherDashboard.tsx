import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ResumeUploader } from "@/components/ui/resume-uploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { ArrowLeft, Clock, CheckCircle, BookOpen, Code, FileText, Award, User, LogOut, Activity, Calendar, GraduationCap, RefreshCw, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDarkMode } from "@/contexts/DarkModeContext";
import Chatbot from "@/components/Chatbot";
import { authAPI } from "@/services/api";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const FresherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [fresher, setFresher] = useState<any>(null); // Changed to any as defaultFresherData is removed
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [loginActivity, setLoginActivity] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [todayIso, setTodayIso] = useState<string>("");

  const toLocalISO = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

    // Course definitions with their required skills, duration, and video courses
  const courses = [
    {
      name: "MERN Stack",
      skills: ['javascript', 'mongodb', 'express', 'react', 'node', 'node.js', 'mongo'],
      duration: "8 hours",
      videoCourses: [
        {
          title: "React.js Complete Course 2024",
          provider: "Udemy",
          instructor: "Max Schwarzmüller",
          duration: "44 hours",
          rating: 4.7,
          price: "$19.99",
          url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
          description: "Learn React.js from scratch with hooks, context, and Redux"
        },
        {
          title: "Node.js and Express.js - Full Course",
          provider: "freeCodeCamp",
          instructor: "John Smilga",
          duration: "8 hours",
          rating: 4.8,
          price: "Free",
          url: "https://www.youtube.com/watch?v=Oe421EPjeBE",
          description: "Complete Node.js and Express.js tutorial for beginners"
        },
        {
          title: "MongoDB Complete Course",
          provider: "YouTube",
          instructor: "The Net Ninja",
          duration: "3 hours",
          rating: 4.9,
          price: "Free",
          url: "https://www.youtube.com/watch?v=pWbMrx5rVBE",
          description: "Learn MongoDB from basics to advanced concepts"
        }
      ]
    },
    {
      name: "Java Developer",
      skills: ['java', 'spring', 'spring boot', 'spring framework'],
      duration: "6 hours",
      videoCourses: [
        {
          title: "Java Programming Masterclass",
          provider: "Udemy",
          instructor: "Tim Buchalka",
          duration: "80 hours",
          rating: 4.6,
          price: "$24.99",
          url: "https://www.udemy.com/course/java-the-complete-java-developer-course/",
          description: "Complete Java programming course with practical projects"
        },
        {
          title: "Spring Boot Full Course",
          provider: "Amigoscode",
          instructor: "Nelson Djalo",
          duration: "6 hours",
          rating: 4.8,
          price: "Free",
          url: "https://www.youtube.com/watch?v=9SGDpanrc8U",
          description: "Learn Spring Boot from scratch with real-world projects"
        },
        {
          title: "Java Spring Framework",
          provider: "YouTube",
          instructor: "Programming with Mosh",
          duration: "4 hours",
          rating: 4.7,
          price: "Free",
          url: "https://www.youtube.com/watch?v=9SGDpanrc8U",
          description: "Complete Spring Framework tutorial for beginners"
        }
      ]
    },
    {
      name: "Python Developer",
      skills: ['python', 'flask', 'django', 'py'],
      duration: "5 hours",
      videoCourses: [
        {
          title: "Python for Everybody",
          provider: "Coursera",
          instructor: "Charles Severance",
          duration: "32 hours",
          rating: 4.8,
          price: "Free",
          url: "https://www.coursera.org/specializations/python",
          description: "Complete Python programming specialization"
        },
        {
          title: "Django Full Course",
          provider: "YouTube",
          instructor: "Dennis Ivy",
          duration: "5 hours",
          rating: 4.9,
          price: "Free",
          url: "https://www.youtube.com/watch?v=JT80XhUJ1Z4",
          description: "Learn Django web framework from scratch"
        },
        {
          title: "Flask Web Development",
          provider: "freeCodeCamp",
          instructor: "Tech With Tim",
          duration: "3 hours",
          rating: 4.7,
          price: "Free",
          url: "https://www.youtube.com/watch?v=oA8brF3w5XQ",
          description: "Build web applications with Flask framework"
        }
      ]
    },
    {
      name: "Data Analytics",
      skills: ['python', 'sql', 'pandas', 'excel', 'numpy', 'data science', 'data analysis', 'analytics'],
      duration: "7 hours",
      videoCourses: [
        {
          title: "Data Science Bootcamp",
          provider: "Udemy",
          instructor: "Jose Portilla",
          duration: "44 hours",
          rating: 4.6,
          price: "$29.99",
          url: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
          description: "Complete data science course with Python"
        },
        {
          title: "SQL for Data Science",
          provider: "DataCamp",
          instructor: "Multiple Instructors",
          duration: "20 hours",
          rating: 4.8,
          price: "$39/month",
          url: "https://www.datacamp.com/tracks/data-science-with-python",
          description: "Learn SQL for data analysis and manipulation"
        },
        {
          title: "Pandas Tutorial",
          provider: "YouTube",
          instructor: "Corey Schafer",
          duration: "2 hours",
          rating: 4.9,
          price: "Free",
          url: "https://www.youtube.com/watch?v=daefaLgNkw0",
          description: "Complete Pandas tutorial for data analysis"
        }
      ]
    }
  ];

  // Function to get recommended course name
  const getRecommendedCourseName = (skills: string[]): string => {
    if (!skills || skills.length === 0) {
      return "No course available";
    }

    // Convert skills to lowercase for case-insensitive matching
    const normalizedSkills = skills.map(skill => skill.toLowerCase());
    
    // Calculate match scores for each course
    const courseScores = courses.map(course => {
      const matchedSkills = course.skills.filter(skill => 
        normalizedSkills.some(userSkill => 
          userSkill.includes(skill) || skill.includes(userSkill)
        )
      );
      return {
        name: course.name,
        score: matchedSkills.length,
        totalSkills: course.skills.length,
        matchPercentage: (matchedSkills.length / course.skills.length) * 100
      };
    });

    // Find the best match (highest match percentage)
    const bestMatch = courseScores.reduce((best, current) => {
      if (current.score === 0) return best;
      if (best.score === 0) return current;
      return current.matchPercentage > best.matchPercentage ? current : best;
    });

    // Return the course name if there's a match, otherwise "No course available"
    return bestMatch.score > 0 ? bestMatch.name : "No course available";
  };

  // Course recommendation function for duration
  const recommendCourse = (skills: string[]): string => {
    if (!skills || skills.length === 0) {
      return "No course available";
    }

    // Convert skills to lowercase for case-insensitive matching
    const normalizedSkills = skills.map(skill => skill.toLowerCase());
    
    // Calculate match scores for each course
    const courseScores = courses.map(course => {
      const matchedSkills = course.skills.filter(skill => 
        normalizedSkills.some(userSkill => 
          userSkill.includes(skill) || skill.includes(userSkill)
        )
      );
      return {
        name: course.name,
        duration: course.duration,
        score: matchedSkills.length,
        totalSkills: course.skills.length,
        matchPercentage: (matchedSkills.length / course.skills.length) * 100
      };
    });

    // Find the best match (highest match percentage)
    const bestMatch = courseScores.reduce((best, current) => {
      if (current.score === 0) return best;
      if (best.score === 0) return current;
      return current.matchPercentage > best.matchPercentage ? current : best;
    });

    // Return the duration if there's a match, otherwise "No course available"
    return bestMatch.score > 0 ? bestMatch.duration : "No course available";
  };

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
            variant: "destructive",
            duration: 10000
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
          setTodayIso(toLocalISO(new Date()));
          
          // Check if all sections are 100% for celebration
          const allSectionsComplete = 
            fresherData.assessmentScores?.quizScore === 100 &&
            fresherData.assessmentScores?.codingScore === 100 &&
            fresherData.assessmentScores?.assignmentScore === 100 &&
            fresherData.assessmentScores?.certificationScore === 100;
          
          if (allSectionsComplete) {
            setShowCelebration(true);
            // Auto-hide celebration after 8 seconds
            setTimeout(() => setShowCelebration(false), 8000);
          }
          // fetch login activity
          try {
            const activity = await authAPI.getLoginActivity(currentUser.id);
            if (activity?.success) {
              const chartData = activity.data.map((row: any) => {
                const iso = typeof row.login_date === 'string' ? row.login_date : toLocalISO(new Date(row.login_date));
                return {
                  date: new Date(iso).toLocaleDateString(),
                  iso,
                  logins: row.count
                };
              });
              // Ensure today is highlighted immediately
              const todayIso = toLocalISO(new Date());
              if (!chartData.some((d: any) => d.iso === todayIso)) {
                chartData.push({ iso: todayIso, date: new Date().toLocaleDateString(), logins: 1 });
              }
              setLoginActivity(chartData);
            }
          } catch (e) {
            console.warn('Failed to load login activity');
            // Fallback: mark today
            const todayIso = toLocalISO(new Date());
            setLoginActivity([{ iso: todayIso, date: new Date().toLocaleDateString(), logins: 1 }]);
          }
        } else {
          console.error('Failed to fetch fresher data:', response.status);
          toast({
            title: "Data Loading Error",
            description: "Failed to load your dashboard data from the database. Please try again.",
            variant: "destructive",
            duration: 10000
          });
        }
      } catch (error) {
        console.error('Error loading fresher data:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the database. Please check your connection and try again.",
          variant: "destructive",
          duration: 10000
        });
      } finally {
        setLoading(false);
      }
    };

    loadFresherData();

    // If login just happened, mark today immediately from localStorage signal
    const lsIso = localStorage.getItem('loginActivityTodayISO');
    if (lsIso) {
      const todayEntry = { iso: lsIso, date: new Date(lsIso).toLocaleDateString(), logins: 1 };
      setLoginActivity(prev => {
        const exists = prev.some(d => d.iso === lsIso);
        return exists ? prev : [...prev, todayEntry];
      });
      setCurrentMonth(new Date(lsIso));
      localStorage.removeItem('loginActivityTodayISO');
    }

    // Real-time date rollover: check every minute and refresh if day changed
    const todayCheck = setInterval(async () => {
      const nowIso = toLocalISO(new Date());
      if (todayIso && nowIso !== todayIso) {
        setTodayIso(nowIso);
        setCurrentMonth(new Date());
        const currentUser = getCurrentUser();
        if (currentUser?.id) {
          try {
            const activity = await authAPI.getLoginActivity(currentUser.id);
            if (activity?.success) {
              const chartData = activity.data.map((row: any) => {
                const iso = typeof row.login_date === 'string' ? row.login_date : toLocalISO(new Date(row.login_date));
                return { date: new Date(iso).toLocaleDateString(), iso, logins: row.count };
              });
              if (!chartData.some((d: any) => d.iso === nowIso)) {
                chartData.push({ iso: nowIso, date: new Date().toLocaleDateString(), logins: 1 });
              }
              setLoginActivity(chartData);
            }
          } catch {}
        }
      }
    }, 60 * 1000);

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
          duration: 10000
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
          duration: 10000
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
            duration: 10000
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
          duration: 10000
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('fresherDataUpdated', handleFresherDataUpdate as EventListener);

    // Cleanup interval and event listener on component unmount
    return () => {
      clearInterval(refreshInterval);
      clearInterval(todayCheck);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fresherDataUpdated', handleFresherDataUpdate as EventListener);
    };
  }, [navigate, toast, todayIso]);

  const handleResumeParse = async (skills: string[]) => {
    try {
      if (!fresher?.id) {
        toast({
          title: "Error",
          description: "Unable to update skills. Please refresh the page and try again.",
          variant: "destructive",
          duration: 10000
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
          duration: 10000
        });
      } else {
        throw new Error('Failed to update skills');
      }
    } catch (error) {
      console.error('Error updating skills:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
        duration: 10000
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
          variant: "destructive",
          duration: 10000
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

        // Refresh login activity
        try {
          const activity = await authAPI.getLoginActivity(currentUser.id);
          if (activity?.success) {
            const chartData = activity.data.map((row: any) => {
              const iso = typeof row.login_date === 'string' ? row.login_date : toLocalISO(new Date(row.login_date));
              return {
                date: new Date(iso).toLocaleDateString(),
                iso,
                logins: row.count
              };
            });
            const todayIso = toLocalISO(new Date());
            if (!chartData.some((d: any) => d.iso === todayIso)) {
              chartData.push({ iso: todayIso, date: new Date().toLocaleDateString(), logins: 1 });
            }
            setLoginActivity(chartData);
          }
        } catch {}

        toast({
          title: "Dashboard Refreshed",
          description: "Your dashboard has been updated with the latest data.",
          duration: 10000
        });
      } else {
        throw new Error('Failed to refresh data');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
        duration: 10000
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
        variant: "destructive",
        duration: 10000
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
      <header className={`p-6 ${
        darkMode 
          ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white' 
          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Welcome, <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent font-black">{fresher?.name}</span>
              </h1>
              <p className="text-lg font-medium text-blue-100 mt-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {fresher?.department} • Joined {new Date(fresher?.joinDate).toLocaleDateString()}
              </p>
              {isAutoRefreshing && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-200">Auto-updating...</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-4xl font-black text-white drop-shadow-lg" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {fresher?.overallProgress}%
              </div>
              <div className="text-blue-100 text-base font-medium mt-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Overall Progress
              </div>
            </div>
            <Button 
              variant="outline" 
              className={`${
                darkMode 
                  ? 'bg-gray-800/50 border-gray-600 text-gray-200 hover:bg-gray-700/50 hover:border-gray-500' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
              onClick={toggleDarkMode}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            {/* Feedback Button */}
            <Button 
              variant="outline" 
              className={`${
                darkMode 
                  ? 'bg-gray-800/50 border-gray-600 text-gray-200 hover:bg-gray-700/50 hover:border-gray-500' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
              onClick={handleFeedback}
            >
              <Activity className="w-4 h-4 mr-2" />
              Feedback
            </Button>
             
            
            {/* Dropdown Menu for Actions */}
            <div className="relative">
              <Button 
                variant="outline" 
                className={`${
                  darkMode 
                    ? 'bg-gray-800/50 border-gray-600 text-gray-200 hover:bg-gray-700/50 hover:border-gray-500' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="mr-2">Actions</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}>
                  <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
              
              {showDropdown && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleManualRefresh();
                        setShowDropdown(false);
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      disabled={loading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                     
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowDropdown(false);
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                    <button
                      onClick={() => {
                        setShowChangePassword(true);
                        setShowDropdown(false);
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <span className="mr-2">🔒</span> Change Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Training Status Dashboard */}
        <section>
          <h2 className="text-2xl font-bold mb-6 dashboard-heading bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Current Training Status</h2>
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

            <Card className="bg-gradient-to-br from-slate-200 to-gray-300 border-0 shadow-lg training-card-hover training-card-neon-purple cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  {getStatusBadge(fresher?.trainingStatus?.certification)}
                </div>
                <CardTitle className={`text-lg dashboard-card-title ${darkMode ? 'text-black' : ''}`}>Certification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-black' : 'text-purple-600'}`}>
                  {fresher?.assessmentScores?.certificationScore}%
                </div>
                <p className={`text-sm ${darkMode ? 'text-black' : 'text-muted-foreground'}`}>Latest Score</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Enhanced Training Workflow */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold dashboard-heading bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Training Workflow
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
                Track your progress through the training pipeline
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-blue-50'} border ${darkMode ? 'border-gray-700' : 'border-blue-200'}`}>
              <span className={`text-sm font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {Math.round((workflowSteps.filter(step => step.completed).length / workflowSteps.length) * 100)}% Complete
              </span>
            </div>
          </div>

          <div className={`rounded-2xl overflow-hidden shadow-2xl ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-white via-blue-50 to-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Progress Header */}
            <div className={`p-8 ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-sm`}>
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Workflow Progress</h3>
                  <p className="text-white/80">Your training journey progress</p>
                </div>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Completion</span>
                  <span className="text-sm font-bold">
                    {workflowSteps.filter(step => step.completed).length} of {workflowSteps.length} steps
                  </span>
                </div>
                <div className="relative">
                  <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-white/30'} overflow-hidden`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        darkMode 
                          ? 'bg-gradient-to-r from-green-400 to-blue-400' 
                          : 'bg-gradient-to-r from-green-500 to-blue-500'
                      } shadow-lg`}
                      style={{ 
                        width: `${(workflowSteps.filter(step => step.completed).length / workflowSteps.length) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white drop-shadow-lg">
                      {Math.round((workflowSteps.filter(step => step.completed).length / workflowSteps.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="p-8 space-y-6">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = step.completed;
                const isLast = index === workflowSteps.length - 1;
                
                return (
                  <div key={step.id} className="relative">
                    {/* Connection Line - Removed green line */}
                    {!isLast && (
                      <div className={`absolute left-6 top-16 w-0.5 h-8 ${
                        darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`} />
                    )}
                    
                    <div className={`group relative flex items-start gap-6 p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                      isCompleted
                        ? darkMode 
                          ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-700/50 hover:from-green-800/50 hover:to-emerald-800/50' 
                          : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:from-green-100 hover:to-emerald-100'
                        : darkMode 
                          ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:from-gray-700 hover:to-gray-800' 
                          : 'bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:from-gray-100 hover:to-white'
                    } shadow-lg hover:shadow-xl`}>
                      
                      {/* Step Icon */}
                      <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? darkMode 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25' 
                            : 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                          : darkMode 
                            ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-400' 
                            : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500'
                      } group-hover:scale-110`}>
                        {isCompleted ? (
                          <CheckCircle className="w-7 h-7" />
                        ) : (
                          <Icon className="w-7 h-7" />
                        )}
                        
                        {/* Pulse Animation for Completed Steps */}
                        {isCompleted && (
                          <div className="absolute inset-0 rounded-2xl bg-green-500 animate-ping opacity-20" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-blue-600 transition-colors`}>
                            {step.label}
                          </h4>
                          <Badge 
                            variant={isCompleted ? "default" : "secondary"} 
                            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
                              isCompleted
                                ? darkMode 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                                : darkMode 
                                  ? 'bg-gray-600 text-gray-300' 
                                  : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {isCompleted ? "Completed" : "Pending"}
                          </Badge>
                        </div>
                        
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                          Step {index + 1} of {workflowSteps.length}
                        </div>
                        
                        {/* Step Details */}
                        <div className="space-y-2">
                          {step.id === 'quiz' && (
                            <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`} />
                              Score: {fresher?.assessmentScores?.quizScore || 0}%
                            </div>
                          )}
                          {step.id === 'coding' && (
                            <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`} />
                              Score: {fresher?.assessmentScores?.codingScore || 0}%
                            </div>
                          )}
                          {step.id === 'assignment' && (
                            <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`} />
                              Score: {fresher?.assessmentScores?.assignmentScore || 0}%
                            </div>
                          )}
                          {step.id === 'certification' && (
                            <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`} />
                              Score: {fresher?.assessmentScores?.certificationScore || 0}%
                            </div>
                          )}
                          {step.id === 'profile' && (
                            <div className="space-y-1">
                              {fresher?.skills && fresher.skills.length > 0 ? (
                                <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                  <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-600'}`} />
                                  ✓ Skills extracted ({fresher.skills.length} skills)
                                </div>
                              ) : (
                                <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                  <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-500' : 'bg-gray-500'}`} />
                                  No skills extracted yet
                                </div>
                              )}
                              {fresher?.resumeUploaded && (
                                <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                  <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`} />
                                  ✓ Resume uploaded
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Quiz Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold dashboard-heading">
              <span className="text-2xl">🧠</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Quick Quiz Challenge</span>
            </h2>
            <Button 
              onClick={() => setShowQuiz(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Start Quiz
            </Button>
          </div>
          
          {showQuiz && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {getRecommendedCourseName(fresher?.skills || [])} Quiz
                    </h3>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowQuiz(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <QuizComponent 
                    courseName={getRecommendedCourseName(fresher?.skills || [])}
                    onClose={() => setShowQuiz(false)}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Skills & Profile */}
        <section>
          <h2 className="text-2xl font-bold mb-6 dashboard-heading bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your Profile</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Your Profile Card - Enhanced with hover effects */}
            <Card className={`border-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${
              darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 hover:from-blue-100 hover:to-indigo-200'
            }`}>
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl">
                    <User className="w-12 h-12 text-white transition-transform duration-300 hover:rotate-12" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 dashboard-heading gradient-text-blue-purple transition-all duration-300 hover:scale-105">
                      {fresher?.name}
                    </h3>
                    <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'} dashboard-body transition-colors duration-300 hover:text-blue-600`}>{fresher?.email}</p>
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md ${
                        darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white/80 backdrop-blur-sm border border-blue-200/50 hover:bg-white hover:border-blue-300'
                      }`}>
                        <span className={`font-semibold text-sm uppercase tracking-wide transition-colors duration-300 hover:text-blue-600 ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>Department</span>
                        <div className={`text-lg font-medium transition-colors duration-300 hover:text-blue-700 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{fresher?.department}</div>
                      </div>
                      <div>
                        <span className={`font-semibold text-sm uppercase tracking-wide mb-3 block transition-colors duration-300 hover:text-blue-600 ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>
                          💼 Skills & Expertise
                        </span>
                        <div className="space-y-3">
                          {fresher?.skills && fresher.skills.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {fresher.skills.map((skill, index) => (
                                <div
                                  key={skill}
                                  className={`group relative overflow-hidden rounded-xl p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer ${
                                    darkMode 
                                      ? 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 hover:from-blue-600 hover:to-blue-700 hover:border-blue-500' 
                                      : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300'
                                  }`}
                                >
                                  {/* Animated background effect */}
                                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                                    darkMode ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20' : 'bg-gradient-to-r from-blue-400/10 to-purple-400/10'
                                  }`} />
                                  
                                  {/* Skill content */}
                                  <div className="relative z-10 flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                      darkMode 
                                        ? 'bg-blue-400 group-hover:bg-white' 
                                        : 'bg-blue-600 group-hover:bg-blue-700'
                                    }`} />
                                    <span className={`font-medium text-sm transition-all duration-300 ${
                                      darkMode 
                                        ? 'text-gray-300 group-hover:text-white' 
                                        : 'text-gray-700 group-hover:text-blue-800'
                                    }`}>
                                      {skill}
                                    </span>
                                  </div>
                                  
                                  {/* Skill level indicator */}
                                  <div className="mt-2">
                                    <div className={`w-full h-1 rounded-full overflow-hidden ${
                                      darkMode ? 'bg-gray-600' : 'bg-gray-200'
                                    }`}>
                                      <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          darkMode 
                                            ? 'bg-gradient-to-r from-blue-400 to-purple-400' 
                                            : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                        }`}
                                        style={{ 
                                          width: `${Math.min(85 + (index * 5), 100)}%`,
                                          animationDelay: `${index * 0.1}s`
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className={`text-center py-6 rounded-xl border-2 border-dashed transition-all duration-300 hover:border-solid ${
                              darkMode 
                                ? 'border-gray-600 hover:border-blue-500 bg-gray-800/50' 
                                : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                            }`}>
                              <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                                darkMode ? 'bg-gray-700' : 'bg-gray-200'
                              }`}>
                                <span className="text-2xl">💼</span>
                              </div>
                              <p className={`text-sm font-medium transition-colors duration-300 ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                No skills listed yet
                              </p>
                              <p className={`text-xs mt-1 transition-colors duration-300 ${
                                darkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                Upload your resume to extract skills
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Skills summary */}
                        {fresher?.skills && fresher.skills.length > 0 && (
                          <div className={`mt-4 p-3 rounded-lg transition-all duration-300 ${
                            darkMode 
                              ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700' 
                              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-medium transition-colors duration-300 ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Skills Summary
                              </span>
                              <span className={`text-xs font-bold transition-colors duration-300 ${
                                darkMode ? 'text-blue-400' : 'text-blue-600'
                              }`}>
                                {fresher.skills.length} skills
                              </span>
                            </div>
                            <div className={`mt-2 h-1 rounded-full overflow-hidden ${
                              darkMode ? 'bg-gray-700' : 'bg-gray-200'
                            }`}>
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  darkMode 
                                    ? 'bg-gradient-to-r from-green-400 to-blue-400' 
                                    : 'bg-gradient-to-r from-green-500 to-blue-500'
                                }`}
                                style={{ width: `${Math.min((fresher.skills.length / 10) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Schedules Card - Enhanced with hover effects */}
            <Card className={`border-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${
              darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 hover:from-green-100 hover:to-emerald-200'
            }`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 transition-all duration-300 hover:scale-105 ${darkMode ? 'text-white' : 'text-green-800'} dashboard-card-title`}>
                  <GraduationCap className={`w-5 h-5 transition-transform duration-300 hover:rotate-12 ${darkMode ? 'text-blue-400' : 'text-green-600'}`} />
                  Training Schedules
                </CardTitle>
                <CardDescription className={`transition-colors duration-300 hover:text-green-600 ${darkMode ? 'text-gray-300' : 'text-green-700'}`}>
                  Your assigned training program with video courses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(fresher?.trainingSchedule || (fresher?.skills && fresher.skills.length > 0)) ? (
                  <div className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    darkMode 
                      ? 'bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 hover:from-gray-600 hover:to-gray-700' 
                      : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:from-green-100 hover:to-emerald-100'
                  }`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md">
                        <BookOpen className="w-5 h-5 text-white transition-transform duration-300 hover:rotate-12" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-lg leading-tight transition-colors duration-300 hover:text-green-700 ${darkMode ? 'text-white' : ''}`}>
                          {fresher?.trainingSchedule?.courseName || getRecommendedCourseName(fresher?.skills || [])}
                        </h4>
                        {fresher?.trainingSchedule?.description && (
                          <p className={`text-sm mt-1 transition-colors duration-300 hover:text-green-600 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {fresher?.trainingSchedule?.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md ${
                        darkMode ? 'bg-gray-600/50 hover:bg-gray-500/50' : 'bg-white/50 hover:bg-white/70'
                      }`}>
                        <Calendar className={`w-4 h-4 transition-colors duration-300 hover:text-blue-600 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <div>
                          <span className={`text-xs font-medium uppercase tracking-wide transition-colors duration-300 hover:text-blue-600 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Starting Date
                          </span>
                          <div className={`font-medium transition-colors duration-300 hover:text-blue-700 ${darkMode ? 'text-white' : ''}`}>
                            {fresher?.trainingSchedule?.startingDate ? 
                              new Date(fresher?.trainingSchedule?.startingDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) :
                              new Date().toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md ${
                        darkMode ? 'bg-gray-600/50 hover:bg-gray-500/50' : 'bg-white/50 hover:bg-white/70'
                      }`}>
                        <Clock className={`w-4 h-4 transition-colors duration-300 hover:text-blue-600 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <div>
                          <span className={`text-xs font-medium uppercase tracking-wide transition-colors duration-300 hover:text-blue-600 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Duration
                          </span>
                          <div className={`font-medium transition-colors duration-300 hover:text-blue-700 ${darkMode ? 'text-white' : ''}`}>
                            {recommendCourse(fresher?.skills || [])}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Video Courses Section */}
                    <div className="mt-6">
                      <h5 className={`font-semibold text-sm mb-3 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        📺 Recommended Video Courses
                      </h5>
                      <div className="space-y-3">
                        {(() => {
                          const recommendedCourse = courses.find(course => 
                            course.name === getRecommendedCourseName(fresher?.skills || [])
                          );
                          return recommendedCourse?.videoCourses?.slice(0, 2).map((course, index) => (
                            <div 
                              key={index}
                              className={`p-3 rounded-lg border transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer ${
                                darkMode 
                                  ? 'bg-gray-600/30 border-gray-600 hover:bg-gray-600/50' 
                                  : 'bg-white/50 border-gray-200 hover:bg-white/70'
                              }`}
                              onClick={() => window.open(course.url, '_blank')}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h6 className={`font-medium text-sm transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {course.title}
                                  </h6>
                                  <p className={`text-xs mt-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {course.description}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className={`text-xs transition-colors duration-300 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                      {course.provider}
                                    </span>
                                    <span className={`text-xs transition-colors duration-300 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                      ⭐ {course.rating}
                                    </span>
                                    <span className={`text-xs transition-colors duration-300 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                      {course.duration}
                                    </span>
                                  </div>
                                </div>
                                <div className={`text-xs font-bold px-2 py-1 rounded transition-all duration-300 ${
                                  course.price === 'Free' 
                                    ? darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                                    : darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                                }`}>
                                  {course.price}
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                      
                      {/* View All Courses Button */}
                      <Button 
                        onClick={() => {
                          const recommendedCourse = courses.find(course => 
                            course.name === getRecommendedCourseName(fresher?.skills || [])
                          );
                          if (recommendedCourse?.videoCourses) {
                            // Open all courses in a new tab or show a modal
                            window.open(`https://www.udemy.com/topic/${recommendedCourse.name.toLowerCase().replace(' ', '-')}/`, '_blank');
                          }
                        }}
                        className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium py-2 rounded-lg transition-all duration-300 hover:scale-105"
                      >
                        🎓 View All Courses
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                    <GraduationCap className={`w-8 h-8 mx-auto mb-2 transition-transform duration-300 hover:rotate-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`transition-colors duration-300 hover:text-blue-600 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Training course assignment pending
                    </p>
                    <p className={`text-sm mt-1 transition-colors duration-300 hover:text-blue-500 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Upload your resume to get course recommendations
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Resume Parser - Enhanced with hover effects */}
            <div className={`transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${
              darkMode ? '' : 'bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200 hover:from-purple-100 hover:to-pink-200'
            }`}>
              <ResumeUploader
                title="AI Resume Parser"
                description="Upload your resume to automatically extract skills and recommend courses"
                onParse={handleResumeParse}
                onError={(error) => console.error('Resume parsing error:', error)}
                showParseButton
                maxFileSize={10}
                allowedTypes={['.pdf', '.docx']}
                showCourseRecommendation
                className={`transition-all duration-300 hover:scale-105 ${
                  darkMode ? '' : 'bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200 hover:from-purple-100 hover:to-pink-200'
                }`}
              />
            </div>
          </div>
        </section>

        {/* Login Activity Graph */}
        <section>
          <h2 className="text-2xl font-bold mb-6 dashboard-heading bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Login Activity</h2>
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}>
            <CardContent className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  className={`${darkMode ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                </div>
                <button
                  className={`${darkMode ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  aria-label="Next month"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 text-xs font-semibold mb-2">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-center`}>{d}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              {(() => {
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth();
                const start = new Date(year, month, 1);
                const end = new Date(year, month + 1, 0);
                const startOffset = start.getDay();
                const totalDays = end.getDate();
                const loginDates = new Set(loginActivity.map(a => a.iso));

                const cells: JSX.Element[] = [];
                for (let i = 0; i < startOffset; i++) {
                  cells.push(<div key={`empty-${i}`} className="h-16 border rounded-lg bg-transparent"></div>);
                }
                // Helper dates
                const joinDateObj = fresher?.joinDate ? new Date(fresher.joinDate) : null;
                const todayObj = new Date();
                const todayMidnight = new Date(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate());

                for (let day = 1; day <= totalDays; day++) {
                  const dateObj = new Date(year, month, day);
                  const iso = toLocalISO(dateObj);
                  const hasLogin = loginDates.has(iso);
                  const isAfterJoin = joinDateObj ? dateObj >= new Date(joinDateObj.getFullYear(), joinDateObj.getMonth(), joinDateObj.getDate()) : true;
                  const isPastOrToday = dateObj <= todayMidnight;
                  cells.push(
                    <div
                      key={iso}
                      className={`h-16 rounded-lg p-2 flex flex-col justify-between border ${
                        darkMode ? 'border-gray-700' : 'border-gray-200'
                      } ${hasLogin ? (darkMode ? 'bg-green-700/40' : 'bg-green-100') : ''}`}
                    >
                      <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{day}</div>
                      {hasLogin && (
                        <div className="text-xs font-semibold text-green-600 dark:text-green-300 self-end">Login ✓</div>
                      )}
                      {!hasLogin && isAfterJoin && isPastOrToday && (
                        <div className="text-xs font-semibold text-red-600 dark:text-red-400 self-end">Not login</div>
                      )}
                    </div>
                  );
                }

                return <div className="grid grid-cols-7 gap-2">{cells}</div>;
              })()}

              {loginActivity.length === 0 && (
                <div className={`text-center mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No login activity yet</div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
      
      {/* Chatbot */}
      <Chatbot />
      
      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl shadow-2xl max-w-2xl w-full p-8 text-center relative overflow-hidden">
            {/* Confetti Animation */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            
            {/* Celebration Content */}
            <div className="relative z-10">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h1 className="text-4xl font-black text-white mb-4 drop-shadow-lg">
                COURSE COMPLETED!
              </h1>
              <div className="text-2xl font-bold text-white mb-6 drop-shadow-lg">
                Congratulations, {fresher?.name}! 🏆
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  {getRecommendedCourseName(fresher?.skills || [])} - 100% Complete
                </h2>
                <div className="grid grid-cols-2 gap-4 text-white">
                  <div className="text-center">
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-sm">Daily Quiz</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-sm">Coding Challenge</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-sm">Assignment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-sm">Certification</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-white/90 text-lg">
                  You've successfully completed all training modules! 🚀
                </p>
                <p className="text-white/80">
                  Your dedication and hard work have paid off. You're now ready for the next challenge!
                </p>
              </div>
              
              <Button 
                onClick={() => setShowCelebration(false)}
                className="mt-6 bg-white text-orange-600 hover:bg-gray-100 font-bold px-8 py-3 rounded-xl shadow-lg"
              >
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Password Change Modal */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              disabled={changingPassword}
            />
            <Input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              disabled={changingPassword}
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={changingPassword}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!oldPassword || !newPassword || !confirmPassword) {
                  toast({ title: "All fields are required", variant: "destructive" });
                  return;
                }
                if (newPassword !== confirmPassword) {
                  toast({ title: "Passwords do not match", variant: "destructive" });
                  return;
                }
                setChangingPassword(true);
                try {
                  const currentUser = getCurrentUser();
                  const res = await fetch("http://localhost:5000/api/auth/change-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: currentUser.email,
                      oldPassword,
                      newPassword,
                      role: "fresher"
                    })
                  });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    toast({ title: "Password changed successfully!", duration: 8000 });
                    setShowChangePassword(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  } else {
                    toast({ title: data.message || "Failed to change password", variant: "destructive" });
                  }
                } catch (err) {
                  toast({ title: "Error changing password", variant: "destructive" });
                } finally {
                  setChangingPassword(false);
                }
              }}
              disabled={changingPassword}
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </Button>
            <Button variant="outline" onClick={() => setShowChangePassword(false)} disabled={changingPassword}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Quiz Component
const QuizComponent = ({ courseName, onClose }: { courseName: string; onClose: () => void }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answered, setAnswered] = useState(false);

  // Quiz questions based on course
  const getQuizQuestions = (course: string) => {
    const questions = {
      "MERN Stack": [
        {
          question: "What does 'MERN' stand for in MERN Stack?",
          options: ["MongoDB, Express, React, Node.js", "MySQL, Express, React, Node.js", "MongoDB, Express, Ruby, Node.js", "MongoDB, Express, React, Next.js"],
          correct: 0,
          explanation: "MERN stands for MongoDB, Express.js, React.js, and Node.js - a popular full-stack JavaScript solution."
        },
        {
          question: "Which hook is used to manage state in React functional components?",
          options: ["useState", "useEffect", "useContext", "All of the above"],
          correct: 0,
          explanation: "useState is the primary hook for managing state in React functional components."
        },
        {
          question: "What is the purpose of Express.js in the MERN stack?",
          options: ["Frontend framework", "Backend web framework", "Database", "Build tool"],
          correct: 1,
          explanation: "Express.js is a minimal and flexible Node.js web application framework for building APIs and web applications."
        },
        {
          question: "Which method is used to connect to MongoDB in Node.js?",
          options: ["mongoose.connect()", "mongo.connect()", "database.connect()", "db.connect()"],
          correct: 0,
          explanation: "mongoose.connect() is the standard method to connect to MongoDB using Mongoose ODM."
        },
        {
          question: "What is JSX in React?",
          options: ["A JavaScript library", "A syntax extension for JavaScript", "A database", "A build tool"],
          correct: 1,
          explanation: "JSX is a syntax extension for JavaScript that allows you to write HTML-like code in JavaScript."
        }
      ],
      "Java Developer": [
        {
          question: "What is the main advantage of using Spring Boot?",
          options: ["Faster development", "Better performance", "Smaller codebase", "All of the above"],
          correct: 3,
          explanation: "Spring Boot provides faster development, better performance, and smaller codebase through auto-configuration."
        },
        {
          question: "Which annotation is used to create a REST controller in Spring?",
          options: ["@Controller", "@RestController", "@Service", "@Repository"],
          correct: 1,
          explanation: "@RestController is a convenience annotation that combines @Controller and @ResponseBody."
        },
        {
          question: "What is dependency injection in Spring?",
          options: ["A design pattern", "A database concept", "A testing framework", "A build tool"],
          correct: 0,
          explanation: "Dependency injection is a design pattern where dependencies are provided to objects rather than created by them."
        },
        {
          question: "Which method is used to handle GET requests in Spring?",
          options: ["@GetMapping", "@PostMapping", "@PutMapping", "@DeleteMapping"],
          correct: 0,
          explanation: "@GetMapping is used to handle HTTP GET requests in Spring Boot."
        },
        {
          question: "What is the purpose of @Autowired annotation?",
          options: ["To create beans", "To inject dependencies", "To configure properties", "To handle requests"],
          correct: 1,
          explanation: "@Autowired is used to inject dependencies automatically by Spring's dependency injection container."
        }
      ],
      "Python Developer": [
        {
          question: "What is the difference between a list and a tuple in Python?",
          options: ["Lists are mutable, tuples are immutable", "Tuples are mutable, lists are immutable", "No difference", "Lists can only contain numbers"],
          correct: 0,
          explanation: "Lists are mutable (can be changed), while tuples are immutable (cannot be changed after creation)."
        },
        {
          question: "Which framework is used for web development in Python?",
          options: ["Django", "Flask", "Both Django and Flask", "None of the above"],
          correct: 2,
          explanation: "Both Django and Flask are popular Python web frameworks, with Django being more full-featured and Flask being more lightweight."
        },
        {
          question: "What is a virtual environment in Python?",
          options: ["A separate Python installation", "An isolated environment for dependencies", "A type of loop", "A database"],
          correct: 1,
          explanation: "A virtual environment is an isolated Python environment that allows you to install packages without affecting the system Python."
        },
        {
          question: "How do you define a function in Python?",
          options: ["function name():", "def name():", "func name():", "define name():"],
          correct: 1,
          explanation: "Functions in Python are defined using the 'def' keyword followed by the function name and parameters."
        },
        {
          question: "What is the purpose of __init__ method in Python?",
          options: ["To initialize a class", "To create a function", "To import modules", "To handle errors"],
          correct: 0,
          explanation: "__init__ is a special method (constructor) that is called when creating a new instance of a class."
        }
      ],
      "Data Analytics": [
        {
          question: "What is the primary purpose of pandas in data analysis?",
          options: ["Data visualization", "Data manipulation and analysis", "Machine learning", "Web development"],
          correct: 1,
          explanation: "Pandas is primarily used for data manipulation and analysis, providing powerful data structures like DataFrames."
        },
        {
          question: "Which library is commonly used for data visualization in Python?",
          options: ["matplotlib", "seaborn", "plotly", "All of the above"],
          correct: 3,
          explanation: "All three libraries (matplotlib, seaborn, plotly) are commonly used for data visualization in Python."
        },
        {
          question: "What is the purpose of SQL in data analytics?",
          options: ["To create websites", "To query and manipulate databases", "To write Python code", "To create visualizations"],
          correct: 1,
          explanation: "SQL (Structured Query Language) is used to query and manipulate data stored in relational databases."
        },
        {
          question: "What is the difference between mean and median?",
          options: ["Mean is the middle value, median is the average", "Mean is the average, median is the middle value", "No difference", "Mean is always larger"],
          correct: 1,
          explanation: "Mean is the average of all values, while median is the middle value when data is sorted."
        },
        {
          question: "Which tool is essential for data cleaning?",
          options: ["Excel", "Python", "Both Excel and Python", "None of the above"],
          correct: 2,
          explanation: "Both Excel and Python are essential tools for data cleaning, with Python being more powerful for large datasets."
        }
      ]
    };

    return questions[course as keyof typeof questions] || questions["MERN Stack"];
  };

  const questions = getQuizQuestions(courseName);
  const currentQ = questions[currentQuestion];

  const handleAnswerSelect = (answerIndex: number) => {
    if (answered) return;
    setSelectedAnswer(answerIndex);
    setAnswered(true);
    
    if (answerIndex === currentQ.correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    setAnswered(false);
  };

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-white">{percentage}%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Quiz Complete!
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            You scored {score} out of {questions.length} questions correctly.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleRestart}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-3 rounded-xl"
          >
            Take Quiz Again
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            className="ml-4 px-8 py-3 rounded-xl"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Score: {score}/{questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {currentQ.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {currentQ.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            disabled={answered}
            className={`w-full p-4 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
              selectedAnswer === index
                ? index === currentQ.correct
                  ? 'bg-green-100 border-2 border-green-500 text-green-800 dark:bg-green-900/50 dark:border-green-400 dark:text-green-200'
                  : 'bg-red-100 border-2 border-red-500 text-red-800 dark:bg-red-900/50 dark:border-red-400 dark:text-red-200'
                : answered && index === currentQ.correct
                ? 'bg-green-100 border-2 border-green-500 text-green-800 dark:bg-green-900/50 dark:border-green-400 dark:text-green-200'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 text-gray-900 dark:text-white'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                selectedAnswer === index
                  ? index === currentQ.correct
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-red-500 bg-red-500 text-white'
                  : answered && index === currentQ.correct
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {selectedAnswer === index || (answered && index === currentQ.correct) ? (
                  index === currentQ.correct ? '✓' : '✗'
                ) : (
                  String.fromCharCode(65 + index) // A, B, C, D
                )}
              </div>
              <span className="font-medium">{option}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Explanation */}
      {answered && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💡 Explanation:
          </h4>
          <p className="text-blue-700 dark:text-blue-300">
            {currentQ.explanation}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button 
          onClick={onClose}
          variant="outline"
          className="px-6 py-2 rounded-xl"
        >
          Exit Quiz
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!answered}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </div>
    </div>
  );
};

export default FresherDashboard;