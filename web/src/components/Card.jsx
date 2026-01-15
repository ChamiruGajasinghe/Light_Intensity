const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-card-dark rounded-2xl p-6 shadow-custom transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] ${className}`}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "" }) => {
  return (
    <div className={`flex justify-between items-center mb-4 ${className}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ icon: Icon, children, iconColor, className = "" }) => {
  return (
    <div
      className={`text-lg font-semibold flex items-center gap-2 ${className}`}
    >
      {Icon && <Icon className={`text-2xl ${iconColor}`} />}
      <span>{children}</span>
    </div>
  );
};

export { Card, CardHeader, CardTitle };
