// State Selector for Visualization
var state = 'North Carolina';
var congress = 93;

// D3 Visualization Setup
var width = document.getElementById('map').offsetWidth;
var height = document.getElementById('map').offsetHeight;

var svg = d3.select('#map').append('svg')
  .attr('width', width)
  .attr('height', height);

var projection = d3.geo.albersUsa()
  .translate([width / 2, height / 2])
  .scale([width]);

var path = d3.geo.path().projection(projection);

// D3 Visualization Execution
d3.json('/data/USA.json', function(error, map) {
  if (error) throw error;

  var country = svg.append('g').classed('continent', true);

  country.selectAll()
    .data(map.features)
    .enter()
    .append('path')
    .attr('d', path)
    .style('stroke', '#000')
    .style('stroke-width', '0')
    .style('fill', '#f2f2f2');

  if (congress < 114) {

    console.log(congress + 'th Congress, District Map of ' + state)

    d3.json('/data/' + state + '/' + state + '_' + congress + '.geojson', function(error, data) {
      if (error) throw error;

      var districts = svg.append('g').classed('districts', true);

      districts.selectAll('path')
        .data(data.features)
        .enter()
        .append('path')
        .attr('d', path)
        .style('stroke', '#36c87e')
        .style('stroke-width', '0.25')
        .style('fill', '#9dffcd');
    });

  } else {

    console.log(congress + 'th Congress, District Map of ' + state)

    d3.json('/data/CurrentDistricts.json', function(error, data) {
      if (error) throw error;

      var districts = svg.append('g').classed('districts', true);

      var length = data.features.length;
      var stateDistricts = [];

      for (var i = 0; i < length; i++) {
        if (data.features[i].properties.STATENAME == state) {
          stateDistricts.push(data.features[i]);
        }
      }

      districts.selectAll('path')
        .data(stateDistricts)
        // .data(data.features)
        .enter()
        .append('path')
        .attr('d', path)
        .style('stroke', '#36c87e')
        .style('stroke-width', '0.25')
        .style('fill', '#9dffcd');
    });

  }
});

//Download SVG
$('#map').click(function() {
  var svgData = $('svg')[0].outerHTML;
  var svgBlob = new Blob([svgData], {
    type: 'image/svg+xml;charset=utf-8'
  });
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement('a');
  downloadLink.href = svgUrl;
  downloadLink.download = state + '_' + congress +'.svg';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
})
