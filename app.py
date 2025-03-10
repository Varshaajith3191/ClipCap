from flask import Flask, render_template, request, redirect, url_for, jsonify
import os

app = Flask(__name__)

# Ensure uploads folder exists
UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/process_video", methods=["POST"])
def process_video():
    if "videoUpload" in request.files:
        video = request.files["videoUpload"]

        if video.filename == "":
            return jsonify({"error": "No selected file"}), 400

        # Save file to uploads folder
        video_path = os.path.join(app.config["UPLOAD_FOLDER"], video.filename)
        video.save(video_path)

        return jsonify({"message": "Video uploaded successfully", "filename": video.filename}), 200

    elif "videoUrl" in request.form:
        video_url = request.form["videoUrl"]
        if not video_url:
            return jsonify({"error": "No URL provided"}), 400

        # Here you could process the video URL (e.g., YouTube download)
        return jsonify({"message": "Video URL received", "url": video_url}), 200

    return jsonify({"error": "Invalid request"}), 400


@app.route('/signup')
def signup():
    return render_template('signup.html')



@app.route('/login')
def login():
    return render_template('login.html') 

@app.route('/home')
def home():
    return render_template('home.html')  


if __name__ == "__main__":
    app.run(debug=True)
