'use strict';
import React, { PropTypes as T } from 'react';
import { Link, hashHistory } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Line as LineChart, Bar as BarChart, Doughnut as DoughnutChart } from 'react-chartjs-2';

import { fetchConcelho, fetchMapData } from '../actions';
import makeTooltip from '../utils/tooltip';
import { round, percent } from '../utils/utils';

import Map from '../components/map';

var Concelho = React.createClass({
  propTypes: {
    params: T.object,
    concelho: T.object,
    nut: T.object,
    national: T.object,
    mapData: T.object,
    _fetchConcelho: T.func,
    _fetchMapData: T.func
  },

  onMapClick: function (data) {
    // Find the right nut.
    let slug = this.props.nut.data.concelhos.find(o => o.id === data.id).slug;
    hashHistory.push(`/nuts/${this.props.params.nut}/concelhos/${slug}`);
  },

  popoverContent: function (data) {
    // Find the right concelho.
    let name = this.props.nut.data.concelhos.find(o => o.id === data.id).name;
    return (
      <div>
        <p className='map-tooltip'>{name}</p>
        <span className='triangle'></span>
      </div>
    );
  },

  overlayInfoContent: function () {
    return (
      <div className='map-aa-info'>
        <ul className='map-aa-list inline-list'>
          <li><a href={`#/nuts/${this.props.nut.data.slug}`} title={`Ir para ${this.props.nut.data.name}`}>{'<'}</a></li>
          <li>{this.props.concelho.data.name}</li>
        </ul>
      </div>
    );
  },

  componentDidMount: function () {
    this.props._fetchConcelho(this.props.params.nut, this.props.params.concelho);

    if (!this.props.mapData.fetched) {
      this.props._fetchMapData();
    }
  },

  componentWillReceiveProps: function (nextProps) {
    if (this.props.params.concelho !== nextProps.params.concelho ||
    this.props.params.nut !== nextProps.params.nut) {
      return this.props._fetchConcelho(nextProps.params.nut, nextProps.params.concelho);
    }
  },

  renderLicencas1000Chart: function (lic1000Data) {
    let l = lic1000Data.labels.length - 1;

    let tooltipFn = makeTooltip(entryIndex => {
      let year = lic1000Data.labels[entryIndex];
      return (
        <ul>
          <li><span className='tooltip-title'>{year}:</span></li>
          {lic1000Data.datasets.map(o => <li key={o.label}><span className='tooltip-label'>{o.label}:</span> <span className='tooltip-number'>{round(o.data[entryIndex])}</span></li>)}
          <span className='triangle'></span>
        </ul>
      );
    });

    let labels = lic1000Data.labels.map((o, i) => i === 0 || i === l ? o : '');

    let chartData = {
      labels: labels,
      datasets: lic1000Data.datasets.map(o => ({
        data: o.data,
        backgroundColor: o.backgroundColor,
        borderColor: o.color,
        pointBorderWidth: 0,
        pointBackgroundColor: o.color,
        pointRadius: 2
      }))
    };

    let chartOptions = {
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false
          },
          ticks: {
            maxRotation: 0
          }
        }],
        yAxes: [{
          display: false,
          ticks: {
            min: 0
          }
        }]
      },
      tooltips: {
        enabled: false,
        mode: 'index',
        position: 'nearest',
        custom: tooltipFn
      }
    };

    return <LineChart data={chartData} options={chartOptions} height={220}/>;
  },

  renderTimelineChart: function () {
    let nationalTimeline = this.props.concelho.data.data.licencasTimeline;
    let l = nationalTimeline.length - 1;

    let tooltipFn = makeTooltip(entryIndex => {
      let year = nationalTimeline[entryIndex];
      return (
        <ul>
          <li><span className='tooltip-title'>Contingentes:</span></li>
          <li><span className='tooltip-label'>Geral:</span> <span className='tooltip-number'>{year['lic-geral'].toLocaleString()}</span></li>
          <li><span className='tooltip-label'>Mob. Reduzida:</span> <span className='tooltip-number'>{year['lic-mob-reduzida'].toLocaleString()}</span></li>
          <li><span className='tooltip-label'>Total Contingentes:</span><span className='tooltip-number'>{(year['lic-geral'] + year['lic-mob-reduzida']).toLocaleString()}</span></li>
          <span className='triangle'></span>
        </ul>
      );
    });

    let labels = nationalTimeline.map((o, i) => i === 0 || i === l ? o.year : '');

    let chartData = {
      labels: labels,
      datasets: [{
        data: nationalTimeline.map(o => o['lic-geral'] + o['lic-mob-reduzida']),
        backgroundColor: '#FFCC45',
        borderColor: '#FB8F2C',
        pointBorderWidth: 0,
        pointBackgroundColor: '#FB8F2C',
        pointRadius: 3
      }]
    };

    let chartOptions = {
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false
          },
          ticks: {
            maxRotation: 0
          }
        }],
        yAxes: [{
          display: false,
          ticks: {
            min: 0
          }
        }]
      },
      tooltips: {
        enabled: false,
        mode: 'index',
        position: 'nearest',
        custom: tooltipFn
      }
    };

    return <LineChart data={chartData} options={chartOptions} height={300}/>;
  },

  renderLic1000HabChart: function () {
    let chartLic1000Had = {
      labels: this.props.concelho.data.data.licencasTimeline.map(y => y.year),
      datasets: _.sortBy([
        {
          data: this.props.national.data.licencasTimeline.map(o => o['lic1000']),
          label: 'Portugal',
          color: '#1f8d8e',
          backgroundColor: '#f5f5f5'
        },
        {
          data: this.props.nut.data.data.licencasTimeline.map(o => o['lic1000']),
          label: this.props.nut.data.name,
          color: '#00ced1',
          backgroundColor: '#f5f5f5'
        },
        {
          data: this.props.concelho.data.data.licencasTimeline.map(o => o['lic1000']),
          label: this.props.concelho.data.name,
          color: '#256465',
          backgroundColor: '#f5f5f5'
        }
      ], d => d.data[0])
    };
    return this.renderLicencas1000Chart(chartLic1000Had);
  },

  renderLic1000DormidasChart: function () {
    let availableYears = [];
    this.props.concelho.data.data.dormidas.forEach(o => {
      if (o.value !== null) availableYears.push(o.year);
    });

    let chartLic1000Dormidas = {
      labels: availableYears,
      datasets: _.sortBy([
        {
          data: this.props.national.data.dormidas.filter(o => _.includes(availableYears, o.year)).map(o => o.lic1000),
          label: 'Portugal',
          color: '#1f8d8e',
          backgroundColor: '#f5f5f5'
        },
        {
          data: this.props.concelho.data.data.dormidas.filter(o => _.includes(availableYears, o.year)).map(o => o.lic1000),
          label: this.props.concelho.data.name,
          color: '#256465',
          backgroundColor: '#f5f5f5'
        }
      ], d => d.data[0])
    };
    return this.renderLicencas1000Chart(chartLic1000Dormidas);
  },

  renderMap: function () {
    if (!this.props.mapData.fetched) return null;

    return (
      <Map
        className='map-svg'
        geometries={this.props.mapData.data}
        nut={this.props.nut.data.id}
        concelho={this.props.concelho.data.id}
        onClick={this.onMapClick}
        popoverContent={this.popoverContent}
        overlayInfoContent={this.overlayInfoContent}
      />
    );
  },

  render: function () {
    let { fetched, fetching, error, data: concelho } = this.props.concelho;
    let nut = this.props.nut.data;

    if (!fetched && !fetching) {
      return null;
    }

    if (fetching) {
      return <p>Loading</p>;
    }

    if (error) {
      return <div>Error: {error}</div>;
    }

    console.log('concelho', concelho);

    let {licencas2016, max2016, dormidas, licencasTimeline} = concelho.data;
    dormidas = _.last(dormidas).lic1000;
    dormidas = dormidas ? round(dormidas, 1) : 'N/A';

    let licencas1000Hab = _.last(licencasTimeline).lic1000;
    licencas1000Hab = round(licencas1000Hab, 1);

    return (
      <div id="page-content">

         <div className='content-wrapper vertical-center'>

          <div className='map-wrapper'>
            {this.renderMap()}
          </div>

          <div className='section-wrapper'>
            <section className='section-container'>
              <header className='section-header'>
                <h3 className='section-category'><Link to='/' title='Ver Portugal'>Portugal</Link> - <Link to={`/nuts/${nut.slug}`} title={`Ver ${nut.name}`}>{nut.name}</Link></h3>
                <h1>{concelho.name}</h1>
                <p className="lead">A prestação de serviços de táxi implica que o prestador de serviço detenha uma licença por cada veículo utilizado. As câmaras municipais atribuem estas licenças e definem o número máximo de veículos que poderá prestar serviços no seu concelho — contingente de táxis.</p>
              </header>
              <div className='section-content'>
                <div className='section-stats'>
                  <ul>
                    <li>
                      <span className='stat-number'>{licencas2016.toLocaleString()}</span>
                      <span className='stat-description'>Total de táxis licenciados <span className='block'>em agosto de 2016.</span></span>
                    </li>
                    <li>
                      <span className='stat-number'>{max2016.toLocaleString()}</span>
                      <span className='stat-description'>Total dos contingentes <span className='block'>em agosto de 2016.</span></span>
                    </li>
                    <li>
                      <span className='stat-number'>{(max2016 - licencas2016).toLocaleString()}</span>
                      <span className='stat-description'>Total de vagas existentes <span className='block'>em agosto de 2016.</span></span>
                    </li>
                  </ul>
                </div>

                <div className='graph-container'>
                  <div className='graph'>
                    <h6 className='legend-title'>Evolução das licenças 2006 a 2016</h6>
                    {this.renderTimelineChart()}
                  </div>
                </div>

                <div className='section-stats'>
                  <ul className='two-columns'>
                    <li>
                      <span className='stat-number'>{licencas1000Hab}</span>
                      <span className='stat-description'>Licenças activas por 1000 residentes</span>
                    </li>
                    <li>
                      <span className='stat-number'>{dormidas}</span>
                      <span className='stat-description'>Licenças activas por 1000 dormidas</span>
                    </li>
                  </ul>
                </div>

                <div className='two-columns'>
                  <div className='graph'>
                    <h6 className='legend-title'>Evolução das licenças por 1000 residentes</h6>
                    {this.renderLic1000HabChart()}
                  </div>
                  <div className='graph'>
                    <h6 className='legend-title'>Evolução das licenças por 1000 dormidas</h6>
                    {this.renderLic1000DormidasChart()}
                  </div>
                </div>

                <p>Linha da section ambito</p>

                <div className='section-stats'>
                  <ul>
                    <li>
                      <span className='stat-number'>{/*newLicencas.toLocaleString()*/}10</span>
                      <span className='stat-description'>Aumento do número de <span className='block'>licenças entre 2006 e 2016.</span></span>
                    </li>
                    <li>
                      <span className='stat-number'>{/*round(increaseLicencas, 0).toLocaleString()*/}1%</span>
                      <span className='stat-description'>Crescimento dos táxis <span className='block'>licenciados desde 2006.</span></span>
                    </li>
                    <li>
                      <span className='stat-number'>2</span>
                      <span className='stat-description'>Licenças mobilidade reduzida</span>
                    </li>
                  </ul>
                </div>

              </div>
            </section>
          </div>
        </div>

      </div>
    );
  }
});

// /////////////////////////////////////////////////////////////////// //
// Connect functions

function selector (state) {
  return {
    concelho: state.concelho,
    nut: state.nut,
    national: state.national,
    mapData: state.mapData
  };
}

function dispatcher (dispatch) {
  return {
    _fetchConcelho: (...args) => dispatch(fetchConcelho(...args)),
    _fetchMapData: (...args) => dispatch(fetchMapData(...args))
  };
}

module.exports = connect(selector, dispatcher)(Concelho);
