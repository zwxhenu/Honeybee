/**
 *
 * 示例：$('#load').loadMore({
		loadingText:'正在加载。。。',
		url:'<?php echo $this->get_url('index','load')?>',
		success:function(data){
			for(var i=0;i<data.data.length;i++){
				$('#load').append('<p>'+data.data[i]+'</p>');
			}
		}


	});
 *
 */
$.extend($.fn, {
    // 加载数据
    loadMore: function (option) {
        var defaultOption = {
                url: '',// 请求地址
                data: {},//请求参数
                loadingText: '努力加载中...',// 加载中显示的文字
                finishText: '没有更多数据了',// 加载完显示的文字
                pageNum: 1,// 页码
                pageSize: 20,// 每页的数量
                success: null,// 成功回调
                error: null,
                debug: false
                // 失败回调
            },
            finished = false,
            is_loading = false,
            option = $.extend({}, defaultOption, option),
            $self = $(this),
            url = ($.isFunction(option.url) ? option.url() : option.url);
        if (url.indexOf('?') == -1) {
            url += '?';
        }
        else {
            url += '&';
        }
        if (!option.url) {
            return this;
        }
        if ($('.loading-text').length == 0) {
            $self.after('<div class="loading-text">' + option.loadingText + '</div>');
        } else {
            $('.loading-text').html(option.loadingText);
        }
        function pageLoad() {
            if (finished === true) {
                return this;
            }
            var scrollTop = $(window).scrollTop(),
                docHeight = $(document).height(),
                windowHeight = $(window).height();
            if ((scrollTop == docHeight - windowHeight || scrollTop == 0) && !finished && !is_loading) {
                $('.loading-text').html(option.loadingText).show();
                is_loading = true;
                $.ajax({
                    url: url + 'page_num=' + option.pageNum + '&per_page=' + option.pageSize,
                    type: 'POST',
                    dataType: 'json',
                    data: option.data,
                    async: true,
                    success: function (d) {
                        if (d.code != 0 || d.data.length <= 0) {
                            finished = true;
                            $('.loading-text').html(option.finishText);
                            $(window).off('scroll', pageLoad);
                            //return false;
                        }
                        if (option.success) {
                            option.success.call(this, d);
                        }
                        if (d.code == 0 && d.data.length > 0) {
                            $('.loading-text').hide();
                        }
                    },
                    error: function () {
                        if (option.error) {
                            option.error.call(this);
                        }
                        $('.loading-text').hide();
                    },
                    complete: function () {
                        is_loading = false;
                    }
                });
                option.pageNum++;
            }
        }

        //window.onscroll=function(){pageLoad()};
        if ($self.data('loadList')) {
            $(window).off('scroll', $self.data('loadList'))
        }
        $(window).on('scroll', pageLoad);
        $self.data('loadList', pageLoad);
        pageLoad();
        return this;
    }
});
