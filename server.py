from flask import Flask, render_template, request, flash, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename
import os, json

UPLOAD_FOLDER = '/DATASTORE/saved'
ALLOWED_EXTENSIONS = set(['opus'])

app = Flask(__name__)
app.secret_key = 'fa2Is6SBtEHgaOaz6u3n'

app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/saveRecording', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        print('?')
        # check if the post request has the file part
        if 'file' not in request.files:
            #flash('No file part')
            print('no file')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            print('no file name')
            #flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            print('saving...')
            print(file.filename)
            filename = secure_filename(file.filename)
            print(filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            savedAs = {'file': filename}
            return (json.dumps(savedAs), 200)
    return ('error', 201)

@app.route('/recordings/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename)

@app.route("/")
def index():
    return render_template('index.html')
