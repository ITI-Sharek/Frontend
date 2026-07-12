import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { getPostLoginPath, ROUTES } from "@/config/routes.config";
import { storageService } from "@/services/storage.service";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { StepIndicator } from "@/shared/components/navigation/step-indicator";

import { useUsernameAvailabilityQuery } from "../api/queries/use-username-availability-query";
import {
  REGISTER_USERNAME_FIELD_ENABLED,
  SIGNUP_STEPS,
} from "../constants/signup.constants";
import { registerUser } from "../services/auth.service";
import { INITIAL_SIGNUP_FORM_DATA } from "../types/signup.types";
import type { SignupFormData } from "../types/signup.types";
import type { AuthSessionDto } from "../types/auth.types";
import { AccountStep } from "./register-steps/account-step";
import { DetailsStep } from "./register-steps/details-step";
import { RoleStep } from "./register-steps/role-step";
import { VerifyEmailStep } from "./register-steps/verify-email-step";

const TOTAL_STEPS = SIGNUP_STEPS.length;
const ACCOUNT_STEP_INDEX = 1;

interface PendingVerification {
  email: string;
  verificationExpiresAt: string;
}

export function RegisterForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<SignupFormData>(
    INITIAL_SIGNUP_FORM_DATA,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] =
    useState<PendingVerification | null>(null);

  function setField<TKey extends keyof SignupFormData>(
    field: TKey,
    value: SignupFormData[TKey],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const usernameQuery = useUsernameAvailabilityQuery(formData.username);
  // Block on a confirmed conflict or an in-flight/pending check; a network
  // failure (isError) never blocks — the backend re-validates at submit
  // time regardless (see edge cases in specs/002-register-username-roles).
  // Bypassed entirely while the field is disabled pending backend support.
  const isUsernameOk =
    !REGISTER_USERNAME_FIELD_ENABLED ||
    (formData.username.trim() !== "" &&
      usernameQuery.formatValid &&
      !usernameQuery.isDebouncing &&
      !usernameQuery.isFetching &&
      (usernameQuery.isError || usernameQuery.data?.available !== false));

  const isRoleStepValid = formData.role !== null;
  const isAccountStepValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password.trim() !== "" &&
    isUsernameOk;
  const isDetailsStepValid = formData.agreedToTerms;

  const canProceed = [isRoleStepValid, isAccountStepValid, isDetailsStepValid][
    step
  ];
  const isLastStep = step === TOTAL_STEPS - 1;

  async function handleVerified(session: AuthSessionDto) {
    storageService.setAccessToken(session.tokens.accessToken);
    storageService.setRefreshToken(session.tokens.refreshToken);
    navigate({ to: getPostLoginPath(session.user) });
  }

  async function handleNext() {
    if (!canProceed || isSubmitting) return;

    if (!isLastStep) {
      setStep((s) => s + 1);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const registration = await registerUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: REGISTER_USERNAME_FIELD_ENABLED
          ? formData.username.trim()
          : undefined,
        role: formData.role as "owner" | "contributor",
        preferredLanguage: "ar",
      });
      // The backend returns a pending user + OTP metadata, no tokens
      // (docs/api-contracts.md) — the session arrives after verify-email.
      setPendingVerification({
        email: registration.user.email,
        verificationExpiresAt: registration.verificationExpiresAt,
      });
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "تعذر إنشاء الحساب، حاول مرة أخرى.",
      );
      // TODO(backend): once /auth/register returns a distinguishable code
      // (e.g. EMAIL_TAKEN / USERNAME_TAKEN per docs/design/
      // api-contract-additions.md §2), branch on the code instead of this
      // message heuristic.
      const lower = message.toLowerCase();
      if (lower.includes("username") || lower.includes("email")) {
        setStep(ACCOUNT_STEP_INDEX);
      }
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    setSubmitError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  if (pendingVerification) {
    return (
      <>
        <Card className="flex flex-col gap-6">
          <VerifyEmailStep
            email={pendingVerification.email}
            verificationExpiresAt={pendingVerification.verificationExpiresAt}
            onVerified={handleVerified}
          />
        </Card>

        <p className="w-full text-center text-base">
          <span className="text-muted-foreground">وصلك الرمز على بريد آخر؟ </span>
          <Link to={ROUTES.login} className="font-bold text-primary">
            تسجيل الدخول
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <Card className="flex flex-col gap-6">
        <StepIndicator steps={SIGNUP_STEPS} currentStep={step} />

        <form
          className="flex w-full flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
        >
          {step === 0 && (
            <RoleStep
              role={formData.role}
              onSelect={(role) => setField("role", role)}
            />
          )}
          {step === 1 && (
            <AccountStep
              firstName={formData.firstName}
              lastName={formData.lastName}
              username={formData.username}
              email={formData.email}
              password={formData.password}
              role={formData.role}
              onChange={(field, value) => setField(field, value)}
              usernameStatus={{
                formatValid: usernameQuery.formatValid,
                isChecking:
                  usernameQuery.isDebouncing || usernameQuery.isFetching,
                checkFailed: usernameQuery.isError,
                available: usernameQuery.data?.available ?? null,
                reason: usernameQuery.data?.reason ?? null,
                suggestion: usernameQuery.data?.suggestion ?? null,
              }}
            />
          )}
          {step === 2 && (
            <DetailsStep data={formData} onFieldChange={setField} />
          )}

          {submitError && (
            <p className="w-full text-right text-sm text-destructive">
              {submitError}
            </p>
          )}

          <div className="flex w-full items-center gap-3 pt-2">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowRight className="size-4" />
                <span>رجوع</span>
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              disabled={!canProceed || isSubmitting}
            >
              <ArrowLeft className="size-4" />
              <span>
                {isSubmitting
                  ? "جارٍ الإنشاء..."
                  : isLastStep
                    ? "إنشاء حسابي المجاني"
                    : "التالي"}
              </span>
            </Button>
          </div>
        </form>
      </Card>

      <p className="w-full text-center text-base">
        <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
        <Link to={ROUTES.login} className="font-bold text-primary">
          تسجيل الدخول
        </Link>
      </p>
    </>
  );
}
