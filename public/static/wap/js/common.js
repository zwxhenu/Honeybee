var baseUrl = baseUrl || location.protocol + '//' + location.host,
    shop_url = '/m/' + shop_id + '/';
	
//解决gif图片问题
function setGifImg() {
    $("img").each(function(){
        var cur_src = $(this).attr("src");
        if(cur_src)
        {
            var gif_res = cur_src.indexOf('.gif');
            if(gif_res > -1)
            {
                $(this).css('width','auto');
            }
        }
    });
}
	
function getUrl(path) {
    return baseUrl + shop_url + path;
}
// 短信验证码
function smsCode(data, callback) {
    mobile = data.mobile || '';
    if (mobile == '' || !mobile.match(/^[(86)|0]?(1\d{10})$/)) {
        return false;
    }
    $.post(getUrl('?c=captcha&a=sms_captcha'), data, function (res) {
        return callback && callback.call(this, res);
    }, 'json');

}
function tip(msg, time) {
    var $tpl = $('#alertBox');
    if ($tpl.length <= 0) {
        $tpl = $('<div id="tipBox" class="msg-dialog"><div class="msg-dialog-inner"><div class="content content-tip j-msg"></div></div></div>');
        $tpl.hide();
        $('body').append($tpl);
    }
    $tpl.find('.j-msg').html(msg);
    $tpl.fadeIn();
    time = time || 1000;
    setTimeout(function () {
        $('#tipBox').fadeOut();
    }, time);
}
// 重置系统方法
function alert(msg, btnText) {
    var $tpl = $('#alertBox');
    if ($tpl.length <= 0) {
        $tpl = $('<div id="alertBox" class="msg-dialog"><div class="msg-dialog-inner"><div class="content j-msg"></div><div class="btn-container"><button onclick="$(\'#alertBox\').hide();" class="msg-btn j-ok btn-single">确定</button></div></div></div>');
        $tpl.hide();
        $('body').append($tpl);
    }
    btnText = btnText || '确定';
    $tpl.find('.j-ok').text(btnText);
    $tpl.find('.j-msg').html(msg);
    $tpl.fadeIn();
}
function confirm(msg, okFunc, cancelFunc, okText, cancelText) {
    if (!msg) {
        return false;
    }
    var okText = okText || '确定';
    var cancelText = cancelText || '取消';
    var $tpl = $('#confirmBox');
    if ($tpl.length <= 0) {
        $tpl = $('<div id="confirmBox" class="msg-dialog"><div class="msg-dialog-inner"><div class="content j-msg"></div><div class="btn-container"><button class="msg-btn j-ok btn-double">' + okText + '</button><button class="msg-btn j-concel btn-double">' + cancelText + '</button></div></div></div>');
        $tpl.hide();
        $('body').append($tpl);
    }
    $tpl.find('.j-msg').html(msg);
    $tpl.find('.j-ok').off('click').click(function () {
        $tpl.fadeOut();
        okFunc && okFunc.call(this);
    });
    $tpl.find('.j-concel').off('click').click(function () {
        $tpl.fadeOut();
        cancelFunc && cancelFunc.call(this);
    });
    $tpl.fadeIn();
}

function getQuery(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);  //获取url中"?"符后的字符串并正则匹配
    return (r && r[2]) || '';
}
//倒计时
function countdown(timestamp, callback) {
    if ((timestamp + '').length < 13) {
        timestamp *= 1000;
    }
    var cur = new Date().getTime(),
        ts = (timestamp - cur) / 1000,//秒
        day = 0, hour = 0, min = 0, sec = 0;
    if (isNaN(ts) || ts <= 0) {
        return false;
    }
    var inter = setInterval(function () {
        if (isNaN(ts) || ts <= 0) {
            clearInterval(inter);
            callback && callback.call(this, false);
            return false;
        }
        day = parseInt(ts / 60 / 60 / 24, 10);//计算剩余的天数
        hour = parseInt(ts / 60 / 60 % 24, 10);//计算剩余的小时数
        min = parseInt(ts / 60 % 60, 10);//计算剩余的分钟数
        sec = parseInt(ts % 60, 10);//计算剩余的秒数
        var result = {day: day, hour: hour, min: min, sec: sec}
        ts--;
        callback && callback(result);
    }, 1000);
    day = parseInt(ts / 60 / 60 / 24, 10);//计算剩余的天数
    hour = parseInt(ts / 60 / 60 % 24, 10);//计算剩余的小时数
    min = parseInt(ts / 60 % 60, 10);//计算剩余的分钟数
    sec = parseInt(ts % 60, 10);//计算剩余的秒数
    var result = {day: day, hour: hour, min: min, sec: sec}
    callback && callback(result);
    return true;
}
/**
 *
 * @param $wrap 商品列表容器
 * @param url 请求的地址
 * @param data 请求的数据
 * @param per_page 每页数量
 */
