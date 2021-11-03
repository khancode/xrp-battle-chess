import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Dialog, DialogTitle, Button, TextField } from '@mui/material';
import axios from 'axios';

// TODO: style Login
// import './Login.css';

export interface LoginProps {}

export const Login = (props: LoginProps) => {
    const [username, setUsername] = useState('');
    const [loginPendingDialog, setLoginPendingDialog] = useState(false);
    const history = useHistory();

    const onUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()
        setUsername(event.target.value)
    };

    const createRoom = async(event) => {
        event.preventDefault();
        if (!username.length) {
            return;
        }

        setLoginPendingDialog(true);

        loginRequest(username);
    };

    const loginRequest = async(username: string) => {
        try {
            const response = await axios.post(
                `http://localhost:3000/login`,
                { username },
            )
            console.log(response.data);

            setLoginPendingDialog(false);
            const options = {
                username,
                wallet: response.data.wallet,
            };
            history.push('/home', options)
        } catch (err) {
            setLoginPendingDialog(false);
            // TODO: use mui Alert & AlertTitle
            alert(`Invalid username: ${username}`);
        }
    }

    return (
        <div className="login">
            <h1>Online React Chess!</h1>
            <h2 className="description">
            Online chess implemented in React.js and Node.js
            </h2>
            <form className="login-form" onSubmit={createRoom}>
                <TextField
                    id="outlined-basic"
                    required
                    label="Username"
                    variant="outlined"
                    value={username}
                    onChange={onUsernameChange}
                    disabled={false}
                />
                <Button
                    variant="outlined"
                    onClick={createRoom}
                    type="submit"
                >
                    Login
                </Button>
            </form>
            <Dialog open={loginPendingDialog}>
                <DialogTitle>
                    Login in progress...
                </DialogTitle>
            </Dialog>
        </div>
    );
};
