#!/usr/bin/env python3
"""Meetly — Live Supabase Verification Gate

Runs a best-effort automated verification against a deployed Meetly site.

It validates:
- Public read spine (profile/events/availability)
- /api/bookings availability endpoint shape + no PII keys
- /api/bookings/create booking creation happy path
- Common invalid input rejections
- Overlap and concurrency behavior (expects exactly one success for same-slot flood)

USAGE:
  python3 scripts/live_verification_gate.py \
    --base-url https://your-deployment.vercel.app \
    --host-slug abdelhak \
    --event-slug intro-call

NOTES:
- Requires Supabase env vars set in Vercel and migrations applied.
- This script does NOT need Supabase keys; it hits your public Next.js APIs.
- Timezone handling is inherently tricky; this script selects the next slot based on
  availability_rules and uses UTC when generating ISO times. If your server compares
  times in a different timezone, you may need to override the chosen slot.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import threading

FORBIDDEN_PII_KEYS = {
    "guest_name",
    "guest_email",
    "guest_timezone",
    "notes",
    "guest_notes",
    "cancel_token",
    "reschedule_token",
    "created_at",
    "answers",
    "booking_answers",
}


@dataclass
class CheckResult:
    name: str
    ok: bool
    details: str = ""


def http_json(method: str, url: str, body: Optional[dict] = None, timeout: int = 25) -> Tuple[int, Dict[str, str], Any]:
    data = None
    headers = {
        "Accept": "application/json",
    }
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = Request(url, method=method.upper(), data=data, headers=headers)

    try:
        with urlopen(req, timeout=timeout) as resp:
            status = getattr(resp, "status", 200)
            raw = resp.read().decode("utf-8")
            ctype = resp.headers.get("content-type", "")
            parsed: Any
            if "application/json" in ctype:
                parsed = json.loads(raw) if raw else {}
            else:
                parsed = raw
            return status, dict(resp.headers), parsed
    except HTTPError as e:
        raw = e.read().decode("utf-8") if hasattr(e, "read") else ""
        try:
            parsed = json.loads(raw) if raw else {}
        except Exception:
            parsed = raw
        return e.code, dict(e.headers), parsed
    except URLError as e:
        raise RuntimeError(f"Network error calling {url}: {e}")


def find_any_forbidden_keys(obj: Any) -> List[str]:
    found: List[str] = []

    def walk(x: Any):
        if isinstance(x, dict):
            for k, v in x.items():
                if k in FORBIDDEN_PII_KEYS:
                    found.append(k)
                walk(v)
        elif isinstance(x, list):
            for it in x:
                walk(it)

    walk(obj)
    return sorted(set(found))


def parse_time_hhmmss(s: str) -> Tuple[int, int, int]:
    # e.g. "09:00:00"
    parts = s.split(":")
    if len(parts) < 2:
        raise ValueError(f"Invalid time string: {s}")
    hh = int(parts[0])
    mm = int(parts[1])
    ss = int(parts[2]) if len(parts) >= 3 else 0
    return hh, mm, ss


def next_date_for_day_of_week(target_dow: int, from_dt: datetime) -> datetime:
    # Python weekday: Monday=0..Sunday=6
    # Our API/DB likely uses JS getDay(): Sunday=0..Saturday=6
    # Convert JS DOW to Python DOW:
    js_to_py = {0: 6, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5}
    py_target = js_to_py.get(target_dow)
    if py_target is None:
        raise ValueError(f"Invalid day_of_week: {target_dow}")

    d = from_dt
    for _ in range(14):
        if d.weekday() == py_target:
            return d
        d = d + timedelta(days=1)
    return from_dt


def choose_slot(rules: List[dict], duration_minutes: int, min_hours_ahead: int = 2) -> Tuple[str, str, str]:
    """Pick the next slot based on first enabled rule.

    Returns: (iso_start, iso_end, note)
    """
    enabled = [r for r in rules if r.get("is_enabled") is True]
    if not enabled:
        raise RuntimeError("No enabled availability rules returned")

    # Prefer earliest start_time
    enabled.sort(key=lambda r: r.get("start_time") or "")
    rule = enabled[0]

    day_of_week = int(rule["day_of_week"])
    start_time = rule["start_time"]

    now = datetime.now(timezone.utc)
    base = now + timedelta(hours=min_hours_ahead)
    day = next_date_for_day_of_week(day_of_week, base)

    hh, mm, ss = parse_time_hhmmss(start_time)
    slot_start = datetime(day.year, day.month, day.day, hh, mm, ss, tzinfo=timezone.utc)

    # Ensure it's in the future (if start_time already passed today in UTC, use next week occurrence)
    if slot_start <= now + timedelta(hours=min_hours_ahead):
        day = day + timedelta(days=7)
        slot_start = datetime(day.year, day.month, day.day, hh, mm, ss, tzinfo=timezone.utc)

    slot_end = slot_start + timedelta(minutes=duration_minutes)
    return slot_start.isoformat().replace("+00:00", "Z"), slot_end.isoformat().replace("+00:00", "Z"), f"rule day_of_week={day_of_week} start_time={start_time}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", required=True)
    ap.add_argument("--host-slug", required=True)
    ap.add_argument("--event-slug", required=False)
    ap.add_argument("--print-raw", action="store_true")
    args = ap.parse_args()

    base_url = args.base_url.rstrip("/")
    host_slug = args.host_slug
    event_slug = args.event_slug

    results: List[CheckResult] = []

    # 1) Public spine
    st, _, prof = http_json("GET", f"{base_url}/api/host/{host_slug}")
    ok = st == 200 and isinstance(prof, dict) and "profile" in prof and isinstance(prof.get("profile"), dict)
    host_id = prof.get("profile", {}).get("id") if ok else None
    results.append(CheckResult("public profile resolves", ok, f"status={st}"))

    st, _, ev = http_json("GET", f"{base_url}/api/host/{host_slug}/events")
    ok_ev = st == 200 and isinstance(ev, dict) and isinstance(ev.get("eventTypes"), list)
    results.append(CheckResult("public event types resolve", ok_ev, f"status={st}"))

    st, _, rules = http_json("GET", f"{base_url}/api/host/{host_slug}/availability")
    ok_rules = st == 200 and isinstance(rules, dict) and isinstance(rules.get("rules"), list)
    results.append(CheckResult("public availability rules resolve", ok_rules, f"status={st}"))

    if not (host_id and ok_ev and ok_rules):
        print("\n".join([f"[{ 'OK' if r.ok else 'FAIL'}] {r.name} {r.details}" for r in results]))
        print("\nBLOCKED: public spine not fully resolving; cannot proceed with booking creation checks.")
        if args.print_raw:
            print("\nRAW profile:", json.dumps(prof, indent=2) if isinstance(prof, dict) else str(prof))
            print("\nRAW events:", json.dumps(ev, indent=2) if isinstance(ev, dict) else str(ev))
            print("\nRAW rules:", json.dumps(rules, indent=2) if isinstance(rules, dict) else str(rules))
        return 2

    # Choose event
    event_types: List[dict] = ev["eventTypes"]
    chosen = None
    if event_slug:
        for e in event_types:
            if e.get("slug") == event_slug:
                chosen = e
                break
    if not chosen and event_types:
        chosen = event_types[0]

    if not chosen:
        results.append(CheckResult("choose event type", False, "No event types returned"))
        print("\n".join([f"[{ 'OK' if r.ok else 'FAIL'}] {r.name} {r.details}" for r in results]))
        return 2

    event_type_id = chosen.get("id")
    duration = int(chosen.get("duration_minutes") or 30)

    # Choose a slot from availability rules
    iso_start, iso_end, slot_note = choose_slot(rules["rules"], duration)

    # 2) /api/bookings availability endpoint (no PII)
    frm = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat().replace("+00:00", "Z")
    to = (datetime.now(timezone.utc) + timedelta(days=60)).isoformat().replace("+00:00", "Z")
    q = urlencode({"hostId": host_id, "from": frm, "to": to})
    st, _, b = http_json("GET", f"{base_url}/api/bookings?{q}")
    ok = st == 200 and isinstance(b, dict) and isinstance(b.get("bookings"), list)
    results.append(CheckResult("/api/bookings returns {bookings:[...]}", ok, f"status={st}"))
    forbidden = find_any_forbidden_keys(b)
    results.append(CheckResult("/api/bookings contains no forbidden PII keys", len(forbidden) == 0, f"found={forbidden}"))

    # 3) Booking creation — happy path
    payload = {
        "host_id": host_id,
        "event_type_id": event_type_id,
        "guest_name": "Test Guest",
        "guest_email": f"test+{int(time.time())}@example.com",
        "guest_notes": "automated verification",
        "start_time": iso_start,
        "end_time": iso_end,
    }

    st, _, created = http_json("POST", f"{base_url}/api/bookings/create", payload)
    ok = st in (200, 201) and isinstance(created, dict) and created.get("success") is True
    results.append(CheckResult("booking creation succeeds (happy path)", ok, f"status={st} slot={iso_start} ({slot_note})"))

    # Invalid inputs
    bad1 = dict(payload)
    bad1["guest_name"] = ""
    st, _, r1 = http_json("POST", f"{base_url}/api/bookings/create", bad1)
    results.append(CheckResult("invalid: empty name rejected", st == 400, f"status={st} error={getattr(r1, 'get', lambda _:'')( 'error') if isinstance(r1, dict) else ''}"))

    bad2 = dict(payload)
    bad2["guest_email"] = "not-an-email"
    st, _, r2 = http_json("POST", f"{base_url}/api/bookings/create", bad2)
    results.append(CheckResult("invalid: bad email rejected", st == 400, f"status={st}"))

    # Past slot
    past_start = (datetime.now(timezone.utc) - timedelta(hours=3)).replace(minute=0, second=0, microsecond=0)
    past_end = past_start + timedelta(minutes=duration)
    bad3 = dict(payload)
    bad3["start_time"] = past_start.isoformat().replace("+00:00", "Z")
    bad3["end_time"] = past_end.isoformat().replace("+00:00", "Z")
    st, _, r3 = http_json("POST", f"{base_url}/api/bookings/create", bad3)
    results.append(CheckResult("invalid: past slot rejected", st == 400, f"status={st} error={(r3.get('error') if isinstance(r3, dict) else '')}"))

    # Overlap — try same slot again (expects SLOT_TAKEN/409 once first exists)
    st, _, ov = http_json("POST", f"{base_url}/api/bookings/create", payload)
    results.append(CheckResult("overlapping booking rejected", st == 409, f"status={st} error={(ov.get('error') if isinstance(ov, dict) else '')}"))

    # Concurrency test: 5 parallel requests on same slot
    conc_payload = dict(payload)
    conc_payload["guest_email"] = f"test+conc-{int(time.time())}@example.com"

    statuses: List[int] = []
    errors: List[str] = []
    lock = threading.Lock()

    def worker(i: int):
        p = dict(conc_payload)
        p["guest_email"] = f"test+conc-{int(time.time())}-{i}@example.com"
        st_i, _, body_i = http_json("POST", f"{base_url}/api/bookings/create", p)
        with lock:
            statuses.append(st_i)
            if isinstance(body_i, dict) and body_i.get("error"):
                errors.append(str(body_i.get("error")))

    threads = [threading.Thread(target=worker, args=(i,)) for i in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    success_count = sum(1 for s in statuses if s in (200, 201))
    taken_count = sum(1 for s in statuses if s == 409)
    results.append(CheckResult(
        "concurrent same-slot requests → exactly one success",
        success_count == 1,
        f"statuses={statuses} success={success_count} conflict={taken_count} errors={errors}",
    ))

    # Print report
    print("\n".join([f"[{ 'OK' if r.ok else 'FAIL'}] {r.name} — {r.details}" for r in results]))

    failed = [r for r in results if not r.ok]
    if failed and args.print_raw:
        print("\nRAW /api/bookings response:")
        print(json.dumps(b, indent=2) if isinstance(b, dict) else str(b))

    return 0 if not failed else 1


if __name__ == "__main__":
    raise SystemExit(main())
