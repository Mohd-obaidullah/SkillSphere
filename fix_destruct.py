import os
import re

def fix_destructuring(directory):
    # Match: const [stateName,] setStateName = useState
    # OR let [stateName,] setStateName] =
    # Basically: \[([a-zA-Z0-9_]+),\] ([a-zA-Z0-9_]+)\]?
    # Replace with: [\1, \2]
    
    # We will just look for `[word,] word2` and replace with `[word, word2]`
    # And if there's a trailing `]`, remove it later.
    
    pattern1 = re.compile(r'\[([a-zA-Z0-9_]+),\] ([a-zA-Z0-9_]+)(?:\]?)')
    
    # StudyNotes.jsx line 69: const [resData,] qData = await Promise.all([
    # Should be: const [resData, qData] = await Promise.all([
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jsx', '.js', '.css', '.html')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = pattern1.sub(r'[\1, \2]', content)
                
                # Also fix the weird cases like `}, [u.skills,] state]);` -> `}, [u.skills, state]);`
                new_content = new_content.replace(',] ', ', ')
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed destructuring in {filepath}")

if __name__ == '__main__':
    fix_destructuring('c:\\Users\\a2024\\Desktop\\PROJECTS\\SKILLSPHERE\\src')
