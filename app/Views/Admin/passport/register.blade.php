@extends('front.layout.login')
@section('body')
    <style type="text/css">
        .required{color: red;}
    </style>
    <div class="layout_top clearfix">
        <div class="container">
            <div class="row">
                <div class="col-sm-0 col-md-1"></div>
                <div class="col-sm-12 col-md-10">
                    <div class="top_mod clearfix">
                        <a class="logo_box" href="javascript:;"></a>
                        <p class="top_t_box">
                            <a class="top_btn_item regis_btn" href="{{ config('sys.shark_core_server_url') }}register ">注册</a>
                            <a class="top_btn_item login_btn" href="{{ url("login") }}">登录</a>
                        </p>
                    </div>
                </div>
                <div class="col-sm-0 col-md-1"></div>
            </div>
        </div>
    </div>
    <div class="clearfix">
        <div class="container">
            <div class="row">
                <div class="col-sm-1 col-md-2"></div>
                <div class="col-sm-10 col-md-8">
                    <div class="login_box">
                        <ul class="tab">
                            <li class="on" style="width: 100%;cursor:default">快速注册</li>
                        </ul>
                        <div class="tab_box">
                            <div class="row">
                                <div class="col-sm-0 col-md-1"></div>
                                {!! Form::open(['url'=>url('register'),'class'=>'col-sm-11 col-md-9 mt46']) !!}
                                    <p class="form_list_box row">
                                        <label class="label_item col-xs-5 col-md-4"><span class="required"> * </span> 手机号</label>
                                        <input type="text" required id="mobile" value="{{ old('mobile') }}" name="mobile" class="input_item col-xs-6 col-md-8"
                                               placeholder="11位手机号码">
                                    </p>
                                    <div class="form_list_box row">
                                        <label class="label_item col-xs-5 col-md-4"><span class="required"> * </span> 短信验证码</label>
                                        <div class="input_box2_item col-xs-6 col-md-8">
                                            <div class="input_box2_in">
                                                {!! Form::text('mobilecaptcha', null, ['class' => 'input_item input_other','required'=>'','placeholder'=>'短信验证码']) !!}
                                                <input id="msg" class="yzm_btn" type="button" value="获取验证码" name="msg" style="cursor:pointer" readonly="readonly" onclick="checkcode()" required="" />
                                            </div>
                                        </div>
                                    </div>
                                    <div id="checkcode" style="position: absolute; z-index: 999; width: 250px; left: 195px; top: 65px;display:none" class="layui-layer layui-anim layui-layer-tips">
                                        <div class="layui-layer-content" style="background-color: #d9d7d7;color: #000000;width: 240px;left: 0;">
                                            <div class="input_box2_in">
                                                {!! Form::text('check_code',null,['id'=>'check_code','class' => 'input_item input_other','placeholder'=>'4位字符','style'=>'width: 220px','oninput'=>"checkinput()"]) !!}
                                                <a class="yzm_img_btn" href="javascript:;" style="left:100px">
                                                    <img src="{{ url('numPhrase') }}"
                                                         onclick="this.src='{{ url('numPhrase') }}?r='+Math.random();"
                                                         title="点击切换验证码" height="48" width="130" class="wp100_img" id="imgcode">
                                                </a>
                                            </div>
                                            <p>请输入右侧图片显示的数据</p>
                                            <i class="layui-layer-TipsG layui-layer-TipsR iconR_right"></i>
                                        </div>
                                        <span class="layui-layer-setwin"></span>
                                    </div>
                                    <p class="form_list_box row">
                                        <label class="label_item col-xs-5 col-md-4"><span class="required"> * </span> 设置密码</label>
                                        <input class="input_item col-xs-6 col-md-8" required id="password" name="password" type="password" placeholder="6-20位字符（不为纯数字）"/>
                                    </p>
                                    <p class="form_list_box row">
                                        <label class="label_item col-xs-5 col-md-4"><span class="required"> * </span> 确认密码</label>
                                        <input class="input_item col-xs-6 col-md-8" required id="password_confirmation" name="password_confirmation" type="password"
                                               placeholder="确认密码"/>
                                    </p>
                                    <p class="form_list_box row">
                                        <span class="label_item col-xs-5 col-md-4"></span>
                                        <input class="input_item mt24 sure_btn col-xs-6 col-md-8" type="submit" value="确认注册"/>
                                    </p>
                                {!! Form::close() !!}
                                <div class="col-sm-1 col-md-2"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-sm-1 col-md-2"></div>
            </div>
        </div>
    </div>
    <div class="layout_footer">
        <p class="mt45">&copy;公司地址：{{config('sys.sys_address')}} 服务电话：{{config('sys.sys_tel')}}</p>
        <p>2014-2015点开微商城 沪ICP备15008932号-1</p>
    </div>
