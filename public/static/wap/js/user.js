$.userInfo = function(option) {
	var defaultOption = {};
	option = $.extend(defaultOption, option);

	//返回主页面
	$(window).on('popstate', function (e) {

		//修改手机号 下一步
		if ($("#js-updatemobile-next").length > 0 && $('#js-updatemobile-next').css('display') != 'none') {
			hideWidget('js-updatemobile-next');
			history.pushState({title: 'js-updatemobile'}, '', location.href);
			return true;
		}
		//修改手机号
		if ($("#js-updatemobile").length > 0 && $('#js-updatemobile').css('display') != 'none') {
			hideWidget('js-updatemobile');
			return true;
		}

		//通过短信修改登录密码
		if ($("#js-updatepasswordsms").length > 0 && $('#js-updatepasswordsms').css('display') != 'none') {
			hideWidget('js-updatepasswordsms');
			history.pushState({title: 'js-updatepassword'}, '', location.href);
			return true;
		}

	});
	//显示弹出窗口
	$('.js-show').click(function () {
		var idDOM = $(this).attr('data-id');
		if (idDOM == 'js-updatemobile-next') {
			checkSub(idDOM);
		}

		showWidget(idDOM);
	});
	//根据ID元素显示组建
	function showWidget(idDOM) {
		$('#' + idDOM).css('display', 'block').animate({left: 0}, 500);
		if (history.pushState && !history.state) {
			history.pushState({title: idDOM}, '', location.href);
		}
	}

	//根据ID元素隐藏组建
	function hideWidget(idDOM) {
		$('#' + idDOM).animate({left: '120%'}, 400, function () {
			$(this).hide();
		});
	}


};