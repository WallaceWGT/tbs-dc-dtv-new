var tmp_heigh = $('#draggable-wrapper').height(); // 定义全局变量，存储图形变换高度
$(function () {
    position_ini();
    block_data_ini();
    load_filter_date();
    select_ini();
});
function cancel_operate(th) {
    /*
    * 所有的操作取消后进行刷新
    * */
    window.location.reload()
}

// 报表数据块位置渲染
function position_ini() {
    $.each($('.data-block'), function (i, x) {
        var offset_left = $(x).attr('offset-left');
        var offset_top = $(x).attr('offset-top');
        var block_ele_width = $(x).attr('block-ele-width');
        var block_ele_hight = $(x).attr('block-ele-height');
        var body_width=1280;
        var body_height=$('body').height();
        if (offset_left === 'None'){
            $(x).css('z-index', 9999)
        }
        $(x).css({'position': 'absolute', 'left': offset_left*body_width+'px', 'top': offset_top*body_height+'px','float': 'left', 'margin-top': 0, 'display': 'block', 'border': 0, 'width':block_ele_width*body_width+'px', 'height': (block_ele_width*body_width)/block_ele_hight+'px'});
        $(x).children().css({'width': block_ele_width*body_width+'px', 'height': (block_ele_width*body_width)/block_ele_hight+'px'});
        $(x).children().children().css({'width': '100%', 'height': '100%'});
        if($(x).find('.block-show').attr('block_type') === '0'){
            $(x).find('.chart-container').css({'width': block_ele_width*body_width+'px', 'height':(block_ele_width*body_width)/block_ele_hight*0.7+'px'})
        }

    })
}

// 获取数据加上时间过滤
function load_filter_date() {
    var begin;
    var end;
    var tmp_date;
    var report_type = $('.report-type').attr('report-type');
    if(report_type === '0'){
        tmp_date = get_number_prev_week_date(new Date(), 25);
        begin = get_current_week_first_date(new Date(tmp_date.split('-')[0], tmp_date.split('-')[1], tmp_date.split('-')[2]));
        end = get_current_week_end_date();
    }else {
        tmp_date = get_number_prev_month_date(new Date(), 12);
        begin = get_current_month_first_date(new Date(tmp_date.split('-')[0], tmp_date.split('-')[1], tmp_date.split('-')[2]));
        end = get_current_month_end_date();
    }

    if(report_type === '0'){
        laydate.render({
            elem: '#data-filter',
            range: true,
            value: begin+' - '+end,
            change:function(value){
                filter_block_data(value)
            }
        });
    }else {
        laydate.render({
            elem: '#data-filter',
            range: true,
            type: 'month',
            value: begin.slice(0,7)+' - '+end.slice(0, 7),
            done:function(value){
                filter_block_data(value)
            }
        });
    }

}

// 过滤请求发送
function filter_block_data(val) {
    var bid = $('.block-show');
    $.each(bid, function (i, x) {
        $.ajax({
            method:'POST',
            async:false,
            url:'/visual/view',
            data: {'bid': $(x).attr('bid'),'date': val, 'block_type': $(x).attr('block_type')},
            success: function (arg) {
                var data = JSON.parse(arg);
                if (data['code'] === 0){
                    switch (data['data']['block_type']) {
                        case 0:
                            chart_init(data['data'], x);
                            break;
                        case 1:
                            table_init(data['data'], x);
                            break;
                        case 2:
                            break;
                        case 3:
                            data_block_init(data['data'], x);
                            break;
                    }
                }else {
                    console.log('init error')
                }
            }
        })
    });
}

// 获取请求参数
function get_url_param(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r !== null) {
        return unescape(r[2])
    }
}

var vid = get_url_param('vid');

// 加载每一块的数据
function block_data_ini() {
    var block_shows = $('.block-show');
    $.each(block_shows, function (i, block_ele) {
        var bid = $(block_ele).attr("bid");
        var block_type = $(block_ele).attr('block_type');
        $.ajax({
            url:"/visual/view",
            method:"GET",
            async: 'false',
            data:{'vid':vid, 'bid':bid, 'block_type': block_type},
            success:function (arg) {
                var response_data = JSON.parse(arg);
                if (response_data['code'] === 0){
                    switch (JSON.parse(arg)['data']['block_type']) {
                        case 0:
                            chart_init(response_data['data'], block_ele);
                            break;
                        case 1:

                            table_init(response_data['data'], block_ele);
                            break;
                        case 2:
                            break;
                        case 3:
                            data_block_init(response_data['data'], block_ele);
                            break;
                    }
                }else {
                    console.log('init error')
                }
            }
        });
        tmp_heigh += 800; // 每当有新数据块添加就增加一些容器高度
    })
}

