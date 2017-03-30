'use strict';
import React, { PropTypes as T } from 'react';

var SectionIntro = React.createClass({
  propTypes: {
    data: T.object
  },

  render: function () {
    return (
      <div id='intro' className='container-wrapper'>
        <section id='intro' className='section-wrapper'>
          <h3 className='section-category'>Observatório dos Mercados da Mobilidade,<span className='block'> Preços e Estratégias Empresariais</span></h3>
          <h1>Táxis em Portugal 2006-2016</h1>
          <p className='lead'>Num momento em que discute o enquadramento regulatório do transporte de passageiros em veículos ligeiros, considera-se prioritário reforçar e promover o conhecimento sobre o sector, nomeadamente sobre os serviços de transporte em táxi.</p>

          <ul className='social-share'>
            <li><a className='facebook' href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} title="Partilhar no Facebook"><span className='i-facebook'></span></a></li>
            <li><a className='linkedin' href={`https://www.linkedin.com/shareArticle?mini=true&title=Observat%C3%B3rio%20da%20Mobilidade%20e%20dos%20Transportes%20&url=${window.location.href}`} title="Partilhar no LinkedIn"><span className='i-linkedin2'></span></a></li>
            <li><a className='twitter' href={`https://twitter.com/home?status=${window.location.href}`} title="Partilhar no Twitter"><span className='i-twitter'></span></a></li>
            <li><a className='googleplus' href={`https://plus.google.com/share?url=${window.location.href}`} title="Partilhar no Google+"><span className='i-google-plus'></span></a></li>
          </ul>

        </section>
      </div>
    );
  }
});

module.exports = SectionIntro;
