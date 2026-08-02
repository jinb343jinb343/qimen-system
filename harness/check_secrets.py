import os
import sys
import re

def check_secrets(workspace_dir):
    secret_pattern = re.compile(r'SECRET_KEY\s*=\s*["\']jinb343["\']')
    found_secrets = False
    
    for root, _, files in os.walk(workspace_dir):
        if '.git' in root or 'node_modules' in root:
            continue
            
        for file in files:
            if file.endswith('.html') or file.endswith('.js'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    if secret_pattern.search(content):
                        print(f"❌ 严重安全漏洞: 在文件 {file_path} 中发现明文硬编码的 SECRET_KEY")
                        found_secrets = True
                except Exception as e:
                    pass
                    
    if found_secrets:
        print("审计拦截: 拒绝提交包含敏感门禁代码的变更。")
        sys.exit(1)
    
if __name__ == "__main__":
    check_secrets(os.getcwd())
