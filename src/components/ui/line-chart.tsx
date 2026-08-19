"use client";

import { CartesianGrid, Dot, Line, LineChart, XAxis, YAxis } from "recharts";
import { TooltipProps } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";

const chartConfig = {
  temperature: {
    label: "Temperature",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface ChartProps {
  chartData: { town: string; temperature: number }[];
  title: string;
  description: string;
}

export function Chart({ chartData, title, description }: ChartProps) {
  // Function to determine the color of the dot based on the temperature
  const getDotColor = (temperature: number) => {
    if (temperature < 10) return "#0000ff"; // Blue for cold temperatures
    if (temperature >= 10 && temperature < 20) return "#00ff00"; // Green for moderate temperatures
    if (temperature >= 20 && temperature < 30) return "#d7f542"; // Yellow for hot-moderate temperatures
    return "#ff0000"; // Red for hot temperatures
  };

  // Custom tooltip renderer
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const { town, temperature } = payload[0].payload;
      return (
        <div className="bg-white p-2 shadow-md rounded">
          <p className="text-sm font-medium">{`Temperature in ${town}: ${temperature}°C`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="!ml-5">{title}</CardTitle>
        <CardDescription className="!ml-5">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="!mr-10">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="town" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              domain={[0, (dataMax: number) => dataMax + 5]} // Ensure 0 is always shown on the Y-axis
            />
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Line
              dataKey="temperature"
              type="natural"
              stroke="#42a4f5"
              strokeWidth={2}
              dot={({ payload, ...props }) => {
                const color = getDotColor(payload.temperature);
                return (
                  <Dot
                    key={`${payload.town}-${props.cx}-${props.cy}`} // Ensure unique keys
                    r={5}
                    cx={props.cx}
                    cy={props.cy}
                    fill={color}
                    stroke={color}
                  />
                );
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
    </Card>
  );
}
