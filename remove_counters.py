import os
import re

src_dir = r"c:\zzz\DoanHK1\CourierXpress_Group06_2ndStatusReport\eProject_Sem-1_T52311.M0_CourierXpress_Group06_FinalSubmit\SoucreCode\Project_CourierXpress\front_end\front_end\src"

pattern = re.compile(r'\s*<span style=\{\{\s*position:\s*"absolute",\s*right:\s*"12px",\s*top:\s*"38px",\s*fontSize:\s*"10px"[^}]*\}\}>[^<]*</span>')

modified_files = 0
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content, count = pattern.subn('', content)
            
            if count > 0:
                print(f"Removed {count} counters from {filepath}")
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                modified_files += 1

print(f"Total files modified: {modified_files}")
