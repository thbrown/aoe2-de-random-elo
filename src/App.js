import "./App.css";

import React, { Component } from "react";
import Helper from "./helper.js";
import MatchPanel from "./MatchPanel.js";

const AOE2_NET_PROXY_URL =
  "https://us-central1-age-of-empires-307521.cloudfunctions.net/aoe2-net-cors-proxy";

const DEFAULT_MIN_RATING = 500;
const DEFAULT_MAX_RATING = 2000;
const DEFAULT_NUMBER_OF_MATCHES = 5;

const MATCHES_TO_REQUEST = 500; // Must be less than 1k

// TODO: strictly in bounds?

export default class extends Component {
  constructor(props) {
    super();
    this.state = {
      minRating: DEFAULT_MIN_RATING,
      maxRating: DEFAULT_MAX_RATING,
      numberOfMatches: DEFAULT_NUMBER_OF_MATCHES,
      selectedMatches: [],
    };

    this.handleMinRatingChange = function (event) {
      this.setState({ minRating: event.target.value });
    }.bind(this);

    this.handleMaxRatingChange = function (event) {
      this.setState({ maxRating: event.target.value });
    }.bind(this);

    this.handleNumberOfMatchesChange = function (event) {
      this.setState({ numberOfMatches: event.target.value });
    }.bind(this);

    this.onRandomClick = async function () {
      try {
        // Select a random rating that will be used select a match
        // Do this first so we can complain if the params are bad
        let min = parseInt(this.state.minRating);
        let max = parseInt(this.state.maxRating);
        let numMatches = parseInt(this.state.numMatches);

        if (numMatches < 1) {
          return;
        }

        let targetRatings = [];

        console.log("Number of matches", this.state.numberOfMatches);

        for (let i = 0; i < this.state.numberOfMatches; i++) {
          targetRatings.push(getRandomRating(min, max));
        }
        console.log("Target Ratings", targetRatings);

        if (min > max) {
          alert("Invalid input, min is larger than max");
          return;
        }

        // Show loading animation
        document.getElementById("loading-hider").classList.add("none");
        document.getElementById("loading").classList.remove("none");

        const response = await fetch(AOE2_NET_PROXY_URL, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "same-origin", // include, *same-origin, omit
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          redirect: "follow", // manual, *follow, error
          referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify({
            query: `matches?game=aoe2de&count=${MATCHES_TO_REQUEST}&since=${
              Math.round(new Date().getTime() / 1000) - 1000
            }`,
          }),
        });

        //let jsonResponse = response.json();
        let data = await response.json();
        console.log(data);

        // We only want v1 random map ranked games
        let filtered = [];
        for (let i = 0; i < data.length; i++) {
          let match = data[i];

          let leaderboardId = match.leaderboard_id;

          if (leaderboardId === 3) {
            let matchId = match.match_id;

            let playerOneName = match.players[0].name;
            let playerTwoName = match.players[1].name;

            let playerOneId = match.players[0].profile_id;
            let playerTwoId = match.players[1].profile_id;

            let playerOneCiv = Helper.getCivLabel(match.players[0].civ);
            let playerTwoCiv = Helper.getCivLabel(match.players[1].civ);

            let playerOneRating = match.players[0].rating;
            let playerTwoRating = match.players[1].rating;

            let map = Helper.getMapLabel(match.map_type);

            let avgRating;
            if (!playerTwoRating && !playerOneRating) {
              avgRating = "none";
            } else if (playerTwoRating && playerOneRating) {
              avgRating = (playerTwoRating + playerOneRating) / 2;
            } else if (playerTwoRating) {
              avgRating = playerOneRating;
            } else {
              avgRating = playerTwoRating;
            }

            filtered.push({
              avgRating,
              map,
              playerOneRating,
              playerTwoRating,
              matchId,
              playerOneName,
              playerTwoName,
              playerOneCiv,
              playerTwoCiv,
              playerOneId,
              playerTwoId,
            });
          }
        }

        console.log("Filtered Matches (Ranked 1v1 Only)", filtered);

        // Select the matches closest to each of the random ratings selected earlier
        let pickedMatches = [];
        for (let j = 0; j < targetRatings.length; j++) {
          let pickedMatch;
          let pickedMatchDiff = 99999999;
          for (let i = 0; i < filtered.length; i++) {
            let matchToConsider = filtered[i];
            if (matchToConsider.avgRating) {
              let diff = Math.abs(targetRatings[j] - matchToConsider.avgRating);
              if (diff < pickedMatchDiff) {
                pickedMatch = matchToConsider;
                pickedMatchDiff = diff;
              }
            }
          }
          pickedMatches.push(pickedMatch);
        }
        console.log("Selected", pickedMatches);

        this.setState({ selectedMatches: pickedMatches });
      } catch (e) {
        console.log(e);
        alert(
          "Sorry, there was an error while attempting to get data from aoe2.net"
        );
      } finally {
        // Un Show loading animation
        document.getElementById("loading-hider").classList.remove("none");
        document.getElementById("loading").classList.add("none");
      }
    }.bind(this);
  }

  render() {
    let selectedMatchUiElements = [];
    for (let i = 0; i < this.state.selectedMatches.length; i++) {
      let match = this.state.selectedMatches[i];
      selectedMatchUiElements.push(
        <MatchPanel
          matchId={match.matchId}
          playerOneName={match.playerOneName}
          playerTwoName={match.playerTwoName}
          playerOneCiv={match.playerOneCiv}
          playerTwoCiv={match.playerTwoCiv}
          playerOneRating={match.playerOneRating}
          playerTwoRating={match.playerTwoRating}
          playerOneId={match.playerOneId}
          playerTwoId={match.playerTwoId}
          map={match.map}
          key={i + "selected-match"}
        ></MatchPanel>
      );
    }

    return (
      <div>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h1>Age of Empires 2: DE</h1>
          <h2>Random Rating Match Retriever</h2>
          <div>
            Playing guess the elo? Selecting a "random" game from the ongoing
            matches won't get you a very even distribution of ratings.
          </div>
          <br></br>
          <div>
            This tool:
            <br></br> 1. Selects a random rating between two values.
            <br></br> 2. Then selects the closest ongoing game to that rating.
          </div>
          <br></br>
          <div className="options-pane">
            <div>
              <div>
                <label for="minRating">Min Rating</label>
              </div>
              <div>
                <input
                  type="number"
                  id="minRating"
                  name="minRating"
                  step="1"
                  value={this.state.minRating}
                  onChange={this.handleMinRatingChange}
                ></input>
              </div>
            </div>
            <div>
              <div>
                <label for="maxRating">Max Rating</label>
              </div>
              <div>
                <input
                  type="number"
                  id="maxRating"
                  name="maxRating"
                  step="1"
                  value={this.state.maxRating}
                  onChange={this.handleMaxRatingChange}
                ></input>
              </div>
            </div>
            <div>
              <div>
                <label for="numberOfMatches"># of Results</label>
              </div>
              <div>
                <input
                  type="number"
                  id="numberOfMatches"
                  name="numberOfMatches"
                  step="1"
                  max="500"
                  min="1"
                  value={this.state.numberOfMatches}
                  onChange={this.handleNumberOfMatchesChange}
                ></input>
              </div>
            </div>
          </div>
          <button className="big-button button" onClick={this.onRandomClick}>
            <div id="loading" className="outer-loading-spinner none">
              <div className="loading-spinner">
                <div className="spinner-dot"></div>
                <div className="spinner-dot"></div>
                <div className="spinner-dot"></div>
                <div className="spinner-dot"></div>
                <div className="spinner-dot"></div>
                <div className="spinner-dot"></div>
              </div>
            </div>
            <div id="loading-hider">
              Get Match{this.state.numberOfMatches == "1" ? "" : "es"}
            </div>
          </button>
          <br></br>
          {selectedMatchUiElements}
          <br></br>
          <div className="footer">
            View source code on{" "}
            <a href="https://github.com/thbrown/aoe2-de-random-elo">github</a>
            <br></br>
            Data from <a href="https://aoe2.net/#api">https://aoe2.net/#api</a>
            <br></br>
            <br></br>
            Age of Empires II: Definitive Edition© Microsoft Corporation. This
            site was created under Microsoft's{" "}
            <a href="https://www.xbox.com/en-US/developers/rules">
              "Game Content Usage Rules"
            </a>{" "}
            using assets from Age of Empires II: Definitive Edition, and it is
            not endorsed by or affiliated with Microsoft.
          </div>
        </div>
      </div>
    );
  }
}

const getRandomRating = function (min, max) {
  return Math.round(Math.random() * (max - min) + min);
};

/*

Useful CURL commands for testing CORS

curl -H "Origin: http://localhost:3000" --verbose \
    "https://us-central1-age-of-empires-307521.cloudfunctions.net/aoe2-net-cors-proxy"

PREFLIGHT request test

curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS --verbose \
  https://us-central1-age-of-empires-307521.cloudfunctions.net/aoe2-net-cors-proxy
 
 {
          "query": "matches?game=aoe2de&count=1&since=1596775000"
        }
 
  */
