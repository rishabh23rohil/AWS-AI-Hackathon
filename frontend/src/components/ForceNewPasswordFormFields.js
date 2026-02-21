import React, { useEffect } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react-core";
import { getErrors } from "@aws-amplify/ui";
import { PasswordField } from "@aws-amplify/ui-react";

// Guard so we only clear username once per mount (stops updateForm → re-render loop)
let hasClearedUsernameForNewPassword = false;

/**
 * Force New Password form fields that show ONLY password and confirm_password.
 * Used when the Cognito pool has "email as username" and no "username" attribute
 * in the schema, so we must not collect or send username (avoids "attribute username
 * doesn't exist in schema" during the NEW_PASSWORD_REQUIRED challenge).
 *
 * Clears formValues.username because the machine preserves it from sign-in;
 * without clearing, it would be sent as userAttributes and Cognito rejects it.
 */
function ForceNewPasswordFormFields() {
  const { fields, validationErrors, updateForm } = useAuthenticator((context) => [
    context.fields,
    context.validationErrors,
    context.updateForm,
  ]);

  // Reset guard when leaving this screen so next time we clear again
  useEffect(() => {
    return () => {
      hasClearedUsernameForNewPassword = false;
    };
  }, []);

  // Clear username from form so it isn't sent to Cognito (email-as-username pool has no username attr).
  // Defer with setTimeout to avoid updateForm triggering a re-render loop in the same tick.
  useEffect(() => {
    if (hasClearedUsernameForNewPassword) return;
    hasClearedUsernameForNewPassword = true;
    const id = setTimeout(() => {
      updateForm({ username: undefined });
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const allowedNames = ["password", "confirm_password"];
  const filteredFields = fields.filter((field) =>
    allowedNames.includes(field.name)
  );

  return (
    <>
      {filteredFields.map((field, index) => (
        <ForceNewPasswordField key={field.name} field={field} index={index} validationErrors={validationErrors} />
      ))}
    </>
  );
}

function ForceNewPasswordField({ field, index, validationErrors }) {
  const { name, label, placeholder, type = "password", ...rest } = field;
  const errors = getErrors(validationErrors?.[name]);
  const hasError = errors?.length > 0;
  const errorId = `force-new-password-${name}-${index}`;

  return (
    <React.Fragment>
      <PasswordField
        {...rest}
        name={name}
        label={label}
        placeholder={placeholder}
        autoComplete={name === "password" ? "new-password" : "new-password"}
        autoCapitalize="off"
        hasError={hasError}
        aria-describedby={hasError ? errorId : undefined}
      />
      {hasError && (
        <div
          id={errorId}
          data-amplify-sign-up-errors
          className="amplify-field__error"
          role="alert"
        >
          {errors.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
      )}
    </React.Fragment>
  );
}

export default ForceNewPasswordFormFields;
