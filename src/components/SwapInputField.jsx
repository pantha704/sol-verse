import React from 'react'

const SwapInputField = ({label, value, onChange, id=label, type="text", extraLabel}) => {
  return (
    <div className="flex ">
    <div className="mb-3 grid grid-cols-[150px_1fr] gap-2 text-start">
          <label
            className="block text-white text-sm font-bold mb-1 mt-3"
            htmlFor={id}
          >
            {label}
          </label>
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder="Enter amount"
            className="shadow appearance-none border rounded-lg w-50vw py-2 px-3 text-white bg-gray-800 leading-tight focus:outline-none focus:shadow-outline"
          />
    </div>     
    {extraLabel && (
      <div className="text-gray text-sm mb-1 mt-3 pl-4">
        {extraLabel}
      </div>
    )}
    </div>
  )
}

export default SwapInputField