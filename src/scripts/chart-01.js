import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 400 - margin.left - margin.right

const svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec'
]

const monthColor = ['Jul', 'Aug', 'Sep', 'Oct']
// I give you a month
// you give me back a number of radians
const angleScale = d3
  // .scalePoint()
  // .padding(0.5)
  .scaleBand()
  .domain(months)
  .range([0, Math.PI * 2])

const radius = 215

const radiusScale = d3.scaleLinear().range([40, radius])

const arc = d3
  .arc()
  .innerRadius(function(d) {
    return 0
  })
  .outerRadius(function(d) {
    return radiusScale(d.data.pounds)
  })

const labelArc = d3
  .arc()
  .innerRadius(60)
  .outerRadius(60)
  .startAngle(d => angleScale(d))
  .endAngle(d => angleScale(d) + angleScale.bandwidth())

const pie = d3
  .pie()
  .value(1 / 12)
  .sort(null)

const colorScale = d3.scaleLinear().range(['lightblue', 'navy'])

Promise.all([
  d3.csv(require('/data/2017_ME_landings_monthly.csv')),
  d3.csv(require('/data/2017_CAD_landings_Monthly.csv'))
])
  .then(ready)
  .catch(err => {
    console.log('Failed with', err)
  })

function ready([maine, canada]) {
  const poundMax = d3.max(maine.map(d => +d.pounds))
  radiusScale.domain([0, poundMax])
  colorScale.domain([0, poundMax])

  const container = svg
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

  container
    .append('text')
    .attr('class', 'country')
    .attr('x', 0)
    .attr('y', -140)
    .attr('font-size', 8)
    .attr('text-anchor', 'middle')
    .attr('font-weight', 600)

  container
    .selectAll('path')
    .data(pie(maine))
    .enter()
    .append('path')
    .attr('id', 'pie')
    .attr('class', function(d) {
      return d.data.month
    })
    .attr('d', arc)
    .attr('fill', function(d) {
      return colorScale(d.data.pounds)
    })

  container
    .append('circle')
    .attr('fill', '#666')
    .attr('r', 2)
    .attr('class', 'circle')

  container
    .selectAll('.month-label')
    .data(angleScale.domain())
    .enter()
    .append('text')
    .text(d => d)
    .attr('id', 'months')
    // .attr('y', -radius) // set it up at the top of the chart
    .attr('dy', 4.5) // give a little offset to push it higher
    .attr('text-anchor', 'middle')
    .attr('font-size', 14)
    .attr('alignment-baseline', 'middle')
    .attr('transform', function(d) {
      return `translate(${labelArc.centroid(d)})`
    })
    .style('fill', function(d) {
      if (d === 'Jul' || d === 'Oct' || d === 'Sept' || d === 'Aug') {
        return 'white'
      } else {
        return 'black'
      }
    })

  d3.select('#step1').on('stepin', function() {
    const poundMax = d3.max(maine.map(d => +d.pounds))
    radiusScale.domain([0, poundMax])
    colorScale.domain([0, poundMax])

    console.log('step 1')
    container
      .selectAll('path')
      .data(pie(maine))
      .transition()
      .duration(1000)
      .attr('d', arc)
      .attr('fill', function(d) {
        return colorScale(d.data.pounds)
      })

    container.selectAll('#months').style('fill', function(d) {
      if (d === 'Jul' || d === 'Oct' || d === 'Sept' || d === 'Aug') {
        return 'white'
      } else {
        return 'black'
      }
    })
  })

  d3.select('#step2').on('stepin', function() {
    const poundMax = d3.max(canada.map(d => +d.pounds))
    radiusScale.domain([0, poundMax])
    colorScale.domain([0, poundMax])

    console.log('step 2')

    container
      .selectAll('#pie')
      .data(pie(canada))
      .transition()
      .duration(1000)
      .attr('class', function(d) {
        return d.data.month
      })
      .attr('d', arc)
      .attr('fill', function(d) {
        return colorScale(d.data.pounds)
      })

    container.selectAll('#months').style('fill', function(d) {
      if (d === 'Dec' || d === 'Jun' || d === 'May') {
        return 'white'
      } else {
        return 'black'
      }
    })
  })

  function render() {
    const svgContainer = svg.node().closest('div')
    const svgWidth = svgContainer.offsetWidth
    const svgHeight = svgContainer.offsetHeight
    const actualSvg = d3.select(svg.node().closest('svg'))
    actualSvg.attr('width', svgWidth).attr('height', svgHeight)
    const newWidth = svgWidth - margin.left - margin.right

    // Update our scale
    radiusScale.range([40, radius])

    // Update things you draw
    svg
      .selectAll('#pie')
      .transition()
      .attr('d', arc)
    // svg.selectAll('.band').attr('r', d => radiusScale(d))
    // svg.selectAll('.band-text').attr('y', d => -radiusScale(d))
    // svg.selectAll('.decade-labels').attr('y', -newRadius() / 2)
  }
  window.addEventListener('resize', render)
  render()
}
