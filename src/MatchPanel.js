import React, { Component } from "react";

import "./matchPanel.css";

export default class extends Component {
  constructor(props) {
    super();

    this.state = {
      showRatings: false,
    };

    this.toggleRatings = function (event) {
      if (this.state.showRatings) {
        this.setState({ showRatings: false });
      } else {
        this.setState({ showRatings: true });
      }
    }.bind(this);
  }

  render() {
    return (
      <div>
        <div className="match-container">
          <div className="match-info-container">
            <div>
              <h3 className="map-name">{this.props.map}</h3>
            </div>
            <div className="both-player-container">
              <div className="player-container">
                <div className="player-name-container">
                  <img
                    className="civ-logo"
                    alt={this.props.playerOneCiv}
                    title={this.props.playerOneCiv}
                    src={
                      "https://thbrown.github.io/aoe2-de-random-elo/civs/" + // TODO: this should really be PUBLIC_URL somehow
                      this.props.playerOneCiv.toLowerCase() +
                      ".png"
                    }
                  ></img>
                  <div>
                    <a
                      href={`https://aoe2.net/#profile-${this.props.playerOneId}`}
                    >
                      {this.props.playerOneName}
                    </a>
                  </div>
                </div>
                <div
                  className={
                    "ratings-container " +
                    (this.state.showRatings ? "" : "hidden")
                  }
                >
                  {this.props.playerOneRating}
                </div>
              </div>
              <div className="versus">vs.</div>
              <div className="player-container">
                <div className="player-name-container">
                  <img
                    className="civ-logo"
                    alt={this.props.playerTwoCiv}
                    title={this.props.playerTwoCiv}
                    src={
                      "https://thbrown.github.io/aoe2-de-random-elo/civs/" +
                      this.props.playerTwoCiv.toLowerCase() +
                      ".png"
                    }
                  ></img>
                  <div>
                    <a
                      href={`https://aoe2.net/#profile-${this.props.playerTwoId}`}
                    >
                      {this.props.playerTwoName}
                    </a>
                  </div>
                </div>
                <div
                  className={
                    "ratings-container " +
                    (this.state.showRatings ? "" : "hidden")
                  }
                >
                  {this.props.playerTwoRating}
                </div>
              </div>
            </div>
          </div>
          <div className="match-button-container">
            <div>
              <a
                className="spectate-game button match-option-button"
                href={`https://aoe2.net/s/${this.props.matchId}`}
              >
                Spectate in DE
              </a>
            </div>
            <div>
              <button
                style={{
                  width: "122px",
                }}
                className="button match-option-button"
                onClick={this.toggleRatings}
              >
                {this.state.showRatings ? "Hide Ratings" : "Unhide Ratings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
