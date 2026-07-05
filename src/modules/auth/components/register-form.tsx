"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { storageService } from "@/services/storage.service";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { StepIndicator } from "@/shared/components/navigation/step-indicator";

import { SIGNUP_STEPS } from "../constants/signup.constants";
import { registerUser } from "../services/auth.service";
import {
  INITIAL_SIGNUP_FORM_DATA,
  type SignupFormData,
} from "../types/signup.types";
import { AccountStep } from "./register-steps/account-step";
import { DetailsStep } from "./register-steps/details-step";
import { RoleStep } from "./register-steps/role-step";

const TOTAL_STEPS = SIGNUP_STEPS.length;

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<SignupFormData>(
    INITIAL_SIGNUP_FORM_DATA,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const isRoleStepValid = formData.role !== null;
  const isAccountStepValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password.trim() !== "";
  const isDetailsStepValid = formData.agreedToTerms;

  const canProceed = [isRoleStepValid, isAccountStepValid, isDetailsStepValid][
    step
  ];
  const isLastStep = step === TOTAL_STEPS - 1;

  async function handleNext() {
    if (!canProceed || isSubmitting) return;

    if (!isLastStep) {
      setStep((s) => s + 1);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const session = await registerUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role as "owner" | "contributor",
        preferredLanguage: "ar",
      });
      storageService.setAccessToken(session.tokens.accessToken);
      storageService.setRefreshToken(session.tokens.refreshToken);
      router.push(ROUTES.login);
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, "تعذر إنشاء الحساب، حاول مرة أخرى."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    setSubmitError(null);
    setStep((s) => Math.max(0, s - 1));
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
              email={formData.email}
              password={formData.password}
              onChange={(field, value) => setField(field, value)}
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
        <Link href={ROUTES.login} className="font-bold text-primary">
          تسجيل الدخول
        </Link>
      </p>
    </>
  );
}
