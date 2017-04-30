'use strict';
import React from 'react';
import { connect } from 'react-redux';

var Sobre = React.createClass({
  propTypes: {
  },

  componentDidMount: function () {
  },

  render: function () {
    return (
      <div id='sobre-wrapper' className='container-wrapper'>
        <section id='sobre' className='content-wrapper'>
          <h1>Sobre o Projeto</h1>
          <div className="wrapper">
            <div>
              <p className='lead'>A Autoridade da Mobilidade e dos Transportes identificou o desenvolvimento do Observatório dos Mercados da Mobilidade, Preços e Estratégias empresariais, como uma prioridade estratégica e um instrumento fundamental à aplicação de uma regulação eficiente no Ecossistema da Mobilidade e dos Transportes. </p>
              <p>Este microsite é baseado no <strong>Relatório Estatístico: Serviços de Transporte em Táxi: A realidade atual e a evolução na última década</strong>. A recolha estatística apresentada visa dar a conhecer factos essenciais sobre as condições de prestação de serviços de táxi em Portugal, constituindo mais um contributo da AMT para a reflexão sobre o quadro legislativo e regulatório no transporte de passageiros em veículos ligeiros. Potenciam-se assim decisões informadas e adequadas aos interesses dos utilizadores destes serviços e possibilita-se um acompanhamento dos efeitos das opções que venham a ser tomadas.</p>
            </div>
            <div>
              <h3>Informações e Contactos</h3>
              <p>Este projeto foi coordenado pela Divisão dos Mercados da Mobilidade da Direção de Supervisão dos Mercados da Mobilidade. Para mais informações contactar <a href="mailto:dsmm@amt-autoridade.pt
">dsmm@amt-autoridade.pt</a>.</p>
              
              <p><strong>AMT - Autoridade da Mobilidade e dos Transportes:</strong><a className='block' href="mailto:geral@amt-autoridade.pt">geral@amt-autoridade.pt</a> <a className='block' href="http://www.amt-autoridade.pt/" target="_blank">www.amt-autoridade.pt</a></p>

              <h3>Tecnologias e Licenças</h3>
              <p>Este site foi desenvolvido pela Major, com recurso apenas a tecnologias Open Source. Para a framework base foram utilizados <a href="https://facebook.github.io/react/" target="_blank">React</a> e <a href="http://redux.js.org/" target="_blank">Redux</a>. Para os gráficos, foi utilizada a biblioteca <a href="http://www.chartjs.org/" target="_blank">Chart.js</a> e, para os mapas, a biblioteca <a href="https://d3js.org/" target="_blank">D3.js</a>.</p>
              <p>Todo o código deste site está disponível sob a licença MIT <a href="https://opensource.org/licenses/MIT" target="_blank">https://opensource.org/licenses/MIT</a>.</p>
            </div>
          </div>

        </section>
      </div>
    );
  }
});

// /////////////////////////////////////////////////////////////////// //
// Connect functions

function selector (state) {
  return {
  };
}

function dispatcher (dispatch) {
  return {
  };
}

module.exports = connect(selector, dispatcher)(Sobre);
