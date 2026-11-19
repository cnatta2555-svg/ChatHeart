"""สร้างพรีเซนเตอร์ปากขยับตามเสียง จากรูปตัดพื้นหลัง (PNG โปร่งใส) ด้วย Wav2Lip (ONNX)

ใช้: python3 presenter.py <photo_cut.png> <voice.mp3> <out_dir> [--crop x0,y0,x1,y1] [--face x0,y0,x1,y1] [--fps 30] [--model wav2lip_gan.onnx]
ได้: <out_dir>/p_0001.png ... เป็นภาพโปร่งใส ใช้กับ <img data-seq="out_dir/p_%04d.png" data-n=... data-speed="1" data-loop="0">

ขั้นตอน: ขยับปากบนรูปนิ่งก่อน (กรอบหน้าตายตัว แม่นกว่า) แล้วค่อยใส่การโยกตัว/หายใจทีหลัง
"""
import argparse, math, os, subprocess
import numpy as np, cv2, librosa, onnxruntime as ort

ap = argparse.ArgumentParser()
ap.add_argument('photo'); ap.add_argument('audio'); ap.add_argument('out')
ap.add_argument('--crop', default='40,240,680,1040', help='ส่วนของรูปที่ใช้ (ครึ่งตัว)')
ap.add_argument('--face', default='238,130,422,342', help='กรอบหน้า (คิ้วถึงคาง) ในพิกัดหลัง crop')
ap.add_argument('--fps', type=float, default=30)
ap.add_argument('--model', default=os.path.join(os.path.dirname(__file__), 'models', 'wav2lip_gan.onnx'))
ap.add_argument('--still', action='store_true', help='ไม่ใส่การโยกตัว')
ap.add_argument('--enhance', type=float, default=0.75, help='ความแรงการทำหน้าคมด้วย GFPGAN (0 = ปิด)')
ap.add_argument('--lmk', default='291.7,186.7,375,186.7,330,241.7,300,270,370,270', help='จุดหน้า 5 จุด (ตาซ้าย ตาขวา จมูก มุมปากซ้าย มุมปากขวา) หลัง crop')
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)

# --- รูป ---
src = cv2.imread(a.photo, cv2.IMREAD_UNCHANGED)
x0, y0, x1, y1 = map(int, a.crop.split(','))
src = src[y0:y1, x0:x1]
alpha = src[:, :, 3].astype(np.float32) / 255
rgb = src[:, :, :3].astype(np.float32)
base = (rgb * alpha[..., None] + 128 * (1 - alpha[..., None])).astype(np.uint8)  # BGR บนพื้นเทา ให้โมเดลเห็นหน้า
fx0, fy0, fx1, fy1 = map(int, a.face.split(','))
face = base[fy0:fy1, fx0:fx1]
fw, fh = fx1 - fx0, fy1 - fy0
ref = cv2.resize(face, (96, 96))

# --- เสียง → mel แบบเดียวกับตอนเทรน Wav2Lip ---
wav, _ = librosa.load(a.audio, sr=16000)
pre = np.append(wav[0], wav[1:] - 0.97 * wav[:-1])
D = librosa.stft(pre, n_fft=800, hop_length=200, win_length=800)
melb = librosa.filters.mel(sr=16000, n_fft=800, n_mels=80, fmin=55, fmax=7600)
S = 20 * np.log10(np.maximum(1e-5, melb @ np.abs(D))) - 20
mel = np.clip(8 * ((S + 100) / 100) - 4, -4, 4)
dur = len(wav) / 16000
N = int(math.ceil(dur * a.fps))
mult = 80. / a.fps
chunks = []
for i in range(N):
    s = int(i * mult)
    chunks.append(mel[:, s:s + 16] if s + 16 <= mel.shape[1] else mel[:, -16:])
chunks = np.stack(chunks)[:, None].astype(np.float32)
# พลังเสียงต่อเฟรม ใช้ทำให้หัวพยักตามจังหวะพูด
energy = np.array([c.mean() for c in chunks[:, 0]]); energy = (energy - energy.min()) / (np.ptp(energy) + 1e-6)
energy = np.convolve(energy, np.ones(9) / 9, 'same')
energy_s = np.convolve(np.abs(np.diff(energy, prepend=energy[0])) * 8, np.ones(5) / 5, 'same').clip(0, 1)

