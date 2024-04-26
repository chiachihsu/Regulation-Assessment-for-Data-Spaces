from flask import Blueprint, render_template
import os


views = Blueprint("rads",__name__)

@views.route("/")
def home():
    return render_template("index.html", active_page='home')

@views.route("/assessment")
def display():
    files = os.listdir('bpmn')
    # Filter to only include XML files if necessary
    xml_files = [file for file in files if file.endswith('.xml')]
    return render_template("assessment.html", files=xml_files, active_page = "assessment")