# Getting Started with Create React App

Playing Guess the elo? Selecting a "random" game from the ongoing matches wont get you a very even distribution of ratings for a variety of reasons. One big one is that player base is roughly normally distributed around the a mean of 1000 (ratings.aoe2.se), so we might expect to have a greater chance of selecting a game with an avg elo of 1000 than selecting a game with an avg elo of 1600 or 400.

This tool attempts to solve this issue by first selecting a random game with an avg rating between two values (500 and 2000 by default). Then it selects the closest ongoing game to that rating. You can see the players and civs before clicking spectate, just in case you want a specific matchup or you recognize the players.

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
