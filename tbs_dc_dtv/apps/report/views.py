# -*- coding: utf-8 -*-

from __future__ import unicode_literals

import sys
import json
from django.shortcuts import render, redirect, HttpResponse, render_to_response
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from tbs_dc_dtv.libs.display import models
from tbs_dc_dtv.core import visual_report_config
from tbs_dc_dtv.core import visual_report_data
from tbs_dc_dtv.core import visual_report_menu
from tbs_dc_dtv.utils.cache_tool import CacheData
from tbs_dc_dtv.core import visual_admin
from tbs_dc_dtv.config import setting
from tbs_dc_dtv.core import visual_menu_create


reload(sys)
sys.setdefaultencoding("utf8")


# 认证装饰器
def authentication(fun):
    """
    更具cookie传递的信息，是否已经登入，如果登入就查看是否在查看权限列表，如果不在权限列表，返回数据报表平台
    :param fun:
    :return:
    """
    def wrapper(request, *args, **kwargs):
        session_id = request.COOKIES.get('PHPSESSID')
        # 第一步登入判断
        if not session_id:
            return redirect(setting.REDIRECT_URL+'/account/login')
        else:
            cache_obj = CacheData()
            user_obj = cache_obj.get_user_obj(session_id)
            if not user_obj.get_uid:
                return redirect(setting.REDIRECT_URL + '/account/login')
            request.cache_obj = cache_obj
            request.user = user_obj
            if 3 in user_obj.get_user_role_type or 5 in user_obj.get_user_role_type:
                pass
            else:
                request.report_menu = visual_menu_create.get_menu_obj(user_obj.get_uid)
            # 是否有访问数据可视化权限
            if not user_obj.get_navigation:
                return redirect(setting.REDIRECT_URL + '/account/login')
            elif '5' in user_obj.get_navigation.keys():
                if request.path in ['/visual/menu_setting/', '/visual/report_setting/',
                                    '/visual/block_setting/', '/visual/admin/']:
                    if 3 in user_obj.get_user_role_type or 5 in user_obj.get_user_role_type:
                        pass
                    else:
                        return redirect('/visual/index/')
                return fun(request, *args, **kwargs)
            else:
                return redirect(setting.REDIRECT_URL+'/report/view/index')
    return wrapper


# 首页
@authentication
def visual_index_view(request):
    return render(request, 'public/index.html')


# 报表展示
@method_decorator(csrf_exempt)
@authentication
def visual_report_view(request):
    """
    对报表进行展示视图，分为有时间过滤条件，无时间过滤条件
    :param request:
    :return:
    """
    if request.method == "GET":
        if request.GET.get('bid'):
            # 接收前端的ajax请求，从数据库中获取对应数据块的数据并返回
            data = visual_report_data.get_visual_report_block_data(request)
            return HttpResponse(json.dumps(data))
        elif request.GET.get('vid'):
            # 直接返回对应可视化报表id的页面
            vid = request.GET.get('vid')
            if int(vid) in request.user.get_vid_list:
                block_objs = models.BdpVisualBlockConfig.objects.filter(vid_id=int(vid))
                report_obj = models.BdpVisualReport.objects.filter(vid=int(vid)).values('report_type', 'report_name')
                return render(request, 'report/visual_view.html', {'block_objs': block_objs, 'report_obj': report_obj})
            else:
                return render(request, 'public/index.html')
        else:
            return render(request, 'report/visual_view.html')
    else:
        # 时间字段过滤时组合新的sql语句，执行并返回
        data = visual_report_data.get_visual_report_block_data(request)
        return HttpResponse(json.dumps(data))


# 菜单配置
@method_decorator(csrf_exempt)
@authentication
def visual_menu_setting_view(request):
    """
    对报表菜单进行添加，更新，删除操作
    :param request:
    :return:
    """
    if request.method == 'GET':
        return render(request, 'report/visual_menu_config.html')
    elif request.method == "POST":
        response_data = visual_report_menu.add_report_menu_info(request)
        return HttpResponse(json.dumps(response_data))
    elif request.method == 'PUT':
        response_data = visual_report_menu.update_report_menu_info(request)
        return HttpResponse(json.dumps(response_data))
    else:
        response_data = visual_report_menu.del_report_menu_info(request)
        return HttpResponse(json.dumps(response_data))


# 报表内容配置
@method_decorator(csrf_exempt)
@authentication
def visual_block_setting_view(request):
    """
    可视化报表块配置
        ：post--->更新
        ：delete--->删除
        ：put--->添加
    :param request:
    :return:
    """
    if request.method == "POST":
        response = visual_report_config.update_report_block(request)
        return HttpResponse(json.dumps(response))
    elif request.method == "DELETE":
        response = visual_report_config.delete_report_block(request)
        return HttpResponse(json.dumps(response))
    elif request.method == "PUT":
        response = visual_report_config.add_report_block(request)
        return HttpResponse(json.dumps(response))


# 报表配置
@method_decorator(csrf_exempt)
@authentication
def visual_report_setting_view(request):
    """
    报表配置：添加报表，名称修改，报表删除等操作
    :param request:
    :return:
    """
    if request.method == 'POST':
        response = visual_report_config.update_report(request)
        return HttpResponse(json.dumps(response))
    elif request.method == 'PUT':
        response = visual_report_config.add_report(request)
        return HttpResponse(json.dumps(response))
    else:
        response = visual_report_config.del_report(request)
        return HttpResponse(json.dumps(response))


# 权限管理
@method_decorator(csrf_exempt)
@authentication
def visual_admin_view(request):
    if request.method == 'GET':
        if request.GET.get('uid'):
            response = visual_admin.get_permission_tree_data(request)
            return HttpResponse(json.dumps(response))
        else:
            return render(request, 'report/visual_system_admin.html')
    elif request.method == 'POST':
        response = visual_admin.get_user_data(request)
        return HttpResponse(json.dumps(response))
    elif request.method == 'PUT':
        response = visual_admin.set_permission(request)
        return HttpResponse(json.dumps(response))
    else:
        return HttpResponse()


# 跳转到数据中心
@authentication
def visual_redirect_report(reqeust):
    return redirect(setting.REDIRECT_URL+'/report/view')


# 注销
@authentication
def visual_logout(request):
    return redirect(setting.REDIRECT_URL+'/account/login/out')


def page_not_found(request):
    return render_to_response('public/404.html')


def page_error(request):
    return render_to_response('public/50x.html')

