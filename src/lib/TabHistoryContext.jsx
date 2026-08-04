import React, { createContext, useContext, useRef, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Root paths that each tab "owns"
export const TAB_ROOTS = ['/', '/tarot', '/love', '/channeled', '/downloads', '/astrology', '/oracle', '/numerology', '/journal', '/account'];

function getTabRoot(pathname) {
  // Find the longest matching tab root for the current path
  return TAB_ROOTS.find(r => r === pathname || (r !== '/' && pathname.startsWith(r))) ?? '/';
}

const TabHistoryContext = createContext(null);

export function TabHistoryProvider({ children }) {
  // Per-tab stacks: { '/tarot': ['/tarot', '/tarot/reading/123'], ... }
  const stacks = useRef(Object.fromEntries(TAB_ROOTS.map(r => [r, [r]])));
  const [activeTab, setActiveTab] = useState('/');

  const location = useLocation();
  const navigate = useNavigate();

  // Push a new path into the current tab's stack (called on navigation)
  const pushToTab = useCallback((pathname) => {
    const root = getTabRoot(pathname);
    const stack = stacks.current[root];
    // Avoid duplicate consecutive entries
    if (stack[stack.length - 1] !== pathname) {
      stacks.current[root] = [...stack, pathname];
    }
  }, []);

  // Switch to a tab root — navigate to the top of that tab's stack
  const switchTab = useCallback((tabRoot) => {
    const currentRoot = getTabRoot(location.pathname);

    if (currentRoot === tabRoot) {
      // Tapping the active tab: pop to root
      stacks.current[tabRoot] = [tabRoot];
      navigate(tabRoot, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Save scroll position for current tab
    stacks.current[`__scroll_${currentRoot}`] = window.scrollY;

    // Navigate to the last known path in the destination tab
    const destStack = stacks.current[tabRoot];
    const destPath = destStack[destStack.length - 1] ?? tabRoot;
    setActiveTab(tabRoot);
    navigate(destPath);

    // Restore scroll for destination tab after paint
    const savedScroll = stacks.current[`__scroll_${tabRoot}`] ?? 0;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.scrollTo({ top: savedScroll, behavior: 'instant' });
    }));
  }, [location.pathname, navigate]);

  // Go back within the current tab's stack
  const goBack = useCallback(() => {
    const root = getTabRoot(location.pathname);
    const stack = stacks.current[root];
    if (stack.length > 1) {
      const newStack = stack.slice(0, -1);
      stacks.current[root] = newStack;
      navigate(newStack[newStack.length - 1]);
    }
  }, [location.pathname, navigate]);

  // Can we go back within the current tab?
  const canGoBack = useCallback(() => {
    const root = getTabRoot(location.pathname);
    return stacks.current[root].length > 1;
  }, [location.pathname]);

  const currentTabRoot = getTabRoot(location.pathname);

  return (
    <TabHistoryContext.Provider value={{ switchTab, goBack, canGoBack, pushToTab, currentTabRoot, TAB_ROOTS }}>
      {children}
    </TabHistoryContext.Provider>
  );
}

export function useTabHistory() {
  return useContext(TabHistoryContext);
}
