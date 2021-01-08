import React from 'react';
import Axios from 'axios';
import Select from 'react-select';

const MainTitle = () => {
  return (
    <div className="container">
      <div className="row my-2">
        <h1 className="col text-center display-4">COVID-19 UPDATE</h1>
      </div>
    </div>
  );
}

const SearchField = ({onChange, options, value}) => {
  return (
    <div className="container">
      <div className="row my-3 mx-lg-3">
        <div className="col card card-body text-center mx-4">
          <h2 className="mb-3">Search country</h2>
          <Select isMulti={true} value={value} options={options} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

const Cases = ({cases, addClass, children}) => {
  return (
    <div className={"col text-center my-2 mx-4 rounded p-2 " + addClass}>
      <h4 className="font-weight-bold">{children} Cases</h4>
      <p>{cases}</p>
    </div>
  );
}

const ConfirmedCases = ({cases}) => {
  return <Cases cases={cases} addClass="bg-warning">Confirmed</Cases>;
}

const RecoveredCases = ({cases}) => {
  return <Cases cases={cases} addClass="bg-success text-white">Recovered</Cases>;
}

const DeathCases = ({cases}) => {
  return <Cases cases={cases} addClass="bg-danger text-white">Death</Cases>;
}

const AllCases = ({confirmed, recovered, deaths, country}) => {
  return (
    <div className="card mx-3 mx-lg-5">
      <h3 className="card-header">{country}</h3>
      <div className="row card-body">
        <ConfirmedCases cases={confirmed.toLocaleString('en-US')} />
        <RecoveredCases cases={recovered.toLocaleString('en-US')} />
        <DeathCases cases={deaths.toLocaleString('en-US')} />
      </div>
    </div>
  );
}

export default class App extends React.Component {
  state = {
    countries: [],
    selectedCountries: [{value: 'Worldwide', label: 'Worldwide'}]
  };

  componentDidMount () {
    this.getData();
  }

  async getData () {
    const responseCountries = await Axios.get('https://covid19.mathdro.id/api/countries');
    let countries = responseCountries.data.countries;
    countries = countries.map(({name}) => ({value: name, label: name}));

    this.setState({countries});
  }

  async worldWideData () {
    const {data} = await Axios.get('https://covid19.mathdro.id/api');
    const cases = {
      confirmed: data.confirmed.value,
      recovered: data.recovered.value,
      deaths: data.deaths.value,
      country: 'Worldwide'
    };

    return cases;
  }

  async getCountryData (country) {
    if (country === 'Worldwide') {
      return await this.worldWideData();
    }
    const responseAPI = await Axios.get(`https://covid19.mathdro.id/api/countries/${country}`);
    const cases = {
      confirmed: responseAPI.data.confirmed.value,
      recovered: responseAPI.data.recovered.value,
      deaths: responseAPI.data.deaths.value,
      country: country
    };

    return cases;
  }

  selectCountry = selectedCountries => {
    this.setState({selectedCountries});
  }

  render () {
    const {selectedCountries, countries} = this.state;
    return (
      <section>
        <MainTitle />
        <SearchField value={selectedCountries} options={countries} onChange={this.selectCountry} />
      </section>
    );
  }
}