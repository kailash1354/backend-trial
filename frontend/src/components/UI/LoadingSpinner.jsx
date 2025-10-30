const LoadingSpinner = ({ size = "medium", className = "" }) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-12 h-12",
    large: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`spinner-luxury ${sizeClasses[size]}`} />
    </div>
  );
};

export default LoadingSpinner;
