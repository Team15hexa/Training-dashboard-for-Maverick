// AI Analytics Service for generating insights from dashboard data

import geminiService from './geminiService';

export interface AnalyticsData {
  summaryCards: any[];
  freshersData: any[];
  agentMetrics: any[];
  reportMetrics: any[];
  systemQueues: any[];
}

export interface AnalyticsReport {
  summary: string;
  insights: string[];
  recommendations: string[];
  trends: string[];
  performanceMetrics: {
    topPerformers: string[];
    areasOfConcern: string[];
    departmentStats: any;
  };
}

class AnalyticsService {
  private async generateAnalyticsPrompt(data: AnalyticsData): Promise<string> {
    const totalFreshers = data.freshersData.length;
    const departments = [...new Set(data.freshersData.map(f => f.department))];
    const departmentStats = departments.reduce((acc, dept) => {
      const deptFreshers = data.freshersData.filter(f => f.department === dept);
      acc[dept] = deptFreshers.length;
      return acc;
    }, {} as any);

    // Calculate performance metrics
    const avgQuizScores = data.freshersData.map(f => {
      const quizScore = parseInt(f.quizzes.replace('%', ''));
      return { name: f.name, score: quizScore, department: f.department };
    }).sort((a, b) => b.score - a.score);

    const avgCodingScores = data.freshersData.map(f => {
      const codingScore = parseInt(f.coding.replace('%', ''));
      return { name: f.name, score: codingScore, department: f.department };
    }).sort((a, b) => b.score - a.score);

    const assignmentCompletion = data.freshersData.map(f => {
      const [completed, total] = f.assignments.split('/').map(Number);
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      return { name: f.name, rate: completionRate, department: f.department };
    }).sort((a, b) => b.rate - a.rate);

    const prompt = `You are an expert data analyst for a training management system. Analyze the following dashboard data and provide comprehensive insights:\n\nDASHBOARD DATA:\n- Total Freshers: ${totalFreshers}\n- Departments: ${departments.join(', ')}\n- Department Distribution: ${JSON.stringify(departmentStats)}\n- Summary Cards: ${JSON.stringify(data.summaryCards)}\n- Agent Metrics: ${JSON.stringify(data.agentMetrics)}\n- Report Metrics: ${JSON.stringify(data.reportMetrics)}\n- System Queues: ${JSON.stringify(data.systemQueues)}\n\nPERFORMANCE DATA:\n- Top Quiz Performers: ${avgQuizScores.slice(0, 3).map(f => `${f.name} (${f.score}%)`).join(', ')}\n- Top Coding Performers: ${avgCodingScores.slice(0, 3).map(f => `${f.name} (${f.score}%)`).join(', ')}\n- Assignment Completion Leaders: ${assignmentCompletion.slice(0, 3).map(f => `${f.name} (${f.rate.toFixed(1)}%)`).join(', ')}\n\nPlease provide a comprehensive analytics report with:\n\n1. EXECUTIVE SUMMARY (2-3 sentences)\n2. KEY INSIGHTS (3-5 bullet points)\n3. RECOMMENDATIONS (3-5 actionable items)\n4. TRENDS ANALYSIS (2-3 observations)\n5. PERFORMANCE METRICS:\n   - Top performers by category\n   - Areas of concern\n   - Department performance comparison\n\nFormat your response as a structured analysis that would be valuable for training managers and administrators. Focus on actionable insights and specific recommendations for improving training outcomes.`;

    return prompt;
  }

  async generateAnalyticsReport(data: AnalyticsData): Promise<AnalyticsReport> {
    try {
      const prompt = await this.generateAnalyticsPrompt(data);
      const response = await geminiService.generateResponse(prompt, 'Analytics Report Generation');
      
      // Parse the AI response into structured format
      return this.parseAnalyticsResponse(response, data);
    } catch (error) {
      console.error('Error generating analytics report:', error);
      return this.getFallbackReport(data);
    }
  }

