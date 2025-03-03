from PIL import Image, ImageDraw, ImageFont
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips
from gtts import gTTS
import requests
from io import BytesIO

def draw_text_with_outline(draw, position, text, font, text_color, outline_color, outline_width):
    x, y = position
    for dx in range(-outline_width, outline_width + 1):
        for dy in range(-outline_width, outline_width + 1):
            if dx != 0 or dy != 0:
                draw.text((x + dx, y + dy), text, font=font, fill=outline_color)

    draw.text(position, text, font=font, fill=text_color)

def add_text_to_image(image, text, font_path, font_size=20, text_color=(255, 255, 255), outline_color=(0, 0, 0), outline_width=1, padding=50):
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

def create_video_with_tts(image_text_pairs, output_path='output_video.mp4', font_path='Hanbit.ttf', font_size=30):
    clips = []
    
    for image_url, text in image_text_pairs:
        image = download_image(image_url)
        edited_image = add_text_to_image(image, text, font_path, font_size)
        
        temp_image_path = 'temp_image.png'
        edited_image.save(temp_image_path)
        
        tts = gTTS(text=text, lang='ko')
        temp_audio_path = 'temp_audio.mp3'
        tts.save(temp_audio_path)
        
        audio = AudioFileClip(temp_audio_path)
        audio_duration = audio.duration
        total_duration = audio_duration + 3 

        clip = ImageClip(temp_image_path).set_duration(total_duration)
        clip = clip.set_audio(audio)
        clips.append(clip)
    
    final_clip = concatenate_videoclips(clips)
    final_clip.write_videofile(output_path, fps=24)

image_text_pairs = [
    ('https://upload.wikimedia.org/wikipedia/commons/6/63/Icon_Bird_512x512.png', '1수'),
    ('https://upload.wikimedia.org/wikipedia/commons/6/63/Icon_Bird_512x512.png', '2기'),
    ('https://upload.wikimedia.org/wikipedia/commons/6/63/Icon_Bird_512x512.png', '3강'),
    ('https://upload.wikimedia.org/wikipedia/commons/6/63/Icon_Bird_512x512.png', '4두')
]
create_video_with_tts(image_text_pairs)
