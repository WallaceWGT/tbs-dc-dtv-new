
$(function () {
    edit_menu();
    main_edit_menu();
});

function main_edit_menu(){
    $('.main-menu-edit').bind('contextmenu', function () {
        var option = $('.menu-edit-module').find('.menu-select').children();
        $('.menu-edit-module').attr('mid', 0);
        $.each(option, function (i, x) {
            if($(x).attr('parent_id') === '0'){
                $(x).show();
            } else {
                $(x).hide();
            }
        });
        $($('.menu-edit-module').find('.menu-form').find('option')[1]).attr('selected', true);
        $($('.menu-edit-module').find('.menu-form').find('option')[0]).hide();
        $('.menu-edit-module').find('.report-form').hide();
        $('.menu-edit-module').find('.online-form').hide();
        var alert_html = $('.menu-module').html();
        layer.open({
            type: 1,
            area: ['500px', '500px'],
            shadeClose: false, //点击遮罩关闭
            content: alert_html,
            title:'目录新增'
        });
        return false
    })
}

// 报表目录弹窗
function edit_menu() {
    $('.menu-edit').bind('contextmenu', function () {
        var mid = $(this).attr('mid');
        var option = $('.menu-edit-module').find('.menu-select').children();
        $('.menu-edit-module').attr('mid', mid);
        $.each(option, function (i, x) {
            if($(x).attr('parent_id') === mid){
                $(x).show();
            } else {
                $(x).hide();
            }
            if($(x).attr('level') === '-1'){
                $(x).show();
            }
        });

        if($(this).attr('level') === "2"){
            $($('.menu-module').find('.menu-form').find('.menu-type').children()[1]).css('display', 'none')
        }

        var alert_html = $('.menu-module').html();
        layer.open({
            type: 1,
            area: ['500px', '500px'],
            shadeClose: false, //点击遮罩关闭
            content: alert_html,
            title:'目录新增'
        });
        return false
    })
}

// 目录或报表添加
function add(th) {
    var menu_type = $(th).parents('.menu-edit-module').find('.menu-type').val();
    if(menu_type === '0'){
        add_menu(th)
    }else {
        add_report(th)
    }
}
function add_menu(th) {
    var menu_name = $(th).parents('.menu-edit-module').find('[name=menu-name]').val();
    var parent_id = $(th).parents('.menu-edit-module').attr('mid');
    var is_terminal = 0;
    $.ajax({
        method: "POST",
        url:"/visual/menu_setting/",
        data: {'menu_name': menu_name, 'parent_id': parent_id, 'is_terminal': is_terminal},
        success: function (arg) {
            layer.open({
                content: JSON.parse(arg)['message'],
                title: '成功信息',
                yes:function (index,layero) {
                    layer.close(index);
                    window.location.reload()
                }
            })
        },
        error: function (arg) {
            layer.open({
                content: "请求失败，重新登入",
                title: '失败信息',
                yes:function (index,layero) {
                    layer.close(index);
                    window.location.reload()
                }
            })
        }
    })
}
function add_report(th) {
    var report_name = $(th).parents('.menu-edit-module').find('[name=menu-name]').val();
    var mid = $(th).parents('.menu-edit-module').attr('mid');
    var online = $(th).parents('.menu-edit-module').find('.online').val();
    var report_type = $(th).parents('.menu-edit-module').find('[name=report-type]').val();
    $.ajax({
        method: "PUT",
        url:"/visual/report_setting/",
        data: {'report_name': report_name, 'mid': mid, 'online': online, 'report_type': report_type},
        success: function (arg) {
            layer.open({
                content: JSON.parse(arg)['message'],
                title: '成功信息',
                yes:function (index,layero) {
                    layer.close(index);
                    window.location.reload()
                }
            })
        },
        error: function (arg) {
            layer.open({
                content: "请求失败，重新登入",
                title: '失败信息',
                yes:function (index,layero) {
                    layer.close(index);
                    window.location.reload()
                }
            })
        }
    })
}

