import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiEye } from "react-icons/fi";

const INITIAL_DATA = [
  {
    id: 1,
    customer: "Rahul Sharma",
    phone: "9876543210",
    product: "Paracetamol 500mg",
    status: "pending",
    date: "2026-10-28",
  },
  {
    id: 2,
    customer: "Priya Singh",
    phone: "8765432109",
    product: "Vitamin C 1000mg",
    status: "completed",
    date: "2026-10-27",
  },
];

const StoreLeadList = () => {
  const navigate = useNavigate();
  const [data] = useState(INITIAL_DATA);
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) =>
    item.customer.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-jakarta text-2xl font-bold text-ink-900">
          Product Leads
        </h1>
        <p className="text-sm text-ink-500">
          Manage incoming product booking requests
        </p>
      </div>

      <div className="rounded-xl border border-ink-100 bg-surface p-4">
        <div className="flex max-w-md items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
          <FiSearch className="text-ink-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="rounded-xl border border-ink-100 bg-surface overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-table-head-bg border-b border-ink-100">
            <tr>
              <th className="px-5 py-3 text-xs uppercase text-table-head-text font-semibold">
                Customer
              </th>
              <th className="px-5 py-3 text-xs uppercase text-table-head-text font-semibold">
                Phone
              </th>
              <th className="px-5 py-3 text-xs uppercase text-table-head-text font-semibold">
                Product
              </th>
              <th className="px-5 py-3 text-xs uppercase text-table-head-text font-semibold">
                Date
              </th>
              <th className="px-5 py-3 text-xs uppercase text-table-head-text font-semibold">
                Status
              </th>
              <th className="px-5 py-3 text-right text-xs uppercase text-table-head-text font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.id}
                className="border-b border-table-row-border hover:bg-table-row-hover-bg"
              >
                <td className="px-5 py-3.5 text-ink-900 font-medium">
                  {item.customer}
                </td>
                <td className="px-5 py-3.5 text-ink-600">{item.phone}</td>
                <td className="px-5 py-3.5 text-ink-600">{item.product}</td>
                <td className="px-5 py-3.5 text-ink-600">{item.date}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${item.status === "pending" ? "bg-warn-100 text-warn-800" : "bg-brand-50 text-brand-700"}`}
                  >
                    {item.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => navigate(`/store/leads/${item.id}`)}
                    className="text-ink-500 hover:text-brand-600 p-2 cursor-pointer"
                  >
                    <FiEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreLeadList;
