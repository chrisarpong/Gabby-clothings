import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class StaffErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Staff route failed to render", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#17110f] p-6 text-[#f4e9e2]">
        <div className="w-full max-w-md border border-[#76594d] bg-[#241916] p-8 text-center shadow-xl">
          <h1 className="text-xl font-semibold">Something went wrong.</h1>
          <p className="mt-3 text-sm text-[#c7a99c]">Reload the page to continue to the staff portal.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 w-full bg-[#eadbd3] px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#241916]"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
