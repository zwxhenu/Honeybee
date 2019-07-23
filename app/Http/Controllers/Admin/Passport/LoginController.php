<?php

namespace Honeybee\Http\Controllers\Admin\Passport;

use Illuminate\Http\Request;

use Honeybee\Http\Requests;
use Honeybee\Http\Controllers\Controller;
//use Honeybee\Library\SharkCoreClient\TopClient;
//use Honeybee\Model\Site\SupplierSite;
//use Honeybee\Model\User\Supplier;
use Illuminate\Support\Facades\Hash;
//use Honeybee\Service\Auth\Front;
//use Honeybee\Service\SMS\SysSms;
//use Honeybee\Service\Open\Oauth2Sdk;
//use Honeybee\Service\Service\Verify;
use Input;
use Mockery\Container;

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
        // 跳转地址
//        $redirect_url = $request->input('redirect_url');
//        if (Front::isLogin()) {
//            if (!empty($redirect_url)) {
//                return redirect($redirect_url);
//            }
//            return redirect('home');
//        }
//        if (!empty($redirect_url)) {
//            $redirect_url = urlencode(htmlspecialchars_decode($redirect_url));
//        }
//        $is_register = false;
        //if($_SERVER['HTTP_HOST'] == config('sys.shark_http_host')) $is_register = true;

//        $supplierSiteModel = new SupplierSite();
//        $site_info = $supplierSiteModel->getOneByDomain($_SERVER['HTTP_HOST']);

        return view('front.passport.login');
    }

}
