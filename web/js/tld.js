var TLD = (function() {
	// THINGER
	var thinger = function(o) {
		var ctxt = this;
		
		var _data = {};
		
		this.options = o || {};
		
		
	}; // thinger()
	
	var p_thinger = thinger.prototype;
	
	p_thinger.loadData = function(data) {
		_data = data;
	}; // t.loadData()
	
	p_thinger.dbg = function() {
		console.log('_data', _data);
	}; // t.dbg()
	
	p_thinger.bind = function() {
		
	}; // t.bind()
	
	// END THINGER
	
	// LOOKEE
	var lookee = function() {
		
	}; // lookee()
	
	// END LOOKEE
	
	// DOODAD
	var doodad = function() {
		
	}; // doodad()
	
	// END DOODAD
	
	return {
		T: thinger,
		L: lookee,
		D: doodad
	};
})();