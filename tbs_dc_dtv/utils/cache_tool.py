#!/usr/bin/env python
# -*- coding: utf-8 -*-
# auth: wallace.wang

import re
import hashlib
import json
from com.redis import client
from tbs_dc_dtv.config import setting
from tbs_dc_dtv.libs.display import models


class CacheData(object):
    """
    缓存类：从缓存中获取数据
    """
    redis_conn = client.RedisConnect(hosts=setting.REDIS['host'], db=0, password='DataCenterRedis')

    def __init__(self):
        self.user_obj = UserInfo()

    def get_user_obj(self, session_id):
        """
        构建缓存对象并将对象返回
        :param session_id:
        :return:
        """
        user_info = self.redis_conn.client.get(session_id)  # 根据session_id 从redis中获取用户信息

        try:
            uid = re.search(re.compile(r'i:\d+'), user_info).group().split(':')[1]
        except Exception:
            self.user_obj.set_uid(None)
            return self.user_obj

        user_role_type = self.redis_conn.client.get('bdp_uri_'+uid)

        if self.redis_conn.client.get('bdp_uif_'+uid) is None:
            self.user_obj.set_uid(None)
            return self.user_obj
        try:
            user_city = json.loads(self.redis_conn.client.get('bdp_uif_'+uid))[0][0]['city']
            user_area = json.loads(self.redis_conn.client.get('bdp_uif_'+uid))[0][0]['area']
            user_province = json.loads(self.redis_conn.client.get('bdp_uif_'+uid))[0][0]['province']
        except Exception:
            user_city = ''
            user_area = ''
            user_province = ''
        user_name = json.loads(self.redis_conn.client.get('bdp_uif_'+uid))[1]
        user_navigation = self.redis_conn.client.get('bdp_usn_'+uid)
        user_vid_list = [i['visual_id'] for i in
                         models.BdpAuthUserVisual.objects.filter(uid_id=uid).values('visual_id')]
        self.user_obj.set_uid(uid)
        self.user_obj.set_user_name(user_name)
        self.user_obj.set_user_role_type(user_role_type)
        self.user_obj.set_city_id_list(user_city)
        self.user_obj.set_user_area(user_area)
        self.user_obj.set_user_province(user_province)
        self.user_obj.set_navigation(user_navigation)
        self.user_obj.set_vid_list(user_vid_list)
        return self.user_obj

    def set_block_data_to_cache(self, sql, data):
        key = self.get_hashlib_key(sql)
        self.redis_conn.client.hset('bdp_visual_data', key, data)
        self.redis_conn.client.expire('bdp_visual_data', setting.REDIS['expire'])

    def get_block_data_from_cache(self, sql):
        key = self.get_hashlib_key(sql)
        data = self.redis_conn.client.hget('bdp_visual_data', key)
        return data

    @staticmethod
    def get_hashlib_key(sql):
        md = hashlib.md5()
        md.update(sql)
        return md.hexdigest()[0:8]


class UserInfo(object):
    """
    用户登入为减少对mysql的查询次数，直接从缓存中获取user信息然后根据用户信息构建对象
    """
    def __init__(self):
        self._uid = None  # 用户ID
        self._user_name = None  # 用户名
        self._user_role_type = None  # 用户角色类型
        self._city_id_list = None  # 用户城市id列表
        self._user_navigation = None  # 用户菜单栏信息
        self._vid_list = None  # 用户可视化报表id列表
        self._user_area = None
        self._user_province = None

    @property
    def get_uid(self):
        return self._uid

    @property
    def get_user_name(self):
        return self._user_name

    @property
    def get_user_role_type(self):
        return self._user_role_type

    @property
    def get_city_id_list(self):
        return self._city_id_list

    @property
    def get_navigation(self):
        return self._user_navigation

    @property
    def get_vid_list(self):
        return self._vid_list

    @property
    def get_user_area(self):
        return self._user_area

    @property
    def get_user_province(self):
        return self._user_province

    def set_uid(self, uid):
        self._uid = uid

    def set_user_name(self, user_name):
        self._user_name = user_name

    def set_user_role_type(self, user_role_type):
        self._user_role_type = json.loads(user_role_type)

    def set_city_id_list(self, city_id_list):
        try:
            self._city_id_list = tuple(city_id_list.split(','))
        except Exception:
            self._city_id_list = []

    def set_navigation(self, user_navigation):
        self._user_navigation = json.loads(user_navigation)

    def set_vid_list(self, user_vid_list):
        self._vid_list = user_vid_list

    def set_user_area(self, user_area):
        self._user_area = user_area

    def set_user_province(self, user_province):
        self._user_province = user_province
