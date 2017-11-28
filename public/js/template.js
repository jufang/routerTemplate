(function(window){
	var needEscodeString={
		'&':'&amp;',
		'<':'&lt;',
		'>':'&gt;',
		'"':'&quot;',
		"'":'&#39;',
		'/':'&#x2F;',
		'`':'&#x60;',
		'=':'&#x3D;'
	},
	escodeToText=function(string){
		return String(string).replace(/[&<>"'`=\/]/g,function(s){
			return needEscodeString[s];
		}).replace(/\n\r/g,function(s){
			return '\\n';
		})
	},
	escodeToWeb=function(string){
		return String(string);
	}, 
	//
	compile=function(tString){
		var filterTextArr=[],
			prefixFilterText='_',
			tString=tString
				.replace(/[\n\r\t]/g,'')
				.replace(/"/g,'\\"')
				.replace(/\{\{(#|\/|\^|&|\$)?(.+?)\}\}/g,function(withExpressionText,action,text){
					text=text.split('|');
					filterText=text.shift();

					if(filterText=='.')
						filterText='_LoopKey';
					//前括号，后括号，带前后括号的参数,处理模板中有竖线分割的函数
					var leftBracket,rightBracket,withBracketArg;
					
					leftBracket=text.reverse().join('(')+'(';

					rightBracket=[];
					rightBracket.length=text.length;
					rightBracket=rightBracket.join(')')+')';
					withBracketArg=leftBracket+filterText+rightBracket;

					prefixFilterText=[];
					prefixFilterText.length=filterTextArr.length+3;
					prefixFilterText=prefixFilterText.join('_');
					switch(action){
						//遍历，for循环
						case '#':
							filterTextArr.push(filterText);
							return '");\
							(function(){\
								var value;\
								if( typeof('+filterText+')!=="undefined" && ('+filterText+') && ('+filterText+'='+withBracketArg+'))\
								for(var key in '+filterText+')\
									with(value='+filterText+'[key]){\
										var _LoopKey=value;\
										$return.push("';
							break;
						//变量判断，相当于if
						case '$':
							filterTextArr.push(filterText);

							return '");\
							(function(){\
								if( typeof('+filterText+')!=="undefined" && ('+filterText+') ){\
									$return.push("';
							break;
						//逻辑非判断
						case '^':
							//filterTextArr.push(filterText);

							return '");\
							(function(){\
								if( typeof('+filterText+')==="undefined" || !('+filterText+') ){\
									$return.push("';
							break;
						//结束运算符
						case '/':
							var length=filterTextArr.length+1;
							while(filterTextArr[--length]&&filterTextArr[length]!=filterText);
							
							filterTextArr.splice(length,1);

							return '")\
								}\
							})();\
							$return.push("';
							break;
						//直接原样输出给浏览器
						case '&':

							return '");\
								if(typeof('+filterText+')!=="undefined")\
									$return.push(escodeToWeb('+withBracketArg+'||\'\'));\
								\
								$return.push("';
							break;
						default:

							return '");\
								if(typeof('+filterText+')!=="undefined")\
									$return.push(escodeToText('+withBracketArg+'||\'\'));\
								\
								$return.push("';
							break;
					}
			});
		//Function 函数的函数体，通过字符拼接，将dom节点和占位符元素放入数组中，最后返回为已填充数据字符模板，
		tStringBody='\
			var $return=[];\
			var _value=$data;\
			var _key;\
			with($data){\
				$return.push("'+tString+'");\
			}\
			return $return.join(\'\');';
		return Function('$data','escodeToText','escodeToWeb',tStringBody);
	},
	ready=function(tString,data,context){
		return compile(tString).call(context||window,data,escodeToText,escodeToWeb);
	};
	
	window.Template={
		ready:ready,
		compile:compile,
		escodeToText:escodeToText,
		escodeToWeb:escodeToWeb
	};

})(this);

// function arg2(){

// }
// function arg3(){

// }
// function ready(tString,arg1,context){
// 	return compile(tString).call(context||window,arg1,arg2,arg3)
// }

// function compile(tString,arg1,arg2,arg3){
// 	var fn = function(tString,arg1){
// 		var $return=[];
// 		var _value=arg1;
// 		var _key;
// 		with($data){
// 			$return.push("'+tString+'");
// 		}
// 		return $return.join(\'\');';
// 	}
// 	return fn
// }

//var tString = '<p>{{存在的变量}}</p>\n<ul>\n\t{{#简单数组}}\n\t<li>列表：{{.}}</li>\n\t{{/简单数组}}\n</ul>'
//tString.replace(/[\n\r\t]/g,'').replace(/\{\{(\$|\^|\/|#|&)?(.+?)\}\}/g,function(match,p1,p2,offset){
	/*. 代表任意字符，
		+代表匹配一个或更多字符，
		？代表非贪婪匹配
		\*(.+?)\*      匹配 *abc*def*   中的 *abc*  ， 捕获部分为  abc     
		\*(.+)\*        匹配 *abc*def*   中的 *abc*def*  ，捕获部分为 abc*def 
	*/
	/*
	下面是该函数的参数：
	变量名	代表的值
	match	匹配的子串。（对应于上述的$&。）
	p1,p2,  代表第n个括号匹配的字符串。（对应于上述的$1，$2等。）
	offset	 匹配到的子字符串在原字符串中的偏移量。（比如，如果原字符串是“abcd”，匹配到的子字符串是“bc”，那么这个参数将是1）
	string	被匹配的原字符串。(tString)
	*/
	/*
	输出：
	{{存在的变量}} undefined 存在的变量 3
	{{#简单数组}} # 简单数组  20
	{{.}} undefined .  36
	{{/简单数组}} / 简单数组 46
	*/
	
//	console.log(match,p1,p2,offset)
//})