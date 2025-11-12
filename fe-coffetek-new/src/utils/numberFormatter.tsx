import CountUp from "react-countup";
import type { StatisticProps } from "antd";

/**
 * Ant Design Statistic formatter with CountUp animation
 */
export const countUpFormatter: StatisticProps["formatter"] = (value) => (
    <CountUp
        end={Number(value)}
        separator=","
        duration={1.2}
    />
);

// export const countUpFormatter: StatisticProps['formatter'] = (value) => (
//     <CountUp end={value as number} separator="," />
// );
