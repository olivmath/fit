'use client';

import { useState } from 'react';

export function EventsFeed() {
  const [isLoading] = useState(false);

  return (
    <div className="card bg-base-100 shadow-xl h-full flex flex-col">
      <div className="card-body flex-1 flex flex-col p-4 sm:p-6">
        <h2 className="card-title text-xl sm:text-2xl">Recent Activity</h2>
        <div className="divider my-2"></div>

        <div className="space-y-1 sm:space-y-2 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 opacity-50">
              <p className="text-sm sm:text-base">Loading activity from ENVIO...</p>
            </div>
          ) : (
            <div className="text-center py-12 opacity-50">
              <div className="space-y-4">
                <p className="text-sm sm:text-base font-semibold">📊 Powered by ENVIO</p>
                <p className="text-xs sm:text-sm">
                  Real-time activity feed will appear here once ENVIO indexer is deployed and synced.
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-4">
                  Current step: Configure ENVIO indexer and integrate Apollo Client
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
