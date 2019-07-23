$.orderInfo = function (option) {
    var bindType = true;
    $.passport({userUrl: '', token: option.token});
    if (option.userId <= 0) {
        showLogin();
    }
    //收货地址加载地址库
    $('#create-address').addressSelect({
        provinceName: 'receiver_province',
        cityName: 'receiver_city',
        districtName: 'receiver_district',
        provinceLabel: 'receiver_province_label',
        cityLabel: 'receiver_city_label',
        districtLabel: 'receiver_district_label',
    });


    $(".fillin_sure_btns").bind("click", function () {
        $("#sub-order").html('提交中');
        $.passport({userUrl: '', token: option.token});
        if ('{{$user_id}}' <= 0) {
            showLogin();
            return false;
        }
        address_id = $.trim($("input[name='address_id']").val());
        buyer_message = $.trim($("textarea[name='buyer_message']").val());
        if(buyer_message.length>80)
        {
            $.trim($("textarea[name='buyer_message']").val(buyer_message.substr(0,80)))
            buyer_message = buyer_message.substr(0,80);
        }

        if (address_id == '') {
            $("#sub-order").html('确定');
            bindType = false;
            return;
        }
        //保存收货地址
        if (!bindType) {
            return;
        }
        bindType = false;
        sendOrder(address_id, buyer_message);
    });
//获取新增地址信息
    function getAddressInfo() {
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
            'receiver_thanks': $.trim($("input[name='receiver_thanks']").val()),
            // 'address_id' : $.trim($("input[name='edit_address_id']").val())
        };
    }

//保存新建或者编辑的地址库信息
    function sendOrder(address_id, buyer_message) {
        $.ajax({
            type: 'post',
            dataType: 'json',
            url: option.createOrderUrl,
            data: {
                //  'consignee': addressInfo.consignee,
                //  'province': addressInfo.province,
                // 'province_code': addressInfo.province_code,
                //'city': addressInfo.city,
                // 'city_code': addressInfo.city_code,
                // 'district': addressInfo.district,
                // 'district_code': addressInfo.district_code,
                /// 'detail_address': addressInfo.detail_address,
                //'mobile': addressInfo.mobile,
                // 'is_default': addressInfo.is_default,
                'receiver_thanks': buyer_message,
                'address_id': address_id,
                'order_sn': option.order_sn,
                '_token': option.token
            },
            error: function () {
                alert('系统繁忙，请稍后再试！');
            },
            success: function (res) {
                if (res.code == 0) {
                    window.location.href = option.successJump + res.order_sn + '/2';
                } else if (res.code == 1) {
                    alert('请检查数据重新提交');
                    $("#sub-order").html('确定');
                    bindType = true;
                } else if (res.code == 8) {
                    alert(res.errMsg);
                    bindType = false;
                } else {
                    alert('领取失败，再试试吧！');
                    $("#sub-order").html('确定');
                    setTimeout(function () {
                        window.location.href = option.successJump + res.order_sn;
                    }, 4000);
                }
            }
        });
    }

//检测收货地址是否正确
    function checkAddressInfo(addressInfo) {
        if (addressInfo.consignee == '') {
            alert('收货人姓名不能为空');
            bindType = true;
            $("#js-save-receiver-address").html('确认提交');
            return false;
        }

        if (!addressInfo.consignee.match(/^[\w\u4e00-\u9fa5]{2,10}$/)) {
            alert('收货人姓名格式错误，必须是2-10个字符');
            $("#js-save-receiver-address").html('确认提交');
            bindType = true;
            return false;
        }

        if (addressInfo.mobile == '') {
            alert('收货人联系电话不能为空');
            $("#js-save-receiver-address").html('确认提交');
            bindType = true;
            return false;
        }

        if (!addressInfo.mobile.match(/^([(86)|0]?(13\d{9})|(15\d{9})|(18\d{9})|(17\d{9}))$/)) {
            alert('联系电话格式错误');
            $("#js-save-receiver-address").html('确认提交');
            bindType = true;
            return false;
        }

        if (addressInfo.province_code == '' || addressInfo.province == '') {
            alert('收货人所在省异常，请重新选择');
            $("#js-save-receiver-address").html('确认提交');
            bindType = true;
            return false;
        }

        if (addressInfo.city_code == '' || addressInfo.city == '') {
            alert('收货人所在市异常，请重新选择');
            $("#js-save-receiver-address").html('确认提交');
            bindType = true;
            return false;
        }

        if (addressInfo.detail_address == '') {
            alert('收货人详细地址不能为空');
            $("#js-save-receiver-address").html('确认提交');
            bindType = true;
            return false;
        }

        if (!addressInfo.detail_address.match(/^[\[【\]】\(（\)）#,，:：\.。\-_—\s\w\u4e00-\u9fa5]{2,100}$/)) {
            alert('收货人详细地址格式错误');
            $("#js-save-receiver-address").html('确认提交');
            bindType = true;
            return false;
        }
        return true;
    }

//弹出登陆框
    function showLogin() {
        $(".js-login").click();
        return false;
    }

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
            case 'create-address':
                if ($("input[name='edit_address_id']").val() != 0) {
                    initNewAddressInfo();
                }
                break;
        }
        showWidget(idDOM);
    });
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
            });
        } else {
            showWidget('create-address');
        }
    }

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
    }

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

    });
//根据ID元素隐藏组建
    function hideWidget(idDOM) {
        $('html, body').animate({scrollTop: thisPosition}, 'slow');
        if (thisPosition > 0) {
            thisPosition = 0;
        }
        $('#' + idDOM).css('left', '120%').hide();

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
};