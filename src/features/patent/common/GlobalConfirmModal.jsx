import { useDispatch, useSelector } from "react-redux";
import {
  closeConfirm,
  resolveConfirm,
} from "../../../redux/slice/confirmSlice";
import { useTranslation } from "react-i18next";

const GlobalConfirmModal = () => {
  const dispatch = useDispatch();
  const { isOpen, message } = useSelector((state) => state.confirm);

  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleCancel = () => {
    resolveConfirm(false);
    dispatch(closeConfirm());
  };

  const handleConfirm = () => {
    resolveConfirm(true);
    dispatch(closeConfirm());
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
      {/* <div className="bg-white rounded-xl shadow-2xl w-fit max-w-[60vw] min-w-[400px] overflow-hidden border-l-4 border-l-blue-500"> */}
      <div className="bg-white rounded-xl shadow-2xl w-[90%] max-w-[400px] md:max-w-[600px] lg:max-w-[750px] overflow-hidden border-l-4 border-l-blue-500">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <h3 className="text-gray-800 font-semibold text-base tracking-wide">
              {t("globalConfirmationModal.confirmDeletion")}
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm cursor-pointer transition-all duration-200"
          >
            {t("globalConfirmationModal.cancle")}
          </button>

          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-accent rounded-md text-white text-sm cursor-pointer transition-all duration-200 shadow-sm"
          >
            {t("globalConfirmationModal.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalConfirmModal;
