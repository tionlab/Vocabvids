from flask import Flask, json, Response, send_file, request, jsonify
from io import BytesIO
import random
from PIL import Image, ImageDraw, ImageFont
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips
from gtts import gTTS
import requests
import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from flask_cors import CORS
import deepl
import tempfile

load_dotenv(override=True)
translator = deepl.Translator(os.environ.get("DEEPL_API_KEY"))

client = OpenAI(
    api_key = os.environ.get("OPENAI_API_KEY"),
)

app = Flask(__name__)
CORS(app)

def draw_text_with_outline(draw, position, text, font, text_color, outline_color, outline_width):
    x, y = position
    for dx in range(-outline_width, outline_width + 1):
        for dy in range(-outline_width, outline_width + 1):
            if dx != 0 or dy != 0:
                draw.text((x + dx, y + dy), text, font=font, fill=outline_color)

    draw.text(position, text, font=font, fill=text_color)

def add_text_to_image(image, text, font_path, font_size=20, text_color=(255, 255, 255), outline_color=(0, 0, 0), outline_width=1, padding=50):
    image = image.resize((512, 512))
    draw = ImageDraw.Draw(image)
    
    font = ImageFont.truetype(font_path, font_size)
    
    image_width, image_height = image.size
    
    lines = []
    words = text.split(' ')
    current_line = ''
    
    for word in words:
        test_line = f"{current_line} {word}".strip()
        text_width, _ = draw.textbbox((0, 0), test_line, font=font)[2:]
        if text_width <= image_width - padding:
            current_line = test_line
        else:
            lines.append(current_line)
            current_line = word
            
    lines.append(current_line)
    
    text_height = sum(draw.textbbox((0, 0), line, font=font)[3] - draw.textbbox((0, 0), line, font=font)[1] for line in lines)
    
    y = image_height - text_height - 20 
    
    for line in lines:
        x = padding / 2 
        draw_text_with_outline(draw, (x, y), line, font, text_color, outline_color, outline_width)
        y += draw.textbbox((0, 0), line, font=font)[3] - draw.textbbox((0, 0), line, font=font)[1]
    
    return image

def download_image(image_url):
    response = requests.get(image_url)
    image = Image.open(BytesIO(response.content))
    return image

async def create_video_with_tts(image_text_pairs, output_path='output_video.mp4', font_path='Hanbit.ttf', font_size=30):
    clips = []
    
    for image_url, text in image_text_pairs:
        image = download_image(image_url)
        edited_image = add_text_to_image(image, text, font_path, font_size)
        
        temp_image_path = 'temp_image.png'
        edited_image.save(temp_image_path)
        
        tts = gTTS(text=text, lang='ko')

        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
            temp_audio_path = temp_file.name
            tts.save(temp_audio_path)

        while not os.path.exists(temp_audio_path):
            pass

        audio = AudioFileClip(temp_audio_path)
        audio_duration = audio.duration
        total_duration = audio_duration + 3

        clip = ImageClip(temp_image_path).set_duration(total_duration)
        clip = clip.set_audio(audio)
        clips.append(clip)
    
    final_clip = concatenate_videoclips(clips)
    final_clip = final_clip.resize(height=512)
    final_clip.write_videofile(output_path, fps=24)

@app.route('/vid', methods=['POST'])
async def make_vid():
    request_data = request.get_json()
    story_text = request_data['story']
    story_data = json.loads(story_text)
    story_first = story_data['first']
    story_second = story_data['second']
    story_third = story_data['third']
    story_forth = story_data['forth']
    info_text = request_data['info']
    info_data = json.loads(info_text)
    info_first =  info_data['first']
    info_second =  info_data['second']
    info_third =  info_data['third']
    info_forth = info_data['forth']

    generated_urls = []
    for text in [info_first, info_second, info_third, info_forth]:
        result = translator.translate_text(text, target_lang="EN-US")
        response = client.images.generate(
            model="dall-e-3",
            prompt="Fantasy style, "+result.text,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        generated_urls.append(str(response.data[0].url))
    image_text_pairs = []
    for url, text in zip(generated_urls, [story_first, story_second, story_third, story_forth]):
        image_text_pairs.append((url, text))
    await create_video_with_tts(image_text_pairs)
    return send_file("output_video.mp4", mimetype='video/mp4', as_attachment=False, download_name='output_video.mp4')

if __name__ == '__main__':
    app.run(use_reloader=False)
    
