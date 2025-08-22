import os
import re


def format_number_part(filename):
    """
    处理文件名中的数字部分：
    - 少于4位：补0至4位
    - 4到8位：补0至8位
    - 超过8位：截断至8位
    """
    # 使用正则表达式提取数字部分
    match = re.search(r'\d+', filename)
    if match:
        numbers = match.group()
        length = len(numbers)

        if length < 4:
            # 少于4位，补0至4位
            formatted_numbers = numbers.zfill(4)
        elif 4 <= length <= 8:
            # 4到8位，补0至8位
            formatted_numbers = numbers.zfill(8)
        else:
            # 超过8位，截断至8位
            formatted_numbers = numbers[:8]

        # 替换原始数字部分
        filename = filename.replace(numbers, formatted_numbers, 1)

    return filename


# 指定文件夹路径
folder = r'C:\Users\Administrator\Desktop\cnc文件'

# 遍历文件夹中的所有文件
for filename in os.listdir(folder):
    # 构造文件的完整路径
    old_path = os.path.join(folder, filename)

    # 确保只处理文件，跳过子目录
    if os.path.isfile(old_path):
        # 移除文件名中的所有"-"
        new_filename = filename.replace('-', '')

        # 确保处理后的文件名不为空
        if new_filename:
            # 首字母改为大写O，并拼接剩余部分
            new_filename = 'O' + new_filename[1:]

            # 处理数字部分
            new_filename = format_number_part(new_filename)

            # 构造新路径
            new_path = os.path.join(folder, new_filename)

            # 重命名文件
            os.rename(old_path, new_path)
            print(f'Renamed: {filename} -> {new_filename}')
        else:
            print(f'Skipped empty filename: {filename}')