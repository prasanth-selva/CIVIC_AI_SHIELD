import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

export function AIConfidenceChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="rounded-2xl bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-2xl border border-cyan-500/20 p-6"
    >
      <h3 className="mb-6 text-lg font-bold text-white">AI Detection Confidence</h3>
      <p className="text-sm text-gray-400 mb-4">Real-time model accuracy (Last 24h)</p>
      <Line
        data={{
          labels: ["1h", "5h", "9h", "13h", "17h", "21h", "Now"],
          datasets: [
            {
              label: "Confidence %",
              data: [92, 88, 95, 90, 97, 94, 98],
              borderColor: "#22d3ee",
              backgroundColor: "rgba(34, 211, 238, 0.1)",
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: "#22d3ee",
              pointBorderColor: "#0a0e1a",
              pointBorderWidth: 2,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              titleColor: "#22d3ee",
              bodyColor: "#fff",
              borderColor: "#22d3ee",
              borderWidth: 1,
              padding: 12,
              displayColors: false,
            },
          },
          scales: {
            x: {
              grid: {
                color: "rgba(255, 255, 255, 0.05)",
                drawBorder: false,
              },
              ticks: {
                color: "#9ca3af",
                font: { size: 11 },
              },
            },
            y: {
              grid: {
                color: "rgba(255, 255, 255, 0.05)",
                drawBorder: false,
              },
              ticks: {
                color: "#9ca3af",
                font: { size: 11 },
                callback: (value) => `${value}%`,
              },
              min: 70,
              max: 100,
            },
          },
        }}
      />
    </motion.div>
  );
}
