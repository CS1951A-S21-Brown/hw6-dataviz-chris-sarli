let graph_3_width = (document.getElementById("chord-container").offsetWidth)
	
var actors_by_dir;
var dirs;
var acts;
var res;
var svg3;
var movies;
var chord_genre = "Stand-Up Comedy";
var chord_recent = 25;
const chord_height = 250;
const ring_width = 10;

let graph_3_height = chord_height + 10;

function updateChordData(m) {
	movies = m;
	updateChord(movies, chord_genre, chord_recent)
}

function updateChordRecent(r) {
	chord_recent = r;
	updateChord(movies, chord_genre, chord_recent)
}

function updateChordGenre(g) {
	chord_genre = g;
	updateChord(movies, chord_genre, chord_recent)
}

function updateChord(movies, genre, recent) {
	actors_by_dir = {}
	dirs = []
	acts = []
	
	movies.filter(m => m.listed_in.includes(genre)).sort((a, b) =>
		parseInt(a['release_year']) > parseInt(b['release_year'])).slice(0, recent).forEach(d => {
		directors = d.director.split(", ")
		cast = d.cast.split(", ")
		directors.forEach(dir => {
			dirs.push(dir)
			cast.forEach(c => {
				acts.push(c)
				if (!(dir in actors_by_dir)) {
					actors_by_dir[dir] = {}
				}
				if (!(c in actors_by_dir[dir])) {
					actors_by_dir[dir][c] = []
				}
				actors_by_dir[dir][c].push(d.title)
			})
		})
	})
	
	dirs = [...new Set(dirs)].filter(d => d != "")
	acts = [...new Set(acts)].filter(d => d != "")

	var matrix = [];

	dirs.forEach(dir => {
		row = dirs.map(d => 0)
		acts.forEach(act => {
			if (dir in actors_by_dir && act in actors_by_dir[dir]) {
				if (actors_by_dir[dir][act].length > 1) {
					
				}
				row.push(actors_by_dir[dir][act].length)
			} else {
				row.push(0)
			}
		})
		matrix.push(row)
	})

	acts.forEach(act => {
		row = []
		dirs.forEach(dir => {
			if (dir in actors_by_dir && act in actors_by_dir[dir]) {
				row.push(actors_by_dir[dir][act].length)
			} else {
				row.push(0)
			}
		})
		acts.forEach(a => row.push(0))
		matrix.push(row)
	})

	keep = []
	for (i = 0; i < matrix.length; i++) {
		if (matrix[i].reduce((a, b) => a + b, 0) >= 2) {
			keep.push(i)
		}
	}
	
	matrix = keep.map(k => keep.map(l => matrix[k][l]))
	acts = keep.filter(k => k >= dirs.length).map(k => acts[k - dirs.length])
	dirs = keep.filter(k => k < dirs.length).map(k => dirs[k])
	

	keep = []
	for (i = 0; i < matrix.length; i++) {
		if (matrix[i].reduce((a, b) => a + b, 0) >= 1) {
			keep.push(i)
		}
	}
	
	matrix = keep.map(k => keep.map(l => matrix[k][l]))
	acts = keep.filter(k => k >= dirs.length).map(k => acts[k - dirs.length])
	dirs = keep.filter(k => k < dirs.length).map(k => dirs[k])
	
	// From D3 Graphs website
	res = d3.chord()
		.padAngle(0.03)
		(matrix)

	// Remove old
	svg3.selectAll("g").remove()

	// Adapted from D3 Graphs website
	svg3
		.datum(res)
		.append("g")
		.selectAll("g")
		.data(function(d) {
			return d.groups;
		})
		.enter()
		.append("g")
		.append("path")
		.style("fill", d => {
			if (d.index < dirs.length) {
				return d3.schemeTableau10[d.index % d3.schemeTableau10.length]
			}
			return "#444";
		})
		.style("stroke", d => {
			if (d.index < dirs.length) {
				return d3.schemeTableau10[d.index % d3.schemeTableau10.length]
			}
			return "#444";
		})
		.attr("d", d3.arc()
			.innerRadius((chord_height / 2) - ring_width)
			.outerRadius(chord_height / 2)
		)
		.on("mouseover", mouseoverRing)
		.on("mousemove", mousemoveRing)
		.on("mouseleave", mouseleaveRing)


	// Adapted from D3 Graphs website
	svg3
		.datum(res)
		.append("g")
		.selectAll("path")
		.data(d => d)
		.enter()
		.append("path")
		.attr("d", d3.ribbon().radius(((chord_height / 2) - ring_width)))
		.style("fill", d => d3.schemeTableau10[d.source.index % d3.schemeTableau10.length])
		.style("opacity", 0.1)
		.on("mouseover", mouseoverChord)
		.on("mousemove", mousemoveChord)
		.on("mouseleave", mouseleaveChord)
}

function makeChord(movies) {
	svg3 = d3.select("#graph3").append("svg")
	.attr("width", graph_3_width)
	.attr("height", graph_3_height)
	.append("g")
	.attr("transform",
		"translate(" + graph_3_width / 2 + "," + graph_3_height / 2 + ")");

	updateChordData(movies)
}

 
  // create a tooltip
	var TooltipRing = d3.select("#tooltipRing")
	  .append("div")
	  .style("opacity", 1)
	  .attr("class", "tooltip ring")
  
	// Three function that change the tooltip when user hover / move / leave a cell
	var mouseoverRing = function(d) {
	  TooltipRing
		.style("opacity", 1)
	  d3.select(this)
		.style("opacity", 0.65)
	}
	var mousemoveRing = function(d) {
		name = d.index < dirs.length ? dirs[d.index] : acts[d.index - dirs.length]
	  TooltipRing
		.html(`<p><strong>${name}</strong> has ${d.index < dirs.length ? "directed" : "acted in"} ${d.value} movies (in this diagram)</p>`)
		.style("left", (d3.event.pageX + 20) + "px")
		.style("top", (d3.event.pageY + 20) + "px")
	}
	var mouseleaveRing = function(d) {
	  TooltipRing
		.style("opacity", 0)
	  d3.select(this)
		.style("stroke", "none")
		.style("opacity", 1)
	}
  
  var ChordTooltip = d3.select("#tooltipChord")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip chordt")

// Adapted from D3 Graphs website
var mouseoverChord = function(d) {
  ChordTooltip
	.style("opacity", 1)
  d3.select(this)
	.style("opacity", 0.9)
}
var mousemoveChord = function(d) {
  ChordTooltip
	.html(`<p style="margin-bottom:3px;"><span style="color: white; background-color: ${d3.schemeTableau10[d.source.index % d3.schemeTableau10.length]}; padding: 1px 3px 1px 3px; border-radius: 3px;"><strong>${dirs[d.source.index]}</strong></span> directed <span style="color: white; background-color: #444; padding: 1px 3px 1px 3px; border-radius: 3px;"><strong>${acts[d.target.index - dirs.length]}</strong></span> in <strong>${d.source.value} film${d.source.value == 1 ? '' : 's'}</strong>:</p>
	<ul>
	${
		function(){
		list = actors_by_dir[dirs[d.source.index]][acts[d.target.index - dirs.length]]
		return list.map(l => `<li><em>${l}</em></li>`).join("")
		}()
	}
	</ul>
	`)
	.style("left", (d3.event.pageX + 20) + "px")
	.style("top", (d3.event.pageY + 20) + "px")
}
var mouseleaveChord = function(d) {
  ChordTooltip
	.style("opacity", 0)
  d3.select(this)
	.style("opacity", 0.1)
}