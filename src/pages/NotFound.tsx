import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="editorial-shell flex min-h-screen items-center justify-center">
      <div className="surface-panel w-full max-w-md rounded-[1.75rem] p-8 text-center">
        <h1 className="editorial-display mb-4 text-5xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline underline-offset-4 hover:text-[hsl(var(--brass))]">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
