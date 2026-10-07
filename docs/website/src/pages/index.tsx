import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import React from "react";
import { HomeHeader } from "../sections/HomeHeader/HomeHeader";
import { Robotics } from "../sections/Robotics/Robotics";
// import { AiToolKits } from "../sections/AiToolKits/AiToolKits";
import { Blueprints } from "../sections/Blueprints/Blueprints";
import { FeaturedAIModels } from "../sections/FeaturedAIModels/FeaturedAIModels";
import { RobotPerception } from "../sections/RobotPerception/RobotPerception";
import { RealtimeControl } from "../sections/RealtimeControl/RealtimeControl";
import { RoboticsEcosystem } from "../sections/RoboticsEcosystem/RoboticsEcosystem";

export default function Home(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description={`${siteConfig.title} — Physical AI optimized for Intel hardware.`}
    >
      <HomeHeader />
      <RoboticsEcosystem />
      <Robotics />
      <Blueprints />
      <FeaturedAIModels />
      {/* <AiToolKits /> */}
      <RobotPerception />
      <RealtimeControl />
    </Layout>
  );
}
