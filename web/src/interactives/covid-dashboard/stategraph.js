import React, { Component } from "react";
import { fetchStateData } from "./data/dataservice";
import { Line } from "react-chartjs-2";
import Select from "react-select";

let stateOptions = [];

const statesData = require("./assets/states.json");

statesData.forEach((state) =>
  stateOptions.push({
    value: state.abbreviation,
    label: state.name,
  })
);

class StateGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      state: "AL",
      chartData: {
        labels: [],
        datasets: [
          {
            label: "Cases",
            data: [],
            fill: true,
            borderColor: "red",
          },
        ],
      },
      sort: props.sort,
    };
  }

  async componentDidMount() {
    this.loadData(this.state.state);
  }

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.state !== this.state.state) {
      this.loadData(this.state.state);
    }
  }

  async loadData(state) {
    const data = await fetchStateData(state);
    this.setState({
      chartData: {
        labels: data.dates,
        datasets:
          this.state.sort === "daily"
            ? [
                {
                  label: "hospitalized Currently",
                  data: Object.values(data.hospitalizedCurrently),
                  fill: true,
                  borderColor: "purple",
                },
                {
                  label: "Increase in Cases",
                  data: Object.values(data.positiveIncrease),
                  fill: true,
                  borderColor: "orange",
                },
                {
                  label: "Increase in Deaths",
                  data: Object.values(data.deathIncrease),
                  fill: true,
                  borderColor: "yellow",
                },
                {
                  label: "Moving Average of Daily Cases",
                  data: Object.values(data.movingAvgCases),
                  fill: true,
                  borderColor: "black",
                },
              ]
            : [
                {
                  label: "Confirmed",
                  data: data.confirmed,
                  fill: true,
                  borderColor: "red",
                },
                {
                  label: "Deaths",
                  data: Object.values(data.deaths),
                  fill: true,
                  borderColor: "blue",
                },
                {
                  label: "Recovered",
                  data: Object.values(data.recovered),
                  fill: true,
                  borderColor: "green",
                },
              ],
      },
    });
  }

  handleChange = (event) => this.setState({ state: event.value });

  render() {
    return (
      <div className={"chart"}>
        <Select
          placeholder={"Select State"}
          value={stateOptions.find((obj) => obj.value === this.state.state)}
          options={stateOptions}
          onChange={this.handleChange}
        />
        <Line data={this.state.chartData} />
      </div>
    );
  }
}

export default StateGraph;