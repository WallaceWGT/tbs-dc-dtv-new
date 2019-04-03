$(function () {
   get_user_data();
});

// 权限树生成
function get_visual_permission_tree(th) {
    // 权限树生成
    var uid = $($(th).parents('tr').find('td')[0]).find('div').text();
    $('#permission-tree').attr('uid', uid);
    var alert_html = $('.visual-perm-module').html();
    layer.open({
        type: 1,
        area: ['500px', '400px'],
        shadeClose: true, //点击遮罩关闭
        content: alert_html,
        title:'可视化报表权限'
    });
    var zNodes = [];
    $.ajax({
        method: 'GET',
        url: '/visual/admin/?uid='+uid,
        success: function (arg) {
            $.each(JSON.parse(arg)['data'], function (i, x) {
                zNodes.push(x)
            });
            var zTreeObj;
            var setting={
                check:{
                    enable: true,
                    chkStyle: "checkbox",
                    chkboxType: { "Y": "ps", "N": "ps" }
                }
            };
            $(document).ready(function () {
                zTreeObj = $.fn.zTree.init($(".permission-tree"), setting,  zNodes);
            });
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
    });
}

// 权限提交
function put_permission_info(th) {
    // 提交修改的权限
    var uid = $('#permission-tree').attr('uid');
    var ztree_obj = $.fn.zTree.getZTreeObj('permission-tree');
    var nodes = ztree_obj.getCheckedNodes(true);
    var data = [];
    $.each(nodes, function (i, x) {
        if(x['report'] === 'true'){
            data.push(x['id'])
        }
    });
    $.ajax({
        method: 'PUT',
        url: '/visual/admin/',
        data:{'uid': uid, 'data': JSON.stringify(data)},
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

// 获取用户数据
function get_user_data() {
    // 获取所有的用户数据
    layui.use('table', function () {
        var table = layui.table;
        table.render({
            elem:'#user-table',
            height:600,
            method: 'POST',
            url:'/visual/admin/',
            cols:[[
                {'field': 'id', 'title':'ID', 'sort': true, 'fixed': 'left'},
                {'field': 'username', 'title':'用户名'},
                {'field': 'role_type', 'sort': true, 'title':'角色类型'},
                {'fixed': 'right', 'title':'操作', 'toolbar': '#barDemo'}
            ]],
            parseData: function (res) {
                return{
                    'code': res['code'],
                    'msg': res['msg'],
                    'count': res['data']['count'],
                    'data': res['data']['user_info']
                }
            }
        });
    })
}

// 过滤用户信息
function get_filter_user_data(th) {
   // 过滤用户信息
   var search_val = $(th).val();
   var re_pattern = new RegExp("^[a-z | .\]*"+search_val+"[a-z | .\]*$");
   var tr_html = $('.layui-table-box table tbody').find('tr');
   $.each(tr_html, function (i, x) {
       $(x).show();
       var username = $($(x).find('td')[1]).children().text();
       if(username.match(re_pattern) === null){
           $(x).hide()
       }
   })
}