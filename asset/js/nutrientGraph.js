if(!window.nutrientGraph) nutrientGraph = {};

(function(w, $){
	var canvas;
	var ctx;
	var unitWidth;
	var unitHeight;

	var privateMethods = {
		drawGrids: function() {
			for(var i=1; i<=10; i++) {
				privateMethods.drawGrid(i);
			}
		},

		drawGrid: function(i) {
			var y = privateMethods.round(unitHeight*(i+1));
			if(i==1) {
				ctx.strokeStyle = "rgb(200,0,0)";
			} else {
				ctx.strokeStyle = "rgb(0, 0, 0)";
			}

			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
			ctx.closePath();

			ctx.stroke();
		},

		drawLabel: function() {
			for(var i=0; i<nutrients.length; i++) {
				var x = privateMethods.round(unitWidth*((i+1)*3 - 2));
				var y = privateMethods.round(unitHeight*12-1);
				var maxSize = privateMethods.round(unitWidth*2);
				ctx.fillStyle = "rgb(200, 0, 0)";
				ctx.fillText(nutrients[i], x, y, maxSize);
			}
		},

		drawSelfNutrient: function(id) {
			var x = (id*unitWidth*3) - unitWidth*2;
			var y = unitHeight;
			privateMethods.drawGrid();
		},

		drawAvgNutrient: function(id) {
		},

		round: function(i) {
			var rounded = (0.5 + i) | 0;
			return rounded;
		}
	};

	nutrientGraph.interface = {
		init: function(id) {
			canvas = $(id)[0];
			ctx = canvas.getContext('2d');
			unitWidth = canvas.width / (nutrients.length*3 + 1);
			unitHeight = canvas.height/12;

			privateMethods.drawGrids();
			privateMethods.drawLabel();
		},

		setSelfNutrient: function() {

		},

		setAvgNutrient: function() {

		}
	};
})(window, $);

$(document).ready(function() {
	nutrientGraph.interface.init('canvas');
});