// 更新图表时select的初始化
function select_ini() {
    var chart_type = $('.chart-type').attr('chart_type');

    $.each($('.chart-type').children(), function (i, x) {
        if($(x).val() === chart_type){
            $(x).attr('selected', 'true')
        }
    })
}

// 图表数据初始化
function chart_init(data, html_ele) {
    var chart_block_data = {};
    chart_block_data['field_name_cn'] = data['columns_cn'];
    chart_block_data['data'] = data['field_data'];
    chart_block_data['type'] = data['chart_type'];
    chart_block_data['title'] = $(html_ele).next().text();
    var deal_chart_data = chart_data_format(chart_block_data);
    var show_chart = echarts.init($(html_ele).parents('.block-ele').find('.report-chart')[0]);  // bug 生成的是同一个图表容器下进行数据生成
    show_chart.setOption((chart_config(deal_chart_data)));
    // 添加打印时的class属性

}

// 表格数据初始化
function table_init(data, html_ele) {

    var columns=[];
    var table_data = [];
    $(html_ele).parents('.block-ele').find('.layui-card-body').find('.table-block').html('<table class="my-table display" cellpadding="0" cellspacing="0" border="0"></table>');
    $.each(data['columns_cn'], function (i, x) {
        var single_column = {field: x, title: x, sortable: true, filter:{type:null, data: null}};
        // 定义过滤数据
        var tmp_filter_data = [''];
        $.each(data['field_data'], function (j, y) {
            if(tmp_filter_data.indexOf(y[i]) !== -1){
                return true
            }else {
                tmp_filter_data.push(y[i])
            }
        });
        single_column['filter']['type']='select';
        single_column['filter']['data']= tmp_filter_data.sort(function (a, b) { return a-b; });
        columns.push(single_column);

    });
    $.each(data['field_data'], function (j, y) {
        var single_table_data={};
        $.each(data['columns_cn'], function (g, z) {
            single_table_data[z]=y[g];
        });
        table_data.push(single_table_data);
    });
    var table_height = $(html_ele).parents('.block-ele').find('.layui-card-body').height()*0.97;
    $(html_ele).parents('.block-ele').find('.my-table').attr({
        "data-pagination":"true",
        "data-sortable":"true",
        "data-height": table_height,
        "data-page-size": "100",
        "data-filter-control":"true"
    });
    $(html_ele).parents('.block-ele').find('.my-table').bootstrapTable({
        columns:columns,
        data: table_data,
        filter: true
    });
    add_tag_to_table(html_ele)
}

// 给表格添加是筛选按钮
function add_tag_to_table(html_ele) {
    var thead_th = $(html_ele).parents('.block-ele').find('.my-table').find('thead').find('tr').find('th');
    $.each(thead_th, function (i, x) {
        $($(x).find('div')[1]).children().hide();
        $($(x).find('div')[0]).after("<i class=\'fa fa-filter \' style=\'float: right; margin-top: 12px; margin-right: 3px; opacity: 0.2\' onclick=\'get_filter_data(this)\'></i>");
        $($(x).find('div')[0]).css({"display": "inline-block"});
    })
}

// 点击筛选后显示筛选select
function get_filter_data(th) {
    $(th).next().children().show()
}

