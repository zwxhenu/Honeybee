/**
 * 全选插件 示例 $.selectAll({ selectbutton : '.j-selectAll', checkbox : '.j-chk' });
 * 配置说明：selectbutton 全选按钮,值为jQuery选择器;checkbox 选择项,值为jQuery选择器
 */
(function($) {
	$.selectAll = function(option) {
		var defaultOption = {
			selectbutton : '.j-selectAll',
			checkbox : '.j-chk'
		};
		option = $.extend(defaultOption, option);
		var $selectButton = $(option.selectbutton), $checkbox = $(option.checkbox), chkLen = $checkbox.length;
		$selectButton.on('click', function() {
			var checked = $(this).prop('checked'), state = this.indeterminate;
			$selectButton.prop('checked', checked);
			$selectButton.each(function() {
				this.indeterminate = state;
			});
			$checkbox.prop('checked', checked);
		});
		$checkbox.on('click',
				function() {
					var state = true, checkedLen = $(option.checkbox
							+ ':checked').length;
					if (checkedLen == chkLen) {
						$selectButton.prop('checked', true);
						state = false;
					} else if (checkedLen == 0) {
						$selectButton.prop('checked', false);
						state = false;
					}
					$selectButton.each(function() {
						this.indeterminate = state;
					});
				});
	}
})(jQuery);