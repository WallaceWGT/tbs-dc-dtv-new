#!/usr/bin/env python
# -*- coding: utf-8 -*-
# auth: wallace.wang

import pymysql
from tbs_dc_dtv.config import setting

import sys
reload(sys)
sys.setdefaultencoding('utf-8')


class OperateReportData(object):

    def __init__(self, sql):
        self.mysql_obj = None
        self.mysql_cursor = None
        self.mysql_connect()
        self.sql = sql

    # 连接数据库
    def mysql_connect(self):
        self.mysql_obj = pymysql.connect(setting.MYSQL['host'], setting.MYSQL['user'],
                                         setting.MYSQL['password'], setting.MYSQL['database'])
        self.mysql_cursor = self.mysql_obj.cursor()

    # 执行sql语句生成数据并返回
    def execute_sql(self):
        self.mysql_cursor.execute(self.sql)
        field = self.mysql_cursor.description
        field_cn = []
        for i in field:
            field_cn.append(i[0])
        data = self.mysql_cursor.fetchall()
        return {'data': data, 'field_cn': field_cn}

    # 对象查询结束关闭mysql
    def __del__(self):
        self.mysql_cursor.close()
        self.mysql_obj.close()
