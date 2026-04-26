#!/usr/bin/env python3
"""
scrape.py — Refresh McBroken data files
Run this to regenerate state_data.js and locations_data.js
"""

import json, csv, requests

print("Fetching markers.json...")
markers = requests.get("https://data.mcbroken.com/markers.json", timeout=15).json()
features = markers["features"]

print(f"  {len(features)} total locations")

# Parse locations (US only, active only)
locations = []
for f in features:
    props = f["properties"]
    coords = f["geometry"]["coordinates"]
    if props.get("country") == "USA" and props.get("is_active"):
        locations.append({
            "lon": coords[0],
            "lat": coords[1],
            "is_broken": props.get("is_broken", False),
            "state": props.get("state", ""),
            "city": props.get("city", ""),
            "street": props.get("street", ""),
        })

# Aggregate by state
states = {}
for loc in locations:
    s = loc["state"]
    if not s:
        continue
    if s not in states:
        states[s] = {"total": 0, "broken": 0}
    states[s]["total"] += 1
    if loc["is_broken"]:
        states[s]["broken"] += 1

for s, d in states.items():
    d["rate"] = round(d["broken"] / d["total"] * 100, 1) if d["total"] else 0

# Write JS files
with open("state_data.js", "w") as f:
    f.write("const STATE_DATA = " + json.dumps(states) + ";")
print(f"  state_data.js written ({len(states)} states)")

with open("locations_data.js", "w") as f:
    f.write("const LOCATIONS = " + json.dumps(locations) + ";")
print(f"  locations_data.js written ({len(locations)} locations)")

# Also write CSV for reference
with open("mcbroken_live.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["lon","lat","is_broken","state","city","street"])
    w.writeheader()
    w.writerows(locations)
print("  mcbroken_live.csv written")

print("\nDone! Commit and push to update the site.")
