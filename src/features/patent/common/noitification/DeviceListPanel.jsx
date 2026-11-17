// src/features/patent/common/noitification/DeviceListPanel.jsx

import { useState } from "react";
import {
  FiMonitor,
  FiSmartphone,
  FiTrash2,
  FiAlertCircle,
} from "react-icons/fi";
import { useDevices, useRemoveDevice } from "../../queries/notifications";
import Loader from "../Loader";
import ConfirmModal from "../ConfirmModal";

const getPlatformIcon = (platform = "") => {
  const p = platform.toLowerCase();
  if (p === "android" || p === "ios") return FiSmartphone;
  return FiMonitor;
};

const getPlatformLabel = (platform = "") => {
  const p = platform.toLowerCase();
  if (p === "web") return "Web";
  if (p === "android") return "Android";
  if (p === "ios") return "iOS";
  return platform || "Unknown";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
};

const truncateUuid = (uuid) => {
  if (!uuid) return "—";
  const s = String(uuid);
  if (s.length <= 12) return s;
  return `${s.slice(0, 8)}...`;
};

const DeviceListPanel = () => {
  const [confirm, setConfirm] = useState({ open: false, item: null });
  const { data, isLoading } = useDevices();
  const removeMutation = useRemoveDevice();

  const list = data?.list || [];

  const handleDeleteClick = (device) => {
    setConfirm({ open: true, item: device });
  };

  const handleConfirm = () => {
    if (!confirm.item) return;
    removeMutation.mutate(confirm.item.id, {
      onSettled: () => setConfirm({ open: false, item: null }),
    });
  };

  const handleCancel = () => {
    setConfirm({ open: false, item: null });
  };

  if (isLoading) {
    return <Loader text="Loading devices..." />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-ink-900">
          Registered Devices
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          Devices linked to your account for push notifications. You can remove
          access at any time.
        </p>
      </div>

      {/* Empty state */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-ink-100 bg-surface px-6 py-14 text-center">
          <FiAlertCircle className="mb-3 h-10 w-10 text-ink-300" />
          <p className="text-sm font-medium text-ink-700">
            No devices registered
          </p>
          <p className="mt-1 max-w-sm text-xs text-ink-500">
            Devices will appear here once they are registered for push
            notifications.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
          <ul className="divide-y divide-ink-100">
            {list.map((device) => {
              const Icon = getPlatformIcon(device.platform);
              return (
                <li
                  key={device.id}
                  className="flex items-center gap-3 px-4 py-3.5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-ink-900">
                        {device.device_name || "Unnamed Device"}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-700">
                        {getPlatformLabel(device.platform)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-500">
                      ID: {truncateUuid(device.device_uuid)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-400">
                      Registered: {formatDate(device.created_at)}
                      {device.last_used_at &&
                        ` • Last used: ${formatDate(device.last_used_at)}`}
                    </p>
                  </div>

                  <button
                    type="button"
                    title="Remove device"
                    onClick={() => handleDeleteClick(device)}
                    disabled={removeMutation.isPending}
                    className="cursor-pointer rounded-lg p-2 text-danger-500 transition hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <ConfirmModal
        open={confirm.open}
        title="Remove Device"
        message={`Are you sure you want to remove "${
          confirm.item?.device_name || "this device"
        }"? It will no longer receive push notifications.`}
        confirmText="Remove"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={removeMutation.isPending}
      />
    </div>
  );
};

export default DeviceListPanel;
