import React from 'react';
import Axios from 'axios';

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

const SearchedCountry = ({country}) => {
  return <p>{country}</p>;
}

const SelectCountry = ({onChange, countries, value}) => {
  return (
    <div className="row my-3 mx-lg-3">
      <div className="col card card-body text-center mx-4">
        <h2 className="mb-3">Search country</h2>
        <select className="custom-select" value={value} onChange={onChange} multiple={true}>
          <option>Worldwide</option>
          {countries}
        </select>
      </div>
    </div>
  )
}

export default class App extends React.Component {
  constructor (props) {
    super(props);

    this.getCountryData = this.getCountryData.bind(this);

    this.state = {
      countries: [],
      selectedCountries: [],
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
    const cases = {
      confirmed: data.confirmed.value,
      recovered: data.recovered.value,
      deaths: data.deaths.value
    };

    return cases;
  }

  async getCountryData (country) {
    if (country === 'Worldwide') {
      this.worldWideData();
      return;
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

  renderCountryOptions () {
    return this.state.countries.map((country, index) => <option key={index}>{country.name}</option>);
  }

  selectCountry = event => {
    const country = event.target.value;
    let selectedCountries = this.state.selectedCountries;
    if (!selectedCountries.includes(country)) {
      selectedCountries.push(event.target.value)
      this.setState({
        selectedCountries: selectedCountries
      });
      return;
    }

    let countryIndex = selectedCountries.indexOf(country);
    selectedCountries.splice(countryIndex, 1);
    this.setState({
      selectedCountries: selectedCountries
    });
  }

  render () {
    const {selectedCountries} = this.state;
    return (
      <section className="container">
        <div className="row my-2">
          <h1 className="col text-center display-4">COVID-19 UPDATE</h1>
        </div>
        <SelectCountry value={selectedCountries} countries={this.renderCountryOptions()} onChange={this.selectCountry} />
        {selectedCountries.map(async (country) => {
          const countryCases = await this.getCountryData(country);
          return <AllCases {...countryCases} />;
          })
        }
      </section>
    );
  }
}