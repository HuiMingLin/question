
// 返回上一页
	$("#goBack").click(function(){
		history.go(-1);
	});
	
	// 去注册界面
	$('#register').click(function(){
		location.href = 'register.html';
	});
	
	// 提交
	$('form').submit(function(event){
		// 阻止默认事件
		event.preventDefault();
		
		// 发送注册请求
		// var data = new FormData(this) 原生获取表单数据 js 代码
		// 将用作提交的表单元素的值编译成字符串。
		var data = $(this).serialize();
		$.post('/user/login',data,function(resData){
			console.log(resData);
			$('.modal-body').text(resData.message);
			// 'hidden.bs.modal': 模态框消失时触发该事件
			$("#myModal").modal('show').on('hidden.bs.modal',function(){
				if (resData.code == 4) {
					location.href = 'index.html';
				}
			});
		})
	});
	

