@extends('front.layout.common')
@section('body')
    <div class="container-fluid">
        <div class="page-header text-center">
            <h1>重置密码</h1>
        </div>
        <div class="middle-box text-center loginscreen  animated fadeInDown">
            <form id="reset" action="{{ url('/password/reset') }}" method="post">
                <input type="hidden" name="_token" value="{{ csrf_token() }}">
                <div class="form-group">
                    <input type="text" class="form-control" value="{{ old('mobile') }}" required id="mobile"
                           name="mobile" placeholder="手机号">
                </div>
                <div class="form-group">
                    <div class="input-group">
                        <input type="text" class="form-control" required id="checkcode" name="checkcode"
                               placeholder="手机验证码">
                        <div class="input-group-addon" id="getCode">获取验证码</div>
                    </div>
                </div>
                <div class="form-group">
                    <input type="password" class="form-control" required id="password" name="password" placeholder="密码">
                </div>
                <div class="form-group">
                    <input type="password" class="form-control" required id="confirm" name="password_confirmation"
                           placeholder="确认密码">
                </div>
                <div class="form-group">
                    <input type="submit" class="btn btn-primary btn-block" value="重置密码">
                </div>
                @if(count($errors) > 0)
                    <p class="alert  alert-danger">
                        @foreach($errors->all() as $error)
                            {{ $error }}<br/>
                        @endforeach
                    </p>
                @endif
            </form>
            <p class="text-muted text-center">
                <a href="{{ url('login') }}">
                    登录
                </a>
                | <a href="{{ config('sys.shark_core_server_url') }}register">注册一个新账号</a>
            </p>
        </div>
    </div>
@endsection