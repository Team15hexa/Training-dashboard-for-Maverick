import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useDarkMode } from "@/contexts/DarkModeContext";
import {
  Users,
  User,
  Search,
  Download,
  Award,
  Plus,
  Edit,
  Trash2,
  Filter,
  Brain,
  Zap,
  Eye
} from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const ManageFreshers = () => {
  const [freshersData, setFreshersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { darkMode, toggleDarkMode, isTransitioning } = useDarkMode();
  const { toast } = useToast();
  
  // Filter states
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDepartmentsOnly, setShowDepartmentsOnly] = useState<boolean>(false);

  // Add Fresher states
  const [addFresherOpen, setAddFresherOpen] = useState(false);
  const [addFresherLoading, setAddFresherLoading] = useState(false);
  const [addFresherError, setAddFresherError] = useState("");
  const [fresherName, setFresherName] = useState("");
  const [fresherDepartment, setFresherDepartment] = useState("");
  const [fresherEmail, setFresherEmail] = useState("");



  // Edit Fresher states
  const [editFresherOpen, setEditFresherOpen] = useState(false);
  const [editFresherLoading, setEditFresherLoading] = useState(false);
  const [selectedFresher, setSelectedFresher] = useState<any>(null);
  const [editQuizScore, setEditQuizScore] = useState("");
  const [editCodingScore, setEditCodingScore] = useState("");
  const [editAssignmentScore, setEditAssignmentScore] = useState("");
  const [editCertificationScore, setEditCertificationScore] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [editSkillsArray, setEditSkillsArray] = useState<string[]>([]);

  // Delete Fresher states
  const [deleteFresherOpen, setDeleteFresherOpen] = useState(false);
  const [deleteFresherLoading, setDeleteFresherLoading] = useState(false);
  const [fresherToDelete, setFresherToDelete] = useState<any>(null);

  // View Credentials states
  const [viewCredentialsOpen, setViewCredentialsOpen] = useState(false);
  const [selectedFresherCredentials, setSelectedFresherCredentials] = useState<any>(null);

  // AI Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Filter functions
  const getFilteredFreshers = () => {
    if (!freshersData) return [];
    
    let filtered = freshersData;
    
    // Filter by department
    if (departmentFilter !== 'all') {
      filtered = filtered.filter((fresher: any) => 
        fresher.department.toLowerCase().includes(departmentFilter.toLowerCase())
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((fresher: any) => 
        fresher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fresher.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fresher.skills.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Get unique departments from data
  const getUniqueDepartments = () => {
    if (!freshersData) return [];
    
    const departments = freshersData.map((fresher: any) => fresher.department);
    return [...new Set(departments)].sort();
  };

  // Get department statistics
  const getDepartmentStats = () => {
    if (!freshersData) return {};
    
    const stats: { [key: string]: number } = {};
    freshersData.forEach((fresher: any) => {
      const dept = fresher.department;
      stats[dept] = (stats[dept] || 0) + 1;
    });
    
    return stats;
  };

  // Handle view credentials
  const handleViewCredentials = (fresher: any) => {
    setSelectedFresherCredentials(fresher);
    setViewCredentialsOpen(true);
  };

  // Fetch freshers data
  const fetchFreshersData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/fresher');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setFreshersData(data);
    } catch (error) {
      console.error('Error fetching freshers data:', error);
      setError('Failed to load freshers data. Please try again.');
      toast({
        title: "Data Error",
        description: "Failed to load freshers data. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreshersData();
  }, []);

  const handleAIExportAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate individual fresher analysis
      const individualAnalyses = freshersData?.map((fresher: any) => {
        const quizScore = parseInt(fresher.quizzes) || 0;
        const codingScore = parseInt(fresher.coding) || 0;
        const assignmentScore = parseInt(fresher.assignments) || 0;
        const overallScore = Math.round((quizScore + codingScore + assignmentScore) / 3);
        
        // AI Performance Assessment
        let performanceLevel = '';
        let performanceColor = '';
        if (overallScore >= 85) {
          performanceLevel = 'Excellent';
          performanceColor = '#10B981';
        } else if (overallScore >= 70) {
          performanceLevel = 'Good';
          performanceColor = '#3B82F6';
        } else if (overallScore >= 50) {
          performanceLevel = 'Average';
          performanceColor = '#F59E0B';
        } else {
          performanceLevel = 'Needs Improvement';
          performanceColor = '#EF4444';
        }
        
        // AI Recommendations based on individual performance
        const recommendations = [];
        if (quizScore < 60) {
          recommendations.push('Focus on improving quiz performance through additional study sessions');
        }
        if (codingScore < 60) {
          recommendations.push('Enhance coding skills through practice exercises and mentorship');
        }
        if (assignmentScore < 60) {
          recommendations.push('Improve assignment completion rates with better time management');
        }
        if (overallScore >= 80) {
          recommendations.push('Consider advanced training modules to further develop skills');
        }
        if (recommendations.length === 0) {
          recommendations.push('Maintain current performance level and continue skill development');
        }
        
        // AI Insights for individual
        const insights = [
          `Overall performance score: ${overallScore}%`,
          `Strongest area: ${quizScore > codingScore && quizScore > assignmentScore ? 'Quiz Performance' : codingScore > assignmentScore ? 'Coding Skills' : 'Assignment Completion'}`,
          `Area needing attention: ${quizScore < codingScore && quizScore < assignmentScore ? 'Quiz Performance' : codingScore < assignmentScore ? 'Coding Skills' : 'Assignment Completion'}`,
          `Department ranking: ${fresher.department} department`,
          `Skill development potential: ${overallScore > 70 ? 'High' : overallScore > 50 ? 'Medium' : 'High priority'}`
        ];
        
        return {
          ...fresher,
          overallScore,
          performanceLevel,
          performanceColor,
          recommendations,
          insights
        };
      }) || [];
      
      // Generate AI analysis report data
      const analysisData = {
        timestamp: new Date().toISOString(),
        totalFreshers: freshersData?.length || 0,
        departmentStats: getDepartmentStats(),
        averageQuizScore: Math.round(freshersData?.reduce((sum: number, f: any) => sum + (parseInt(f.quizzes) || 0), 0) / (freshersData?.length || 1)),
        averageCodingScore: Math.round(freshersData?.reduce((sum: number, f: any) => sum + (parseInt(f.coding) || 0), 0) / (freshersData?.length || 1)),
        averageAssignmentScore: Math.round(freshersData?.reduce((sum: number, f: any) => sum + (parseInt(f.assignments) || 0), 0) / (freshersData?.length || 1)),
        individualAnalyses,
        topPerformers: individualAnalyses.filter((f: any) => f.overallScore > 80).slice(0, 5),
        needsImprovement: individualAnalyses.filter((f: any) => f.overallScore < 50).slice(0, 5),
        recommendations: [
          'Implement personalized training paths based on individual performance analysis',
          'Establish peer mentoring program for freshers with similar skill gaps',
          'Develop department-specific advanced modules for high performers',
          'Create targeted intervention programs for freshers needing improvement',
          'Establish regular one-on-one feedback sessions with mentors'
        ],
        insights: [
          `Overall training completion rate: ${Math.round((freshersData?.filter((f: any) => (parseInt(f.quizzes) || 0) > 70).length || 0) / (freshersData?.length || 1) * 100)}%`,
          `Average overall performance: ${Math.round(individualAnalyses.reduce((sum: number, f: any) => sum + f.overallScore, 0) / individualAnalyses.length)}%`,
          `Top performing department: ${Object.entries(getDepartmentStats()).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A'}`,
          `Freshers needing attention: ${individualAnalyses.filter((f: any) => f.overallScore < 50).length}`,
          `High performers (80%+): ${individualAnalyses.filter((f: any) => f.overallScore > 80).length}`
        ],
        trends: [
          'Individual performance analysis reveals diverse skill development needs',
          'Department-specific performance patterns emerging',
          'Personalized training recommendations show higher engagement potential'
        ]
      };
      
      // Create PDF content
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>AI Individual Freshers Analysis Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              margin: 0;
              padding: 40px;
              color: #1f2937;
              line-height: 1.6;
              background: #ffffff;
            }
            
            .header {
              text-align: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 20px;
              margin: -40px -40px 40px -40px;
              border-radius: 0 0 20px 20px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            
            .header p {
              margin: 5px 0;
              opacity: 0.9;
              font-weight: 300;
            }
            
            .section {
              margin-bottom: 40px;
              background: #ffffff;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
              border: 1px solid #e5e7eb;
            }
            
            .section h2 {
              color: #1f2937;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 15px;
              margin-bottom: 25px;
              font-size: 24px;
              font-weight: 600;
            }
            
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            
            .metric-card {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 25px;
              text-align: center;
              transition: transform 0.2s;
            }
            
            .metric-card:hover {
              transform: translateY(-2px);
            }
            
            .metric-value {
              font-size: 32px;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 8px;
            }
            
            .metric-label {
              color: #6b7280;
              font-size: 14px;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .fresher-card {
              background: #ffffff;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 25px;
              margin-bottom: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
              transition: all 0.3s ease;
            }
            
            .fresher-card:hover {
              border-color: #3b82f6;
              box-shadow: 0 8px 25px rgba(59,130,246,0.15);
            }
            
            .fresher-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #f3f4f6;
            }
            
            .fresher-name {
              font-size: 20px;
              font-weight: 600;
              color: #1f2937;
            }
            
            .performance-badge {
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 14px;
              color: white;
            }
            
            .scores-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            
            .score-item {
              text-align: center;
              padding: 15px;
              background: #f8fafc;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            
            .score-value {
              font-size: 24px;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 5px;
            }
            
            .score-label {
              font-size: 12px;
              color: #6b7280;
              font-weight: 500;
              text-transform: uppercase;
            }
            
            .insights-section {
              background: #f0f9ff;
              border: 1px solid #bae6fd;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
            }
            
            .insights-section h4 {
              color: #0369a1;
              margin-bottom: 15px;
              font-weight: 600;
            }
            
            .insights-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            
            .insights-list li {
              margin-bottom: 8px;
              padding-left: 20px;
              position: relative;
              color: #1e293b;
            }
            
            .insights-list li:before {
              content: "•";
              color: #3b82f6;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
            
            .recommendations-section {
              background: #fef3c7;
              border: 1px solid #fbbf24;
              border-radius: 8px;
              padding: 20px;
            }
            
            .recommendations-section h4 {
              color: #92400e;
              margin-bottom: 15px;
              font-weight: 600;
            }
            
            .recommendations-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            
            .recommendations-list li {
              margin-bottom: 8px;
              padding-left: 20px;
              position: relative;
              color: #78350f;
            }
            
            .recommendations-list li:before {
              content: "→";
              color: #f59e0b;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
            
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }
            
            .table th {
              background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
              color: white;
              padding: 15px 12px;
              text-align: left;
              font-weight: 600;
            }
            
            .table td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              color: #374151;
            }
            
            .table tr:hover {
              background: #f8fafc;
            }
            
            .footer {
              margin-top: 50px;
              padding: 30px;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              border-radius: 12px;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
              border: 1px solid #e5e7eb;
            }
            
            .highlight {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              padding: 4px 8px;
              border-radius: 6px;
              font-weight: 600;
              color: #92400e;
            }
            
            .page-break {
              page-break-before: always;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🤖 AI Individual Freshers Analysis Report</h1>
            <p>Mavericks Training Management Platform</p>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="section">
            <h2>📊 Executive Summary</h2>
            <p>This comprehensive AI-powered analysis provides detailed insights into individual fresher performance, 
            highlighting personalized metrics, trends, and actionable recommendations for targeted training optimization.</p>
          </div>
          
          <div class="section">
            <h2>📈 Overall Performance Metrics</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">${analysisData.totalFreshers}</div>
                <div class="metric-label">Total Freshers</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${Math.round(analysisData.individualAnalyses.reduce((sum: number, f: any) => sum + f.overallScore, 0) / analysisData.individualAnalyses.length)}%</div>
                <div class="metric-label">Average Overall Score</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${analysisData.averageQuizScore}%</div>
                <div class="metric-label">Average Quiz Score</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${analysisData.averageCodingScore}%</div>
                <div class="metric-label">Average Coding Score</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${analysisData.averageAssignmentScore}%</div>
                <div class="metric-label">Average Assignment Score</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${analysisData.topPerformers.length}</div>
                <div class="metric-label">High Performers (80%+)</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>🏢 Department Statistics</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Count</th>
                  <th>Average Performance</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(analysisData.departmentStats).map(([dept, count]) => {
                  const deptFreshers = analysisData.individualAnalyses.filter((f: any) => f.department === dept);
                  const avgPerformance = deptFreshers.length > 0 
                    ? Math.round(deptFreshers.reduce((sum: number, f: any) => sum + f.overallScore, 0) / deptFreshers.length)
                    : 0;
                  return `<tr><td>${dept}</td><td>${count}</td><td>${avgPerformance}%</td></tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2>💡 AI Platform Insights</h2>
            <div class="insights-section">
              <ul class="insights-list">
                ${analysisData.insights.map(insight => `<li>${insight}</li>`).join('')}
              </ul>
            </div>
          </div>
          
          <div class="section">
            <h2>📈 Trends Analysis</h2>
            <div class="insights-section">
              <ul class="insights-list">
                ${analysisData.trends.map(trend => `<li>${trend}</li>`).join('')}
              </ul>
            </div>
          </div>
          
          <div class="section">
            <h2>🎯 AI Platform Recommendations</h2>
            <div class="recommendations-section">
              <ul class="recommendations-list">
                ${analysisData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
              </ul>
            </div>
          </div>
          
          <div class="page-break"></div>
          
          <div class="section">
            <h2>👥 Individual Fresher Analysis</h2>
            ${analysisData.individualAnalyses.map((fresher: any) => `
              <div class="fresher-card">
                <div class="fresher-header">
                  <div class="fresher-name">${fresher.name}</div>
                  <div class="performance-badge" style="background-color: ${fresher.performanceColor}">
                    ${fresher.performanceLevel} (${fresher.overallScore}%)
                  </div>
                </div>
                
                <div class="scores-grid">
                  <div class="score-item">
                    <div class="score-value">${fresher.quizzes}%</div>
                    <div class="score-label">Quiz Score</div>
                  </div>
                  <div class="score-item">
                    <div class="score-value">${fresher.coding}%</div>
                    <div class="score-label">Coding Score</div>
                  </div>
                  <div class="score-item">
                    <div class="score-value">${fresher.assignments}%</div>
                    <div class="score-label">Assignment Score</div>
                  </div>
                </div>
                
                <div class="insights-section">
                  <h4>🔍 AI Insights for ${fresher.name}</h4>
                  <ul class="insights-list">
                    ${fresher.insights.map((insight: string) => `<li>${insight}</li>`).join('')}
                  </ul>
                </div>
                
                <div class="recommendations-section">
                  <h4>🎯 Personalized Recommendations</h4>
                  <ul class="recommendations-list">
                    ${fresher.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="section">
            <h2>🚀 Action Items</h2>
            <p>Based on the comprehensive AI analysis, consider implementing the following priority actions:</p>
            <ol>
              <li><span class="highlight">Immediate:</span> Review and support freshers with overall scores below 50%</li>
              <li><span class="highlight">Short-term:</span> Implement personalized training paths based on individual analysis</li>
              <li><span class="highlight">Medium-term:</span> Establish peer mentoring program for similar skill gaps</li>
              <li><span class="highlight">Long-term:</span> Develop advanced modules for high performers</li>
            </ol>
          </div>
          
          <div class="footer">
            <p>This report was generated using advanced AI analysis of individual fresher data from Mavericks Platform.</p>
            <p>For questions or support, contact the training management team.</p>
          </div>
        </body>
        </html>
      `;
      
      // Create PDF using jsPDF and html2canvas
      const { jsPDF } = await import('jspdf');
      const html2canvas = await import('html2canvas');
      
      // Create a temporary div to render the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = pdfContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      document.body.appendChild(tempDiv);
      
      // Convert HTML to canvas
      const canvas = await html2canvas.default(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 800,
        height: tempDiv.scrollHeight
      });
      
      // Remove temporary div
      document.body.removeChild(tempDiv);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download the PDF
      pdf.save(`ai-freshers-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
      
    toast({
        title: "AI Analysis Complete",
        description: "PDF analysis report has been exported successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error('AI Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate AI analysis PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddFresher = () => setAddFresherOpen(true);

  const handleEditFresher = async (fresher: any) => {
    setSelectedFresher(fresher);
    setEditQuizScore(fresher.quizzes || "");
    setEditCodingScore(fresher.coding || "");
    setEditAssignmentScore(fresher.assignments || "");
    setEditCertificationScore(fresher.certifications || "");
    
    // Handle skills parsing - could be JSON array or comma-separated string
    let skillsString = "";
    if (fresher.skills) {
      try {
        // Try to parse as JSON array first
        const skillsArray = JSON.parse(fresher.skills);
        if (Array.isArray(skillsArray)) {
          skillsString = skillsArray.join(", ");
          setEditSkillsArray(skillsArray);
        } else {
          // Fallback to comma-separated string
          skillsString = fresher.skills;
          setEditSkillsArray(fresher.skills.split(',').map(s => s.trim()));
        }
      } catch (e) {
        // If JSON parsing fails, treat as comma-separated string
        skillsString = fresher.skills;
        setEditSkillsArray(fresher.skills.split(',').map(s => s.trim()));
      }
    }
    setEditSkills(skillsString);
    setEditFresherOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFresherLoading(true);
    
    try {
      // Convert skills string to array
      const skillsArray = editSkills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
      
      // Update scores
      const scoresResponse = await fetch(`http://localhost:5000/api/fresher/${selectedFresher.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizzes: editQuizScore,
          coding: editCodingScore,
          assignments: editAssignmentScore,
          certifications: editCertificationScore,
        }),
      });
      
      // Update skills
      const skillsResponse = await fetch(`http://localhost:5000/api/fresher/skills/${selectedFresher.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: skillsArray,
        }),
      });
      
      if (scoresResponse.ok && skillsResponse.ok) {
        const result = await scoresResponse.json();
        
        toast({
          title: "Fresher Updated Successfully",
          description: `Updated ${selectedFresher.name}'s scores and skills. Overall progress: ${result.overallProgress}%. Dashboard has been refreshed.`,
        });
        
        setEditFresherOpen(false);
        fetchFreshersData();
        
        // Trigger dashboard refresh with enhanced timestamp
        const refreshTimestamp = Date.now().toString();
        localStorage.setItem('dashboardRefresh', refreshTimestamp);
        localStorage.setItem('lastUpdate', new Date().toISOString());
        console.log('Admin: Triggered dashboard refresh with timestamp:', refreshTimestamp);
        
        // Also trigger a custom event for immediate updates
        window.dispatchEvent(new CustomEvent('fresherDataUpdated', {
          detail: {
            fresherId: selectedFresher.id,
            updatedScores: {
              quizzes: editQuizScore,
              coding: editCodingScore,
              assignments: editAssignmentScore,
              certifications: editCertificationScore
            },
            updatedSkills: skillsArray,
            overallProgress: result.overallProgress
          }
        }));
      } else {
        throw new Error('Failed to update fresher');
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update fresher data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEditFresherLoading(false);
    }
  };

  const handleDeleteFresher = (fresher: any) => {
    setFresherToDelete(fresher);
    setDeleteFresherOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fresherToDelete) return;
    
    setDeleteFresherLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/fresher/${fresherToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast({
          title: "Fresher Deleted Successfully",
          description: `Removed ${fresherToDelete.name} from the system. Dashboard and Assessment Scores have been updated.`,
        });
        setDeleteFresherOpen(false);
        fetchFreshersData();
        
        // Trigger dashboard refresh
        const refreshTimestamp = Date.now().toString();
        localStorage.setItem('dashboardRefresh', refreshTimestamp);
        localStorage.setItem('lastUpdate', new Date().toISOString());
        console.log('Admin: Triggered dashboard refresh with timestamp:', refreshTimestamp);
        
        // Trigger custom event for deletion
        window.dispatchEvent(new CustomEvent('fresherDeleted', {
          detail: {
            fresherId: fresherToDelete.id,
            fresherName: fresherToDelete.name
          }
        }));
      } else {
        throw new Error('Failed to delete fresher');
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete fresher. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteFresherLoading(false);
    }
  };

  const handleFresherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFresherLoading(true);
    setAddFresherError("");
    
    try {
      const response = await fetch('http://localhost:5000/api/fresher/admin-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fresherName,
          email: fresherEmail,
          department: fresherDepartment,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Fresher Added Successfully",
          description: `Added ${fresherName} to the system. Email: ${data.email}, Password: ${data.password}. Dashboard and Assessment Scores have been updated.`,
        });
        setAddFresherOpen(false);
        setFresherName("");
        setFresherEmail("");
        setFresherDepartment("");
        fetchFreshersData();
        
        // Trigger dashboard refresh by updating a timestamp
        const refreshTimestamp = Date.now().toString();
        localStorage.setItem('dashboardRefresh', refreshTimestamp);
        localStorage.setItem('lastUpdate', new Date().toISOString());
        console.log('Admin: Triggered dashboard refresh with timestamp:', refreshTimestamp);
        
        // Trigger custom event for new fresher
        window.dispatchEvent(new CustomEvent('fresherAdded', {
          detail: {
            fresherId: data.id,
            fresherName: fresherName,
            fresherEmail: data.email
          }
        }));
      } else {
        const errorData = await response.json();
        setAddFresherError(errorData.message || 'Failed to add fresher');
      }
    } catch (error) {
      setAddFresherError('Failed to add fresher. Please try again.');
    } finally {
      setAddFresherLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-50'}`}>
        <Sidebar darkMode={darkMode} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading freshers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-50'}`}>
        <Sidebar darkMode={darkMode} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-600" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Data Error</h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
            <Button onClick={fetchFreshersData}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-50'}`}>
      <Sidebar darkMode={darkMode} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className={`p-6 border-b transition-all duration-300 backdrop-blur-sm ${
          darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Manage Freshers
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                View and manage all freshers in the training platform.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handleAddFresher}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Fresher
              </Button>
              
              <Button
                variant="outline"
                onClick={handleAIExportAnalysis}
                disabled={isAnalyzing}
                className={`flex items-center gap-2 transition-all duration-300 ${
                  darkMode 
                    ? 'border-purple-600 text-purple-300 hover:bg-purple-700' 
                    : 'border-purple-300 text-purple-700 hover:bg-purple-100'
                }`}
              >
                {isAnalyzing ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'AI Export Analysis PDF'}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          {/* Filters */}
          <Card className={`transition-all duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search freshers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {getUniqueDepartments().map((dept: string) => (
                      <SelectItem key={dept} value={dept.toLowerCase()}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Freshers Table */}
          <Card className={`transition-all duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Freshers ({getFilteredFreshers().length})
              </CardTitle>
              <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                All freshers in the training platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-4 px-6 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</th>
                      <th className={`text-left py-4 px-6 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Department</th>
                      <th className={`text-left py-4 px-6 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Skills</th>
                      <th className={`text-left py-4 px-6 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quiz Score</th>
                      <th className={`text-left py-4 px-6 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Coding %</th>
                      <th className={`text-left py-4 px-6 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Assignments</th>
                      <th className={`text-left py-4 px-6 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Certifications</th>
                      <th className={`text-left py-4 px-6 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredFreshers().map((fresher, index) => (
                      <tr key={index} className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                        <td className={`py-4 px-6 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{fresher.name}</td>
                        <td className={`py-4 px-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{fresher.department}</td>
                        <td className={`py-4 px-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{fresher.skills}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="font-medium">{fresher.quizzes}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium">{fresher.coding}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="font-medium">{fresher.assignments}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="font-medium">{fresher.certifications}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditFresher(fresher)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCredentials(fresher)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFresher(fresher)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Add Fresher Dialog */}
      <Dialog open={addFresherOpen} onOpenChange={setAddFresherOpen}>
        <DialogContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <DialogHeader>
            <DialogTitle className={darkMode ? 'text-white' : ''}>Add New Fresher</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFresherSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className={darkMode ? 'text-gray-300' : ''}>Name</Label>
              <Input
                id="name"
                value={fresherName}
                onChange={(e) => setFresherName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className={darkMode ? 'text-gray-300' : ''}>Email</Label>
              <Input
                id="email"
                type="email"
                value={fresherEmail}
                onChange={(e) => setFresherEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="department" className={darkMode ? 'text-gray-300' : ''}>Department</Label>
              <Select value={fresherDepartment} onValueChange={setFresherDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {addFresherError && (
              <p className="text-red-600 text-sm">{addFresherError}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddFresherOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addFresherLoading}>
                {addFresherLoading ? 'Adding...' : 'Add Fresher'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Fresher Dialog */}
      <Dialog open={editFresherOpen} onOpenChange={setEditFresherOpen}>
        <DialogContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <DialogHeader>
            <DialogTitle className={darkMode ? 'text-white' : ''}>Edit Fresher</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="quizScore" className={darkMode ? 'text-gray-300' : ''}>Quiz Score</Label>
              <Input
                id="quizScore"
                type="number"
                min="0"
                max="100"
                value={editQuizScore}
                onChange={(e) => setEditQuizScore(e.target.value)}
                placeholder="0-100"
              />
            </div>
            <div>
              <Label htmlFor="codingScore" className={darkMode ? 'text-gray-300' : ''}>Coding Score</Label>
              <Input
                id="codingScore"
                type="number"
                min="0"
                max="100"
                value={editCodingScore}
                onChange={(e) => setEditCodingScore(e.target.value)}
                placeholder="0-100"
              />
            </div>
            <div>
              <Label htmlFor="assignmentScore" className={darkMode ? 'text-gray-300' : ''}>Assignment Score</Label>
              <Input
                id="assignmentScore"
                type="number"
                min="0"
                max="100"
                value={editAssignmentScore}
                onChange={(e) => setEditAssignmentScore(e.target.value)}
                placeholder="0-100"
              />
            </div>
            <div>
              <Label htmlFor="certificationScore" className={darkMode ? 'text-gray-300' : ''}>Certification Score</Label>
              <Input
                id="certificationScore"
                type="number"
                min="0"
                max="100"
                value={editCertificationScore}
                onChange={(e) => setEditCertificationScore(e.target.value)}
                placeholder="0-100"
              />
            </div>
            <div>
              <Label htmlFor="skills" className={darkMode ? 'text-gray-300' : ''}>Skills</Label>
              <Input
                id="skills"
                value={editSkills}
                onChange={(e) => setEditSkills(e.target.value)}
                placeholder="e.g., React, Node.js, Python, JavaScript"
              />
              <p className={darkMode ? 'text-gray-400 text-sm mt-1' : 'text-gray-600 text-sm mt-1'}>
                Enter skills separated by commas (e.g., React, Node.js, Python)
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditFresherOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editFresherLoading}>
                {editFresherLoading ? 'Updating...' : 'Update Fresher'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Fresher Dialog */}
      <Dialog open={deleteFresherOpen} onOpenChange={setDeleteFresherOpen}>
        <DialogContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <DialogHeader>
            <DialogTitle className={darkMode ? 'text-white' : ''}>Delete Fresher</DialogTitle>
          </DialogHeader>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            Are you sure you want to delete {fresherToDelete?.name}? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFresherOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteFresherLoading}
            >
              {deleteFresherLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Credentials Dialog */}
      <Dialog open={viewCredentialsOpen} onOpenChange={setViewCredentialsOpen}>
        <DialogContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <DialogHeader>
            <DialogTitle className={darkMode ? 'text-white' : ''}>
              Fresher Credentials - {selectedFresherCredentials?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-3">
                <div>
                  <Label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Address
                  </Label>
                  <div className={`mt-1 p-3 rounded-md border ${
                    darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}>
                    {selectedFresherCredentials?.email || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Password
                  </Label>
                  <div className={`mt-1 p-3 rounded-md border ${
                    darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}>
                    {selectedFresherCredentials?.password || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                <strong>Note:</strong> These are the login credentials for {selectedFresherCredentials?.name}. 
                The fresher can use these credentials to access their personalized dashboard.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewCredentialsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



    </div>
  );
};

export default ManageFreshers; 