// 目录或报表更新
function update(th) {
    var menu_type = $(th).parents('.menu-edit-module').find('.menu-type').val();
    if(menu_type === '0'){
        update_menu(th)
    }else {
        update_report(th)
    }
}
function update_menu(th) {
    var mid = $(th).parents('.menu-edit-module').find('.menu-select').val();
    var menu_name = $(th).parents('.menu-edit-module').find('[name=menu-name]').val();
    $.ajax({
        method: "PUT",
        url:"/visual/menu_setting/",
        data: {'menu_name': menu_name, 'mid': mid},
        success: function (arg) {
            layer.open({
                content: JSON.parse(arg)['message'],
                title: '成功信息',
                yes:function (index,layero) {
                    layer.close(index);
                    window.location.reload()
                }
            })
        },
        error: function (arg) {
            layer.open({
                content: "请求失败，重新登入",
                title: '失败信息',
                yes:function (index,layero) {
                    layer.close(index);
                    window.location.reload()
                }
            })
        }
    })
}
function update_report(th) {
    var vid = $(th).parents('.menu-edit-module').find('.menu-select').val();
    var online = $(th).parents('.menu-edit-module').find('.online').val();
    var report_name = $(th).parents('.menu-edit-module').find('[name=menu-name]').val();
    $.ajax({
        method: 'POST',
        url: "/visual/report_setting/",
        data: {'vid': vid, 'online': online, 'report_name': report_name},
        success: function (arg) {
            layer.open({
                content: JSON.parse(arg)['message'],
                title: '成功信息',
                yes:function (index,layero) {
                    layer.close(index);
                    window.location.reload()
                }
            })
        },
        error: function (arg) {
            layer.open({
                content: "请求失败，重新登入",
                title: '失败信息',
                yes:function (index,layero) {
                    layer.close(index);
                    window.location.reload()
                }
            })
        }
    })
}

// 目录或报表删除
function del(th) {
    var menu_type = $(th).parents('.menu-edit-module').find('.menu-type').val();
    if(menu_type === '0'){
        delete_menu(th)
    }else {
        delete_report(th)
    }
}
function delete_menu(th) {
    var mid = $(th).parents('.menu-edit-module').find('.menu-select').val();
    $.ajax({
        method: "DELETE",
        url:"/visual/menu_setting/",
        data: {'mid': mid},
        success: function (arg) {
            layer.open({
                content: JSON.parse(arg)['message'],
                title: '成功信息',
                yes:function (index,layero) {
                    layer.close(index);
                    window.location.reload()
                }
            })
        },
        error: function (arg) {
            layer.open({
                content: "请求失败，重新登入",
                title: '失败信息',
                yes:function (index,layero) {
                    layer.close(index);
                    window.location.reload()
                }
            })
        }
    })
}
function delete_report(th) {
    var vid = $(th).parents('.menu-edit-module').find('.menu-select').val();
    $.ajax({
        method: "DELETE",
        url:"/visual/report_setting/",
        data: {'vid': vid},
        success: function (arg) {
            layer.open({
                content: JSON.parse(arg)['message'],
                title: '成功信息',
                yes:function (index, layero) {
                    layer.close(index);
                    window.location.reload()
                }
            })
        },
        error: function (arg) {
            layer.open({
                content: "请求失败，重新登入",
                title: '失败信息',
                yes:function (index,layero) {
                    layer.close(index);
                    window.location.reload()
                }
            })
        }
    })
}

// 弹框select选择触发事件
function menu_change(th) {
    if($(th).val() === '1'){
        $(th).parents('.menu-edit-module').find('.report-form').show();
        $(th).parents('.menu-edit-module').find('.online-form').show();
    }else {
        $(th).parents('.menu-edit-module').find('.report-form').hide();
        $(th).parents('.menu-edit-module').find('.online-form').hide();
    }
}
function report_change(th) {
    var data = $(th).val();
    var option_html = $(th).children();
    $.each(option_html, function (i, x) {
        if($(x).attr('value') === data){
            if($(x).attr('report') === '1'){
                $(th).parents('.menu-edit-module').find('.report-form').show();
                $(th).parents('.menu-edit-module').find('.online-form').show();
                var online_option = $(th).parents('.menu-edit-module').find('.online-form').find('.online').children();
                var report_type_option = $(th).parents('.menu-edit-module').find('.report-type').children();
                if($(x).attr('online') === '1'){
                    $(online_option[0]).attr('selected', true);
                    $(online_option[1]).attr('selected', false)
                }else {
                    $(online_option[1]).attr('selected', true);
                    $(online_option[0]).attr('selected', false)
                }
                if($(x).attr('report_type') === '0'){
                    $(report_type_option[1]).attr('selected', true);
                    $(report_type_option[2]).attr('selected', false)
                }else {
                    $(report_type_option[2]).attr('selected', true);
                    $(report_type_option[1]).attr('selected', false)
                }
                $($(th).parents('.menu-edit-module').find('.menu-type').children()[1]).hide();
                $($(th).parents('.menu-edit-module').find('.menu-type').children()[0]).attr('selected', true)
            }else {
                $($(th).parents('.menu-edit-module').find('.menu-type').children()[0]).hide();
                $($(th).parents('.menu-edit-module').find('.menu-type').children()[1]).attr('selected', true);
                $(th).parents('.menu-edit-module').find('.report-form').hide();
                $(th).parents('.menu-edit-module').find('.online-form').hide();
            };
            $(th).parents('.menu-edit-module').find('[name=menu-name]').val($(x).html())
        }
    })
}

