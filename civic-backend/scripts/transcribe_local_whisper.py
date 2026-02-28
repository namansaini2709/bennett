#!/usr/bin/env python3
import argparse
import sys

from faster_whisper import WhisperModel


def parse_args():
    parser = argparse.ArgumentParser(description="Transcribe IVR audio with local faster-whisper.")
    parser.add_argument("--audio", required=True, help="Path to audio file")
    parser.add_argument("--language", default="en", help="Language code (en/hi)")
    parser.add_argument("--model", default="small", help="Whisper model size (tiny/base/small/medium/large-v3)")
    parser.add_argument("--device", default="cpu", help="Device (cpu/cuda)")
    return parser.parse_args()


def main():
    args = parse_args()
    try:
        model = WhisperModel(args.model, device=args.device, compute_type="int8")
        segments, _ = model.transcribe(
            args.audio,
            language=args.language,
            vad_filter=True,
            beam_size=2,
            best_of=2
        )
        text = " ".join(seg.text.strip() for seg in segments if seg.text and seg.text.strip()).strip()
        print(text)
    except Exception as exc:
        print(f"transcription_failed: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
