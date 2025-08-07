const db = require('../config/database');

// Helper to calculate status based on progress
const determineStatus = (progress) => {
  if (progress >= 80) return 'ahead';
  if (progress >= 50) return 'on-track';
  return 'behind';
};

// New function to get department analytics
exports.getDepartmentAnalytics = async (req, res) => {
  try {
    console.log('🔍 Fetching department analytics...');
    
    // Get all freshers with their scores
    const [freshers] = await db.promise().query(`
      SELECT 
        department,
        COUNT(*) as count,
        AVG(CAST(quizzes AS DECIMAL(5,2))) as avgQuizScore,
        AVG(CAST(coding AS DECIMAL(5,2))) as avgCodingScore,
        AVG(CAST(assignments AS DECIMAL(5,2))) as avgAssignmentScore,
        AVG(CAST(certifications AS DECIMAL(5,2))) as avgCertificationScore
      FROM freshers 
      GROUP BY department
      ORDER BY department
    `);
    
    console.log('📊 Raw department data:', freshers);
    
    // Calculate department performance metrics
    const departmentData = freshers.map(dept => {
      const avgScore = Math.round(
        (parseFloat(dept.avgQuizScore || 0) + 
         parseFloat(dept.avgCodingScore || 0) + 
         parseFloat(dept.avgAssignmentScore || 0) + 
         parseFloat(dept.avgCertificationScore || 0)) / 4
      );
      
      // Calculate completion rate as average certification percentage
      const completionRate = Math.round(parseFloat(dept.avgCertificationScore || 0));
      
      return {
        department: dept.department,
        avgScore: avgScore,
        completionRate: completionRate,
        count: dept.count,
        avgQuizScore: Math.round(parseFloat(dept.avgQuizScore || 0)),
        avgCodingScore: Math.round(parseFloat(dept.avgCodingScore || 0)),
        avgAssignmentScore: Math.round(parseFloat(dept.avgAssignmentScore || 0)),
        avgCertificationScore: Math.round(parseFloat(dept.avgCertificationScore || 0))
      };
    });
    
    console.log('✅ Processed department analytics:', departmentData);
    
    res.json({
      success: true,
      data: departmentData
    });
    
  } catch (error) {
    console.error('❌ Error fetching department analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch department analytics' 
    });
  }
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
      const [assignmentsResult] = await db.promise().query('SELECT * FROM assignment');
      const [certificationsResult] = await db.promise().query('SELECT * FROM certification');
      
      // These tables might not exist yet, so we'll handle them gracefully
      let profileUpdatesResult = [];
      let systemQueuesResult = [];
      
      try {
        const [profileResult] = await db.promise().query('SELECT * FROM profile_updates');
        profileUpdatesResult = profileResult;
      } catch (e) {
        console.log('Profile updates table not found, using empty array');
      }
      
      try {
        const [systemResult] = await db.promise().query('SELECT * FROM agent_status');
        systemQueuesResult = systemResult;
      } catch (e) {
        console.log('Agent status table not found, using empty array');
      }

      freshers = freshersResult;
      quizzes = quizzesResult;
      challenges = challengesResult;
      assignments = assignmentsResult;
      certifications = certificationsResult;
      profileUpdates = profileUpdatesResult;
      systemQueues = systemQueuesResult;
      
      console.log('✅ Successfully fetched data from mavericks database');
      console.log(`📊 Found ${freshers.length} freshers, ${quizzes.length} quizzes, ${challenges.length} challenges`);
      
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError.message);
      throw new Error('Failed to connect to maverick database');
    }

    // Calculate summary metrics from database
    const totalFreshers = freshers.length;
    const activeQuizzes = quizzes.length;
    const codingChallenges = challenges.length;
    const pendingAssignments = assignments.filter(a => a.status === 'pending').length;

    // Summary cards data
    const summaryCards = [
      {
        title: "Total Freshers",
        value: totalFreshers.toString(),
        icon: "Users",
        color: "bg-blue-500"
      },
      {
        title: "Active Quizzes",
        value: activeQuizzes.toString(),
        icon: "BookOpen",
        color: "bg-green-500"
      },
      {
        title: "Coding Challenges",
        value: codingChallenges.toString(),
        icon: "Code",
        color: "bg-purple-500"
      },
      {
        title: "Assignments",
        value: pendingAssignments.toString(),
        icon: "FileText",
        color: "bg-orange-500"
      }
    ];

    // Recent freshers data
    const recentFreshers = freshers.slice(0, 5).map(fresher => ({
      id: fresher.id,
      name: fresher.name,
      department: fresher.department,
      role: fresher.role || 'fresher',
      skills: fresher.skills || '',
      join_date: fresher.join_date || new Date().toISOString().split('T')[0]
    }));

    // Department statistics
    const departmentStats = {};
    freshers.forEach(fresher => {
      const dept = fresher.department;
      departmentStats[dept] = (departmentStats[dept] || 0) + 1;
    });

    // Recent activities from database
    const recentActivities = [];
    
    // Add recent quizzes
    quizzes.slice(0, 3).forEach((quiz, index) => {
      const fresher = freshers.find(f => f.id === quiz.fresher_id);
      if (fresher) {
        recentActivities.push({
          id: `quiz_${quiz.id}`,
          type: 'quiz_completed',
          fresher: fresher.name,
          description: `Completed ${quiz.title}`,
          timestamp: quiz.created_at || new Date().toISOString()
        });
      }
    });
    
    // Add recent assignments
    assignments.slice(0, 2).forEach((assignment, index) => {
      const fresher = freshers.find(f => f.id === assignment.fresher_id);
      if (fresher) {
        recentActivities.push({
          id: `assignment_${assignment.id}`,
          type: 'assignment_submitted',
          fresher: fresher.name,
          description: `Submitted ${assignment.title}`,
          timestamp: assignment.created_at || new Date().toISOString()
        });
      }
    });

    // System metrics
    const systemMetrics = {
      database: 'Online',
      apiServices: 'Healthy',
      responseTime: '45ms',
      uptime: '99.9%'
    };

    res.json({
      summaryCards,
      recentFreshers,
      departmentStats,
      recentActivities,
      systemMetrics,
      freshers,
      quizzes,
      challenges,
      assignments,
      certifications,
      profileUpdates,
      systemQueues
    });

  } catch (error) {
    console.error('DB Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data from DB' });
  }
};
