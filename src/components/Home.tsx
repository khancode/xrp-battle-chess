import * as React from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Home.css';
import { GameList } from './GameList';
import { Button, Card, CardContent, Paper, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, TextField } from '@mui/material';

export interface HomeProps {}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
   [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
   },
   [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
   },
}));

// TODO: style this entire component lol
export const Home = (props: HomeProps) => {
   const { state } = useLocation<Location>();
   const [username] = useState(state.username);
   const [classicAddress] = useState(state.wallet.classicAddress);
   const [xrpBalance] = useState(state.wallet.xrpBalance);

   return (
      <div className="home">
         <Card sx={{ minWidth: 275 }}>
            <CardContent className="login-card-content">
               <h1>Welcome back, {username}!</h1>
               {/* <h2 className="description">
                  Wallet address: {classicAddress}
               </h2>
               <h2 className="description">
                  XRP Balance: {xrpBalance}
               </h2> */}

               <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                     <TableHead>
                        <TableRow>
                           <StyledTableCell>XRP Balance</StyledTableCell>
                           <StyledTableCell>Classic Address</StyledTableCell>
                        </TableRow>
                     </TableHead>
                     <TableBody>
                           <TableRow
                              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                           >
                              <TableCell component="th" scope="row">
                                 {xrpBalance}
                              </TableCell>
                              <TableCell>{classicAddress}</TableCell>
                           </TableRow>
                     </TableBody>
                  </Table>
               </TableContainer>



               <GameList username={username} />
            </CardContent>
         </Card>
      </div>
   );
};
