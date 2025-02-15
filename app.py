from flask import Flask, render_template, request, redirect, url_for, send_from_directory, jsonify
import os
import moviepy
from moviepy.video.io.VideoFileClip import VideoFileClip


import yt_dlp
import requests
import time

app = Flask(__name__, static_folder='static')
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensuring the upload folder exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# AssemblyAI API Key
ASSEMBLYAI_API_KEY = "f2a7f161a1b9437791d864234be327f3"

#  functions for transcription
def upload_audio_to_assemblyai(audio_path):

    api_key = "f2a7f161a1b9437791d864234be327f3"  
    upload_url = "https://api.assemblyai.com/v2/upload"
    headers = {"authorization": api_key}

    with open(audio_path, "rb") as file:
        response = requests.post(upload_url, headers=headers, files={"file": file})
    
    if response.status_code == 200:
        return response.json()["upload_url"]
    else:
        raise Exception(f"Failed to upload audio: {response.status_code} {response.text}")

def request_transcription(audio_url):
    """Requests transcription from AssemblyAI."""
    url = 'https://api.assemblyai.com/v2/transcript'
    headers = {'authorization': ASSEMBLYAI_API_KEY}
    payload = {'audio_url': audio_url}

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()['id']

def get_transcription_result(transcript_id):
    """Polls for the transcription result."""
    url = f'https://api.assemblyai.com/v2/transcript/{transcript_id}'
    headers = {'authorization': ASSEMBLYAI_API_KEY}

    while True:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        result = response.json()

        if result['status'] == 'completed':
            return result['text']
        elif result['status'] == 'failed':
            raise Exception("Transcription failed.")
        time.sleep(5)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_video', methods=['POST'])
def process_video():
    video_file = request.files.get('videoUpload')
    video_url = request.form.get('videoUrl')

    template = request.form.get('template', 'audio')  #  template (default: 'audio')


    if not video_file and not video_url:
        return "No video file or URL provided", 400

    try:
        if video_file:
            # Save uploaded video
            video_path = os.path.join(app.config['UPLOAD_FOLDER'], video_file.filename)
            video_file.save(video_path)
        elif video_url:
            # Download video from URL
            ydl_opts = {
                'outtmpl': os.path.join(app.config['UPLOAD_FOLDER'], '%(id)s.%(ext)s'),
                'format': 'bestvideo+bestaudio',
                'postprocessors': [{'key': 'FFmpegVideoConvertor', 'preferedformat': 'mp4'}],
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(video_url, download=True)
                video_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{info_dict['id']}.mp4")

        # Convert video to audio
        output_audio_path = os.path.join(app.config['UPLOAD_FOLDER'], 'output_audio.mp3')
        clip = VideoFileClip(video_path)
        clip.audio.write_audiofile(output_audio_path)
        clip.close()

    except Exception as e:
        return f"Error processing video: {str(e)}", 500

    return redirect(url_for('audio_page', audio_file='output_audio.mp3', template=template))

@app.route('/audio')
def audio_page():
    audio_file = request.args.get('audio_file', '')
    audio_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_file)

    if not os.path.exists(audio_path):
        return "Audio file not found", 404

    # Determine template  on user selection from home.html
    template = request.args.get('template', 'audio') 

    if template == 'ho_audio':
        return render_template('ho_audio.html', audio_file=audio_file)
    else:
        return render_template('audio.html', audio_file=audio_file)


@app.route('/transcribe_audio')
def transcribe_audio():
    audio_file = request.args.get('audio_file')
    audio_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_file)

    if not os.path.exists(audio_path):
        return jsonify({"error": "Audio file not found"}), 404

    try:
        # Upload audio and transcribe
        audio_url = upload_audio_to_assemblyai(audio_path)
        transcript_id = request_transcription(audio_url)
        transcription_text = get_transcription_result(transcript_id)

        return jsonify({"transcription_text": transcription_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/signup')
def signup():
    return render_template('signup.html')



@app.route('/login')
def login():
    return render_template('login.html') 

@app.route('/home')
def home():
    return render_template('home.html')  



if __name__ == '__main__':
    app.run(debug=True)
