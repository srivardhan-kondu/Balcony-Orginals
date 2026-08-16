import { Component } from "react";

// Without this, one throwing component unmounts the entire tree and the site
// renders as a blank black page — indistinguishable, to a visitor, from a
// site that is simply down.
export class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("Balcony Originals — render error:", error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-8 text-center">
        <img src="/assets/bo-mark.png" alt="Balcony Originals" className="bo-logo w-[64px] opacity-70" />
        <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-mute">
          This reel dropped a frame.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-sm border border-bone/20 px-5 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-bone/70 transition-colors duration-300 hover:border-bone hover:text-bone"
        >
          Reload
        </button>
      </div>
    );
  }
}
