#!/usr/bin/env python3
"""OpenAI image generation CLI for single prompts and JSONL batches."""

from __future__ import annotations

import argparse
import base64
import json
import os
import pathlib
import re
import sys
import urllib.request
from typing import Any

try:
    from openai import OpenAI
except ModuleNotFoundError as exc:
    if exc.name == "openai":
        print(
            "Missing Python dependency: openai. Install it in a virtualenv, for example:\n"
            "  python3 -m venv /tmp/imagegen-venv\n"
            "  /tmp/imagegen-venv/bin/pip install openai\n"
            "  /tmp/imagegen-venv/bin/python scripts/image_gen.py --help",
            file=sys.stderr,
        )
        raise SystemExit(1) from exc
    raise


DEFAULT_MODEL = "gpt-image-1.5"
DEFAULT_SIZE = "1024x1024"
DEFAULT_QUALITY = "high"


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-{2,}", "-", value)
    return value.strip("-") or "image"


def ensure_parent(path: pathlib.Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def require_api_key() -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        return api_key
    print("Missing OPENAI_API_KEY environment variable.", file=sys.stderr)
    sys.exit(1)


def read_image_bytes(image_item: Any) -> bytes:
    b64_json = getattr(image_item, "b64_json", None)
    if b64_json:
        return base64.b64decode(b64_json)

    url = getattr(image_item, "url", None)
    if url:
        with urllib.request.urlopen(url) as response:
            return response.read()

    raise RuntimeError("Image response did not include b64_json or url.")


def generate_one(
    client: OpenAI,
    prompt: str,
    out_path: pathlib.Path,
    *,
    model: str,
    size: str,
    quality: str,
    background: str | None,
) -> pathlib.Path:
    options: dict[str, Any] = {
        "model": model,
        "prompt": prompt,
        "n": 1,
        "size": size,
        "quality": quality,
    }
    if background:
        options["background"] = background

    response = client.images.generate(**options)
    image_item = response.data[0]
    image_bytes = read_image_bytes(image_item)

    ensure_parent(out_path)
    out_path.write_bytes(image_bytes)
    return out_path


def run_generate(args: argparse.Namespace, client: OpenAI) -> int:
    out_dir = pathlib.Path(args.out_dir)
    if args.out:
        out_path = pathlib.Path(args.out)
    else:
        name = args.name or slugify(args.prompt)[:72]
        out_path = out_dir / f"{name}.png"

    saved = generate_one(
        client,
        args.prompt,
        out_path,
        model=args.model,
        size=args.size,
        quality=args.quality,
        background=args.background,
    )
    print(saved)
    return 0


def run_batch(args: argparse.Namespace, client: OpenAI) -> int:
    jsonl_path = pathlib.Path(args.jsonl)
    out_dir = pathlib.Path(args.out_dir)

    if not jsonl_path.exists():
        print(f"Batch file not found: {jsonl_path}", file=sys.stderr)
        return 1

    success = 0
    failed = 0

    with jsonl_path.open("r", encoding="utf-8") as handle:
        for line_number, raw_line in enumerate(handle, start=1):
            line = raw_line.strip()
            if not line:
                continue

            try:
                payload = json.loads(line)
            except json.JSONDecodeError as exc:
                failed += 1
                print(f"[line {line_number}] invalid JSON: {exc}", file=sys.stderr)
                continue

            prompt = payload.get("prompt")
            if not prompt:
                failed += 1
                print(f"[line {line_number}] missing prompt", file=sys.stderr)
                continue

            out_value = payload.get("out")
            if out_value:
                out_path = pathlib.Path(out_value)
            else:
                base_name = payload.get("id") or payload.get("name") or slugify(prompt)[:72]
                out_path = out_dir / f"{base_name}.png"

            model = payload.get("model", args.model)
            size = payload.get("size", args.size)
            quality = payload.get("quality", args.quality)
            background = payload.get("background", args.background)

            try:
                saved = generate_one(
                    client,
                    prompt,
                    out_path,
                    model=model,
                    size=size,
                    quality=quality,
                    background=background,
                )
                success += 1
                print(f"[line {line_number}] {saved}")
            except Exception as exc:  # noqa: BLE001
                failed += 1
                print(f"[line {line_number}] failed: {exc}", file=sys.stderr)

    print(f"batch complete: success={success} failed={failed}")
    return 0 if failed == 0 else 2


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="OpenAI image generation CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    shared = argparse.ArgumentParser(add_help=False)
    shared.add_argument("--model", default=DEFAULT_MODEL)
    shared.add_argument("--size", default=DEFAULT_SIZE)
    shared.add_argument("--quality", default=DEFAULT_QUALITY)
    shared.add_argument("--background", default=None)

    generate = subparsers.add_parser("generate", parents=[shared])
    generate.add_argument("--prompt", required=True)
    generate.add_argument("--out", default=None)
    generate.add_argument("--out-dir", default="output/imagegen")
    generate.add_argument("--name", default=None)

    batch = subparsers.add_parser("batch", parents=[shared])
    batch.add_argument("--jsonl", required=True, help="One JSON object per line")
    batch.add_argument("--out-dir", default="output/imagegen")

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    api_key = require_api_key()
    client = OpenAI(api_key=api_key)

    if args.command == "generate":
        return run_generate(args, client)
    if args.command == "batch":
        return run_batch(args, client)

    parser.error(f"Unsupported command: {args.command}")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