@endsection
@section('script')
    <script src="{{ shark_asset('js/jquery-1.9.1.min.js?v=4.1.0') }}"></script>
    <script src="{{ shark_asset('js/vendor/layer/laydate/laydate.js?v=4.1.0') }}"></script>
    <script type="text/javascript">
        window.onload = function () {
            @if(count($errors) > 0)
                @foreach($errors->all() as $error)
                    top.layer.msg("{{ $error }}", {icon: 2, offset: '200px'});
            @endforeach
            @endif
        };
        seajs.use(['layer', 'jquery'], function (layer) {
            layer.config({
                path: '{{ shark_asset('js/vendor/layer') }}/'
            });
        });
        //检测发送验证码
        function checkcode() {
            var mobile = $("#mobile").val();
            var myreg = /^1\d{10}$/;
            if (!myreg.test(mobile)) {
                top.layer.msg('请输入有效的手机号码！', {icon: 2, offset: '200px'});
                return false;
            }
            //验证手机号是否注册
            $.ajax({
                type: "POST",
                url: "{{ url('register/checkmobile') }}",
                dataType: "json",
                data: {mobile: mobile,_token: '{{ csrf_token() }}'},
                success: function (data) {
                    if (data.code != 0) {
                        top.layer.msg(data.msg, {icon: 2, offset: '200px'});
                        return false;
                    }else{
                        var divcode = document.getElementById("checkcode");
                        if(divcode.style.display == "none"){
                            $("#check_code").val('');
                            divcode.style.display = "block";
                        }else{
                            $("#check_code").val('');
                            divcode.style.display = "none";
                        }
                    }
                },
                error: function () {
                    top.layer.msg('系统异常', {icon: 3, offset: '200px'});
                    return false;
                }
            });
        }
        function checkinput() {
            var code = $("#check_code").val().trim();
            var reg = new RegExp("^[0-9]*$");
            if (code.length == 4 && reg.test(code)) {
                $.ajax({
                    type: "POST",
                    url: "{{ url('login/checkcode') }}",
                    dataType: "json",
                    async: false,
                    data: {_token: '{{ csrf_token() }}'},
                    success: function (data) {
                        if (data.code != 0) {
                            top.layer.msg(data.msg, {icon: 2, offset: '200px'});
                        }
                        else {
                            if(code.toLowerCase() == data.msg.toLowerCase()){
                                var divcode = document.getElementById("checkcode");
                                divcode.style.display = "none";
                                send_msg();
                            }else {
                                $("#imgcode").attr("src","{{ url('numPhrase') }}?r="+Math.random());
                                top.layer.msg('验证码不正确', {icon: 2, offset: '200px'});

                            }
                        }
                    },
                    error: function () {
                        top.layer.msg('系统异常', {icon: 3, offset: '200px'});
                    }
                });
            }
            if (code.length >= 4) {
                setTimeout( function () {
                    $("#check_code").val('');
                }, 1000);
            }
        }

        // 获取短信验证码
        function send_msg() {
            var mobile = $("#mobile").val();
            var myreg = /^1\d{10}$/;
            if (!myreg.test(mobile)) {
                top.layer.msg('请输入有效的手机号码！', {icon: 2, offset: '200px'});
                return false;
            }
            //倒计时变量
            var n = 60;
            $.ajax({
                type: "POST",
                url: "{{ url('register/sendcaptcha') }}",
                dataType: "json",
                async: false,
                data: {msg_type: 7, mobile: mobile, _token: '{{ csrf_token() }}'},
                success: function (data) {
                    if (data.code != 0) {
                        n = 0;
                        top.layer.msg(data.msg, {icon: 2, offset: '200px'});
                    }
                    else {
                        top.layer.msg(data.msg, {icon: 1, offset: '200px'});
                    }
                },
                error: function () {
                    top.layer.msg('系统异常', {icon: 3, offset: '200px'});
                }
            });
            var timeFun = window.setInterval(function () {
                n--;
                $('#msg').val('（' + n + '）' + '正在发送');
                $("#msg").attr("disabled", "disabled");
                $("#msg").attr('class', 'yzm_btn');
                $('#msg').attr('style', 'cursor:not-allowed');
                if (n < 0) {
                    $('#msg').val('重新获取');
                    $('#msg').attr("disabled", false);
                    $('#msg').attr('class', 'yzm_btn');
                    $('#msg').attr('readonly', 'true');
                    $('#msg').attr('style', 'cursor:allowed;cursor:pointer');
                    clearInterval(timeFun);
                }
            }, 1000);
        }
    </script>
@endsection