function getGoods($wrap, shop_id, data, per_page) {
    $wrap = $wrap || $('#goods');
    per_page = per_page || 10;
    var $tpl = $wrap.find('.j-tpl'),
        pageNum = 1,
        cookieOption = {};
    //记录滚动位置
    $(window).on('scroll', function () {
        $.cookie && $.cookie('goods_scroll_top', $(window).scrollTop(), cookieOption);
    });
    $wrap.loadMore({
        url: '/m/' + shop_id + '/product/get',
        data: data,
        pageSize: per_page,// 每页的数量
        success: function (res) {
            var i, len = res.data.length;
            for (i = 0; i < len; i++) {
                var $item = $tpl.clone(), pro = res.data[i];
                $item.removeClass('hide j-tpl');
                $item.find('.goods-link').attr('href', '/m/' + shop_id + '/product/' + pro.product_id);
                $item.find('.goods-thumb img').attr('data-original', pro.main_pic);
                $item.find('.goods-name').text(pro.name);
                $item.find('.goods-price').text(pro.min_price);
				if (pro.is_show_cart) {
					$item.find('.j-addCart').attr('data-id', pro.product_id).attr('data-src', pro.main_pic).attr('data-direct-buy', pro.is_presale);
				} else {
					$item.find('.j-addCart').remove();
				}
                $tpl.before($item);
            }
            $('img').lazyload({threshold: 200});
            //滚动到指定位置
            var pageScroll = $.cookie ? parseInt($.cookie('goods_scroll_top'), 10) : 0;
            if (!isNaN(pageScroll) && pageNum == 1) {
                $(window).scrollTop(pageScroll).scroll();
            }
            $.cookie && $.cookie('goods_page_num',pageNum, cookieOption);
            pageNum++;
        }
    });
}

/**
 *
 * @param $wrap 商品列表容器
 * @param url 请求的地址
 * @param data 请求的数据
 * @param per_page 每页数量
 */
function getGoodsGroup($wrap, shop_id, data, per_page) {
    $wrap = $wrap || $('#goods');
    per_page = per_page || 10;
    var $tpl = $wrap.find('.j-tpl'),
        pageNum = 1;
    $wrap.loadMore({
        url: '/m/' + shop_id + '/product/get',
        data: data,
        pageSize: per_page,
        success: function (res) {
            var i, len = res.data.length;
            for (i = 0; i < len; i++) {
                var $item = $tpl.clone(), pro = res.data[i];
                if(pro.min_price){
                    $item.removeClass('hide j-tpl');
                    $item.find('.img_name_p1').attr('href', '/m/' + shop_id + '/product/' + pro.product_id);
                    if(pro.stock_num == 0){
                        $item.find('.soldout').css("display","block");
                    }
                    $item.find('.product_pic').attr('src', pro.main_pic);
                    $item.find('.img_name_p1').text(pro.name);
                    $item.find('.img_name_l').text("￥" + pro.min_price);
                    if (pro.is_show_cart) {
                        $item.find('.j-addCart').attr('data-id', pro.product_id).attr('data-src', pro.main_pic).attr('data-direct-buy', pro.is_presale);
                    } else {
                        $item.find('.j-addCart').remove();
                    }
                    $tpl.before($item);
                }
            }
            $('img').lazyload({threshold: 200});
            pageNum++;
            //解决商品重新加载重新刷新isscroll插件
            loaded();
        }
    });
}

/**
 *
 * @param $wrap 商品列表容器
 * @param url 请求的地址
 * @param data 请求的数据
 * @param per_page 每页数量
 */
