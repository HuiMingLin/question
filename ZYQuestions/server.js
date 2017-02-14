
// 加载模块
// 服务器构造函数
var express = require('express');
// 处理post 请求的参数到 body 对象中
var bodyParser = require('body-parser');
// 处理文件上传
var multer = require('multer');
// 处理缓存 cookie 到 cookie 对象中
var cookieParser = require('cookie-parser');
// 处理文件I/O 写入
var fs = require('fs');

// 创建服务器对象
var app = express();

// 配置存储上传文件 storage 
var storage = multer.diskStorage({
	destination: 'www/uploads',
	filename: function(req,res,callback) {
		var petName = req.cookies.petName;
		callback(null,petName + '.jpg');
	}
});
	
var upload = multer({storage});

// 配置静态文件夹 
app.use(express.static('www'));
// 解析 post 请求参数
app.use(bodyParser.urlencoded({extended:true}));
// 解析 cookie 对象
app.use(cookieParser());


/************************注册********************************/
app.post('/user/register',function(req,res){
	// console.log(req.body);
	// 先判断有没有 users 这个文件
	fs.exists('users',function(exi){
		if(exi) {
			// 存在
			writeFile();
		} else {
			// 不存在 (创建 users )
			fs.mkdir('users',function(err){
				if (err) {
					// 创建失败
					res.status(200).json({code: 0,message:'系统创建文件夹失败'});
				} else {
					// 创建成功 (写入)
					writeFile();
				}
			});
		}
	});
	
	// 封装一个把注册信息写入本地的方法
	function writeFile() {
		// 判断用户是否已经注册
		var fileName = 'users/' + req.body.petName + '.txt';
		// var fileName = `users/${req.body.petName}.txt`; 
		fs.exists(fileName,function(exi){
			if (exi) {
				// (文件) 用户存在，已被抢先注册
				res.status(200).json({code: 2,message:'用户名已存在，请重新注册'});
			} else {
				// 在 body 中加入 ip 和 time 属性
				req.body.ip = req.ip;
				req.body.time = new Date();
				// 未被注册，把用户信息写入本地
				fs.writeFile(fileName,JSON.stringify(req.body),function(err){
					if (err) {
						// 写入失败
						res.status(200).json({code: 1,message:'系统错误文件写入失败'});
					} else {
						// 保存成功
						res.status(200).json({code: 3,message:'注册成功'});
					}
				})
			}
		});
	}
});

/************************登录********************************/
app.post('/user/login',function(req,res){
	// 1. 根据 req.petName 去 user 文件夹中匹配文件
	
			// 匹配到
			// 根据req.petName 去 users 读取
				// 读取失败
				// 返回 系统错误 code = 1
				// 读取成功
				// 比较 req.password == 读出的那个密码
					// 不相等
					// 返回密码错误  code = 2
					// 相等 code = 3
					
			// 匹配不到
			// 返回用户不存在 code = 0
			
			// 判断是否有 fileName 文件
	var fileName = 'users/' + req.body.petName + '.txt';
	fs.exists(fileName, function(exi) {
		if(exi) {
			// 存在
			fs.readFile(fileName,"utf8",function(error,datas){
				if (!error) {
					// 读取文件成功
					var data = JSON.parse(datas); 
					if (req.body.petName == data.petName) {
						if (req.body.password == data.password) {
							// 把 petName cookie 里 (把 cookie 存储在当前网站内 ：1.有利于下次登录 2保存用户信息)
							var expires = new Date();
							expires.setMonth(expires.getMonth()+ 1);
							res.cookie('petName',req.body.petName,{expires});
				
							// 登录成功
							res.status(200).json({code: 4,message:'登录成功'});
						} else {
							// 密码错误
							res.status(200).json({code: 5,message:'密码错误'});
						}
					} else {
						res.status(200).json({code: 0,message:'用户存在，用户名输入错误'});
					}
				} else {
					// 读取文件失败
					res.status(200).json({code: 1,message:'系统错误读取文件失败'});
				}
			});
		} else {
			// 不存在 (创建 users )
			res.status(200).json({code: 0,message:'用户不存在'});
		}
	});
});

