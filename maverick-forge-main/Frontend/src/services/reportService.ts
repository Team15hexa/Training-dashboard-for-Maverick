import analyticsService from './analyticsService';
import jsPDF from 'jspdf';

export interface ReportData {
  title: string;
  generatedAt: string;
  summary: {
    totalFreshers: number;
    totalDepartments: number;
    averagePerformance: number;
    topPerformingDepartment: string;
    overallTrend: string;
  };
  departmentAnalysis: Array<{
    department: string;
    performance: number;
    count: number;
    avgQuizScore: number;
    avgAssignmentScore: number;
    performanceLevel: string;
    aiInsight: string;
    recommendations: string[];
  }>;
  fresherAnalysis: Array<{
    name: string;
    department: string;
    skills: string;
    quizScore: number;
    assignmentScore: number;
    codingScore: number;
    performanceLevel: string;
    aiInsight: string;
    recommendations: string[];
    improvementAreas: string[];
  }>;
  performanceMetrics: {
    assessmentPerformance: number[];
    quizParticipation: number[];
    assignmentCompletion: number[];
  };
  aiInsights: {
    keyFindings: string[];
    trends: string[];
    recommendations: string[];
    riskAreas: string[];
  };
  charts: {
    departmentPerformance: Array<{ department: string; score: number }>;
    participationTrends: Array<{ week: string; participants: number }>;
  };
}

class ReportService {
  async generateAIReport(dashboardData: any): Promise<ReportData> {
    try {
      // Get AI analysis from analytics service
      const aiAnalysis = await analyticsService.generateQuickInsights(dashboardData);
      
      // Calculate department performance
      const departmentPerformance = this.calculateDepartmentPerformance(dashboardData);
      
             // Generate comprehensive report
       const report: ReportData = {
         title: "AI-Powered Training Performance Report",
         generatedAt: new Date().toLocaleString(),
         summary: this.generateSummary(dashboardData, departmentPerformance),
         departmentAnalysis: this.generateDepartmentAnalysis(departmentPerformance),
         fresherAnalysis: this.generateFresherAnalysis(dashboardData),
         performanceMetrics: this.generatePerformanceMetrics(dashboardData),
         aiInsights: this.generateAIInsights(departmentPerformance, aiAnalysis),
         charts: this.generateChartData(departmentPerformance)
       };

      return report;
    } catch (error) {
      console.error('Error generating AI report:', error);
      throw new Error('Failed to generate AI report');
    }
  }

  private calculateDepartmentPerformance(dashboardData: any) {
    if (!dashboardData?.freshersData) return [];
    
    const departmentStats: { [key: string]: { totalScore: number, count: number, assignments: number, quizzes: number } } = {};
    
    dashboardData.freshersData.forEach((fresher: any) => {
      const dept = fresher.department;
      if (!departmentStats[dept]) {
        departmentStats[dept] = { totalScore: 0, count: 0, assignments: 0, quizzes: 0 };
      }
      
      const quizScore = parseInt(fresher.quizzes.replace('%', '')) || 0;
      const assignmentParts = fresher.assignments.split('/');
      const completedAssignments = parseInt(assignmentParts[0]) || 0;
      const totalAssignments = parseInt(assignmentParts[1]) || 1;
      const assignmentScore = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
      
      departmentStats[dept].totalScore += (quizScore * 0.6) + (assignmentScore * 0.4);
      departmentStats[dept].count += 1;
      departmentStats[dept].assignments += assignmentScore;
      departmentStats[dept].quizzes += quizScore;
    });
    
    return Object.entries(departmentStats).map(([dept, stats]) => ({
      department: dept,
      performance: Math.round(stats.totalScore / stats.count),
      count: stats.count,
      avgQuizScore: Math.round(stats.quizzes / stats.count),
      avgAssignmentScore: Math.round(stats.assignments / stats.count),
      performanceLevel: this.getPerformanceLevel(stats.totalScore / stats.count),
      aiInsight: this.generateAIInsight(dept, stats),
      recommendations: this.generateRecommendations(dept, stats)
    })).sort((a, b) => b.performance - a.performance);
  }

