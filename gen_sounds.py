"""Misterio spin səsləri: tirrrrr (fırlatma) və win (qazanma fanfarı).
   Real audio faylları kimi generasiya olunur və assets/audio/ qovluğuna yazılır."""
import numpy as np
from scipy.io import wavfile
import os

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "assets", "audio")
os.makedirs(OUT, exist_ok=True)

def write(name, data):
    data = np.clip(data, -0.99, 0.99)
    wavfile.write(os.path.join(OUT, name), SR, (data * 32767).astype(np.int16))
    print("✓", name, f"({len(data)/SR:.1f}s)")

# ── 1. TIRRRRR — fırlatma səsi (dönən çarx, tədricən yavaşlayan) ──
def gen_spin(dur=5.0):
    t = np.linspace(0, dur, int(SR * dur), False)
    # Dönən səs: zərif "tick" impulsları, tezlik tədricən azalır (çarx yavaşlayır)
    # 5s ərzində ~ 15Hz-dən 4Hz-ə qədər
    rate = np.linspace(15, 4, len(t))  # tick tezliyi
    phase = np.cumsum(rate) / SR * 2 * np.pi
    # Hər dövrədə qısa "tık" impulsu
    tick = np.where(np.sin(phase) > 0.985, 1.0, 0.0)
    # Yumşalt (envelope)
    env = np.exp(-30 * (t % (1 / np.clip(rate, 1, 30))))  # hər tick üçün qısa decay
    sig = tick * env
    # Ayrıca aşağı hum (dönən mühərrik kimi)
    hum = 0.15 * np.sin(2 * np.pi * 90 * t) * (1 - t / dur * 0.6)
    sig = sig * 0.8 + hum
    # Ümumi yavaşlama envelope (sona doğru səs kəsilir)
    sig *= np.linspace(1, 0.15, len(t))
    return sig

# ── 2. WIN — qazanma fanfarı (maraqlı, sevindirici) ──
def gen_win():
    dur = 1.4
    t = np.linspace(0, dur, int(SR * dur), False)
    sig = np.zeros_like(t)
    # Fanfar: yuxarı qalxan arpeggio + parlaq "shine"
    notes = [
        (523.25, 0.00, 0.18),   # C5
        (659.25, 0.12, 0.18),   # E5
        (783.99, 0.24, 0.18),   # G5
        (1046.5, 0.36, 0.55),   # C6 (uzun, parlaq)
    ]
    for f, start, length in notes:
        i0 = int(start * SR)
        i1 = min(i0 + int(length * SR), len(t))
        tt = t[i0:i1] - start
        # triangular wave + harmonic zənginliyi
        note = np.sin(2*np.pi*f*tt)
        note += 0.3 * np.sin(2*np.pi*2*f*tt)
        note += 0.15 * np.sin(2*np.pi*3*f*tt)
        # envelope (attack + decay)
        env = np.exp(-6 * tt) * (1 - np.exp(-80 * tt))
        sig[i0:i1] += note * env * 0.4
    # Sona doğru "sparkle" (yüksək freq zərbələr)
    sparkle_t = np.linspace(0, 0.4, int(0.4 * SR))
    sparkle = 0.12 * np.sin(2*np.pi*2000*sparkle_t) * np.exp(-10*sparkle_t)
    s0 = int(0.9 * SR)
    sig[s0:s0+len(sparkle)] += sparkle
    return sig

write("spin.wav", gen_spin())
write("win.wav", gen_win())
print("Hazır!")