function getGoodsNew($wrap, shop_id, data, per_page) {
    $wrap = $wrap || $('#goods');
    per_page = per_page || 10;
    var $tpl = $wrap.find('.j-tpl'),
        pageNum = 1;
    $wrap.loadMore({
        url: '/m/' + shop_id + '/product/get',
        data: data,
        pageSize: per_page,
        success: function (res) {
            var i, len = res.data.length;
            for (i = 0; i < len; i++) {
                var $item = $tpl.clone(), pro = res.data[i];
                $item.removeClass('hide j-tpl');
                $item.find('.small_name').attr('onclick', "location.href = '/m/" + shop_id + '/product/' + pro.product_id + "'");
                $item.find('.small_img').attr('onclick', "location.href = '/m/" + shop_id + '/product/' + pro.product_id + "'");
                if(pro.stock_num == 0){
                    $item.find('.soldout').css("display","block");
                }
                $item.find('.product_pic').attr('src', pro.main_pic);
                $item.find('.small_name').text(pro.name);
                $item.find('.small_name_l').text("￥" + pro.min_price);
                if (pro.is_show_cart) {
                    $item.find('.j-addCart').attr('data-id', pro.product_id).attr('data-src', pro.main_pic).attr('data-direct-buy', pro.is_presale);
                } else {
                    $item.find('.j-addCart').remove();
                }
                $tpl.before($item);
            }
            $('img').lazyload({threshold: 200});
            pageNum++;
        }
    });
}

/**
 *
 * @param $wrap 充值记录列表容器
 * @param url 请求的地址
 * @param data 请求的数据
 * @param per_page 每页数量
 */
function getRechargeDetails($wrap, shop_id, data, per_page) {
    $wrap = $wrap || $('#recharge');
    per_page = per_page || 10;
    var $tpl = $wrap.find('.j-tpl'),
        pageNum = 1;
    $wrap.loadMore({
        url: '/m/' + shop_id + '/recharge/get',
        data: data,
        pageSize: per_page,// 每页的数量
        success: function (res) {
            var i, len = res.data.length;
            for (i = 0; i < len; i++) {
                var $item = $tpl.clone(), pro = res.data[i];
                $item.removeClass('hide j-tpl');
                if(pro.type == 1){
                    pro.type = '支付宝';
                }else if(pro.type == 2){
                    pro.type = '微信';
                }else if(pro.type == 3){
                    pro.type = '百度钱包';
                }else{
                    pro.type = '其它';
                }
                $item.find('.payment_type').html(pro.type);
                $item.find('.payment_number').html(pro.money);
                $item.find('.payment_no').html("流水号："+pro.trade_no);
                $item.find('.payment_time').html(pro.handled_at);
                $tpl.before($item);
            }
            pageNum++;
        }
    });
}

/**
 *
 * @param $wrap 提现记录列表容器
 * @param url 请求的地址
 * @param data 请求的数据
 * @param per_page 每页数量
 */
function getApplyDetails($wrap, shop_id, data, per_page) {
    $wrap = $wrap || $('#apply');
    per_page = per_page || 8;
    var $tpl = $wrap.find('.j-tpl'),
        pageNum = 1;
    $wrap.loadMore({
        url: '/m/' + shop_id + '/apply/get',
        data: data,
        pageSize: per_page,
        success: function (res) {
            var i, len = res.data.length;
            for (i = 0; i < len; i++) {
                var $item = $tpl.clone(), pro = res.data[i];
                $item.removeClass('hide j-tpl');

                $item.find('.bk14').html(pro.card_info.bank_area);
                $item.find('.fs14').html("￥"+pro.money);
                $item.find('.record_col1').html(pro.handled_at);

                if(pro.status==3||pro.status==7){
                    $item.find('.failCol').remove();
                }else if(pro.status==2||pro.status==4||pro.status==6||pro.status==8){
                    $item.find('.sucCol').remove();
                    $item.find('.failure_reason').html(pro.handled_remark?"失败原因："+pro.handled_remark:"失败原因：未填写");
                }else{
                    continue;
                }
                $tpl.before($item);
            }
            pageNum++;
        }
    });
}
/**
 * 商品搜索
 * @param name
 * @returns {boolean}
 */
function searchGoods(name) {
    if (!name) {
        return false;
    }
    location = '/m/' + shop_id + '/product?name=' + name;
}

function ad() {
    if (!window.adPosition) {
        return false;
    }
    $.get(getUrl('page/ad?ad=1'), function (res) {
        if (window.adPosition == 'footer') {
            $('#hook_bottom').html(res);
        } else {
            $('#hook_top').html(res);
        }
        carousel();
		setGifImg();
    });
}

