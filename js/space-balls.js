/*
	Space Balls
*/

var spaceBalls = function(opts) {
		
	var width = '100%',
		height = 800,
		myId = opts.id,
		data = opts.data,
		ttime = 1500,
		zoom,
		isDragging = false;

	var tip = d3.tip().attr('class', 'd3-tip')
		.direction('s')
		.offset([10, 0])
		.html(function(d) { 
			return ''+
				'<div class="tt-row">' +
					'<div class="tt-value">'+d.name+'</div>' +
				'</div>'+
				'';
		});

	// ------------------------------------------------------------------------
	// Position Objects
	// ------------------------------------------------------------------------

	function getDatumByName(name) {
		for (ii = 0; ii < data.length; ii++) {
			if (data[ii].name === name) {
				return data[ii];
			}
		}
		return null;
	}

	function setStandardPosition(dur) {
		dur = (typeof dur === 'number') ? dur : ttime;

		var svg = d3.select(myId + ' svg g.main');

		var planets = svg.selectAll('g.space-ball').data(data, function(d) {
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
						nextX += 25;
					} else if (d.type === 'gas') {
						nextX += 100;
						if (prevType === 'terrestrial') {
							nextX += 150;
						}
					} else {
						nextX += 500;
					}
				}

				var x = nextX + getPixelsFromKilometers(d.diameter)/2,
					y = height / 2;
				d.x = x;
				d.y = y;

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
			.duration(ttime)
			.attr('r', function(d) {
				return getPixelsFromKilometers(d.diameter) / 2;
			});
	}

	function setBetweenEarthAndMoon() {
		var svg = d3.select(myId + ' svg g.main');

		var planets = svg.selectAll('g.space-ball').data(data, function(d) {
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
					x = getPixelsFromKilometers(384400) +
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

				return 'translate('+x+','+y+')';
			})
			.attr('class', 'space-ball')
			.attr('x', function(d) {
				return d.x;
			})
			.attr('y', function(d) {
				return d.y;
			});
	}

	function setAsDistanceFromSun() {
		var svg = d3.select(myId + ' svg g.main');

		var planets = svg.selectAll('g.space-ball').data(data, function(d) {
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

				return 'translate('+x+','+y+')';
			})
			.attr('class', 'space-ball')
			.attr('x', function(d) {
				return d.x;
			})
			.attr('y', function(d) {
				return d.y;
			});
	}

	// ------------------------------------------------------------------------
	// Context menu
	// ------------------------------------------------------------------------

	var menu = [
		{
			title: 'Reset',
			action: function(elm, d, i) {
				setStandardPosition();
				resetZoom();
			}
		},
		{
			title: 'Align Planets Between the Earth and the Moon',
			action: function(elm, d, i) {
				setBetweenEarthAndMoon();
				resetZoom();
			}
		},
		{
			title: 'Set planets at their distance from the Sun',
			action: function(elm, d, i) {
				setAsDistanceFromSun();
				resetZoom();
			}
		}
	];

	// ------------------------------------------------------------------------

	function setCircleBorderWidth() {
		var svg = d3.select(myId + ' svg g.main');

		var planets = svg.selectAll('g.space-ball').data(data, function(d) {
			return d.name;
		});

		planets.select('circle')
			.attr('stroke-width', function(d) {
				var scale = zoom.scale() || 1,
					val = (1 / scale) * 2;
				return val;
			});
	}

	function zoomed() {
		tip.hide();
		d3.select(myId + ' svg g.main').attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		setCircleBorderWidth();
	}

	function resetZoom() {
		tip.hide();
		zoom.scale(1);
		zoom.translate([0,0]);
		d3.select(myId + ' svg g.main')
			.transition()
			.duration(ttime)
			.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
		setCircleBorderWidth();
	}

	function getPixelsFromKilometers(diameter) {
		return diameter / 250;
	}

	function nameId(name) {
		return name.replace(/ /, '_').toLowerCase();
	}

	/* 
		Create visualization
	*/
	function createVis(data) {

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
			defs = svg.append('defs');

		for (ii = 0; ii < data.length; ii++) {
			rr = getPixelsFromKilometers(data[ii].diameter) / 2;
			name = nameId(data[ii].name);

			pattern = defs.append('pattern')
				.attr('id', 'img_' + name)
				.attr('x', -rr)
				.attr('y', -rr)
				.attr('height', rr*2)
				.attr('width', rr*2)
				.attr("patternUnits", "userSpaceOnUse");

			pattern.append('image')
				.attr('xlink:href', 'img/' + name + '_lr.png')
				.attr('x', 0)
				.attr('y', 0)
				.attr('height', rr*2)
				.attr('width', rr*2);
		}

		svg.append('g').attr('class', 'main');

		svg.on('contextmenu', d3.contextMenu(menu));

		updateVis(data);
	}

	function updateVis(data) {

		var svg = d3.select(myId + ' svg g.main'),
			planets;

		var drag = d3.behavior.drag()
			.origin(function(d) { return d; })
			.on("dragstart", function dragstarted(d) {
				isDragging = true;
				tip.hide();
				d3.event.sourceEvent.stopPropagation();
				d3.select(this).classed("dragging", true);
			})
			.on("drag", function dragged(d) {
				var translateStr = 'translate('+ (d.x = d3.event.x) +','+ (d.y = d3.event.y) +')';
				d3.select(this).attr("transform", translateStr);
			})
			.on("dragend", function dragended(d) {
				d3.select(this).classed("dragging", false);
				isDragging = false;
			});

		planets = svg.selectAll('g.space-ball').data(data, function(d) {
			return d.name;
		});

		var enterGroup = planets.enter()
			.append('g')
			.attr('transform', function(d) {
				return 'translate('+0+','+(height / 2)+')';
			})
			.attr('class', 'space-ball')
			.attr('x', function(d) {
				return d.x;
			})
			.attr('y', function(d) {
				return d.y;
			});
		enterGroup.call(drag);

		enterGroup
			.append('circle')
			.attr('r', function(d) {
				return 0;
			})
			.attr('fill', function(d) {
				var name = nameId(d.name);
				return 'url(#img_' + name + ')';
			})
			.attr('stroke-width', function(d) {
				return 2;
			})
			.on('mouseenter', function(d) {
				if (isDragging) return;
				tip.show(d);
			})
			.on('mouseleave', function(d) {
				tip.hide();
			});
		
		setStandardPosition(0);
	}

	// ------------------------------------------------------------------------
	// Init
	// ------------------------------------------------------------------------

	opts.data.sort(function(a, b) {
		if (a.diameter > b.diameter) {
			return 1;
		} else if (a.diameter < b.diameter) {
			return -1;
		} else {
			return 0;
		}
	});

	createVis(opts.data);
};