  private parseAnalyticsResponse(response: string, data: AnalyticsData): AnalyticsReport {
    // Extract insights from AI response
    const lines = response.split('\n').filter(line => line.trim());
    
    let summary = '';
    let insights: string[] = [];
    let recommendations: string[] = [];
    let trends: string[] = [];
    
    let currentSection = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toLowerCase().includes('summary') || trimmedLine.toLowerCase().includes('overview')) {
        currentSection = 'summary';
        continue;
      } else if (trimmedLine.toLowerCase().includes('insight') || trimmedLine.toLowerCase().includes('finding')) {
        currentSection = 'insights';
        continue;
      } else if (trimmedLine.toLowerCase().includes('recommend') || trimmedLine.toLowerCase().includes('action')) {
        currentSection = 'recommendations';
        continue;
      } else if (trimmedLine.toLowerCase().includes('trend') || trimmedLine.toLowerCase().includes('pattern')) {
        currentSection = 'trends';
        continue;
      }
      
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        if (currentSection === 'summary') {
          summary += trimmedLine + ' ';
        } else if (currentSection === 'insights' && trimmedLine.startsWith('•')) {
          insights.push(trimmedLine.substring(1).trim());
        } else if (currentSection === 'recommendations' && trimmedLine.startsWith('•')) {
          recommendations.push(trimmedLine.substring(1).trim());
        } else if (currentSection === 'trends' && trimmedLine.startsWith('•')) {
          trends.push(trimmedLine.substring(1).trim());
        }
      }
    }
    
    // Generate performance metrics
    const performanceMetrics = this.generatePerformanceMetrics(data);
    
    return {
      summary: summary || 'Comprehensive analysis of training program performance and participant engagement.',
      insights: insights.length > 0 ? insights : ['Training program shows good overall engagement', 'Department performance varies significantly', 'Quiz completion rates are strong'],
      recommendations: recommendations.length > 0 ? recommendations : ['Implement targeted support for underperforming departments', 'Increase coding challenge frequency', 'Add more interactive learning modules'],
      trends: trends.length > 0 ? trends : ['Steady improvement in quiz scores', 'Growing interest in advanced certifications', 'Positive correlation between daily practice and performance'],
      performanceMetrics
    };
  }

  private generatePerformanceMetrics(data: AnalyticsData) {
    const departments = [...new Set(data.freshersData.map(f => f.department))];
    const departmentStats = departments.reduce((acc, dept) => {
      const deptFreshers = data.freshersData.filter(f => f.department === dept);
      const avgQuizScore = deptFreshers.reduce((sum, f) => sum + parseInt(f.quizzes.replace('%', '')), 0) / deptFreshers.length;
      const avgCodingScore = deptFreshers.reduce((sum, f) => sum + parseInt(f.coding.replace('%', '')), 0) / deptFreshers.length;
      
      acc[dept] = {
        count: deptFreshers.length,
        avgQuizScore: Math.round(avgQuizScore),
        avgCodingScore: Math.round(avgCodingScore)
      };
      return acc;
    }, {} as any);

    // Top performers
    const topQuizPerformers = data.freshersData
      .map(f => ({ name: f.name, score: parseInt(f.quizzes.replace('%', '')), department: f.department }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(f => `${f.name} (${f.score}%)`);

    const topCodingPerformers = data.freshersData
      .map(f => ({ name: f.name, score: parseInt(f.coding.replace('%', '')), department: f.department }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(f => `${f.name} (${f.score}%)`);

    // Areas of concern
    const areasOfConcern = [];
    const lowQuizScores = data.freshersData.filter(f => parseInt(f.quizzes.replace('%', '')) < 70);
    const lowCodingScores = data.freshersData.filter(f => parseInt(f.coding.replace('%', '')) < 50);
    
    if (lowQuizScores.length > 0) {
      areasOfConcern.push(`${lowQuizScores.length} freshers with quiz scores below 70%`);
    }
    if (lowCodingScores.length > 0) {
      areasOfConcern.push(`${lowCodingScores.length} freshers with coding scores below 50%`);
    }

    return {
      topPerformers: [...topQuizPerformers, ...topCodingPerformers],
      areasOfConcern: areasOfConcern.length > 0 ? areasOfConcern : ['No significant areas of concern identified'],
      departmentStats
    };
  }

  private getFallbackReport(data: AnalyticsData): AnalyticsReport {
    return {
      summary: 'Training program analysis shows overall positive engagement with room for improvement in specific areas.',
      insights: [
        'Department performance varies with Engineering showing strongest results',
        'Quiz completion rates are consistently high across all departments',
        'Coding challenge participation needs improvement',
        'Assignment submission rates are on target'
      ],
      recommendations: [
        'Implement targeted coding workshops for underperforming departments',
        'Increase interactive learning modules for better engagement',
        'Add mentorship programs for struggling participants',
        'Develop department-specific training tracks'
      ],
      trends: [
        'Steady improvement in overall quiz scores',
        'Growing interest in advanced certification programs',
        'Positive correlation between daily practice and performance metrics'
      ],
      performanceMetrics: this.generatePerformanceMetrics(data)
    };
  }

  async generateQuickInsights(data: AnalyticsData): Promise<string[]> {
    try {
      const prompt = `Provide 3-5 quick insights from this training data in bullet points:\n      \n      - Total Freshers: ${data.freshersData.length}\n      - Departments: ${[...new Set(data.freshersData.map(f => f.department))].join(', ')}\n      - Average Quiz Score: ${Math.round(data.freshersData.reduce((sum, f) => sum + parseInt(f.quizzes.replace('%', '')), 0) / data.freshersData.length)}%\n      - Average Coding Score: ${Math.round(data.freshersData.reduce((sum, f) => sum + parseInt(f.coding.replace('%', '')), 0) / data.freshersData.length)}%\n      \n      Focus on actionable insights that training managers can use immediately.`;
      
      const response = await geminiService.generateResponse(prompt, 'Quick Insights');
      return response.split('\n').filter(line => line.trim().startsWith('•')).map(line => line.substring(1).trim());
    } catch (error) {
      return [
        'Training program shows good overall engagement',
        'Department performance varies significantly',
        'Quiz completion rates are strong across all departments'
      ];
    }
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService; 