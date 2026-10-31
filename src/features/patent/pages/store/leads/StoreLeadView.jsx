import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiUser, FiPhone, FiBox, FiClock } from "react-icons/fi";

const StoreLeadView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const mockData = {
    customer: "Rahul Sharma",
    phone: "9876543210",
    email: "rahul@example.com",
    product: "Paracetamol 500mg",
    quantity: 2,
    status: "pending",
    date: "2026-10-28 10:30 AM",
    address: "123, MG Road, Indore",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store/leads")}
          className="p-2 border rounded-lg bg-surface cursor-pointer"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold font-jakarta">Lead Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-card border border-ink-100 bg-surface p-5">
          <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <FiUser /> Customer Info
          </h2>
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-ink-500 inline-block w-24">Name:</span>{" "}
              {mockData.customer}
            </p>
            <p>
              <span className="text-ink-500 inline-block w-24">Phone:</span>{" "}
              {mockData.phone}
            </p>
            <p>
              <span className="text-ink-500 inline-block w-24">Email:</span>{" "}
              {mockData.email}
            </p>
            <p>
              <span className="text-ink-500 inline-block w-24">Address:</span>{" "}
              {mockData.address}
            </p>
          </div>
        </div>

        <div className="rounded-card border border-ink-100 bg-surface p-5">
          <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <FiBox /> Product Info
          </h2>
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-ink-500 inline-block w-24">Product:</span>{" "}
              {mockData.product}
            </p>
            <p>
              <span className="text-ink-500 inline-block w-24">Quantity:</span>{" "}
              {mockData.quantity}
            </p>
            <p>
              <span className="text-ink-500 inline-block w-24">Date:</span>{" "}
              {mockData.date}
            </p>
            <p>
              <span className="text-ink-500 inline-block w-24">Status:</span>{" "}
              <span className="text-warn-800 font-semibold">
                {mockData.status.toUpperCase()}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreLeadView;
