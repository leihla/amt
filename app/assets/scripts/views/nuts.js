'use strict';
import React, { PropTypes as T } from 'react';
import { connect } from 'react-redux';
import { Link, hashHistory } from 'react-router';
import c from 'classnames';
import _ from 'lodash';

import { fetchNut, fetchMapData } from '../actions';
import { startYear, endYear } from '../config';

import SectionLicencas from '../components/sections/section-licencas';
import SectionIndicadores from '../components/sections/section-indicadores';
import SectionMobilidade from '../components/sections/section-mobilidade';
import SectionEstacionamento from '../components/sections/section-estacionamento';
import SectionAmbitoNut from '../components/sections/section-ambito-nut';
import SectionEvolucao from '../components/sections/section-evolucao';
import LoadingScreen from '../components/loading-screen';

var Nuts = React.createClass({
  propTypes: {
    location: T.object,
    params: T.object,
    mapData: T.object,
    nut: T.object,
    national: T.object,
    onSectionChange: T.func,
    _fetchNut: T.func,
    _fetchMapData: T.func
  },

  sections: [
    { id: 'licencas', active: false },
    { id: 'distribuicao', active: false },
    { id: 'evolucao', active: false },
    { id: 'indicadores', active: false },
    { id: 'mobilidade', active: false },
    { id: 'estacionamento', active: false }
  ],

  onMapClick: function (section, data) {
    if (data.type === 'nut3') {
      // Find the right nut.
      let slug = this.props.national.data.nuts.find(o => o.id === data.id).slug;
      hashHistory.push(`/nuts/${slug}#${section}`);
    } else {
      // Find the right concelho.
      let slug = this.props.nut.data.concelhos.find(o => o.id === data.id).slug;
      hashHistory.push(`/nuts/${this.props.params.nut}/concelhos/${slug}#${section}`);
    }
  },

  popoverContent: function (data) {
    let name;
    if (data.type === 'nut3') {
      name = this.props.national.data.nuts.find(o => o.id === data.id).name;
    } else {
      // Find the right concelho.
      name = this.props.nut.data.concelhos.find(o => o.id === data.id).name;
    }

    return (
      <div>
        <p className='map-tooltip'>{name}</p>
        <span className='triangle'></span>
      </div>
    );
  },

  onSroll: function (e) {
    this.sections.forEach(sec => {
      let sectionEl = document.getElementById(sec.id);
      if (sectionEl) {
        let elY = sectionEl.getBoundingClientRect().top;
        sec.active = elY <= 10;
      }
    });

    let active = _.findLast(this.sections, ['active', true]);
    if (this.props.location.hash !== `#${active.id}`) {
      this.props.onSectionChange(active.id, 'nut');
    }
  },

  overlayInfoContent: function (section) {
    return (
      <div className='map-aa-info'>
        <ul className='map-aa-list inline-list'>
          <li><a className='map-back-link' href={`#/#${section}`} title='Ir para vista Nacional'><span className='i-arrow-left2'></span>{this.props.nut.data.name}</a></li>
        </ul>
      </div>
    );
  },

  componentDidMount: function () {
    this.onSroll = _.throttle(this.onSroll, 50);
    document.addEventListener('scroll', this.onSroll);

    this.props._fetchNut(this.props.params.nut);

    if (!this.props.mapData.fetched) {
      this.props._fetchMapData();
    }
  },

  componentWillUnmount: function () {
    document.removeEventListener('scroll', this.onSroll);
  },

  componentWillReceiveProps: function (nextProps) {
    if (this.props.params.nut !== nextProps.params.nut) {
      return this.props._fetchNut(nextProps.params.nut);
    }
  },

  render: function () {
    let { fetched, fetching, error, data } = this.props.nut;
    let hash = this.props.location.hash.replace('#', '');

    if (!fetched && !fetching) {
      return null;
    }

    if (fetching) {
      return (
        <LoadingScreen />
      );
    }

    if (error) {
      return <div>Error: {error}</div>;
    }

    let chartLic1000Hab = {
      labels: data.data.licencasTimeline.map(y => y.year),
      // Sort the datasets to ensure they don't overlapp.
      // In this case is ok because the data lines will never cross.
      datasets: _.sortBy([
        {
          data: this.props.national.data.licencasTimeline.map(o => o['lic1000']),
          label: 'Portugal',
          color: '#1f8d8e',
          backgroundColor: '#f5f5f5'
        },
        {
          data: data.data.licencasTimeline.map(o => o['lic1000']),
          label: data.name,
          color: '#00ced1',
          backgroundColor: '#f5f5f5'
        }
      ], d => d.data[0])
    };

    return (
      <div id='page-nut'>
        <div id='page-content'>
          <SectionLicencas
            adminLevel='nut'
            adminName={data.name}
            adminId={data.id}
            adminList={data.concelhos}
            licencasEndY={data.data.licencasEndY}
            maxEndY={data.data.maxEndY}
            licencasHab={data.data.licencasHab}
            mapGeometries={this.props.mapData}
            municipios={data.concelhos}
            onMapClick={this.onMapClick}
            popoverContent={this.popoverContent}
            overlayInfoContent={this.overlayInfoContent}
          />

          <SectionAmbitoNut
            adminLevel='nut'
            adminName={data.name}
            adminId={data.id}
            adminList={data.concelhos}
            parentSlug={this.props.params.nut}
            mapGeometries={this.props.mapData}
            municipios={data.concelhos}
            onMapClick={this.onMapClick}
            popoverContent={this.popoverContent}
            overlayInfoContent={this.overlayInfoContent}
          />

          <SectionEvolucao
            adminLevel='nut'
            adminName={data.name}
            adminId={data.id}
            licencasEndY={data.data.licencasEndY}
            licencasStartY={data.data.licencasStartY}
            municipios={data.concelhos}
            totalMunicipios={data.data.totalMunicipios}
            licencasTimeline={data.data.licencasTimeline}
            mapGeometries={this.props.mapData}
            onMapClick={this.onMapClick}
            popoverContent={this.popoverContent}
            overlayInfoContent={this.overlayInfoContent}
          />

          <SectionIndicadores
            adminLevel='nut'
            adminName={data.name}
            adminId={data.id}
            licencasHab={data.data.licencasHab}
            dormidas={data.data.dormidas}
            chartLic1000Hab={chartLic1000Hab}
            mapGeometries={this.props.mapData}
            municipios={data.concelhos}
            onMapClick={this.onMapClick}
            popoverContent={this.popoverContent}
            overlayInfoContent={this.overlayInfoContent}
          />

          <SectionMobilidade
            adminLevel='nut'
            adminName={data.name}
            adminId={data.id}
            totalMunicipiosMobReduzida={data.data.totalMunicipiosMobReduzida}
            totalMunicipios={data.data.totalMunicipios}
            licencasEndY={data.data.licencasEndY}
            licencasStartY={data.data.licencasStartY}
            licencasMobReduzidaEndY={data.data.licencasMobReduzidaEndY}
            licencasMobReduzidaStartY={data.data.licencasMobReduzidaStartY}
            licencasTimeline={data.data.licencasTimeline}
            mapGeometries={this.props.mapData}
            municipios={data.concelhos}
            onMapClick={this.onMapClick}
            popoverContent={this.popoverContent}
            overlayInfoContent={this.overlayInfoContent}
          />

          <SectionEstacionamento
            adminLevel='nut'
            adminName={data.name}
            adminId={data.id}
            municipios={data.concelhos}
            totalMunicipios={data.data.totalMunicipios}
            mapGeometries={this.props.mapData}
            onMapClick={this.onMapClick}
            popoverContent={this.popoverContent}
            overlayInfoContent={this.overlayInfoContent}
          />
        </div>
        <ul className='section-nav'>
          <li className={c('nav-item', { active: hash === 'licencas' })}>
            <Link to={`/nuts/${this.props.params.nut}#licencas`}>
              <span>Licenças e Contingentes</span>
            </Link>
          </li>
          <li className={c('nav-item', { active: hash === 'distribuicao' })}>
            <Link to={`/nuts/${this.props.params.nut}#distribuicao`}>
              <span>Detalhe Geográfico</span>
            </Link>
          </li>
          <li className={c('nav-item', { active: hash === 'evolucao' })}>
            <Link to={`/nuts/${this.props.params.nut}#evolucao`}>
              <span>Evolução {startYear}-{endYear}</span>
            </Link>
          </li>
          <li className={c('nav-item', { active: hash === 'indicadores' })}>
            <Link to={`/nuts/${this.props.params.nut}#indicadores`}>
              <span>Indicadores</span>
            </Link>
          </li>
          <li className={c('nav-item', { active: hash === 'mobilidade' })}>
            <Link to={`/nuts/${this.props.params.nut}#mobilidade`}>
              <span>Mobilidade Reduzida</span>
            </Link>
          </li>
          <li className={c('nav-item', { active: hash === 'estacionamento' })}>
            <Link to={`/nuts/${this.props.params.nut}#estacionamento`}>
              <span>Regime Estacionamento</span>
            </Link>
          </li>
        </ul>

      </div>
    );
  }
});

// /////////////////////////////////////////////////////////////////// //
// Connect functions

function selector (state) {
  return {
    national: state.national,
    nut: state.nut,
    mapData: state.mapData
  };
}

function dispatcher (dispatch) {
  return {
    _fetchNut: (...args) => dispatch(fetchNut(...args)),
    _fetchMapData: (...args) => dispatch(fetchMapData(...args))
  };
}

module.exports = connect(selector, dispatcher)(Nuts);
