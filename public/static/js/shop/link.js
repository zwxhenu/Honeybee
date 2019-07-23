;(function (global) {
    var shopLink = global.shopLink = {
            links: {
                micro_page: {title: '微页面及分类', event: 'microPage'},
                goods: {title: '商品及分组', event: 'goods'},
                //marketing: {title: '营销活动', event: 'marketing'},
                home: {title: '店铺主页', event: 'link'},
                personal: {title: '会员主页', event: 'link'},
                all_goods: {title: '全部商品', event: 'link'},
                goods_group: {title: '商品分组', event: 'link'},
                order: {title: '我的订单', event: 'link'},
                custom: {title: '自定义链接', event: 'custom'}
            },
            relLinks: {
                page_cat: {title: '微页面分类', event: 'pageCat'},
                goods_cat: {title: '商品分组', event: 'goodsCat'}
            }
        },
        tplArr = [],//链接模板
        type = '',//链接类型，对应shoplink里的key
        $dropdown = null,//当前操作的下拉菜单
        $link = null,//链接
        $linkTag = $('<div class="pull-left j-tag link-to"><span class="label label-success"></span></div>'),//选择链接后的标签
        $tagLabel = $linkTag.find('span');
    shopLink.createLink = function ($parent, text, linkType) {
        linkType = linkType || 0;
        if (!tplArr[linkType]) {
            text = text || '设置链接页面';
            var h = '<div class="dropdown pull-left hover j-dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="javascript:void(0);"><span>' + text + '</span><i class="caret"></i></a><ul class="dropdown-menu j-dropdown-menu">',
                links = this.links;
            if (linkType == 1) {
                links = this.relLinks;
            }
            for (var p in links) {
                h += '<li><a href="javascript:" data-type="' + p + '">' + links[p].title + '</a></li>';
            }
            h += '</ul></div>';
            tplArr[linkType] = $(h);
        }
        $dropdown = tplArr[linkType].clone();
        $parent.append($dropdown);
        bindEvent();
        return $dropdown;
    };
    function bindEvent() {
        if (!$dropdown) {
            return false;
        }
        $dropdown.find('.j-dropdown-menu li a').click(function (i) {
            type = $(this).attr('data-type');
            $dropdown = $(this).closest('.j-dropdown');
            $link = $dropdown.siblings('.j-link');
            trigger();
        });
    }

    //触发事件
    function trigger() {
        var links = getLinks(),
            event = links[type].event || '', func = events[event];
        if (func && typeof func == 'function') {
            func();
        }
    }

    function setTag(label, link) {
        $dropdown.siblings('.j-tag').remove();
        $link.val(link).change();
        $tagLabel.html(label);
        $dropdown.before($linkTag.clone());
        $dropdown.find('a.dropdown-toggle span').html('修改');
    }

    shopLink.pop = function (url, success) {
        top.layer.open({
            type: 2,
            title: '',
            shadeClose: true,
            shade: 0.1,
            area: ['40%', '60%'],
            content: url,
            success: function (layero, index) {
                success && $.isFunction(success) && success(layero, index);
            }
        });
    };
    function setLink(link) {
        return type + '|' + link;
    }

    //微页面事件
    function microPageEvent() {
        shopLink.pop("/shop/pop/page", function (layero, index) {
            layer.iframeAuto(index);//子页面自适应
            /** 子页面body对象 */
            var body = top.layer.getChildFrame('body', index);
            /** 获取子页面button对象*/
            body.find(".j-btn").on('click', function () {
                /** 获取子页面点击事件操作的预设链接ID */
                var id = setLink($(this).attr('data-id')),
                    title = $(this).attr('data-title'),
                    name = $(this).attr('data-name');
                $dropdown.parents(".app-nav-item").find('.app-nav-item-title').html(name);
                setTag(name + '<em class="link-to-tag">' + title + '</em>', id);
                top.layer.close(index);
            });
        });
    }

    function pageCatEvent() {
        shopLink.pop("/shop/pop/pageCat?show=2", function (layero, index) {
            layer.iframeAuto(index);//子页面自适应
            /** 子页面body对象 */
            var body = top.layer.getChildFrame('body', index);
            /** 获取子页面button对象*/
            body.find(".j-btn").on('click', function () {
                /** 获取子页面点击事件操作的预设链接ID */
                var id = setLink($(this).attr('data-id')),
                    title = $(this).attr('data-title'),
                    name = $(this).attr('data-name');
                $dropdown.parents(".app-nav-item").find('.app-nav-item-title').html(name);
                setTag(name + '<em class="link-to-tag">' + title + '</em>', id);
                top.layer.close(index);
                $dropdown.data('choose') && ($dropdown.data('choose'))();
            });
        });
    }

    //商品事件
    function goodsEvent() {
        shopLink.pop("/shop/pop/goods", function (layero, index) {
            layer.iframeAuto(index);//子页面自适应
            /** 子页面body对象 */
            var body = top.layer.getChildFrame('body', index);
            /** 获取子页面button对象*/
            body.find(".j-btn").on('click', function () {
                /** 获取子页面点击事件操作的预设链接ID */
                var id = setLink($(this).attr('data-id')),
                    title = $(this).attr('data-title'),
                    name = $(this).attr('data-name');
                setTag(name + '<em class="link-to-tag">' + title + '</em>', id);
                top.layer.close(index);
            });
        });
    }

    //商品分组事件
    function goodsCatEvent() {
        shopLink.pop("/shop/pop/goodsCat?show=1", function (layero, index) {
            layer.iframeAuto(index);//子页面自适应
            /** 子页面body对象 */
            var body = top.layer.getChildFrame('body', index);
            /** 获取子页面button对象*/
            body.find(".j-btn").on('click', function () {
                /** 获取子页面点击事件操作的预设链接ID */
                var id = setLink($(this).attr('data-id')),
                    title = $(this).attr('data-title'),
                    name = $(this).attr('data-name');
                setTag(name + '<em class="link-to-tag">' + title + '</em>', id);
                top.layer.close(index);
                $dropdown.data('choose') && ($dropdown.data('choose'))();
            });
        });
    }

    function marketingEvent() {

    }

    //指定链接事件
    function linkEvent() {
        setTag(getLinks()[type].title, setLink(type));
    }

    //自定义链接事件
    function customEvent() {
        top.layer.prompt({title: '自定义链接', value: ''}, function (v, i, ele) {
            setTag('外链<em class="link-to-tag">' + v + '</em>', setLink(v));
            top.layer.close(i);
        });
    }

    var events = {
        microPage: microPageEvent,
        pageCat: pageCatEvent,
        marketing: marketingEvent,
        goods: goodsEvent,
        goodsCat: goodsCatEvent,
        link: linkEvent,
        custom: customEvent
    };
    //获取所有链接类型
    function getLinks() {
        return $.extend(shopLink.links, shopLink.relLinks);
    }

    if (typeof define === "function" && define.cmd) {
        define(function (require, exports, module) {
            module.exports = shopLink;
        });
    }
    else if (typeof define === "function" && define.amd) {
        define("microPage", [], function () {
            return shopLink;
        });
    }
})(this);