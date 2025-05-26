from flask import jsonify
from . import app

@app.route('/api/test')
def test():
    return jsonify({"message": "Serverless function is working!"})
