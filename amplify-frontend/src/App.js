// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState, Fragment } from "react";
import Amplify, { Auth, Hub, API } from "aws-amplify";
import { Container } from "react-bootstrap";

import Navigation from "./components/Navigation.js";
import FederatedSignIn from "./components/FederatedSignIn.js";
import MainRequest from "./components/MainRequest.js";
import "./App.css";

Amplify.configure({
  Auth: {
    region: "us-east-2",
    userPoolId: "us-east-2_iID2X3dfo",
    userPoolWebClientId: "784veejuasfq2h2ukcdid2kl66",
    oauth: {
      domain: "moleculas.auth.us-east-2.amazoncognito.com",
      scope: ["email", "openid", "aws.cognito.signin.user.admin", "profile"],
      redirectSignIn: "http://localhost:3000",
      redirectSignOut: "http://localhost:3000",
      responseType: "code"
    }
  }
});

API.configure({
  API: {
    endpoints: [
      {
        name: "MyBlogPostAPI",
        endpoint: "https://in687tyfnd.execute-api.us-east-2.amazonaws.com"
      }
    ]
  }
});

const federatedIdName = "OktaOpenID";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
        case "cognitoHostedUI":
          setToken("grating...");
          getToken().then(userToken => setToken(userToken.idToken.jwtToken));
          break;
        case "signOut":
          setToken(null);
          break;
        case "signIn_failure":
        case "cognitoHostedUI_failure":
          console.log("Sign in failure", data);
          break;
        default:
          break;
      }
    });
  }, []);

  function getToken() {
    return Auth.currentSession()
      .then(session => session)
      .catch(err => console.log(err));
  }

  return (
    <Fragment>
      <Navigation token={token} />
      <Container fluid>
        <br />
        {token ? (
          <MainRequest token={token} />
        ) : (
          <FederatedSignIn federatedIdName={federatedIdName} />
        )}
      </Container>
    </Fragment>
  );
}

export default App;
