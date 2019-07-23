<?php

namespace Shark\Http\Controllers\Front\Passport;

use Illuminate\Http\Request;
use Shark\Http\Requests;
use Shark\Http\Controllers\Controller;
use Shark\Model\Site\SupplierSite;
use Shark\Model\User\Supplier;
use Shark\Service\SMS\SysSms;
use Shark\Service\Service\Verify;
use Validator, Redirect;

class PasswordController extends Controller
{
    /**
     * 重置密码
     *
     * @return mixed
     */
    public function reset()
    {
        $supplierSiteModel = new SupplierSite();
        $site_info = $supplierSiteModel->getOneByDomain($_SERVER['HTTP_HOST']);

        return view('front.passport.reset', compact('site_info'));
    }

    /**
     * 重置密码检测
     * @param Request $request
     * @return $this
     */
    public function checkReset(Request $request)
    {
        $rules = array(
            'mobile' => 'required|digits:11',
            'check_code' => 'required'
        );
        $message = array(
            'required' => ':attribute 不能为空',
            'mobile.digits' => ':attribute 位数应为11位'
        );
        $attributes = array(
            'mobile' => '手机号',
            'mobilecaptcha' => '验证码'
        );
        $validator = Validator::make($request->all(), $rules, $message, $attributes);
        if ($validator->fails()) {
            return Redirect::back()->withInput()->withErrors($validator);
        }

        $check_code = trim($request->input('check_code'));
        if (empty(session('phrase')) || $check_code != session('phrase'))
            return back()->withInput()->withErrors('验证码错误！');
        //验证手机验证码
        $mobile = trim($request->input('mobile'));
        $mobile_res = Verify::isMobile($mobile);
        if (!$mobile_res)
            return back()->withInput()->withErrors('手机号格式错误！');
        $SupplierModel = new Supplier();
        $supplier_info = $SupplierModel->getSupplierByMobile($mobile);
        if (empty($supplier_info))
            return back()->withInput()->withErrors('手机号码不存在！');

        $supplierSiteModel = new SupplierSite();
        $site_info = $supplierSiteModel->getOneByDomain($_SERVER['HTTP_HOST']);

        return view('front.passport.doReset', compact('mobile', 'site_info'));
    }

    /**
     * 重置密码
     *
     * @param Request $request
     * @return Redirect
     */
    public function doReset(Request $request)
    {
        // 验证传入参数
        $rules = array(
            'mobile' => 'required|digits:11',
            'mobilecaptcha' => 'required|digits:6',
            'password' => 'required|min:6|max:20'
        );
        $message = array(
            'required' => ':attribute 不能为空',
            'mobile.digits' => ':attribute 位数应为11位',
            'mobilecaptcha.digits' => ':attribute 位数应为6位',
            'password.min' => ':attribute 最少应为6位',
            'password.max' => ':attribute 最多应为20位'
        );
        $attributes = array(
            'mobile' => '手机号',
            'mobilecaptcha' => '短信验证码',
            'password' => '密码'
        );

        $validator = Validator::make($request->all(), $rules, $message, $attributes);
        if ($validator->fails()) {
            return alert_info(1, $validator->errors()->first(), $validator->errors());
        }

        $errors = [];
        $mobile = trim($request->input('mobile'));
        $msg = $request->input('mobilecaptcha');
        $password = $request->input('password');

        $mobile_res = Verify::isMobile($mobile);
        if (!$mobile_res) {
            return alert_info(1, '手机号格式错误');
        }
        $SupplierModel = new Supplier();
        $supplier_info = $SupplierModel->getSupplierByMobile($mobile);
        if (empty($supplier_info)) {
            return alert_info(1, '手机号码不存在');
        }
        //验证手机验证码
        $SysSmsService = new SysSms(0);
        $check_code_res = $SysSmsService->checkCaptcha($mobile, 13, $msg);
        if (!isset($check_code_res['code']) || $check_code_res['code'] == 1) {
            return alert_info(1, $check_code_res['msg']);
        }
        $new_pwd = bcrypt($password);
        $data = ['password' => $new_pwd, 'updated_at' => date('Y-m-d H:i:s')];
        $res = $SupplierModel->update($supplier_info->supplier_id, $data);
        if (is_numeric($res) && $res > 0) {
            return alert_info(0, '更新成功！');
        } else {
            return alert_info(0, '重置失败，请稍后重试！');
        }
    }

    /**
     * 重置成功
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function resetSuccess()
    {
        $supplierSiteModel = new SupplierSite();
        $site_info = $supplierSiteModel->getOneByDomain($_SERVER['HTTP_HOST']);

        return view('front.passport.resetSuccess', compact('site_info'));
    }

    /**
     * 检测手机号
     *
     * @param Request $request
     * @return array
     */
    public function checkMobile(Request $request)
    {
        $mobile = $request->input('mobile');
        if (empty($mobile)) {
            return alert_info(1, '请输入手机号！');
        }
        if (!Verify::isMobile($mobile)) {
            return alert_info(1, '手机号码错误');
        }
        $supplierModel = new Supplier();
        $info = $supplierModel->getSupplierByMobile($mobile, false);
        if (empty($info)) {
            return alert_info(1, '手机号码不存在!');
        }
        return alert_info(0, '验证成功！');
    }
}
