#!/usr/bin/env python
# -*- coding: utf-8 -*-
# auth: wallace.wang
from django.conf.urls import url

from tbs_dc_dtv.apps.report import views

urlpatterns = [
    url(r'index', views.visual_index_view),
    url(r'view', views.visual_report_view),
    url(r'report_setting.', views.visual_report_setting_view),
    url(r'menu_setting', views.visual_menu_setting_view),
    url(r'block_setting', views.visual_block_setting_view),
    url(r'admin', views.visual_admin_view),
    url(r'logout', views.visual_logout),
    url(r'toReport', views.visual_redirect_report,)
]
