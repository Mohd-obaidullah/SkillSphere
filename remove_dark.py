import os
import re

def remove_dark_classes(directory):
    pattern = re.compile(r'\bdark:[a-zA-Z0-9_\-\[\]#/%]+\b')
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jsx', '.js', '.css', '.html')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace dark classes with empty string
                new_content = pattern.sub('', content)
                
                # Cleanup extra spaces left behind
                new_content = re.sub(r' {2,}', ' ', new_content)
                new_content = new_content.replace('className=" ', 'className="')
                new_content = new_content.replace('  ', ' ')
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")

if __name__ == '__main__':
    remove_dark_classes('c:\\Users\\a2024\\Desktop\\PROJECTS\\SKILLSPHERE\\src')
    remove_dark_classes('c:\\Users\\a2024\\Desktop\\PROJECTS\\SKILLSPHERE\\index.html')
