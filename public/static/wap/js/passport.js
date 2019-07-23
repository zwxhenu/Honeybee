(function ($) {
    $.passport = function (option) {
        var defaultOption = {
            logoutUrl: getUrl('logout'),
            loginUrl: getUrl('login'),
            userUrl: getUrl('user'),
            registerUrl: getUrl('register'),
            resetPasswordUrl: getUrl('forgetpassword'),
            checkRegistUrl: getUrl('register/ajaxCheckRegist'),
            sendCaptchaUrl: getUrl('register/sendCaptcha'),
            CheckLoginUrl: getUrl('login/ajaxCheckLogin'),
            checkCall:null
        };
        option = $.extend(defaultOption, option);

        // 登录
        $('.j-login').click(function () {
            var $thisparent = $(this).closest('.login_layer');
            var mobile = $thisparent.find('.j-mobile').val(),
                pwd = $thisparent.find('.j-pwd').val(),
                $tip = $thisparent.find('.wrong_win');
            if (!mobile) {
                $tip.text('请输入手机号');
                return false;
            }
            if (!pwd) {
                $tip.text('请输入密码');
                return false;
            }

            $.post(option.loginUrl, {
                _token: option.token,
                mobile: mobile,
                password: pwd
            }, function (res) {
                if (res.code == 0) {
                    alert('登录成功');
                    setTimeout(function() {
                        loginRedirect(option.userUrl);
                    }, 500);
                } else {
                    $tip.text(res.msg);
                }

            }, 'json');
        });
        // 注册
        $('.j-regist').click(function () {
            var $thisparent = $(this).closest('.login_layer');
            var mobile = $thisparent.find('.j-mobile').val(),
                pwd = $thisparent.find('.j-pwd').val(),
                captcha = $thisparent.find('.j-captcha').val(),
                $tip = $thisparent.find('.wrong_win');
            if (!mobile) {
                $tip.text('请输入手机号');
                return false;
            }

            if (!captcha) {
                $tip.text('请输入验证码');
                return false;
            }
            if (!pwd) {
                $tip.text('请输入密码');
                return false;
            }
            $.post(option.registerUrl, {
                _token: option.token,
                mobile: mobile,
                captcha: captcha,
                password: pwd
            }, function (res) {
                if (res.code == 0) {
                    $('.js-regist-div').hide();
                    $('.js-registok-div').show();
                    setTimeout(function () {
                        loginRedirect();
                    }, 2000);
                } else {
                    $tip.text(res.msg);
                }
            }, 'json');
        });
        // 退出登录
        $('.js-logout').click(function () {
            $.post(option.logoutUrl, {
                _token: option.token
            }, function (res) {
                alert('退出成功！');
                loginRedirect(option.userUrl);
            }, 'json');
        });
        // 忘记密码
        $('.j-password').click(function () {
            var $thisparent = $(this).closest('.login_layer');
            var mobile = $thisparent.find('.j-mobile').val(),
                pwd = $thisparent.find('.j-pwd').val(),
                captcha = $thisparent.find('.j-captcha').val(),
                $tip = $thisparent.find('.wrong_win');
            if (!mobile) {
                $tip.text('请输入手机号');
                return false;
            }

            if (!captcha) {
                $tip.text('请输入验证码');
                return false;
            }
            if (!pwd) {
                $tip.text('请输入密码');
                return false;
            }
            $.post(option.resetPasswordUrl, {
                _token: option.token,
                mobile: mobile,
                captcha: captcha,
                password: pwd,
                type: 1
            }, function (res) {
                if (res.code == 0) {
                    $('.js-password-div').hide();
                    $('.js-passwordok-div').show();
                    setTimeout(function () {
                        loginRedirect();
                    }, 2000);
                } else {
                    $tip.text(res.msg);
                }
            }, 'json');
        });
        //检测发送验证码
        $('.tip_time').click(function () {
            var $thisparent = $(this).closest('.login_layer');
            var type = $(this).attr('data-type');
            var mobile = $thisparent.find('.j-mobile').val();
            var myreg = /^1\d{10}$/;
            if (!myreg.test(mobile)) {
                alert('请输入有效的手机号码！');
                return false;
            }
            //验证手机号是否注册
            $.ajax({
                type: "POST",
                url: option.checkRegistUrl,
                dataType: "json",
                data: {mobile: mobile, _token: option.token},
                success: function (data) {
                    if (data.code == type) {
                        send_msg($thisparent);
                    } else {
                        alert(data.msg);
                        return false;
                    }
                },
                error: function () {
                    alert('系统异常');
                    return false;
                }
            });
        });

        // 发送短信验证码
        function send_msg(ele) {
            var mobile = ele.find('.j-mobile').val();

            var myreg = /^1\d{10}$/;
            if (!myreg.test(mobile)) {
                alert('请输入有效的手机号码！');
                return false;
            }
            var $tip = ele.find(".wrong_win");
            var $this = ele.find(".tip_time");
            var smstype = $this.attr('data-smstype');
            if($this.attr('no_send') == 1)
            {
                return false;
            }

            $.ajax({
                type: "POST",
                url: option.sendCaptchaUrl,
                dataType: "json",
                data: {msg_type: smstype, mobile: mobile, _token: option.token},
                success: function (data) {
                    if (data && data.code == 0) {
                        $this.attr('no_send','1');
                        $tip.text(data.msg);
                        var time = 60;
                        interval = setInterval(function () {
                            time--;
                            if (time <= 0) {
                                $this.text('重新获取');
                                $this.attr('no_send','0');
                                clearInterval(interval);
                                return false;
                            }
                            $this.text(time + '秒后重新获取')
                        }, 1000);
                    } else if (data) {
                        $this.text('重新发送');
                        $tip.text(data.msg);

                    }
                },
                error: function () {
                    alert('系统异常');
                }
            });

        }

        function showLogin() {
            $(".js-login-div").fadeIn("100");
        }

        //登录成功后跳转
        function loginRedirect(redirectUrl) {
            if (redirectUrl) {
                location = redirectUrl;
            } else {
                location.reload();
            }
        }

        // 忘记密码窗口
        $('.js-password').click(function () {
            $(".js-login-div").fadeOut("fast");
            $(".js-password-div").fadeIn("100");
        });
        //弹出注册窗口
        $(".js-regist,.js-login-div .quick_reg").click(function () {
            $(".js-login-div").fadeOut("fast");
            $(".js-regist-div").fadeIn("100");
        });
        // 注册转登录窗口
        $(".js-regist-div .quick_reg").click(function () {
            $(".js-regist-div").fadeOut("fast");
            $(".js-login-div").fadeIn("100");
        });
        // 忘记密码转注册窗口
        $(".js-password-div .quick_reg").click(function () {
            $(".js-password-div").fadeOut("fast");
            $(".js-login-div").fadeIn("100");
        });

        $(".close_tip").click(function () {
            $(this).closest(".login_layer ").fadeOut("100");
        });
        // ajax 检测是否登录
        $(".js-login").click(function () {
            $.ajax({
                url: option.CheckLoginUrl,
                type: 'POST',
                data: {_token: option.token},
                dataType: 'json',
                error: function (d) {

                },
                success: function (d) {
                    option.checkCall && option.checkCall(d.code);
                    if (d.code !== 0) {
                        showLogin();
                    } else {
                        if (option.userUrl) {
                            location.href = option.userUrl;
                        }
                    }
                }
            });
        });

    }
})(jQuery);