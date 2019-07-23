@extends('front.layout.login')
@section('body')
<div class="layout blue_bg">
    <div class="mod_wrap">
        <div class="form_wrap">
            <img class="form_state_icon" src="{{ shark_asset('images/success_icon01.png') }}">
            <p class="state_tet">密码重置成功!</p>
            <div class="pdlr17">
                <a class="form_blue_btn" href="{{url('login')}}">立即登录</a>
            </div>
        </div>
    </div>
</div>
@endsection