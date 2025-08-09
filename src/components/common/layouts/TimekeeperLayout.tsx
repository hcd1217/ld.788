import React from 'react';

type TimekeeperLayoutProps = {
  readonly children: React.ReactNode;
};
export function TimekeeperLayout({ children }: TimekeeperLayoutProps) {
  /**
   * TODO:
   *  1. if not login, redirect to log pages of timekeeper
   *  2. if login but clientConfig don't have timekeeper feature: display unavailable
   *  3. normal route
   */
  return children;
}