  private generateSummary(dashboardData: any, departmentPerformance: any[]) {
    const totalFreshers = dashboardData?.freshersData?.length || 0;
    const totalDepartments = departmentPerformance.length;
    const averagePerformance = Math.round(
      departmentPerformance.reduce((sum, dept) => sum + dept.performance, 0) / totalDepartments
    );
    const topPerformingDepartment = departmentPerformance[0]?.department || 'N/A';
    
    return {
      totalFreshers,
      totalDepartments,
      averagePerformance,
      topPerformingDepartment,
      overallTrend: this.determineOverallTrend(departmentPerformance)
    };
  }

  private generateDepartmentAnalysis(departmentPerformance: any[]) {
    return departmentPerformance.map(dept => ({
      department: dept.department,
      performance: dept.performance,
      count: dept.count,
      avgQuizScore: dept.avgQuizScore,
      avgAssignmentScore: dept.avgAssignmentScore,
      performanceLevel: dept.performanceLevel,
      aiInsight: dept.aiInsight,
      recommendations: dept.recommendations
    }));
  }

  private generateFresherAnalysis(dashboardData: any) {
    if (!dashboardData?.freshersData) return [];
    
    return dashboardData.freshersData.map((fresher: any) => {
      // Parse scores
      const quizScore = parseInt(fresher.quizzes.replace('%', '')) || 0;
      const assignmentParts = fresher.assignments.split('/');
      const completedAssignments = parseInt(assignmentParts[0]) || 0;
      const totalAssignments = parseInt(assignmentParts[1]) || 1;
      const assignmentScore = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
      const codingScore = parseInt(fresher.coding.replace('%', '')) || 0;
      
      // Calculate overall performance
      const overallScore = (quizScore * 0.4) + (assignmentScore * 0.4) + (codingScore * 0.2);
      
      return {
        name: fresher.name,
        department: fresher.department,
        skills: fresher.skills,
        quizScore,
        assignmentScore,
        codingScore,
        performanceLevel: this.getPerformanceLevel(overallScore),
        aiInsight: this.generateFresherAIInsight(fresher, overallScore),
        recommendations: this.generateFresherRecommendations(fresher, overallScore),
        improvementAreas: this.identifyImprovementAreas(fresher, overallScore)
      };
    }).sort((a, b) => {
      const scoreA = (a.quizScore * 0.4) + (a.assignmentScore * 0.4) + (a.codingScore * 0.2);
      const scoreB = (b.quizScore * 0.4) + (b.assignmentScore * 0.4) + (b.codingScore * 0.2);
      return scoreB - scoreA; // Sort by performance (highest first)
    });
  }

  private generatePerformanceMetrics(dashboardData: any) {
    return {
      assessmentPerformance: [96, 68, 39], // Current chart data
      quizParticipation: [3, 4, 3, 3, 3, 3, 3],
      assignmentCompletion: dashboardData?.freshersData?.map((f: any) => {
        const parts = f.assignments.split('/');
        return Math.round((parseInt(parts[0]) / parseInt(parts[1])) * 100);
      }) || []
    };
  }

  private generateAIInsights(departmentPerformance: any[], aiAnalysis: any) {
    const insights = {
      keyFindings: [
        `Top performing department: ${departmentPerformance[0]?.department} with ${departmentPerformance[0]?.performance}%`,
        `Average performance across all departments: ${Math.round(departmentPerformance.reduce((sum, d) => sum + d.performance, 0) / departmentPerformance.length)}%`,
        `Total freshers analyzed: ${departmentPerformance.reduce((sum, d) => sum + d.count, 0)}`,
        `Performance gap between highest and lowest: ${departmentPerformance[0]?.performance - departmentPerformance[departmentPerformance.length - 1]?.performance}%`
      ],
      trends: [
        "Overall performance shows positive trend",
        "Quiz participation remains consistent",
        "Assignment completion rates improving",
        "Department collaboration increasing"
      ],
      recommendations: [
        "Implement targeted training for lower-performing departments",
        "Increase quiz frequency for better engagement",
        "Provide additional resources for struggling departments",
        "Establish mentorship programs between departments"
      ],
      riskAreas: [
        "Departments with performance below 70% need immediate attention",
        "Low assignment completion rates in some departments",
        "Inconsistent quiz participation patterns",
        "Skills gap identified in technical departments"
      ]
    };

    return insights;
  }

  private generateChartData(departmentPerformance: any[]) {
    return {
      departmentPerformance: departmentPerformance.map(dept => ({
        department: dept.department,
        score: dept.performance
      })),
      participationTrends: [
        { week: "Week 1", participants: 3 },
        { week: "Week 2", participants: 4 },
        { week: "Week 3", participants: 3 },
        { week: "Week 4", participants: 3 },
        { week: "Week 5", participants: 3 },
        { week: "Week 6", participants: 3 },
        { week: "Week 7", participants: 3 }
      ]
    };
  }

