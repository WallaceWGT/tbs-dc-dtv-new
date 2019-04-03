#!/usr/bin/env python
# -*- coding: utf-8 -*-
# auth: wallace.wang

import json
from com.utils import MyTime
from tbs_dc_dtv.libs.display import models
from datetime import datetime


def get_filter_date(request):
    """
    日期处理
    :param request:
    :return:
    """
    if request.method == 'GET':
        bid = request.GET.get('bid')
    else:
        bid = json.loads(request.POST.get('bid'))
    report_type = models.BdpVisualReport.objects.filter(bdpvisualblockconfig__bid=bid).values('report_type')[0]['report_type']
    date_type = models.BdpVisualBlockConfig.objects.filter(bid=bid).values('date_type')[0]['date_type']
    # 初始化日期
    tmp_start_week, tmp_end_week = MyTime.get_week(MyTime.get_date(0))
    tmp_start_month, tmp_end_month = MyTime.get_month(MyTime.get_date(0))
    if request.method == 'GET':
        # 判断可视化报表类型月报或周报
        if report_type == 0:
            # 判断是否是按日类型0表示默认
            if date_type == 0:
                start_date = MyTime.date_to_dt(MyTime.date_before_day(tmp_start_week, 140))
                end_date = MyTime.date_to_dt(tmp_end_week)
            else:
                start_date = MyTime.date_to_dt(tmp_start_week)
                end_date = MyTime.date_to_dt(tmp_end_week)
        else:
            if date_type == 0:
                start_date = MyTime.add_months(datetime.today().replace(
                   int(tmp_start_month[0:4]), int(tmp_start_week[5:7]), int(tmp_start_month[8:])), -12)
                start_date = MyTime.date_to_dt(str(start_date)[0:10])
                end_date = MyTime.date_to_dt(tmp_end_month)
            else:
                start_date = MyTime.date_to_dt(tmp_start_month)
                end_date = MyTime.date_to_dt(tmp_end_month)
    # 含筛选条件的时间生成
    else:
        tmp_date = request.POST.get('date').split(' - ')
        if len(str(tmp_date[0])) == 7:
            if date_type == 0:
                start_date = ''.join(tmp_date[0].split('-'))+'01'
                end_date = ''.join(tmp_date[1].split('-'))+'01'
            else:
                start_date, end_date = MyTime.get_month(tmp_date[1]+'-01')
                start_date = MyTime.date_to_dt(start_date)
                end_date = MyTime.date_to_dt(end_date)
        else:
            if date_type == 0:
                start_date = ''.join(tmp_date[0].split('-'))
                end_date = MyTime.date_to_dt(MyTime.get_week(tmp_date[1])[0])
            else:
                start_date = MyTime.date_to_dt(MyTime.date_before_day(tmp_date[1], 7))
                end_date = MyTime.date_to_dt(tmp_date[1])
    return start_date, end_date


