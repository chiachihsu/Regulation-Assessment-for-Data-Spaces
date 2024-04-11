from flask import Flask, send_from_directory
import os
from views import views

app = Flask(__name__) #initialize the application

app.register_blueprint(views)

BPMN_FOLDER = os.path.join(app.root_path, 'bpmn')

@app.route('/bpmn/<path:filename>')
def serve_bpmn_file(filename):
    return send_from_directory(BPMN_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, port=7000)
