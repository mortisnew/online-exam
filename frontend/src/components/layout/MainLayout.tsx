
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./MainLayout.css";

type MainLayoutProps = {
  children: ReactNode;
  title: string;
};

export default function MainLayout({
  children,
  title,
}: MainLayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Header />
        <main className="app-content">
          <h1 className="page-title">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}
