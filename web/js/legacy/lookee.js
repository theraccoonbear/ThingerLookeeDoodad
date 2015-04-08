var drill = '';

(function() {
	var tagRgx = /(\{{2,3})([^\}]+)(\}{2,3})/;

	var Template_defaults = {};
	
	var loadResource = function(url, callback) {
		$.get(url, {}, function(d, s, x) {
			callback(d);
		});
	}; // loadResource()
	
	drill = function(obj, bits) {
		bits = $.isArray(bits) ? bits : [bits];
		return bits.length == 0 ? obj : (typeof obj[bits[0]] === 'undefined' ? '' : drill(obj[bits[0]], bits.slice(1)));
	};
	
	var escape = function(rawStr) {
		return rawStr.toString().replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
			return '&#'+i.charCodeAt(0)+';';
		});
	};
	
	TLD.Lookee = function(tmpl, options) {
		this.parsed = this.parse(tmpl);
		this.options = $.extend({}, Template_defaults, options);
		this.ready = true;
	};
	
	//TLD.Lookee.prototype.enqueue = function(name, url, options) {
	//	this._queue.push({name: name, url: url, options: options});
	//}; // enqueue()
	
	TLD.Lookee.load = function(url, template) {
		template = {};
		template.ready = false;
		loadResource(url, function(t) {
			template = new TLD.Lookee(t);
		});
	};
	
	TLD.Lookee.prototype.parse = function(tmpl, o) {
		var t = tmpl;
		var m;
		
		var def = {
			closer: false,
		};
		
		o = $.extend({}, def, o);
		
		var nodes = [];
		var pre, post;
		var token, ctoken, tagOpen, tagClose;
		
		m = tagRgx.exec(t);
		var cont = m !== null;
		
		while (cont) {
			tagOpen = m[1];
			token = m[2];
			ctoken = token.substring(1).trim();
			tagClose = m[3];
			if (tagOpen.length !== tagClose.length) {
				throw "Mismatched braces on tag: " + m[0]
			}
			
			
			
			pre = t.substring(0, m.index);
			post = t.substring(m.index + token.length + tagOpen.length + tagClose.length);
			
			nodes.push({
				t: 'L',
				v: pre
			});
			
			t = post;
			
			switch (token.substring(0, 1)) {
				case '#': // loop open
					var pr = this.parse(t, {closer: ctoken});
					
					nodes.push({
						t: '#',
						c: pr.nodes,
						v: ctoken
					});
					
					t = pr.rem;
					break;
				case '/': // loop close
					if (o.closer === false) {
						throw "Unexpected section closer: {{/" + ctoken + "}}";
					} else if (o.closer !== ctoken) {
						throw "Expecting section closer {{/" + o.closer + "}} but encountered {{/" + ctoken + "}}";
					}
					cont = false;
					break;
				case '^': // inverse
					var pr = this.parse(t, {closer: ctoken});
					
					nodes.push({
						t: '^',
						c: pr.nodes,
						v: ctoken
					});
					
					t = pr.rem;
					break
				case '>':
					nodes.push({
						t: '>',
						v: ctoken
					});
				case '!': // comment
					break;
				case '&': // unescaped variable
					nodes.push({
						t: 'V',
						v: token,
						e: false
					});
					break;
				default: // variable
					nodes.push({
						t: 'V',
						v: token,
						e: tagOpen.length === 2
					});
					break;
			}
			
			m = tagRgx.exec(t);
			cont = cont && m !== null;
		}
		
		if (o.closer !== false && o.closer !== ctoken) {
			throw "Unclosed section {{#" + o.closer + "}}";
		}
		
		nodes.push({
			t: 'mkup',
			v: t
		});
		
		
		return {
			nodes: nodes,
			rem: t
		};
	};
	
	var renderChain = [];
	
	var renderNode = function(nodes, data, options) {
		var mkup = [];
		
		for (var i = 0, l = nodes.length; i < l; i++) {
			var n = nodes[i];
			switch (n.t.toUpperCase()) {
				case '#':
					if (typeof data[n.v] !== 'undefined') {
						var sn = data[n.v];
						if ($.isArray(sn)) {
							for (var si = 0, sl = sn.length; si < sl; si++) {
								var el = sn[si];
								el._index = si;
								el._count = si + 1;
								mkup.push(renderNode(n.c, el, options));
							}
						} else {
							if ((typeof sn === 'string' && sn.length > 0) || typeof sn === 'number') {
								mkup.push(renderNode(n.c, sn, options));
							}
						}
					}
					break;
				case '^':
					if (typeof data[n.v] === 'undefined' || ($.isArray(data[n.v]) && data[n.v].length === 0)) {
						renderChain.push(n.v);
						mkup.push(renderNode(n.c, {}, options));
						renderChain.pop();
					}
					break;
				case 'L':
					mkup.push(n.v);
					break;
				case '>':
					if (typeof options.partials[n.v] === 'undefined') {
						throw "Undefined partial: " + n.v;
					}
					
					mkup.push(options.parsed_partials[n.v].render(data));
					
				case 'V':
					var val;
					if (n.v === '.') {
						val = data;
					} else {
						val = typeof data[n.v] !== 'undefined' ? (typeof data[n.v] === 'function' ? data[n.v]() : data[n.v]) : '';
					}
					if (n.e) {
						val = escape(val);
					}
					
					mkup.push(val);
					break;
			}
		}
		
		return mkup.join('');
	};
	
	Lookee_render_defaults = {
		partials: {}
	};
	
	TLD.Lookee.prototype.render = function(data, options) {
		options = $.extend({}, Lookee_render_defaults, options);
		options.parsed_partials = {};
		
		for (var pname in options.partials) {
			options.parsed_partials[pname] = options.partials[pname] instanceof TLD.Lookee ? options.partials[pname] : new TLD.Lookee(options.partials[pname]); 
		}
		
		return renderNode(this.parsed.nodes, data, options);
	};
})();