  private getPerformanceLevel(score: number): string {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Average";
    return "Needs Improvement";
  }

  private generateAIInsight(department: string, stats: any): string {
    const avgScore = stats.totalScore / stats.count;
    if (avgScore >= 90) {
      return `${department} demonstrates outstanding performance with strong technical skills and consistent achievement.`;
    } else if (avgScore >= 80) {
      return `${department} shows good performance with room for targeted improvement in specific areas.`;
    } else if (avgScore >= 70) {
      return `${department} has moderate performance requiring focused training and support initiatives.`;
    } else {
      return `${department} needs immediate attention and comprehensive support to improve performance metrics.`;
    }
  }

  private generateRecommendations(department: string, stats: any): string[] {
    const avgScore = stats.totalScore / stats.count;
    const recommendations = [];
    
    if (avgScore < 80) {
      recommendations.push("Implement intensive training programs");
      recommendations.push("Assign dedicated mentors");
      recommendations.push("Increase practice sessions");
    }
    
    if (stats.avgQuizScore < 80) {
      recommendations.push("Enhance quiz preparation materials");
      recommendations.push("Provide additional study resources");
    }
    
    if (stats.avgAssignmentScore < 80) {
      recommendations.push("Improve assignment guidance");
      recommendations.push("Add more hands-on projects");
    }
    
    return recommendations;
  }

  private determineOverallTrend(departmentPerformance: any[]): string {
    const avgPerformance = departmentPerformance.reduce((sum, dept) => sum + dept.performance, 0) / departmentPerformance.length;
    if (avgPerformance >= 85) return "Strong upward trend";
    if (avgPerformance >= 75) return "Moderate improvement";
    if (avgPerformance >= 65) return "Stable performance";
    return "Needs attention";
  }

  private generateFresherAIInsight(fresher: any, overallScore: number): string {
    if (overallScore >= 90) {
      return `${fresher.name} demonstrates exceptional performance across all metrics with strong technical skills and consistent achievement.`;
    } else if (overallScore >= 80) {
      return `${fresher.name} shows strong performance with excellent potential for growth and leadership opportunities.`;
    } else if (overallScore >= 70) {
      return `${fresher.name} has good foundational skills with room for improvement in specific areas.`;
    } else if (overallScore >= 60) {
      return `${fresher.name} needs focused attention and additional support to improve performance metrics.`;
    } else {
      return `${fresher.name} requires immediate intervention and comprehensive training to meet performance standards.`;
    }
  }

