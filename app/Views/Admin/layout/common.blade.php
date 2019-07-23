<!DOCTYPE html>
<html lang="zh-cmn-Hans">
<head>
    <title>{{ $title or config('sys.sys_name') }}</title>
    <meta charset="utf-8">
    <meta name="renderer" content="webkit">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="keywords" content="{{ $keywords or config('sys.sys_name') }}">
    <meta name="description" content="{{ $keywords or config('sys.sys_name') }}">
    <link rel="shortcut icon" href="{{ shark_asset('favicon.ico') }}">
    <link href="{{ shark_asset('css/bootstrap.min.css?v=3.3.6') }}" rel="stylesheet">
    <link href="{{ shark_asset('css/font-awesome.css?v=4.4.0') }}" rel="stylesheet">
    <link href="{{ shark_asset('css/plugins/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css') }}" rel="stylesheet">
    <link href="{{ shark_asset('css/animate.css') }}" rel="stylesheet">
    <link href="{{ shark_asset('css/style.css?v=4.1.0') }}" rel="stylesheet">
    @yield('header')
</head>
<body class="gray-bg">
@yield('body')
<!-- 全局js -->
<script src="{{ shark_asset('js/vendor/sea.js') }}" id="seajsnode"></script>
<script src="{{ shark_asset('js/main.js') }}"></script>
@yield('script')
</body>
</html>