import requests
from lxml import etree
import pandas as pd
from datetime import datetime, timedelta
import time
import os


def get_last_year_same_month(current_date_str):
    """
    获取去年同月的日期字符串

    参数:
        current_date_str: 当前日期字符串，格式'YYYYMM'
    返回:
        去年同月的日期字符串，格式'YYYYMM'
    """
    current_date = datetime.strptime(current_date_str, "%Y%m")
    last_year_date = current_date - timedelta(days=365)  # 近似减一年
    # 调整确保是同月
    last_year_date = datetime(last_year_date.year, current_date.month, 1)
    return last_year_date.strftime("%Y%m")


def scrape_weather_data(city, current_month):
    """
    爬取指定城市从去年同月到当前月的历史天气数据

    参数:
        city: 城市拼音(如'guangzhou')
        current_month: 当前月份，格式'YYYYMM'
    """
    end_date = current_month
    start_date = get_last_year_same_month(current_month)

    base_url = f"https://lishi.tianqi.com/{city}/"

    # 创建保存数据的文件夹
    if not os.path.exists('weather_data'):
        os.makedirs('weather_data')

    # 将日期字符串转换为datetime对象以便迭代
    start = datetime.strptime(start_date, "%Y%m")
    end = datetime.strptime(end_date, "%Y%m")

    all_data = []

    current = start
    while current <= end:
        year_month = current.strftime("%Y%m")
        url = base_url + year_month + ".html"
        print(f"正在爬取 {city} {current.year}年{current.month}月 的数据...")
        print("URL:", url)

        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers)
            response.encoding = 'utf-8'
            print(response.text)
            if response.status_code == 200:
                html = etree.HTML(response.text)

                # 使用XPath获取数据
                dates = html.xpath('/html/body/div[7]/div[1]/div[4]/ul/li/div[1]/text()')
                dates2=html.xpath('//div[@class="lishidesc2"]/ul/li/div[1]/text()')
                max_temps = html.xpath('/html/body/div[7]/div[1]/div[4]/ul/li/div[2]/text()')
                min_temps = html.xpath('/html/body/div[7]/div[1]/div[4]/ul/li/div[3]/text()')
                weathers = html.xpath('/html/body/div[7]/div[1]/div[4]/ul/li/div[4]/text()')
                winds = html.xpath('/html/body/div[7]/div[1]/div[4]/ul/li/div[5]/text()')
                wind_forces = html.xpath('/html/body/div[7]/div[1]/div[4]/ul/li/div[6]/text()')
                print(dates2)
                # 确保所有字段长度一致
                min_length = min(len(dates), len(max_temps), len(min_temps),
                                 len(weathers), len(winds), len(wind_forces))

                if min_length == 0:
                    print(f"{year_month} 无数据")
                    current = add_months(current, 1)
                    continue

                # 构建数据列表
                rows = []
                for i in range(min_length):
                    row = {
                        '日期': dates[i].strip() if i < len(dates) else '',
                        '最高气温': max_temps[i].strip() if i < len(max_temps) else '',
                        '最低气温': min_temps[i].strip() if i < len(min_temps) else '',
                        '天气': weathers[i].strip() if i < len(weathers) else '',
                        '风向': winds[i].strip() if i < len(winds) else '',
                        '风力': wind_forces[i].strip() if i < len(wind_forces) else ''
                    }
                    rows.append(row)

                # 创建DataFrame并保存
                if rows:
                    df = pd.DataFrame(rows)
                    df['城市'] = city
                    all_data.append(df)

                    # 保存每月数据到单独文件
                    filename = f"weather_data/{city}_{year_month}.csv"
                    df.to_csv(filename, index=False, encoding='utf-8-sig')
                    print(f"成功保存 {filename}")
                else:
                    print(f"{year_month} 无数据")

            else:
                print(f"请求失败，状态码: {response.status_code}")

            # 增加爬取间隔到5秒
            time.sleep(5)

        except Exception as e:
            print(f"爬取 {year_month} 时出错: {str(e)}")

        # 移动到下个月
        current = add_months(current, 1)

    # 合并所有数据并保存
    if all_data:
        combined_df = pd.concat(all_data, ignore_index=True)
        combined_filename = f"weather_data/{city}_{start_date}_{end_date}_combined.csv"
        combined_df.to_csv(combined_filename, index=False, encoding='utf-8-sig')
        print(f"所有数据已合并保存到 {combined_filename}")
    else:
        print("没有爬取到任何数据")


def add_months(sourcedate, months):
    """
    给日期增加指定月数

    参数:
        sourcedate: 原始日期
        months: 要增加的月数
    """
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day,
              [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31,
               30, 31][month - 1])
    return datetime(year, month, day)


if __name__ == "__main__":
    # 设置要爬取的城市和当前月份
    city = "guangzhou"  # 广州
    current_month = datetime.now().strftime("%Y%m")  # 获取当前年月

    scrape_weather_data(city, current_month)