// 数据块数据初始化
function data_block_init(data, html_ele) {
    // status 状态码，用于判断是否是第一次添加数据块，在过滤的条件下会对其进行重新赋值
    var status = 1;
    var tmp_col = null;
    var tmp_xl = null;
    if(data['columns_cn'].length % 4 === 0){
        tmp_col = 3
    }else if(data['columns_cn'].length % 3 === 0 && data['columns_cn'].length !== 6){
        tmp_col = 4
    }else if(data['columns_cn'].length === 2){
        tmp_col = 6
    }else if(data['columns_cn'].length === 5){
        tmp_col = 0
    }else if(data['columns_cn'].length === 6){
        tmp_col = 2
    }else {
        tmp_col = 2
    }

    $.each(data['columns_cn'], function (i, x) {
        var single_block_html = null;
        if (tmp_col !== 0){
            single_block_html =
                "<div class=\"layui-col-xs12 layui-col-sm"+tmp_col +'\"'+" style='padding: 10px 3px; text-algin: center'>\n" +
                    "<div class='layuiadmin-card-text' style='color: black; padding: 11px; background-color: #"+x[1]+"'"+">"+
                        "<div class=\"layui-text-top\"><i class='layui-icon layui-icon-form'></i>" + x[0] + "</div>\n" +
                        "<p class=\"layui-text-center\" style='font-size: 35px; text-align: center; padding: 3px'>" + data['field_data'][0][i] + "</p>\n" +
                        "<input type='text' class='jscolor' style='display: none' value='"+x[1]+"'"+">"+
                    "</div>"+
                "</div>";
        }else {
            single_block_html =
                "<div class=\"\" style='padding: 10px 3px; text-algin: center; display: inline-block; width: 20%;'>\n" +
                    "<div class='layuiadmin-card-text' style='color: black; padding: 11px; background-color: #"+x[1]+"'"+">"+
                        "<div class=\"layui-text-top\"><i class='layui-icon layui-icon-form'></i>" + x[0] + "</div>\n" +
                        "<p class=\"layui-text-center\" style='font-size: 35px; text-align: center; padding: 3px'>" + data['field_data'][0][i] + "</p>\n" +
                        "<input type='text' class='jscolor' style='display: none' value='"+x[1]+"'"+">"+
                    "</div>"+
                "</div>";
        }
        if (status === 0) {
            $(html_ele).parents('.data-block').find('.layui-card-body').append(single_block_html)
        } else {
            // 时间过滤时，先对其内的html内容清空,再对其进行添加
            $(html_ele).parents('.data-block').find('.layui-card-body').html('');
            $(html_ele).parents('.data-block').find('.layui-card-body').append(single_block_html);
            status = 0
        }
        // 数据加载完毕, 加载jscolor插件
        var script = document.createElement("script");
        script.type="text/javascript";
        script.src="../../static/report/plugin/jscolor-2.0.5/jscolor.js";
        document.body.appendChild(script)
    })
}
// 根据数据获取对应图表类型的series
function chart_data_format(chart_data) {
    /*
    * 功能：根据需要的图表形式, 将后端传送过来的数据结构进行解析，使数据格式符合图表的数据格式
    * chart_data: 后端数据格式{'type':1, 'title':[], data:[[1,], [2,], [3,]]}
    * type:表示图表样式,
    * title: 表示的是查询字段的标题一般来说
    * data:数据库查询的数据(一般为二维数组)
    * */
    var option;
    // 折线图
    function line_chart(chart_data) {
        var option;
        var option_xAxis_data = [];
        var option_series = [];
        var option_legend={'data':[]};
        $.each(chart_data['field_name_cn'], function (i, x) {
            var single_series = {'type':'line', 'data':[], 'name':x, 'center': ['20%', '50%']};
            $.each(chart_data['data'], function (j, y) {
                if($.inArray(y[0], option_xAxis_data)!==-1){
                }else {
                    option_xAxis_data.push(y[0]);
                }
               if(i===0){
                   return false
               }else {
                   single_series['data'].push(y[i])
               }
            });
            if(i===0){
                return true
            }else {
                option_legend['data'].push(x);
                option_series.push(single_series)
            }

        });
        option={
            'title':{
                'text':''
            },
            'legend':option_legend,
            'xAxis': {
                'data':option_xAxis_data
            },
            'series':option_series,
            'tooltip':{
                'trigger':'axis',
                'axisPointer':{
                    type:'cross'
                }
            }
        };
        return option
    }

    // 柱形图
    function bar_chart(chart_data) {
        var option;
        var option_xAxis_data = [];
        var option_series = [];
        var option_legend={'data':[]};
        $.each(chart_data['field_name_cn'], function (i, x) {
            var single_series = {'type':'bar', 'data':[], 'name':x, 'center': ['20%', '50%']};
            $.each(chart_data['data'], function (j, y) {
                if($.inArray(y[0], option_xAxis_data)!==-1){
                }else {
                    option_xAxis_data.push(y[0]);
                }
               if(i===0){
                   return false
               }else {
                   single_series['data'].push(y[i])
               }
            });
            if(i===0){
                return true
            }else {
                option_legend['data'].push(x);
                option_series.push(single_series)
            }

        });
        option={
            'title':{
                'text':''
            },
            'legend':option_legend,
            'xAxis': {
                'data':option_xAxis_data
            },
            'series':option_series,
            'tooltip':{
                'trigger':'axis',
                'axisPointer':{
                    type:'cross'
                }
            }
        };
        return option

    }

    // 雷达图
    function radar_chart(chart_data) {
        var legend_data=[];
        var indicator_data=[];
        var option_series=[];
        $.each(chart_data['data'], function (i, x) {
            option_series.push({name: x[0], value:x.slice(1)});
            if(i === 0){
                legend_data.push(x)
            }else{
                return true
            }
        });
        $.each(chart_data['field_name_cn'], function (j, y) {
           if(j === 0){
               return true
           }else {
               var tmp_data = [];
               $.each(chart_data['data'], function (g, z) {
                   if (g===0){
                       return true
                   }else {
                       tmp_data.push(z[j])
                   }
               });
               indicator_data.push({name:y, max:Math.max.apply(null, tmp_data)})
           }
        });



        // 定义雷达图option参数
        option={
            'title':{
                'text':''
            } ,
            legend:{
                data:legend_data
            },
            tooltip:{
                 trigger:'item'
            },
            radar:{
                name:{
                    textStyle:{
                        color:'#fff',
                        backgroundColor: '#999',
                        borderRadius:3,
                        padding:[3,5]
                    }
                },
                indicator:indicator_data
            },
            series:[{
                'name': 'test',
                'type':'radar',
                'data':option_series

            }]
        };
        return option
    }

    // 饼图
    function pie_chart(chart_data) {
        var option;
        var option_legend_data = [];
        var option_series = [{
            'name':chart_data['title'],
            'type':'pie',
            'radius':'55%',
            'center':['50%', '60%'],
            'data':[]
        }];
        $.each(chart_data['field_name_cn'], function (i, x) {
            var single_series = {'name':x, 'value':null};
            single_series['value']=chart_data['data'][0][i];
            option_series[0]['data'].push(single_series);
            option_legend_data.push(x);
        });
        option= {
            'title':{
                'text':''
            } ,
            'legend': {
                'data':option_legend_data
            },
            'series':option_series,
            'tooltip':{
                trigger:'item'
            }
        };

        return option
    }

    // 漏斗图
    function funnel_chart(chart_data) {
        var option;
        var option_title_text = chart_data['title'];
        var option_legend_data = [];
         var option_series = [{
            'name':chart_data['title'],
            'type':'funnel',
            'data':[]
        }];
        $.each(chart_data['field_name_cn'], function (i, x) {
            var single_series = {'name':x, 'value':null};
            single_series['value']=chart_data['data'][0][i];
            option_series[0]['data'].push(single_series)
        });
        option={
            'title':{
                'text':option_title_text
            } ,
            'legend': {
                'data':option_legend_data
            },
            'series':option_series,
            'tooltip':{
                trigger:'item'
            }

        };
        return option
    }

    switch (chart_data['type']) {
        case 0:
            option = line_chart(chart_data);
            break;
        case 1:
            option = bar_chart(chart_data);
            break;
        case 2:
            option = pie_chart(chart_data);
            break;
        case 3:
            option = radar_chart(chart_data);
            break;
        case 4:
            option = funnel_chart(chart_data);
            break;

    }
    return option;
}
// 图表默认配置
function chart_config(option) {
    option['grid']={};
    if(option['series'][0]['type']==='line'){
        option['title']['left']=40;
        option['grid']['left']='10%';
        option['trigger']='axis';
        option['toolbox']=
            {
                'show': true,
                'feature':
                    {
                        'magicType':{'show':true, 'type':['line', 'bar', 'stack', 'tiled']}
                    },
                'restore':{'show':true},
                'saveAsImage':{'show':true},
                'top': 0,
                'right': '4%'
            };
        option['yAxis'] = [{'type': 'value'}]
    }else if(option['series'][0]['type'] === 'bar'){
        option['title']['left']=40;
        option['grid']['left']='10%';
        option['toolbox']=
            {
                'show': true,
                'feature':
                    {
                        'magicType':{'show':true, 'type':['line', 'bar', 'stack', 'tiled']}
                    },
                'restore':{'show':true},
                'saveAsImage':{'show':true},
                'top': 0,
                'right': '4%'
            };
        option['yAxis'] = [{'type': 'value'}]
    }
    else{
        return option
    }
    return option
}

