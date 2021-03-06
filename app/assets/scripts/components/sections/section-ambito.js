'use strict';
import React, { PropTypes as T } from 'react';
import { Link } from 'react-router';
import { StickyContainer, Sticky } from 'react-sticky';
import { Line as LineChart } from 'react-chartjs-2';
import _ from 'lodash';

import makeTooltip from '../../utils/tooltip';
import { percent, formatPT } from '../../utils/utils';
import { endYear } from '../../config';

import Map from '../map';

var SectionDistribuicao = React.createClass({
  propTypes: {
    adminLevel: T.string,
    adminName: T.string,
    adminId: T.oneOfType([T.string, T.number]),
    adminList: T.array,
    licencasEndY: T.number,
    populacaoNational: T.number,
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

  renderTrendLineChart: function (data, id) {
    let tooltipFn = makeTooltip(entryIndex => {
      let year = data[entryIndex];
      return (
        <ul className='x-small'>
          <li><span className='tooltip-label'>{year.year}</span> <span className='tooltip-number'>{formatPT(year.value)}</span></li>
          <span className='triangle'></span>
        </ul>
      );
    });

    let chartData = {
      labels: data.map(o => o.year),
      datasets: [{
        data: data.map(o => o.value),
        lineTension: 0,
        pointRadius: 2,
        pointBackgroundColor: '#0eaeaf',
        borderColor: '#256465',
        backgroundColor: '#fff',
        borderWidth: 2
      }]
    };

    let chartOptions = {
      responsive: false,
      layout: {
        padding: {
          left: 5,
          top: 3,
          right: 5
        }
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          display: false
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

    return (
      <LineChart data={chartData} options={chartOptions} height={40} ref={this.addChartRef(`chart-trend-${id}`)} />
    );
  },

  renderTableRow: function (adminArea) {
    let totNatEndY = this.props.licencasEndY;

    let licencasEndY = adminArea.data.licencasEndY;
    let availableLicencas = adminArea.data.maxEndY - licencasEndY;
    let percentNational = percent(adminArea.data.licencasEndY, totNatEndY, 0);
    let pop = _.last(adminArea.data['pop-residente']).value;
    let percentPop = percent(pop, this.props.populacaoNational, 0);

    return (
      <li key={adminArea.id}>
        <span className='table-cell table-region'><Link to={`/nuts/${_.kebabCase(adminArea.name)}`} title={`Ver página de ${adminArea.name}`}>{adminArea.name}</Link></span>
        <div className='table-cell table-graph'>{this.renderTrendLineChart(adminArea.data['lic-geral'], adminArea.id)}</div>
        <span className='table-cell table-national'>{formatPT(percentNational)}%</span>
        <span className='table-cell table-residents'>{formatPT(percentPop)}%</span>
        <span className='table-cell table-available'>{formatPT(availableLicencas)}</span>
      </li>
    );
  },

  renderTable: function () {
    let adminList = this.props.adminList;

    return (
      <StickyContainer>
        <ul className='table-distribution'>
          <li className='table-header'>
            <Sticky topOffset={-56}>
              <span className='table-cell table-region'>REGIÃO <span className='block'>(NUTS III)</span></span>
              <span className='table-cell table-graph'>Evolução do <span className='block'>Total de Licenças</span></span>
              <span className='table-cell table-national'>% do Total de <span className='block'>Licenças em Portugal</span></span>
              <span className='table-cell table-residents'>% do Total de Pop. <span className='block'>Residente em Portugal</span></span>
              <span className='table-cell table-available'>Vagas Disponíveis <span className='block'>(Dezembro {endYear})</span></span>
            </Sticky>
          </li>
          {adminList.map(this.renderTableRow)}
        </ul>
      </StickyContainer>
    );
  },

  renderMap: function () {
    if (!this.props.mapGeometries.fetched) return null;

    const getColor = (v) => {
      if (v === 0) return '#eaeaea';
      if (v <= 10) return '#FFCC45';
      if (v <= 50) return '#FDB13A';
      if (v <= 100) return '#FB8F2C';
      return '#F8781F';
    };

    let municipiosVagas = this.props.municipios.map(m => {
      let lic = _.last(m.data['lic-geral']).value + _.last(m.data['lic-mob-reduzida']).value;
      let max = _.last(m.data['max-lic-geral']).value + _.last(m.data['max-lic-mob-reduzida']).value;
      let vagas = max - lic;

      return {
        id: m.id,
        color: getColor(vagas)
      };
    });

    return (
      <div>

        <Map
          className='map-svg'
          geometries={this.props.mapGeometries.data}
          data={municipiosVagas}
          nut={this.props.adminId}
          onClick={this.props.onMapClick.bind(null, 'distribuicao')}
          popoverContent={this.props.popoverContent}
          overlayInfoContent={this.props.overlayInfoContent.bind(null, 'distribuicao')}
        />
        <div className='map-legend'>
          <h6 className='legend-title'>Vagas por Município:</h6>
          <ul className='color-legend inline'>
            <li><span style={{ backgroundColor: getColor(10) }}></span>&lt; 10</li>
            <li><span style={{ backgroundColor: getColor(50) }}></span>11 a 50</li>
            <li><span style={{ backgroundColor: getColor(51) }}></span>50 a 100</li>
            <li><span style={{ backgroundColor: getColor(101) }}></span>&gt; 100</li>
            <li><span style={{ backgroundColor: getColor(0) }}></span>Sem vagas</li>
          </ul>
        </div>
      </div>
    );
  },

  renderMap2: function () {
    if (!this.props.mapGeometries.fetched) return null;

    const getColor = (v) => {
      if (v === 'more-pop') return '#FB8F2C';
      if (v === 'more-lic') return '#FDB13A';
      return '#FFCC45';
    };

    const percentLicOverPop = this.props.municipios.map(m => {
      const lic = _.last(m.data['lic-geral']).value + _.last(m.data['lic-mob-reduzida']).value;
      const percentNational = percent(lic, this.props.licencasEndY, 0);
      const pop = _.last(m.data['pop-residente']).value;
      const percentPop = percent(pop, this.props.populacaoNational, 0);

      let color = getColor('equal');
      // More relative licenses than population.
      if (percentNational > percentPop) {
        color = getColor('more-lic');
      // More relative population than licenses.
      } else if (percentNational < percentPop) {
        color = getColor('more-pop');
      }

      return {
        id: m.id,
        color: color
      };
    });

    return (
      <div>
        <Map
          className='map-svg'
          geometries={this.props.mapGeometries.data}
          data={percentLicOverPop}
          nut={this.props.adminId}
          onClick={this.props.onMapClick}
          popoverContent={this.props.popoverContent}
        />
        <div className='map-legend'>
          <h6 className='legend-title'>Percentagem de População vs Percentagem de Licenças:</h6>
          <ul className='color-legend inline'>
            <li><span style={{ backgroundColor: getColor('more-pop') }}></span>&gt; População</li>
            <li><span style={{ backgroundColor: getColor('more-lic') }}></span>&gt; Licenças</li>
            <li><span style={{ backgroundColor: getColor('equal') }}></span>População = Licenças </li>
          </ul>
        </div>
      </div>
    );
  },

  render: function () {
    return (
      <div id='distribuicao' className='content-wrapper vertical-center'>
        <div className='center'>
          <div className='section-wrapper'>
            <section className='section-container'>
              <header className='section-header'>
                <h3 className='section-category'>
                  {this.props.adminLevel === 'nut' ? <Link to='/#distribuicao' title='Ver Portugal'>Portugal</Link> : null}
                  {this.props.adminLevel === 'nut' ? ' › ' : null}
                  {this.props.adminName}
                </h3>
                <h1>Detalhe Geográfico</h1>
                <p className='lead'>Não obstante as licenças municipais terem âmbito concelhio, apresenta-se a sua distribuição por região (NUTS III).</p>
              </header>
              <div className='section-content'>
                {this.renderTable()}
              </div>
              <footer className='section-footer'>
                <p><strong>Notas:</strong> Acrónimo de “Nomenclatura das Unidades Territoriais para Fins Estatísticos”. Constitui um sistema hierárquico de divisão do território em regiões, dividindo-se em 3 níveis (NUTS I, NUTS II, NUTS III), definidos tendo por base critérios populacionais, administrativos e geográficos. Atualmente, os 308 municípios nacionais estão agrupados em 25 NUTS III.</p>
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

module.exports = SectionDistribuicao;
