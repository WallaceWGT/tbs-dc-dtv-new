function get_current_month_first_date(date) {
    /*
    * 根据的时间对象，去获取当月的第一天
    * return: YYYY-mm-dd
    * */
    var new_date;
    if(date){
        new_date = date;
    }else {
        new_date = new Date();
    }

    new_date.setDate(1);
    var month = parseInt(new_date.getMonth());
    var day = new_date.getDate();
    if (month < 10) {
        month = '0' + month
    }
    if (day < 10) {
        day = '0' + day
    }
    return new_date.getFullYear() + '-' + month + '-' + day;
}
function get_current_month_end_date(date) {
    /*
    * 根据的时间对象，去获取当月的最后一天
    * return: YYYY-mm-dd
    * */
    var new_date;
    if(date){
        new_date = date;
    }else {
        new_date = new Date();
    }
    var currentMonth=new_date.getMonth();
    var nextMonth=++currentMonth;
    var nextMonthFirstDay=new Date(new_date.getFullYear(),nextMonth,1);
    var oneDay=1000*60*60*24;
    var lastTime = new Date(nextMonthFirstDay-oneDay);
    var month = parseInt(lastTime.getMonth()+1);
    var day = lastTime.getDate();
    if (month < 10) {
        month = '0' + month
    }
    if (day < 10) {
        day = '0' + day
    }
    return new_date.getFullYear() + '-' + month + '-' + day;
}
function get_current_week_first_date(date) {
    /*
    * 根据的时间对象，去获取当周的第一天
    * return: YYYY-mm-dd
    * */
    var new_date;
    if(date){
        new_date = date;
    }else {
        new_date = new Date();
    }
    var new_day = new_date.getDay() || 7;
    var first_date = new Date(new_date.getFullYear(), new_date.getMonth(), new_date.getDate() + 1 - new_day);
    var month = parseInt(first_date.getMonth()+1);
    var day = first_date.getDate();
    if (month < 10) {
        month = '0' + month
    }
    if (day < 10) {
        day = '0' + day
    }
    return new_date.getFullYear() + '-' + month + '-' + day;
}
function get_current_week_end_date(date) {
     /*
    * 根据的时间对象，去获取当周的最后一天
    * return: YYYY-mm-dd
    * */
    var nowDate;
    if(date){
        nowDate = date;
    }else {
        nowDate = new Date();
    }
    var timestampOfDay = 1000*60*60*24;
    var fullYear = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1; // getMonth 方法返回 0-11，代表1-12月
    var tmp_date = nowDate.getDate();
    function getFullDate(targetDate) {
        var D, y, m, d;
        if (targetDate) {
            D = new Date(targetDate);
            y = D.getFullYear();
            m = D.getMonth() + 1;
            d = D.getDate();
        } else {
            y = fullYear;
            m = month;
            d = tmp_date;
        }
        m = m > 9 ? m : '0' + m;
        d = d > 9 ? d : '0' + d;
        return y + '-' + m + '-' + d;
    }
    var nowDay = nowDate.getDay();
    nowDay = nowDay === 0 ? 7 : nowDay;
    return getFullDate( +nowDate + (7-nowDay)*timestampOfDay );
}
function get_next_month_date(date, month) {
     /*
    * 根据的时间对象，获取下一个月的时间
    * return: YYYY-mm-dd
    * */
    var time = date;
    time.setMonth(time.getMonth() + month);//设置month月后的时间
    var y = time.getFullYear();
    var m = time.getMonth() + 1;//获取当前月份
    var d = time.getDate();
    if (m < 10) {
        m = '0' + m
    }
    if (d < 10) {
        d = '0' + d
    }
    return y + "-" + m;
}
function get_prev_month_date(date,month) {
     /*
    * 根据的时间对象，获取前一个月的时间
    * return: YYYY-mm-dd
    * */
    var time = date;
    time.setMonth(time.getMonth() - month);//设置month月后的时间
    var y = time.getFullYear();
    var m = time.getMonth() + 1;//获取当前月份
    var d = time.getDate();
    if (m < 10) {
        m = '0' + m
    }
    if (d < 10) {
        d = '0' + d
    }
    return y + "-" + m;
}
function get_next_week_date(date) {
     /*
    * 根据的时间对象，获取下一个周的时间
    * return: YYYY-mm-dd
    * */
    var new_date;
    if(date){
        new_date = date
    }else {
        new_date = new Date()
    }
    var oneweekdate = new Date(new_date.getTime()+7*24*3600*1000);
    var y = oneweekdate.getFullYear();
    var m = oneweekdate.getMonth()+1;
    var d = oneweekdate.getDate();
    if (m < 10) {
        m = '0' + m
    }
    if (d < 10) {
        d = '0' + d
    }
    return y+'-'+m+'-'+d;
}
function get_prev_week_date(date) {
     /*
    * 根据的时间对象，获取上一个周的时间
    * return: YYYY-mm-dd
    * */
    var new_date;
    if(date){
        new_date = date
    }else {
        new_date = new Date()
    }
    var oneweekdate = new Date(new_date.getTime()-7*24*3600*1000);
    var y = oneweekdate.getFullYear();
    var m = oneweekdate.getMonth()+1;
    var d = oneweekdate.getDate();
    if (m < 10) {
        m = '0' + m
    }
    if (d < 10) {
        d = '0' + d
    }
    return y+'-'+m+'-'+d;
}
function get_number_next_month_date(date, number) {
    /*
    * 获取后number个月的时间
    * */
    var new_date;
    if(date === 0){
        new_date = new Date()
    }else {
        new_date = date
    }
    new_date.setMonth(new_date.getMonth()+1);
    if (number>0){
        get_number_next_month_date(new_date, number-1)
    }
    var y = new_date.getFullYear();
    var m = new_date.getMonth();
    var d = new_date.getDate();
    if (m < 10) {
        m = '0' + m
    }
    if (d < 10) {
        d = '0' + d
    }
     return y+'-'+m+'-'+d;
}
function get_number_prev_month_date(date, number) {
     /*
    * 获取前number个月的时间
    * */
    var new_date;
    if(date === 0){
        new_date = new Date()
    }else {
        new_date = date
    }
    new_date.setMonth(new_date.getMonth()-1);
    if (number-1>0){
        return get_number_prev_month_date(new_date, number-1)
    }
    var y = new_date.getFullYear();
    var m = new_date.getMonth();
    var d = new_date.getDate();
    if (m < 10) {
        m = '0' + m
    }
    if (d < 10) {
        d = '0' + d
    }
     return y+'-'+m+'-'+d;
}
function get_number_next_week_date(date, number) {
     /*
    * 获取后number个周的时间
    * */
    var new_date;
    if(date === 0){
        new_date = new Date()
    }else {
        new_date = date
    }
    var one_week_date = new Date(new_date.getTime()+7*24*3600*1000);

    if (number-1>0){
        return get_number_next_week_date(one_week_date, number-1)
    }
    var y = one_week_date.getFullYear();
    var m = one_week_date.getMonth()+1;
    var d = one_week_date.getDate();
    if (m < 10) {
        m = '0' + m
    }
    if (d < 10) {
        d = '0' + d
    }
    return y+'-'+m+'-'+d;
}
function get_number_prev_week_date(date, number) {
    /*
    * 获取前number个周的时间
    * */
    var new_date;
    if(date === 0){
        new_date = new Date()
    }else {
        new_date = date
    }
    var one_week_date = new Date(new_date.getTime()-7*24*3600*1000);

    if (number-1>0){
        return get_number_prev_week_date(one_week_date, number-1)
    }
    var y = one_week_date.getFullYear();
    var m = one_week_date.getMonth()+1;
    var d = one_week_date.getDate();
    if (m < 10) {
        m = '0' + m
    }
    if (d < 10) {
        d = '0' + d
    }
    return y+'-'+m+'-'+d;
}
function dt_to_date(date) {
    /*
    * YYYY-mm-dd对象转换成时间对象
    * */
    var y = date.split('-')[0];
    var m = date.split('-')[1]-1;
    var d = date.split('-')[2];
    if(d === undefined){
        d = '01'
    }
    return new Date(y, m, d)
}
function get_next_data() {
    /*
    * 后期下一个日期
    * */
    var current_date = $('#data-filter').val();
    var begin = dt_to_date(current_date.split(' - ')[0]);
    var end = dt_to_date(current_date.split(' - ')[1]);
    var next_begin;
    var next_end;
    var report_type = $('.report-type').attr('report-type');
    if(report_type === '0'){
        next_begin = get_next_week_date(begin);
        next_end = get_next_week_date(end);
    }else {
        next_begin = get_next_month_date(begin,1);
        next_end = get_next_month_date(end, 1);
    }
    $('#data-filter').val(next_begin+' - '+ next_end);
    filter_block_data(next_begin+' - '+ next_end)
}
function get_prev_data() {
    /*
    * 前一个日期
    * */
    var current_date = $('#data-filter').val();
    var begin = dt_to_date(current_date.split(' - ')[0]);
    var end = dt_to_date(current_date.split(' - ')[1]);
    var next_begin;
    var next_end;
    var report_type = $('.report-type').attr('report-type');
    if(report_type === '0'){
        next_begin = get_prev_week_date(begin);
        next_end = get_prev_week_date(end);
    }else {
        next_begin = get_prev_month_date(begin, 1);
        next_end = get_prev_month_date(end, 1);
    }
    $('#data-filter').val(next_begin+' - '+ next_end);
    filter_block_data(next_begin+' - '+ next_end);
}