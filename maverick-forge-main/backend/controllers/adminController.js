const db = require('../db');

// Helper to calculate status based on progress
const determineStatus = (progress) => {
  if (progress >= 80) return 'ahead';
  if (progress >= 50) return 'on-track';
  return 'behind';
};

exports.getAdminDashboardData = async (req, res) => {
  try {
    let freshers = [];
    let quizzes = [];
    let challenges = [];
    let assignments = [];
    let certifications = [];
    let profileUpdates = [];
    let systemQueues = [];

    try {
      // Try to fetch from database
      const [freshersResult] = await db.promise().query('SELECT * FROM freshers');
      const [quizzesResult] = await db.promise().query('SELECT * FROM daily_quizzes');
      const [challengesResult] = await db.promise().query('SELECT * FROM coding_challenges');
      const [assignmentsResult] = await db.promise().query('SELECT * FROM assignments');
      const [certificationsResult] = await db.promise().query('SELECT * FROM certifications');
      const [profileUpdatesResult] = await db.promise().query('SELECT * FROM profile_updates');
      const [systemQueuesResult] = await db.promise().query('SELECT * FROM agent_status');

      freshers = freshersResult;
      quizzes = quizzesResult;
      challenges = challengesResult;
      assignments = assignmentsResult;
      certifications = certificationsResult;
      profileUpdates = profileUpdatesResult;
      systemQueues = systemQueuesResult;
    } catch (dbError) {
      console.log('📝 Using mock data due to database connection issue');
      // Use mock data from JSON files
      const fs = require('fs');
      const path = require('path');
      
      try {
        freshers = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/freshers.json'), 'utf8'));
        quizzes = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/daily_quizzes.json'), 'utf8'));
        challenges = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/coding_challenges.json'), 'utf8'));
        assignments = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/assignments.json'), 'utf8'));
        certifications = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/certifications.json'), 'utf8'));
        profileUpdates = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/profile_updates.json'), 'utf8'));
      } catch (fileError) {
        console.error('Error reading mock data files:', fileError);
        // Use hardcoded fallback data
        freshers = [
          { id: 1, name: 'John Doe', department: 'Engineering', skills: 'JavaScript, React' },
          { id: 2, name: 'Jane Smith', department: 'Design', skills: 'UI/UX, Figma' },
          { id: 3, name: 'Mike Johnson', department: 'Marketing', skills: 'Digital Marketing' }
        ];
        quizzes = [
          { id: 1, fresher_id: 1, score: 85 },
          { id: 2, fresher_id: 2, score: 92 },
          { id: 3, fresher_id: 3, score: 78 }
        ];
        challenges = [
          { id: 1, fresher_id: 1, status: 'Completed' },
          { id: 2, fresher_id: 2, status: 'In Progress' },
          { id: 3, fresher_id: 3, status: 'Completed' }
        ];
        assignments = [
          { id: 1, fresher_id: 1, submission_status: 'Submitted' },
          { id: 2, fresher_id: 2, submission_status: 'Pending' },
          { id: 3, fresher_id: 3, submission_status: 'Submitted' }
        ];
        certifications = [
          { id: 1, fresher_id: 1, status: 'Completed' },
          { id: 2, fresher_id: 2, status: 'In Progress' },
          { id: 3, fresher_id: 3, status: 'Completed' }
        ];
      }
    }

    // Calculate summary metrics
    const totalFreshers = freshers.length;
    const activeTrainingSessions = Math.floor(totalFreshers * 0.7); // 70% of freshers in active sessions
    const completedCertifications = certifications.filter(c => c.status === 'Completed').length;
    const pendingAssignments = assignments.filter(a => a.submission_status === 'Pending').length;

    // Summary cards data
    const summaryCards = [
      {
        title: "Total Freshers Onboarded",
        value: totalFreshers.toString(),
        icon: "Users",
        color: "bg-blue-500"
      },
      {
        title: "Active Training Sessions",
        value: activeTrainingSessions.toString(),
        icon: "BookOpen",
        color: "bg-green-500"
      },
      {
        title: "Completed Certifications",
        value: completedCertifications.toString(),
        icon: "Award",
        color: "bg-purple-500"
      },
      {
        title: "Pending Assignments",
        value: pendingAssignments.toString(),
        icon: "FileText",
        color: "bg-orange-500"
      }
    ];

    // Freshers data for table
    const freshersData = freshers.map((fresher) => {
      const fresherQuizzes = quizzes.filter((q) => q.fresher_id === fresher.id);
      const fresherAssignments = assignments.filter((a) => a.fresher_id === fresher.id);
      const fresherCerts = certifications.filter((c) => c.fresher_id === fresher.id && c.status === 'Completed');
      
      const avgQuiz = fresherQuizzes.length > 0 
        ? fresherQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) / fresherQuizzes.length
        : 0;
      
      const completedAssignments = fresherAssignments.filter(a => a.submission_status === 'Submitted').length;
      const totalAssignments = fresherAssignments.length;
      
      // Mock coding percentage based on completed challenges
      const completedChallenges = challenges.filter(c => c.fresher_id === fresher.id && c.status === 'Completed').length;
      const totalChallenges = challenges.filter(c => c.fresher_id === fresher.id).length;
      const codingPercentage = totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0;

      return {
        name: fresher.name,
        department: fresher.department || 'Unknown',
        skills: fresher.skills || 'Not specified',
        quizzes: `${Math.round(avgQuiz)}%`,
        coding: `${codingPercentage}%`,
        assignments: `${completedAssignments}/${totalAssignments}`,
        certifications: fresherCerts.length.toString()
      };
    });

    // Agent metrics
    const agentMetrics = [
      { name: "Active/Idle", value: "Active" },
      { name: "Profile Management Agent", value: "Running" },
      { name: "Mertriss", value: "Online" }
    ];

    // Report metrics
    const reportMetrics = [
      { name: "Active Rale", value: "120" },
      { name: "Processing Agent", value: "8" },
      { name: "Processing Queue", value: "24" },
      { name: "Reporting Agent", value: "5" },
      { name: "Latertina Agent", value: "3" }
    ];

    // System queues (agent monitoring)
    let formattedSystemQueues = [];
    if (systemQueues.length === 0) {
      formattedSystemQueues = [
        { name: 'Quiz Scoring', count: 5, avgLatency: '120ms', errorRate: '1.2%', status: 'healthy' },
        { name: 'Assignment Uploads', count: 2, avgLatency: '240ms', errorRate: '3.5%', status: 'warning' },
        { name: 'Profile Sync', count: 1, avgLatency: '300ms', errorRate: '6.0%', status: 'error' }
      ];
    } else {
      formattedSystemQueues = systemQueues.map((queue) => ({
        name: queue.agent_name,
        count: Math.floor(Math.random() * 5 + 1),
        avgLatency: `${Math.floor(Math.random() * 200 + 100)}ms`,
        errorRate: `${Math.random().toFixed(2)}%`,
        status: parseFloat(queue.status) < 5 ? 'healthy' : parseFloat(queue.status) < 10 ? 'warning' : 'error',
      }));
    }

    res.json({
      summaryCards,
      freshersData,
      agentMetrics,
      reportMetrics,
      systemQueues: formattedSystemQueues,
    });
  } catch (err) {
    console.error('DB Dashboard Error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data from DB' });
  }
};
