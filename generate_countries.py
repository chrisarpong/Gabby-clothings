import urllib.request
import json
import os

url = "https://gist.githubusercontent.com/anubhavshrimal/75f6183458db8c453306f93521e93d37/raw/f77e7598a8503f1f70528ae1cbf9f66755698a16/CountryCodes.json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())

def get_flag(code):
    return chr(ord(code[0]) + 127397) + chr(ord(code[1]) + 127397)

countries = []
for c in data:
    if 'dial_code' in c and 'name' in c and 'code' in c:
        countries.append({'name': c['name'], 'dial_code': c['dial_code'], 'flag': get_flag(c['code'])})

priorities = ["Ghana", "United States", "United Kingdom", "Nigeria", "South Africa"]

ts_content = "export const countryCodes = [\n"
for p in priorities:
    match = next((c for c in countries if c['name'] == p), None)
    if match:
        ts_content += f"  {{ name: \"{match['name']}\", dial_code: \"{match['dial_code']}\", flag: \"{match['flag']}\" }},\n"

ts_content += "  // Others\n"

for c in countries:
    if c['name'] not in priorities:
        name = c['name'].replace('"', '\\"')
        ts_content += f"  {{ name: \"{name}\", dial_code: \"{c['dial_code']}\", flag: \"{c['flag']}\" }},\n"

ts_content += "];\n"

os.makedirs('src/utils', exist_ok=True)
with open('src/utils/countries.ts', 'w') as f:
    f.write(ts_content)

print("Generated src/utils/countries.ts")
