import json
import os
import sys
from http import HTTPStatus
from flask import Flask, Request, Response, jsonify, request as flask_request
from flask_cors import CORS
from supabase import create_client
from paddle_billing import Client, Environment, Options
from paddle_billing.Notifications import Secret, Verifier
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize Supabase client
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY', os.getenv('SUPABASE_KEY'))
supabase = create_client(supabase_url, supabase_key)

# Initialize Paddle client
paddle_env = os.getenv('PADDLE_ENVIRONMENT', 'sandbox')
paddle = Client(
    os.getenv('PADDLE_SECRET_API_KEY'),
    options=Options(Environment.SANDBOX if paddle_env == 'sandbox' else Environment.PRODUCTION)
)

# Import your route handlers
from api.routes import *

# Vercel serverless function handler
def handler(req):
    with app.request_context(req['headers']):
        try:
            # Handle preflight requests
            if req['httpMethod'] == 'OPTIONS':
                return {
                    'statusCode': 204,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, X-Paddle-Signature, Authorization',
                        'Access-Control-Max-Age': '86400'  # 24 hours
                    },
                    'body': ''
                }
                
            # Process the request
            response = app.full_dispatch_request()
            return {
                'statusCode': response.status_code,
                'headers': dict(response.headers),
                'body': response.get_data(as_text=True)
            }
            
        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")
            return {
                'statusCode': 500,
                'body': json.dumps({"error": str(e)}),
                'headers': {'Content-Type': 'application/json'}
            }

# This is the entry point for Vercel serverless function
def main(request):
    # Convert Vercel request to Flask-compatible format
    req = {
        'httpMethod': request.method,
        'path': request.path,
        'headers': dict(request.headers),
        'queryStringParameters': dict(request.args),
        'body': request.get_data().decode('utf-8') if request.get_data() else None
    }
    
    # Call the handler
    response = handler(req)
    
    # Convert response to Vercel format
    return Response(
        response.get('body', ''),
        status=response.get('statusCode', 500),
        headers=response.get('headers', {'Content-Type': 'application/json'})
    )

# For local development
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
