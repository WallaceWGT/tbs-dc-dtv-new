#!/usr/bin/env python
# -*- coding: utf-8 -*-
# auth: wallace.wang

import time
from django.http import QueryDict
from tbs_dc_dtv.libs.display import models


# 添加菜单
def add_report_menu_info(request):
    menu_form = request.POST
    menu_name = menu_form.get('menu_name')
    parent_id = menu_form.get('parent_id')
    is_terminal = menu_form.get('is_terminal')
    if parent_id is None:
        parent_id = 0
    menu_obj = models.BdpVisualMenu.objects.create(
        menu_name=menu_name,
        parent_id=parent_id,
        is_terminal=is_terminal,
        menu_path=0,
        create_uid=1,
        create_time=time.time(),
        update_time=time.time(),
        update_uid=1
    )
    mid = menu_obj.mid
    if parent_id != '0':
        menu_path = str(parent_id)+":"+str(mid)
        old_parent_id = models.BdpVisualMenu.objects.filter(mid=parent_id).values('parent_id')[0]['parent_id']
        if old_parent_id == 0:
            menu_path = menu_path
        else:
            menu_path = str(old_parent_id)+":"+menu_path
        models.BdpVisualMenu.objects.filter(mid=mid).update(menu_path=menu_path)
    return {'code': 0, 'message': 'success', 'data': None}


# 更新菜单
def update_report_menu_info(request):
    menu_info = QueryDict(request.body)
    menu_name = menu_info.get("menu_name")
    mid = menu_info.get("mid")
    try:
        models.BdpVisualMenu.objects.filter(mid=mid).update(menu_name=menu_name, update_time=time.time())
        return {'code': 0, 'message': 'success', 'data': None}
    except Exception as e:
        return {'code': -1, 'message': "invlied data", 'data': str(e)}


# 删除菜单
def del_report_menu_info(request):
    menu_info = QueryDict(request.body)
    mid = menu_info.get('mid')
    models.BdpVisualMenu.objects.filter(mid=mid).delete()
    return {'code': 0, 'message': 'success', 'data': None}
