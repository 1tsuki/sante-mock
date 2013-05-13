if(!window.radarGraph) radarGraph = {};

(function(w, $){
	// some alias to compress code
	var m = Math;
	var pi = m.PI;
	var cos = m.cos;
	var sin = m.sin;
	var round = m.round;

	// prefix values
	var fontsize = 13;
	var colormap = ['rgba(192, 80, 77, 0.3)', 'rgba(80, 77, 192, 0.3)', 'rgba(77, 192, 80, 0.3)'];
	var auxlineNum = 5;

	var canvas;
	var ctx;
	var width;
	var height;
	var radius;
	var baseLine;
	var centerX;
	var centerY;
	var offsetAngle;
	var params;
	var items;

	var privateMethods = {
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
				newVar = round(colors[i] / factor);
				if(newVar < 0) newVar = 0;
				newColor += newVar + ",";
			}
			newColor += "1)";

			return newColor;
		},

		initVariables: function() {
			ctx = canvas.getContext('2d');
			ctx.font = fontsize + "px 'ＭＳ Ｐゴシック'";
			width = canvas.width;
			height = canvas.height;
			radius = (width < height) ? width/2-fontsize : height/2-fontsize;
			centerX = width/2;
			centerY = radius+fontsize;
			baseLine = radius*0.8;
		},

		drawOutline: function(radDiv, radOffset) {
			ctx.fillStyle= "rgba(0, 0, 0, 0.1)";

			ctx.beginPath();
			ctx.moveTo(centerX+cos(radOffset)*radius, centerY+sin(radOffset)*radius);
			for(var i=0; i<params.length; i++) {
				var rad = radDiv*i+radOffset;
				targetX = centerX + cos(rad)*radius;
				targetY = centerY + sin(rad)*radius;
				ctx.lineTo(targetX, targetY);
			}
			ctx.closePath();
			ctx.fill();
		},

		drawGridline: function(radDiv, radOffset) {
			ctx.lineWidth = 1;
			ctx.strokeStyle= "rgba(0,0,0,0.2)";

			privateMethods.drawVerticalGridLines(radDiv, radOffset);
			privateMethods.drawHorizontalGridLines(radDiv, radOffset);
		},

		drawVerticalGridLines: function(radDiv, radOffset) {
			// vertical lines
			for(var i=0; i<params.length; i++) {
				var rad = radDiv*i+radOffset;
				targetX = centerX + cos(rad)*radius;
				targetY = centerY + sin(rad)*radius;
				ctx.beginPath();
				ctx.moveTo(centerX, centerY);
				ctx.lineTo(targetX, targetY);
				ctx.closePath();
				ctx.stroke();
			}
		},

		drawHorizontalGridLines: function(radDiv, radOffset) {
			// horizontal lines
			for(var i=1; i<auxlineNum; i++) {
				var factor = i/auxlineNum;
				ctx.beginPath();
				ctx.moveTo(centerX+cos(radOffset)*radius*factor, centerY+sin(radOffset)*radius*factor);
				for(var j=0; j<params.length; j++) {
					var rad = radDiv*j+radOffset;
					targetX = centerX + cos(rad)*radius*factor;
					targetY = centerY + sin(rad)*radius*factor;
					ctx.lineTo(targetX, targetY);
				}
				ctx.closePath();
				ctx.stroke();
			}
		},

		drawLabel: function(radDiv, radOffset) {
			ctx.fillStyle= "rgba(0,0,0,0.9)";

			ctx.moveTo(centerX+cos(radOffset)*radius, centerY+sin(radOffset)*radius);
			for(var i=0; i<params.length; i++) {
				var rad = radDiv*i+radOffset;
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
			var unit = width / items.length;
			for(var i=0; i<items.length; i++) {
				ctx.textAlign = "center";
				ctx.fillStyle = privateMethods.darken(colormap[i], 1.5);
				ctx.fillText(items[i][0], unit*(i+0.5), (radius+fontsize)*2 + fontsize*2);
			}
		},

		drawGraph: function() {
			var radDiv = pi*2/params.length;
			var radOffset = (typeof offsetAngle !== "undefined") ? offsetAngle*pi/180-pi/2 : -pi/2;

			privateMethods.drawOutline(radDiv, radOffset, params);
			privateMethods.drawGridline(radDiv, radOffset, params);
			privateMethods.drawLabel(radDiv, radOffset, params);
		},

		drawItems: function() {
			if (typeof items !== "undefined") {
				for(var i=0; i<items.length; i++) {
					privateMethods.drawItem(items[i], colormap[i]);
				}
				privateMethods.drawInfo();
			}
		},

		drawItem: function(item, color) {
			var itemName = item[0];

			ctx.fillStyle = color;
			ctx.strokeStyle = privateMethods.darken(color, 1.5);

			ctx.beginPath();
			var radDiv = pi*2/(params.length);
			var radOffset = (typeof offsetAngle !== "undefined") ? offsetAngle*pi/180-pi/2 : -pi/2;

			ctx.moveTo(centerX+cos(radOffset)*baseLine*item[1], centerY+sin(radOffset)*baseLine*item[1]);
			for(var i=1; i<=item.length; i++) {
				var rad = radDiv*i+radOffset;
				ctx.lineTo(centerX + cos(rad)*baseLine*item[i+1], centerY + sin(rad)*baseLine*item[i+1]);
			}

			ctx.lineTo(centerX+cos(radOffset)*baseLine*item[1], centerY+sin(radOffset)*baseLine*item[1]);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
	}

	radarGraph.interface = {
		init: function(_id, _params, _offsetAngle) {
			// get canvas
			canvas = $(_id)[0];
			canvas.width = 200;
			canvas.height = 250;
			params = _params;
			offsetAngle = _offsetAngle;

			privateMethods.initVariables();
			radarGraph.interface.draw();
		},

		draw: function() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			privateMethods.drawGraph();
			privateMethods.drawItems();
		},

		setSize: function(_width, _height) {
			canvas.width = _width;
			canvas.height = _height;
			privateMethods.initVariables();

			radarGraph.interface.draw();
		},

		setFontsize: function(_fontsize) {
			fontsize = _fontsize;
			ctx.font = fontsize + "px 'ＭＳ Ｐゴシック'";
			radarGraph.interface.draw();
		},

		setColormap: function(_colormap) {
			colormap = _colormap;
			radarGraph.interface.draw();
		},

		setAuxlineNum: function(_auxlineNum) {
			auxlineNum = _auxlineNum;
			radarGraph.interface.draw();
		},

		setOffsetAngle: function(_offsetAngle) {
			offsetAngle = offsetAngle;
			radarGraph.interface.draw();
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
			radarGraph.interface.draw();
		}
	};
})(window, $);