// 图像编辑模式
function enter_edit_mode(th) {
    // 进入编辑模式时先创建高度
    $("#draggable-wrapper").height(tmp_heigh);
    $('.block-edit-btn').show();
    $('.block-del-btn').show();
    $('.jscolor').show();
    $(th).hide();
    $(th).next().show();
    $.each($('.data-block'), function (i, x) {
        $(x).draggable({
            distance: 1,
            grid:[5,5],
            containment:'#draggable-wrapper'
        });
        // 定位变更
        $(x).css('position', 'absolute');
        var alsoResizeEle = [$(x)];
        $(x).find('.block-ele').addClass('ui-widget-content');
        $(x).find('.block-ele').resizable({
            grid: 5,
            alsoResize: alsoResizeEle,
            containment: '#draggable-wrapper'
        })

    })
}
// 保存图表位置信息
function save_edit(th) {
    var body_width=1280;
    var body_height=$('body').height();

    $.each($('.data-block'), function (i, x) {
        var block_type = $(x).find('.block-show').attr('block_type');
        if(block_type){
            var block_position_info = {
                'position': 1,
                'bid': $(x).find('.block-show').attr('bid'),
                'block_type': block_type,
                'block_offset_top': $(x).css('top').split('px')[0]/body_height,
                'block_offset_left': $(x).css('left').split('px')[0]/body_width,
                'block_ele_width': ($(x).children().css('width').split('px')[0]/body_width),
                'block_ele_height':$(x).children().css('width').split('px')[0]/$(x).children().css('height').split('px')[0],
                'block_chart_width': null,
                'block_chart_height': null,
                'data_block_background_color':''
            };
            if(block_type === '0'){
                block_position_info['block_chart_width'] = $(x).find('.report-chart').width()/body_width;
                block_position_info['block_chart_height'] = $(x).find('.report-chart').height()/body_height;
            }
            if(block_type === '3'){
                $.each($(x).find('.layui-card-body').children(), function (i, y) {
                    block_position_info['data_block_background_color'] += ',';
                    block_position_info['data_block_background_color'] += $(y).find('.jscolor').val()
                })
            }
            $.ajax({
                method:'POST',
                async:false,
                url:'/visual/report_block_setting',
                data:block_position_info,
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
            });
        }
    })
}

