import os

# Thư mục gốc
root_dir = r"C:\Users\ASUS\OneDrive\Desktop\vr360-newUI"  # Đường dẫn

# Danh sách folder cần loại trừ
exclude_dirs = {".git", ".netlify", "node_modules"}

# File xuất
output_file = "structure.txt"

def tree(dir_path, prefix=""):
    lines = []
    try:
        entries = sorted(os.listdir(dir_path))
    except PermissionError:
        return []

    for i, entry in enumerate(entries):
        full_path = os.path.join(dir_path, entry)
        connector = "└── " if i == len(entries) - 1 else "├── "

        # Loại bỏ thư mục bắt đầu bằng . hoặc @ và các thư mục trong exclude_dirs
        if os.path.isdir(full_path):
            if entry in exclude_dirs or entry.startswith(('.', '@')):
                continue
            lines.append(f"{prefix}{connector}{entry}/")
            lines.extend(tree(full_path, prefix + ("    " if i == len(entries) - 1 else "│   ")))
        else:
            lines.append(f"{prefix}{connector}{entry}")
    return lines

with open(output_file, "w", encoding="utf-8") as f:
    for line in tree(root_dir):
        f.write(line + "\n")

print(f"Cây thư mục đã được lưu vào {output_file}")
