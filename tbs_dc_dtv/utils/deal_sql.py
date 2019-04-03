#!/usr/bin/env python
# -*- coding: utf-8 -*-
# auth: wallace.wang

import re

from tbs_dc_dtv.libs.display import models
from tbs_dc_dtv.utils import date_tool


def get_query_sql(sql, bid, request):
    """
    对数据块sql进行加工处理
    :param sql:
    :param bid:
    :param request:
    :return:
    """
    # 时间获取, end_date默认是当前时间, 该时间会根据前端传递的时间进行变换
    start_date, end_date = date_tool.get_filter_date(request)
    # 变量替换
    pattern = re.compile(r"{\w+}")
    query_variable_list = re.findall(pattern, str(sql))
    for i in query_variable_list:
        if i == "{STARTDATE}":
            sql = re.sub(r'{STARTDATE}', start_date, sql)
        elif i == "{ENDDATE}":
            sql = re.sub(r'{ENDDATE}', end_date, sql)
        elif i == "{UID}":
            # 用户id
            sql = re.sub(r'{UID}', str(request.user.get_user_uid), sql)
        elif i == "{CITY}":
            # 用户city id list
            sql = re.sub(r'{CITY}', str(request.user.get_user_city_list), sql)
    filed_name = [i['field_name'].encode('utf-8') for i in
                  models.BdpVisualBlockField.objects.filter(bid_id=int(bid)).values('field_name')]

    # 含时间的sql拼接
    if 'stat_date ' in filed_name:
        sql = """select * from (%s) as new_data where 日期 between %s and %s limit 0, 500; """ % \
                     (sql.split(';')[0], start_date, end_date)
    else:
        try:
            sql = """select * from (%s) as new_data limit 0, 100;""" % sql.split(';')[0]
        except AttributeError:
            pass
    return sql

