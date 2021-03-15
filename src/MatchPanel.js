import React, { Component } from "react";

import "./matchPanel.css";

export default class extends Component {
  constructor(props) {
    super();

    this.toggleRatings = function (event) {
      let ratingsElement = document.getElementById("ratings");
      let ratingsToggleButtonElement = document.getElementById(
        "ratingsToggleButton"
      );

      if (ratingsElement.classList.contains("none")) {
        ratingsElement.classList.remove("none");
        ratingsToggleButtonElement.innerText = "Hide Ratings";
      } else {
        ratingsElement.classList.add("none");
        ratingsToggleButtonElement.innerText = "Unhide Ratings";
      }
    }.bind(this);
  }

  render() {
    return (
      <div className="App">
        <div className="matchContainer">
          <div>
            <table>
              <tr>
                <td colSpan="3">
                  <h3 className="mapName">{this.props.map}</h3>
                </td>
              </tr>
              <tr>
                <td>
                  {this.props.playerOneCiv} - {this.props.playerOneName}
                </td>
                <td>vs.</td>
                <td>
                  {this.props.playerTwoCiv} - {this.props.playerTwoName}
                </td>
              </tr>
              <tr id="ratings" className="none">
                <td>{this.props.playerOneRating}</td>
                <td></td>
                <td>{this.props.playerTwoRating}</td>
              </tr>
            </table>
          </div>
          <div>
            <div className="smallButton">
              <a
                className="spectateGame"
                href={`https://aoe2.net/s/${this.props.matchId}`}
              >
                Spectate in DE
              </a>
            </div>
            <div>
              <button
                id="ratingsToggleButton"
                className="smallButton"
                onClick={this.toggleRatings}
              >
                Unhide Ratings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
