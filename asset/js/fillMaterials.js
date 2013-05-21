if(!window.fillMaterials) fillMaterials = {};

(function(w, $){
	var parentDiv;

	fillMaterials.interface = {
		fill: function(keys, values, colors) {
			if(keys.length != values.length) return;
			if(values.length != colors.length) return;

			for(var i=0; i<keys.length; i++) {
				if(values[i] < 0.7) $(keys[i]).addClass("material-" + colors[i] + "-dark");
				else $(keys[i]).addClass("material-" + colors[i] + "-light");
			}
		}
	};
})(window, $);

