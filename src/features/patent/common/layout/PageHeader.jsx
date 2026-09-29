const PageHeader = ({ children }) => {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start mb-4">
      {children}
    </div>
  );
};

export default PageHeader;
