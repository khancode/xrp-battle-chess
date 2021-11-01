import * as React from 'react';
import './App.css';
import { GameList } from './GameList';

export interface AppProps {
   compiler: string;
   framework: string;
}

export const App = (props: AppProps) => {
   return (
      <div className="app">
         <h1>Online React Chess!</h1>
         <h2 className="description">
            Online chess implemented in React.js and Node.js
         </h2>
         <GameList />
      </div>
   );
};

/*
// 'AppProps' describes the shape of props.
// State is never set so we use the '{}' type.
export class App extends React.Component<AppProps, {}> {
   constructor(props: AppProps) {
      super(props);
   }

   render() {
      return (
         <div className="app">
            <h1>{this.props.framework} & {this.props.compiler} with Webpack template!</h1>
            <h2 className="description">
               A minimal, barebones {this.props.framework} & {this.props.compiler} with Webpack boilerplate application
            </h2>
         </div>
      );
   }
}
*/
