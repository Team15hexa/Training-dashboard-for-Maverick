from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from ai_feedback import AIFeedbackGenerator

app = Flask(__name__)
CORS(app)

# Initialize the AI feedback generator
feedback_generator = AIFeedbackGenerator()

@app.route('/api/ai-feedback', methods=['POST'])
def generate_ai_feedback():
    """
    Generate AI-powered feedback for a fresher
    """
    try:
        # Get fresher data from request
        fresher_data = request.get_json()
        
        if not fresher_data:
            return jsonify({
                'error': 'No fresher data provided',
                'status': 'error'
            }), 400
        
        # Generate feedback using AI
        feedback = feedback_generator.generate_feedback(fresher_data)
        
        return jsonify({
            'feedback': feedback,
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Failed to generate feedback: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/ai-feedback/batch', methods=['POST'])
def generate_batch_feedback():
    """
    Generate AI feedback for multiple freshers
    """
    try:
        # Get freshers data from request
        freshers_data = request.get_json()
        
        if not freshers_data or not isinstance(freshers_data, list):
            return jsonify({
                'error': 'No freshers data provided or invalid format',
                'status': 'error'
            }), 400
        
        # Generate feedback for each fresher
        batch_feedback = []
        for fresher_data in freshers_data:
            feedback = feedback_generator.generate_feedback(fresher_data)
            batch_feedback.append({
                'fresher_id': fresher_data.get('id'),
                'fresher_name': fresher_data.get('name'),
                'feedback': feedback
            })
        
        return jsonify({
            'batch_feedback': batch_feedback,
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Failed to generate batch feedback: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/ai-feedback/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'service': 'AI Feedback Generator',
        'version': '1.0.0'
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002) 