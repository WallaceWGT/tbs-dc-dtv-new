#!/usr/bin/env python
# -*- coding: utf-8 -*-
# auth: wallace.wang

from tbs_dc_dtv.libs.display import models


def get_menu_obj(uid=None):
    """
    更加uid生成菜单
    :param uid:
    :return:
    """
    if uid is not None:
        menu_obj_list = models.BdpVisualMenu.objects.filter(bdpvisualreport__bdpauthuservisual__uid_id=uid)
        tmp_menu_obj = []
        menu_obj = []
        for h in menu_obj_list:
            if h.parent_id != 0:
                tmp_menu_obj.append(models.BdpVisualMenu.objects.filter(mid=h.parent_id)[0])
            tmp_menu_obj.append(h)
        for k in tmp_menu_obj:
            if k in menu_obj:
                continue
            else:
                menu_obj.append(k)
    else:
        menu_obj = models.BdpVisualMenu.objects.all()

    menu_list = []
    # 遍历菜单module生成菜单对象
    for j in menu_obj:
        if None in menu_list:
            menu_list.remove(None)
        menu_list = generate_menu(j, menu_list, uid)
    return menu_list


def generate_menu(i, menu_list, uid):
    """
    子菜单创建
    :param i:
    :param menu_list:
    :param uid:
    :return:
    """
    menu = Menu()
    menu.mid = i.mid
    if uid is not None:
        menu.report = models.BdpVisualReport.objects.filter(mid_id=i.mid, bdpauthuservisual__uid=uid)
    else:
        menu.report = models.BdpVisualReport.objects.filter(mid_id=i.mid)
    if len(i.menu_path) == 1:
        menu.is_terminal = i.is_terminal
        menu.parent_id = 0
        menu_list.append(menu)
    elif len(i.menu_path.split(":")) == 2:
        menu.parent_id = i.menu_path.split(':')[0]
        for j in menu_list:
            if int(j.mid) == int(menu.parent_id):
                j.child.append(menu)
                break
    elif len(i.menu_path.split(":")) == 3:
        menu.parent_id = i.menu_path.split(':')[1]
        for h in menu_list:
            for g in h.child:
                if int(g.mid) == int(menu.parent_id):
                    g.child.append(menu)
                    break
    return menu_list


# 创建菜单对象
class Menu(object):
    def __init__(self):
        self.parent_id = 0
        self.child = []
        self.mid = 0
        self.is_terminal = 0
        self.report = None
