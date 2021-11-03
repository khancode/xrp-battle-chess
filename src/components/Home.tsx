import * as React from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Home.css';
import { GameList } from './GameList';

export interface HomeProps {}

// TODO: style this entire component lol
export const Home = (props: HomeProps) => {
   const { state } = useLocation<Location>();
   const [classicAddress, setClassicAddress] = useState(state.wallet.classicAddress);
   const [xrpBalance, setXrpBalance] = useState(state.wallet.xrpBalance);

   return (
      <div className="home">
         <h1>Online React Chess!</h1>
         <h2 className="description">
            Wallet address: {classicAddress}
         </h2>
         <h2 className="description">
            XRP Balance: {xrpBalance}
         </h2>
         <GameList />
      </div>
   );
};
