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
    //登录
    Route::get('login', 'Passport\LoginController@login');
});