// 添加数据块弹窗
function add_report_block_modal(th) {
    var report_type_html = $('.public-modal').find('[name=report_type]');
    var report_type = $(report_type_html).attr('report-type');
    $.each($(report_type_html).children(), function (i, x) {
       if($(x).attr('value') === report_type) {
           $(x).attr('selected', true)
       }else {
           $(x).hide();
           $(x).attr('selected', false)
       }

    });

    var alert_html = $('.public-modal').html();
    layer.open({
        type: 1,
        area: ['600px', '600px'],
        shadeClose: true, //点击遮罩关闭
        content: alert_html,
        title:'新增图表'
    });
}

// 添加数据请求
function add_report_submit(th) {
    var add_block_data={};
    var add_block_form = $(th).parent().prev().find('form').serializeArray();
    var block_type = {'block_type': $(th).parent().prev().find('[name=block_type]').val()};
    var date_type = $(th).parent().prev().find('[name=date_type]').val();
    var vid = get_url_param('vid');
    $.each(add_block_form, function (i, x) {
        add_block_data[this.name]=this.value
    });
    add_block_data['vid'] = vid;
    add_block_data['block_type'] = block_type['block_type'];
    add_block_data['date_type'] = date_type;
    $.ajax({
        method: 'PUT',
        url: '/visual/block_setting/',
        data:add_block_data,
        success:function (arg) {
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

// 更新数据块弹窗
function update_report_block_modal(th) {
    var bid = $(th).parents(".block-ele").find('.block-show').attr('bid');
    var block_type = $(th).parents(".block-ele").find('.block-show').attr('block_type');
    if(block_type === "0"){
        $.each($('.update-chart-modal'), function (i,x) {
            if($(x).attr('bid') === bid){
                var chart_type = $(x).find('.chart-type').attr('chart_type');
                $.each($(x).find('.chart-type').children(), function (j, y) {
                   if($(y).attr('value') === chart_type){
                       $(y).attr('selected', true)
                   }else {
                       $(y).attr('selected', false)
                   }
                });

                 layer.open({
                    type: 1,
                    area: ['600px', '600px'],
                    shadeClose: true, //点击遮罩关闭
                    content: $(x).html(),
                    title:'数据更新'
                 });
                 return false
            }else {
                return true
            }
        })
    }else if(block_type === "1"){
        $.each($('.update-table-modal'), function (i,x) {
            if($(x).attr('bid') === bid){
                 layer.open({
                    type: 1,
                    area: ['600px', '500px'],
                    shadeClose: true, //点击遮罩关闭
                    content: $(x).html(),
                    title:'数据更新'
                 });
                 return false
            }else {
                return true
            }
        })

    }else if(block_type === "2"){
        $.each($('.update-text-modal'), function (i,x) {
            if($(x).attr('bid') === bid){
                 layer.open({
                    type: 1,
                    area: ['600px', '500px'],
                    shadeClose: true, //点击遮罩关闭
                    content: $(x).html(),
                    title:'数据更新'
                 });
                 return false
            }else {
                return true
            }
        })

    }else{
        $.each($('.update-data-block-modal'), function (i,x) {
            if($(x).attr('bid') === bid){
                 layer.open({
                    type: 1,
                    area: ['600px', '650px'],
                    shadeClose: true, //点击遮罩关闭
                    content: $(x).html(),
                    title:'数据更新'
                 });
                 return false
            }else {
                return true
            }
        })

    }
}

// 更新数据请求
function update_report_submit(th) {
    var add_block_data={};
    var add_block_form = $(th).parent().parent().find('form').serializeArray();
    var block_type = {'block_type': $(th).parent().prev().find('[name=block_type]').val()};
    var vid = get_url_param('vid');
    $.each(add_block_form, function (i, x) {
        add_block_data[this.name]=this.value
    });
    add_block_data['vid'] = vid;
    add_block_data['block_type'] = block_type['block_type'];
    add_block_data['position'] = 0;
    $.ajax({
        method: 'POST',
        url: '/visual/block_setting/',
        data:add_block_data,
        success:function (arg) {
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
                yes: function (index, layero) {
                    layer.close(index);
                    window.location.reload()
                }
            })
        }
    })
}

// 删除数据弹窗
function del_report_block_modal(th) {
    var alert_modal_html = $('.delete-modal');
    alert_modal_html.find('input').attr('value', $(th).parents('.block-ele').find('[name=bid]').attr('bid'));
    layer.open({
        type: 1,
        area: ['300px', '200px'],
        shadeClose: true, //点击遮罩关闭
        content: alert_modal_html.html(),
        title:'数据删除'
    });
}

// 删除数据请求
function del_report_block_submit(th) {
    $.ajax({
        method:'DELETE',
        url: '/visual/block_setting/',
        data: $(th).parent().find('[name=bid]').val(),
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

// 弹窗select选择变换
function select_report_block_type(th) {
    var public_modal = $(th).parent().next();
    switch ($(th).val()) {
        case '0':
            var chart_modal_html = $('.chart-modal')[0];
            public_modal.html(chart_modal_html);
            public_modal.parent().find('.chart-modal').css('display', 'inline-block');
            break;
        case '1':
            var table_modal_html = $('.table-modal')[0];
            public_modal.html(table_modal_html);
            public_modal.parent().find('.table-modal').css('display', 'inline-block');
            break;
        case '2':
            var text_modal_html = $('.text-modal')[0];
            public_modal.html(text_modal_html);
            public_modal.parent().find('.text-modal').css('display', 'inline-block');
            break;
        case '3':
            var data_block_modal_html = $('.data-block-modal')[0];
            public_modal.html(data_block_modal_html);
            public_modal.parent().find('.data-block-modal').css('display', 'inline-block');
            break;
    }

    $.each($('.row'), function (i, x) {
        var data_block_offset = $(x).offset();
    })
}

