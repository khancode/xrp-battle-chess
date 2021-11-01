import * as React from 'react';
import {
   BrowserRouter,
   Switch,
   Route,
   Link
} from "react-router-dom";
import { ChessGame } from './ChessGame';
import { GameList } from './GameList';
import { Home } from './Home';

export interface AppProps {}

export const App = (props: AppProps) => {
   return (
      <BrowserRouter>
         {/* A <Switch> looks through its children <Route>s and
         renders the first one that matches the current URL. */}
         <Switch>
            <Route path="/games" component={GameList} />
            <Route path="/game" component={ChessGame} />
            <Route path="/" component={Home} />
         </Switch>
      </BrowserRouter>
   );
};
