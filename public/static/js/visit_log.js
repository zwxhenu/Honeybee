/**
 * @author dxk
 * @deprecated 微商城访问统计
 */
/**
 * 记录访问日志
 */
function visit_log(supplier_id,app_id,user_id,product_id) {
	// 初始化HMACCOUNT
	hmaccount = getCookie('HMACCOUNT');
	if (hmaccount === null || hmaccount === '') {
		var hmaccount = hmAccount(28, 16);
		setCookie('HMACCOUNT', hmaccount);
	}
	product_id = product_id || 0;
	var from_url = document.referrer;
	var visit_url = location.href;
	$.get('/supplierstat/store?supplier_id='+supplier_id+'&product_id='+product_id+'&app_id='+app_id+'&user_id='+user_id+'&from_url='+from_url+'&visit_url='+visit_url,function (res) {
		console.log(res);
	});
}
/**
 * 获取HMACCOUNT
 */
function hmAccount(len, radix) {
	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
			.split('');
	var uuid = [], i;
	radix = radix || chars.length;
	if (len) {
		for (i = 0; i < len; i++) {
			uuid[i] = chars[0 | Math.random() * radix];
		}
	} else {
		var r;
		uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
		uuid[14] = '4';
		for (i = 0; i < 36; i++) {
			if (!uuid[i]) {
				r = 0 | Math.random() * 16;
				uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
			}
		}
	}
	return uuid.join('');
}
/**
 * 获取cookie
 */
function getCookie(name) {
	var nameEQ = name + "=";
	var cookieArr = document.cookie.split(';');
	for ( var i = 0; i < cookieArr.length; i++) {
		var curr = cookieArr[i];
		// 去除name前边的空格
		while (curr.charAt(0) == ' ')
			curr = curr.substring(1, curr.length);
		if (curr.indexOf(nameEQ) == 0)
			return curr.substring(nameEQ.length, curr.length);
	}
	return null;
}
/**
 * 设置cookie
 */
function setCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = "; expires=" + date.toGMTString();
	} else {
		var expires = "";
	}
	var values = encodeURIComponent(value);
	document.cookie = name + "=" + values + expires + "; path=/;";
}