/************************提问********************************/
app.post('/question/ask',function(req,res){
	// 判断有没  cookie 中把 petName 传递过来
	if (!req.cookies.petName) {
		// 比如：确实登录了，但是某些清除垃圾的软件把存储的 cookie 清除了。
		//		 更或者自己把  cookie 清除了 
		//		 cookie 的时间戳到了
		res.status(200).json({code: 0,message:'登录异常,请重新登录'});
		return;
	}
	// 判断 questions 文件夹是否存在
	fs.exists('questions',function(exi){
		if (exi) {
			// 文件夹存在 (写入文件)
			writeFile();
		} else {
			// 不存在 (需要创建)
			fs.mkdir('questions',function(error){
				if (error) {
					// 创建文件夹失败
					res.status(200).json({code: 1,message:'系统错误文件写入失败'});
				} else {
					// 创建成功 (写入文件)
					writeFile();
				}
			})
		}
	});
	
	// 封装写入的方法
	function writeFile() {
		// 先生成提问问题的文件名
		var date = new Date();
		var fileName = 'questions/' + req.cookies.petName + date.getTime() + '.txt';
		// 生成存储信息
		req.body.petName = req.cookies.petName;
		req.body.ip = req.ip;
		req.body.time = date;
		// 写入文件
		fs.writeFile(fileName,JSON.stringify(req.body),function(err){
			if (err) {
				// 写入失败
				res.status(200).json({code: 1,message:'系统错误文件写入失败'});
			} else {
				// 写入成功
				res.status(200).json({code: 2,message:'提交问题成功'});
			}
		});
	}
});

/************************退出登录********************************/
app.get('/user/logOut',function(req,res){
	// 清除 cookie 
	res.clearCookie('petName');
	res.status(200).json({code: 1,message:'退出登录成功'});
});

/************************首页数据********************************/
app.get('/question/all',function(req,res){
	// 返回所有的问题 (包含回答)
	fs.readdir('questions',function(err,files){
		if (err) {
			// 读取文件失败
			res.status(200).json({code: 0,message:'系统错误读取文件失败'});
		} else {
			// 读取文件成功
			// 数组反序， 目的： 让最新提问的问题排在最前面
			files = files.reverse();
			// 创建一个数组容器，存放所有的问题对象
			var questions = [];
			
			// 方法一：用for循环来遍历文件，用同步读取文件内容
			
			
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				// 拼接文件路径
				var filePath ='questions/' + file;
				// readFile: 是一个异步读取文件的方法。可能导致的结果是还没读取文件就 res 了。没有数据
				var data = fs.readFileSync(filePath);
				// 把字符串转对象，存数组
				var obj = JSON.parse(data);
				questions.push(obj);
			}
			
			res.status(200).json(questions);
			
			
			// 方法二：用递归来遍历文件，用异步读取文件
			/*
			var i = 0;
			function readFile() {
				if (i < files.length) {
					var file = files[i];
					var filePath ='questions/' + file;
					fs.readFile(filePath,function(err,data){
						if (!err) {
							var obj = JSON.parse(data);
							questions.push(obj);
							i++;
							readFile();
						}
					});
				} else {
					res.status(200).json(questions);
				}
			}
			readFile();
			*/
		}
	});
})

/************************回答问题********************************/
app.post('/question/answer',function(req,res){
	// 判断登录状态
	var petName = req.cookies.petName;
	if (!petName) {
		res.status(200).json({code: 0,message:'登录异常，请重新登录'});
	}
	// 先取出要回答问题的内容
	var question = req.cookies.question;
	var filePath = 'questions/' + question + '.txt';
	fs.readFile(filePath,function(err,data){
		if (!err) {
			var dataObj = JSON.parse(data);
			// 判断有没有 answers 属性 (有：之前回答过  没有 之前没有回答过)
			if (!dataObj.answers) {
				// 创建
				dataObj.answers = [];
			}
			// 把答案对象  push{ip,time,petName,content} 进去
			// 防止跨网站攻击
			req.body.content = req.body.content.replace(/</g,'&lt;');
			req.body.content = req.body.content.replace(/>/g,'&gt;');
			req.body.ip = req.ip;
			req.body.time = new Date();
			req.body.petName = petName;
			dataObj.answers.push(req.body);
			
			fs.writeFile(filePath,JSON.stringify(dataObj),function(err){
				if (err) {
					// 写入失败
					res.status(200).json({code: 1,message:'系统错误写入文件失败'});
				} else {
					// 写入成功
					res.status(200).json({code: 2,message:'提交答案成功'});
				}
			})
		} else {
			// 读取文件失败
			res.status(200).json({code: 0,message:'系统错误读取文件失败'});
		}
	})
});

/************************上传图片********************************/
app.post('/user/photo',upload.single('photo'),function(req,res){
	res.status(200).json({code: 0,message: '上传头像成功'});
});


app.listen(3000,function(){
	console.log('Server loading ....');
});
