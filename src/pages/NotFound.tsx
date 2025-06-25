
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-foreground mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className="text-muted-foreground mb-8">
          The page at <span className="font-mono bg-secondary/50 px-2 py-1 rounded">{location.pathname}</span> could not be found.
        </p>
        <Button onClick={() => navigate("/")} className="flex items-center gap-2">
          <Home className="w-4 h-4" />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
