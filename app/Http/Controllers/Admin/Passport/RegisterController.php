<?php

namespace Shark\Http\Controllers\Front\Passport;

use Illuminate\Http\Request;
use Shark\Http\Requests;
use Shark\Http\Controllers\Controller;
use Shark\Model\Logistics\AreaMap;
use Shark\Service\User\Register;
use Shark\Service\Service\Verify;
use Shark\Service\SMS\SysSms;
use Shark\Model\User\Supplier;
use Shark\Service\Auth\Front;

class RegisterController extends Controller
{
    /**
     * 注册
     *
     * @return mixed
     */
    public function index()
    {
        $supplier_id = session('supplier_id');
        if(is_numeric($supplier_id) && $supplier_id > 0)
        {
            return redirect(url('login'));
        }
        return view('front.passport.register');
    }

    /**
     *  验证注册
     *
     * @param Request $request
     * @return mixed
     */
    public function register(Request $request)
    {
        $password = trim($request->input('password'));
        $password_confirmation = trim($request->input('password_confirmation'));
        $mobile = trim($request->input('mobile'));
        $mobilecaptcha = trim($request->input('mobilecaptcha'));
        if(empty($password))
        {
            $errors[] = "密码不能为空！";
            return back()->withInput()->withErrors($errors);
        }
        if(empty($password_confirmation))
        {
            $errors[] = "确认密码不能为空！";
            return back()->withInput()->withErrors($errors);
        }
        $preg_res = Verify::isPassword($password,6,20);
        if(!$preg_res)
        {
            $errors[] = "密码格式错误，应为6-20字且不能为纯数字！";
            return back()->withInput()->withErrors($errors);
        }
        if ($password != $password_confirmation) {
            $errors[] = "两次输入的密码不一致";
            return back()->withInput()->withErrors($errors);
        }
        if(empty($mobile))
        {
            $errors[] = '手机号不能为空！';
            return back()->withInput()->withErrors($errors);
        }
        $mobile_res = Verify::isMobile($mobile);
        if(!$mobile_res)
        {
            $errors[] = "手机号格式错误！";
            return back()->withInput()->withErrors($errors);
        }
        if(empty($mobilecaptcha))
        {
            $errors[] = '手机验证码不能为空！';
            return back()->withInput()->withErrors($errors);
        }
        //验证手机验证码
        $SysSmsService = new SysSms(0);
        $check_code_res = $SysSmsService->checkCaptcha($mobile, 7, $mobilecaptcha);
        if (!isset($check_code_res['code']) || $check_code_res['code'] == 1) {
            $errors[] = $check_code_res['msg'];
            return back()->withInput()->withErrors($errors);
        }
        $res = Register::supplierRegister($mobile, $password, 1, []);
        if ($res['code'] != 0) {
            $error[] = $res['msg'];
            return back()->withInput()->withErrors($error);
        }
        $login_res = Front::login($res['data']);
        if (!isset($login_res['code']) || $login_res['code'] !== 0) {
            return back()->withInput()->withErrors($login_res['msg']);
        }
        //return redirect('home');
        return redirect('certification');
    }

    /**
     * 发送短信验证码
     *
     * @param Request $request
     * @return array
     */
    public function sendCaptcha(Request $request)
    {
        $msg_type = (int)$request->input('msg_type');
        $mobile = $request->input('mobile');
        if ($msg_type <= 0) {
            return alert_info(1, '短信类型错误');
        }
        if (!Verify::isMobile($mobile)) {
            return alert_info(1, '手机号码错误');
        }
        $supplierModel = new Supplier();
        $info = $supplierModel->getSupplierByMobile($mobile, false);
        if ($info) {
            return alert_info(1, '手机号码已注册');
        }
        $SysSmsService = new SysSms(0);
        $send_res = $SysSmsService->setActiveTime(60*5)->sendCaptcha($mobile, $msg_type);
        return $send_res;
    }
    /**
     * 检测手机号
     *
     * @param Request $request
     * @return mixed
     */
    public function checkMobile(Request $request)
    {
        $mobile = $request->input('mobile');
        if (!Verify::isMobile($mobile)) {
            return alert_info(1, '手机号码错误');
        }
        $supplierModel = new Supplier();
        $info = $supplierModel->getSupplierByMobile($mobile, false);
        if ($info) {
            return alert_info(1, '手机号码已注册');
        }
        return alert_info(0, '手机号码未注册');
    }

    /**
     * 获取二级城市
     *
     * @param Request $request
     */
    public function ajaxGetSubarea(Request $request)
    {
        $AreaMapModel = new AreaMap();
        $area_id = $request->input('id');
        if ($area_id > 0) {
            $subareas = $AreaMapModel->getSubarea($area_id, array('area_id', 'area_name'));
            if ($subareas) {
                $option = '<option value="">--请选择--</option>';
                foreach ($subareas as $subarea) {
                    $option .= '<option value="' . $subarea->area_id . '">' . $subarea->area_name . '</option>';
                }
                return alert_info(0, '', $option);
            } else {
                return alert_info(1);
            }
        }
        return alert_info(1);
    }
}
