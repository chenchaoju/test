import os
import re
from openpyxl import load_workbook
from openpyxl.styles import PatternFill
from datetime import datetime
from tqdm import tqdm

from openpyxl.styles import Font, PatternFill


def the_first_process(ws, col=4):
    """处理第四列内容，根据"-"数量插入n行并标红，后缀从上往下升序"""
    # 设置红色格式
    red_font = Font(color="FF0000", bold=True)
    red_fill = PatternFill(start_color="FFC7CE", end_color="FFC7CE", fill_type="solid")

    row_idx = 1
    while row_idx <= ws.max_row:
        cell = ws.cell(row=row_idx, column=col)

        if not cell.value or not isinstance(cell.value, str):
            row_idx += 1
            continue

        if process_special_code(cell.value):
            row_idx += 1
            continue

        dash_count = cell.value.count('-')

        if dash_count > 1:  # 2个"-"以上就处理
            # 获取原始第11列的值
            original_col11_value = ws.cell(row=row_idx, column=11).value
            try:
                divided_value = float(original_col11_value) / dash_count if original_col11_value else 0
            except (ValueError, TypeError):
                divided_value = 0

            # 先插入所有需要的行（保持原始行在顶部）
            for i in range(dash_count):
                ws.insert_rows(row_idx + 1)

                # 设置红色格式
                for col_idx in range(1, ws.max_column + 1):
                    new_cell = ws.cell(row=row_idx + 1, column=col_idx)
                    new_cell.font = red_font
                    new_cell.fill = red_fill

            # 从下往上填充内容（确保升序编号）
            for i in range(dash_count, 0, -1):
                # 复制内容（除需要修改的列外）
                for col_idx in range(1, ws.max_column + 1):
                    if col_idx not in [2, col, 11]:  # 不复制第二列、当前处理列和第11列
                        ws.cell(row=row_idx + i, column=col_idx).value = ws.cell(row=row_idx, column=col_idx).value

                # 修改第四列内容（分割字符串）
                parts = cell.value.split('-')
                if len(parts) > i:
                    ws.cell(row=row_idx + i, column=col).value = f"{parts[0]}-{parts[i]}"

                # 修改第二列添加升序后缀
                original_col2 = ws.cell(row=row_idx, column=2).value
                ws.cell(row=row_idx + i, column=2).value = f"{original_col2}-{i}"

                # 设置第11列的值（原值除以dash_count）
                ws.cell(row=row_idx + i, column=11).value = divided_value

            row_idx += dash_count + 1  # 跳过新增的行
        else:
            row_idx += 1
    # # 处理第二列重复编号
    # handle_duplicate_ids(ws, col=2)
    #
    # # 根据第二列后缀处理第四列内容
    # process_split_data(ws)


def handle_duplicate_ids(ws, col=2):
    """处理第二列重复编号，添加后缀"""
    id_dict = {}
    for row in ws.iter_rows(min_row=1, max_row=ws.max_row):
        cell = row[col - 1]
        if cell.value:
            # 先移除可能已存在的后缀
            base_value = cell.value.split('-')[0] if '-' in str(cell.value) else cell.value
            if base_value in id_dict:
                id_dict[base_value] += 1
                # 保留原始后缀（如果有）并添加新后缀
                if '-' in str(cell.value):
                    original_suffix = str(cell.value).split('-')[1]
                    cell.value = f"{base_value}-{original_suffix}-{id_dict[base_value]}"
                else:
                    cell.value = f"{cell.value}-{id_dict[base_value]}"
            else:
                id_dict[base_value] = 0


def process_split_data(ws):
    """根据第二列后缀处理第四列内容"""
    for row in ws.iter_rows(min_row=1, max_row=ws.max_row):
        col2_cell = row[1]  # 第二列
        col4_cell = row[3]  # 第四列

        if not all([col2_cell.value, col4_cell.value]) or not isinstance(col4_cell.value, str):
            continue

        # 检查第二列是否有数字后缀
        if '-' in str(col2_cell.value):
            parts = str(col2_cell.value).split('-')
            if len(parts) > 1 and parts[-1].isdigit():
                suffix_num = int(parts[-1]) - 1  # 转为0-based索引
                col4_parts = col4_cell.value.split('-')
                if len(col4_parts) > suffix_num + 1:  # +1因为第一个是首字段
                    # 保留首字段+指定部分
                    new_value = f"{col4_parts[0]}-{col4_parts[suffix_num + 1]}"
                    # 处理可能存在的后续内容
                    next_dash = col4_cell.value.find('-', col4_cell.value.find('-') + 1)
                    if next_dash != -1 and suffix_num == 0:
                        new_value = col4_cell.value[:next_dash]
                    col4_cell.value = new_value


