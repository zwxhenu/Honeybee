@extends('front.layout.login')
@section('body')
    <div class="layout blue_bg">
        <div class="mod_wrap">
            <div class="form_wrap">
                <h3 class="form_tit">重置密码</h3>
                {!! Form::open(['url'=>url('/password/doReset'),'class'=>'form_cont', 'id'=>'reset2Form', 'role'=>'form','onsubmit'=>'return false;']) !!}
                    <div class="tel_num_wrap">
                        <input class="add_bor_onfouce" id="mobile" name="mobile" type="text" value="{{ $mobile }}" readonly="true" placeholder="请输入手机号" />
                    </div>
                    <div class="tel_num_wrap">
                        <input class="add_bor_onfouce" id="password" name="password" type="password" placeholder="设置密码（请输入6-20位字母或数字）" />
                    </div>
                    <div class="code_btn_box">
                        <input class="input_item margin_b_num" id="mobilecaptcha" name="mobilecaptcha" type="text" placeholder="请输入短信验证码"/>
                        <input id="msg" class="code_btn" type="button" value="发送验证码" name="msg"
                               style="cursor:pointer" readonly="readonly" onclick="send_msg()" required=""/>
                    </div>
                    <input class="form_blue_btn" type="submit" value="确认重置" />
                    <a class="form_back" href="javascript:history.back(-1);">返回</a>
                {!! Form::close() !!}
            </div>
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
                    top.layer.msg("{{ $error }}", {icon: 2, offset: '200px'});
            @endforeach
            @endif
        };
        seajs.use(['layer', 'jquery'], function (layer) {
            layer.config({
                path: '{{ shark_asset('js/vendor/layer') }}/'
            });
        });
        
        $(function () {
            $('#password').val('');
        })

        // 获取短信验证码
        function send_msg() {
            var mobile = $("#mobile").val();
            //倒计时变量
            var m = 60;
            $.ajax({
                type: "POST",
                url: "{{ url('login/sendcaptcha') }}",
                dataType: "json",
                data: {msg_type: 13, mobile: mobile, _token: '{{ csrf_token() }}'},
                success: function (data) {
                    if (data.code != 0) {
                        if (data.code == 1) {
                            top.layer.msg(data.msg, {icon: 2, offset: '200px'});
                        }
                        else if (data.code == 2) {
                            m = 0;
                            top.layer.msg(data.msg, {icon: 2, offset: '200px'});
                            setTimeout("location.href = '{{ url("register") }}'", 2000);
                        }
                        else {
                            top.layer.msg(data.msg, {icon: 2, offset: '200px'});
                        }
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

        //表单验证
        var icon = "<i class='fa fa-times-circle'></i> ";
        seajs.use(['vendor/validate/jquery.validate.min', 'form'], function () {
            $.validator.addMethod("isMobile", function(value, element) {
                var tel = /^1\d{10}$/;
                return this.optional(element) || (tel.test(value));
            }, "请输入正确的手机号");
            $.validator.addMethod("isMobileCheck", function(value, element) {
                var tel = /^\d{6}$/;
                return this.optional(element) || (tel.test(value));
            }, "请输入正确的验证码");
            $("#reset2Form").validate({
                rules: {
                    mobile: {
                        required: true,
                        isMobile: true
                    },
                    password: {
                        required: true,
                        minlength: 6,
                        maxlength: 20
                    },
                    mobilecaptcha: {
                        required: true,
                        isMobileCheck: true
                    }
                },
                messages: {
                    mobile:{
                        required: icon + "请输入手机号"
                    },
                    password:{
                        required: icon + "请输入密码",
                        minlength: icon + "密码长度不能低于6位",
                        maxlength: icon + "密码长度不能大于20位"
                    },
                    mobilecaptcha: {
                        required: icon + "请输入验证码"
                    }
                }, submitHandler: function (form) {
                    layer.msg('提交中', {icon: 16, shade: 0.8, shadeClose: false, time: 0});
                    $(form).ajaxSubmit({
                        url: '{{ url('/password/doReset') }}',
                        type: 'post',
                        dataType: 'json',
                        success: function (res) {
                            if (res.code == 0) {
                                location.href = "{{ url('/password/resetSuccess') }}";
                            } else {
                                top.layer.msg(res.msg, {icon: 2, offset: '200px'});
                            }
                        }, error: function () {
                            top.layer.msg('系统异常！', {icon: 2, offset: '200px'});
                        }
                    });
                }
            });
        });
    </script>
@endsection