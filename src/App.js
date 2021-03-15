import logo from "./logo.svg";
import "./App.css";

import React, { Component } from "react";
import Helper from "./helper.js";
import MatchPanel from "./MatchPanel.js";

const AOE2_NET_PROXY_URL =
  "https://us-central1-age-of-empires-307521.cloudfunctions.net/aoe2-net-cors-proxy";

const DEFAULT_MIN_RATING = 500;
const DEFAULT_MAX_RATING = 2000;

const MATCHES_TO_REQUEST = 500; // Must be less than 1k

// TODO: loading
// TODO: strictly in bounds
// TODO: more selections

export default class extends Component {
  constructor(props) {
    super();
    this.state = {
      minRating: DEFAULT_MIN_RATING,
      maxRating: DEFAULT_MAX_RATING,
      selectedMatches: [],
    };

    this.handleMinRatingChange = function (event) {
      this.setState({ minRating: event.target.value });
    }.bind(this);

    this.handleMaxRatingChange = function (event) {
      this.setState({ maxRating: event.target.value });
    }.bind(this);

    this.onRandomClick = async function () {
      // Select a random rating that will be used select a match
      // Do this first so we can complain if the params are bad
      let min = parseInt(this.state.minRating);
      let max = parseInt(this.state.maxRating);
      let targetRating = getRandomRating(min, max);
      console.log("Targeting", targetRating);

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
          });
        }
      }

      console.log("FILTERED", filtered);

      // Select the game closest to the random rating selected earlier
      let pickedMatch;
      let pickedMatchDiff = 99999999;
      for (let i = 0; i < filtered.length; i++) {
        let matchToConsider = filtered[i];
        if (matchToConsider.avgRating) {
          let diff = Math.abs(targetRating - matchToConsider.avgRating);
          if (diff < pickedMatchDiff) {
            pickedMatch = matchToConsider;
            pickedMatchDiff = diff;
          }
        }
      }
      console.log("Selected", pickedMatch);

      this.setState({ selectedMatches: [pickedMatch] });

      // Show loading animation
      document.getElementById("loading-hider").classList.remove("none");
      document.getElementById("loading").classList.add("none");
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
          map={match.map}
          key={i + "selected-match"}
        ></MatchPanel>
      );
    }

    return (
      <div className="App">
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
            <br></br> 1. Selects a random rating between two values (500 and
            2000 by default).
            <br></br> 2. Then selects the closest ongoing game to that rating.
          </div>
          <br></br>
          <div className="optionsPane">
            <label for="minRating">Min Rating</label>
            <input
              type="number"
              id="minRating"
              name="minRating"
              step="1"
              value={this.state.minRating}
              onChange={this.handleMinRatingChange}
            ></input>
            <label for="maxRating">Max Rating</label>
            <input
              type="number"
              id="maxRating"
              name="maxRating"
              step="1"
              value={this.state.maxRating}
              onChange={this.handleMaxRatingChange}
            ></input>
          </div>
          <button
            className="button"
            style={{ width: "300px" }}
            onClick={this.onRandomClick}
          >
            <div
              id="loading"
              style={{
                zIndex: 1,
                margin: "auto",
                width: "8%",
                marginTop: "0px",
              }}
              className="none"
            >
              <div className="loading-spinner">
                <div className="spinner-dot"></div>
                <div className="spinner-dot"></div>
                <div className="spinner-dot"></div>
                <div className="spinner-dot"></div>
                <div className="spinner-dot"></div>
                <div className="spinner-dot"></div>
              </div>
            </div>
            <div id="loading-hider">Get Match With Random Rating</div>
          </button>
          <br></br>
          {selectedMatchUiElements}
        </div>
      </div>
    );
  }
}

const getRandomRating = function (min, max) {
  return Math.round(Math.random() * (max - min) + min);
};

