#!/usr/bin/env python
# -*- coding: utf-8 -*-
# auth: wallace.wang

"""
标签：更加前端传递数据，对模板进行数据处理
"""

from django import template
from tbs_dc_dtv.libs.display import models
register = template.Library()


@register.filter
def get_report_title(menu_obj):
    """
    获取所有的菜单对象
    :param menu_obj:
    :return:
    """
    field_names = menu_obj.bdpvisualreport_set.all()
    return field_names


@register.filter
def get_menu_report_number(menu_obj):
    """
    获取菜单数量
    :param menu_obj:
    :return:
    """
    number = len(menu_obj.bdpvisualreport_set.all())
    return number


@register.filter
def get_role_name(role_obj):
    """
    根据用户对象获取该用户的角色名
    :param role_obj: 角色对象
    :return:
    """
    role_name = models.BdpAuthUserRole.objects.filter(uid_id=role_obj).values('rid__role_name')[0]['rid__role_name']

    return role_name


@register.filter
def get_menu_name(mid):
    """
    根据菜单id获取菜单名称
    :param mid:
    :return:
    """
    menu_name = models.BdpVisualMenu.objects.filter(mid=mid)[0]
    return menu_name.menu_name


@register.filter
def get_report(mid):
    """
    更加菜单id获取对应菜单下的report对象
    :param mid:
    :return:
    """
    reports = models.BdpVisualReport.objects.filter(mid=mid)
    return reports
