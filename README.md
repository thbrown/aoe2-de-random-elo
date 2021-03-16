# Age of Empires 2:DE - Random Rating Match Retriever

Playing Guess the elo? Selecting a "random" game from the ongoing matches wont get you a very even distribution of ratings for a variety of reasons. One big one is that player base is roughly normally distributed around the a mean of 1000 (https://ratings.aoe2.se/), so we might expect to have a greater chance of selecting a game with an avg elo of 1000 than selecting a game with an avg elo of 1600 or 400.

This tool attempts to solve this issue by first selecting a random game with an avg rating between two values (500 and 2000 by default). Then it selects the closest ongoing game to that rating. You can select multiple games in the manner with a single query. You can also see the players and civs before clicking spectate, just in case you want to skip over specific civ matchup or you recognize the players.

Live: https://thbrown.github.io/aoe2-de-random-elo/

## Dev Stuff

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder. Then it will be copied to the `docs` folder because thats where github pages expects it.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!
