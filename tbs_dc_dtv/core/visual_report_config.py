#!/usr/bin/env python
# -*- coding: utf-8 -*-
# auth: wallace.wang


from django.http import QueryDict
from django.db.models import Q
from com.utils import MyTime
from tbs_dc_dtv.libs.display import models
from tbs_dc_dtv.utils import data_tool


# 添加一个报表中的一块数据
def add_report_block(request):
    block_info = QueryDict(request.body)

    # 报表块数据配置存储
    report_block_config = {'vid_id': block_info['vid'], 'block_name': block_info['block_name'],
                           'date_type': block_info['date_type'], 'block_type': block_info['block_type'],
                           'chart_type': None, 'block_content': None, 'query_sql': None, 'block_offset_left': None,
                           'block_offset_top': None}

    # 不同类型的数据块的存储字段不一致，在这进行关键字判断
    try:
        if block_info['chart_type']:
            report_block_config['chart_type'] = block_info['chart_type']
    except KeyError:
        pass
    try:
        if block_info['block_content']:
            report_block_config['block_content'] = block_info['block_content']
    except KeyError:
        pass

    try:
        if block_info['query_sql']:
            report_block_config['query_sql'] = block_info['query_sql']
    except KeyError:
        models.BdpVisualBlockConfig.objects.create(**report_block_config)
        return {'code': 0, 'message': 'success', 'data': None}
    try:
        models.BdpVisualBlockConfig.objects.create(**report_block_config)
    except Exception, e:
        return {'code': -1, 'message': 'Add report block is error', 'data': str(e)}

    # 获取对应报表的数据块对象
    block_obj = models.BdpVisualBlockConfig.objects.filter(
        vid_id=block_info['vid'], block_name=block_info['block_name'])[0]

    # 将sql语句的as后面的匹配并存储
    field_name, field_name_cns = data_tool.set_sql_field(block_obj.query_sql)

    # 对映射出来的字段进行赋值和存储
    for field_name_cn in field_name_cns:
        report_block_field = {'bid': block_obj, 'field_name_cn': field_name_cn,
                              'field_name': field_name[field_name_cns.index(field_name_cn)]}
        models.BdpVisualBlockField.objects.create(**report_block_field)
    return {'code': 0, 'message': 'success', 'data': None}


# 更新报表中的每一个数据块的数据
def update_report_block(request):
    block_info = {}
    for i in request.POST:
        if request.POST.get(i) == '':
            pass
        else:
            block_info[i] = request.POST.get(i)
    position_status = block_info.pop('position')
    background_color = block_info.pop('data_block_background_color', None)
    models.BdpVisualBlockConfig.objects.filter(bid=block_info['bid']).update(**block_info)
    block_obj = models.BdpVisualBlockConfig.objects.filter(bid=block_info['bid'])[0]

    # 获取sql的查询字段并对其存储。
    try:
        field_name, field_name_cns = data_tool.set_sql_field(block_obj.query_sql)
    except Exception:
        return {'code': 0, 'message': 'success', 'data': None}

    # 对映射出来的字段进行赋值和存储, 已经存在的不进行判断，对不存在的字段删除，新增的就进行新增
    exist_fields = set(models.BdpVisualBlockField.objects.filter(bid=block_obj).
                       values_list('field_name_cn', 'field_name'))
    new_fields = set([(field_name_cns[i], field_name[i]) for i in range(len(field_name_cns))])
    # 新增
    for i in new_fields - exist_fields:
        report_block_field = {'bid': block_obj, 'field_name_cn': i[0], 'field_name': i[1]}
        models.BdpVisualBlockField.objects.update_or_create(**report_block_field)
    # 删除
    for j in exist_fields - new_fields:
        models.BdpVisualBlockField.objects.filter(bid=block_obj, field_name_cn=j[0], field_name=j[1]).delete()

    if block_info['block_type'] == "3" and position_status == '1':
        background_color = background_color.split(',')[1:]
        tmp_block_field_obj = models.BdpVisualBlockField.objects.filter(bid_id=block_obj).values_list('fid')
        for g in range(len(tmp_block_field_obj)):
            models.BdpVisualBlockField.objects.filter(
                fid=tmp_block_field_obj[g][0]).update(background_color=background_color[g])
    return {'code': 0, 'message': 'success', 'data': None}


# 删除其中一块报表数据
def delete_report_block(request):
    bid = request.body
    models.BdpVisualBlockConfig.objects.filter(bid=bid).delete()
    return {'code': 0, 'message': 'success', 'data': None}


# 添加报表
def add_report(request):
    report_info = QueryDict(request.body)
    report_config = {'mid_id': report_info['mid'],
                     'create_time': MyTime.date_to_dt(MyTime.get_date(0)),
                     'report_name': report_info['report_name'],
                     'create_uid': 1, 'update_time': MyTime.date_to_dt(MyTime.get_date(0)),
                     'report_type': report_info['report_type'],
                     'online': report_info['online'], 'update_uid': 1}
    if models.BdpVisualReport.objects.filter(mid_id=report_info['mid'], report_name=report_info['report_name']):
        response = {'code': 1, 'message': 'this report name is exist, please change it', "data": None}
    else:
        re_obj = models.BdpVisualReport.objects.create(**report_config)
        auto_add_permission(re_obj.vid)
        response = {'code': 0, 'message': 'add success', 'data': None}

    return response


# 报表创建成功，默认给超级管理员和报表管理员
def auto_add_permission(vid):
    user_objs = models.BdpAuthUser.objects.filter(
        Q(bdpauthuserrole__rid__role_type=1) | Q(bdpauthuserrole__rid__role_type=2) | Q(uid=185)).all()
    for i in user_objs:
        models.BdpAuthUserVisual.objects.create(uid=i, visual_id=vid)
    return True


# 更新报表
def update_report(request):
    report_info = QueryDict(request.body)
    vid = report_info['vid']
    online = report_info['online']
    report_name = report_info['report_name']
    report_config = {'create_uid': 1, 'update_time': MyTime.date_to_dt(MyTime.get_date(0)),
                     'online': online, 'report_name': report_name, 'update_uid': 1}
    models.BdpVisualReport.objects.filter(vid=vid).update(**report_config)
    response = {'code': 0, 'message': 'update success', 'data': None}
    return response


# 删除报表
def del_report(request):
    report_info = QueryDict(request.body)
    vid = report_info['vid']
    models.BdpVisualReport.objects.filter(vid=vid).delete()
    return {'code': 0, 'message': 'delete success', 'data': None}
