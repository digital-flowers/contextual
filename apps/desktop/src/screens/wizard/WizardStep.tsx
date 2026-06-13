interface WizardStepProps {
  step: number;
  total: number;
  title: string;
  description: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export function WizardStep({
  step,
  total,
  title,
  description,
  children,
  onBack,
  onNext,
  nextLabel = "Next →",
  nextDisabled,
}: WizardStepProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 rounded-full transition-colors ${
              i < step ? "bg-accent" : i === step - 1 ? "bg-accent" : "bg-border"
            }`}
          />
        ))}
      </div>

      <p className="text-xs text-muted mb-1">
        Step {step} of {total}
      </p>
      <h2 className="text-xl font-semibold text-text mb-1.5">{title}</h2>
      <p className="text-sm text-muted mb-8">{description}</p>

      <div className="flex-1">{children}</div>

      <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-sm text-muted hover:text-text transition-colors"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="px-5 py-2 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
