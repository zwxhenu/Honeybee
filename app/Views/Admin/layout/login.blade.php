<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
    <title>{{ $title or config('sys.sys_name') }}</title>
    <meta charset="utf-8">
    <meta name="renderer" content="webkit">
    <meta name="_token" content="{!! csrf_token() !!}"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="keywords" content="{{ $keywords or config('sys.sys_name') }}">
    <meta name="description" content="{{ $keywords or config('sys.sys_name') }}">
    <link rel="shortcut icon" href="{{ shark_asset('favicon.ico') }}">
    <link rel="stylesheet" type="text/css" href="{{ shark_asset('css/loginbase.css?v=4.1.0') }}"/>
    <link rel="stylesheet" type="text/css" href="{{ shark_asset('css/bootstrap.min.css?v=4.1.0') }}"/>
    <link rel="stylesheet" type="text/css" href="{{ shark_asset('css/style-login.css') }}"/>
    <link href="{{ shark_asset('css/font-awesome.css?v=4.4.0') }}" rel="stylesheet">
    <link href="{{ shark_asset('css/plugins/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css') }}" rel="stylesheet">
    <link href="{{ shark_asset('css/animate.css') }}" rel="stylesheet">
    <link href="{{ shark_asset('css/style.css?v=4.1.0') }}" rel="stylesheet">
    @yield('header')
    <style type="text/css">
        @if(!empty($site_info))
            .logo_box {
                background: url('{{ str_replace('\\', '/', shark_attached($site_info->company_logo))}}') no-repeat left center /100%;
            }
            .from_bg_box {
                background: url('{{ str_replace('\\', '/', shark_attached($site_info->theme_pic))}}') no-repeat;
                background-size: 100%;
            }
            .blue_bg2 {
                background-color: {{ $site_info->theme_color }};
            }
            .blue_bg {
                background-color: {{ $site_info->theme_color }};
            }
        @else
            .logo_box {
                background: url("{{ shark_asset('images/logo_dk1.png') }}") no-repeat left center;
            }
            .from_bg_box {
                background: url({{ shark_asset('images/form_banner01.jpg') }} ) no-repeat;
                background-size: 100%;
            }
            .blue_bg2 {
                background-color: #5892f0;
            }
            .blue_bg {
                background-color: #5892f0;
            }
        @endif
    </style>

</head>
<body id="login">
<div class="top_Nav">
    <div class="top_Nav_box clearfix">
        <a style="margin: 5px 0 15px 0;" class="logo_box" href="{{ !empty($site_info) ? 'javascript:void(0)' : 'http://www.ediankai.com'}}"></a>
        <p class="company_name_r">{{ isset($site_info->company_name) ? $site_info->company_name : '' }}</p>
    </div>
</div>
@yield('body')
<p class="footer_copyright">&copy;{{ isset($site_info->footer) ? $site_info->footer : '2014-2015点开微商城 沪ICP备15008932号-1' }}</p>
<!-- 全局js -->
<script src="{{ shark_asset('js/vendor/sea.js') }}" id="seajsnode"></script>
<script src="{{ shark_asset('js/main.js') }}"></script>
<script src="{{ shark_asset('js/jquery-1.9.1.min.js') }}"></script>
@yield('script')
</body>
</html>