function carousel() {
    if ($('.j-carousel').length > 0) {
        var swiper = new Swiper('.j-carousel', {
            pagination: '.swiper-pagination',
            paginationClickable: true,
            autoplay: 2000,
            loop: true
        });
    }
}

$(function () {
    $(".j-sub-nav").click(function () {
        var $sub = $(this).siblings('.bottom-sub-nav');
        $('.bottom-sub-nav:visible').not($sub).slideToggle(100);
        $sub.slideToggle(200);
    });
    //商品分组
    $('.j-goods-group').each(function () {
        var $nav = $(this).find('.goods-group-menu'),
            $goods = $(this).find('.goods-wrap');
        $nav.find('li').click(function () {
            var i = $(this).index();
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
            $goods.find('.goods').addClass('hide');
            $goods.find('.goods').eq(i).removeClass('hide');
        });
    });
    $('.j-goods-group .goods-group-menu li:eq(0)').click();
    //商品搜索
    $(".search_cont_box .search_input_item").on('keydown', function (e) {
        if (e.keyCode == 13) {
            searchGoods($(this).val());
        }
    });
    $(".search_cont_box .search_icon").on('click', function () {
        searchGoods($(this).siblings('.search_input_item').val());
    });
    //轮播图
    carousel();
    //购物车
    if ($.shopCart) {
        $.shopCart();
    }
    if ($('.j-cartTotal').length > 0) {
        $.getJSON(getUrl('cart/num'), function (res) {
            if(res.data>99){
                res.data = '99+';
                $('.j-cartTotal').css('width','1.1rem');
            }
            $('.j-cartTotal').text(res.data);
        });
    }
    //访问统计
    visit_log(supplier_id,2,user_id,product_id);

    //底部导航
    var aLis = $('.footerNav_ul li.footerNav_on'), aTanCeng = $('.footerNav_order1');
    aLis.each(function($k){
        var index = $(this).index();
        var showLi = $('.sel_1');
        $(this).bind('click',function(){
            showLi = $('.sel_'+index);
            if(showLi.attr('display') == "no"){
                aTanCeng.hide();
                aTanCeng.attr({'display':"no"});
                showLi.show();
                showLi.attr({'display':"yes"});
            }else{
                aTanCeng.hide();
                aTanCeng.attr({'display':"no"});
            }
            var oLiW = $(this).width()*(index+1);
            var oDivW = showLi.width();
            /*
            if(showLi.index() == 3){
                $('.icon_3').css({'marginLeft':0,'left':oDivW - ($(this).width()/2)});
                showLi.css({'right':0});
            }else{
                showLi.css({'left':oLiW-($(this).width()/2)-oDivW/2});
            }
            */
            // if(showLi.index() == 1){
            //     showLi.css({'left':0});
            // }else if(showLi.index() == 4){
            //     showLi.css({'right':0});
            // }else{
                showLi.css({'left':oLiW-($(this).width()/2)-oDivW/2});
            // }
        });
    });

    //富文本图片展示问题
    $('.rich-text').find('img').each(function () {
        if($(this).attr('alt')){
            $(this).css('width','100%');
        }
    });

    //富文本图片展示问题
    $('.rich-text').find('iframe').each(function () {
        //var userAgent = navigator.userAgent;
        //var innerStr = '<video id="tenvideo_video_player_0" width="100%" height="100%" x-webkit-airplay="true" webkit-playsinline="" playsinline="true" preload="none" poster="http://i.gtimg.cn/qqlive/images/20150608/black.png" src="http://220.181.91.23/vhot2.qqvideo.tc.qq.com/k0340tgt1ha.mp4?vkey=4244236495E5F8111F9736469ECD6A3A292121D6BAA381E0F59FAC92F546460F4D547FA45EBEDC0ECB37845B8894C6BD329AEE98C6B457C52FAC320F1D75085B4A4A775624C47314D57CD360549310C109736C3CEE27994D&amp;br=60&amp;platform=2&amp;fmt=auto&amp;level=0&amp;sdtfrom=v3010&amp;guid=32fab49694e630e1ad97721b3ce26d75"></video>';
        //$(this).contents().find("body").html(innerStr);
    });
});