/**
 * 订单
 * 
 */

//获取订单状态标签
function getStatusTag(pay_status, order_status) {
	var statusTag = '';
	if (pay_status == 1) {
		switch (parseInt(order_status)) {
			case 3:
				statusTag = '已发货';
				break;
			case 4:
				statusTag = '已关闭';
				break;
			case 5:
				statusTag = '已完成';
				break;
			default:
				statusTag = '待发货';
		}
	} else {
		if (order_status == 4) {
			statusTag = '已关闭';
		} else {
			statusTag = pay_status == 2 ? '部分支付' : '待付款';
		}
	}
	return statusTag;
}

//取消订单
function cancelOrder(thisDOM, orderSn, token, type) {
	confirm('确定要取消订单吗？',function() {
		$.ajax({
			type:'post',
			dataType:'json',
			url:getUrl('order/cancel'),
			data:{'order_sn':orderSn, '_token': token},
			error:function(){
				return false;
			},
			success:function(res){
				if(res.code == 0){
					if (type == 1) {
						$('#status-tag').text('已关闭');
						$('#hint').remove();
						$('#tool-bar').remove();
					} else {
						var parentDOM = $(thisDOM).parent();
						$(parentDOM).prev().find('.status-tag').text('已关闭');
						$(parentDOM).remove();
					}
				}else{
					alert(res.msg);
				}
			}
		});
	});
}

function cancelFunc() {
	alert('取消了');
}