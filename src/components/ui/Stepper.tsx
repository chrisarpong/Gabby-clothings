import { AnimatePresence, motion, type Variants } from 'framer-motion';
import React, { Children, type HTMLAttributes, type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { Button } from './Button';
import './Stepper.css';

interface StepperProps extends HTMLAttributes<HTMLDivElement> { children: ReactNode; initialStep?: number; onStepChange?: (step: number) => void; onFinalStepCompleted?: () => void; stepCircleContainerClassName?: string; stepContainerClassName?: string; contentClassName?: string; footerClassName?: string; backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>; nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>; backButtonText?: string; nextButtonText?: string; disableStepIndicators?: boolean; renderStepIndicator?: (props: RenderStepIndicatorProps) => ReactNode; validator?: (step: number) => boolean; }
interface RenderStepIndicatorProps { step: number; currentStep: number; onStepClick: (clicked: number) => void; }

export default function Stepper({ children, initialStep = 1, onStepChange = () => {}, onFinalStepCompleted = () => {}, stepCircleContainerClassName = '', stepContainerClassName = '', contentClassName = '', footerClassName = '', backButtonProps = {}, nextButtonProps = {}, backButtonText = 'Back', nextButtonText = 'Continue', disableStepIndicators = false, renderStepIndicator, validator, ...rest }: StepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [direction, setDirection] = useState<number>(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => { setCurrentStep(newStep); if (newStep > totalSteps) { onFinalStepCompleted(); } else { onStepChange(newStep); } };
  const handleBack = () => { if (currentStep > 1) { setDirection(-1); updateStep(currentStep - 1); } };
  const handleNext = () => { if (validator && !validator(currentStep)) return; if (!isLastStep) { setDirection(1); updateStep(currentStep + 1); } };
  const handleComplete = () => { if (validator && !validator(currentStep)) return; setDirection(1); updateStep(totalSteps + 1); };

  return (
    <div className="outer-container w-full" {...rest}>
      <div className={`step-circle-container ${stepCircleContainerClassName} border border-[#3a1f1d]/10 bg-white`}>
        <div className={`step-indicator-row ${stepContainerClassName}`}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                <StepIndicator step={stepNumber} disableStepIndicators={disableStepIndicators} currentStep={currentStep} onClickStep={(clicked: number) => { if (clicked > currentStep && validator && !validator(currentStep)) return; setDirection(clicked > currentStep ? 1 : -1); updateStep(clicked); }} />
                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
              </React.Fragment>
            );
          })}
        </div>

        <StepContentWrapper isCompleted={isCompleted} currentStep={currentStep} direction={direction} className={`step-content-default ${contentClassName}`}>
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && (
          <div className={`footer-container ${footerClassName}`}>
            <div className={`footer-nav ${currentStep !== 1 ? 'spread' : 'end'}`}>
              {currentStep !== 1 && (
                <Button onClick={handleBack} className={`back-button ${currentStep === 1 ? 'inactive' : ''}`} {...backButtonProps}>
                  {backButtonText}
                </Button>
              )}
              <Button onClick={isLastStep ? handleComplete : handleNext} className="next-button uppercase tracking-widest text-[11px]" {...nextButtonProps}>
                {isLastStep ? 'Complete' : nextButtonText}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepContentWrapper({ isCompleted, currentStep, direction, children, className }: any) {
  const [parentHeight, setParentHeight] = useState<number>(0);
  return (
    <motion.div className={className} style={{ position: 'relative', overflow: 'hidden' }} animate={{ height: isCompleted ? 0 : parentHeight }} transition={{ type: 'spring', duration: 0.4 }}>
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && <SlideTransition key={currentStep} direction={direction} onHeightReady={(h: number) => setParentHeight(h)}>{children}</SlideTransition>}
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({ children, direction, onHeightReady }: any) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => { if (containerRef.current) onHeightReady(containerRef.current.offsetHeight); }, [children, onHeightReady]);
  return (
    <motion.div ref={containerRef} custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} style={{ position: 'absolute', left: 0, right: 0, top: 0 }}>
      {children}
    </motion.div>
  );
}

const stepVariants: Variants = { enter: (dir: number) => ({ x: dir >= 0 ? '-100%' : '100%', opacity: 0 }), center: { x: '0%', opacity: 1 }, exit: (dir: number) => ({ x: dir >= 0 ? '50%' : '-50%', opacity: 0 }) };
export function Step({ children }: { children: ReactNode }) { return <div className="step-default">{children}</div>; }

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators }: any) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';
  const handleClick = () => { if (step !== currentStep && !disableStepIndicators) onClickStep(step); };
  return (
    <motion.div onClick={handleClick} className="step-indicator" animate={status} initial={false}>
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: '#F9F8F6', color: '#3a1f1d', border: '1px solid rgba(58,31,29,0.2)' },
          active: { scale: 1, backgroundColor: '#3a1f1d', color: '#ffffff', border: '1px solid #3a1f1d' },
          complete: { scale: 1, backgroundColor: '#3a1f1d', color: '#ffffff', border: '1px solid #3a1f1d' }
        }}
        transition={{ duration: 0.3 }}
        className="step-indicator-inner"
      >
        {status === 'complete' ? <CheckIcon className="check-icon" /> : status === 'active' ? <div className="active-dot" /> : <span className="step-number">{step}</span>}
      </motion.div>
    </motion.div>
  );
}

function StepConnector({ isComplete }: any) {
  const lineVariants: Variants = { incomplete: { width: 0, backgroundColor: 'transparent' }, complete: { width: '100%', backgroundColor: '#3a1f1d' } };
  return (
    <div className="step-connector bg-[#3a1f1d]/10">
      <motion.div className="step-connector-inner" variants={lineVariants} initial={false} animate={isComplete ? 'complete' : 'incomplete'} transition={{ duration: 0.4 }} />
    </div>
  );
}

function CheckIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.1, type: 'tween', ease: 'easeOut', duration: 0.3 }} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
export { Stepper };
