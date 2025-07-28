import {
  Tabs as MantineTabs,
  type TabsProps as MantineTabsProps,
  type TabsListProps as MantineTabsListProps,
  type TabsTabProps as MantineTabsTabProps,
} from '@mantine/core';
import {type ReactNode} from 'react';
import classes from './Tabs.module.css';

// Main Tabs component
type TabsProps = MantineTabsProps & {
  readonly children: ReactNode;
};

export function Tabs({children, classNames, ...props}: TabsProps) {
  return (
    <MantineTabs
      classNames={{
        root: classes.tabs,
        panel: classes.panel,
        ...classNames,
      }}
      {...props}
    >
      {children}
    </MantineTabs>
  );
}

// Tabs.List component
type TabsListProps = MantineTabsListProps & {
  readonly children: ReactNode;
};

function TabsList({children, className, ...props}: TabsListProps) {
  return (
    <MantineTabs.List
      className={`${classes.tabsList} ${className || ''}`}
      {...props}
    >
      {children}
    </MantineTabs.List>
  );
}

// Tabs.Tab component
type TabsTabProps = MantineTabsTabProps & {
  readonly children: ReactNode;
};

function TabsTab({children, className, ...props}: TabsTabProps) {
  return (
    <MantineTabs.Tab className={`${classes.tab} ${className || ''}`} {...props}>
      {children}
    </MantineTabs.Tab>
  );
}

// Tabs.Panel component - using Tabs.Panel directly since no custom styling needed
Tabs.List = TabsList;
Tabs.Tab = TabsTab;
Tabs.Panel = MantineTabs.Panel;
