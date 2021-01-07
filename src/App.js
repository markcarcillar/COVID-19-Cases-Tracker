import React from 'react';
import Axios from 'axios';

const Cases = ({title, cases, addClass}) => {
  return (
    <div className={"col text-center my-2 mx-4 rounded p-2 " + addClass}>
      <h4 className="font-weight-bold">{title} Cases</h4>
      <p>{cases}</p>
    </div>
  );
}

export default class App extends React.Component {
  constructor (props) {
    super(props);

    this.getCountryData = this.getCountryData.bind(this);

    this.state = {
      confirmed: 0,
      recovered: 0,
      deaths: 0,
      countries: []
    }
  }

  componentDidMount () {
    this.getData();
  }

  async getData () {
    const responseCountries = await Axios.get('https://covid19.mathdro.id/api/countries');
    const countries = responseCountries.data.countries;

    this.worldWideData();
    this.setState({countries});
  }

  async worldWideData () {
    const {data} = await Axios.get('https://covid19.mathdro.id/api');

    this.setState({
      confirmed: data.confirmed.value,
      recovered: data.recovered.value,
      deaths: data.deaths.value
    });
  }

  async getCountryData (event) {
    if (event.target.value === 'Worldwide') {
      this.worldWideData();
      return;
    }

    const responseAPI = await Axios.get(`https://covid19.mathdro.id/api/countries/${event.target.value}`);
    this.setState({
      confirmed: responseAPI.data.confirmed.value,
      recovered: responseAPI.data.recovered.value,
      deaths: responseAPI.data.deaths.value
    });
  }

  renderCountryOptions () {
    return this.state.countries.map((country, index) => <option key={index}>{country.name}</option>);
  }

  render () {
    const { confirmed, recovered, deaths } = this.state
    return (
      <section className="container">
        <div className="row my-2">
          <h1 className="col text-center display-4">COVID-19 UPDATE</h1>
        </div>
        
        <div className="row my-3 mx-lg-3">
          <div className="col card card-body text-center mx-4">
            <h2 className="mb-3">Select country</h2>
            <select className="custom-select" onChange={this.getCountryData}>
              <option>Worldwide</option>
              {this.renderCountryOptions()}
            </select>
          </div>
        </div>

        <div className="card card-body mx-3 mx-lg-5">
          <div className="row">
            <Cases title="Confirmed" cases={confirmed.toLocaleString('en-US')} addClass="bg-warning" />
            <Cases title="Recovered" cases={recovered.toLocaleString('en-US')} addClass="bg-success text-white" />
            <Cases title="Death" cases={deaths.toLocaleString('en-US')} addClass="bg-danger text-white" />
          </div>
        </div>
      </section>
    );
  }
}