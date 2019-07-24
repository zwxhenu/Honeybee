<?php

namespace Honeybee\Http\Controller\Admin;

use Honeybee\Http\Controllers\Controller;

/**
 * 后台管理 Controller
 *
 * Created by PhpStorm.
 * User: user
 * Date: 2019/7/24
 * Time: 11:20
 */


class AdminController extends Controller
{

    public function __construct()
    {
        $this->checkPriv();
    }

    /**
     * 检测子账户权限
     */
    public function checkPriv()
    {

    }
}

