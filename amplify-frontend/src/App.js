// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState, Fragment } from "react";
import Amplify, { Auth, Hub } from "aws-amplify";
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
      redirectSignIn: "https://dev.d24muehyg5cyn7.amplifyapp.com",
      redirectSignOut: "https://dev.d24muehyg5cyn7.amplifyapp.com",
      responseType: "code"
    }
  },
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