def process_special_code(cell_value):
    """检查单元格是否包含特殊代码(-G或-OP)"""
    if not isinstance(cell_value, str):
        return False
    # 使用正则表达式匹配-G或-OP（不区分大小写）
    return bool(re.search(r'-(G|OP|DIE|PPS)(?=\b|$)', cell_value, flags=re.IGNORECASE))


def standardize_date_column(ws, col=10, target_year=2025):
    """将指定列日期统一转为YYYY.MM.DD格式（默认2025.01.01）"""
    for row in ws.iter_rows(min_row=1, max_row=ws.max_row):
        cell = row[col - 1]  # 转换为0-based索引

        # 跳过空值和非日期单元格
        if not cell.value:
            continue

        try:
            # 情况1：Excel数字日期（如44805表示2022-08-15）
            if isinstance(cell.value, (int, float)):
                dt = datetime.fromordinal(
                    datetime(1900, 1, 1).toordinal() + int(cell.value) - 2
                )

            # 情况2：Python datetime对象
            elif isinstance(cell.value, datetime):
                dt = cell.value

            # 情况3：字符串日期
            elif isinstance(cell.value, str):
                # 移除可能存在的空格和特殊字符
                clean_str = re.sub(r"[^\d./-]", "", cell.value.strip())
                # 尝试解析多种日期格式
                for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d", "%m/%d/%Y", "%d/%m/%Y"):
                    try:
                        dt = datetime.strptime(clean_str, fmt)
                        break
                    except ValueError:
                        continue
                else:
                    continue  # 无法解析则跳过

            # 统一格式化为2025.01.01样式
            cell.value = f"{target_year}.{dt.month:02d}.{dt.day:02d}"

        except Exception:
            continue  # 遇到任何错误保持原值

def process_content_column(ws, col=4):
    """处理内容列的特殊符号和CF标记"""
    yellow_fill = PatternFill(start_color="FFFF00", end_color="FFFF00", fill_type="solid")
    for row in ws.iter_rows(min_row=1, max_row=ws.max_row):
        cell = row[col - 1]
        if not cell.value or not isinstance(cell.value, str):
            continue

        # 如果包含特殊代码则跳过处理
        if process_special_code(cell.value):
            continue

        for char in ['、', '，', ',', '；', ';']:
            cell.value = cell.value.replace(char, '-')

        if "CF" in cell.value.upper():
            cell.fill = yellow_fill

        # 删除结尾的"-"
        cell.value = cell.value.rstrip('-')


def process_single_file(input_path, output_path):
    """处理单个Excel文件"""
    try:
        wb = load_workbook(input_path)

        for sheet in wb.sheetnames:
            ws = wb[sheet]



            # 第二步：标准化日期列
            standardize_date_column(ws)

            # 第三步：处理内容列
            process_content_column(ws)

            # 第一步：处理特殊代码和插入行
            the_first_process(ws)

        wb.save(output_path)
        return True, None
    except Exception as e:
        return False, str(e)


def batch_process_excel_files(input_folder, output_folder=None):
    """批量处理Excel文件"""
    if output_folder is None:
        output_folder = os.path.join(input_folder, "processed")

    os.makedirs(output_folder, exist_ok=True)

    # 获取所有Excel文件
    excel_files = [f for f in os.listdir(input_folder) if f.lower().endswith(('.xlsx', '.xls'))]

    if not excel_files:
        print("没有找到Excel文件")
        return

    processed_count = 0
    error_files = []

    # 使用进度条
    for filename in tqdm(excel_files, desc="处理进度"):
        input_path = os.path.join(input_folder, filename)
        output_path = os.path.join(output_folder, filename)

        success, error_msg = process_single_file(input_path, output_path)

        if success:
            processed_count += 1
            print(f"\n✓ 处理成功: {filename}")
        else:
            error_files.append((filename, error_msg))
            print(f"\n✗ 处理失败: {filename} - {error_msg}")

    print(f"\n处理完成: 成功 {processed_count} 个, 失败 {len(error_files)} 个")

    if error_files:
        print("\n失败文件列表:")
        for filename, error in error_files:
            print(f"- {filename}: {error}")


if __name__ == "__main__":
    input_folder = r"C:\Users\Administrator\Desktop\文件处理"  # 修改为您的输入文件夹路径

    if not os.path.isdir(input_folder):
        print(f"错误: 输入文件夹不存在 {input_folder}")
    else:
        batch_process_excel_files(input_folder)