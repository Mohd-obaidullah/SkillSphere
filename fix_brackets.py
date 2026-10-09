import os
import re

def fix_broken_brackets(directory):
    # This will match a word with `[`, some content without `]` or space, and then a space or end of quote
    # Like `w-[270px bg` or `from-[#C85A32 to`
    # We want to insert `]` before the space.
    
    # regex: (\[[^\]\s"'`]+)(\s|["'`])
    # replace: \1]\2
    pattern = re.compile(r'(\[[^\]\s"\'`]+)(\s|["\'`])')

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jsx', '.js', '.css', '.html')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Keep replacing until no more matches (in case there are multiple)
                new_content = content
                prev_content = None
                while new_content != prev_content:
                    prev_content = new_content
                    new_content = pattern.sub(r'\1]\2', new_content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed brackets in {filepath}")

if __name__ == '__main__':
    fix_broken_brackets('c:\\Users\\a2024\\Desktop\\PROJECTS\\SKILLSPHERE\\src')
