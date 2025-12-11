from influxdb import InfluxDBClient
import pytz
from datetime import datetime
import time
from pymysql import *

# 报警表: t_inf_device_alarm_67736364346253312  状态表t_inf_device_status_change_67736364346253312  计数表t_inf_normal_workpiece_67736364346253312
table_name = "t_inf_device_alarm_67736364346253312"
client = InfluxDBClient(host='10.10.1.211', port=18086, username='yuzhen', password='yuzhen123', database='machinestatus')
query = f' SELECT * FROM "machinestatus"."180d".{table_name}  where  time >now() -24h   order by time asc limit 10  tz(\'Asia/Shanghai\') ' # 可执行

result = client.query(query)
print(result)
# 关闭连接（可选）
# client.close()
for point in result.get_points():
    print(point["time"],point["box_id"],point)

#  hyt_inf_device_alarm (time,alarm_content,alarm_data) hyt_inf_device_status_change  hyt_inf_normal_workpiece
# 创建Connection连接--mysql
conn = connect(host='10.10.1.211', port=3306, database='tpm', user='root', password='yuzhen123', charset='utf8')
# 获得Cursor对象
cs1 = conn.cursor()
# count = cs1.execute('insert into goods_cates(name) values("硬盘")')
count = cs1.execute('SELECT * from t_inf_device_driver')
# 打印受影响的行数
print(count)

# 解析influxdb查询结果插入mysql 111
parsed_data = []

# data_points = None
# for key, value in result.items():
#     data_points = list(value)  # 转换为列表便于遍历
#     break
# for idx, point in enumerate(data_points, 1):
#     print(f"\n第{idx}条数据：")
#
#     parsed_point = {}
#     for field, value in point.items():
#         parsed_point[field] = value
#         print(f" {field}: {value} ")
#     parsed_data.append(parsed_point)

# 解析influxdb查询结果插入mysql 222


# 提交之前的操作，如果之前已经之执行过多次的execute，那么就都进行提交
conn.commit()
# 关闭Cursor对象
cs1.close()
# 关闭Connection对象
conn.close()

# influxdb关闭连接（可选）
client.close()
