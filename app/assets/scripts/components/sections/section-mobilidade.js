'use strict';
import React, { PropTypes as T } from 'react';
import { Link } from 'react-router';
import { Pie as PieChart, Line as LineChart } from 'react-chartjs-2';
import _ from 'lodash';

import makeTooltip from '../../utils/tooltip';
import { percent, formatPT } from '../../utils/utils';
import { startYear } from '../../config';

import Map from '../map';

var SectionMobilidade = React.createClass({
  propTypes: {
    adminLevel: T.string,
    adminName: T.string,
    adminId: T.oneOfType([T.string, T.number]),
    totalMunicipiosMobReduzida: T.number,
    totalMunicipios: T.number,
    licencasEndY: T.number,
    licencasStartY: T.number,
    licencasMobReduzidaEndY: T.number,
    licencasMobReduzidaStartY: T.number,
    licencasTimeline: T.array,
    mapGeometries: T.object,
    municipios: T.array,
    onMapClick: T.func,
    popoverContent: T.func,
    overlayInfoContent: T.func
  },

  chartsRef: [],

  onWindowResize: function () {
    this.chartsRef.map(ref => {
      this.refs[ref].chart_instance.resize();
    });
  },

  addChartRef: function (ref) {
    if (this.chartsRef.indexOf(ref) === -1) {
      this.chartsRef = this.chartsRef.concat([ref]);
    }
    return ref;
  },

  componentDidMount: function () {
    this.onWindowResize = _.debounce(this.onWindowResize, 200);
    window.addEventListener('resize', this.onWindowResize);
    this.onWindowResize();
  },

  componentWillUnmount: function () {
    this.chartsRef = [];
    window.removeEventListener('resize', this.onWindowResize);
  },

  renderLicencasChart: function () {
    let licencasEndY = this.props.licencasEndY;
    let licencasMobReduzidaEndY = this.props.licencasMobReduzidaEndY;
    let licencasEndYGeral = licencasEndY - licencasMobReduzidaEndY;

    let data = [
      {
        label: 'Geral',
        value: licencasEndYGeral,
        percent: percent(licencasEndYGeral, licencasEndY, 1),
        backgroundColor: '#00ced1'
      },
      {
        label: 'CMR',
        value: licencasMobReduzidaEndY,
        percent: percent(licencasMobReduzidaEndY, licencasEndY, 1),
        backgroundColor: '#256465'
      }
    ];

    let tooltipFn = makeTooltip(entryIndex => {
      let datum = data[entryIndex];
      return (
        <ul className='small'>
          <li><span className='tooltip-label'>{formatPT(datum.label)}:</span><span className='tooltip-number'>{formatPT(datum.percent)}%</span></li>
          <span className='triangle'></span>
        </ul>
      );
    });

    let chartData = {
      labels: _.map(data, 'label'),
      datasets: [
        {
          data: _.map(data, 'value'),
          backgroundColor: _.map(data, 'backgroundColor'),
          borderWidth: 0
        }
      ]
    };

    let chartOptions = {
      responsive: false,
      legend: {
        display: false
      },
      tooltips: {
        enabled: false,
        mode: 'index',
        position: 'nearest',
        custom: tooltipFn
      }
    };

    return <PieChart data={chartData} options={chartOptions} height={200} ref={this.addChartRef('chart-lic')} />;
  },

  renderTimelineChart: function () {
    let timeline = this.props.licencasTimeline;
    let l = timeline.length - 1;

    let tooltipFn = makeTooltip(entryIndex => {
      let year = timeline[entryIndex];
      return (
        <ul>
          <li><span className='tooltip-label'>{year.year}</span> <span className='tooltip-number'>{formatPT(year['lic-mob-reduzida'])}</span></li>
          <span className='triangle'></span>
        </ul>
      );
    });

    let labels = timeline.map((o, i) => i === 0 || i === l ? o.year : '');

    let chartData = {
      labels: labels,
      datasets: [{
        data: timeline.map(o => o['lic-mob-reduzida']),
        backgroundColor: '#eaeaea',
        borderColor: '#00CED1',
        pointBorderWidth: 0,
        pointBackgroundColor: '#00CED1',
        pointRadius: 3
      }]
    };

    let chartOptions = {
      responsive: false,
      layout: {
        padding: {
          top: 10
        }
      },
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
          gridLines: {
            display: false
          },
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

    return <LineChart data={chartData} options={chartOptions} height={200} ref={this.addChartRef('chart-timeline')} />;
  },

  renderMap: function () {
    if (!this.props.mapGeometries.fetched) return null;

    let mobRedMunicipios = this.props.municipios.map(m => {
      let mobred = _.last(m.data['lic-mob-reduzida']).value > 0;

      return {
        id: m.id,
        color: mobred ? '#FFCC45' : '#f2f2f2'
      };
    });

    return (
      <div>
        <Map
          className='map-svg'
          geometries={this.props.mapGeometries.data}
          data={mobRedMunicipios}
          nut={this.props.adminId}
          onClick={this.props.onMapClick.bind(null, 'mobilidade')}
          popoverContent={this.props.popoverContent}
          overlayInfoContent={this.props.overlayInfoContent.bind(null, 'mobilidade')}
        />

        <div className='map-legend'>
          <h6 className='legend-title'>Municípios com CMR:</h6>
          <ul className='color-legend inline'>
            <li><span style={{ backgroundColor: '#FFCC45' }}></span>Com CMR</li>
            <li><span style={{ backgroundColor: '#f5f5f5' }}></span>Sem CMR</li>
          </ul>
        </div>
      </div>
    );
  },

  render: function () {
    let {
      totalMunicipiosMobReduzida,
      totalMunicipios,
      licencasEndY,
      licencasStartY,
      licencasMobReduzidaEndY,
      licencasMobReduzidaStartY
    } = this.props;

    let percentMobRed = percent(totalMunicipiosMobReduzida, totalMunicipios, 0);
    let newLicencas = licencasEndY - licencasStartY;
    let newMobReduzida = licencasMobReduzidaEndY - licencasMobReduzidaStartY;
    let percentNewMobRed = percent(newMobReduzida, newLicencas, 0);

    return (
      <div id='mobilidade' className='content-wrapper vertical-center'>
        <div className='center'>
          <div className='section-wrapper'>
            <section className='section-container'>
              <header className='section-header'>
                <h3 className='section-category'>
                  {this.props.adminLevel === 'nut' ? <Link to='/#mobilidade' title='Ver Portugal'>Portugal</Link> : null}
                  {this.props.adminLevel === 'nut' ? ' › ' : null}
                  {this.props.adminName}
                </h3>
                <h1>Mobilidade Reduzida</h1>
                <p className='lead'>A legislação prevê a possibilidade de criar contingentes de táxis para o transporte de pessoas com mobilidade reduzida sempre que a necessidade deste tipo de veículos não possa ser assegurada pela adaptação dos táxis existentes no concelho.</p>
              </header>

              {licencasMobReduzidaEndY ? (
                <div className='section-content'>
                  <div className='section-stats'>
                    <ul>
                      <li>
                        <span className='stat-number'>{formatPT(percentMobRed)}%</span>
                        <span className='stat-description'>Dos municípios ({totalMunicipiosMobReduzida}) emitiram licenças em contingentes de mobilidade reduzida (CMR).</span>
                      </li>
                      <li>
                        <span className='stat-number'>{formatPT(newMobReduzida)}</span>
                        <span className='stat-description'>Novas licenças emitidas <span className='block'>em CMR desde {startYear}.</span></span>
                      </li>
                      {this.props.adminLevel === 'national' ? (
                        <li>
                          <span className='stat-number'>{formatPT(percentNewMobRed)}%</span>
                          <span className='stat-description'>Do aumento no total de licenças resulta do crescimento de licenças em CMR.</span>
                        </li>
                      ) : null }
                    </ul>
                  </div>

                  <div className='graph'>
                    <h6 className='legend-title'>Licenças por tipo de contingente (%):</h6>
                    {this.renderLicencasChart()}
                  </div>
                  <div className='graph'>
                    <h6 className='legend-title'>Evolução do número de licenças em CMR:</h6>
                    {this.renderTimelineChart()}
                  </div>

                </div>
              ) : (
                <div className='section-content'>
                  <p className='no-data'>Os municípios integrados na região {this.props.adminName} não definiram contingentes especiais para pessoas com mobilidade reduzida.</p>
                </div>
              )}

              <footer className='section-footer'>
                <p><strong>Nota:</strong> O número de táxis adaptados para o transporte de pessoas com mobilidade reduzida será superior ao apresentado. Estes veículos adaptados podem estar licenciados nos contingentes gerais. A AMT pretende aprofundar o conhecimento sobre esta matéria.</p>
              </footer>
            </section>
          </div>
          <div className='map-wrapper'>
            {this.renderMap()}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = SectionMobilidade;
