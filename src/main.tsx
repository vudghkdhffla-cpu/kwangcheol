import React, { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <main className="fatal"><h1>화면을 표시하지 못했습니다.</h1><p>저장한 기록을 자동으로 지우지 않았습니다. 새로고침 후에도 문제가 있으면 알려 주세요.</p><button onClick={() => location.reload()}>다시 열기</button></main> : this.props.children; }
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Boundary><App /></Boundary></React.StrictMode>);
