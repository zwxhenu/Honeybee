<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

//网站主页、登录、注册   无需登录
Route::group(['namespace' => 'Admin'], function () {
    // 微信
//    Route::any('wechat_event/{appid}', 'Wechat\ServeController@index');
//    Route::any('wechat_redirect', 'Wechat\AuthRedirectController@index');
//
//    Route::get('captcha', 'Index\CaptchaController@index');
//    Route::get('shortlink', 'Index\ShortLinkController@index');
//    Route::get('numPhrase', 'Index\CaptchaController@numPhrase');
//    Route::get('pic', 'Product\ThumbPicController@index');
    //登录
    Route::get('login', 'Passport\LoginController@login');
//    Route::post('login', 'Passport\LoginController@auth');
//    Route::post('login/authmobile', 'Passport\LoginController@authMobile');
//    Route::post('login/sendcaptcha', 'Passport\LoginController@sendCaptcha');
//    Route::post('login/checkcode', 'Passport\LoginController@checkCode');
});
