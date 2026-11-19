#!/usr/bin/env python3
"""
RunningHub FLUX.2-Klein (f-2-klein-9b) 少量测试出图脚本（3 键试跑：Esc / Enter / Space）
用法：
  python3 /Users/apple/Documents/github/keyboardDemo/keyboards/chinatsu/run_klein_test.py --key YOUR_API_KEY
或：
  export RUNNINGHUB_API_KEY="YOUR_API_KEY"
  python3 /Users/apple/Documents/github/keyboardDemo/keyboards/chinatsu/run_klein_test.py
"""

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request

RAW_DIR = "/Users/apple/Documents/github/keyboardDemo/keyboards/chinatsu/raw"
os.makedirs(RAW_DIR, exist_ok=True)

TEST_JOBS = [
    {
        "name": "test_Esc.png",
        "width": 1024,
        "height": 1024,
        "prompt": (
            "16-bit cute anime chibi pixel art keycap illustration, flat top-down print design on pure solid off-white (#f9fcf9) background, "
            "NO 3D keycap border, NO frame, NO shadow. Character is Sunna / Chinatsu from Zenless Zone Zero (Angels of Delusion): "
            "very pale desaturated silvery-sage cream hair fading softly to muted celadon-gray-green wavy tips, "
            "curved face-framing bangs with a tiny hollow silver triangle hairclip on her left bang and two parallel horizontal black barrettes on her right bang, "
            "high fluffy side-ponytail tied with a sharp pointed pale-aqua leaf ribbon, slightly half-lidded cool-shy pale olive-gold eyes, "
            "nervously hiding behind her pastel pink backpack peeking out with a tiny blue sweat drop. "
            "Bold dark charcoal pixel font text reading 'ESC' neatly centered below, crisp 48x50 pixel art density matching Japanese custom keycaps."
        ),
    },
    {
        "name": "test_Enter.png",
        "width": 1280,
        "height": 576,
        "prompt": (
            "16-bit cute anime chibi pixel art keycap illustration for a 2.25u horizontal Enter key, flat top-down print design on pure solid off-white (#f9fcf9) background, "
            "NO 3D keycap border, NO frame, NO shadow. On the left is chibi Sunna / Chinatsu from Zenless Zone Zero (Angels of Delusion): "
            "very pale silvery-sage cream hair fading to muted celadon tips, hollow silver triangle hairclip + two parallel horizontal black barrettes on bangs, "
            "high side-ponytail with sharp pointed pale-aqua ribbon, slightly half-lidded pale olive-gold eyes, crisp white shirt, thin crimson necktie, black choker, "
            "pink-and-white striped arm warmers, white feathered angel wings spread wide behind her, making a cute peace sign. "
            "On the right is crisp bold dark charcoal pixel font text reading 'Enter', accented with tiny pink pixel hearts and pale-aqua four-point sparkles."
        ),
    },
    {
        "name": "test_Space.png",
        "width": 1536,
        "height": 384,
        "prompt": (
            "16-bit cute anime chibi pixel art keycap illustration for a 6.25u mechanical keyboard spacebar, flat top-down print design on pure solid off-white (#f9fcf9) background, "
            "NO 3D keycap border, NO frame, NO shadow. On the left-center is chibi Sunna / Chinatsu from Zenless Zone Zero (Angels of Delusion): "
            "very pale silvery-sage cream hair fading to muted celadon tips, hollow silver triangle hairclip + two parallel black barrettes on bangs, "
            "high side-ponytail with sharp pointed pale-aqua ribbon, half-lidded pale olive-gold eyes, white shirt, crimson tie, fluffy black skirt, "
            "white angel wings, pink-and-white striped arm warmers and leg warmers, lying playfully on her stomach kicking her legs while tapping a tiny pastel pink synthesizer keyboard. "
            "Next to her is bold dark charcoal pixel font text reading 'Chinatsu', surrounded by floating pastel pink and pale-aqua pixel musical notes, soap bubbles, and hearts."
        ),
    },
]


def http_json(url, payload, api_key, timeout=30):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "KeyCraft3D-KleinClient/1.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def detect_host(api_key):
    for host in ("https://www.runninghub.cn", "https://www.runninghub.ai"):
        try:
            res = http_json(f"{host}/uc/openapi/accountStatus", {"apikey": api_key}, api_key, timeout=10)
            if isinstance(res, dict) and (res.get("code") == 0 or "data" in res):
                print(f"[OK] Connected to {host}")
                return host
        except Exception as e:
            print(f"[SKIP] {host}: {e}")
    return "https://www.runninghub.cn"


def submit_klein(host, api_key, prompt, width, height):
    url = f"{host}/openapi/v2/rhart-image/f-2-klein-9b/text-to-image"
    payload = {
        "36##text": prompt,
        "51##select": "1",
        "35##value": width,
        "34##value": height,
        "54##file_type": "PNG",
    }
    res = http_json(url, payload, api_key, timeout=30)
    task_id = res.get("taskId")
    if not task_id:
        raise RuntimeError(f"Submit failed: {json.dumps(res, ensure_ascii=False)}")
    return task_id


def poll_task(host, api_key, task_id, max_wait=180):
    url = f"{host}/openapi/v2/query"
    t0 = time.time()
    while time.time() - t0 < max_wait:
        res = http_json(url, {"taskId": task_id}, api_key, timeout=20)
        status = res.get("status", "")
        if status == "SUCCESS":
            results = res.get("results") or []
            if results and results[0].get("url"):
                return results[0]["url"]
            raise RuntimeError(f"Task SUCCESS but no result url: {res}")
        if status in ("FAILED", "ERROR", "CANCELED"):
            raise RuntimeError(f"Task {task_id} failed: {res}")
        time.sleep(3)
    raise TimeoutError(f"Task {task_id} timed out after {max_wait}s")


def download_file(url, dst):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    with open(dst, "wb") as f:
        f.write(data)
    return len(data)


def main():
    parser = argparse.ArgumentParser(description="RunningHub FLUX.2-Klein 少量键帽测试脚本")
    parser.add_argument("--key", default=os.environ.get("RUNNINGHUB_API_KEY", ""), help="RunningHub API Key")
    parser.add_argument("--host", default="", help="可选：手动指定 https://www.runninghub.cn 或 https://www.runninghub.ai")
    args = parser.parse_args()

    if not args.key:
        print("请通过 --key 或环境变量 RUNNINGHUB_API_KEY 提供 API Key。")
        sys.exit(1)

    host = args.host or detect_host(args.key)
    for job in TEST_JOBS:
        print(f"\n>>> 提交任务: {job['name']} ({job['width']}x{job['height']})")
        try:
            task_id = submit_klein(host, args.key, job["prompt"], job["width"], job["height"])
            print(f"    taskId = {task_id}，等待出图...")
            out_url = poll_task(host, args.key, task_id)
            dst = os.path.join(RAW_DIR, job["name"])
            nbytes = download_file(out_url, dst)
            print(f"    [完成] 已保存 {dst} ({nbytes:,} bytes)")
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="ignore")
            print(f"    [HTTP {e.code}] {body[:400]}")
        except Exception as e:
            print(f"    [失败] {e}")


if __name__ == "__main__":
    main()
