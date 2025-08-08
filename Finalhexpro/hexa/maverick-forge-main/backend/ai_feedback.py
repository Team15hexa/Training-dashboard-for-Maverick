import json
from datetime import datetime
from typing import Dict, List, Any, Optional

class AIFeedbackGenerator:
    def __init__(self):
        self.performance_levels = {
            'excellent': {'min_score': 85, 'color': '#10B981'},
            'good': {'min_score': 70, 'color': '#3B82F6'},
            'average': {'min_score': 50, 'color': '#F59E0B'},
            'needs_improvement': {'min_score': 0, 'color': '#EF4444'}
        }
    
    def generate_feedback(self, fresher_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate AI-powered feedback based on fresher performance data
        """
        try:
            # Extract scores
            quiz_score = int(fresher_data.get('quizzes', 0))
            coding_score = int(fresher_data.get('coding', 0))
            assignment_score = int(fresher_data.get('assignments', 0))
            certification_score = int(fresher_data.get('certifications', 0))
            
            # Calculate overall performance
            overall_score = (quiz_score + coding_score + assignment_score + certification_score) / 4
            
            # Generate performance insights
            performance_insight = self._analyze_performance(overall_score)
            
            # Generate specific recommendations
            recommendations = self._generate_recommendations(
                quiz_score, coding_score, assignment_score, certification_score, overall_score
            )
            
            # Generate improvement areas
            improvement_areas = self._identify_improvement_areas(
                quiz_score, coding_score, assignment_score, certification_score
            )
            
            # Generate motivational message
            motivational_message = self._generate_motivational_message(overall_score)
            
            # Calculate performance level and color
            performance_level, performance_color = self._get_performance_level(overall_score)
            
            feedback = {
                'overall_score': round(overall_score, 1),
                'performance_level': performance_level,
                'performance_color': performance_color,
                'performance_insight': performance_insight,
                'recommendations': recommendations,
                'improvement_areas': improvement_areas,
                'motivational_message': motivational_message,
                'generated_at': datetime.now().isoformat(),
                'detailed_analysis': {
                    'quiz_analysis': self._analyze_quiz_performance(quiz_score),
                    'coding_analysis': self._analyze_coding_performance(coding_score),
                    'assignment_analysis': self._analyze_assignment_performance(assignment_score),
                    'certification_analysis': self._analyze_certification_performance(certification_score)
                }
            }
            
            return feedback
            
        except Exception as e:
            return {
                'error': f'Failed to generate feedback: {str(e)}',
                'generated_at': datetime.now().isoformat()
            }
    
    def _analyze_performance(self, overall_score: float) -> str:
        """Analyze overall performance and provide insight"""
        if overall_score >= 85:
            return "Outstanding performance! You're demonstrating excellent understanding and application of concepts."
        elif overall_score >= 70:
            return "Good progress! You're on the right track with solid foundational knowledge."
        elif overall_score >= 50:
            return "Steady progress! Focus on strengthening core concepts and practice regularly."
        else:
            return "Keep pushing forward! Every challenge is an opportunity to grow and improve."
    
    def _generate_recommendations(self, quiz_score: int, coding_score: int, 
                                assignment_score: int, certification_score: int, 
                                overall_score: float) -> List[str]:
        """Generate specific recommendations based on performance"""
        recommendations = []
        
        # Overall performance recommendations
        if overall_score < 80:
            recommendations.append("Participate in additional practice sessions")
            recommendations.append("Seek mentorship from high-performing peers")
            recommendations.append("Attend extra training workshops")
        
        if overall_score >= 90:
            recommendations.append("Consider taking on leadership roles")
            recommendations.append("Mentor other freshers")
            recommendations.append("Explore advanced training opportunities")
        
        # Quiz-specific recommendations
        if quiz_score < 80:
            recommendations.append("Focus on improving quiz preparation strategies")
            recommendations.append("Review fundamental concepts regularly")
            recommendations.append("Practice with sample quiz questions")
        
        # Assignment-specific recommendations
        if assignment_score < 80:
            recommendations.append("Improve time management for assignments")
            recommendations.append("Seek clarification on assignment requirements")
            recommendations.append("Break down complex assignments into smaller tasks")
        
        # Coding-specific recommendations
        if coding_score < 80:
            recommendations.append("Practice coding problems daily")
            recommendations.append("Participate in coding challenges")
            recommendations.append("Review coding best practices")
        
        # Certification-specific recommendations
        if certification_score < 80:
            recommendations.append("Focus on completing certification modules")
            recommendations.append("Practice hands-on exercises")
            recommendations.append("Review certification study materials")
        
        return recommendations[:5]  # Limit to top 5 recommendations
    
    def _identify_improvement_areas(self, quiz_score: int, coding_score: int, 
                                  assignment_score: int, certification_score: int) -> List[str]:
        """Identify specific areas for improvement"""
        improvement_areas = []
        
        if quiz_score < 70:
            improvement_areas.append("Quiz Performance")
        
        if coding_score < 70:
            improvement_areas.append("Coding Skills")
        
        if assignment_score < 70:
            improvement_areas.append("Assignment Completion")
        
        if certification_score < 70:
            improvement_areas.append("Certification Progress")
        
        if not improvement_areas:
            improvement_areas.append("Maintain current performance level")
        
        return improvement_areas
    
    def _generate_motivational_message(self, overall_score: float) -> str:
        """Generate motivational message based on performance"""
        if overall_score >= 85:
            return "🌟 You're absolutely crushing it! Your dedication and hard work are paying off. Keep inspiring others!"
        elif overall_score >= 70:
            return "🚀 Great job! You're building a strong foundation. Keep up the excellent work!"
        elif overall_score >= 50:
            return "💪 You're making steady progress! Remember, every expert was once a beginner. Keep going!"
        else:
            return "🔥 Every challenge is an opportunity to grow! You have the potential to achieve great things. Stay focused!"
    
    def _get_performance_level(self, overall_score: float) -> tuple:
        """Get performance level and color"""
        if overall_score >= 85:
            return "Excellent", "#10B981"
        elif overall_score >= 70:
            return "Good", "#3B82F6"
        elif overall_score >= 50:
            return "Average", "#F59E0B"
        else:
            return "Needs Improvement", "#EF4444"
    
    def _analyze_quiz_performance(self, quiz_score: int) -> Dict[str, Any]:
        """Analyze quiz performance specifically"""
        if quiz_score >= 85:
            return {
                'status': 'excellent',
                'message': 'Outstanding quiz performance!',
                'suggestion': 'Consider helping others with quiz preparation'
            }
        elif quiz_score >= 70:
            return {
                'status': 'good',
                'message': 'Good quiz performance!',
                'suggestion': 'Focus on areas where you scored lower'
            }
        else:
            return {
                'status': 'needs_improvement',
                'message': 'Quiz performance needs improvement',
                'suggestion': 'Review fundamental concepts and practice regularly'
            }
    
    def _analyze_coding_performance(self, coding_score: int) -> Dict[str, Any]:
        """Analyze coding performance specifically"""
        if coding_score >= 85:
            return {
                'status': 'excellent',
                'message': 'Excellent coding skills!',
                'suggestion': 'Take on more complex coding challenges'
            }
        elif coding_score >= 70:
            return {
                'status': 'good',
                'message': 'Good coding foundation!',
                'suggestion': 'Practice more coding problems'
            }
        else:
            return {
                'status': 'needs_improvement',
                'message': 'Coding skills need development',
                'suggestion': 'Start with basic problems and gradually increase difficulty'
            }
    
    def _analyze_assignment_performance(self, assignment_score: int) -> Dict[str, Any]:
        """Analyze assignment performance specifically"""
        if assignment_score >= 85:
            return {
                'status': 'excellent',
                'message': 'Outstanding assignment work!',
                'suggestion': 'Consider mentoring others in assignments'
            }
        elif assignment_score >= 70:
            return {
                'status': 'good',
                'message': 'Good assignment completion!',
                'suggestion': 'Focus on quality and attention to detail'
            }
        else:
            return {
                'status': 'needs_improvement',
                'message': 'Assignment completion needs improvement',
                'suggestion': 'Improve time management and planning'
            }
    
    def _analyze_certification_performance(self, certification_score: int) -> Dict[str, Any]:
        """Analyze certification performance specifically"""
        if certification_score >= 85:
            return {
                'status': 'excellent',
                'message': 'Excellent certification progress!',
                'suggestion': 'Consider advanced certifications'
            }
        elif certification_score >= 70:
            return {
                'status': 'good',
                'message': 'Good certification progress!',
                'suggestion': 'Complete remaining certification modules'
            }
        else:
            return {
                'status': 'needs_improvement',
                'message': 'Certification progress needs attention',
                'suggestion': 'Focus on completing certification requirements'
            }

# Example usage
if __name__ == "__main__":
    # Initialize the AI feedback generator
    feedback_generator = AIFeedbackGenerator()
    
    # Sample fresher data
    sample_fresher_data = {
        'quizzes': 75,
        'coding': 80,
        'assignments': 85,
        'certifications': 70,
        'name': 'John Doe',
        'department': 'Engineering'
    }
    
    # Generate feedback
    feedback = feedback_generator.generate_feedback(sample_fresher_data)
    
    # Print the feedback
    print("AI Generated Feedback:")
    print(json.dumps(feedback, indent=2)) 