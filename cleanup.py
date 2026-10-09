import os
import re

def clean_mangled_classes(directory):
    # This will match stray things left by the bad regex.
    # 1. Match colons followed by class names, like ` :border-[#06B6D4]` or ` :text-gray-200`
    pattern_colon = re.compile(r' :[a-zA-Z0-9_\-\[\]#/%:]+')
    # 2. Match stray `]` that are alone or in groups like `] ]`
    pattern_bracket = re.compile(r'\](?=\s|")')

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jsx', '.js', '.css', '.html')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Remove stray colon classes
                new_content = pattern_colon.sub('', content)
                
                # We only want to remove `]` if it's clearly a stray one from the dark mode removal.
                # A stray `]` usually appears after a space or another `]`. Let's just remove ` ]` and `]` that have no matching `[`.
                # Actually, an easier way is to just look for ` ]` or `] ` inside classNames.
                # Let's just do a simpler replace for the exact artifacts we know.
                
                # Replace ` ]` with ` `
                new_content = new_content.replace(' ]', '')
                new_content = new_content.replace('] ', ' ')
                
                # Cleanup extra spaces left behind
                new_content = re.sub(r' {2,}', ' ', new_content)
                new_content = new_content.replace('className=" ', 'className="')
                new_content = new_content.replace('  ', ' ')
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Cleaned {filepath}")

if __name__ == '__main__':
    clean_mangled_classes('c:\\Users\\a2024\\Desktop\\PROJECTS\\SKILLSPHERE\\src')
