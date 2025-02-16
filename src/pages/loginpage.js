import './loginPage.css';

import { useState } from 'react';
import { LoginApi } from '../services/api';
import { storeUserData } from '../services/storage'
import { isAuthenticated } from '../services/auth';
import { Link, Navigate } from 'react-router-dom';
import NavBar from '../components/navBar';

export default function LoginPage() {

    const initialStateErrors = {
        username: { required: false },
        password: { required: false },
        custom_error: null
    };
    const [errors, setErrors] = useState(initialStateErrors);

    const [loading, setLoading] = useState(false);

    const [inputs, setInputs] = useState({
        username: "",
        password: "",
    })
    const handleInput = (event) => {
        setInputs({ ...inputs, [event.target.name]: event.target.value })
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        let errors = initialStateErrors;
        let hasError = false;

        if (inputs.username === "") {
            errors.username.required = true;
            hasError = true;
        }
        if (inputs.password === "") {
            errors.password.required = true;
            hasError = true;
        }

        if (!hasError) {
            setLoading(true)
            //sending login api request
            LoginApi(inputs)
            .then((response) => {
                if (response.data && response.data.data) {
                    storeUserData(response.data.data.access_token);
                } else {
                }
            })
            .catch((err) => {
            }).finally(() => {
                setLoading(false)
            })
        }
        setErrors({ ...errors });
    }

    if (isAuthenticated()) {
        //redirect user to dashboard
        return <Navigate to="/dashboard" />
    }

    return (
        <div>
            <NavBar />
            <section className="login-block">
                <div className="container">
                    <div className="row ">
                        <div className="col login-sec">
                            <h2 className="text-center">Login Now</h2>
                            <form onSubmit={handleSubmit} className="login-form" action="">
                                <div className="form-group">
                                    <label htmlFor="username" className="text-uppercase">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        onChange={handleInput}
                                        name="username"
                                        placeholder="Username"
                                    />

                                    {errors.username.required ?
                                        (<span className="text-danger" >
                                            Username is required.
                                        </span>) : null
                                    }
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password" className="text-uppercase">Password</label>
                                    <input className="form-control" type="password" onChange={handleInput} name="password" placeholder="Password" id="password" />
                                    {errors.password.required ?
                                        (<span className="text-danger" >
                                            Password is required.
                                        </span>) : null
                                    }
                                </div>
                                <div className="form-group">
                                    {loading ?
                                        (<div className="text-center">
                                            <div className="spinner-border text-primary " role="status">
                                                <span className="sr-only">Loading...</span>
                                            </div>
                                        </div>) : null
                                    }
                                    <span className="text-danger" >
                                        {errors.custom_error ?
                                            (<p>{errors.custom_error}</p>)
                                            : null
                                        }
                                    </span>
                                    <input type="submit" className="btn btn-login float-right" disabled={loading} value="Login" />
                                </div>
                                <div className="clearfix"></div>
                                <div className="form-group">
                                    Create new account ? Please <Link to="/register">Register</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
