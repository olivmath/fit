'use client';

import { useState } from 'react';
import { useAddExercises } from '@/hooks/useChallengePool';
import toast from 'react-hot-toast';

type ExerciseType = 'flexoes' | 'abdominais' | 'km' | null;

interface ExerciseData {
  type: ExerciseType;
  amount: string;
  message: string;
}

const EXERCISES = {
  flexoes: { icon: '💪', label: 'Push-ups', unit: 'reps' },
  abdominais: { icon: '🔥', label: 'Sit-ups', unit: 'reps' },
  km: { icon: '🏃', label: 'Running', unit: 'km' },
};

export function AddExercisesForm() {
  const [step, setStep] = useState(0);
  const [exerciseData, setExerciseData] = useState<ExerciseData>({
    type: null,
    amount: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const { addExercises } = useAddExercises();

  const handleSelectExercise = (type: ExerciseType) => {
    setExerciseData({ ...exerciseData, type });
    setStep(1);
  };

  const handleAmountChange = (amount: string) => {
    if (amount === '' || /^\d+(\.\d)?$/.test(amount)) {
      setExerciseData({ ...exerciseData, amount });
    }
  };

  const handleMessageChange = (message: string) => {
    if (message.length <= 100) {
      setExerciseData({ ...exerciseData, message });
    }
  };

  const handleSubmit = async () => {
    if (!exerciseData.type || !exerciseData.amount) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      setLoading(true);
      const flexoes = exerciseData.type === 'flexoes' ? BigInt(exerciseData.amount) : 0n;
      const abdominais = exerciseData.type === 'abdominais' ? BigInt(exerciseData.amount) : 0n;
      const km = exerciseData.type === 'km' ? BigInt(exerciseData.amount) : 0n;

      console.log('Submitting exercise:', { flexoes, abdominais, km, message: exerciseData.message });

      const hash = await addExercises(flexoes, abdominais, km, exerciseData.message);

      if (!hash) {
        toast.error('Failed to submit transaction - no hash returned');
        return;
      }

      toast.success('Exercise logged! 🎉');

      // Reset form
      setStep(0);
      setExerciseData({ type: null, amount: '', message: '' });
    } catch (error: any) {
      console.error('Submit error:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to log exercise';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else setExerciseData({ type: null, amount: '', message: '' });
  };

  const handleNext = () => {
    if (step === 0) {
      if (!exerciseData.type) {
        toast.error('Please select an exercise');
        return;
      }
    } else if (step === 1) {
      if (!exerciseData.amount) {
        toast.error('Please enter a number');
        return;
      }
    }
    setStep(step + 1);
  };

  return (
    <div className="card bg-gradient-to-br from-primary to-primary-focus text-primary-content shadow-2xl">
      <div className="card-body">
        {/* Progress Indicator */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  i === step
                    ? 'bg-white text-primary scale-110'
                    : i < step
                      ? 'bg-primary-content/50 text-primary'
                      : 'bg-primary-content/20 text-primary-content/50'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <span className="text-sm opacity-75">Step {step + 1} of 4</span>
        </div>

        {/* Step 1: Choose Exercise */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Choose an Exercise</h2>
            <div className="grid grid-cols-3 gap-4">
              {(Object.entries(EXERCISES) as Array<[ExerciseType, typeof EXERCISES[keyof typeof EXERCISES]]>).map(
                ([key, data]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectExercise(key)}
                    className="btn btn-lg bg-white text-primary hover:bg-primary-content hover:text-primary flex flex-col gap-2 h-24 rounded-xl transition-all"
                  >
                    <span className="text-4xl">{data.icon}</span>
                    <span className="font-bold text-sm">{data.label}</span>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Step 2: Enter Amount */}
        {step === 1 && exerciseData.type && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">How Many {EXERCISES[exerciseData.type].label}?</h2>
            <div className="flex justify-center mb-6">
              <span className="text-6xl">{EXERCISES[exerciseData.type].icon}</span>
            </div>
            <div className="form-control">
              <input
                type="number"
                placeholder="Enter number"
                className="input input-bordered input-lg text-center text-2xl font-bold bg-white text-primary"
                value={exerciseData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                min="0"
                step={exerciseData.type === 'km' ? '0.1' : '1'}
                autoFocus
              />
              <label className="label">
                <span className="label-text text-primary-content/75">{EXERCISES[exerciseData.type].unit}</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Add Message */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Add a Motivational Message</h2>
            <p className="opacity-75">Optional - Share your motivation with the community!</p>
            <textarea
              className="textarea textarea-bordered bg-white text-primary text-lg placeholder-primary/50 focus:outline-none focus:border-primary-content h-32"
              placeholder="e.g., 'Feeling strong today! 💪' or 'One step closer to the goal!'"
              value={exerciseData.message}
              onChange={(e) => handleMessageChange(e.target.value)}
            />
            <div className="text-sm opacity-75">
              {exerciseData.message.length}/100 characters
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Ready to Submit?</h2>
            <div className="bg-white/10 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg">Exercise:</span>
                <span className="text-2xl font-bold">
                  {exerciseData.type && EXERCISES[exerciseData.type].label}
                </span>
              </div>
              <div className="divider my-2" />
              <div className="flex items-center justify-between">
                <span className="text-lg">Amount:</span>
                <span className="text-3xl font-bold">
                  {exerciseData.amount} {exerciseData.type && EXERCISES[exerciseData.type].unit}
                </span>
              </div>
              {exerciseData.message && (
                <>
                  <div className="divider my-2" />
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm opacity-75 mb-2">Message:</p>
                    <p className="text-lg italic">&quot;{exerciseData.message}&quot;</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleBack}
            className="btn btn-outline btn-lg flex-1 border-primary-content text-primary-content hover:bg-primary-content hover:text-primary"
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < 3 ? (
            <button onClick={handleNext} className="btn btn-lg flex-1 bg-white text-primary hover:bg-primary-content">
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-lg flex-1 bg-white text-primary hover:bg-primary-content"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
