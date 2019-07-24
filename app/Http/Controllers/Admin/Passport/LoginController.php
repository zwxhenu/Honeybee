<?php

namespace Honeybee\Http\Controllers\Admin\Passport;

use Honeybee\Http\Controllers\Controller;

class LoginController extends Controller
{
    /**
     * 用户登录
     *
     * @param Request $request
     * @return mixed
     */
    public function login(Request $request)
    {
        return view('front.passport.login');
    }

}
