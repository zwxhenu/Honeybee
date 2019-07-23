@extends('admin.layout.login')
@section('body')
<div class="layout blue_bg2">
    <div class="mod_wrap from_bg_box">
        <div class="form2_wrap">
            <div class="plot">
                <ul class="plot_ul">
                    <li class="cur">
                        <a href="javascript:void(0);">密码登录</a>
                    </li>
                    <li>
                        <a href="javascript:void(0);">短信登录</a>
                    </li>
                </ul>
            </div>
            <div class="Login_wrap com_tab show">
                {!! Form::open(['url'=>url('login').'?redirect_url='.$redirect_url, 'id'=>"login1Form", 'class'=>'form_cont']) !!}
                <div class="tel_num_wrap">
                    <input name="login_name" id="login_name" type="text" required="" placeholder="邮箱/用户名/手机号"/>
                </div>
                <div class="tel_num_wrap">
                    <input name="password" id="password" type="password" required="" placeholder="密码"/>
                </div>
                <input class="form_blue_btn" type="submit" value="登    录"/>
                <p class="form_link_box">
                    <a href="{{url('password/reset')}}">忘记密码?</a>
                    @if($is_register)
                        <a class="r_registered_link" target="_blank" href="{{ config('sys.shark_core_server_url') }}register?redirect_url={{$_SERVER['HTTP_HOST']}}">免费注册></a>
                    @endif
                </p>
                {!! Form::close() !!}
            </div>
            <div class="Login_wrap com_tab">
                {!! Form::open(['url'=>url('login/authmobile'),'class'=>'form_cont', 'id'=>'login2Form', 'role'=>'form']) !!}
                <div class="tel_num_wrap">
                    <input id="mobile" name="mobile" required="" type="text" placeholder="请输入手机号码"/>
                </div>
                <div class="code_btn_box">
                    <input id="mobilecaptcha" name="mobilecaptcha" class="input_item margin_b_num" required="" type="text" placeholder="请输入短信验证码"/>
                    <input id="msg" class="code_btn" type="button" value="发送验证码" name="msg"
                           style="cursor:pointer" readonly="readonly" onclick="send_msg()" required=""/>
                </div>
                <input class="form_blue_btn" type="submit" value="登    录"/>
                <p class="form_link_box">
                    <a href="{{url('password/reset')}}">忘记密码?</a>
                    @if($is_register)
                        <a class="r_registered_link" target="_blank" href="{{ config('sys.shark_core_server_url') }}register?redirect_url={{$_SERVER['HTTP_HOST']}}">免费注册></a>
                    @endif
                </p>
                {!! Form::close() !!}
            </div>
        </div>
        @if($is_register)
            <div style="position: absolute; right: 80px; top: 410px; font-size: 16px; overflow: hidden; width: 240px;">
                <a style="color: #FFFFFF;" target="_blank" href="http://www.ediankai.com/index.php?m=index&c=login&a=supplier">旧版点开微商城登录</a>
            </div>
        @endif
    </div>

</div>
@endsection
@section('script')
    <script src="{{ shark_asset('js/jquery-1.9.1.min.js?v=4.1.0') }}"></script>
    <script src="{{ shark_asset('js/vendor/layer/laydate/laydate.js?v=4.1.0') }}"></script>
    <script type="text/javascript">
        window.onload = function () {
            @if(count($errors) > 0)
                @foreach($errors->all() as $error)
                    top.layer.msg("{{ $error }}", {icon: 2, offset:  ['40%', '63%'], });
            @endforeach
            @endif
        };
        seajs.use(['layer', 'jquery'], function (layer) {
            layer.config({
                path: '{{ shark_asset('js/vendor/layer') }}/'
            });
        });
        $(function () {
            var loginPage = $('#login'),
                    aLoginLi = loginPage.find('.plot_ul li'),
                    aTabDiv = loginPage.find('.com_tab');
            aLoginLi.on('click', function () {
                var index = $(this).index();
                aLoginLi.removeClass('cur');
                $(this).addClass('cur');
                aTabDiv.removeClass('show');
                aTabDiv.eq(index).addClass('show');
            });
        });

        // 获取短信验证码
        function send_msg() {
            var mobile = $("#mobile").val();
            var myreg = /^1\d{10}$/;
            if (!myreg.test(mobile)) {
                top.layer.msg('请输入有效的手机号码！', {icon: 2, offset: ['40%', '63%']});
                return false;
            }
            //倒计时变量
            var m = 60;
            $.ajax({
                type: "POST",
                url: "{{ url('login/sendcaptcha') }}",
                dataType: "json",
                data: {msg_type: 6, mobile: mobile, _token: '{{ csrf_token() }}'},
                success: function (data) {
                    if (data.code != 0) {
                        if (data.code == 1) {
                            top.layer.msg(data.msg, {icon: 1, offset: ['40%', '63%']});
                        }
                        else if (data.code == 2) {
                            m = 0;
                            top.layer.msg(data.msg, {icon: 2, offset: ['40%', '63%']});
                            $("#mobile").val('');
                        }
                        else {
                            top.layer.msg(data.msg, {icon: 1, offset: ['40%', '63%']});
                        }
                    }
                    else {
                        top.layer.msg(data.msg, {icon: 1, offset: ['40%', '63%']});
                    }
                },
                error: function () {
                    top.layer.msg('系统异常', {icon: 3, offset: ['40%', '63%']});
                }
            });
            var timeFun = window.setInterval(function () {
                m--;
                if (m > 0) {
                    $('#msg').val('(' + m + ')' + '正在发送');
                    $("#msg").attr("disabled", "disabled");
                    $("#msg").attr('class', 'code_btn');
                    $('#msg').attr('style', 'cursor:not-allowed');
                }
                if (m < 0) {
                    $('#msg').val('重新获取');
                    $('#msg').attr("disabled", false);
                    $('#msg').attr('class', 'code_btn');
                    $('#msg').attr('readonly', 'true');
                    $('#msg').attr('style', 'cursor:allowed;cursor:pointer');
                    clearInterval(timeFun);
                }
            }, 1000);
        }

        // 表单验证
        var icon = "<i class='fa fa-times-circle'></i> ";
        seajs.use(['vendor/validate/jquery.validate.min', 'form'], function () {
            $("#login1Form").validate({
                rules: {
                    login_name: {
                        required: true
                    },
                    password: {
                        required: true
                    }
                },
                messages: {
                    login_name:{
                        required: icon + "请输入登录名"
                    },
                    password:{
                        required: icon + "请输入密码"
                    }
                }
            });

            $.validator.addMethod("isMobile", function(value, element) {
                var tel = /^1\d{10}$/;
                return this.optional(element) || (tel.test(value));
            }, "请输入正确的手机号");
            $("#login2Form").validate({
                rules: {
                    mobile: {
                        required: true,
                        isMobile: true
                    },
                    mobilecaptcha: {
                        required: true
                    }
                },
                messages: {
                    mobile:{
                        required: icon + "请输入手机号"
                    },
                    mobilecaptcha:{
                        required: icon + "请输入手机验证码"
                    }
                }
            });
        });
    </script>
@endsection