import { motion } from "framer-motion";

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: "blue" | "green" | "purple" | "emerald";
}

const colorClasses = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  purple: "from-purple-500 to-purple-600",
  emerald: "from-emerald-500 to-emerald-600",
};

export function StatCard({ icon, value, label, color }: StatCardProps) {
  console.log("vaule", Number(value));
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 bg-gradient-to-r ${colorClasses[color]} rounded-lg`}
        >
          {icon}
        </div>
        <div>
          {/* <p className="text-2xl font-bold text-gray-900">{value}</p> */}
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === "number" && Number(value.toFixed(3))}
          </p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