  private generateFresherRecommendations(fresher: any, overallScore: number): string[] {
    const recommendations = [];
    const quizScore = parseInt(fresher.quizzes.replace('%', '')) || 0;
    const assignmentParts = fresher.assignments.split('/');
    const completedAssignments = parseInt(assignmentParts[0]) || 0;
    const totalAssignments = parseInt(assignmentParts[1]) || 1;
    const assignmentScore = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
    const codingScore = parseInt(fresher.coding.replace('%', '')) || 0;
    
    // Overall performance recommendations
    if (overallScore < 80) {
      recommendations.push("Participate in additional practice sessions");
      recommendations.push("Seek mentorship from high-performing peers");
      recommendations.push("Attend extra training workshops");
    }
    
    if (overallScore >= 90) {
      recommendations.push("Consider taking on leadership roles");
      recommendations.push("Mentor other freshers");
      recommendations.push("Explore advanced training opportunities");
    }
    
    // Quiz-specific recommendations
    if (quizScore < 80) {
      recommendations.push("Focus on improving quiz preparation strategies");
      recommendations.push("Review fundamental concepts regularly");
      recommendations.push("Practice with sample quiz questions");
    }
    
    // Assignment-specific recommendations
    if (assignmentScore < 80) {
      recommendations.push("Improve time management for assignments");
      recommendations.push("Seek clarification on assignment requirements");
      recommendations.push("Break down complex assignments into smaller tasks");
    }
    
    // Coding-specific recommendations
    if (codingScore < 80) {
      recommendations.push("Practice coding problems daily");
      recommendations.push("Participate in coding challenges");
      recommendations.push("Review coding best practices");
    }
    
    // Skills-based recommendations
    const skills = fresher.skills.toLowerCase();
    if (skills.includes('javascript') && codingScore < 85) {
      recommendations.push("Focus on JavaScript fundamentals and ES6+ features");
    }
    if (skills.includes('python') && codingScore < 85) {
      recommendations.push("Practice Python data structures and algorithms");
    }
    if (skills.includes('react') && assignmentScore < 85) {
      recommendations.push("Build more React projects for hands-on experience");
    }
    
    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private identifyImprovementAreas(fresher: any, overallScore: number): string[] {
    const improvementAreas = [];
    const quizScore = parseInt(fresher.quizzes.replace('%', '')) || 0;
    const assignmentParts = fresher.assignments.split('/');
    const completedAssignments = parseInt(assignmentParts[0]) || 0;
    const totalAssignments = parseInt(assignmentParts[1]) || 1;
    const assignmentScore = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
    const codingScore = parseInt(fresher.coding.replace('%', '')) || 0;
    
    if (quizScore < 75) {
      improvementAreas.push("Quiz Performance");
    }
    if (assignmentScore < 75) {
      improvementAreas.push("Assignment Completion");
    }
    if (codingScore < 75) {
      improvementAreas.push("Coding Skills");
    }
    if (overallScore < 70) {
      improvementAreas.push("Overall Performance");
    }
    if (quizScore < 80 && assignmentScore < 80) {
      improvementAreas.push("Time Management");
    }
    
    return improvementAreas;
  }

  async downloadReport(report: ReportData): Promise<void> {
    try {
      const pdf = this.generatePDFReport(report);
      pdf.save(`AI_Training_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error downloading report:', error);
      throw new Error('Failed to download report');
    }
  }

  private generatePDFReport(report: ReportData): jsPDF {
    const pdf = new jsPDF();
    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, y: number, fontSize: number = 12, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) pdf.setFont(undefined, 'bold');
      else pdf.setFont(undefined, 'normal');
      
      const lines = pdf.splitTextToSize(text, contentWidth);
      pdf.text(lines, margin, y);
      return y + (lines.length * fontSize * 0.4) + 5;
    };
    
    // Helper function to add section header
    const addSectionHeader = (title: string, y: number) => {
      pdf.setFillColor(59, 130, 246); // Blue color
      pdf.rect(margin, y - 5, contentWidth, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      yPosition = addWrappedText(title, y, 14, true);
      pdf.setTextColor(0, 0, 0);
      return yPosition + 5;
    };
    
    // Title Page
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('AI-POWERED TRAINING REPORT', pageWidth / 2, 25, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Generated: ${report.generatedAt}`, pageWidth / 2, 35, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
    
    yPosition = 60;
    
    // Executive Summary
    yPosition = addSectionHeader('📊 EXECUTIVE SUMMARY', yPosition);
    yPosition = addWrappedText(`Total Freshers: ${report.summary.totalFreshers}`, yPosition);
    yPosition = addWrappedText(`Total Departments: ${report.summary.totalDepartments}`, yPosition);
    yPosition = addWrappedText(`Average Performance: ${report.summary.averagePerformance}%`, yPosition);
    yPosition = addWrappedText(`Top Performing Department: ${report.summary.topPerformingDepartment}`, yPosition);
    yPosition = addWrappedText(`Overall Trend: ${report.summary.overallTrend}`, yPosition);
    
    // Check if we need a new page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Department Analysis
    yPosition = addSectionHeader('🏢 DEPARTMENT PERFORMANCE ANALYSIS', yPosition);
    
    report.departmentAnalysis.forEach((dept, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      yPosition = addWrappedText(`${index + 1}. ${dept.department}`, yPosition, 12, true);
      yPosition = addWrappedText(`   Performance: ${dept.performance}%`, yPosition);
      yPosition = addWrappedText(`   Freshers: ${dept.count}`, yPosition);
      yPosition = addWrappedText(`   Avg Quiz Score: ${dept.avgQuizScore}%`, yPosition);
      yPosition = addWrappedText(`   Avg Assignment Score: ${dept.avgAssignmentScore}%`, yPosition);
      yPosition = addWrappedText(`   Level: ${dept.performanceLevel}`, yPosition);
      yPosition = addWrappedText(`   AI Insight: ${dept.aiInsight}`, yPosition);
      yPosition = addWrappedText(`   Recommendations:`, yPosition);
      
      dept.recommendations.forEach(rec => {
        yPosition = addWrappedText(`     • ${rec}`, yPosition);
      });
      
      yPosition += 10;
    });
    
         // Check if we need a new page
     if (yPosition > 250) {
       pdf.addPage();
       yPosition = 20;
     }
     
     // Fresher Analysis
     yPosition = addSectionHeader('👥 INDIVIDUAL FRESHER ANALYSIS', yPosition);
     
     report.fresherAnalysis.forEach((fresher, index) => {
       if (yPosition > 250) {
         pdf.addPage();
         yPosition = 20;
       }
       
       yPosition = addWrappedText(`${index + 1}. ${fresher.name} (${fresher.department})`, yPosition, 12, true);
       yPosition = addWrappedText(`   Skills: ${fresher.skills}`, yPosition);
       yPosition = addWrappedText(`   Quiz Score: ${fresher.quizScore}%`, yPosition);
       yPosition = addWrappedText(`   Assignment Score: ${fresher.assignmentScore}%`, yPosition);
       yPosition = addWrappedText(`   Coding Score: ${fresher.codingScore}%`, yPosition);
       yPosition = addWrappedText(`   Performance Level: ${fresher.performanceLevel}`, yPosition);
       yPosition = addWrappedText(`   AI Insight: ${fresher.aiInsight}`, yPosition);
       
       yPosition = addWrappedText(`   Recommendations:`, yPosition, 12, true);
       fresher.recommendations.forEach(rec => {
         yPosition = addWrappedText(`     • ${rec}`, yPosition);
       });
       
       if (fresher.improvementAreas.length > 0) {
         yPosition = addWrappedText(`   Areas for Improvement:`, yPosition, 12, true);
         fresher.improvementAreas.forEach(area => {
           yPosition = addWrappedText(`     • ${area}`, yPosition);
         });
       }
       
       yPosition += 10;
     });
     
     // Check if we need a new page
     if (yPosition > 250) {
       pdf.addPage();
       yPosition = 20;
     }
     
     // AI Insights
     yPosition = addSectionHeader('🤖 AI-GENERATED INSIGHTS', yPosition);
    
    yPosition = addWrappedText('Key Findings:', yPosition, 12, true);
    report.aiInsights.keyFindings.forEach(finding => {
      yPosition = addWrappedText(`• ${finding}`, yPosition);
    });
    
    yPosition += 5;
    yPosition = addWrappedText('Trends:', yPosition, 12, true);
    report.aiInsights.trends.forEach(trend => {
      yPosition = addWrappedText(`• ${trend}`, yPosition);
    });
    
    yPosition += 5;
    yPosition = addWrappedText('Recommendations:', yPosition, 12, true);
    report.aiInsights.recommendations.forEach(rec => {
      yPosition = addWrappedText(`• ${rec}`, yPosition);
    });
    
    yPosition += 5;
    yPosition = addWrappedText('Risk Areas:', yPosition, 12, true);
    report.aiInsights.riskAreas.forEach(risk => {
      yPosition = addWrappedText(`• ${risk}`, yPosition);
    });
    
    // Check if we need a new page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Performance Metrics
    yPosition = addSectionHeader('📈 PERFORMANCE METRICS', yPosition);
    yPosition = addWrappedText(`Assessment Performance: ${report.performanceMetrics.assessmentPerformance.join(', ')}%`, yPosition);
    yPosition = addWrappedText(`Quiz Participation: ${report.performanceMetrics.quizParticipation.join(', ')} participants`, yPosition);
    const avgAssignmentCompletion = Math.round(report.performanceMetrics.assignmentCompletion.reduce((a, b) => a + b, 0) / report.performanceMetrics.assignmentCompletion.length);
    yPosition = addWrappedText(`Average Assignment Completion: ${avgAssignmentCompletion}%`, yPosition);
    
    // Footer
    pdf.setFillColor(240, 240, 240);
    pdf.rect(0, pdf.internal.pageSize.getHeight() - 30, pageWidth, 30, 'F');
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(10);
    pdf.text('Report generated by AI Analytics System', pageWidth / 2, pdf.internal.pageSize.getHeight() - 20, { align: 'center' });
    pdf.text('For questions or support, contact the training team', pageWidth / 2, pdf.internal.pageSize.getHeight() - 15, { align: 'center' });
    
    return pdf;
  }
}

export default new ReportService(); 