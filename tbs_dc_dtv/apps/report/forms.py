#!/usr/bin/env python
# -*- coding: utf-8 -*-
# auth: wallace.wang

from django import forms
from django.forms import widgets
from django.forms import fields
from tbs_dc_dtv.libs.display import models


class ReportMenuForm(forms.Form):

    menu_name = forms.CharField(
        widget=widgets.TextInput(
            attrs={'class': 'form-control', 'name': 'menu_name'},
        ),
        required=True,
        max_length=50,
        min_length=2,
        label='菜单名称'
    )


class VisualReportForm(forms.Form):

    visual_report_name = forms.CharField(
        widget=widgets.TextInput(
            attrs={'class': 'form-control'},
        ),
        required=True,
        max_length=60,
        min_length=2,
        label='报表名称'
    )
    is_down = fields.ChoiceField(
        initial=0,
        choices=((0, '是'), (1, '否')),
        widget=widgets.RadioSelect(),
        label='是否可下载'
    )
    online = fields.ChoiceField(
        initial=0,
        choices=((0, '是'), (1, '否')),
        widget=widgets.RadioSelect(),
        label='是否上线'
    )
    mid = fields.ChoiceField(
        initial=1,
        widget=widgets.Select(
            attrs={'class': 'form-control'}
        ),
        label='菜单选择'

    )

    def __init__(self, *args, **kwargs):
        super(VisualReportForm, self).__init__(*args, **kwargs)
        self.fields['mid'].widget.choices = models.BdpDataVisualMenu.objects.all().values_list('mid', 'menu_name')



