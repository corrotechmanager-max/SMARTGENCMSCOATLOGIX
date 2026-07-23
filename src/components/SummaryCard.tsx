interface SummaryCardProps {
  title: string;
  value: string;
  icon: any;
}

export default function SummaryCard({ title, value, icon: Icon }: SummaryCardProps) {
  return (
    <div className="bg-gray-900/40 border border-white/5 backdrop-blur-sm rounded-xl p-6 flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className="bg-amber-500/10 p-3 rounded-lg">
        <Icon size={24} className="text-amber-500" />
      </div>
    </div>
  );
}
