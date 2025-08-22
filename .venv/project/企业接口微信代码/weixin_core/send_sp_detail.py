import requests
from typing import Dict, Any


class MessageSender:
    """企业微信消息推送API"""

    def __init__(self, token_manager):
        self.token_manager = token_manager


    def send_sp_detail(
            self,
            dict_data: dict,
            agentid: int = 1000005,

    ) -> Dict[str, Any]:
        """
        发送企业微信消息
        :param touser: 接收人用户ID
        :param agentid: 应用ID
        :param content: 消息内容
        :return: API响应字典
        """
        token = self.token_manager.get_valid_token()
        url = f'https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token={token}'
        print(dict_data['touser'],dict_data['content1'])
        payload = {
            "touser": dict_data['touser'],
            "msgtype": "text",  # 必需的字段
            "agentid": agentid,
            "text": {
                "content":dict_data['content1']
            },
            "safe": 0  # 通常需要的字段
        }
        print(f'已发送信息{dict_data["content1"]}')

        response = requests.post(url, json=payload, timeout=15)
        # response.raise_for_status()  # 检查HTTP错误
        result = response.json()

        # print("API原始响应:", result)
        # print("格式化响应:", json.dumps(result, indent=2, ensure_ascii=False))

        return result  # 返回字典而不是字符串

