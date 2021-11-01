import * as React from 'react';
import './Home.css';
import { GameList } from './GameList';

export interface AppProps {
   compiler: string;
   framework: string;
}

export const Home = (props: AppProps) => {
   return (
      <div className="home">
         <h1>Online React Chess!</h1>
         <h2 className="description">
            Online chess implemented in React.js and Node.js
         </h2>
         <GameList />
      </div>
   );
};
