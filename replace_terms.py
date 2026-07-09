import os
import glob
import re

old_file = 'src/components/Atelier.tsx'
new_file = 'src/components/Studio.tsx'
if os.path.exists(old_file):
    os.rename(old_file, new_file)
    print(f"Renamed {old_file} to {new_file}")

replacements = [
    (r'\bAtelier\b', 'Studio'),
    (r'\batelier\b', 'studio'),
    (r'\bcustom-fit\b', 'Custom'),
    (r'\bcustom-fit\b', 'custom')
]

count = 0
for filepath in glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for pattern, repl in replacements:
        new_content = re.sub(pattern, repl, new_content)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
        count += 1

print(f"Total files updated: {count}")
