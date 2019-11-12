import React, { PureComponent } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import CloneDeep from 'lodash.clonedeep';
import {
  AreaChart,
  BarChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Label,
  Brush,
  ReferenceLine
} from 'recharts';
import '../reports/Reports.css';

const colors = ['#6FA698', '#458A79', '#0E5342', '#003729'];

function formatNumber(number) {
  return Math.floor(number)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

function currencyFormatter(value) {
  return `$ ${formatNumber(value)}`;
}

class TCharts extends PureComponent {
  renderLegend(data) {
    // TODO -> Rewrite this inefficient thing
    const newItems = [];
    for (const datum of data.payload) {
      let found = false;
      for (const item of newItems) {
        if (item.value === datum.value) {
          found = true;
        }
      }
      if (!found) {
        const newItem = {
          color: datum.color,
          value: datum.value
        };
        newItems.push(newItem);
      }
    }

    const allItems = newItems.map((entry, index) => (
      <li key={`item-${index}`}>
        <span style={{ backgroundColor: entry.color }} />
        {entry.value}
      </li>
    ));
    return (
      <ul className="dashboard__chart-legend">
        {allItems}
      </ul>
    );
  }

  render() {
    const {
      data, type, visType, profile, compEnabled, title
    } = this.props;
    const compToggled = !compEnabled;

    // PIE CHART data massaging
    const style = {
      left: 0,
      width: 150,
      lineHeight: '24px'
    };

    const earnings = [];
    const earningsComp = [];
    const avgHour = [];
    const avgJob = [];
    const avgTon = [];
    const costPerTon = [];
    const costPerTonComp = [];
    const tonsDelivered = [];
    const tonsDeliveredComp = [];
    let colorLoop = 0;
    let totalLabel = 'Cost';

    if (profile === 'Carrier') {
      totalLabel = 'Earnings';
    }

    if (type === 'pie') {
      for (const item of data) {
        const newItem = {
          name: item.name,
          value: item.totEarningsNum,
          fill: colors[colorLoop]
        };
        const newItemComp = {
          name: item.name,
          value: item.totEarningsNumComp,
          fill: colors[colorLoop]
        };
        const newItemAvgHour = {
          name: item.name,
          value: item.avgEarningsHour,
          fill: colors[colorLoop]
        };
        const newItemAvgJob = {
          name: item.name,
          value: item.avgEarningsJob,
          fill: colors[colorLoop]
        };
        const newItemAvgTon = {
          name: item.name,
          value: item.avgEarningsTon,
          fill: colors[colorLoop]
        };
        const costTon = {
          name: item.name,
          value: item.costPerTonMile,
          fill: colors[colorLoop]
        };
        const costTonComp = {
          name: item.name,
          value: item.costPerTonMileComp,
          fill: colors[colorLoop]
        };
        const newTonsDelivered = {
          name: item.name,
          value: item.tonsDelivered,
          fill: colors[colorLoop]
        };
        const newTonsDeliveredComp = {
          name: item.name,
          value: item.tonsDeliveredComp,
          fill: colors[colorLoop]
        };
        colorLoop += 1;
        if (colorLoop === 3) {
          colorLoop = 0;
        }
        earnings.push(newItem);
        earningsComp.push(newItemComp);
        avgHour.push(newItemAvgHour);
        avgJob.push(newItemAvgJob);
        avgTon.push(newItemAvgTon);
        costPerTon.push(costTon);
        costPerTonComp.push(costTonComp);
        tonsDelivered.push(newTonsDelivered);
        tonsDeliveredComp.push(newTonsDeliveredComp);
      }
    }

    // BAR
    if (type === 'bar') {
      if (visType === 'totals') {
        return (
          <ResponsiveContainer height={350} className="dashboard__area">
            <BarChart
              width={400}
              height={250}
              data={data}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="category" dataKey="name">
                <Label
                  value={title}
                  position="bottom"
                  offset={0}
                  content={props => (
                    <text
                        style={{ fontSize: '12px'}}
                        x={17}
                        y={props.viewBox.y + props.viewBox.height - 10}
                        fill="#176A55"
                    >
                      {props.value}
                    </text>
                  )}
                />
              </XAxis>

              <YAxis type="number" tickFormatter={currencyFormatter} />
              <CartesianGrid strokeDasharray="3 3"/>
              <Tooltip formatter={value => `$ ${new Intl.NumberFormat('en').format(value)}`} />
              <CartesianGrid strokeDasharray="3 3"/>
              <Legend />
              <ReferenceLine y={0} stroke="#000"/>
              <Brush dataKey="totEarningsNum" height={30} stroke={colors[0]}/>
              <Bar
                dataKey="totEarningsNum"
                name={`Total ${totalLabel}`}
                fill={colors[0]}
              />
              <Bar
                dataKey="totEarningsNumComp"
                name="Comparison dates"
                fill={colors[1]}
                hide={compToggled}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      }
      if (visType === 'averagesHourAndTon') {
        return (
          <ResponsiveContainer height={350} className="dashboard__area">
            <BarChart
              width={400}
              height={250}
              data={data}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="category" dataKey="name">
                <Label
                  value={title}
                  position="bottom"
                  offset={0}
                  content={props => (
                    <text
                        style={{ fontSize: '12px'}}
                        x={17}
                        y={props.viewBox.y + props.viewBox.height - 10}
                        fill="#176A55"
                    >
                      {props.value}
                    </text>
                  )}
                />
              </XAxis>

              <YAxis type="number" tickFormatter={currencyFormatter}/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Tooltip formatter={value => `$ ${new Intl.NumberFormat('en').format(value)}`} />
              <CartesianGrid strokeDasharray="3 3"/>
              <Legend />
              <ReferenceLine y={0} stroke="#000"/>
              <Brush dataKey="avgEarningsHour" height={30} stroke={colors[0]}/>
              <Bar
                dataKey="avgEarningsHour"
                name={`Average ${totalLabel} per Hour`}
                fill={colors[0]}
              />
              <Bar
                dataKey="avgEarningsTon"
                name={`Average ${totalLabel} per Ton`}
                fill={colors[2]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      }
      if (visType === 'averagesJob') {
        return (
          <ResponsiveContainer height={350} className="dashboard__area">
            <BarChart
              width={400}
              height={250}
              data={data}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="category" dataKey="name">
                <Label
                  value={title}
                  position="bottom"
                  offset={0}
                  content={props => (
                    <text
                        style={{ fontSize: '12px'}}
                        x={17}
                        y={props.viewBox.y + props.viewBox.height - 10}
                        fill="#176A55"
                    >
                      {props.value}
                    </text>
                  )}
                />
              </XAxis>

              <YAxis type="number" tickFormatter={currencyFormatter}/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Tooltip formatter={value => `$ ${new Intl.NumberFormat('en').format(value)}`} />
              <CartesianGrid strokeDasharray="3 3"/>
              <Legend />
              <ReferenceLine y={0} stroke="#000"/>
              <Brush dataKey="avgEarningsJob" height={30} stroke={colors[0]}/>
              <Bar
                dataKey="avgEarningsJob"
                name={`Average ${totalLabel} per Job`}
                fill={colors[1]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      }
      if (visType === 'costTonMile') {
        return (
          <ResponsiveContainer height={350} className="dashboard__area">
            <BarChart
              width={400}
              height={250}
              data={data}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="category" dataKey="name">
                <Label
                  value={title}
                  position="bottom"
                  offset={0}
                  content={props => (
                    <text
                        style={{ fontSize: '12px'}}
                        x={17}
                        y={props.viewBox.y + props.viewBox.height - 10}
                        fill="#176A55"
                    >
                      {props.value}
                    </text>
                  )}
                />
              </XAxis>

              <YAxis type="number">
                <Label
                  value="$"
                  position="top"
                  content={props => (
                    <text
                        style={{ fontSize: '11px'}}
                        x={20}
                        y={10}
                        fill="#176A55"
                    >
                      {props.value}
                    </text>
                  )}
                />
              </YAxis>
              <CartesianGrid strokeDasharray="3 3"/>
              <Tooltip formatter={value => `$ ${new Intl.NumberFormat('en').format(value)}`} />
              <CartesianGrid strokeDasharray="3 3"/>
              <Legend />
              <ReferenceLine y={0} stroke="#000"/>
              <Brush dataKey="costPerTonMile" height={30} stroke={colors[0]}/>
              <Bar dataKey="costPerTonMile" name="Cost per Ton/Mile" fill={colors[0]} />
              <Bar
                dataKey="costPerTonMileComp"
                name="Comparison dates"
                fill={colors[1]}
                hide={compToggled}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      }
      if (visType === 'tonsDelivered') {
        return (
          <ResponsiveContainer height={350} className="dashboard__area">
            <BarChart
              width={400}
              height={250}
              data={data}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="category" dataKey="name">
                <Label
                  value="Tons"
                  position="bottom"
                  offset={0}
                  content={props => (
                    <text
                        style={{ fontSize: '12px'}}
                        x={17}
                        y={props.viewBox.y + props.viewBox.height - 10}
                        fill="#176A55"
                    >
                      {props.value}
                    </text>
                  )}
                />
              </XAxis>

              <YAxis type="number" />
              <CartesianGrid strokeDasharray="3 3"/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Legend />
              <ReferenceLine y={0} stroke="#000"/>
              <Brush dataKey="totEarningsNum" height={30} stroke={colors[0]}/>
              <Bar
                dataKey="tonsDelivered"
                name={`Total ${totalLabel}`}
                fill={colors[0]}
              />
              <Bar
                dataKey="tonsDeliveredComp"
                name="Comparison dates"
                fill={colors[1]}
                hide={compToggled}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      }
    }

    // AREA
    if (type === 'area') {
      if (visType === 'totals') {
        return (
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 20, left: -15, bottom: 20 }}>
              <XAxis dataKey="name" tickLine={false} />
              <YAxis tickLine={false} />
              <Tooltip formatter={value => `$ ${new Intl.NumberFormat('en').format(value)}`} />
              <Legend />
              <CartesianGrid />
              <Brush dataKey="totEarningsNum" height={30} stroke={colors[0]}/>
              <Area
                name={`Total ${totalLabel}`}
                type="monotone"
                dataKey="totEarningsNum"
                fill={colors[0]}
                stroke={colors[0]}
                fillOpacity={0.2}
              />
              <Area
                name="Comparison Dates"
                type="monotone"
                dataKey="totEarningsNumComp"
                fill={colors[1]}
                stroke={colors[1]}
                fillOpacity={0.2}
                hide={compToggled}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      }
      if (visType === 'averagesHourAndTon') {
        return (
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 20, left: -15, bottom: 20 }}>
              <XAxis dataKey="name" tickLine={false} />
              <YAxis tickLine={false} />
              <Tooltip formatter={value => `$ ${new Intl.NumberFormat('en').format(value)}`} />
              <Legend />
              <CartesianGrid />
              <Brush dataKey="avgEarningsHourNum" height={30} stroke={colors[0]}/>
              <Area
                name={`Average ${totalLabel} per Hour`}
                type="monotone"
                dataKey="avgEarningsHourNum"
                fill={colors[0]}
                stroke={colors[0]}
                fillOpacity={0.2}
              />
              <Area
                name={`Average ${totalLabel} per Ton`}
                type="monotone"
                dataKey="avgEarningsTonNum"
                fill={colors[1]}
                stroke={colors[1]}
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      }
      if (visType === 'averagesJob') {
        return (
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 20, left: -15, bottom: 20 }}>
              <XAxis dataKey="name" tickLine={false} />
              <YAxis tickLine={false} />
              <Tooltip formatter={value => `$ ${new Intl.NumberFormat('en').format(value)}`} />
              <Legend />
              <CartesianGrid />
              <Brush dataKey="avgEarningsJobNum" height={30} stroke={colors[0]}/>
              <Area
                name={`Average ${totalLabel} per Job`}
                type="monotone"
                dataKey="avgEarningsJobNum"
                fill={colors[2]}
                stroke={colors[2]}
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      }
      if (visType === 'costTonMile') {
        return (
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 20, left: -15, bottom: 20 }}>
              <XAxis dataKey="name" tickLine={false} />
              <YAxis tickLine={false} />
              <Tooltip formatter={value => `$ ${new Intl.NumberFormat('en').format(value)}`} />
              <Legend />
              <CartesianGrid />
              <Brush dataKey="costPerTonMile" height={30} stroke={colors[0]}/>
              <Area
                name="Cost per Ton/Mile"
                type="monotone"
                dataKey="costPerTonMile"
                fill={colors[0]}
                stroke={colors[0]}
                fillOpacity={0.2}
              />
              <Area
                name="Comparison Dates"
                type="monotone"
                dataKey="costPerTonMileComp"
                fill={colors[1]}
                stroke={colors[1]}
                fillOpacity={0.2}
                hide={compToggled}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      }
      if (visType === 'tonsDelivered') {
        return (
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 20, left: -15, bottom: 20 }}>
              <XAxis dataKey="name" tickLine={false} />
              <YAxis tickLine={false} />
              <Tooltip />
              <Legend />
              <CartesianGrid />
              <Brush dataKey="totEarningsNum" height={30} stroke={colors[0]}/>
              <Area
                name={`Total ${totalLabel}`}
                type="monotone"
                dataKey="tonsDelivered"
                fill={colors[0]}
                stroke={colors[0]}
                fillOpacity={0.2}
              />
              <Area
                name="Comparison Dates"
                type="monotone"
                dataKey="tonsDeliveredComp"
                fill={colors[1]}
                stroke={colors[1]}
                fillOpacity={0.2}
                hide={compToggled}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      }
    }

    // PIE
    if (type === 'pie') {
      if (visType === 'totals') {
        return (
          <ResponsiveContainer>
            <PieChart className="dashboard__chart-pie-container">
              <Tooltip formatter={value => `$ ${new Intl.NumberFormat('en').format(value)}`} />
              <Pie
                data={earnings}
                dataKey="value"
                name={`Total ${totalLabel}`}
                cy={120}
                cx={530}
                innerRadius={70}
                outerRadius={85}
              />
              <Pie
                data={earningsComp}
                dataKey="value"
                name="Comparison Dates"
                cy={120}
                cx={530}
                outerRadius={65}
                hide={compToggled}
              />
              <Legend layout="vertical" verticalAlign="bottom" wrapperStyle={style} content={this.renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        );
      }
      if (visType === 'averagesHourAndTon') {
        return (
          <ResponsiveContainer>
            <PieChart className="dashboard__chart-pie-container">
              <Tooltip formatter={value => `$ ${new Intl.NumberFormat('en').format(value)}`} />
              <Pie
                data={avgTon}
                dataKey="value"
                name="Avg. Ton"
                cy={120}
                cx={530}
                innerRadius={90}
                outerRadius={105}
              />
              <Pie
                data={avgHour}
                dataKey="value"
                name="Avg. Hour"
                cy={120}
                cx={530}
                innerRadius={70}
                outerRadius={85}
              />
              <Legend layout="vertical" verticalAlign="bottom" wrapperStyle={style} content={this.renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        );
      }
      if (visType === 'averagesJob') {
        return (
          <ResponsiveContainer>
            <PieChart className="dashboard__chart-pie-container">
              <Tooltip formatter={value => `$ ${new Intl.NumberFormat('en').format(value)}`} />
              <Pie
                data={avgJob}
                dataKey="value"
                name="Avg. Job"
                cy={120}
                cx={530}
                outerRadius={65}
              />
              <Legend layout="vertical" verticalAlign="bottom" wrapperStyle={style} content={this.renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        );
      }
      if (visType === 'costTonMile') {
        return (
          <ResponsiveContainer>
            <PieChart className="dashboard__chart-pie-container">
              <Tooltip formatter={value => `$ ${new Intl.NumberFormat('en').format(value)}`} />
              <Pie
                data={costPerTon}
                dataKey="value"
                name="Cost per Ton/Mile"
                cy={120}
                cx={530}
                innerRadius={70}
                outerRadius={85}
              />
              <Pie
                data={costPerTonComp}
                dataKey="value"
                name="Comparison Dates"
                cy={120}
                cx={530}
                outerRadius={65}
                hide={compToggled}
              />
              <Legend layout="vertical" verticalAlign="bottom" wrapperStyle={style} content={this.renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        );
      }
      if (visType === 'tonsDelivered') {
        return (
          <ResponsiveContainer>
            <PieChart className="dashboard__chart-pie-container">
              <Tooltip />
              <Pie
                data={tonsDelivered}
                dataKey="value"
                name={`Total ${totalLabel}`}
                cy={120}
                cx={530}
                innerRadius={70}
                outerRadius={85}
              />
              <Pie
                data={tonsDeliveredComp}
                dataKey="value"
                name="Comparison Dates"
                cy={120}
                cx={530}
                outerRadius={65}
                hide={compToggled}
              />
              <Legend layout="vertical" verticalAlign="bottom" wrapperStyle={style} content={this.renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        );
      }
    }

    return false;
  }
}

TCharts.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape()),
  type: PropTypes.string,
  visType: PropTypes.string,
  profile: PropTypes.string,
  compEnabled: PropTypes.bool,
  title: PropTypes.string
};

TCharts.defaultProps = {
  data: null,
  type: null,
  visType: null,
  profile: null,
  compEnabled: null,
  title: null
};

export default TCharts;
