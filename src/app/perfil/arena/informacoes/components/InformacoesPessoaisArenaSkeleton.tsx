import React from "react";

export const InformacoesPessoaisArenaSkeleton = () => (
  <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-start justify-center my-6">
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/2 mb-3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      </div>

      <div className="mt-10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            <div className="h-10 bg-gray-300 rounded-lg w-1/2"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-10 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-10 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-10 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-10 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-10 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-10 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-10 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-10 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-24 bg-gray-300 rounded-lg"></div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <div className="h-10 w-28 bg-gray-300 rounded-lg"></div>
          <div className="h-10 w-40 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
);
