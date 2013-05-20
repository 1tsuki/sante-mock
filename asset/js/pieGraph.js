if(!window.pieGraph) pieGraph = {};

(function(w, $){
	// some alias to compress code
	var m = Math;
	var pi = m.PI;
	var cos = m.cos;
	var sin = m.sin;
	var round = m.round;

	// prefix values
	var fontsize = 17;
	var font = 'ＭＳ Ｐゴシック';
	var colormap = ['#F05050','#F05050','#F05050','#F05050','#509650','#509650','#509650','#DCDC00','#DCDC00','#DCDC00','#DCDC00'];
	var auxlineNum = 5;

	// variables
	var c;
	var ctx;
	var width = 220;
	var height = 220;
	var radius;
	var radDiv;
	var radOffset = -pi/2;
	var centerX;
	var centerY;
	var timer = 50;
	var drawInfo = true;

	var params;
	var items;


	var color = {
		mod: function(color, amount) {
			var usePound = false;
			if ( color[0] == "#" ) {
				color = color.slice(1);
				usePound = true;
			}
			var num = parseInt(color,16);
			var r = (num >> 16) + amount;
			if(255 < r) r = 255;
			else if(r < 0) r = 0;
			var g = ((num >> 8) & 0x00FF) + amount;
			if(255 < g) g = 255;
			else if(g < 0) g = 0;
			var b = (num & 0x0000FF) + amount;
			if(255 < b) b = 255;
			else if(b < 0) b = 0;
			var newColor = b | (g << 8) | (r << 16);

			return (usePound?"#":"") + (b | (g << 8) | (r << 16)).toString(16);
		},

		darken: function(color, factor) {
			var newColor = "rgba(";

			color = color.replace("rgba", "");
			color = color.replace("(", "");
			color = color.replace(")", "");
			colors = color.split(",");

			for(var i=0; i<3; i++) {
				newVar = round(colors[i] * factor);
				if(255 < newVar) newVar = 255;
				newColor += newVar + ",";
			}
			newColor += "1)";

			return newColor;
		},

		lighten: function(color, factor) {
			var newColor = "rgba(";

			color = color.replace("rgba", "");
			color = color.replace("(", "");
			color = color.replace(")", "");
			colors = color.split(",");

			for(var i=0; i<3; i++) {
				newVar = round(colors[i] + factor*50);
				if(newVar < 0) newVar = 0;
				newColor += newVar + ",";
			}
			newColor += "1)";

			return newColor;
		}
	};

	var draw = {
		arc: function(startAngle, endAngle, radius) {
			ctx.beginPath();
			ctx.moveTo(centerX, centerY);
			ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
			ctx.lineTo(centerX, centerY);
			ctx.closePath();
		},

		fan: function(startAngle, endAngle, innerRadius, length) {
			ctx.beginPath();
			ctx.arc(centerX, centerY, innerRadius, startAngle, endAngle, false);
			ctx.arc(centerX, centerY, innerRadius + length, endAngle, startAngle, true);
			ctx.closePath();
		},

		circle: function(radius) {
			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, 0, pi*2, false);
			ctx.closePath();
		},
	};

	var privateMethods = {
		initSize: function() {
			c.width = width;
			c.height = height;
			radius = (width < height) ? width/2-fontsize : height/2-fontsize;
			radDiv = pi*2/params.length;
			centerX = radius+fontsize;
			centerY = radius+fontsize;
			privateMethods.initContext();
		},

		initContext: function() {
			ctx = c.getContext('2d');
			ctx.font = fontsize + 'px ' + font;
		},

		drawGraph: function() {
			privateMethods.drawPie();
			privateMethods.drawLabel();
			privateMethods.drawItems();
			privateMethods.drawInfo();
		},

		drawPie: function() {
			// pie
			ctx.fillStyle = "rgba(250, 250, 250, 1)";
			ctx.strokeStyle = "rgba(200, 200, 200, 1)";
			draw.circle(radius);
			ctx.fill();
			ctx.stroke();

			// grid
			for(var i=0; i<params.length; i++) {
				var rad = radDiv*i + radOffset;
				targetX = centerX + cos(rad)*radius;
				targetY = centerY + sin(rad)*radius;
				ctx.beginPath();
				ctx.moveTo(centerX, centerY);
				ctx.lineTo(targetX, targetY);
				ctx.closePath();
				ctx.stroke();
			}
		},

		drawLabel: function() {
			ctx.fillStyle= "rgba(10,10,10,1)";
			ctx.moveTo(centerX + cos(radOffset)*radius, centerY+sin(radOffset)*radius);
			for(var i=0; i<params.length; i++) {
				var rad = radOffset + radDiv*(i+0.5);
				targetX = centerX + cos(rad)*radius;
				targetY = centerY + sin(rad)*radius;

				// draw params
				if(i < params.length/4) {
					ctx.fillText(params[i], targetX, targetY);
				} else if(i < params.length*2/4) {
					ctx.fillText(params[i], targetX, targetY+fontsize);
				} else if(i < params.length*3/4) {
					ctx.fillText(params[i], targetX-fontsize, targetY+fontsize);
				} else {
					ctx.fillText(params[i], targetX-fontsize, targetY);
				}
			}
		},

		drawInfo: function() {
			if(typeof items !== "undefined" && drawInfo) {
				if(width > height) {
					privateMethods.drawInfoOnSide();
				} else {
					privateMethods.drawInfoOnBottom();
				}
			}
		},

		drawInfoOnSide: function() {
			for(var i=0; i<items.length; i++) {
				ctx.fillStyle = color.darken(colormap[i], 1.5);
				ctx.fillText(items[i][0], (radius+fontsize)*2+fontsize, centerY - fontsize*items.length + fontsize*(i+1)*2);
			}
		},

		drawInfoOnBottom: function() {
			var unit = width / items.length;
			for(var i=0; i<items.length; i++) {
				ctx.textAlign = "center";
				ctx.fillStyle = color.darken(colormap[i], 1.5);
				ctx.fillText(items[i][0], unit*(i+0.5), (radius+fontsize)*2 + fontsize*2);
			}
		},

		drawItems: function() {
			if (typeof items !== "undefined") {
				for(var i=0; i<items.length; i++) {
					privateMethods.drawItem(items[i], 1);
				}
			}
		},

		drawItem: function(item, key) {
			if(item.length <= key) {
				return;
			}

			var radStart = radOffset;
			setTimeout(privateMethods.drawItemValue, 100, item, key, 0);
			privateMethods.drawItem(item, ++key);
		},

		drawItemValue: function(item, key, counter) {
			if (item[key] == 0 || item[key]*auxlineNum <= counter) {
				return;
			}

			var startAngle = radOffset + radDiv*(key-1);
			var endAngle = radOffset + radDiv*key;
			var length = radius/auxlineNum;
			var innerRadius = length*counter;

			ctx.fillStyle = color.mod(colormap[key-1], counter*10);
			draw.fan(startAngle, endAngle, innerRadius, length);
			ctx.fill();
			setTimeout(privateMethods.drawItemValue, timer, item, key, ++counter);
		}
	};

	pieGraph.interface = {
		init: function(_id, _params, _items) {
			c = $(_id)[0];
			pieGraph.interface.setParams(_params);
			pieGraph.interface.setItems(_items);
			privateMethods.initSize();
			privateMethods.initContext();
		},

		draw: function() {
			ctx.clearRect(0, 0, c.width, c.height);
			privateMethods.drawGraph();
		},

		setDrawInfo: function(flag) {
			drawInfo = flag;
		},

		setParams: function(_params) {
			params = _params;
		},

		setItems: function(_items) {
			for (var i=0; i<_items.length; i++) {
				if(_items[i].length != params.length + 1) {
					console.log("Invalid item length");
				}
			}
			items = _items;
		},

		setOffsetAngle: function(_offsetAngle) {
			radOffset = _offsetAngle*pi/180-pi/2;
		},

		setSize: function(_width, _height) {
			width = _width;
			height = _height;
			privateMethods.initSize();
		},

		setFont: function(_font) {
			font = _font;
			privateMethods.initContext();
		},

		setFontsize: function(_fontsize) {
			fontsize = _fontsize;
			privateMethods.initContext();
		},

		setAuxlineNum: function(_auxlineNum) {
			auxlineNum = _auxlineNum;
		},

		setTimer: function(_timer) {
			timer = _timer;
		}
	};
})(window, $);