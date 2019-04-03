#!/usr/bin/env python
# -*- coding: utf-8 -*-
# auth: wallace.wang

import sys
import json
from tbs_dc_dtv.libs.display import models
from tbs_dc_dtv.utils import data_tool, mysql_tool
from tbs_dc_dtv.utils import deal_sql



reload(sys)
sys.setdefaultencoding('utf-8')


# 获取报表数据
def get_visual_report_block_data(request):
    return_data = {'code': 0, 'message': 'success', 'data': None}
    if request.method == 'GET':
        bid = request.GET.get('bid')
        block_type = request.GET.get('block_type')
    else:
        bid = json.loads(request.POST.get('bid'))
        block_type = json.loads(request.POST.get('block_type'))
    # 获取对应数据块的所有值，并删除多余字段
    report_block_obj_dict = models.BdpVisualBlockConfig.objects.filter(bid=bid)[0].__dict__
    del report_block_obj_dict['_state']

    # 获取绝对定位
    return_data['data'] = report_block_obj_dict
    # 更具sql获取数据并返回
    if int(block_type) != 2:
        # 获取报表块的sql并对sql进行加工处理
        sql = models.BdpVisualBlockConfig.objects.filter(bid=int(bid)).values('query_sql')[0]['query_sql']
        report_type = models.BdpVisualReport.objects.filter(bdpvisualblockconfig__bid=int(bid)).values("report_type")[0]
        request.report_type = report_type['report_type']
        sql = deal_sql.get_query_sql(sql, bid, request)

        # 数据块类型直接从数据库中获取，不从缓存中获取
        if int(block_type) != 3 and request.cache_obj.get_block_data_from_cache(sql):
            field_info = json.loads(request.cache_obj.get_block_data_from_cache(sql))
            return_data['data']['field_data'] = field_info['data']
            return_data['data']['columns_cn'] = field_info['field_cn']
        else:
            mysql_obj = mysql_tool.OperateReportData(sql)
            block_field_info = mysql_obj.execute_sql()
            deal_block_data = []
            for single_block_data in block_field_info['data']:
                # mysql 获取的有些数据是decimal.Decimal类型的数据, 需要将其转换成普通的字符串形式
                j = data_tool.decimal_to_str(single_block_data)
                deal_block_data.append(j)

            return_data['data']['field_data'] = deal_block_data

            # 对于数据块类型数据给其加上背景色属性
            if int(block_type) == 3:
                tmp_field_info = []
                for i in block_field_info['field_cn']:
                    backend_color = models.BdpVisualBlockField.objects.filter(
                        bid_id=bid, field_name_cn=i).values_list('background_color')
                    tmp_field_info.append((i, backend_color[0]))
                return_data['data']['columns_cn'] = tmp_field_info
            else:
                request.cache_obj.set_block_data_to_cache(sql, json.dumps({
                    'data': deal_block_data, 'field_cn': block_field_info['field_cn']}))
                return_data['data']['columns_cn'] = block_field_info['field_cn']
    else:
        pass

    return return_data
