import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import App from "./App";
import config from "./config";
import ForceNewPasswordFormFields from "./components/ForceNewPasswordFormFields";
import "./index.css";

if (config.amplify.Auth.Cognito.userPoolId) {
  Amplify.configure(config.amplify);
}

const isScreenshotMode = process.env.REACT_APP_SCREENSHOT_MODE === "1";
const mockUser = { signInDetails: { loginId: "screenshot@example.com" } };

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {isScreenshotMode ? (
      <App user={mockUser} signOut={() => {}} />
    ) : (
    <Authenticator
      components={{
        ForceNewPassword: { FormFields: ForceNewPasswordFormFields },
      }}
      formFields={{
        signIn: {
          username: {
            label: "Email",
            placeholder: "Enter your email",
          },
        },
        signUp: {
          email: {
            label: "Email",
            placeholder: "Enter your email",
            required: true,
          },
          name: {
            label: "Name",
            placeholder: "Enter your name",
            required: true,
          },
        },
        changePassword: {
          password: {
            label: "Password",
            placeholder: "Enter your current password",
          },
          confirmPassword: {
            label: "Confirm Password",
            placeholder: "Enter your new password",
          },
        },
        forceNewPassword: {
          password: {
            label: "New password",
            placeholder: "Enter your new password",
            required: true,
          },
          confirm_password: {
            label: "Confirm password",
            placeholder: "Confirm your new password",
            required: true,
          },
        },
      }}
      signUpAttributes={["email", "name"]}
      loginMechanisms={["email"]}
    >
      {({ signOut, user }) => <App user={user} signOut={signOut} />}
    </Authenticator>
    )}
  </React.StrictMode>
);
