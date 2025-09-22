import { useState } from 'react';
import { CodeTextarea } from "./pages/code/code-areatext";
import { AnalyticsDashboard } from "./pages/dashborad/dashborad";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function App() {
  const [currentPage, setCurrentPage] = useState('code'); // 'code' or 'dashboard'

  const togglePage = () => {
    setCurrentPage(currentPage === 'code' ? 'dashboard' : 'code');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z" />
              <path d="M9 13h6" />
              <path d="M9 17h6" />
              <path d="M9 5h6" />
              <path d="M9 9h6" />
            </svg>
            <h1 className="text-xl font-semibold">Dev Dashboard</h1>
          </div>
          
          <div className="ml-auto">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={togglePage}
            >
              <Badge 
                variant={currentPage === 'code' ? 'default' : 'secondary'} 
                className="mr-1"
              >
                {currentPage === 'code' ? 'Code' : 'Dashboard'}
              </Badge>
              Switch to {currentPage === 'code' ? 'Dashboard' : 'Code'}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1"
              >
                <path d="M8 3H4a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M8 3v18m0 0h10a2 2 0 0 0 2-2v-4M8 21H4a2 2 0 0 1-2-2v-4" />
              </svg>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-4 md:p-6">
        {currentPage === 'code' ? <CodeTextarea /> : <AnalyticsDashboard />}
      </main>
    </div>
  );
}

export default App;