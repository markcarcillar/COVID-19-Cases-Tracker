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
          <Select
            isMulti={true} 
            value={value}
            options={options} 
            onChange={onChange} 
            placeholder="Search here..." 
          />
        </div>
      </div>
    </div>
  );
}

const Cases = ({cases, addClass, children}) => {
  return (
    <div className={"text-center my-2 rounded p-2 " + addClass}>
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
    <div className="col-md-6 col-lg-4">
      <div className="card mx-4 mx-md-0 my-3">
        <h3 className="card-header">{country}</h3>
        <div className="card-body">
          <ConfirmedCases cases={confirmed} />
          <RecoveredCases cases={recovered} />
          <DeathCases cases={deaths} />
        </div>
      </div>
    </div>
  );
}

const InfoBanner = () => {
  return (
    <div className="container text-white text-center lead ">
      <div className="row mx-4 mx-lg-5">
        <div className="col card bg-info p-2">
          <p>No country is selected.</p>
        </div>
      </div>
    </div>
  );
}

export default class App extends React.Component {
  state = {
    countries: [],
    selectedCountries: [
      {value: 'Worldwide', label: 'Worldwide'},
      {value: 'Philippines', label: 'Philippines'},
      {value: 'India', label: 'India'}
    ],
    allCases: []
  };

  componentDidMount () {
    this.setCountries();
    this.getCountryData();
  }

  async setCountries () {
    const {data} = await Axios.get('https://covid19.mathdro.id/api/countries');
    let countries = data.countries;
    countries = countries.map(({name}) => ({value: name, label: name}));
    countries.push({value: 'Worldwide', label: 'Worldwide'});
    this.setState({countries});
  }

  async worldWideData () {
    const {data} = await Axios.get('https://covid19.mathdro.id/api');
    const cases = {
      confirmed: data.confirmed.value.toLocaleString(),
      recovered: data.recovered.value.toLocaleString(),
      deaths: data.deaths.value.toLocaleString(),
      country: 'Worldwide'
    };

    return cases;
  }

  isCasesInAllCases (cases, useCountry=false, country='') {
    const allCases = this.state.allCases;
    for (let allCase of allCases) {
      if (country === '' && !useCountry) {
        if (allCase.country === cases.country) return true;
        continue;
      }
      if (allCase.country === country) return true;
    }
    return false;
  }

  async getCountryData () {
    const {selectedCountries, allCases} = this.state;
    let newCases = [];
    
    await Promise.all(selectedCountries.map(async ({value}) => {
      if (!this.isCasesInAllCases(null, true, value)) {
        let cases;
        if (value === 'Worldwide') {
          cases = await this.worldWideData();
          if (!this.isCasesInAllCases(cases)) newCases.push(cases);
          return;
        }
        const {data} = await Axios.get(`https://covid19.mathdro.id/api/countries/${value}`);
        cases = {
          confirmed: data.confirmed.value.toLocaleString(),
          recovered: data.recovered.value.toLocaleString(),
          deaths: data.deaths.value.toLocaleString(),
          country: value
        };
        if (!this.isCasesInAllCases(cases)) newCases.push(cases);
      }
    }));

    this.setState({allCases: allCases.concat(newCases)});
    this.unrenderCountryData();
  }

  unrenderCountryData () {
    const {selectedCountries, allCases} = this.state;
    if (allCases.length > 0) {
      let newCases = allCases.filter(cases => {
        for (let selectedCountry of selectedCountries) {
          if (selectedCountry.value === cases.country) return true;
        }
        return false;
      });
  
      this.setState({allCases: newCases});
    }
  }

  selectCountry = selectedCountries => {
    if (selectedCountries === null) {
      this.setState(
        {
          selectedCountries: []
        },
        this.getCountryData // callback
      );
      return;
    }

    this.setState(
      {selectedCountries},
      this.getCountryData
    );
  }

  render () {
    const {selectedCountries, countries, allCases} = this.state;
    return (
      <section>
        <MainTitle />
        <SearchField value={selectedCountries} options={countries} onChange={this.selectCountry} />
        {
          allCases.length > 0 &&
          <article className="container">
            <div className="row">
              {allCases.map(cases => <AllCases key={cases.country} {...cases} />)}
            </div>
          </article>
        }
        
        {selectedCountries.length === 0 && <InfoBanner />}
      </section>
    );
  }
}