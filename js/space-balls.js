/*
	Space Balls
*/

var spaceBalls = function(opts) {
		
	var width = '100%',
		height = $(window).height(),
		myId = opts.id,
		data = opts.data,
		curData = data,
		ttime = 1500,
		zoom,
		isDragging = false,
		showingGrideLines = false,
		sunIsRedGiant = false,
		redGiantDiameter = 356271104;

	var tip = d3.tip().attr('class', 'd3-tip')
		.direction('s')
		.offset([10, 0])
		.html(function(d) { 
			d = d || {};
			d.name = d.name || '?';
			
			var ret;

			if ($(window).width() <= 1000) {
				ret = '' +
					'<div class="tt-row">' +
						'<div class="tt-value">'+d.name+'</div>' +
					'</div>';
			} else {
				var dnote = '(equator)';
				if (d.meanDiameter) {
					dnote = '(average)';
				}

				ret = '' +
					'' +
					'<div class="tt-row">' +
						'<div class="tt-label">Name:</div>' +
						'<div class="tt-value">'+d.name+'</div>' +
					'</div>' +
					'<div class="tt-row">' +
						'<div class="tt-label">Category:</div>' +
						'<div class="tt-value">'+d.category+'</div>' +
					'</div>' +

					'<div class="tt-row">' +
						'<div class="tt-label">Diameter:</div>' +
						'<div class="tt-value">'+commas(d.diameter)+' km ' + dnote + '</div>' +
					'</div>' +
					'';
				if (d.distance) {
					var amount = d.distance;
					if (d.smAxis) {
						amount = amount + d.smAxis;
					}

					ret += '' +
						'<div class="tt-row">' +
							'<div class="tt-label">Sun Dist:</div>' +
							'<div class="tt-value">'+commas(amount)+' km (semi-major axis)</div>' +
						'</div>';
				}
			}

			return ret;
		});

	// ------------------------------------------------------------------------
	// Position Objects
	// ------------------------------------------------------------------------

	function commas(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	function getDatumByName(name) {
		for (ii = 0; ii < data.length; ii++) {
			if (data[ii].name === name) {
				return data[ii];
			}
		}
		return null;
	}

	function updatePosition(name, x, y) {
		var d = getDatumByName(name);
		d.x = x;
		d.y = y;
	}

	function setStandardPosition(dur) {
		dur = (typeof dur === 'number') ? dur : ttime;

		var svg = d3.select(myId + ' svg g.main');

		var planets = svg.selectAll('g.space-ball').data(curData, function(d) {
			return d.name;
		});

		var startX = 100,
			nextX = startX,
			prevType,
			planetSpacing = 100;

		planets
			.transition()
			.duration(dur)
			.attr('transform', function(d) {

				if (nextX !== startX) {
					if (d.type === 'terrestrial') {
						nextX += 5;
					} else if (d.type === 'gas') {
						nextX += 10;//100
					} else {
						nextX += 100;
					}
				}

				var x = nextX + getPixelsFromKilometers(d.diameter)/2,
					y = height / 2;
				d.x = x;
				d.y = y;
				updatePosition(d.name, d.x, d.y);

				nextX = x + getPixelsFromKilometers(d.diameter)/2;
				prevType = d.type;

				return 'translate('+x+','+y+')';
			})
			.attr('class', 'space-ball')
			.attr('x', function(d) {
				return d.x;
			})
			.attr('y', function(d) {
				return d.y;
			});

		planets.select('circle')
			.transition()
			.duration(0)
			.attr('r', function(d) {
				return getPixelsFromKilometers(d.diameter) / 2;
			});

			setTimeout(updateAuxiliaryLines, 100);
	}

	function setBetweenEarthAndMoon(apogee) {
		var dist;

		if (apogee) {
			dist = 405400;
		} else {
			dist = 384400;
		}

		var svg = d3.select(myId + ' svg g.main');

		var planets = svg.selectAll('g.space-ball').data(curData, function(d) {
			return d.name;
		});

		var startOffset = 100,
			nextX = (getPixelsFromKilometers(getDatumByName('Earth').diameter) / 2) + startOffset;

		planets
			.transition()
			.duration(ttime)
			.attr('transform', function(d) {
				var x,
					y = height / 2;

				if (d.name === 'Earth') {
					x = startOffset;
				} else if (d.name === 'The Moon') {
					x = getPixelsFromKilometers(dist) +
						(getPixelsFromKilometers(getDatumByName('Earth').diameter) / 2) +
						(getPixelsFromKilometers(getDatumByName('The Moon').diameter) / 2) + 
						startOffset;
				} else if (d.name === 'The Sun') {
					x = getPixelsFromKilometers(1450000); // just put it way out there
				} else {
					x = nextX + getPixelsFromKilometers(d.diameter)/2;
					nextX = x + getPixelsFromKilometers(d.diameter)/2;
				}

				d.x = x;
				d.y = y;
				updatePosition(d.name, d.x, d.y);

				return 'translate('+x+','+y+')';
			})
			.attr('class', 'space-ball')
			.attr('x', function(d) {
				return d.x;
			})
			.attr('y', function(d) {
				return d.y;
			})
			.each('end', updateAuxiliaryLines); // this is only really be called once, but eh;
	}

	function setAsDistanceFromSun() {
		var svg = d3.select(myId + ' svg g.main');

		var planets = svg.selectAll('g.space-ball').data(curData, function(d) {
			return d.name;
		});

		var startOffset = 100;

		planets
			.transition()
			.duration(ttime)
			.attr('transform', function(d) {
				var x,
					y = height / 2;

				if (d.name === 'The Sun') {
					x = (getPixelsFromKilometers(getDatumByName('The Sun').diameter)/2) * -1 + startOffset;
				} else {
					x = getPixelsFromKilometers(d.distance);
				}

				d.x = x;
				d.y = y;
				
				updatePosition(d.name, d.x, d.y);

				return 'translate('+x+','+y+')';
			})
			.attr('class', 'space-ball')
			.attr('x', function(d) {
				return d.x;
			})
			.attr('y', function(d) {
				return d.y;
			})
			.each('end', updateAuxiliaryLines); // this is only really be called once, but eh
	}

	function toggleSunAsRedGiant(dur) {
		var planets = getPlanets(),
			oldFillType = (!sunIsRedGiant) ? 'img_the_sun_rg' : 'img_the_sun';
			fillType = (sunIsRedGiant) ? 'img_the_sun_rg' : 'img_the_sun';

		dur = (typeof dur !== 'undefined') ? dur : ttime;

		planets.select(myId + '_' + nameId('The Sun'))
			.attr('fill', function() {
				if (fillType === 'img_the_sun_rg') {
					return 'url(#' + fillType + ')';
				} else {
					return 'url(#' + oldFillType + ')';
				}
			})
			.transition()
			.duration(dur)
			.attr('r', function(d) {
				return (sunIsRedGiant) ? getPixelsFromKilometers(redGiantDiameter)/2 : getPixelsFromKilometers(d.diameter)/2;
			})
			.each('end', function() {
				d3.select(this).attr('fill', 'url(#' + fillType + ')');
			});
	}

	// ------------------------------------------------------------------------
	// Context menu
	// ------------------------------------------------------------------------

	var pmenu = [
		{
			title: 'Goto Wikipedia article',
			action: function(elm, d, i) {
				window.open(d.wikipedia);
			}
		}
	];

	var menu = [
		{
			title: 'Reset',
			action: function(elm, d, i) {
				curData = data;

				sunIsRedGiant = false;
				toggleSunAsRedGiant(0);

				setTimeout(function() {
					updateVis(function() {
						setStandardPosition();
					});
					
					resetZoom();
				}, 20);
			}
		},
		{
			title: function() {
				if (sunIsRedGiant) {
					return 'Return the Sun to its normal size';
				} else {
					return 'Turn the Sun into a Red Giant';
				}
			},
			action: function(elm, d, i) {
				sunIsRedGiant = !sunIsRedGiant;
				toggleSunAsRedGiant(ttime);
			}
		},
		{
			title: 'Align Planets Between the Earth and the Moon',
			action: function(elm, d, i) {
				var objs = ['Mercury', 'Venus', 'Earth', 'The Moon', 'Mars', 'Jupiter', 'Saturn', 'Neptune', 'Uranus', 'Pluto'];

				curData = [];

				data.forEach(function(d) {
					if ( $.inArray(d.name, objs) !== -1) {
						curData.push(d);
					}
				});

				updateVis(function() {
					setBetweenEarthAndMoon();
				});
				resetZoom();
			}
		},
		{
			title: 'Align Planets Between the Earth and the Moon (Apogee)',
			action: function(elm, d, i) {
				var objs = ['Mercury', 'Venus', 'Earth', 'The Moon', 'Mars', 'Jupiter', 'Saturn', 'Neptune', 'Uranus', 'Pluto'];

				curData = [];

				data.forEach(function(d) {
					if ( $.inArray(d.name, objs) !== -1) {
						curData.push(d);
					}
				});

				updateVis(function() {
					setBetweenEarthAndMoon(true);
				});
				resetZoom();
			}
		},
		{
			title: 'Set planets at their distance from the Sun',
			action: function(elm, d, i) {
				curData = [];

				data.forEach(function(d) {
					if ( typeof d.distance !== 'undefined' ) {
						curData.push(d);
					}
				});

				updateVis(function() {
					setAsDistanceFromSun();
				});
				resetZoom();
			}
		},
		{
			title: function() {
				if (showingGrideLines) {
					return 'Hide Guide Lines';
				} else {
					return 'Show Guide Lines';
				}
			},
			action: function(elm, d, i) {
				showingGrideLines = !showingGrideLines;
				updateAuxiliaryLines();
			}
		}
	];

	// ------------------------------------------------------------------------

	function getSize(d) {
		var bbox = this.getBBox(),
			diameter = getPixelsFromKilometers(d.diameter) * 0.8,
			cbbox = {
				width: diameter,
				height: diameter / 5
			},
			scale = Math.min(cbbox.width/bbox.width, cbbox.height/bbox.height);
		d.scale = scale;
	}

	function customShow(opts, d) {
		tip.show(d);

		$('.d3-tip').css({
			top: opts.top,
			left: opts.left - $('.d3-tip').outerWidth()/2,
			opacity: 1
		});
	}

	function updateAuxiliaryLines() {
		var planets = getPlanets();

		planets.select('circle')
			.attr('stroke-width', function(d) {
				var scale = zoom.scale() || 1,
					val = (1 / scale) * 2;
				return val;
			});

		var guides = getGuides();

		guides.select('.vline')
			.attr('stroke', guideLineColor)
			.attr('x1', vX1Pos)
			.attr('x2', vX2Pos);
		guides.select('.hline')
			.attr('stroke', guideLineColor)
			.attr('y1', hY1Pos)
			.attr('y2', hY2Pos);
	}

	function zoomed() {
		tip.hide();
		d3.select(myId + ' svg g.main').attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		updateAuxiliaryLines();

		var planets = getPlanets();
		planets.select('circle').attr('fill', fillFunct);

		//console.dir(d3.event.translate);
		//console.dir(d3.event.scale);
	}

	function resetZoom(dur, ease, scale, trans) {
		dur = (typeof dur === 'number') ? dur : ttime;
		ease = (typeof ease === 'string') ? ease : 'cubic-in-out';
		scale = (typeof scale === 'number') ? scale : 1;
		trans = (typeof trans !== 'undefined') ? trans : [0,0];

		tip.hide();
		zoom.scale(scale);
		zoom.translate(trans);
		d3.select(myId + ' svg g.main')
			.transition()
			.ease(ease)
			.duration(dur)
			.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
		updateAuxiliaryLines();
	}

	function getPixelsFromKilometers(diameter) {
		return diameter / 250;
	}

	function nameId(name) {
		return name.replace(/ /, '_').toLowerCase();
	}

	function getGuides() {
		var guideGroup = d3.select(myId + ' svg g.guide');
		return guideGroup.selectAll('g.guide-lines').data(curData, function(d) {
			return d.name;
		});
	}

	function getPlanets() {
		var mainGroup = d3.select(myId + ' svg g.main');
		return mainGroup.selectAll('g.space-ball').data(curData, function(d) {
			return d.name;
		});
	}

	function getScreenCoords(x, y, ctm) {
		var xn = ctm.e + x*ctm.a;
		var yn = ctm.f + y*ctm.d;
		return { x: xn, y: yn };
	}

	/*
		Yeah, the below is kind of cheating, but it's probably the best way. Trying to manually
		re-calculate the translation and scaling was way too bug prone. This is straight forward
		and easy.
	*/

	function vX1Pos(d) {
		var svgCircle = document.getElementById(myId.substr(1) + '_'+nameId(d.name));
		if (!svgCircle) return 0;

		var cx = +svgCircle.getAttribute('cx');
		var cy = +svgCircle.getAttribute('cy');
		var ctm = svgCircle.getCTM();
		var coords = getScreenCoords(cx, cy, ctm);
		return  coords.x;
	}

	function vX2Pos(d) {
		var svgCircle = document.getElementById(myId.substr(1) + '_'+nameId(d.name));
		if (!svgCircle) return 0;

		var cx = +svgCircle.getAttribute('cx');
		var cy = +svgCircle.getAttribute('cy');
		var ctm = svgCircle.getCTM();
		var coords = getScreenCoords(cx, cy, ctm);
		return  coords.x;
	}

	function hY1Pos(d) {
		var svgCircle = document.getElementById(myId.substr(1) + '_'+nameId(d.name));
		if (!svgCircle) return 0;

		var cx = +svgCircle.getAttribute('cx');
		var cy = +svgCircle.getAttribute('cy');
		var ctm = svgCircle.getCTM();
		var coords = getScreenCoords(cx, cy, ctm);

		return  coords.y;
	}

	function hY2Pos(d) {
		var svgCircle = document.getElementById(myId.substr(1) + '_'+nameId(d.name));
		if (!svgCircle) return 0;

		var cx = +svgCircle.getAttribute('cx');
		var cy = +svgCircle.getAttribute('cy');
		var ctm = svgCircle.getCTM();
		var coords = getScreenCoords(cx, cy, ctm);

		return  coords.y;
	}

	function guideLineColor(d) {
		if (showingGrideLines) {
			return '#008888';
		} else {
			return 'transparent';
		}
	}

	function fillFunct(d) {
		var name = nameId(d.name);

		if (d.hasImage === 'The Sun') {

			if (d.name === 'The Sun') {
				name = (sunIsRedGiant) ? name + '_rg' : name;
			}

			if (getPixelsFromKilometers(d.diameter) * zoom.scale() > 2500) {
				return 'rgb(230, 77, 20)';
			} else {
				return 'url(#img_' + name + ')';
			}
		} else if (d.hasImage) {
			return 'url(#img_' + name + ')';
		} else {
			return '#088';
		}
	}

	/* 
		Create visualization
	*/
	function createVis() {

		d3.select(myId).select('svg').remove();

		zoom = d3.behavior.zoom()
			.on("zoom", zoomed);

		var svg = d3.select(myId)
			.append('svg')
			.attr('width',  width)
			.attr('height', height);
		
		svg.call(tip);
		svg.call(zoom);

		var ii,
			rr,
			pattern,
			imgName,
			defs = svg.append('defs');

		for (ii = 0; ii < data.length; ii++) {
			rr = getPixelsFromKilometers(data[ii].diameter) / 2;
			name = nameId(data[ii].name);

			if (typeof data[ii].hasImage === 'string') {
				imgName = 'img/' + nameId(data[ii].hasImage) + '_lr.jpg';
			} else {
				imgName = 'img/' + name + '_lr.jpg';
			}

			pattern = defs.append('pattern')
				.attr('id', 'img_' + name)
				.attr('x', -rr)
				.attr('y', -rr)
				.attr('height', rr*2)
				.attr('width', rr*2)
				.attr("patternUnits", "userSpaceOnUse");

			pattern.append('image')
				.attr('xlink:href', imgName)
				.attr('x', 0)
				.attr('y', 0)
				.attr('height', rr*2)
				.attr('width', rr*2);

			if (data[ii].name === 'The Sun') {
				rr = getPixelsFromKilometers(redGiantDiameter) / 2;

				pattern = defs.append('pattern')
					.attr('id', 'img_' + name + '_rg')
					.attr('x', -rr)
					.attr('y', -rr)
					.attr('height', rr*2)
					.attr('width', rr*2)
					.attr("patternUnits", "userSpaceOnUse");

				pattern.append('image')
					.attr('xlink:href', imgName)
					.attr('x', 0)
					.attr('y', 0)
					.attr('height', rr*2)
					.attr('width', rr*2);
			}
		}

		svg.append('g').attr('class', 'guide');
		svg.append('g').attr('class', 'main');

		svg.on('contextmenu', d3.contextMenu(menu));

		updateVis(function() {
			setStandardPosition(0);
		});
	}

	function updateVis(setupFunct) {

		var planets = getPlanets();

		var drag = d3.behavior.drag()
			.origin(function(d) { return d; })
			.on('dragstart', function dragstarted(d) {
				isDragging = true;
				tip.hide();
				d3.event.sourceEvent.stopPropagation();
				d3.select(this).classed('dragging', true);
			})
			.on('drag', function dragged(d) {
				var translateStr = 'translate('+ (d.x = d3.event.x) +','+ (d.y = d3.event.y) +')';
				d3.select(this).attr('transform', translateStr);
				updatePosition(d.name, d.x, d.y);
			})
			.on('dragend', function dragended(d) {
				d3.select(this).classed('dragging', false);
				isDragging = false;
				updateAuxiliaryLines();
			});

		var enterGroup = planets.enter()
			.append('g')
			.attr('transform', function(d) {
				return 'translate('+10000+','+(height / 2)+')';
			})
			.attr('class', 'space-ball');
		enterGroup.call(drag);

		enterGroup
			.append('circle')
			.attr('id', function(d) {
				return myId.substr(1) + '_' + nameId(d.name);
			})
			.attr('r', function(d) {
				return 0;
			})
			.attr('fill', fillFunct)
			.attr('stroke-width', function(d) {
				return 2;
			})
			.on('mouseenter', function(d) {
				if (isDragging) return;
				tip.show(d);
			})
			.on('mouseleave', function(d) {
				tip.hide();
			})
			.on('contextmenu', d3.contextMenu(pmenu));

		enterGroup
			.append('text')
			.text(function(d) {
				return d.name;
			})
			.style('font-size', '1px')
			.each(getSize)
			.style('font-size', function(d) {
				return d.scale + 'px';
			})
			.attr('text-anchor', 'middle')
			.attr('x', function() {
				return 0;
			})
			.attr('y', function(d) {
				var fontSize = parseFloat(d3.select(this).style('font-size'), 10);
				d.nameY = (getPixelsFromKilometers(d.diameter) / 2) + (fontSize * 1.2);
				return d.nameY;
			})
			.attr('fill', 'white');

		enterGroup
			.append('text')
			.text(function(d) {
				var cat = d.category;
				if (cat === 'Planet' || cat === 'Star') {
					cat = '';
				}
				return cat;
			})
			.style('font-size', '1px')
			.each(getSize)
			.style('font-size', function(d) {
				return d.scale + 'px';
			})
			.attr('text-anchor', 'middle')
			.attr('x', function() {
				return 0;
			})
			.attr('y', function(d) {
				var fontSize = parseFloat(d3.select(this).style('font-size'), 10);
				return d.nameY + (fontSize * 1.2);
			})
			.attr('fill', 'white');

		planets.exit().remove();

		setupFunct();

		// Create guides
		var guides = getGuides();

		enterGroup = guides.enter()
			.append('g')
			.attr('transform', function(d) {
				return 'translate('+0+','+0+')';
			})
			.attr('class', 'guide-lines');

		// Setup Guide Lines
		enterGroup
			.append('line')
			.attr('class', 'vline')
			.attr('stroke', guideLineColor)
			.attr('x1', vX1Pos)
			.attr('x2', vX2Pos)
			.attr('y1', -height*10)
			.attr('y2', height*10)
			.on('mouseenter', function(d) {
				if (isDragging || !showingGrideLines) return;
				var coordinates = d3.mouse(this);

				customShow({
					left: coordinates[0],
					top: coordinates[1]
				}, d);
			})
			.on('mouseleave', function(d) {
				tip.hide();
			});
		enterGroup
			.append('line')
			.attr('class', 'hline')
			.attr('stroke', guideLineColor)
			.attr('x1', -height*10)
			.attr('x2', height*10)
			.attr('y1', hY1Pos)
			.attr('y2', hY2Pos);

		guides.exit().remove();
	}

	$(window).resize(function() {
		height = $(window).height();
		d3.select(myId).select('svg').attr('height', height);

		$('.main-heading').css({
			width: width
		});
	});

	// ------------------------------------------------------------------------
	// Init
	// ------------------------------------------------------------------------

	$('.main-heading').css({
		width: width
	});

	$('.main-heading').fadeIn(ttime);

	setTimeout(function() {
		$('.main-heading').fadeOut(ttime);
	}, 5000);

	// process data
	data.forEach(function(d) {
		if (d.radius) {
			d.diameter = d.radius * 2;
		}

		if (d.category.indexOf('Moon of') === 0) {
			var planet = d.category.split(' ')[2],
				datum = getDatumByName(planet);
			d.distance = datum.distance;
		}

		if (d.smAxis) {
			d.distance = d.distance + d.smAxis;
		}
	});

	opts.data.sort(function(a, b) {
		if (a.diameter > b.diameter) {
			return 1;
		} else if (a.diameter < b.diameter) {
			return -1;
		} else {
			return 0;
		}
	});

	createVis();
};

spaceBalls.MAX_INT = 4294967295;



