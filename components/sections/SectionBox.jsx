const SectionBox = ({ children, className = '' }) => (
  <div className={`bg-white w-full ${className}`}>
    {children}
  </div>
);

export default SectionBox;