from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from database import init_db
from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.storage import storage_bp
from routes.peers import peers_bp
from routes.projects import projects_bp
from routes.rooms import rooms_bp
from routes.evidence import evidence_bp
from routes.events import events_bp
from routes.notifications import notifications_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    import os
    frontend_url = os.getenv('FRONTEND_URL', '*')
    CORS(app, resources={r"/api/*": {"origins": frontend_url}})
    jwt = JWTManager(app)
    init_db(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(storage_bp, url_prefix='/api/storage')
    app.register_blueprint(peers_bp, url_prefix='/api/peers')
    app.register_blueprint(projects_bp, url_prefix='/api/projects')
    app.register_blueprint(rooms_bp, url_prefix='/api/rooms')
    app.register_blueprint(evidence_bp, url_prefix='/api/evidence')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        # Check DB connection
        from database import get_db
        db_status = "connected" if get_db() is not None else "disconnected"
        return jsonify({
            "status": "ok",
            "database": db_status
        }), 200

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"msg": "Bad request", "error": str(error)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"msg": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({"msg": "Internal server error"}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
