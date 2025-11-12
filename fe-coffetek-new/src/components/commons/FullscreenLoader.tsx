import { Spin } from "antd";

// Reusable FullscreenLoader component (extract to a separate file for reuse)
export const FullscreenLoader: React.FC<{ spinning: boolean }> = ({ spinning }) => {
    return <Spin spinning={spinning} fullscreen />;
};