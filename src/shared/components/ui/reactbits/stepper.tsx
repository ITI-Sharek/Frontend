import React, {
  Children,
  useState,
  useEffect,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import "./stepper.css";

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  initialStep?: number;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ComponentProps<"button">;
  nextButtonProps?: React.ComponentProps<"button">;
  backButtonText?: React.ReactNode;
  nextButtonText?: React.ReactNode;
  disableStepIndicators?: boolean;
  stepLabels?: readonly string[];
  hideFooter?: boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (step: number) => void;
  }) => React.ReactNode;
}

export function Stepper({
  children,
  initialStep = 1,
  currentStep: controlledStep,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = "",
  stepContainerClassName = "",
  contentClassName = "",
  footerClassName = "",
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = "Back",
  nextButtonText = "Continue",
  disableStepIndicators = false,
  stepLabels = [],
  hideFooter = false,
  renderStepIndicator,
  className = "",
  ...rest
}: StepperProps) {
  const isControlled = controlledStep !== undefined;
  const [internalStep, setInternalStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);

  const currentStep = isControlled ? controlledStep : internalStep;
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const prevStepRef = useRef(currentStep);
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      setDirection(currentStep > prevStepRef.current ? 1 : -1);
      prevStepRef.current = currentStep;
    }
  }, [currentStep]);

  const updateStep = (newStep: number) => {
    if (!isControlled) {
      setInternalStep(newStep);
    }
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  return (
    <div className={`reactbits-stepper-outer ${className}`} {...rest}>
      <div className={`reactbits-step-circle-container ${stepCircleContainerClassName}`}>
        <div className={`reactbits-step-indicator-row ${stepContainerClassName}`}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            const label = stepLabels[index];

            return (
              <React.Fragment key={stepNumber}>
                <div className="reactbits-step-indicator-wrapper">
                  {renderStepIndicator ? (
                    renderStepIndicator({
                      step: stepNumber,
                      currentStep,
                      onStepClick: (clicked) => {
                        setDirection(clicked > currentStep ? 1 : -1);
                        updateStep(clicked);
                      },
                    })
                  ) : (
                    <StepIndicator
                      step={stepNumber}
                      disableStepIndicators={disableStepIndicators}
                      currentStep={currentStep}
                      onClickStep={(clicked) => {
                        setDirection(clicked > currentStep ? 1 : -1);
                        updateStep(clicked);
                      }}
                    />
                  )}
                  {label && (
                    <span
                      className={`reactbits-step-label ${
                        currentStep === stepNumber
                          ? "text-foreground font-semibold"
                          : currentStep > stepNumber
                            ? "text-foreground/80"
                            : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                  )}
                </div>
                {isNotLastStep && (
                  <StepConnector isComplete={currentStep > stepNumber} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={`reactbits-step-content-default ${contentClassName}`}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && !hideFooter && (
          <div className={`footer-container ${footerClassName}`}>
            <div className={`flex w-full items-center gap-3 pt-2 ${currentStep !== 1 ? "justify-between" : "justify-end"}`}>
              {currentStep !== 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-md border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button
                type="button"
                onClick={isLastStep ? handleComplete : handleNext}
                className="rounded-md bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-xs transition-opacity hover:opacity-90"
                {...nextButtonProps}
              >
                {isLastStep ? "Complete" : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Stepper;

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className,
}: {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className} style={{ position: "relative" }}>
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </div>
  );
}

function SlideTransition({
  children,
  direction,
}: {
  children: React.ReactNode;
  direction: number;
}) {
  return (
    <motion.div
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.12, ease: "easeOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

const stepVariants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? 12 : -12,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? -12 : 12,
    opacity: 0,
  }),
};

export function Step({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`reactbits-step-default ${className}`}>{children}</div>;
}

function StepIndicator({
  step,
  currentStep,
  onClickStep,
  disableStepIndicators,
}: {
  step: number;
  currentStep: number;
  onClickStep: (step: number) => void;
  disableStepIndicators?: boolean;
}) {
  const status =
    currentStep === step
      ? "active"
      : currentStep < step
        ? "inactive"
        : "complete";

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) {
      onClickStep(step);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className="reactbits-step-indicator"
      style={disableStepIndicators ? { pointerEvents: "none", opacity: 0.7 } : {}}
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: "var(--surface-muted, #f4f4f5)", color: "var(--muted-foreground, #71717a)" },
          active: { scale: 1.04, backgroundColor: "var(--primary, #5227ff)", color: "#ffffff" },
          complete: { scale: 1, backgroundColor: "var(--primary, #5227ff)", color: "#ffffff" },
        }}
        transition={{ duration: 0.1 }}
        className="reactbits-step-indicator-inner shadow-xs"
      >
        {status === "complete" ? (
          <CheckIcon className="reactbits-check-icon" />
        ) : status === "active" ? (
          <div className="reactbits-active-dot" />
        ) : (
          <span>{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  const lineVariants = {
    incomplete: { width: 0 },
    complete: { width: "100%" },
  };

  return (
    <div className="reactbits-step-connector">
      <motion.div
        className="reactbits-step-connector-inner"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? "complete" : "incomplete"}
        transition={{ duration: 0.12, ease: "easeOut" }}
      />
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <motion.svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      className={className}
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.02,
          type: "tween",
          ease: "easeOut",
          duration: 0.1,
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </motion.svg>
  );
}
