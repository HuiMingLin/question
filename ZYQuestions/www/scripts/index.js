
// 从本地缓存 cookie 中取出 petName 的值

var petName = $.cookie('petName');


// 点击提问按钮
$('#ask').click(function(){
	petName ? location.href = 'ask.html' : location.href = 'login.html';
});

// 判断有没有 petName 决定 user 图标样式和行为

if (petName) {
	// $('#user span:last-child').text(petName);
	$('#user').find('span').last().text(petName);
} else {
	$('#user').find('span').last().text('登录').end().end().
	removeAttr('data-toggle').click(function(){
		location.href = 'login.html';
	});
	
}

// 退出登录
$('#loginOut').click(function(){
	$.get('/user/logOut',function(resData){
		if (resData.code == 1) {
			//重新刷新当前页面
			location.reload();
		}
	});
});

// 给每个问题添加点击事件 (不能直接绑定事件，)
$('.questions').on('click','.media[data-question]',function(){
	alert('我要回到' + $(this).attr('data-question') + '的问题');
	if (petName) {
		$.cookie('question',$(this).data('question'));
		location.href = 'answer.html?question=' + $(this).attr('data-question');
	} else {
		location.href = 'login.html';
	}
});

// 获取首页数据
$.get('/question/all',function(resData){
	var htmlStr = '';
	for (var i = 0; i < resData.length; i++) {
		resData[i];
		// 这里采用 Bootstrap  里面的 Bootsrap 多媒体对象 (Media Object)
		var question = resData[i];
		htmlStr += '<div class="media" data-question="' + question.petName + new Date(question.time).getTime() + '">';
		// 内层第一块
		htmlStr += '<div class="pull-left"><a>';
		htmlStr += '<img class="media-object" src="../uploads/' + question.petName + '.jpg" onerror="defaultHeaderImage(this)" />';
		htmlStr += '</a></div>';
		// 内层第二块
		htmlStr += '<div class="media-body">';
		htmlStr += '<h4 class="media-heading">' + question.petName + '</h4>';
		htmlStr += question.content;
		htmlStr += '<div class="media-footing"> ' + formatDate(new Date(question.time)) + ' &#x3000;' + formatIp(question.ip) + '</div>';
		htmlStr += '</div>';
		// 内容第二块
		htmlStr += '</div>';
		// 判断是否有答案
		if (question.answers) {
			// 内存 for 循环，遍历问题的答案
			for (var j = 0; j < question.answers.length; j++) {
				var answer = question.answers[j];
				// 外层
				htmlStr += '<div class="media media-child">';
				// 内层第一块
				htmlStr += '<div class="media-body"><div class="content_content">';
				htmlStr += '<h4 class = "media-heading">' +  answer.petName + '</h4>';
				htmlStr += answer.content;
				htmlStr += '<div class="media-footing"> ' + formatDate(new Date(answer.time)) + ' &#x3000;<span>' +  formatIp(answer.ip) + '</span></div>';
				htmlStr += '</div>';
				// 内层第二块
				htmlStr += '<div class="pull-right"><a>';
				htmlStr += '<img class="media-object" src="../uploads/' + answer.petName + '.jpg" onerror="defaultHeaderImage(this)" />';
				htmlStr += '</a></div>';
				htmlStr += '</div>';
				
				htmlStr += '</div>';
			}
		}
	}
	$('.questions').html(htmlStr);
});

// 封装一个方法 解析 Date
function formatDate (time){
	var y = time.getFullYear();
	var M = time.getMonth() + 1;
	var d = time.getDate();
	var h = time.getHours();
	var m = time.getMinutes();
	var s = time.getSeconds();
	
	y = y < 10 ? '0' + y : y;
	M = M < 10 ? '0' + M : M;
	d = d < 10 ? '0' + d : d;
	h = h < 10 ? '0' + h : h;
	m = m < 10 ? '0' + m : m;
	s = s < 10 ? '0' + s : s;
	
	return y + '-' + M + '-' + d + '' + h + ':' + m + ':' + s;
}

// 封装一个方法： 解析 ip
function formatIp (ip){
	if (ip.startsWith('::1')) {
		return '192.168.1.129';
	} else {
		return ip.substr(7);
	}
}

function defaultHeaderImage(that) {
	that.src = '../images/user.png';
}
