$(function () {
        init_menu()
    });
    function init_menu() {
        var vid = get_url_param('vid');
        $.each($.find('a'), function (i, x) {
            $(x).parent('dl').removeClass('layui-nav-itemed')
            if ($(x).attr('vid') === vid){
                $(x).parents('dl').parents('li').addClass('layui-nav-itemed');
                $(x).parents('dl').addClass('layui-nav-itemed');
                $(x).parents('dd').addClass('layui-this');
            }
            if(vid === undefined){
                $(x).parents('li').removeClass('layui-nav-itemed')
            }
        });
        $.each($('.month-btn'), function (i, x) {
            if($(x).next('dl').length ===  0){
                $(x).hide()
            }
        });
        $.each($('.week-btn'), function (i, x) {
            if($(x).next('dl').length ===  0){
                    $(x).hide()
                }
        });
    }