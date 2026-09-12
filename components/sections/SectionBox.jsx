const SectionBox = ({ children, className = '' }) => (
  <div className={`bg-[#0A0A0A] w-full ${className}`}>
    {children}
  </div>
);

export default SectionBox;