# --- ตัวทำหน้าคม (GFPGAN) ---
gfp = None
if a.enhance > 0:
    gfp = ort.InferenceSession(os.path.join(os.path.dirname(a.model), 'gfpgan_1.4.onnx'), providers=['CPUExecutionProvider'])
    L = np.array(list(map(float, a.lmk.split(',')))).reshape(5, 2)
    TPL = np.array([[192.98138, 239.94708], [318.90277, 240.1936], [256.63416, 314.01935], [201.26117, 371.41043], [313.08905, 371.15118]])
    AFF = cv2.estimateAffinePartial2D(L, TPL)[0]
    INV = cv2.invertAffineTransform(AFF)
    em = np.zeros((512, 512), np.float32)
    cv2.ellipse(em, (256, 300), (170, 215), 0, 0, 360, 1, -1)
    em = cv2.GaussianBlur(em, (0, 0), 22)

def enhance(frame):
    f = cv2.warpAffine(frame.clip(0, 255).astype(np.uint8), AFF, (512, 512), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    x = (f[:, :, ::-1].astype(np.float32) / 255 - .5) / .5
    y = gfp.run(None, {'input': x.transpose(2, 0, 1)[None]})[0][0].transpose(1, 2, 0)
    y = ((y.clip(-1, 1) + 1) / 2 * 255)[:, :, ::-1]
    back = cv2.warpAffine(y, INV, (frame.shape[1], frame.shape[0]), flags=cv2.INTER_CUBIC)
    mk = cv2.warpAffine(em, INV, (frame.shape[1], frame.shape[0]))[..., None] * a.enhance
    return back * mk + frame * (1 - mk)

# --- ขยับปาก ---
sess = ort.InferenceSession(a.model, providers=['CPUExecutionProvider'])
masked = ref.copy(); masked[48:] = 0
vid_in = np.concatenate([masked, ref], axis=2).transpose(2, 0, 1)[None].astype(np.float32) / 255
# หน้ากากนุ่มครอบปาก/คาง ให้รอยต่อกลืน
m = np.zeros((fh, fw), np.float32)
cv2.ellipse(m, (fw // 2, int(fh * 0.72)), (int(fw * 0.36), int(fh * 0.27)), 0, 0, 360, 1, -1)
m = cv2.GaussianBlur(m, (0, 0), fw * 0.06)[..., None]
B = 32
for b in range(0, N, B):
    mb = chunks[b:b + B]
    out = sess.run(None, {'mel': mb, 'vid': np.repeat(vid_in, len(mb), 0)})[0]
    for j, g in enumerate(out):
        i = b + j
        g = (g.transpose(1, 2, 0) * 255).clip(0, 255).astype(np.uint8)
        g = cv2.resize(g, (fw, fh), interpolation=cv2.INTER_CUBIC).astype(np.float32)
        frame = rgb.copy()
        frame[fy0:fy1, fx0:fx1] = g * m + frame[fy0:fy1, fx0:fx1] * (1 - m)
        if gfp is not None:
            frame = enhance(frame)
        img = np.dstack([frame.clip(0, 255).astype(np.uint8), (alpha * 255).astype(np.uint8)])
        if not a.still:  # โยกตัวเบาๆ หมุนรอบจุดกลางล่าง
            t = i / a.fps
            ang = 1.1 * math.sin(2 * math.pi * t / 5.3) + 0.4 * math.sin(2 * math.pi * t / 2.1) + 0.9 * (energy[i] - .5)
            sc = 1 + 0.007 * math.sin(2 * math.pi * t / 3.6)
            h, w = img.shape[:2]
            M = cv2.getRotationMatrix2D((w / 2, h), ang, sc)
            M[1, 2] += 3 * math.sin(2 * math.pi * t / 3.6) + 5 * energy_s[i]
            M[0, 2] += 2.5 * math.sin(2 * math.pi * t / 6.1)
            img = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
        cv2.imwrite(os.path.join(a.out, f'p_{i + 1:04d}.png'), img, [cv2.IMWRITE_PNG_COMPRESSION, 1])
    print(f'{min(b + B, N)}/{N}', flush=True)
print('done', N, 'frames')
