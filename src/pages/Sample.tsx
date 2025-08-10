import { AppMobileLayout } from "@/components/common";
import { Space, Title } from "@mantine/core";

export function Sample() {
  return <AppMobileLayout scrollable={true}>
    <Title>Sample</Title>
    <Space h="50vh"/>
    <Title>Sample</Title>
    <Space h="40vh"/>
    <Title>Sample</Title>
  </AppMobileLayout>
}
