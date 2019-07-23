KISSY.add('searchsuggest', function(){
	var	S = KISSY,
		DOM = S.DOM,
		$ = S.all;
	
	function searchsuggest(){
		var self = this;
		self.hasDataReturn = false ;
		self.hasCache = false ;
		self._init();
	}
	
	S.augment(searchsuggest, {
		_init: function() {
			var self = this;
			self._initCfg();
			//self.t = $('.curOption', '.default').attr('t');
			self.t = $('.curOption', '.default').attr('t') ? $('.curOption', '.default').attr('t') : $("#searchText").attr('t');
			//self.t = $("#searchText").attr('t');
			var url = window.location.search;
			if(self.t && url.indexOf('t=') == -1){
				$('.curOption','.actived').attr('t', self.t).text(self.cfg[self.t]);
			}
			self._bind();
			self._getSuggest();
			self.isDefault = false;
			self._ie6Png();
		},
		_initCfg: function(){
			var self = this;
			self.cfg = {};
			S.each($('li', '.SearchOptions'), function(item){
				var t = $(item).attr('t');
				self.cfg[t] = $(item).text();
			});
		},
		_bind: function(){
			var self = this;
			$('#search').on('click', function(e){
				var tar = e.target;
				$('.SearchOptions').hide();
				if($(tar).hasClass('default') || $(tar.parentNode).hasClass('default')){
					$('.default').hide();
					$('.actived').show();
					$('#searchText')[0].focus();
				}else if($(tar.parentNode).hasClass('actived') && $(tar).hasClass('curOption')){
					if($(tar.parentNode).hasClass('actived')){
						var offset = $(tar).offset();
						$('.SearchOptions') && $('.SearchOptions').appendTo('body').css({'left': offset.left-3, 'top': offset.top- 30}).show();
					}
				}else if('a' == tar.tagName.toLowerCase() && $(tar).hasClass('sBtn')){
					e.preventDefault();
					var result = $('#searchText').val();
					if($('#searchUrl').val() && result && !self.isDefault){
						var url = $('#searchUrl').val();
						//if(self.t){
							url = url +'?t='+ self.t+ '&q='+ encodeURIComponent(result);
							window.location.href = (url);
						//}
						//else {
						//	url = url +'?t=doc&q='+ encodeURIComponent(result);
						//	window.location.href = (url);
						//}
					}
				}
			});
			$('body').on('click', function(e){
				var tar = e.target;
				if('li' == tar.tagName.toLowerCase() && $(tar).attr('t') && $(tar.parentNode).hasClass('SearchOptions')){
					$(tar.parentNode).hide();
					$('.curOption').text($(tar).text()).attr('t', $(tar).attr('t'));
					self.t = $('.curOption', '.default').attr('t');
					
				}else if($(tar).parent('#search') == null){
					$('.SearchOptions').hide();
				}
			});
		},
		_getSuggest: function(){
			var self = this ;
			S.use("suggest", function(S, Suggest){
				var _suggest = new Suggest('#searchText', $('#suggestUrl').val(), {
                    dataType: 1,
                    offset: 1,
                    containerCls : 'J_Suggest',
                    containerWidth: '465px !important',
                    submitOnSelect : false
				});
				_suggest.on('beforeDataRequest', function(e){
					var index = _suggest.queryParams.toString().indexOf('='),str = '';
					//self.t = $('#searchText').attr('t');
					 if(index != -1 ){
						str = _suggest.queryParams.substring(index+1);
					} 
					_suggest.queryParams = 'q='+str+ '&t='+ self.t; 
				}).on('beforeShow', function(e){
					var left = $('#search').offset().left;
					$(_suggest.container).css('left', left);
				}).on('dataReturn', function(e){
					_suggest.hide();
					_suggest.returnedData.result.length>0 ? self.hasDataReturn = true : self.hasDataReturn = false ;
					self._checkBg($(_suggest.container), 'apisuggest_bg');
					_suggest.show();
				});
				self.suggest = _suggest;
				self._suggestEvent();
			});
		},
		_ie6Png: function(){
			/**
			 * banner png24滤镜
			 *
			**/
			if(6 == S.UA.ie) {
				var pngList = S.all('.pngfilter');
				pngList && S.each(pngList, function(item) {
				   var item = S.one(item) , width = DOM.width(item), height = DOM.height(item), src= DOM.attr(item, 'src');
				   var span = DOM.create('<span style="_background:none; display:block; width:'+ width + 'px; height:'+ height + 'px; _filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true,sizingMethod=noscale,src='+ src +', sizingMethod=scale); _background-image:none;"></span>');
				   DOM.insertBefore(span, item);
				   DOM.remove(item);
				});
			}
		},
		_checkBg: function(target, classN){
			var self = this;
			self.hasDataReturn || self.hasCache ? target.addClass(classN): target.removeClass(classN);
		},
		_suggestEvent: function(){
			var self = this;
			$(self.suggest.container).on('click', function(e){
				var tar = e.target;
				li = ('li' == tar.tagName.toLowerCase())? tar: $(tar).parent('li');
				if(li){
					var result = $('.ks-suggest-key', li);
					if($('#searchUrl').val()){
						var url = $('#searchUrl').val();
						url = url +'?t='+ self.t+ '&q='+ encodeURIComponent(result.text());
						window.location.href = (url);
					}
				}
			});
			$(self.suggest.textInput).on('keydown', function(e){
				self.hasDataReturn = self.hasCache = false ;
				if(13 == e.keyCode){
					self.suggest.selectedItem? function(){
						var tar = self.suggest.selectedItem,
							result = $('.ks-suggest-key', tar);
						val = result.text();
					}(): function(){
						val = self.suggest.textInput.value;
					}();
					if($('#searchUrl').val() && !self.isBlank){
						var url = $('#searchUrl').val();
						url = url +'?t='+ self.t+ '&q='+ encodeURIComponent(val);
						window.location.href = (url);
					}
				}
			}).on('keyup', function(e){
				if(this.value.replace(/(^\s+)|(\s+$)/g,'').length >0){
					self.isDefault = false;
				}else{
					self.isDefault = true;
				}
				if(this.value){
					self.suggest._dataCache[this.value]? self.hasCache = true: self.hasCache = false ;
					self._checkBg($(self.suggest.container), 'apisuggest_bg');
				}
				if(40 == e.keyCode || 37 == e.keyCode || 38 == e.keyCode || 39 == e.keyCode){
					$(self.suggest.container).css('visibility') == 'visible' && $(self.suggest.container).addClass('apisuggest_bg');
				}
			}).on('focusin', function(e){
				if(!this.value || self.isDefault){
					this.value ='';
					self.isDefault = true;
					self.isBlank = false;
				}
			}).on('focusout', function(e){
				if(!this.value || self.isDefault){
					this.value ="请输入您要搜索的内容";
					self.isBlank = true;
				}
			});
		}
	});
	
	S.searchsuggest = searchsuggest;
	
	return searchsuggest;
});







