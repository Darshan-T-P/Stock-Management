
function Modal({ title, onClose, content, onSubmit, submitDisabled, submitText }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-[#435355] rounded-lg max-w-4xl w-full max-h-full p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-white text-2xl font-bold">×</button>
        </div>
        <div>{content}</div>
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          {onSubmit && (
            <button
              onClick={onSubmit}
              disabled={submitDisabled}
              className={`px-6 py-2 rounded font-semibold ${
                submitDisabled ? "bg-gray-600 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-300"
              }`}
            >
              {submitText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;