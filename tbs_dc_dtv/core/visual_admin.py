#!/usr/bin/env python
# -*- coding: utf-8 -*-
# auth: wallace.wang

import json
from django.http import QueryDict
from tbs_dc_dtv.libs.display import models
from tbs_dc_dtv.core.visual_menu_create import get_menu_obj


def get_user_data(request):
    """
    获取所有的用户信息
    :param request:
    :return:
    """
    response = {'code': 0, 'msg': '', 'data': {'count': 0, 'user_info': []}}
    user_obj = models.BdpAuthUser.objects.all()
    for i in user_obj:
        try:
            role_name = models.BdpAuthUserRole.objects.filter(uid_id=i.uid).values('rid__role_name')[0]['rid__role_name']
        except IndexError:
            role_name = '普通角色',
        response['data']['user_info'].append({'id': i.uid, 'username': i.user_name, 'role_type': role_name})
    response['data']['count'] = len(user_obj)
    return response


def get_permission_tree_data(request):
    """
    生成权限树
    :param request:
    :return:
    """
    response = {'code': 0, 'msg': '', 'data': []}
    menu_obj = get_menu_obj()
    for i in menu_obj:
        single_permission = {'id': i.mid, 'name': models.BdpVisualMenu.objects.filter(
            mid=i.mid)[0].menu_name, 'children': get_permission_child(i, request)}
        for h in single_permission['children']:
            if 'checked' in h.keys():
                single_permission['checked'] = 'true'
                break
            else:
                continue
        response['data'].append(single_permission)
    return response


def set_permission(request):
    """
    进行权限设置
    :param request:
    :return:
    """
    response = {'code': 0, 'message': 'success', 'data': None}
    perm_data = QueryDict(request.body)
    uid = perm_data['uid']
    data_list = json.loads(perm_data['data'])
    # 获取已经有的权限
    have_perm = models.BdpAuthUserVisual.objects.filter(uid_id=uid)

    for i in have_perm:
        # 判断之前的权限是否在提交的权限若不在进行删除，若存在将提交的权限列表中删除
        if i.visual_id in data_list:
            data_list.remove(int(i.visual_id))
        else:
            models.BdpAuthUserVisual.objects.filter(uid_id=uid, visual_id=i.visual_id).delete()
    for j in data_list:
        models.BdpAuthUserVisual.objects.create(uid_id=uid, visual_id=int(j))
    return response


def get_permission_child(menu_obj, request):
    """
    生成权限子树
    :param menu_obj:
    :param request:
    :return:
    """
    uid = request.GET.get('uid')
    visual_id = models.BdpAuthUserVisual.objects.filter(uid_id=uid).values('visual_id')
    children = []
    # 判断是否为第一级
    if len(menu_obj.child) == 0:
        for j in models.BdpVisualReport.objects.filter(mid_id=menu_obj.mid):
            # 判断是否有权限，若有设置为勾选状态
            if j.vid in [i['visual_id'] for i in visual_id]:
                children.append({'id': j.vid, 'name': j.report_name, 'checked': 'true', 'report': 'true'})
            else:
                children.append({'id': j.vid, 'name': j.report_name, 'report': 'true'})
    else:
        for g in models.BdpVisualReport.objects.filter(mid_id=menu_obj.mid):
            if g.vid in [i['visual_id'] for i in visual_id]:
                children.append({'id': g.vid, 'name': g.report_name, 'checked': 'true', 'report': 'true'})
            else:
                children.append({'id': g.vid, 'name': g.report_name, 'report': 'true'})
        for i in menu_obj.child:
            for j in get_permission_child(i, request):
                if 'checked' in j.keys():
                    children.append({'id': i.mid, 'name': models.BdpVisualMenu.objects.filter(mid=i.mid)[0].menu_name,
                                     'children': get_permission_child(i, request), 'checked': 'true'})
                else:
                    children.append({'id': i.mid, 'name': models.BdpVisualMenu.objects.filter(mid=i.mid)[0].menu_name,
                                     'children': get_permission_child(i, request)})

        # 过滤多余的子树,在遍历时会因为有多个子节点, 出现遍历多次情况
        tmp_children = []
        for h in children:
            if h['id'] in [i['id'] for i in tmp_children]:
                continue
            if 'checked' in h.keys():
                tmp_children.append(h)
        for l in children:
            if l['id'] in [i['id'] for i in tmp_children]:
                continue
            else:
                tmp_children.append(l)
        children = tmp_children
    return children



