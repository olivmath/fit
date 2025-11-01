'use client';

import { useState } from 'react';
import { useAddExercises } from '@/hooks/useChallengePool';
import toast from 'react-hot-toast';

export function AddExercisesForm() {
  const [flexoes, setFlexoes] = useState('');
  const [abdominais, setAbdominais] = useState('');
  const [km, setKm] = useState('');
  const [loading, setLoading] = useState(false);
  const { addExercises } = useAddExercises();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!flexoes && !abdominais && !km) {
      toast.error('Please enter at least one exercise');
      return;
    }

    try {
      setLoading(true);
      await addExercises(
        BigInt(flexoes || 0),
        BigInt(abdominais || 0),
        BigInt(km || 0)
      );
      setFlexoes('');
      setAbdominais('');
      setKm('');
      toast.success('Exercises updated!');
    } catch (error) {
      toast.error('Failed to update exercises');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Add Exercises</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Flexões</span>
            </label>
            <input
              type="number"
              placeholder="Enter number of pushups"
              className="input input-bordered"
              value={flexoes}
              onChange={(e) => setFlexoes(e.target.value)}
              min="0"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Abdominais</span>
            </label>
            <input
              type="number"
              placeholder="Enter number of sit-ups"
              className="input input-bordered"
              value={abdominais}
              onChange={(e) => setAbdominais(e.target.value)}
              min="0"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Corrida (km)</span>
            </label>
            <input
              type="number"
              placeholder="Enter km run"
              className="input input-bordered"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              min="0"
              step="0.1"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading || (!flexoes && !abdominais && !km)}
          >
            {loading ? 'Updating...' : 'Update Exercises'}
          </button>
        </form>
      </div>
    </div>
  );
}
