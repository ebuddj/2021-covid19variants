import React, {Component} from 'react';
import style from './../styles/styles.less';

// https://svgcrop.com/
import person_svg from './../../media/img/person-cropped.svg';

// https://www.npmjs.com/package/react-countup
import CountUp from 'react-countup';

// https://d3js.org/
import * as d3 from 'd3';

// Define the who are initially sick.
function getHashValue(key) {
  let matches = location.hash.match(new RegExp(key+'=([^&]*)'));
  return matches ? matches[1] : null;
}

const show_titles = getHashValue('titles') ? getHashValue('titles') : 'true';

const total_count = 210;
const sick_percent = getHashValue('percent') ? (parseInt(getHashValue('percent')) / 100) : 0.05;
const initial_sick_count = total_count * sick_percent;
const initial_sick = new Set();
while(initial_sick.size < initial_sick_count) {
  initial_sick.add(Math.floor(Math.random() * total_count));
}

let interval;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }
  }
  componentDidMount() {
    d3.json('./data/data.json').then((data) => {
      this.setState((state, props) => ({
        data:data,
        sick_count_percents:data.map(() => sick_percent * 100)
      }), () => this.createVis(data));
    })
    .catch(function (error) {
    })
    .then(function () {
    });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {

  }
  componentWillUnMount() {
    clearInterval(interval);
  }
  createVis(data) {
    let elements = [];
    data.forEach((variant, variant_id) =>  {
      elements[variant_id] = [];
      for (let i = 0; i < total_count; i++) {
        elements[variant_id].push(<li key={i}><img src={person_svg} alt="Person" className={style.person + ' ' + (([...initial_sick].includes(i)) ? style.red : style.grey)} /></li>);
      }
    });

    this.setState((state, props) => ({
      elements:elements,
      sick_percent:parseInt(initial_sick.size / total_count * 100)
    }));


    let i = 0;
    setTimeout(() => {
      interval = setInterval(() => {
        this.updateData(i)
        i++;
        if (i >= this.state.data.length) {
          clearInterval(interval);
        }
      }, 3000);
    }, 3000);
  }
  updateData(id) {
    // Clone the initial sick to keep it. 
    let sick_after_spreading = new Set(initial_sick);
    while(sick_after_spreading.size < (initial_sick_count * (this.state.data[id].value_max + this.state.data[id].value_min) / 2) && sick_after_spreading.size < total_count) {
      sick_after_spreading.add(Math.floor(Math.random() * total_count));
    }
    let elements = this.state.elements;
    elements[id] = [];
    for (let i = 0; i < total_count; i++) {
      elements[id].push(<li key={i}><img src={person_svg} alt="Person" className={style.person + ' ' + (([...sick_after_spreading].includes(i)) ? style.red : style.grey)} /></li>);
    }
    // console.log(sick_after_spreading)
    let sick_count_percents = this.state.sick_count_percents;
    sick_count_percents[id] = parseInt(sick_after_spreading.size / total_count * 100) ;
    this.setState((state, props) => ({
      elements:elements,
      sick_count_percents:sick_count_percents
    }));
  }
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  render() {
    return (
      <div className={style.app}>
        <div>
        {
          this.state.elements && this.state.elements.map((element, i) => {

            return (
              <div className={style.container} key={i}><div className={style.sick_count_container}><CountUp useEasing={false} duration={1.5} start={sick_percent * 100} end={this.state.sick_count_percents[i]} />%</div><h1>{(show_titles === 'true') ? this.state.data[i].name + ', ' : ''}R={this.state.data[i].r}</h1><ul>{element}</ul></div>
            )
          })
        }
        </div>
      </div>
    );
  }
}
export default App;