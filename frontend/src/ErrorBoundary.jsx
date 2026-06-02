import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{padding:20}}>
          <h2>Something went wrong</h2>
          <pre style={{whiteSpace:'pre-wrap',color:'red'}}>{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