/*

curl -H "Origin: http://localhost:3000" --verbose \
    "https://us-central1-age-of-empires-307521.cloudfunctions.net/aoe2-net-cors-proxy"

PREFLIGHT request test

curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS --verbose \
  https://us-central1-age-of-empires-307521.cloudfunctions.net/aoe2-net-cors-proxy

  [{"match_id":"33029736","lobby_id":null,"match_uuid":"1589fde4-faa9-8645-844e-422e11599cbe","version":"39515","name":"AUTOMATCH","num_players":2,"num_slots":2,"average_rating":null,"cheats":false,"full_tech_tree":false,"ending_age":5,"expansion":null,"game_type":0,"has_custom_content":null,"has_password":true,"lock_speed":true,"lock_teams":true,"map_size":0,"map_type":9,"pop":200,"ranked":true,"leaderboard_id":3,"rating_type":2,"resources":0,"rms":null,"scenario":null,"server":"eastus","shared_exploration":false,"speed":2,"starting_age":0,"team_together":true,"team_positions":true,"treaty_length":0,"turbo":false,"victory":1,"victory_time":0,"visibility":0,"opened":1596775006,"started":1596775006,"finished":1596776398,"players":[{"profile_id":2832129,"steam_id":"76561198217010783","name":"cantastan","clan":null,"country":"US","slot":1,"slot_type":1,"rating":812,"rating_change":16,"games":null,"wins":null,"streak":null,"drops":null,"color":2,"team":1,"civ":17,"won":true},{"profile_id":2593681,"steam_id":"76561199046361803","name":"alfonso.alanisj","clan":null,"country":"MX","slot":2,"slot_type":1,"rating":813,"rating_change":-16,"games":null,"wins":null,"streak":null,"drops":null,"color":1,"team":2,"civ":17,"won":false}]},{"match_id":"33029690","lobby_id":null,"match_uuid":"b7c50afc-e6f9-0542-9b1c-bb312d95f9f4","version":"39515","name":"AUTOMATCH","num_players":2,"num_slots":2,"average_rating":null,"cheats":false,"full_tech_tree":false,"ending_age":5,"expansion":null,"game_type":0,"has_custom_content":null,"has_password":true,"lock_speed":true,"lock_teams":true,"map_size":0,"map_type":29,"pop":200,"ranked":true,"leaderboard_id":3,"rating_type":2,"resources":0,"rms":null,"scenario":null,"server":"southeastasia","shared_exploration":false,"speed":2,"starting_age":0,"team_together":true,"team_positions":true,"treaty_length":0,"turbo":false,"victory":1,"victory_time":0,"visibility":0,"opened":1596775000,"started":1596775000,"finished":1596776917,"players":[{"profile_id":3076432,"steam_id":"76561198071873515","name":"作为菜比我很无奈","clan":null,"country":"CN","slot":1,"slot_type":1,"rating":987,"rating_change":null,"games":null,"wins":null,"streak":null,"drops":null,"color":2,"team":1,"civ":14,"won":true},{"profile_id":2867938,"steam_id":"76561199067335559","name":"图图","clan":null,"country":"CN","slot":2,"slot_type":1,"rating":802,"rating_change":null,"games":null,"wins":null,"streak":null,"drops":null,"color":1,"team":2,"civ":10,"won":false}]},{"match_id":"33029684","lobby_id":null,"match_uuid":"3a5637a4-aff9-044f-8c77-4a72a58e3acd","version":"39515","name":"AUTOMATCH","num_players":8,"num_slots":8,"average_rating":null,"cheats":false,"full_tech_tree":false,"ending_age":5,"expansion":null,"game_type":0,"has_custom_content":null,"has_password":true,"lock_speed":true,"lock_teams":true,"map_size":4,"map_type":12,"pop":200,"ranked":true,"leaderboard_id":4,"rating_type":4,"resources":0,"rms":null,"scenario":null,"server":"brazilsouth","shared_exploration":false,"speed":2,"starting_age":0,"team_together":true,"team_positions":true,"treaty_length":0,"turbo":false,"victory":1,"victory_time":0,"visibility":1,"opened":1596775008,"started":1596775008,"finished":1596775251,"players":[{"profile_id":1831629,"steam_id":"76561198234035928","name":"三年开机三秒死机","clan":null,"country":"CN","slot":1,"slot_type":1,"rating":1844,"rating_change":null,"games":null,"wins":null,"streak":null,"drops":null,"color":2,"team":1,"civ":23,"won":false},{"profile_id":2861473,"steam_id":"76561199067104888","name":"DS_RoBeR.LaRRaZaBaL","clan":null,"country":"AR","slot":2,"slot_type":1,"rating":1790,"rating_change":null,"games":null,"wins":null,"streak":null,"drops":null,"color":3,"team":2,"c
 
 {
          "query": "matches?game=aoe2de&count=1&since=1596775000"
        }
 
  */
