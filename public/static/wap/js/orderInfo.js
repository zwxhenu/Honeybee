/**
 * 订单提交 示例：$.orderInfo({userId:1});
 *
 */
$.orderInfo = function (option) {
    var defaultOption = {};
    option = $.extend(defaultOption, option);

    //检查是否登录
    if (option.userId <= 0) {
        showLogin();
    }

    //打开支付弹出框
    $('#sub-order').click(function () {
        $('#fullbg').css({
            height: $(document).height(),
            width: '100%',
            display: 'block'
        });
        $('#pay_method_box').slideDown('fast');
    });

    //关闭支付弹出框
    $('#pay-box-close').click(function () {
        $('#fullbg,#pay_method_box').hide();
    });

    //收货地址加载地址库
    $('#create-address').addressSelect({
        provinceName: 'receiver_province',
        cityName: 'receiver_city',
        districtName: 'receiver_district',
        provinceLabel: 'receiver_province_label',
        cityLabel: 'receiver_city_label',
        districtLabel: 'receiver_district_label',
    });

    //收货地址设置为默认地址
    $('#js-set-default-address').click(function () {
        var checkBox = $(this).children('span');
        if (checkBox.hasClass('new_default_r')) {
            checkBox.removeClass('new_default_r');
            $("input[name='is_default']").val(0);
        } else {
            checkBox.addClass('new_default_r');
            $("input[name='is_default']").val(1);
        }
    });

    //保存收货地址
    $('#js-save-receiver-address').on('click', function () {
        var addressInfo = getNewAddressInfo();
        if (checkAddressInfo(addressInfo)) {
            saveAddressInfo(addressInfo);
        }
    });

    //修改配送方式
    $('#delivery_type_id').change(function () {
        //重算价格
        recountPayable();
    });

    function mul(a, b) {
        var c = 0,
            d = a.toString(),
            e = b.toString();
        try {
            c += d.split(".")[1].length;
        } catch (f) {
        }
        try {
            c += e.split(".")[1].length;
        } catch (f) {
        }
        return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
    }

    //修改订单确认页面商品数量 重算金额
    $("#reduce").bind('click', function () {
        var num = $('.j-gift-num').val();
        num = num * 1 - 1;
        if (num < 1) {
            num = 1;
        }
        //单价
        var unit_price = $('.unit_price').text();
        $('.gift_num').text('数量：' + num);
        $('.pro_total').text('（共' + num + '件）');
        var price = mul(num, unit_price);
        $('.pro_price').text('￥' + price);
        $('.gift_pro_total').text('共' + num + '件');
        $('.gift_pro_price').text('总计：￥' + price);
        $('.j-gift-num').val(num);
        recountPayable();
    });
    $(".adds").bind('click', function () {
        var num = $('.j-gift-num').val();
        var unit_price = $('.unit_price').text();
        var limit_num = $('.limit_num').val();
        var usable_qty = $('.usable_qty').val();
        num = num * 1 + 1;
        if (limit_num && limit_num > 0 && (num > limit_num)) {
            alert('该商品限购' + limit_num + '件');
            num = limit_num;
        }
        if (num > usable_qty) {
            num = usable_qty;
        }
        $('.gift_num').text('数量：' + num);
        $('.pro_total').text('（共' + num + '件）');
        var price = mul(num, unit_price);
        $('.pro_price').text('￥' + price);
        $('.gift_pro_total').text('共' + num + '件');
        $('.gift_pro_price').text('总计：￥' + price);
        $('.j-gift-num').val(num);
        recountPayable();
    });

    //显示弹出窗口
    var thisPosition = 0;
    $('.js-show').click(function () {
        //检查是否登录
        if (option.userId <= 0) {
            return showLogin();
        }
        var idDOM = $(this).attr('data-id');
        switch (idDOM) {
            case 'address':
                getAddressList();
                break;
            case 'coupons':
                getCouponList();
                break;
            case 'store-card':
                getStoreCard();
                break;
            case 'create-address':
                if ($("input[name='edit_address_id']").val() != 0) {
                    initNewAddressInfo();
                }
                break;
        }
        showWidget(idDOM);
    });


    //优惠券选项卡
    $('.coupon_head_ky li').click(function () {
        if (!$(this).hasClass('ky_on')) {
            $(this).addClass('ky_on').siblings('.ky_on').removeClass('ky_on');
            getCouponList();
            $('.' + $(this).attr('data-class')).show().siblings().not('.coupon_head_ky').hide();
        }
    });

    //兑换优惠码
    $('#js-cash-coupon-code').click(function () {
        var code = $('#coupon-code').val();
        var len = code.length;
        if (len < 6 || len > 15) {
            alert('兑换失败，优惠码无效');
            return false;
        }
        if (/^(\d|[a-zA-Z])+$/.test(code)) {
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: option.cashCouponCodeUrl,
                data: {'products': option.products, 'code': code, '_token': option.token},
                error: function () {
                    return false;
                },
                success: function (res) {
                    if (res.code == 0) {
                        var showHtml = makeShowCouponHtml(res.data);
                        $('#coupon-code-list').prepend(showHtml);
                        $('#coupon-code').val('');
                    } else {
                        alert(res.msg);
                    }
                }
            });
        } else {
            alert('兑换失败，优惠码无效');
        }
    });

    //使用优惠券/码
    $('#coupons').on('click', '.js-select-coupon', function () {
        var code = $(this).attr('data-code'),
            name = $(this).attr('data-name');
        $("input[name='coupons']").val(code);
        $('#coupons-show').text(name);
        recountPayable();
        hideWidget('coupons');
    });
    //选择储值卡
    $('#store-card').on('click', '.store-card-select', function () {
        var payable = $('.show-payable').text(),
            store_card = $('input[name="store_card"]').val(),
            select_box = $(this).find('.select_box'),
        // card_no = $(this).attr('data-card-code'),
            select_money = 0;
        store_card = store_card.split(',');

        if ($(select_box).hasClass('select_ed')) {
            $(select_box).removeClass('select_ed');
            if ($('input[name="store_card"]').val() != '') {
                useStoreCard(true);
            }
        } else {
            $('#store-card .select_ed').each(function () {
                var card_balance = $(this).attr('data-card-code-balance'),
                    select_no = $(this).attr('data-card-code'),
                    balance_check = true;
                $.each(store_card, function (index, value) {
                    if (value == select_no) {
                        balance_check = false;
                        return true;
                    }
                });
                if (balance_check == true) {
                    select_money += Number(card_balance);
                }
            });
            if (Number(select_money) >= Number(payable)) {
                alert('选择金额已超出订单金额！');
            } else {
                $(select_box).addClass('select_ed');
            }
        }
    });
    //使用储值卡
    $('#store-card').on('click', '#store-card-use', function () {
        if ($('#store-card-list .select_ed').length > 0) {
            if (option.checkPayPwdAgain === false) {
                useStoreCard();
            } else {
                confirm(
                    '<input type="password" name="pay_password" id="pay_password" placeholder="请输入支付密码" style="border: 1px solid #d5d5d5;height: 1.4rem;width: 90%;padding: 0 4px;" value="">', function () {
                        var pwd = $('input[name="pay_password"]').val();
                        $.ajax({
                            url: option.checkPayPwdUrl,
                            type: 'POST',
                            data: {pay_password: pwd, _token: option.token},
                            dataType: 'json',
                            async: false,
                            error: function () {
                                alert('系统繁忙，请稍后再试！');
                                return false;
                            },
                            success: function (res) {
                                if (res.code == 0) {
                                    option.checkPayPwdAgain = false;
                                    alert(res.msg);
                                    useStoreCard();
                                } else if (res.code == 1015) {
                                    alert(res.msg);
                                    setTimeout(function () {
                                        location = option.setPayPwdUrl;
                                    }, 1000)
                                } else {
                                    alert(res.msg);

                                }
                            }
                        });
                    }, function () {//取消方法
                        cancelStoreCard();
                    });
            }
        } else {
            cancelStoreCard();
        }
    });
    //需要发票
    $('#js-need-invoice').click(function () {
        var checkBox = $(this).children('span');
        if (checkBox.hasClass('con_t_circle')) {
            checkBox.removeClass('con_t_circle');
            $("input[name='temp_need_invoice']").val(0);
        } else {
            checkBox.addClass('con_t_circle');
            $("input[name='temp_need_invoice']").val(1);
        }
    });

    //发票确定
    $('#js-submit-invoice').click(function () {
        var idDOM = $(this).parent().attr('id');
        var needInvoice = $("input[name='temp_need_invoice']").val();
        $("input[name='need_invoice']").val(needInvoice);
        if (needInvoice == 1) {
            var invoiceTitle = $("input[name='temp_invoice_title']").val();
            if (invoiceTitle == '') {
                alert('请填写发票抬头');
                return false;
            }
        } else {
            var invoiceTitle = '';
        }
        $("input[name='invoice_title']").val(invoiceTitle);
        $('#invoice-title-show').text(invoiceTitle);
        hideWidget(idDOM);
    });

    //提交订单
    $('.js-sub-order').bind('click', function () {
        //检查是否登录
        if (option.userId <= 0) {
            return showLogin();
        }
        var thisDOM = $(this),
            thisText = thisDOM.text(),
            payType = thisDOM.attr('pay-type');

        //订单数据
        var postData = {'products': option.products, '_token': option.token};

        //检查支付方式
        if (payType == 0 && thisDOM.hasClass('disabled')) {
            return false;
        }
        postData.pay_type = payType;

        //获取是否送礼订单标示  1是送礼订单
        var is_gift_order = $("input[name='is_gift_order']").val();

        if (is_gift_order != 1) {
            //检查收货地址
            var addressId = $("input[name='address_id']").val();
            if (addressId <= 0) {
                alert('请选择收货地址');
                return false;
            }
            postData.address_id = addressId;

            //检查配送方式
            var deliveryTypeId = $("select[name='delivery_type_id']").val();
            if (deliveryTypeId <= 0) {
                alert('请选择配送方式');
                return false;
            }
            postData.delivery_type_id = deliveryTypeId;

            //买家留言
            postData.buyer_message = $("textarea[name='buyer_message']").val();

            //发票信息
            var needInvoice = $("input[name='need_invoice']").val();
            if (needInvoice == 1) {
                var invoiceTitle = $("input[name='invoice_title']").val();
                if (invoiceTitle == '') {
                    alert('请填写发票抬头');
                    return false;
                }
                postData.need_invoice = 1;
                postData.invoice_title = invoiceTitle;
            } else {
                postData.need_invoice = 0;
            }
        } else {
            //送礼方式
            var giftType = $("input[name='gift_type']:checked").val();
            if (giftType < 0) {
                alert('请选择送礼方式');
                return false;
            }
            postData.gift_type = giftType;
            //联系电话
            var buyerMobile = $("input[name='buyer_mobile']").val();
            postData.buyer_mobile = buyerMobile;
            //卖家赠言
            var buyerGiftMessgae = $(".buyer_gift_message").val();
            postData.buyer_gift_message = buyerGiftMessgae;

            postData.is_gift_order = is_gift_order;
        }

        //优惠券/码
        postData.coupons = $("input[name='coupons']").val();

        //储值卡
        postData.store_card = $("input[name='store_card']").val();

        //商品自定义字段
        postData.messages = getMessages();
        if (postData.messages === false) {
            return false;
        }

        //改变按钮提示
        thisDOM.text('请稍后……');
        if (option.useSubmit == false) {
            alert('请稍后……');
            return false;
        }
        option.useSubmit = false;
        //提交
        $.ajax({
            url: option.createOrderUrl,
            type: 'POST',
            data: postData,
            dataType: 'json',
            async: false,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('系统繁忙，请稍后再试！');
	            option.useSubmit = true;
                return false;
            },
            success: function (res) {
                if (res.code == 0) {
                    location = res.data;
                } else {
	                option.useSubmit = true;
                    alert(res.msg);
                    /*setTimeout(function(){
                     location = document.referrer
                     }, 1000);*/
                }
            },
            complete: function () {
                thisDOM.text(thisText);
            }
        });
    });

    //返回主页面
    $(window).on('popstate', function (e) {
        //添加修改收货地址
        if ($('#create-address').css('display') != 'none') {
            hideWidget('create-address');
            history.pushState({title: 'address'}, '', location.href);
            return true;
        }
        //收货地址
        if ($('#address').css('display') != 'none') {
            hideWidget('address');
            return true;
        }
        //优惠券
        if ($('#coupons').css('display') != 'none') {
            hideWidget('coupons');
            return true;
        }
        //储值卡
        if ($('#store-card').css('display') != 'none') {
            hideWidget('store-card');
            return true;
        }
        //发票
        if ($('#invoice').css('display') != 'none') {
            hideWidget('invoice');
            return true;
        }
    });

    //根据ID元素显示组建
    function showWidget(idDOM) {
        //$('#'+idDOM).css('display','block').animate({left:0}, 400);
        thisPosition = $(document).scrollTop();
        if (thisPosition > 0) {
            $('html, body').animate({scrollTop: 0}, 'slow');
        }
        $('#' + idDOM).css('left', 0).show();
        if (history.pushState && !history.state) {
            history.pushState({title: idDOM}, '', location.href);
        }
        $('#'+idDOM).height($(document).height());
    }

    //根据ID元素隐藏组建
    function hideWidget(idDOM) {
        $('html, body').animate({scrollTop: thisPosition}, 'slow');
        if (thisPosition > 0) {
            thisPosition = 0;
        }
        $('#' + idDOM).css('left', '120%').hide();
        /*$('#'+idDOM).animate({left:'120%'},400,function(){
         $(this).hide();
         });*/
    }

    //获取新增地址信息
    function getNewAddressInfo() {
        return {
            'consignee': $.trim($("input[name='receiver_name']").val()),
            'mobile': $.trim($("input[name='receiver_mobile']").val()),
            'province_code': $("select[name='receiver_province']").val(),
            'city_code': $("select[name='receiver_city']").val(),
            'district_code': $("select[name='receiver_district']").val(),
            'province': $.trim($("select[name='receiver_province'] option:selected").text()),
            'city': $.trim($("select[name='receiver_city'] option:selected").text()),
            'district': $.trim($("select[name='receiver_district'] option:selected").text()),
            'detail_address': $.trim($("input[name='receiver_detail_address']").val()),
            'is_default': $.trim($("input[name='is_default']").val()),
            'address_id': $.trim($("input[name='edit_address_id']").val())
        };
    }

    //编辑地址信息
    function editAddressInfo(addressInfo) {
        $("input[name='receiver_name']").val(addressInfo.consignee);
        $("input[name='receiver_mobile']").val(addressInfo.mobile);
        $("input[name='receiver_detail_address']").val(addressInfo.detail_address);
        $("input[name='edit_address_id']").val(addressInfo.address_id);
        if (addressInfo.is_default == 1) {
            $("input[name='is_default']").val(1);
            $('#js-set-default-address').children('span').addClass('new_default_r');
        } else {
            $("input[name='is_default']").val(0);
            $('#js-set-default-address').children('span').removeClass('new_default_r');
        }
        if (addressInfo.province != '') {
            $("#areaProvince option[value='" + addressInfo.province + "']").prop('selected', true).change();
        }
        if (addressInfo.city != '') {
            $("#areaCity option[value='" + addressInfo.city + "']").prop('selected', true).change();
        }
        if (addressInfo.district != '') {
            $("#areaDistrict option[value='" + addressInfo.district + "']").prop('selected', true).change();
        }
        showWidget('create-address');
    }

    //初始化新添加的地址信息
    function initNewAddressInfo() {
        $("input[name='receiver_name']").val('');
        $("input[name='receiver_mobile']").val('');
        $("input[name='receiver_detail_address']").val('');
        $("input[name='edit_address_id']").val(0);
        if ($("input[name='is_default']").val() == 1) {
            $("input[name='is_default']").val(0);
            $('#js-set-default-address').children('span').removeClass('new_default_r');
        }
        $("#areaProvince option:selected").prop('selected', false);
        $("#areaCity").html('<option value="">请选择市</option>');
        $("#areaDistrict").html('<option>请选择区/县</option>');
    }

    //检测收货地址是否正确
    function checkAddressInfo(addressInfo) {
        if (addressInfo.consignee == '') {
            alert('收货人姓名不能为空');
            return false;
        }

        if (!addressInfo.consignee.match(/^[\w\u4e00-\u9fa5]{2,10}$/)) {
            alert('收货人姓名格式错误，必须是2-10个字符');
            return false;
        }

        if (addressInfo.mobile == '') {
            alert('收货人联系电话不能为空');
            return false;
        }

        if (!addressInfo.mobile.match(/^([(86)|0]?(13\d{9})|(15\d{9})|(18\d{9})|(17\d{9}))$/)) {
            alert('联系电话格式错误');
            return false;
        }

        if (addressInfo.province_code == '' || addressInfo.province == '') {
            alert('收货人所在省异常，请重新选择');
            return false;
        }

        if (addressInfo.city_code == '' || addressInfo.city == '') {
            alert('收货人所在市异常，请重新选择');
            return false;
        }

        if (addressInfo.detail_address == '') {
            alert('收货人详细地址不能为空');
            return false;
        }

        if (!addressInfo.detail_address.match(/^[\[【\]】\(（\)）#,，:：\.。\-_—\s\w\u4e00-\u9fa5]{2,100}$/)) {
            alert('收货人详细地址格式错误');
            return false;
        }
        return true;
    }

    //保存新建或者编辑的地址库信息
    function saveAddressInfo(addressInfo) {
        $.ajax({
            type: 'post',
            dataType: 'json',
            url: option.saveAddressUrl,
            data: {
                'consignee': addressInfo.consignee,
                'province': addressInfo.province,
                'province_code': addressInfo.province_code,
                'city': addressInfo.city,
                'city_code': addressInfo.city_code,
                'district': addressInfo.district,
                'district_code': addressInfo.district_code,
                'detail_address': addressInfo.detail_address,
                'mobile': addressInfo.mobile,
                'is_default': addressInfo.is_default,
                'address_id': addressInfo.address_id,
                '_token': option.token
            },
            error: function () {
                alert('系统繁忙，请稍后再试！');
            },
            success: function (res) {
                if (res.code == 0) {
                    addressInfo.address_id = res.data;
                    showAddressInfo(addressInfo);
                    initNewAddressInfo();
                } else {
                    alert(res.msg);
                }
            }
        });
    }

    //显示地址信息
    function showAddressInfo(addressInfo) {
        var showHtml = '<p class="black_col2 mb12">';
        showHtml += '<span>收货人：' + addressInfo.consignee + '</span>';
        showHtml += '<span class="rf">' + addressInfo.mobile + '</span>';
        showHtml += '</p>';
        showHtml += '<p class="gray_col2">' + addressInfo.province + addressInfo.city + addressInfo.district + addressInfo.detail_address + '</p>';
        $('#show-address').html(showHtml);
        $("input[name='address_id']").val(addressInfo.address_id);
        thisPosition = 0;
        hideWidget('address');
        hideWidget('create-address');
        recountPayable();
    }

    //初始化地址信息
    function initAddressInfo() {
        $('#show-address').html('<p class="gray_col2 ptb10">请填写收货地址</p>');
        $("input[name='address_id']").val(0);
    }

    //获取地址库列表
    function getAddressList() {
        $.ajax({
            type: 'post',
            dataType: 'json',
            url: option.getAddressListUrl,
            data: {'page': 1, '_token': option.token},
            error: function () {
                return false;
            },
            success: function (res) {
                if (res.code == 0) {
                    showAddressList(res.data, false);
                } else {
                    alert(res.msg);
                }
            }
        });
    }

    //选择地址库地址
    $('#address-list').on('click', '.j-select-address', function () {
        var addressInfo = {
            'consignee': $(this).attr('data-consignee'),
            'mobile': $(this).attr('data-mobile'),
            'province': $(this).attr('data-province'),
            'city': $(this).attr('data-city'),
            'district': $(this).attr('data-district'),
            'detail_address': $(this).attr('data-address'),
            'address_id': $(this).attr('data-id')
        };
        showAddressInfo(addressInfo);
    });

    //编辑地址库地址
    $('#address-list').on('click', '.j-edit-address', function () {
        var addressInfo = {
            'consignee': $(this).attr('data-consignee'),
            'mobile': $(this).attr('data-mobile'),
            'province': $(this).attr('data-province'),
            'city': $(this).attr('data-city'),
            'district': $(this).attr('data-district'),
            'detail_address': $(this).attr('data-address'),
            'is_default': $(this).attr('data-default'),
            'address_id': $(this).attr('data-id')
        };
        editAddressInfo(addressInfo);
    });

    //删除一条地址库信息
    $('#address-list').on('click', '.j-del-address', function () {
        var addressId = $(this).attr('data-id');
        $.ajax({
            type: 'post',
            dataType: 'json',
            url: option.destroyAddressUrl,
            data: {'address_id': addressId, '_token': option.token},
            error: function () {
                alert('删除失败，请稍后再试');
                return false;
            },
            success: function (res) {
                if (res.code == 0) {
                    $('#address-list-' + addressId).remove();
                    //如果删除的是当前选择的地址，则需要初始化地址信息
                    if ($("input[name='address_id']").val() == addressId) {
                        initAddressInfo();
                    }
                } else {
                    alert(res.msg);
                }
            }
        });
    });

    //显示地址库列表
    function showAddressList(addressList, isLocal) {
        if (addressList && addressList.length > 0) {
            $('#address-list').html('');
            var showHtml = '';
            $.each(addressList, function (key, value) {
                showHtml = '<div class="con_site" id="address-list-' + value.address_id + '">';
                showHtml += '<a href="javascript:;" class="j-select-address" data-id="' + value.address_id + '" data-consignee="' + value.consignee + '" data-mobile="' + value.mobile + '" data-province="' + value.province + '" data-city="' + value.city + '" data-district="' + value.district + '" data-address="' + value.detail_address + '">';
                showHtml += '<p class="linkman">';
                showHtml += '<span>' + value.consignee + '</span>';
                showHtml += '<span class="rf">' + value.mobile + '</span>';
                showHtml += '</p>';
                showHtml += '<p class="text_site">' + value.province + value.city + value.district + value.detail_address + '</p>';
                showHtml += '</a>';
                showHtml += '<div class="setting_box clearfix">';
                if (value.is_default == 1) {
                    showHtml += '<p class="setting_box_l lf">';
                    showHtml += '<span class="setting_circle order_sprites"></span>';
                    showHtml += '<lable>默认地址</lable>';
                    showHtml += '</p>';
                }
                showHtml += '<div class="setting_box_r clearfix rf">';
                showHtml += '<a href="javascript:;" class="set_box_edit lf j-edit-address" data-default="' + value.is_default + '" data-id="' + value.address_id + '" data-consignee="' + value.consignee + '" data-mobile="' + value.mobile + '" data-province="' + value.province_code + '" data-city="' + value.city_code + '" data-district="' + value.district_code + '" data-address="' + value.detail_address + '">';
                showHtml += '<span class="edit_icon order_sprites"></span>';
                showHtml += '<span class="edit_txt">编辑</span>';
                showHtml += '</a>';
                showHtml += '<a href="javascript:;" class="set_box_delete lf j-del-address" data-id="' + value.address_id + '">';
                showHtml += '<span class="delete_icon order_sprites"></span>';
                showHtml += '<span class="delete_txt">删除</span>';
                showHtml += '</a>';
                showHtml += '</div>';
                showHtml += '</div>';
                showHtml += '</div>';
                $('#address-list').append(showHtml);
                $('#create-address').height($(document).height());
                $('#address').height($(document).height());
            });
        } else {
            showWidget('create-address');
        }
    }

    //获取优惠券/码
    function getCouponList() {
        $('.coupon_head_ky li').each(function () {
            if ($(this).hasClass('ky_on')) {
                if ($(this).attr('data-class') == 'coupon_wraps') {
                    if ($.trim($('#coupon-list').html()) == '') {
                        getCoupons(2);
                    }
                } else {
                    if ($.trim($('#coupon-code-list').html()) == '') {
                        getCoupons(1);
                    }
                }
            }
        });
    }

    //获取优惠券/码
    function getCoupons(type) {
        $.ajax({
            type: 'post',
            dataType: 'json',
            url: option.getCouponsUrl,
            data: {'products': option.products, 'type': type, '_token': option.token},
            error: function () {
                return false;
            },
            success: function (res) {
                if (res.code == 0) {
                    showCoupons(res.data, type);
                } else {
                    alert(res.msg);
                }
            }
        });
    }

    //显示优惠券/码
    function showCoupons(coupons, type) {
        $('#coupons').height($(document).height());
        $.each(coupons, function (key, value) {
            var showHtml = makeShowCouponHtml(value);
            if (type == 2) {
                $('.coupon_wraps').css('display', 'block');
                var showDOM = $('#coupon-list');
            } else {
                $('.coupon_wraps').css('display', 'none');
                var showDOM = $('#coupon-code-list');
            }
            $(showDOM).append(showHtml);
        });
    }

    //创建显示优惠券/码的HTML
    function makeShowCouponHtml(coupon) {
        var showHtml = '<li class="clearfix js-select-coupon" data-code="' + coupon['code'] + '" data-name="' + coupon['name'] + '">';
        showHtml += '<div class="conl_box_top clearfix">';
        showHtml += '<div class="conl_box_num lf">';
        if (coupon['status'] == '即将到期') {
            showHtml += '<p class="conl_expire add_left_pos">即将到期</p>';
        }
        showHtml += '<p class="conl_money"><i>￥</i>' + coupon['face_value'] + '</p>';
        showHtml += '<p class="conl_rule">' + coupon['limit'] + '</p>';
        showHtml += '</div>';
        showHtml += '<div class="conl_box_name lf">';
        showHtml += '<p class="box_name_coup">' + coupon['name'] + '</p>';
        showHtml += '<p class="box_name_scope">' + coupon['scope'] + '</p>';
        showHtml += '</div>';
        showHtml += '</div>';
        showHtml += '<div class="conl_box_bottom">';
        showHtml += '<p>使用期限：' + coupon['begin_at'] + ' - ' + coupon['end_at'] + '</p>';
        showHtml += '</div>';
        showHtml += '<span class="gray_circle_top"></span>';
        showHtml += '<span class="gray_circle_bottom"></span>';
        showHtml += '</li>';
        return showHtml;
    }

    //获取储值卡
    function getStoreCard() {
        $('#store-card').height($(document).height());
        var $wrap = $('#store-card-list'), per_page = 5, $tpl = $('#store-card').find('.j-tpl'), pageNum = option.storeCardPageNum || 1;
        $wrap.loadMore({
            url: option.getStoreCardUrl,
            data: {code_status: 1, _token: option.token},
            pageNum: pageNum,
            pageSize: per_page,// 每页的数量
            success: function (res) {
                var i, len = res.data.length;
                for (i = 0; i < len; i++) {
                    var $item = $tpl.clone(), card = res.data[i];
                    $item.removeClass('hide j-tpl');
                    $item.find('.select_box').attr({'data-card-code': card.id, 'data-card-code-balance': card.code_balance});
                    $item.find('.card_no').html(card.card_no);
                    $item.find('.code_balance').html(card.code_balance);
                    $item.find('.end_at').html(card.end_at);
                    $wrap.append($item);
                }
                if (len > 0) {
                    pageNum++;
                    option.storeCardPageNum = pageNum;
                }
            }
        });
    }

    function useStoreCard(usehide) {
        var card_code = '';
        $('input[name="store_card"]').val('');
        $('#store-card-list .select_ed').each(function () {
            card_code += ',' + $(this).attr('data-card-code');
        });
        $('input[name="store_card"]').val(card_code.substr(1));
        if (card_code != '') {
            $('#store-card-show').text('已使用');
        } else {
            $('#store-card-show').text('');
        }
        //重算订单
        recountPayable();
        if (!usehide) {
            //隐藏窗口
            hideWidget('store-card');
        }
    }

    function cancelStoreCard() {
        $('input[name="store_card"]').val('');
        $('#store-card-show').text('');
        //重算订单
        recountPayable();
        //隐藏窗口
        hideWidget('store-card');
    }

    //重算支付金额
    function recountPayable() {
        //数据
        var j_gift_num = $("input[name='j-gift-num']").val() ? $("input[name='j-gift-num']").val() : 0;
        var postData = {
            'products': option.products,
            'address_id': $("input[name='address_id']").val(),
            'delivery_type_id': $("select[name='delivery_type_id']").val() || 1,
            'coupons': $("input[name='coupons']").val(),
            'store_card': $("input[name='store_card']").val(),
            'j-gift-num': j_gift_num,
            '_token': option.token
        };
        $.ajax({
            type: 'post',
            dataType: 'json',
            url: option.recountPayableUrl,
            data: postData,
            error: function () {
                return false;
            },
            success: function (res) {
                if (res.code == 0) {
                    //赠品
                    showGift(res.data.gift);
                    //商品自定义字段
                    showProductMessages(res.data.messages);
                    //运费
                    $('.show-freight').text(res.data.freight);
                    //优惠详情
                    var couponList = res.data.coupon_list;
                    var couponShow = '';
                    if (couponList.length > 0) {
                        $.each(couponList, function (key, value) {
                            couponShow += '<p>';
                            couponShow += '<span>' + value['coupon_from'] + '</span>';
                            couponShow += '<span class="rf red_col2">-￥' + value['coupon_amount'] + '</span>';
                            couponShow += '</p>';
                        });
                    }

                    $('#coupon_list').html(couponShow);
                    //应付金额
                    $('.show-payable').text(res.data.payable);
                    var pro = option.products.split('_');
                    if (pro.length == 3 && j_gift_num) {
                        option.products = pro[0] + '_' + j_gift_num + '_' + pro[2];
                    }

                    if (res.data.payable <= 0) {
                        if (!$('#sub-order').hasClass('pay_btn_hide')) {
                            $('#sub-order').addClass('pay_btn_hide')
                        }
                        if ($('#no-pay').hasClass('pay_btn_hide')) {
                            $('#no-pay').removeClass('pay_btn_hide')
                        }
                    } else {
                        if (!$('#no-pay').hasClass('pay_btn_hide')) {
                            $('#no-pay').addClass('pay_btn_hide')
                        }
                        if ($('#sub-order').hasClass('pay_btn_hide')) {
                            $('#sub-order').removeClass('pay_btn_hide')
                        }
                    }
                } else {
                    $("input[name='coupons']").val('');
                    $("input[name='store_card']").val('');
                    $('#coupons-show').text('');
                    alert(res.msg);
                    //recountPayable();
                }
            }
        });
    }

    //显示赠品
    function showGift(gift) {
        var showHtml = '';
        $.each(gift, function (i, e) {
            showHtml += '<div class="goods_show_box">';
            showHtml += '<div class="goods_show_box2 clearfix">';
            showHtml += '<div class="goods_show_img">';
            showHtml += '<img class="wp100_img" src="' + e.main_pic + '_160x160.jpg" />';
            showHtml += '</div>';
            showHtml += '<div class="goods_inf_box">';
            showHtml += '<p class="goods_name_one_line"><span class="gifts">赠品</span>' + e.name + '</p>';
            showHtml += '<p class="gray_col1 mt5 line_through">￥' + e.price + '</p>';
            showHtml += '<span class="goods_num">×' + e.num + '</span>';
            showHtml += '</div>';
            showHtml += '</div>';
            showHtml += '</div>';
        });
        $('#js-gift-wrap').html(showHtml);
    }

    //显示商品留言
    function showProductMessages(messages) {
        var showHtml = '';
        if (messages != '') {
            showHtml += '<div class="buyer_inf_form">';
            showHtml += '<ul class="cause_box cause_box_order_info">';
            $.each(messages, function (i, e) {
                var message_type = parseInt(e.message_type);
                showHtml += '<li>';
                showHtml += '<lable class="cause_box_left lf">';
                showHtml += e.message_name;
                showHtml += '<span class="type1_left_cur">';
                showHtml += e.is_must ? ' * ' : ' ';
                showHtml += '</span>';
                showHtml += '</lable>';
                switch (message_type) {
                    case 1:
                        if (e.is_multiline == 1) {
                            showHtml += '<textarea placeholder="请输入' + e.message_name + '" class="cause_box_txt cause_box_textarea buyer_leave_message messages" data-type="' + e.message_type + '" data-key="' + i + '" data-must="' + e.is_must + '" data-name="' + e.message_name + '"></textarea>';
                        } else {
                            showHtml += '<input type="text" placeholder="请输入' + e.message_name + '" class="cause_box_txt messages" data-type="' + e.message_type + '" data-key="' + i + '" data-must="' + e.is_must + '" data-name="' + e.message_name + '" />';
                        }
                        break;
                    case 2:
                        showHtml += '<input type="text" placeholder="请输入' + e.message_name + '，必须是数字" class="cause_box_txt messages" data-type="' + e.message_type + '" data-key="' + i + '" data-must="' + e.is_must + '" data-name="' + e.message_name + '" />';
                        break;
                    case 3:
                        showHtml += '<input type="email" placeholder="请输入' + e.message_name + '，必须是Email格式" class="cause_box_txt messages" data-type="' + e.message_type + '" data-key="' + i + '" data-must="' + e.is_must + '" data-name="' + e.message_name + '" />';
                        break;
                    case 4:
                        showHtml += '<input type="date" placeholder="请选择' + e.message_name + '，格式：2016-08-08" class="cause_box_txt messages" data-type="' + e.message_type + '" data-key="' + i + '" data-must="' + e.is_must + '" data-name="' + e.message_name + '" />';
                        break;
                    case 5:
                        showHtml += '<input type="time" placeholder="请选择' + e.message_name + '，格式：12:30" class="cause_box_txt messages" data-type="' + e.message_type + '" data-key="' + i + '" data-must="' + e.is_must + '" data-name="' + e.message_name + '" />';
                        break;
                    case 7:
                        showHtml += '<ul class="voucher_box_r clearfix lf" style="margin: 0;">';
                        showHtml += '<li>';
                        showHtml += '<span class="voucher_photo order_sprites"></span>';
                        showHtml += '<input type="file" class="upload js-uploader" data-type="' + e.message_type + '" data-key="' + i + '" data-must="' + e.is_must + '" data-name="' + e.message_name + '" />';
                        showHtml += '</li>';
                        showHtml += '</ul>';
                        break;
                    default:
                        showHtml += '<input type="text" placeholder="请输入' + e.message_name + '" class="cause_box_txt messages" data-type="' + e.message_type + '" data-key="' + i + '" data-must="' + e.is_must + '" data-name="' + e.message_name + '" />';
                }
            });
            showHtml += '</ul>';
            showHtml += '</div>';
        }
        $('#js-product-messages').html(showHtml);
    }

    //弹出登陆框
    function showLogin() {
        $(".js-login").click();
        return false;
    }

    //获取并检查用户自定义字段信息
    function getMessages() {
        var messages = {};
        //if (option.hasMessage == 1) {
        $('.messages').each(function (i, k) {
            var dataKey = $(this).attr('data-key');
            var dataType = parseInt($(this).attr('data-type'));
            var dataMust = parseInt($(this).attr('data-must'));
            var dataName = $(this).attr('data-name');
            var value = $(this).val();
            switch (dataType) {
                case 1:
                    if (dataMust == 1 && value == '') {
                        alert('请输入' + dataName);
                        messages = false;
                        return false;
                    }
                    break;
                case 2:
                    if (dataMust == 1 && value == '') {
                        alert('请输入' + dataName);
                        messages = false;
                        return false;
                    }
                    if (value != '' && isNaN(parseFloat(value))) {
                        alert(dataName + '必须是数字');
                        messages = false;
                        return false;
                    }
                    break;
                case 3:
                    if (dataMust == 1 && value == '') {
                        alert('请输入' + dataName);
                        messages = false;
                        return false;
                    }
                    if (value != '' && !value.match(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/)) {
                        alert(dataName + '必须是Email格式');
                        messages = false;
                        return false;
                    }
                    break;
                case 4:
                    if (dataMust == 1 && value == '') {
                        alert('请选择' + dataName);
                        messages = false;
                        return false;
                    }
                    if (value != '' && !value.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/)) {
                        alert(dataName + '必须是日期格式，例如：2016-08-08');
                        messages = false;
                        return false;
                    }
                    break;
                case 5:
                    if (dataMust == 1 && value == '') {
                        alert('请选择' + dataName);
                        messages = false;
                        return false;
                    }
                    if (value != '' && !value.match(/^(\d{1,2})(:)?(\d{1,2})$/)) {
                        alert(dataName + '必须是时间格式，例如：12:30');
                        messages = false;
                        return false;
                    }
                    break;
                case 6:
                    if (dataMust == 1 && value == '') {
                        alert('请输入' + dataName);
                        messages = false;
                        return false;
                    }
                    break;
                case 7:
                    if (dataMust == 1 && value == '') {
                        alert('请上传' + dataName);
                        messages = false;
                        return false;
                    }
                    break;
            }
            messages[i] = {'data_key': dataKey, 'value': value};
        });
        //}
        return messages;
    }

    //上传图片
    $('#js-product-messages').on('change', '.js-uploader', function () {
        var image = $(this);
        var formData = new FormData();
        formData.append('image', image[0].files[0]);
        formData.append('_token', option.token);
        var thisDOM = $(this).parent().parent();
        var dataKey = $(this).attr('data-key');
        var dataType = $(this).attr('data-type');
        var dataMust = $(this).attr('data-must');
        var dataName = $(this).attr('data-name');
        $.ajax({
            url: option.storeMessagesPicUrl,
            type: 'POST',
            data: formData,
            dataType: 'json',
            processData: false,
            contentType: false,
            error: function () {
                alert('服务器繁忙,请稍后再试');
                return false;
            },
            success: function (res) {
                if (res.code == 0) {
                    var showHtml = '<div class="uploader-preview">';
                    showHtml += '<a href="' + res.data.src + '_600x2000.jpg">';
                    showHtml += '<img src="' + res.data.src + '_160x160.jpg" class="voucher" />';
                    showHtml += '</a>';
                    showHtml += '<input type="hidden" class="messages" value="' + res.data._src + '" data-type="' + dataType + '" data-key="' + dataKey + '" data-must="' + dataMust + '" data-name="' + dataName + '" />';
                    showHtml += '<a href="javascript:;" class="js-remove-voucher">删除</a>';
                    showHtml += '</div>';
                    $(thisDOM).children('li').hide();
                    $(thisDOM).prepend(showHtml);
                } else {
                    alert(res.msg);
                }
            }
        });
    });

    //删除凭证
    $('#js-product-messages').on('click', '.js-remove-voucher', function () {
        var uploadDOM = $(this).parent().siblings('li');
        $(this).parent().remove();
        $(uploadDOM).show();
    });
};