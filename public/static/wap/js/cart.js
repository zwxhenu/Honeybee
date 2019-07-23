/**
 * 购物车 示例：$.shopCart({selector:'.j-addCart'});
 * 直接购买按钮需要在选择器上加data-order=1属性，配置项中directBuyCallBack存在时data-order可为空
 *
 */
$.shopCart = function (option) {
    var defaultOption = {
            container: '#cartContainer',// 购物车容器
            selector: '.j-addCart',
            tplUrl: getUrl('cart/tpl'),//购物车模版url
            proStockUrl: getUrl('stock'),//获取商品库存信息地址
            addCartUrl: getUrl('cart/add'),//加入购物车地址
            settleUrl: getUrl('cart'),//结算地址
            makeOrderUrl: getUrl('orderInfo/'),//下单地址
            directBuyCallBack: null,//直接购买回调地址
            afterCall: null//库存加载完以后回调函数
        },
        isLoadedTpl = false,// 是否已加载模版
        proID = 0,
        proLimitNum = 0,//商品限购数量
        boughtNum,//已购买数量
        maxStock = 0,// 最大库存
        stockObj = [];// 库存信息
    option = $.extend(defaultOption, option);
    // 加载购物车模版
    function loadTpl() {
        $.get(option.tplUrl, function (res) {
            $('body').append(res);
            isLoadedTpl = true;
            cartInit();
        });
    }

    function cartInit() {
        var $num = $('.j-buyNum', option.container);
        var $jgt = $('.j-g-t', option.container);
        // 关闭事件
        $('.j-close', option.container).click(function () {
            closeCart();
        });
        // 修改数量
        $(".j-decrease", option.container).click(function () {
            var num = $num.val();
            num = num * 1 - 1;
            if (num < 1) {
                num = 1;
            }
            $num.val(num);
        });
        $(".j-increase", option.container).click(function () {
            var num = $num.val();
            num = num * 1 + 1;
            if (proLimitNum && proLimitNum > 0 && (num + boughtNum) > proLimitNum) {
                alert('该商品限购' + proLimitNum + '件');
                num = proLimitNum - boughtNum;
            }
            if (num > maxStock) {
                alert('库存不足');
                num = maxStock;
            }
            $num.val(num);
        });
        $(".j-buyNum", option.container).change(function () {
            var num = $num.val();
            num = num * 1;
            if (proLimitNum && proLimitNum > 0 && (num + boughtNum) > proLimitNum) {
                alert('该商品限购' + proLimitNum + '件');
                num = proLimitNum - boughtNum;
            }
            if (num > maxStock) {
                alert('库存不足');
                num = maxStock;
            }
            $num.val(num);
        });
        // 加入购物车
        $('#cartBtnContainer .JS-addBasket', option.container).click(function () {
            if (proLimitNum > 0 && boughtNum >= proLimitNum) {
                alert('已达到购买限制');
                return false;
            }
            var num = parseInt($num.val(), 10),
                curSku = '',
                skuID = 0,
                toSettle = $(this).attr('data-settle');
            if (isNaN(num) || num <= 0) {
                alert('请选择购买商品数量');
                return false;
            }
            if (maxStock <= 0) {
                alert('销售太火爆，库存不足');
                return false;
            }
            if (proLimitNum && proLimitNum > 0 && num > proLimitNum) {
                alert('该商品限购' + proLimitNum + '件');
                $num.val(proLimitNum);
                return false;
            }
            $('.on', option.container).each(function (i) {
                if (i == 0) {
                    curSku += $(this).text();
                }
                else {
                    curSku += '_' + $(this).text();
                }
            });
            skuID = stockObj[curSku] ? stockObj[curSku]['sku_id'] : 0;
            if (!skuID) {
                alert('请选择商品规格');
                return false;
            }
            //直接购买
            if ($(this).attr('data-order') == 1) {
                if (typeof option.directBuyCallBack == 'function') {
                    var param = {skuID: skuID, num: num};
                    option.directBuyCallBack.call(this, param);
                    return true;
                }
                var jgt = $jgt.val();
                if(jgt)
                {
                    location = option.makeOrderUrl + skuID + '_' + num + '_' + jgt;
                }
                else
                {
                    location = option.makeOrderUrl + skuID + '_' + num;
                }
                return true;
            }
            //加入购物车
            $.get(option.addCartUrl, {product_id: proID, sku_id: skuID, num: num, is_reset: 0}, function (d) {
                if (d.code == 0) {
                    d.msg = '添加购物车成功';
                    if (toSettle == 1) {
                        location = option.settleUrl;
                    }
                    if(d.data.total > 0 && d.data.total < 100){
                        $('.j-cartTotal').html(d.data.total);
                    }else{
                        $('.j-cartTotal').css('width','1.1rem');
                        $('.j-cartTotal').html('99+');
                    }
                    if (d.data.total > 0) {
                        $('.j-cartTotal').show();
                    } else {
                        $('.j-cartTotal').hide();
                    }
                    closeCart();
                }
                else {
                    if (d.code == -1) {
                        closeCart();
                    }
                }
                $('#shopCar_add').html(d.msg);
                $('#shopCar_add').css('display', 'block');
                setTimeout("$('#shopCar_add').css('display', 'none')",2000);
                return false;
            }, 'json');
        });
    }

    if ($(option.container).length == 0) {
        loadTpl();
    } else {
        isLoadedTpl = true;
        cartInit();
    }

    function showCart() {
        $(option.container).slideDown(200);
    }

    function closeCart() {
        $('#cart-bg').hide();
        $(option.container).slideUp(200);
    }

    // 设置商品规格
    function setStyle(styles) {
        if (!styles) {
            return false;
        }
        // 规格内容
        var content = '', skuLength = 0, p;
        for (p in styles) {
            if (styles.hasOwnProperty(p)) {
                var s = styles[p], v = s.value;
                if (!v || v.length <= 0) {
                    continue;
                }
                content += '<div class="goods_spec_name"><p>' + s.name + '</p>';
                content += '<ul class="goods_spec_box clearfix j-skuChoose">';
                for (var i = 0, len = v.length; i < len; i++) {
                    content += '<li data-name="' + filterChar(v[i]) + '">' + v[i] + '</li>';
                }
                content += '</ul></div>';
                skuLength++;
            }
        }
        $('.j-skuBox', option.container).append(content);
        // 规则选择
        $(".j-skuChoose li", option.container).click(function () {
            if ($(this).hasClass("disabled")) {
                return false;
            }
            $(this).siblings("li").removeClass("on");
            $(this).addClass("on");
            var on_len = $('.on', option.container).length,
                cur_sku = "",// 当前选择的sku
                cur_sku_text = [],
                sku_key_title = "",
                split = '';//
            $('.on', option.container).each(function (i) {
                cur_sku += split + $(this).text();
                cur_sku_text.push($(this).text());
                if (i !== on_len - 1) {
                    sku_key_title += split + $(this).text();
                }
                split = '_';
            });
            $('.j-chosen').text(cur_sku_text.join('，'));
            maxStock = stockObj[cur_sku] ? stockObj[cur_sku]['num'] : 0;
            // 所有规格全选了
            if (skuLength == on_len) {
                $('.on:last', option.container).siblings("li").each(function (i) {
                    var sku_key = sku_key_title == '' ? $(this).text() : sku_key_title + split + $(this).text(),
                        sku_num = stockObj[sku_key] ? stockObj[sku_key]['num'] : 0;
                    sku_num == 0 ? $(this).addClass("disabled") : $(this).removeClass("disabled");
                });
                if (maxStock > 0) {
                    $('.on:last', option.container).removeClass("disabled");
                } else {
                    $('.on:last', option.container).addClass("disabled").removeClass("on");
                }
            } else if (skuLength - 1 == on_len) {
                $(".goods_spec_box:last li", option.container).each(function () {
                    var sku_key = cur_sku + split + $(this).text();
                    sku_num = stockObj[sku_key] ? stockObj[sku_key]['num'] : 0;
                    sku_num == 0 ? $(this).addClass("disabled") : $(this).removeClass("disabled");
                });
            }
            $('.j-stock', option.container).text(maxStock);
            if (maxStock <= 0) {
                return false;
            }
            var buy_goods_img = stockObj[cur_sku]['pic'];
            if (buy_goods_img) {
                $('.j-proPic', option.container).attr("src", buy_goods_img);
            }
            $('.j-skuPrice', option.container).text(stockObj[cur_sku]['price']);
            return true;
        });
        initChooseStyle();
    }

    //获取特殊字符
    function filterChar(str) {
        return str.replace(/[^\d\w\u4E00-\u9FFF]/img, '');
    }

    // 选择默认规格
    function initChooseStyle() {
        for (var p in stockObj) {
            var d_s = stockObj[p];
            if (d_s && d_s['num'] > 0) {
                var sku = p.split('_');
                for (var k = 0; k < sku.length; k++) {
                    $('.goods_spec_box', option.container).eq(k).find('[data-name=' + filterChar(sku[k]) + ']').addClass('on');
                }
                break;
            }
        }
        $('.on', option.container).click();
    }

    $(document).on('click', option.selector, function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (!isLoadedTpl) {
            return false;
        }
        var self = this,
            directBuy = $(this).attr('data-direct-buy');//是否只显示直接购买按钮
        proID = $(this).attr('data-id');//商品ID
        //商品ID不存在直接返回错误
        if (isNaN(proID) || proID <= 0) {
            return false;
        }
        //设置显示按钮
        if (directBuy == 1) {
            $('#js-add-basket').hide().next().css('width','100%');
        }else{
            $('#js-add-basket').show().next().css('width','50%');
        }

        // 获取库存信息
        $('#cart-bg,#cart-loading').show();
        // 获取库存信息
        $.ajax({
            url: option.proStockUrl,
            dataType: 'json',
            data: {product_id: proID},
            success: function (ret) {
                var data = ret.data;
                $('#cart-loading').hide();
                if (data['max_stock'] <= 0 || data == '') {
                    $('#cart-bg,#cart-loading').hide();
                    alert('销售太火爆，库存不足');
                    return false;
                }
                boughtNum = parseInt(data['bought_num'], 10);
                if (isNaN(boughtNum)) {
                    boughtNum = 0;
                }
                proLimitNum = parseInt(data['limit_num'], 10);
                maxStock = data['max_stock'];
                var styles = data.styles,
                    price = data.max_price == data.min_price ? data.max_price : data.min_price + ' - ' + data.max_price,
                    stock_num = data.max_stock == data.min_stock ? data.min_stock : data.min_stock + ' - ' + data.max_stock;
                stockObj = data.stock;
                // 设置默认信息
                $('.j-skuBox', option.container).html('');
                //初始化购买数量
                $('.j-buyNum', option.container).val(1);
                // 设置商品信息
                $('.j-proPic', option.container).attr('src', $(self).attr('data-src'));
                $('.j-skuPrice', option.container).text(price);
                $('.j-stock', option.container).text(stock_num);
                showCart();
                setStyle(styles);
                if (typeof option.afterCall == 'function') {
                    option.afterCall.call(this, data);
                }
                return false;
            },
            error: function () {
                closeCart();
                alert('系统繁忙，请重试');
            }
        });
    });
};