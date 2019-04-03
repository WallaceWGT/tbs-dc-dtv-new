#!/usr/bin/env python
# -*- coding: utf-8 -*-
# auth: wallace.wang

import re
import decimal


def set_sql_field(sql):
    """
    处理前端传递sql，解析显示字段存入数据库
    :param sql:
    :return:
    """
    result = re.search(r'select(.+\s+)+?from', sql, re.IGNORECASE).group()  # 匹配第一句select from的字段
    field_info = [i.strip() for i in result.split('\n') if i.strip() != ''
                  and i.strip() != 'select' and i.strip() != 'from']  # 对字段中的值进行过滤处理

    field_name = [i.split('AS')[0] for i in field_info if re.search('AS', i)]  # 解析字段生成英文名
    field_name_cns = [i.split('AS')[1].strip() for i in field_info if re.search('AS', i)]  # 解析字段生成中文
    field_name_new_cns = []
    for i in field_name_cns:
        if i.startswith("'"):
            field_name_new_cns.append(i.strip(",").strip("'"))
        elif i.startswith('"'):
            field_name_new_cns.append(i.strip(',').strip('"'))
        else:
            field_name_new_cns.append(i.strip(','))
    return field_name, field_name_new_cns


def decimal_to_str(data_list):
    """
    对数据库中查询出的数值数据进行格式化成字符串的形式
    :param data_list:
    :return:
    """
    data = map(lambda x: str(x) if isinstance(x, decimal.Decimal) else x, data_list)
    return data



