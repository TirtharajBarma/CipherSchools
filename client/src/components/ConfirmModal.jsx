import { FiAlertTriangle, FiX } from 'react-icons/fi'

const ConfirmModal = ({ title = 'Are you sure?', message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, danger = false }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${danger ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'}`}>
              <FiAlertTriangle />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" onClick={onCancel}>
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onCancel} className="btn-ghost">{cancelText}</button>
          <button onClick={onConfirm} className="btn">{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
