// D3 Visualization Setup
var width = document.getElementById('map').offsetWidth;
var height = document.getElementById('map').offsetHeight;

var svg = d3.select('#map').append('svg')
  .attr('width', width)
  .attr('height', height);

var projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2])
  .scale([width]);

var path = d3.geoPath().projection(projection);

// D3 Visualization Execution
d3.json('/data/states.json', function(error, map) {
  if (error) throw error;

  var country = svg.append('g').classed('continent', true);

  country.selectAll()
    .data(map.features)
    .enter()
    .append('path')
    .attr('d', path)
    .style('stroke', '#fff')
    .style('stroke-width', '1')
    .style('fill', '#f2f2f2')
    .attr('id', function (d) {
      return d.properties.NAME;
    });
});

// Load Districts into Visualization
var loadDistricts = function(config) {

  // State Selector for Visualization
  var state = config.state;
  var congress = config.congress;

  console.log(congress + 'th Congress, District Map of ' + state);

  d3.json('/data/districts/' + congress + '.json', function(error, data) {
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
      .style('stroke-width', '1')
      .style('fill', 'rgba(0, 0, 0, 0)');
  });

  d3.json('/data/counties.json', function(error, data) {
    if (error) throw error;

    var counties = svg.append('g').classed('counties', true);

    var length = data.features.length;
    var stateCounties = [];

    for (var i = 0; i < length; i++) {
      if (data.features[i].properties.STATE == state) {
        stateCounties.push(data.features[i]);
      }
    }

    counties.selectAll('path')
      .data(stateCounties)
      .enter()
      .append('path')
      .attr('d', path)
      .style('stroke', '#c83650')
      .style('stroke-width', '1')
      .style('fill', 'rgba(0, 0, 0, 0)');
  });

  //Download SVG
  // $('#map').click(function() {
  //   var svgData = $('svg')[0].outerHTML;
  //   var svgBlob = new Blob([svgData], {
  //     type: 'image/svg+xml;charset=utf-8'
  //   });
  //   var svgUrl = URL.createObjectURL(svgBlob);
  //   var downloadLink = document.createElement('a');
  //   downloadLink.href = svgUrl;
  //   downloadLink.download = state + '_' + congress + '.svg';
  //   document.body.appendChild(downloadLink);
  //   downloadLink.click();
  //   document.body.removeChild(downloadLink);
  // });
}
