import { Link } from "react-router-dom";

const Breadcrumb = ({ items }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 flex-wrap">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {/* Link or Text */}
          {item.path ? (
            <Link to={item.path} className="hover:text-blue-600 transition">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800 font-medium">{item.label}</span>
          )}

          {/* Separator */}
          {index !== items.length - 1 && (
            <span className="text-gray-400">/</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Breadcrumb;
