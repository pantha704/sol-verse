export const ConfirmModal = ({ onClick, displayQuoteDetails, swap }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Confirm Swap</h2>

          {/* Swap Summary */}
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {displayQuoteDetails() ? (
              <div>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold">
                    {displayQuoteDetails().inAmount}{" "}
                    {displayQuoteDetails().inputSymbol}
                  </div>
                  <div className="text-gray-500 my-2">↓</div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {displayQuoteDetails().outAmount}{" "}
                    {displayQuoteDetails().outputSymbol}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">
                      Minimum Received:
                    </span>
                    <span>
                      {displayQuoteDetails().minReceived}{" "}
                      {displayQuoteDetails().outputSymbol}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">
                      Estimated Fee:
                    </span>
                    <span>
                      {displayQuoteDetails().feeAmount}{" "}
                      {displayQuoteDetails().inputSymbol}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">
                      Slippage:
                    </span>
                    <span>{displayQuoteDetails().slippage}%</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 dark:text-gray-300">
                      Route:
                    </span>
                    <span>{displayQuoteDetails().dexName}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">Loading quote details...</div>
            )}
          </div>

          {/* Warning */}
          <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm">
            <p className="text-yellow-800 dark:text-yellow-200">
              By confirming, you agree to the slippage tolerance. Transactions
              may fail if price moves beyond this limit.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg"
              onClick={onClick}
            >
              Cancel
            </button>

            <button
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg"
              onClick={swap}
            >
              Confirm Swap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
