import sys, json, time
from faster_whisper import WhisperModel
audio, out, size = sys.argv[1], sys.argv[2], (sys.argv[3] if len(sys.argv) > 3 else 'large-v3-turbo')
t = time.time()
m = WhisperModel(size, device='cpu', compute_type='int8', cpu_threads=4)
import subprocess, numpy as np
pcm = subprocess.run(['ffmpeg','-v','error','-i',audio,'-f','f32le','-ac','1','-ar','16000','-'],capture_output=True,check=True).stdout
arr = np.frombuffer(pcm, np.float32)
segs, info = m.transcribe(arr, language='th', word_timestamps=True, beam_size=5, vad_filter=False)
words = []
for s in segs:
    print(f'[{s.start:6.2f}-{s.end:6.2f}] {s.text}', flush=True)
    for w in s.words: words.append({'w': w.word, 's': round(w.start, 2), 'e': round(w.end, 2)})
json.dump(words, open(out, 'w'), ensure_ascii=False, indent=0)
print('done', round(time.time() - t), 's', len(words), 'words')
