@extends('front.layout.login')
@section('body')
    <style type="text/css">
        .required{color: red;}
    </style>
    <div class="layout blue_bg">
        <div class="mod_wrap">
            <div class="form_wrap">
                <h3 class="form_tit">找回密码</h3>
                {!! Form::open(['url'=>url('/password/checkReset'),'class'=>'form_cont', 'id'=>'reset1Form', 'role'=>'form']) !!}
                    <div class="tel_num_wrap">
                        <input name="mobile" id="mobile" type="text" placeholder="请输入手机号码" />
                    </div>
                    <div class="code_btn_box">
                        <input class="input_item margin_b_num" id="check_code" name="check_code" type="text"  oninput="checkinput()" placeholder="请输入验证码" />
                        <div class="code_btn">
                            <a class="yzm_img_btn" href="javascript:void(0);" style="left:100px">
                                <img src="{{ url('captcha') }}"
                                     onclick="this.src='{{ url('captcha') }}?r='+Math.random();"
                                     title="点击切换验证码" height="40" width="130" class="wp100_img" id="imgcode">
                            </a>
                        </div>
                    </div>
                    <input class="form_blue_btn" id="submit" disabled style="cursor:not-allowed" type="submit" value="下一步" />
                {!! Form::close() !!}
            </div>
        </div>
    </div>
@endsection
@section('script')
    <script src="{{ shark_asset('js/jquery-1.9.1.min.js?v=4.1.0') }}"></script>
    <script src="{{ shark_asset('js/vendor/layer/laydate/laydate.js?v=4.1.0') }}"></script>
    <script type="text/javascript">
        $(function () {
            $("#check_code").val('');
        });
        window.onload = function () {
            @if(count($errors) > 0)
                @foreach($errors->all() as $error)
                    top.layer.msg("{{ $error }}", {icon: 2, offset: '270px'});
            @endforeach
            @endif
        };
        seajs.use(['layer', 'jquery'], function (layer) {
            layer.config({
                path: '{{ shark_asset('js/vendor/layer') }}/'
            });
        });
        var icon = "<i class='fa fa-times-circle'></i> ";
        function checkinput() {
            var code = $("#check_code").val().trim();
            if (code.length == 4) {
                $.ajax({
                    type: "POST",
                    url: "{{ url('login/checkcode') }}",
                    dataType: "json",
                    data: {_token: '{{ csrf_token() }}'},
                    success: function (data) {
                        if (data.code != 0) {
                            document.getElementById("submit").disabled=true;
                            $('#submit').attr('style', 'cursor:not-allowed');
                            $("#check_code").val('');
                            top.layer.msg(data.msg, {icon: 2, offset: '200px'});
                        }
                        else {
                            if(code != data.msg){
                                document.getElementById("submit").disabled=true;
                                $('#submit').attr('style', 'cursor:not-allowed');
                                $("#check_code").val('');
                                top.layer.msg('验证码不正确', {icon: 2, offset: '200px'});
                                $("#imgcode").attr("src","{{ url('numPhrase') }}?r="+Math.random());
                            } else {
                                document.getElementById("submit").disabled=false;
                                $('#submit').attr('style', 'cursor:not-allowed');
                                $('#submit').attr('style', 'cursor:allowed;cursor:pointer');
                            }
                        }
                    },
                    error: function () {
                        top.layer.msg('系统异常', {icon: 3, offset: '200px'});
                    }
                });
            }
            if (code.length > 4) {
                document.getElementById("submit").disabled=true;
                $('#submit').attr('style', 'cursor:not-allowed');
                setTimeout( function () {
                    $("#check_code").val('');
                }, 1000);
            }
            if(code.length < 4) {
                document.getElementById("submit").disabled=true;
                $('#submit').attr('style', 'cursor:not-allowed');
            }
        }
        //表单验证
        seajs.use(['vendor/validate/jquery.validate.min', 'form'], function () {
            $.validator.addMethod("isMobile", function(value, element) {
                var tel = /^1\d{10}$/;
                return this.optional(element) || (tel.test(value));
            }, "请输入正确的手机号");
            $("#reset1Form").validate({
                rules: {
                    mobile: {
                        required: true,
                        isMobile: true
                    },
                    check_code: {
                        required: true
                    }
                },
                messages: {
                    mobile:{
                        required: icon + "请输入手机号"
                    },
                    check_code:{
                        required: icon + "请输入验证码"
                    }
                }
            });
        });
    </script>
@endsection